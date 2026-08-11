from django.db import models
from apps.loans.models import Borrower

class CRBCheck(models.Model):
    PROVIDER_CHOICES = [
        ('CREDITINFO', 'Creditinfo Kenya CRB'),
        ('METROPOL', 'Metropol CRB Kenya'),
    ]

    STATUS_CHOICES = [
        ('CLEARED', 'Cleared / Low Risk (200 Certificate)'),
        ('PERFORMING', 'Performing Active Accounts'),
        ('NON_PERFORMING', 'Non-Performing Accounts Flagged'),
        ('BLACKLISTED', 'Blacklisted / Severe Defaulter'),
    ]

    borrower = models.ForeignKey(Borrower, on_delete=models.CASCADE, related_name='crb_checks')
    provider = models.CharField(max_length=30, choices=PROVIDER_CHOICES, default='CREDITINFO')
    credit_score = models.IntegerField(help_text="Credit score ranging from 200 to 900")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PERFORMING')
    
    delinquent_accounts_count = models.IntegerField(default=0)
    total_delinquent_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    summary = models.TextField(blank=True, null=True)
    request_payload = models.TextField(blank=True, null=True, help_text="Sent JSON API Payload")
    response_payload = models.TextField(blank=True, null=True, help_text="Received JSON API Response")

    checked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fkf_ems_crb_checks'
        ordering = ['-checked_at']

    def __str__(self):
        return f"CRB Check ({self.provider}) - {self.borrower.first_name} {self.borrower.last_name}: Score {self.credit_score}"
