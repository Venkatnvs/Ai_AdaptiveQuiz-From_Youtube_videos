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
        session = QuizSession.objects.get(user=user, video__id=video_id, video__course__id=course_id, is_quiz_generated=True)
        answers = request.data.get("answers", [])
        key = f"{session.user.id}_{session.video.course.id}"
        old_state = str(agent.avg_level(key))[:4]
        score = 0

        for answer in answers:
            question = Question.objects.get(id=answer["question_id"], session=session)
            question.selected = str(answer["selected"])
            question.save()

            reward = 1 if question.selected == question.correct_answer else -1
            next_state = str(agent.avg_level(key))[:4]
            agent.update(key, old_state, question.difficulty, reward, next_state)
            score += reward if reward > 0 else 0

        session.score = (score / 10) * 100
        session.stars = (score / 10) * 5
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

        return Response({
            "course_id": course_id,
            "title": course.title,
            "description": course.description,
            "total_videos": course.total_videos,
            "videos": VideoSerializer(course.videos.all(), many=True, context={"request": request}).data,
            "stats": {
                "stars": total_stars,
                "avgScore": round(avg_score, 2),
                "aiLevel": get_ai_level(agent.avg_level(f"{user.id}_{course_id}"))
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
        adaptation_level = []
        try:    
            for course in Course.objects.filter(user=user):
                adaptation_level.append(get_ai_level(agent.avg_level(f"{user.id}_{course.id}")))
            adaptation_level = sum(adaptation_level) / len(adaptation_level)
        except:
            adaptation_level = "Beginner"
        started_courses = []
        for course in Course.objects.all():
            if course.is_course_started_by_user(user) and not course.is_course_completed_by_user(user):
                started_courses.append(CourseSerializer(course).data)
        
        activities = []
        for course in Course.objects.all():
            if course.is_course_completed_by_user(user):
                activities.append({
                    "id": course.id,
                    "type": "course_completed",
                    "title": course.title,
                    "description": "Completed course",
                    "date": course.completed_at.strftime("%Y-%m-%d")
                })
        
        res = {
            "stats": {
                "quizzesCompleted": quizzes_completed,
                "averageScore": round(average_score, 2),
                "totalStars": total_stars,
                "adaptationLevel": adaptation_level
            },
            "startedCourses": started_courses,
            "activities": []
        }
        return Response(res)
