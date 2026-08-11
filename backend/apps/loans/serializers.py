from rest_framework import serializers
from .models import Borrower, LoanProduct, Loan, Repayment, LoanComment
from apps.branches.serializers import BranchSerializer
from apps.authentication.serializers import UserSerializer

class BorrowerSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    branch_detail = BranchSerializer(source='branch', read_only=True)
    loans_count = serializers.SerializerMethodField()

    class Meta:
        model = Borrower
        fields = '__all__'

    def get_loans_count(self, obj):
        return obj.loans.count()


class LoanProductSerializer(serializers.ModelSerializer):
    branch_detail = BranchSerializer(source='branch', read_only=True)

    class Meta:
        model = LoanProduct
        fields = '__all__'


class RepaymentSerializer(serializers.ModelSerializer):
    loan_number = serializers.CharField(source='loan.loan_number', read_only=True)
    borrower_name = serializers.SerializerMethodField()

    class Meta:
        model = Repayment
        fields = '__all__'

    def get_borrower_name(self, obj):
        return f"{obj.loan.borrower.first_name} {obj.loan.borrower.last_name}"


class LoanCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanComment
        fields = '__all__'


class LoanSerializer(serializers.ModelSerializer):
    borrower_detail = BorrowerSerializer(source='borrower', read_only=True)
    branch_detail = BranchSerializer(source='branch', read_only=True)
    product_detail = LoanProductSerializer(source='product', read_only=True)
    repayments = RepaymentSerializer(many=True, read_only=True)
    comments = LoanCommentSerializer(many=True, read_only=True)
    collateral_count = serializers.SerializerMethodField()
    collateral_verified = serializers.SerializerMethodField()

    class Meta:
        model = Loan
        fields = '__all__'

    def get_collateral_count(self, obj):
        return obj.collaterals.count() if hasattr(obj, 'collaterals') else 0

    def get_collateral_verified(self, obj):
        if hasattr(obj, 'collaterals') and obj.collaterals.exists():
            return all(c.verification_status == 'VERIFIED' for c in obj.collaterals.all())
        return False
