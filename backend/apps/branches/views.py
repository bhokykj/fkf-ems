from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Branch, Region, District, Ward, Street, BranchCapitalRequest
from .serializers import BranchSerializer, RegionSerializer, DistrictSerializer, WardSerializer, StreetSerializer, BranchCapitalRequestSerializer

class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Branch.objects.all()
        user_branch_id = self.request.query_params.get('branch_id')
        if user_branch_id:
            qs = qs.filter(id=user_branch_id)
        return qs

    @action(detail=True, methods=['patch'])
    def update_rules(self, request, pk=None):
        branch = self.get_object()
        fields = [
            'name', 'code', 'location', 'region', 'district', 'ward', 'street_or_village',
            'allocated_capital', 'max_loan_amount', 'interest_rate_pct', 'penalty_type', 'penalty_value', 
            'require_collateral', 'collateral_min_ltv_pct', 'is_active'
        ]
        for field in fields:
            if field in request.data:
                setattr(branch, field, request.data[field])
        branch.save()
        serializer = self.get_serializer(branch)
        return Response(serializer.data)


class BranchCapitalRequestViewSet(viewsets.ModelViewSet):
    queryset = BranchCapitalRequest.objects.all()
    serializer_class = BranchCapitalRequestSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = BranchCapitalRequest.objects.all()
        branch_id = self.request.query_params.get('branch')
        if branch_id and str(branch_id).lower() not in ['all', 'undefined', 'null', 'none', '']:
            qs = qs.filter(branch_id=branch_id)
        return qs

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        from django.utils import timezone
        req = self.get_object()
        if req.status == 'APPROVED':
            return Response({'error': 'Ombi hili limeshaidhinishwa tayari.'}, status=400)
        
        req.status = 'APPROVED'
        req.approved_at = timezone.now()
        req.admin_notes = request.data.get('admin_notes', 'Imeidhinishwa na Super Admin')
        
        # Increase branch allocated capital
        req.branch.allocated_capital = float(req.branch.allocated_capital or 0) + float(req.amount)
        req.branch.save()
        req.save()
        
        return Response(self.get_serializer(req).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        req = self.get_object()
        req.status = 'REJECTED'
        req.admin_notes = request.data.get('admin_notes', 'Imekataliwa na Super Admin')
        req.save()
        return Response(self.get_serializer(req).data)

class RegionViewSet(viewsets.ModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [permissions.AllowAny]

class DistrictViewSet(viewsets.ModelViewSet):
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = District.objects.all()
        region_id = self.request.query_params.get('region')
        if region_id:
            qs = qs.filter(region_id=region_id)
        return qs

class WardViewSet(viewsets.ModelViewSet):
    queryset = Ward.objects.all()
    serializer_class = WardSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Ward.objects.all()
        district_id = self.request.query_params.get('district')
        if district_id:
            qs = qs.filter(district_id=district_id)
        return qs

class StreetViewSet(viewsets.ModelViewSet):
    queryset = Street.objects.all()
    serializer_class = StreetSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Street.objects.all()
        ward_id = self.request.query_params.get('ward')
        if ward_id:
            qs = qs.filter(ward_id=ward_id)
        return qs
