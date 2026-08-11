from django.contrib.auth import get_user_model

from rest_framework import serializers

from rest_framework.authtoken.models import Token

from website.models import Record


class RecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Record
        fields = '__all__'
        read_only_fields = ('created_at',)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ('id', 'username', 'email')


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        if get_user_model().objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({
                'username': 'A user with that username already exists.'
            })
        return attrs

    def create(self, validated_data):
        user = get_user_model().objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        token, _ = Token.objects.get_or_create(user=user)
        return user, token

    def to_representation(self, instance):
        user, token = instance
        return {
            'id': user.pk,
            'username': user.username,
            'email': user.email,
            'token': token.key,
        }