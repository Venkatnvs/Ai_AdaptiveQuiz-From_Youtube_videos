from rest_framework import generics, views, permissions, status
from rest_framework.response import Response
from .models import Category, Course, Video, QuizSession, Question
from .serializers import (
    CategorySerializer,
    CourseSerializer,
    VideoSerializer,
    QuizSessionSerializer,
    QuestionSerializer,
)
from core.quiz_generator.gemini import generate_questions
from core.qlearning.qtable import QLearningAgent
from django.utils import timezone
from core.qlearning.utils import get_adaptation_level

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

        # Create quiz session
        try:
            session = QuizSession.objects.get(user=user, video=video, completed_at__isnull=True, is_quiz_generated=False)
        except QuizSession.DoesNotExist:
            return Response({"error": "Quiz session not found"}, status=404)

        # Create Q-table key
        key = f"{user.id}:{video.course.id}"
        state = str(agent.avg_level(key))[:4]
        difficulty = agent.choose_action(key, state)

        # Generate questions with Gemini
        try:
            questions = generate_questions(video.transcript, count=10, difficulty=difficulty)
            
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

    def post(self, request, session_id):
        session = QuizSession.objects.get(id=session_id, user=request.user)
        answers = request.data.get("answers", [])
        key = f"{session.user.id}:{session.video.course.id}"
        old_state = str(agent.avg_level(key))[:4]
        score = 0

        for answer in answers:
            question = Question.objects.get(id=answer["question_id"], session=session)
            question.selected = answer["selected"]
            question.save()

            reward = 1 if question.selected == question.correct_answer else -1
            next_state = str(agent.avg_level(key))[:4]
            agent.update(key, old_state, question.difficulty, reward, next_state)
            score += reward if reward > 0 else 0

        session.score = score
        session.stars = score
        session.completed_at = timezone.now()
        session.adaptation_level = agent.avg_level(key)
        session.save()

        return Response(QuizSessionSerializer(session).data)

class QuizSessionDetailView(generics.RetrieveAPIView):
    queryset = QuizSession.objects.all()
    serializer_class = QuizSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

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
                "aiLevel": "Intermediate"
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