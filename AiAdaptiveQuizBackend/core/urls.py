from django.urls import path
from .views import (
    CategoryListView,
    GenerateQuizView,
    SubmitQuizView,
    QuizSessionDetailView,
    CourseOverviewView,
    VideoDetailView,
    TotalStarsView,
    DashboardInfoView,
    QTableViewOverall,
)

urlpatterns = [
    path("catalog/", CategoryListView.as_view(), name="catalog"),
    path("course/<int:course_id>/overview/", CourseOverviewView.as_view(), name="course-overview"),
    path("course/<int:course_id>/videos/<int:video_id>/start/", VideoDetailView.as_view(), name="video-detail"),
    path("course/<int:course_id>/videos/<int:video_id>/complete/", GenerateQuizView.as_view(), name="generate-quiz"),
    path("course/<int:course_id>/videos/<int:video_id>/quiz", QuizSessionDetailView.as_view(), name="quiz-detail"),
    path("course/<int:course_id>/videos/<int:video_id>/quiz/submit", SubmitQuizView.as_view(), name="submit-quiz"),


    # Overall Dashboard
    path("total-stars/", TotalStarsView.as_view(), name="total-stars"),
    path("dashboard-info/", DashboardInfoView.as_view(), name="dashboard-info"),
    path("q-table/overall/", QTableViewOverall.as_view(), name="q-table-overall"),
    
]
