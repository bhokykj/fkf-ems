from rest_framework import serializers
from .models import CRBCheck

class CRBCheckSerializer(serializers.ModelSerializer):
    borrower_name = serializers.SerializerMethodField()
    id_number = serializers.CharField(source='borrower.id_number', read_only=True)
    provider_display = serializers.CharField(source='get_provider_display', read_only=True)

    class Meta:
        model = CRBCheck
        fields = '__all__'

    def get_borrower_name(self, obj):
        return f"{obj.borrower.first_name} {obj.borrower.last_name}"
