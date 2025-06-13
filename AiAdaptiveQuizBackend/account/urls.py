from django.urls import path
from .views import (
    RegisterView, UserView, CustomTokenObtainPairView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='accounts-register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='accounts-token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='accounts-token_refresh'),
    path('user/', UserView.as_view(), name='accounts-user_detail'),
]