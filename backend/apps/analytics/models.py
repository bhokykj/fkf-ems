from django.db import models
from apps.branches.models import Branch
from apps.loans.models import Loan

class FinancialLog(models.Model):
    LOG_TYPES = [
        ('REVENUE_INTEREST', 'Interest Income Collected'),
        ('REVENUE_FEE', 'Loan Application & Processing Fees'),
        ('REVENUE_PENALTY', 'Late Penalty Revenue'),
        ('LOSS_BAD_DEBT', 'Bad Debt Write-off / Default Loss'),
        ('LOSS_NPL_PROVISION', 'Provision for Non-Performing Loans (NPL)'),
    ]

    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='financial_logs')
    log_type = models.CharField(max_length=30, choices=LOG_TYPES)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    transaction_date = models.DateField()
    loan = models.ForeignKey(Loan, on_delete=models.SET_NULL, null=True, blank=True, related_name='financial_logs')
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fkf_ems_financial_logs'
        ordering = ['-transaction_date', '-created_at']

    def __str__(self):
        return f"[{self.get_log_type_display()}] {self.branch.name} - TSH {self.amount:,.2f}"


class AuditLog(models.Model):
    AUDIT_TYPES = [
        ('INTERNAL', 'Ukaguzi wa Ndani (Internal Audit)'),
        ('EXTERNAL', 'Ukaguzi wa Nje (External Audit)'),
        ('SYSTEM', 'System Security & Activity Audit'),
    ]
    SEVERITY_CHOICES = [
        ('INFO', 'Taarifa ya Kawaida'),
        ('WARNING', 'Onyo la Mahesabu'),
        ('CRITICAL', 'Kasoro Kubwa / Discrepancy'),
    ]

    audit_type = models.CharField(max_length=20, choices=AUDIT_TYPES, default='INTERNAL')
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    performed_by = models.CharField(max_length=150, help_text="Mkaguzi / User ID")
    action_title = models.CharField(max_length=250, help_text="Kichwa cha ukaguzi au mabadiliko ya mahesabu")
    details = models.TextField(help_text="Mchanganuo kamili wa ukaguzi")
    severity = models.CharField(max_length=15, choices=SEVERITY_CHOICES, default='INFO')
    is_resolved = models.BooleanField(default=False)
    resolution_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fkf_ems_audit_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_audit_type_display()}] {self.action_title}"
