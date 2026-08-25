from django.db import models
from apps.branches.models import Branch
from django.conf import settings

class Borrower(models.Model):
    EMPLOYMENT_CHOICES = [
        ('SALARIED', 'Salaried Employee'),
        ('SELF_EMPLOYED', 'Self-Employed / Business'),
        ('CIVIL_SERVANT', 'Civil Servant'),
        ('CONTRACTOR', 'Contractor / Freelance'),
    ]

    KYC_STATUS_CHOICES = [
        ('PENDING', 'Kyc Pending Review'),
        ('VERIFIED', 'Verified & Approved (NIDA Passed)'),
        ('REJECTED', 'Rejected / Suspicious ID'),
    ]

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    id_number = models.CharField(max_length=40, unique=True, help_text="Tanzania NIDA National ID / Passport Number")
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    address = models.CharField(max_length=250, blank=True, null=True)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='borrowers')
    employment_status = models.CharField(max_length=25, choices=EMPLOYMENT_CHOICES, default='SALARIED')
    monthly_income = models.DecimalField(max_digits=14, decimal_places=2, default=500000.00)
    credit_rating = models.CharField(max_length=20, default='GOOD')
    
    # Extended Form Fields (Matching User Reference Design)
    gender = models.CharField(max_length=20, blank=True, null=True, default='- Select -')
    date_of_birth = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=30, default='Pending')
    occupation = models.CharField(max_length=100, blank=True, null=True)
    business_name = models.CharField(max_length=150, blank=True, null=True)
    id_type = models.CharField(max_length=50, default='NIDA')
    next_of_kin_name = models.CharField(max_length=100, blank=True, null=True)
    next_of_kin_phone = models.CharField(max_length=30, blank=True, null=True)
    group_id = models.CharField(max_length=50, blank=True, null=True)

    # Address Breakdown Fields
    region = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    ward = models.CharField(max_length=100, blank=True, null=True)
    street_or_village = models.CharField(max_length=150, blank=True, null=True)
    plot_no = models.CharField(max_length=50, blank=True, null=True)
    house_no = models.CharField(max_length=50, blank=True, null=True)

    # Account Login Fields
    username = models.CharField(max_length=50, blank=True, null=True)
    
    # Passport Size Photo Field
    photo_url = models.TextField(blank=True, null=True, help_text="Passport Size Photo URL or Base64 Image")

    # Super Admin KYC & Verification System
    kyc_status = models.CharField(max_length=20, choices=KYC_STATUS_CHOICES, default='VERIFIED')
    kyc_notes = models.TextField(blank=True, null=True, default="NIDA Registration Verified")
    verified_at = models.DateTimeField(auto_now=True)

    # Field Verification & Geo-Tagging Evidence Fields
    field_gps_location = models.CharField(max_length=200, blank=True, null=True, help_text="GPS Coordinates & Location Tag")
    residence_photo_url = models.TextField(blank=True, null=True, help_text="Picha ya Anapokaa")
    business_photo_url = models.TextField(blank=True, null=True, help_text="Picha ya Anapofanyia Biashara")
    workplace_stand_photo_url = models.TextField(blank=True, null=True, help_text="Picha ya Stendi akiwa Kazini")

    # Loan Officer Tracking Field
    created_by_officer_id = models.IntegerField(blank=True, null=True)
    created_by_officer_name = models.CharField(max_length=150, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fkf_ems_borrowers'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.id_number})"


class LoanProduct(models.Model):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='loan_products', null=True, blank=True)
    product_code = models.CharField(max_length=50, unique=True)
    product_name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    
    min_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    max_amount = models.DecimalField(max_digits=14, decimal_places=2, default=5000000.00)
    min_duration = models.IntegerField(default=1)
    max_duration = models.IntegerField(default=12)
    
    interest_rate_pct = models.DecimalField(max_digits=5, decimal_places=2, default=14.50)
    interest_type = models.CharField(max_length=50, default='Flat')
    
    penalty_rate = models.DecimalField(max_digits=14, decimal_places=2, default=5.00)
    penalty_type = models.CharField(max_length=50, default='Percentage')
    
    repayment_frequency = models.CharField(max_length=50, default='Monthly')
    status = models.CharField(max_length=30, default='Active')
    
    # Fees & Grace Period
    processing_fee = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    insurance_fee = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    vat_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    grace_days = models.IntegerField(default=0)
    
    # Guarantor & Collateral
    guarantor_required = models.CharField(max_length=20, default='Yes')
    no_of_guarantors = models.IntegerField(default=1)
    collateral_required = models.CharField(max_length=20, default='No')
    
    # Required Documents
    req_nida = models.CharField(max_length=30, default='Required')
    req_tin = models.CharField(max_length=30, default='Not Required')
    req_kadi_ya_chama = models.CharField(max_length=30, default='Not Required')
    req_leseni_ya_biashara = models.CharField(max_length=30, default='Not Required')
    req_picha_ya_biashara = models.CharField(max_length=30, default='Not Required')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fkf_ems_loan_products'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product_name} ({self.product_code})"


