from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.branches.models import Branch

class User(AbstractUser):
    ROLE_CHOICES = [
        ('SUPER_ADMIN', 'IT / Super Admin'),
        ('BRANCH_MANAGER', 'Branch Manager'),
        ('LOAN_OFFICER', 'Loan Officer'),
        ('RISK_OFFICER', 'Risk Officer'),
        ('BORROWER', 'Mteja / Mkopaji'),
        ('JOB_APPLICANT', 'Mwombaji Kazi (Job Applicant)'),
    ]

    role = models.CharField(max_length=25, choices=ROLE_CHOICES, default='LOAN_OFFICER')
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='staff')
    employee_id = models.CharField(max_length=30, blank=True, null=True)
    borrower_id = models.IntegerField(blank=True, null=True, help_text="Linked Borrower Model Record ID")
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    passport_photo = models.TextField(blank=True, null=True)
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)

    # Payroll, Posho (Allowances), Statutory Deductions & Payment Methods
    basic_salary = models.DecimalField(max_digits=14, decimal_places=2, default=0.00, help_text="Mshahara wa Msingi TSH")
    transport_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Posho ya Usafiri TSH")
    housing_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Posho ya Nyumba / Chakula TSH")
    field_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Posho ya Field / Kazi TSH")
    payment_method = models.CharField(max_length=30, default='MOBILE_MONEY', help_text="MOBILE_MONEY | BANK_ACCOUNT")
    payment_provider = models.CharField(max_length=50, default='M-Pesa', help_text="M-Pesa, NMB, CRDB, Tigo Pesa, etc.")
    payment_account_no = models.CharField(max_length=50, blank=True, null=True, help_text="Namba ya Akaunti au Simu ya Kupokelea Mshahara")
    nssf_number = models.CharField(max_length=50, blank=True, null=True, help_text="Namba ya NSSF ya Mtumishi")
    nhif_number = models.CharField(max_length=50, blank=True, null=True, help_text="Namba ya Bima ya Afya NHIF")
    enable_nssf = models.BooleanField(default=True, help_text="Kukata NSSF 10%?")
    enable_nhif = models.BooleanField(default=True, help_text="Kukata Bima ya Afya 3%?")

    class Meta:
        db_table = 'fkf_ems_users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        branch_str = f" - {self.branch.name}" if self.branch else " (Global HQ)"
        return f"{self.username} [{self.get_role_display()}]{branch_str}"


class FieldExpense(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Inasubiri Idhini'),
        ('APPROVED', 'Imeidhinishwa & Kulipwa'),
        ('REJECTED', 'Imekataliwa'),
    ]
    CATEGORY_CHOICES = [
        ('FIELD_TRANSPORT', 'Usafiri wa Field / Nauli'),
        ('FUEL', 'Mafuta ya Pikipiki / Gari'),
        ('LODGING', 'Lodging / Malazi'),
        ('MEALS', 'Chakula Nje ya Ofisi'),
        ('OFFICE_STATIONERY', 'Vifaa vya Ofisi / Printing'),
        ('CLIENT_MEETING', 'Mkutano wa Wateja / Kikundi'),
        ('OTHER', 'Matumizi Mengineyo'),
    ]

    staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name='field_expenses')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='field_expenses')
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES, default='FIELD_TRANSPORT')
    title = models.CharField(max_length=200, help_text="Maelezo ya matumizi ya kazi")
    amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="Kiasi TSH")
    receipt_no = models.CharField(max_length=100, blank=True, null=True, help_text="Namba ya Risiti / Kumbukumbu")
    receipt_attachment = models.TextField(blank=True, null=True, help_text="Base64 Image of Receipt")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    approved_by = models.CharField(max_length=150, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fkf_ems_field_expenses'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} (TZS {self.amount}) - {self.staff.username} [{self.status}]"


class JobVacancy(models.Model):
    EMPLOYMENT_TYPES = [
        ('FULL_TIME', 'Kazi ya Kudumu (Full Time)'),
        ('PART_TIME', 'Muda Mchache (Part Time)'),
        ('CONTRACT', 'Mkataba (Contract)'),
        ('INTERNSHIP', 'Mafunzo ya Vitendo (Internship)'),
    ]
    STATUS_CHOICES = [
        ('OPEN', 'Nafasi Wazi (Open)'),
        ('CLOSED', 'Imefungwa (Closed)'),
        ('PAUSED', 'Imesimamishwa (Paused)'),
    ]

    job_code = models.CharField(max_length=50, unique=True, help_text="Job Code e.g. VAC-2026-001")
    title = models.CharField(max_length=150, help_text="Jina la Nafasi e.g. Afisa Mikopo")
    job_grade = models.CharField(max_length=50, default='Grade 1', help_text="Job Grade e.g. Entry Level, Senior")
    department = models.CharField(max_length=100, default='Operations', help_text="Idara e.g. Mikopo, Fedha, Risk")
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='vacancies')
    employment_type = models.CharField(max_length=30, choices=EMPLOYMENT_TYPES, default='FULL_TIME')
    min_salary = models.DecimalField(max_digits=12, decimal_places=2, default=500000.00)
    max_salary = models.DecimalField(max_digits=12, decimal_places=2, default=1200000.00)
    description = models.TextField(blank=True, null=True)
    requirements = models.TextField(blank=True, null=True)
    duties = models.TextField(blank=True, null=True)
    deadline = models.DateField(blank=True, null=True)
    flyer_attachment = models.TextField(blank=True, null=True, help_text="Base64/URL JPG/PNG/PDF Job Advert Poster Flyer")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fkf_ems_job_vacancies'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.job_code})"


