from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import UserSerializer

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from .serializers import RegisterSerializer
        from .utils_email import send_notification
        
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Send Welcome Email
            if user.email:
                subject = "Welcome to CatalogStudio!"
                body = f"""
                <h1>Welcome, {user.name or user.username}!</h1>
                <p>Thanks for joining CatalogStudio. We are excited to have you on board.</p>
                """
                send_notification(user.email, subject, body)

            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes
        from django.contrib.auth import get_user_model
        from .utils_email import send_notification

        User = get_user_model()
        email = request.data.get('email')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'message': 'If an account exists, a reset link has been sent.'})

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        reset_link = f"http://localhost:5173/reset-password?uid={uid}&token={token}"
        
        subject = "Reset Your Password - CatalogStudio"
        body = f"""
        <p>Hello {user.name or user.username},</p>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="{reset_link}">{reset_link}</a>
        <p>If you didn't ask for this, please ignore this email.</p>
        """
        
        send_notification(user.email, subject, body)
        
        return Response({'message': 'If an account exists, a reset link has been sent.'})

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_decode
        from django.utils.encoding import force_str
        from django.contrib.auth import get_user_model
        from .utils_email import send_notification

        User = get_user_model()
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not uidb64 or not token or not new_password:
             return Response({'error': 'Missing fields'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Invalid link'}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            
            send_notification(user.email, "Password Changed Successfully", "Your CatalogStudio password has been updated.")
            
            return Response({'message': 'Password has been reset successfully.'})
        
        return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
