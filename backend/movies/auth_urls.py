from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import auth_views

urlpatterns = [
    path('login/', auth_views.LoginView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', auth_views.RegisterView.as_view(), name='register'),
    path('logout/', auth_views.Logout.as_view(), name='logout')
]

