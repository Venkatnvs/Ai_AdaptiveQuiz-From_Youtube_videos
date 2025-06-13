from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError as DjangoValidationError
from validate_email import validate_email
from .helper import extract_first_last_name

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'first_name', 'last_name', 'is_active', 'is_staff', 'is_superuser', 'is_completed', 'is_socialaccount', 'date_joined', 'last_login')

    get_full_name = lambda self, obj: obj.get_full_name()

class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already in use.")
        try:
            validate_email(value)
            return value
        except DjangoValidationError:
            raise serializers.ValidationError("Enter a valid email address.")

    def create(self, validated_data):
        first_name, last_name = extract_first_last_name(validated_data['username'])
        user = User.objects.create_user(
            first_name=first_name,
            last_name=last_name,
            email=validated_data['email'],
            password=validated_data['password'],
            is_completed=True
        )
        return user

class CustomTokenObtainPairSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)

            if not user:
                raise serializers.ValidationError('Invalid credentials')
            
            refresh = RefreshToken.for_user(user)
            return {
                'id': user.id,
                'email': user.email,
                'is_active': user.is_active,
                'is_completed': user.is_completed,
                'is_socialaccount': user.is_socialaccount,
                'full_name': user.get_full_name(),
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }

            }
        else:
            raise serializers.ValidationError('Must include "email" and "password".')