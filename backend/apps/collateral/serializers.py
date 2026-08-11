from rest_framework import serializers
from .models import Collateral

class CollateralSerializer(serializers.ModelSerializer):
    borrower_name = serializers.SerializerMethodField()
    loan_number = serializers.CharField(source='loan.loan_number', read_only=True)
    branch_name = serializers.CharField(source='loan.branch.name', read_only=True)
    collateral_type_display = serializers.CharField(source='get_collateral_type_display', read_only=True)

    class Meta:
        model = Collateral
        fields = '__all__'

    def get_borrower_name(self, obj):
        return f"{obj.borrower.first_name} {obj.borrower.last_name}"
