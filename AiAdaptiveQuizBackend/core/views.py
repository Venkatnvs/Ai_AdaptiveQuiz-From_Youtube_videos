from rest_framework import generics, views, permissions, status
from rest_framework.response import Response
from .models import Category, Course, Video, QuizSession, Question
from .serializers import (
    CategorySerializer,
    CourseSerializer,
    VideoSerializer,
    QuizSessionSerializer,
    QuestionSerializer,
    QuizSessionSubmitSerializer,
)
from django.db.models import Sum, Avg
from core.quiz_generator.gemini import generate_questions
from core.qlearning.qtable import QLearningAgent
from django.utils import timezone
from core.qlearning.utils import get_adaptation_level, get_ai_level

agent = QLearningAgent()

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.prefetch_related("courses__videos")
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class GenerateQuizView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, course_id, video_id):
        user = request.user
        video = Video.objects.get(id=video_id)
        
        if not video.is_transcript_generated:
            return Response({"error": "Transcript not generated"}, status=400)

        # Create quiz session
        try:
            session = QuizSession.objects.get(user=user, video=video, completed_at__isnull=True, is_quiz_generated=False)
        except QuizSession.DoesNotExist:
            return Response({"error": "Quiz session not found"}, status=404)

        # Create Q-table key
        key = f"{user.id}_{video.course.id}"
        state = str(agent.avg_level(key))[:4]
        difficulty = agent.choose_action(key, state)

        # Generate questions with Gemini
        try:
            questions = generate_questions(video.transcript, count=10, difficulty=difficulty, state=state)
            print(questions)
            for q in questions:
                Question.objects.create(
                session=session,
                text=q["text"],
                options=q["options"],
                correct_answer=q["correct_answer"],
                difficulty=q["difficulty"]
            )
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        session.adaptation_level = agent.avg_level(key)
        session.completed_at = timezone.now()
        session.is_quiz_generated = True
        session.is_quiz_submitted = False
        session.score = 0
        session.stars = 0
        session.save()
        return Response(QuizSessionSerializer(session).data, status=201)

class SubmitQuizView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, course_id, video_id):
        user = request.user
        session = QuizSession.objects.get(
            user=user, 
            video__id=video_id, 
            video__course__id=course_id, 
            is_quiz_generated=True
        )
        answers = request.data.get("answers", [])
        key = f"{session.user.id}_{session.video.course.id}"
        
        score = 0
        states_and_actions = []  # Store state-action pairs for batch update

        # First pass: collect all answers and calculate intermediate states
        current_state = str(agent.avg_level(key))[:4]
        
        for i, answer in enumerate(answers):
            question = Question.objects.get(id=answer["question_id"], session=session)
            question.selected = str(answer["selected"])
            question.save()

            reward = 1 if question.selected == question.correct_answer else -1
            
            # Store state-action-reward for this step
            states_and_actions.append({
                'state': current_state,
                'action': question.difficulty,
                'reward': reward
            })
            
            # Temporarily update to get next state
            agent.update(key, current_state, question.difficulty, reward, current_state)
            current_state = str(agent.avg_level(key))[:4]
            
            score += reward if reward > 0 else 0

        # Second pass: proper Q-learning updates with correct next states
        for i, sa in enumerate(states_and_actions):
            if i < len(states_and_actions) - 1:
                # Use next question's state as next_state
                next_state = str(agent.avg_level(key))[:4] if i == len(states_and_actions) - 1 else current_state
            else:
                # For last question, next_state is final state
                next_state = current_state
            
            agent.update(key, sa['state'], sa['action'], sa['reward'], next_state)

        # Update session with results
        session.score = (score / len(answers)) * 100
        session.stars = (score / len(answers)) * 5
        session.completed_at = timezone.now()
        session.is_quiz_submitted = True
        session.save()

        return Response(QuizSessionSubmitSerializer(session).data)

class QuizSessionDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id, video_id):
        user = request.user
        session = QuizSession.objects.get(user=user, video__id=video_id, video__course__id=course_id, is_quiz_generated=True)
        return Response(QuizSessionSerializer(session).data)