class Loan(models.Model):
    STATUS_CHOICES = [
        ('PENDING_RISK_REVIEW', 'Hatua 1: Ombi Limeingia (Inasubiri Risk Review)'),
        ('RISK_APPROVED', 'Hatua 2: Imepita Risk Review (Inasubiri Branch Approval)'),
        ('RISK_FAILED', 'Hatua 2: Imeshindwa Risk Review – Imekataliwa'),
        ('PENDING_BRANCH_APPROVAL', 'Hatua 3: Inasubiri Idhini ya Meneja wa Tawi'),
        ('BRANCH_APPROVED', 'Hatua 3: Imeidhinishwa na Tawi (Inasubiri Super Admin Final)'),
        ('BRANCH_REJECTED', 'Hatua 3: Imekataliwa na Meneja wa Tawi'),
        ('APPROVED', 'Hatua 4: Imeidhinishwa Kikamilifu na Super Admin Makao Makuu'),
        ('DISBURSED', 'Fedha Zimetolewa kwa Mkopaji'),
        ('REPAID', 'Imelipwa Kikamilifu'),
        ('DEFAULTED', 'Imeshindwa Kulipa / Chini ya Urejeshaji'),
    ]

    borrower = models.ForeignKey(Borrower, on_delete=models.CASCADE, related_name='loans')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='loans')
    product = models.ForeignKey(LoanProduct, on_delete=models.SET_NULL, null=True, blank=True, related_name='loans')
    
    principal_amount = models.DecimalField(max_digits=14, decimal_places=2, default=1000000.00)
    interest_rate_pct = models.DecimalField(max_digits=5, decimal_places=2, default=14.50)
    interest_amount = models.DecimalField(max_digits=14, decimal_places=2, default=145000.00)
    total_payable = models.DecimalField(max_digits=14, decimal_places=2, default=1145000.00)
    balance_remaining = models.DecimalField(max_digits=14, decimal_places=2, default=1145000.00)
    
    tenure_months = models.IntegerField(default=6)
    repayment_frequency = models.CharField(max_length=30, default='MONTHLY', choices=[('DAILY', 'Kila Siku / Daily'), ('WEEKLY', 'Kila Wiki / Weekly'), ('MONTHLY', 'Kila Mwezi / Monthly')])
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PENDING_RISK_REVIEW')
    
    # Disbursement & Delivery Method Tracking (Uidhinishaji na Utoaji wa Pesa)
    disbursement_method = models.CharField(
        max_length=30, 
        choices=[
            ('CASH', 'Cash (Fedha Taslimu Mkononi)'),
            ('MOBILE_MONEY', 'Mitandao ya Simu (M-Pesa / Tigo Pesa / Airtel Money)'),
            ('BANK_TRANSFER', 'Akaunti ya Benki (NMB / CRDB / NBC / Equity)')
        ], 
        default='MOBILE_MONEY',
        help_text="Njia ya Utoaji wa Fedha"
    )
    disbursement_provider = models.CharField(max_length=50, blank=True, null=True, help_text="Mtandao wa Simu au Jina la Benki")
    disbursement_account_no = models.CharField(max_length=50, blank=True, null=True, help_text="Namba ya Simu au Akaunti ya Benki")
    disbursed_by_staff_name = models.CharField(max_length=150, blank=True, null=True, help_text="Jina la Mtumishi aliyekabidhi Cash")
    disbursed_by_staff_role = models.CharField(max_length=100, blank=True, null=True, help_text="Cheo cha Mtumishi")
    disbursed_branch_name = models.CharField(max_length=150, blank=True, null=True, help_text="Tawi ambapo fedha zimekabidhiwa")

    disbursed_at = models.DateTimeField(null=True, blank=True)

    # Loan Officer Tracking Field
    created_by_officer_id = models.IntegerField(blank=True, null=True)
    created_by_officer_name = models.CharField(max_length=150, blank=True, null=True)

    # Branch Approval Stage Audit
    branch_reviewed_by = models.CharField(max_length=150, blank=True, null=True, help_text="Jina la Meneja wa Tawi aliyeidhinisha")
    branch_reviewed_at = models.DateTimeField(null=True, blank=True)
    branch_review_notes = models.TextField(blank=True, null=True, help_text="Maelezo ya Meneja wa Tawi (Branch Approval Notes)")
    branch_review_decision = models.CharField(max_length=20, blank=True, null=True, help_text="APPROVED / REJECTED")

    # Risk Review Stage Audit
    risk_reviewed_by = models.CharField(max_length=150, blank=True, null=True, help_text="Jina la Afisa wa Tathmini ya Hatari")
    risk_reviewed_at = models.DateTimeField(null=True, blank=True)
    risk_review_notes = models.TextField(blank=True, null=True, help_text="Maelezo ya Tathmini ya Hatari (Risk Review Notes)")
    risk_review_decision = models.CharField(max_length=20, blank=True, null=True, help_text="PASSED / FAILED")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fkf_ems_loans'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        from decimal import Decimal
        if self.principal_amount is not None and self.interest_rate_pct is not None:
            p = Decimal(str(self.principal_amount))
            r = Decimal(str(self.interest_rate_pct))
            self.interest_amount = p * (r / Decimal('100'))
            expected_total = p + self.interest_amount
            
            # Recalculate balance remaining taking into account any existing repayments
            repayments_total = Decimal('0')
            if self.pk:
                from django.db.models import Sum
                repaid = self.repayments.aggregate(Sum('amount_paid'))['amount_paid__sum']
                if repaid:
                    repayments_total = Decimal(str(repaid))
            
            self.total_payable = expected_total
            self.balance_remaining = max(Decimal('0'), expected_total - repayments_total)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Loan #{self.id} - {self.borrower.first_name} ({self.status})"


class Repayment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('MPESA_TZ', 'Vodacom M-Pesa (Tanzania)'),
        ('TIGO_PESA', 'Tigo Pesa (Tanzania)'),
        ('AIRTEL_MONEY', 'Airtel Money (Tanzania)'),
        ('HALOPESA', 'HaloPesa (Tanzania)'),
        ('BANK_NMB', 'NMB Bank Account Transfer'),
        ('BANK_CRDB', 'CRDB Bank Account Transfer'),
        ('CASH_BRANCH', 'Cash Counter Payment at Branch'),
    ]

    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='repayments')
    amount_paid = models.DecimalField(max_digits=14, decimal_places=2)
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHOD_CHOICES, default='MPESA_TZ')
    reference_number = models.CharField(max_length=50, unique=True)
    payment_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fkf_ems_repayments'
        ordering = ['-payment_date']


class LoanComment(models.Model):
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='comments')
    author_name = models.CharField(max_length=150)
    author_role = models.CharField(max_length=100, default='Loan Officer')
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fkf_ems_loan_comments'
        ordering = ['created_at']

    def __str__(self):
        return f"Comment on Loan #{self.loan.id} by {self.author_name} ({self.author_role})"

