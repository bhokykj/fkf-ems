from rest_framework import serializers
from .models import User, FieldExpense, JobVacancy, JobApplication
from apps.branches.serializers import BranchSerializer

class UserSerializer(serializers.ModelSerializer):
    branch_detail = BranchSerializer(source='branch', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role', 'role_display', 
            'branch', 'branch_detail', 'employee_id', 'borrower_id', 'phone_number', 'passport_photo', 
            'is_superuser', 'basic_salary', 'transport_allowance', 'housing_allowance', 'field_allowance',
            'payment_method', 'payment_provider', 'payment_account_no', 'nssf_number', 'nhif_number',
            'enable_nssf', 'enable_nhif'
        ]


class FieldExpenseSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.get_full_name', read_only=True)
    staff_username = serializers.CharField(source='staff.username', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = FieldExpense
        fields = [
            'id', 'staff', 'staff_name', 'staff_username', 'branch', 'branch_name',
            'category', 'category_display', 'title', 'amount', 'receipt_no',
            'receipt_attachment', 'status', 'approved_by', 'created_at'
        ]


class JobVacancySerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    applications_count = serializers.SerializerMethodField()

    class Meta:
        model = JobVacancy
        fields = '__all__'

    def get_applications_count(self, obj):
        return obj.applications.count()


class JobApplicationSerializer(serializers.ModelSerializer):
    vacancy_detail = JobVacancySerializer(source='vacancy', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = JobApplication
        fields = '__all__'