class CourseOverviewView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        user = request.user
        course = Course.objects.get(id=course_id)
        sessions = QuizSession.objects.filter(
            user=user, video__course=course, completed_at__isnull=False
        )
        video_count = course.videos.count()
        completed_video_ids = {s.video_id for s in sessions}

        total_stars = sum(s.stars for s in sessions)
        avg_score = sum(s.score for s in sessions) / max(len(sessions), 1)
        progress = course.progress_percentage(user)
        
        ai_level = get_ai_level(agent.avg_level(f"{user.id}_{course_id}"))

        return Response({
            "course_id": course_id,
            "title": course.title,
            "description": course.description,
            "total_videos": course.total_videos,
            "videos": VideoSerializer(course.videos.all(), many=True, context={"request": request}).data,
            "stats": {
                "stars": total_stars,
                "avgScore": round(avg_score, 2),
                "aiLevel": ai_level
            },
            "progress": round(progress, 2),
            "completed_videos": len(completed_video_ids),
            "quizHistory": QuizSessionSerializer(sessions, many=True).data
        })

class VideoDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, course_id, video_id):
        user = request.user
        # create new video session
        video = Video.objects.get(id=video_id)
        video_session, created = QuizSession.objects.get_or_create(user=user, video=video)
        if created:
            video_session.is_quiz_generated = False
            video_session.is_quiz_submitted = False
            video_session.adaptation_level = get_adaptation_level(user.id, course_id)
            video_session.save()
        return Response(QuizSessionSerializer(video_session).data, status=201)
    
class TotalStarsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        total_stars = QuizSession.objects.filter(user=user, stars__gt=0).aggregate(total_stars=Sum('stars'))['total_stars']
        return Response({"total_stars": total_stars})
    
class DashboardInfoView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        total_stars = QuizSession.objects.filter(user=user, stars__gt=0).aggregate(total_stars=Sum('stars'))['total_stars']
        quizzes_completed = QuizSession.objects.filter(user=user, is_quiz_submitted=True).count()
        average_score = QuizSession.objects.filter(user=user, is_quiz_submitted=True).aggregate(average_score=Avg('score'))['average_score']

        started_courses = []
        for course in Course.objects.all():
            if course.is_course_started_by_user(user) and not course.is_course_completed_by_user(user):
                started_courses.append(CourseSerializer(course, context={"request": request}).data)
        
        activities = []
        activitie_id = 1
        max_activities = 5
        course_ids = []
        courses = QuizSession.objects.filter(user=user).order_by("-updated_at")
        adaptation_level = []
        
        try:
            for course in courses:
                if course.video.course.id not in course_ids:
                    course_ids.append(course.video.course.id)
                    adaptation_level.append(agent.avg_level(f"{user.id}_{course.video.course.id}"))
                else:
                    continue
            adaptation_level = get_ai_level(sum(adaptation_level) / len(adaptation_level))
        except Exception as e:
            print(e)
            adaptation_level = "Beginner"
    
        course_ids = []
        for cs in courses:
            if cs.video.course.id not in course_ids:
                course_ids.append(cs.video.course.id)
                course = Course.objects.get(id=cs.video.course.id)
            else:
                continue
            if len(activities) >= max_activities:
                break
            if course.is_course_completed_by_user(user):
                activities.append({
                    "id": activitie_id,
                    "type": "course_completed",
                    "title": course.title,
                    "description": "Completed course",
                    "date": QuizSession.objects.filter(user=user, video__course=course, completed_at__isnull=False, is_quiz_submitted=True).order_by("-updated_at").first().updated_at
                })
                activitie_id += 1
            quiz_sessions = QuizSession.objects.filter(user=user, video__course=course, completed_at__isnull=False, is_quiz_submitted=True).order_by("-completed_at")
            for quiz_session in quiz_sessions:
                if len(activities) >= max_activities:
                    break
                if quiz_session.stars > 0:
                    if len(activities) >= max_activities:
                        break
                    activities.append({
                        "id": activitie_id,
                        "type": "reward_received",
                        "title": quiz_session.video.title + " - " + course.title,
                        "description": "Received reward",
                        "date": quiz_session.updated_at
                    })
                    activitie_id += 1
                activities.append({
                    "id": activitie_id,
                    "type": "quiz_completed",
                    "title": quiz_session.video.title + " - " + course.title,
                    "description": "Completed quiz",
                    "date": quiz_session.completed_at
                })
                activitie_id += 1
        
        res = {
            "stats": {
                "quizzesCompleted": quizzes_completed,
                "averageScore": round(average_score, 2) if average_score else 0,
                "totalStars": total_stars,
                "adaptationLevel": adaptation_level
            },
            "startedCourses": started_courses,
            "activities": activities
        }
        return Response(res)
    
class QTableViewOverall(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        all_tables = []
        for course in Course.objects.all():
            q_table = agent.export_qtable(f"{user.id}_{course.id}")
            if len(q_table) > 0:
                all_tables.append({
                    "course_id": course.id,
                    "title": course.title,
                    "q_table": q_table
                })
        return Response(all_tables)