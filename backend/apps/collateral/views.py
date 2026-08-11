from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from datetime import timedelta
from .models import Collateral
from .serializers import CollateralSerializer

class CollateralViewSet(viewsets.ModelViewSet):
    queryset = Collateral.objects.all()
    serializer_class = CollateralSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Collateral.objects.all()
        branch_id = self.request.query_params.get('branch')
        if branch_id and branch_id != 'all':
            qs = qs.filter(loan__branch_id=branch_id)
        return qs

    @action(detail=False, methods=['get'])
    def alerts(self, request):
        today = timezone.now().date()
        in_30_days = today + timedelta(days=30)
        
        # Insurance expiring soon or expired
        expiring_insurance = Collateral.objects.filter(
            insurance_expiry_date__lte=in_30_days
        )
        
        # High LTV warning (LTV > 75%)
        high_ltv = Collateral.objects.filter(calculated_ltv_pct__gt=75.00)

        return Response({
            'expiring_insurance': CollateralSerializer(expiring_insurance, many=True).data,
            'high_ltv_warnings': CollateralSerializer(high_ltv, many=True).data,
            'total_alerts_count': expiring_insurance.count() + high_ltv.count()
        })