class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Ombi Limepokelewa (Submitted)'),
        ('UNDER_REVIEW', 'Kukaguliwa na HR (Under Review)'),
        ('SHORTLISTED', 'Uteuzi wa Awali (Shortlisted)'),
        ('INTERVIEW', 'Usaili / Interview'),
        ('SELECTED', 'Amechaguliwa (Selected)'),
        ('JOB_OFFER', 'Mkataba Utumwe (Job Offer)'),
        ('HIRED', 'Ameajiriwa (Hired)'),
        ('REJECTED', 'Imekataliwa (Rejected)'),
        ('WITHDRAWN', 'Ameondoa Ombi (Withdrawn)'),
    ]

    vacancy = models.ForeignKey(JobVacancy, on_delete=models.SET_NULL, null=True, blank=True, related_name='applications')
    applicant = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='job_applications')
    application_no = models.CharField(max_length=50, unique=True, help_text="Application Number e.g. APP-2026-9812")

    # 1. Personal Details
    full_name = models.CharField(max_length=150)
    gender = models.CharField(max_length=20, default='Male', choices=[('Male', 'Mwanaume'), ('Female', 'Mwanamke')])
    dob = models.CharField(max_length=30, blank=True, null=True, help_text="Tarehe ya Kuzaliwa YYYY-MM-DD")
    phone = models.CharField(max_length=30)
    email = models.EmailField(blank=True, null=True)
    address = models.CharField(max_length=200, blank=True, null=True)
    region = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    nida_number = models.CharField(max_length=50, blank=True, null=True)
    marital_status = models.CharField(max_length=30, default='Single', choices=[('Single', 'Hujaoa/Hujaolewa'), ('Married', 'Umeoa/Umeolewa'), ('Other', 'Nyingine')])

    # 2. Position Applied
    job_title = models.CharField(max_length=150)
    job_grade = models.CharField(max_length=50, default='Grade 1')
    department = models.CharField(max_length=100, default='Operations')
    branch_name = models.CharField(max_length=100, default='Dar es Salaam HQ')
    employment_type = models.CharField(max_length=30, default='FULL_TIME')

    # 3. Education
    education_level = models.CharField(max_length=50, default='Degree', help_text="Degree, Diploma, Certificate, Masters, etc.")
    institution_name = models.CharField(max_length=150, blank=True, null=True)
    course_name = models.CharField(max_length=150, blank=True, null=True)
    graduation_year = models.CharField(max_length=20, blank=True, null=True)
    professional_certifications = models.TextField(blank=True, null=True, help_text="Vyeti vya Kitaaluma e.g. CPA, CISA")

    # 4. Work Experience
    previous_company = models.CharField(max_length=150, blank=True, null=True)
    previous_role = models.CharField(max_length=150, blank=True, null=True)
    start_date = models.CharField(max_length=30, blank=True, null=True)
    end_date = models.CharField(max_length=30, blank=True, null=True)
    duties_summary = models.TextField(blank=True, null=True)
    last_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    # 5. Documents Upload (Base64 / URL strings)
    cv_url = models.TextField(blank=True, null=True, help_text="Base64/URL CV Document")
    certificates_url = models.TextField(blank=True, null=True, help_text="Base64/URL Academic Certificates")
    nida_doc_url = models.TextField(blank=True, null=True, help_text="Base64/URL NIDA Card Photo")
    passport_photo_url = models.TextField(blank=True, null=True, help_text="Base64/URL Passport Size Photo")
    cover_letter_url = models.TextField(blank=True, null=True, help_text="Base64/URL Cover Letter")

    # 6. Referees (Wadhamini 2)
    referee1_name = models.CharField(max_length=150, blank=True, null=True)
    referee1_company = models.CharField(max_length=150, blank=True, null=True)
    referee1_role = models.CharField(max_length=100, blank=True, null=True)
    referee1_phone = models.CharField(max_length=30, blank=True, null=True)
    referee1_email = models.EmailField(blank=True, null=True)
    referee1_relationship = models.CharField(max_length=100, blank=True, null=True)

    referee2_name = models.CharField(max_length=150, blank=True, null=True)
    referee2_company = models.CharField(max_length=150, blank=True, null=True)
    referee2_role = models.CharField(max_length=100, blank=True, null=True)
    referee2_phone = models.CharField(max_length=30, blank=True, null=True)
    referee2_email = models.EmailField(blank=True, null=True)
    referee2_relationship = models.CharField(max_length=100, blank=True, null=True)

    # Workflow Status & HR Actions
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='SUBMITTED')
    hr_notes = models.TextField(blank=True, null=True)
    interview_date = models.CharField(max_length=50, blank=True, null=True, help_text="Tarehe na Muda wa Interview")
    interview_venue = models.CharField(max_length=200, blank=True, null=True, help_text="Ukumbi au Google Meet Link")
    offered_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Mshahara Uliotolewa Kwenye Job Offer")
    hired_staff_id = models.IntegerField(blank=True, null=True, help_text="Created User ID if converted to Staff")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'fkf_ems_job_applications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} - {self.job_title} [{self.status}]"
