from django.db import models
from apps.loans.models import Loan, Borrower

class Collateral(models.Model):
    COLLATERAL_TYPES = [
        ('VEHICLE', 'Motor Vehicle / Fleet'),
        ('LAND_TITLE', 'Land Title Deed / Plot'),
        ('COMMERCIAL_PROPERTY', 'Commercial Real Estate'),
        ('EQUIPMENT', 'Heavy Equipment / Machinery'),
        ('STOCKS_ASSETS', 'Inventory / Shares & Financial Assets'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending Inspection'),
        ('VERIFIED', 'Verified & Charge Registered'),
        ('EXPIRED', 'Document / Insurance Expired'),
        ('FLAGGED', 'High Risk / Dispute Flagged'),
    ]

    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='collaterals')
    borrower = models.ForeignKey(Borrower, on_delete=models.CASCADE, related_name='collaterals')
    
    collateral_type = models.CharField(max_length=30, choices=COLLATERAL_TYPES, default='VEHICLE')
    title_deed_or_reg_number = models.CharField(max_length=100, help_text="Registration No. / Title Deed No. / Logbook No.")
    description = models.TextField(help_text="Detailed description of physical condition, location, specs")
    
    estimated_market_value = models.DecimalField(max_digits=12, decimal_places=2)
    forced_sale_value = models.DecimalField(max_digits=12, decimal_places=2, help_text="Liquidation / Forced Sale Value")
    calculated_ltv_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, help_text="Loan-to-Value Ratio (%)")

    insurance_policy_number = models.CharField(max_length=60, blank=True, null=True)
    insurance_expiry_date = models.DateField(blank=True, null=True)
    valuation_expiry_date = models.DateField(blank=True, null=True)
    
    verification_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    document_url = models.CharField(max_length=255, blank=True, null=True, help_text="Path or URL to uploaded ownership title deed / logbook PDF")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'fkf_ems_collaterals'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if self.estimated_market_value and self.estimated_market_value > 0 and self.loan:
            self.calculated_ltv_pct = (self.loan.principal_amount / self.estimated_market_value) * 100
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_collateral_type_display()} ({self.title_deed_or_reg_number}) - LTV: {self.calculated_ltv_pct:.1f}%"
