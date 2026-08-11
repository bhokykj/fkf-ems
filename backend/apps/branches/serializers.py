from rest_framework import serializers
from .models import Branch, Region, District, Ward, Street, BranchCapitalRequest

class BranchSerializer(serializers.ModelSerializer):
    loan_count = serializers.SerializerMethodField()
    active_portfolio = serializers.SerializerMethodField()
    total_lent_out = serializers.SerializerMethodField()
    remaining_capital = serializers.SerializerMethodField()
    capital_utilization_pct = serializers.SerializerMethodField()

    class Meta:
        model = Branch
        fields = '__all__'

    def get_loan_count(self, obj):
        return obj.loans.count() if hasattr(obj, 'loans') else 0

    def get_active_portfolio(self, obj):
        if hasattr(obj, 'loans'):
            return sum(l.balance_remaining for l in obj.loans.filter(status__in=['DISBURSED', 'Active']))
        return 0.0

    def get_total_lent_out(self, obj):
        if hasattr(obj, 'loans'):
            return sum(l.principal_amount for l in obj.loans.filter(status__in=['DISBURSED', 'Active', 'APPROVED']))
        return 0.0

    def get_remaining_capital(self, obj):
        lent = self.get_total_lent_out(obj)
        allocated = float(obj.allocated_capital or 50000000.00)
        return max(0.0, allocated - float(lent))

    def get_capital_utilization_pct(self, obj):
        allocated = float(obj.allocated_capital or 50000000.00)
        if allocated <= 0:
            return 0.0
        lent = self.get_total_lent_out(obj)
        return min(100.0, round((float(lent) / allocated) * 100.0, 1))


class BranchCapitalRequestSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    branch_code = serializers.CharField(source='branch.code', read_only=True)

    class Meta:
        model = BranchCapitalRequest
        fields = ['id', 'branch', 'branch_name', 'branch_code', 'requested_by', 'amount', 'reason', 'status', 'admin_notes', 'approved_at', 'created_at']

class StreetSerializer(serializers.ModelSerializer):
    ward_name = serializers.CharField(source='ward.name', read_only=True)
    district_name = serializers.CharField(source='ward.district.name', read_only=True)
    region_name = serializers.CharField(source='ward.district.region.name', read_only=True)

    class Meta:
        model = Street
        fields = ['id', 'name', 'ward', 'ward_name', 'district_name', 'region_name', 'created_at']

class WardSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source='district.name', read_only=True)
    region_name = serializers.CharField(source='district.region.name', read_only=True)
    streets_count = serializers.SerializerMethodField()

    class Meta:
        model = Ward
        fields = ['id', 'name', 'district', 'district_name', 'region_name', 'streets_count', 'created_at']

    def get_streets_count(self, obj):
        return obj.streets.count()

class DistrictSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)
    wards_count = serializers.SerializerMethodField()

    class Meta:
        model = District
        fields = ['id', 'name', 'region', 'region_name', 'wards_count', 'created_at']

    def get_wards_count(self, obj):
        return obj.wards.count()

class RegionSerializer(serializers.ModelSerializer):
    districts_count = serializers.SerializerMethodField()

    class Meta:
        model = Region
        fields = ['id', 'name', 'districts_count', 'created_at']

    def get_districts_count(self, obj):
        return obj.districts.count()
