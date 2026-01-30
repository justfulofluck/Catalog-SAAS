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
        from django.contrib.auth import get_user_model
        from .models import PasswordResetOTP
        from .utils_email import send_notification
        import random

        User = get_user_model()
        email = request.data.get('email')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Security: allow flow to "succeed" even if email not found
            return Response({'message': 'If an account exists, an OTP has been sent.'})

        # Generate 6-digit OTP
        otp_code = f"{random.randint(100000, 999999)}"
        
        # Save to DB
        PasswordResetOTP.objects.create(user=user, otp_code=otp_code)
        
        subject = "Reset Password Code - CatalogStudio"
        body = f"""
        <p>Your verification code is: <strong>{otp_code}</strong></p>
        <p>This code triggers a password reset. It is valid for <strong>60 seconds</strong>.</p>
        """
        
        send_notification(user.email, subject, body)
        
        return Response({'message': 'OTP sent to email.'})

class PasswordResetVerifyView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from django.contrib.auth import get_user_model
        from django.utils import timezone
        from .models import PasswordResetOTP
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes
        import datetime

        User = get_user_model()
        email = request.data.get('email')
        otp_code = request.data.get('otp')

        if not email or not otp_code:
            return Response({'error': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            # Find the latest unused OTP for this user
            otp_record = PasswordResetOTP.objects.filter(
                user=user, 
                otp_code=otp_code, 
                is_used=False
            ).latest('created_at')

        except (User.DoesNotExist, PasswordResetOTP.DoesNotExist):
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        # Check Expiration (60 seconds)
        now = timezone.now()
        diff = now - otp_record.created_at
        if diff.total_seconds() > 60:
            return Response({'error': 'OTP Expired'}, status=status.HTTP_400_BAD_REQUEST)

        # Mark OTP as used
        otp_record.is_used = True
        otp_record.save()

        # Generate standard Django Reset Token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        return Response({
            'message': 'OTP Verified',
            'uid': uid,
            'token': token
        })

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
