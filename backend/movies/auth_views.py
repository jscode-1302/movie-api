import logging
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

logger = logging.getLogger(__name__)

class RegisterView(APIView):
    """Allows any user to register. Only allows post requests"""
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if not username or not password:
            logger.warning(f'The username or password was not provided')
            return Response({
                'success': False,
                'message': 'Username and password fields are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            logger.warning(f'User [{username}] tried to sign up but it already exists')
            return Response({
                'success': False,
                'message': 'User already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create_user(username=username, email=email, password=password)

        logger.info(f'User [{user.username}] has signed up successfully')

        refresh = RefreshToken.for_user(user)

        return Response({
            'success': True,
            'message': 'User created successfully',
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }, status=status.HTTP_201_CREATED)
    
class Logout(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()

            logger.info(f'User [{self.request.user}] logged out successfully')

            return Response({
                'success': True,
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception:
            logger.warning(f'User [{self.request.user}] provided an invalid token to log out')
            return Response({
                'success': False,
                'message': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)
        
class LoginView(TokenObtainPairView):
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            logger.warning(f'The username or password was not provided')
            return Response({
                'success': False,
                'message': 'Username and password fields are required'
            })

        user = authenticate(username=username, password=password)
        
        if user is None:
            logger.warning(f'Failed login attempt for username: {username}')
            return Response({
                'success': False,
                'message': 'Wrong credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        logger.info(f'User [{user.username}] logged in successfully')

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }, status=status.HTTP_200_OK)

