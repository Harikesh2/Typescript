from datetime import timedelta

from django.db.models import Count
from django.utils import timezone

from rest_framework import exceptions, filters, generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from website.models import Record

from .serializers import RecordSerializer, RegisterSerializer, UserSerializer


class RecordPageNumberPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'


class ListCreateRecordAPIView(generics.ListCreateAPIView):
    queryset = Record.objects.all()
    serializer_class = RecordSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ('first_name', 'last_name', 'email')
    ORDERING_FIELDS = {
        'id', 'created_at', 'first_name', 'last_name', 'email',
        'phone', 'address', 'city', 'state', 'zipcode',
    }

    def get_queryset(self):
        queryset = super().get_queryset()
        state = self.request.query_params.get('state')
        if state:
            queryset = queryset.filter(state__iexact=state)
        ordering = self.request.query_params.get('ordering')
        if ordering:
            terms = []
            for term in ordering.split(','):
                term = term.strip()
                name = term.lstrip('+-')
                if name in self.ORDERING_FIELDS:
                    terms.append(('-' if term.startswith('-') else '') + name)
            if terms:
                queryset = queryset.order_by(*terms)
        return queryset

    def list(self, request, *args, **kwargs):
        if 'page' in request.query_params:
            self.pagination_class = RecordPageNumberPagination
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
        return super().list(request, *args, **kwargs)

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


class StatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def permission_denied(self, request, message=None, code=None):
        raise exceptions.PermissionDenied(detail=message, code=code)

    def get(self, request):
        now = timezone.now()
        start_of_week = (now - timedelta(days=now.weekday())).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        newest_record = Record.objects.order_by('-created_at').first()
        data = {
            'total_records': Record.objects.count(),
            'records_this_week': Record.objects.filter(created_at__gte=start_of_week).count(),
            'records_this_month': Record.objects.filter(created_at__gte=start_of_month).count(),
            'distinct_states': Record.objects.values('state').distinct().count(),
            'by_state': list(
                Record.objects.values('state').annotate(count=Count('id')).order_by('-count')
            ),
            'newest_record': RecordSerializer(newest_record).data if newest_record else None,
        }
        return Response(data)


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def permission_denied(self, request, message=None, code=None):
        raise exceptions.PermissionDenied(detail=message, code=code)

    def get(self, request):
        return Response(UserSerializer(request.user).data)