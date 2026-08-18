from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter

from .views import (
    ListCreateRecordAPIView,
    MeAPIView,
    RecordResetScoringAPIView,
    RecordScoreCallbackAPIView,
    RecordScoreTriggerAPIView,
    RegisterAPIView,
    ReportAPIView,
    RetrieveUpdateDestroyRecordAPIView,
    StatsAPIView,
)

router = DefaultRouter()

urlpatterns = [
    path('records/', ListCreateRecordAPIView.as_view()),
    path('records/<int:pk>/', RetrieveUpdateDestroyRecordAPIView.as_view()),
    path('records/<int:pk>/score/', RecordScoreCallbackAPIView.as_view()),
    path('records/<int:pk>/score-trigger/', RecordScoreTriggerAPIView.as_view()),
    path('records/<int:pk>/reset-scoring/', RecordResetScoringAPIView.as_view()),
    path('stats/', StatsAPIView.as_view()),
    path('reports/', ReportAPIView.as_view()),
    path('auth/register/', RegisterAPIView.as_view()),
    path('auth/me/', MeAPIView.as_view()),
    path('auth/token/', obtain_auth_token),
    path('', include(router.urls)),
]