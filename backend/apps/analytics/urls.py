from django.urls import path
from .views import ProfitLossReportView, BotTraReportView, AuditLogViewSet

urlpatterns = [
    path('pnl/', ProfitLossReportView.as_view(), name='pnl-report'),
    path('bot-tra/', BotTraReportView.as_view(), name='bot-tra-report'),
    path('audit-logs/', AuditLogViewSet.as_view(), name='audit-logs'),
]
