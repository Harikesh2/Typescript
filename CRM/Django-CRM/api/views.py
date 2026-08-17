from datetime import timedelta

from django.conf import settings
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import exceptions, filters, generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from website.models import Record

from .lambda_trigger import trigger_lead_scoring
from .serializers import RecordSerializer, RegisterSerializer, UserSerializer


def by_state(queryset):
    return list(
        queryset.values('state').annotate(count=Count('id')).order_by('-count', 'state')
    )


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


class RetrieveUpdateDestroyRecordAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Record.objects.all()
    serializer_class = RecordSerializer
    http_method_names = ['get', 'put', 'patch', 'delete', 'head', 'options']


class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class StatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

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
            'by_state': by_state(Record.objects.all()),
            'newest_record': RecordSerializer(newest_record).data if newest_record else None,
        }
        return Response(data)


class ReportAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Record.objects.all()

        date_from = request.query_params.get('from')
        date_to = request.query_params.get('to')
        if date_from:
            try:
                parsed_from = timezone.datetime.fromisoformat(date_from)
            except ValueError:
                raise exceptions.ValidationError({'from': 'Invalid date format.'})
            queryset = queryset.filter(created_at__gte=parsed_from)
        if date_to:
            try:
                parsed_to = timezone.datetime.fromisoformat(date_to)
            except ValueError:
                raise exceptions.ValidationError({'to': 'Invalid date format.'})
            queryset = queryset.filter(created_at__lte=parsed_to)

        data = {
            'total_records': queryset.count(),
            'records_per_month': list(
                queryset.annotate(month=TruncMonth('created_at'))
                .values('month')
                .annotate(count=Count('id'))
                .order_by('month')
            ),
            'by_state': by_state(queryset),
        }
        return Response(data)


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class RecordScoreCallbackAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        secret = request.headers.get('X-Lambda-Secret')
        if secret != settings.LAMBDA_SECRET:
            return Response(
                {'detail': 'Invalid or missing LAMBDA_SECRET.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        record = get_object_or_404(Record, pk=pk)
        try:
            score = int(request.data.get('ai_score'))
        except (TypeError, ValueError):
            score = None
        if score is None or not 1 <= score <= 10:
            return Response(
                {'detail': 'ai_score must be an integer between 1 and 10.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        record.ai_score = score
        record.ai_reason = str(request.data.get('ai_reason') or '')[:255]
        record.scoring_status = 'IDLE'
        record.save()
        Record.objects.filter(pk=record.pk).update(ai_scored_at=record.updated_at)
        return Response({'detail': 'Score recorded.'}, status=status.HTTP_200_OK)


class RecordScoreTriggerAPIView(APIView):
    def post(self, request, pk):
        record = get_object_or_404(Record, pk=pk)
        if record.scoring_status == 'PROCESSING':
            return Response(
                {'detail': 'Scoring already in progress.'},
                status=status.HTTP_409_CONFLICT,
            )
        if record.ai_scored_at is not None and record.updated_at <= record.ai_scored_at:
            return Response(
                {'detail': 'No changes detected. Edit the lead to re-score.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        record.scoring_status = 'PROCESSING'
        record.save()
        trigger_lead_scoring(record)
        return Response({'detail': 'Scoring started.'}, status=status.HTTP_202_ACCEPTED)


class RecordResetScoringAPIView(APIView):
    def post(self, request, pk):
        record = get_object_or_404(Record, pk=pk)
        if record.ai_score is None and record.scoring_status == 'PROCESSING':
            record.scoring_status = 'IDLE'
            record.save()
        return Response({'detail': 'Scoring reset.'}, status=status.HTTP_200_OK)