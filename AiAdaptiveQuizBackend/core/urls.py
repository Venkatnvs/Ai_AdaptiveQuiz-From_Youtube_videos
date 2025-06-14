from django.urls import path
from .views import (
    CategoryListView,
    GenerateQuizView,
    SubmitQuizView,
    QuizSessionDetailView,
    CourseOverviewView,
    VideoDetailView,
)

urlpatterns = [
    path("catalog/", CategoryListView.as_view(), name="catalog"),
    path("course/<int:course_id>/overview/", CourseOverviewView.as_view(), name="course-overview"),
    path("course/<int:course_id>/videos/<int:video_id>/start/", VideoDetailView.as_view(), name="video-detail"),
    path("course/<int:course_id>/videos/<int:video_id>/complete/", GenerateQuizView.as_view(), name="generate-quiz"),
    path("quiz/submit/<int:session_id>/", SubmitQuizView.as_view(), name="submit-quiz"),
    path("quiz/session/<int:pk>/", QuizSessionDetailView.as_view(), name="quiz-detail"),
]
