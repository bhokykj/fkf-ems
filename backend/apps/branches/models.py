from django.db import models

class Branch(models.Model):
    PENALTY_CHOICES = [
        ('FLAT', 'Flat Rate (TSH)'),
        ('PERCENTAGE', 'Percentage-Based (%)'),
    ]

    code = models.CharField(max_length=20, unique=True, help_text="Unique Branch Identifier, e.g. BR-DAR-01")
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=150)
    
    # Detailed Tanzania Location Hierarchy
    region = models.CharField(max_length=50, default='Dar es Salaam', help_text="Mkoa")
    district = models.CharField(max_length=50, default='Ilala', help_text="Wilaya")
    ward = models.CharField(max_length=50, default='Kariakoo', help_text="Kata")
    street_or_village = models.CharField(max_length=100, default='Mtaa wa Swahili', help_text="Mtaa au Kijiji")
    block_number = models.CharField(max_length=50, default='Block A', blank=True, help_text="Kitalu / Block No (manual)")
    house_number = models.CharField(max_length=50, default='Nyumba No 12', blank=True, help_text="Namba ya Nyumba / House No (manual)")

    is_active = models.BooleanField(default=True)
    
    # Capital Treasury & Operations (TSH)
    allocated_capital = models.DecimalField(max_digits=16, decimal_places=2, default=50000000.00, help_text="Total company capital allocated to this branch in TSH")
    max_loan_amount = models.DecimalField(max_digits=14, decimal_places=2, default=5000000.00, help_text="Maximum allowed loan amount for this branch (TSH)")
    interest_rate_pct = models.DecimalField(max_digits=5, decimal_places=2, default=14.50, help_text="Base monthly/annual interest rate percentage")
    penalty_type = models.CharField(max_length=15, choices=PENALTY_CHOICES, default='PERCENTAGE')
    penalty_value = models.DecimalField(max_digits=12, decimal_places=2, default=5.00, help_text="Flat TSH value or percentage rate for late penalties")
    require_collateral = models.BooleanField(default=True)
    collateral_min_ltv_pct = models.DecimalField(max_digits=5, decimal_places=2, default=70.00, help_text="Minimum required Loan-to-Value ratio")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'fkf_ems_branches'
        verbose_name_plural = 'Branches'
        ordering = ['code']

    def __str__(self):
        return f"{self.name} ({self.code})"


class BranchCapitalRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Inasubiri Idhini'),
        ('APPROVED', 'Imeidhinishwa'),
        ('REJECTED', 'Imekataliwa'),
    ]

    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='capital_requests')
    requested_by = models.CharField(max_length=150, help_text="Username/Name of manager requesting top-up")
    amount = models.DecimalField(max_digits=16, decimal_places=2, help_text="Amount requested in TSH")
    reason = models.TextField(help_text="Reason for top-up request")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    admin_notes = models.TextField(blank=True, default='')
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fkf_ems_branch_capital_requests'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.branch.name} - TSH {self.amount} ({self.status})"

class Region(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fkf_ems_regions'
        ordering = ['name']

    def __str__(self):
        return self.name

class District(models.Model):
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='districts')
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fkf_ems_districts'
        unique_together = ['region', 'name']
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.region.name})"

class Ward(models.Model):
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='wards')
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fkf_ems_wards'
        unique_together = ['district', 'name']
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.district.name})"

class Street(models.Model):
    ward = models.ForeignKey(Ward, on_delete=models.CASCADE, related_name='streets')
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fkf_ems_streets'
        unique_together = ['ward', 'name']
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.ward.name})"
