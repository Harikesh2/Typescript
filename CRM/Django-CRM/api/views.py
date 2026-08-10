from rest_framework import exceptions, generics
from rest_framework.permissions import AllowAny

from website.models import Record

from .serializers import RecordSerializer, RegisterSerializer


class ListCreateRecordAPIView(generics.ListCreateAPIView):
    queryset = Record.objects.all()
    serializer_class = RecordSerializer

    def permission_denied(self, request, message=None, code=None):
        raise exceptions.PermissionDenied(detail=message, code=code)


class RetrieveUpdateDestroyRecordAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Record.objects.all()
    serializer_class = RecordSerializer
    http_method_names = ['get', 'put', 'patch', 'delete', 'head', 'options']

    def permission_denied(self, request, message=None, code=None):
        raise exceptions.PermissionDenied(detail=message, code=code)


class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]