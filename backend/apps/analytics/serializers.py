from rest_framework import serializers
from .models import FinancialLog, AuditLog

class FinancialLogSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    log_type_display = serializers.CharField(source='get_log_type_display', read_only=True)

    class Meta:
        model = FinancialLog
        fields = '__all__'


class AuditLogSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    audit_type_display = serializers.CharField(source='get_audit_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)

    class Meta:
        model = AuditLog
        fields = '__all__'
