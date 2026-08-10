from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter

from .views import (
    ListCreateRecordAPIView,
    RegisterAPIView,
    RetrieveUpdateDestroyRecordAPIView,
)

router = DefaultRouter()

urlpatterns = [
    path('records/', ListCreateRecordAPIView.as_view()),
    path('records/<int:pk>/', RetrieveUpdateDestroyRecordAPIView.as_view()),
    path('auth/register/', RegisterAPIView.as_view()),
    path('auth/token/', obtain_auth_token),
    path('', include(router.urls)),
]