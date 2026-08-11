import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fkf_ems.settings')
django.setup()

from datetime import date, timedelta
from decimal import Decimal
from apps.branches.models import Branch
from apps.authentication.models import User
from apps.loans.models import Borrower, Loan, Repayment
from apps.collateral.models import Collateral
from apps.analytics.models import FinancialLog
from apps.crb.models import CRBCheck

def run_seed():
    print("=== Seeding FKF Micro-Credit Tanzania Enterprise Database ===")

    # 1. Clear existing
    CRBCheck.objects.all().delete()
    FinancialLog.objects.all().delete()
    Collateral.objects.all().delete()
    Repayment.objects.all().delete()
    Loan.objects.all().delete()
    Borrower.objects.all().delete()
    User.objects.all().delete()
    Branch.objects.all().delete()

    # 2. Tanzania Operational Branches
    b_dar = Branch.objects.create(
        code="BR-DAR-01",
        name="Dar es Salaam HQ",
        location="Victoria / Kariakoo, Dar es Salaam",
        max_loan_amount=Decimal('15000000.00'),
        interest_rate_pct=Decimal('14.00'),
        penalty_type='PERCENTAGE',
        penalty_value=Decimal('5.00'),
        require_collateral=True,
        collateral_min_ltv_pct=Decimal('75.00')
    )

    b_arusha = Branch.objects.create(
        code="BR-ARS-02",
        name="Arusha Northern Branch",
        location="Clock Tower / Arusha CBD",
        max_loan_amount=Decimal('8000000.00'),
        interest_rate_pct=Decimal('15.00'),
        penalty_type='FLAT',
        penalty_value=Decimal('25000.00'),
        require_collateral=True,
        collateral_min_ltv_pct=Decimal('70.00')
    )

    b_mwanza = Branch.objects.create(
        code="BR-MWZ-03",
        name="Mwanza Lake Region",
        location="Nyamagana, Mwanza",
        max_loan_amount=Decimal('6000000.00'),
        interest_rate_pct=Decimal('15.50'),
        penalty_type='PERCENTAGE',
        penalty_value=Decimal('4.50'),
        require_collateral=True,
        collateral_min_ltv_pct=Decimal('65.00')
    )

    b_dodoma = Branch.objects.create(
        code="BR-DOM-04",
        name="Dodoma Capital Branch",
        location="Area D, Dodoma CBD",
        max_loan_amount=Decimal('4500000.00'),
        interest_rate_pct=Decimal('15.00'),
        penalty_type='FLAT',
        penalty_value=Decimal('15000.00'),
        require_collateral=True,
        collateral_min_ltv_pct=Decimal('70.00')
    )

    b_mbeya = Branch.objects.create(
        code="BR-MBY-05",
        name="Mbeya Southern Highlands",
        location="Mwanjelwa, Mbeya",
        max_loan_amount=Decimal('3500000.00'),
        interest_rate_pct=Decimal('16.00'),
        penalty_type='PERCENTAGE',
        penalty_value=Decimal('4.00'),
        require_collateral=True,
        collateral_min_ltv_pct=Decimal('65.00')
    )

    print("  [OK] Created 5 Tanzania operational branches.")

    # 3. Tanzania Users
    u_admin = User.objects.create_superuser(
        username="admin",
        email="admin@fkf-microcredit.co.tz",
        password="password123",
        first_name="Super",
        last_name="Admin",
        role="SUPER_ADMIN",
        employee_id="EMP-HQ-001"
    )

    u_mgr_dar = User.objects.create_user(
        username="mgr_nairobi",
        email="dar.mgr@fkf-microcredit.co.tz",
        password="password123",
        first_name="Juma",
        last_name="Mkwawa",
        role="BRANCH_MANAGER",
        branch=b_dar,
        employee_id="EMP-DAR-101"
    )

    u_mgr_ars = User.objects.create_user(
        username="mgr_mombasa",
        email="arusha.mgr@fkf-microcredit.co.tz",
        password="password123",
        first_name="Rehema",
        last_name="Massawe",
        role="BRANCH_MANAGER",
        branch=b_arusha,
        employee_id="EMP-ARS-201"
    )

    u_officer_dar = User.objects.create_user(
        username="officer_nairobi",
        email="officer.dar@fkf-microcredit.co.tz",
        password="password123",
        first_name="Baraka",
        last_name="Mollel",
        role="LOAN_OFFICER",
        branch=b_dar,
        employee_id="EMP-DAR-105"
    )

    u_risk_dar = User.objects.create_user(
        username="risk_nairobi",
        email="risk.dar@fkf-microcredit.co.tz",
        password="password123",
        first_name="Neema",
        last_name="Msuya",
        role="RISK_OFFICER",
        branch=b_dar,
        employee_id="EMP-DAR-109"
    )

    print("  [OK] Created Tanzania staff users across roles.")

    # 4. Tanzania Borrowers with Passport Photos
    bw1 = Borrower.objects.create(
        first_name="Godfrey", last_name="Mushi", id_number="19880512-11105-00001-19", phone="+255754123456",
        email="godfrey.mushi@gmail.com", address="Victoria, Dar es Salaam", branch=b_dar,
        employment_status="SALARIED", monthly_income=Decimal('2800000.00'), credit_rating="EXCELLENT",
        photo_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    )
    bw2 = Borrower.objects.create(
        first_name="Halima", last_name="Rashid", id_number="19920314-21109-00002-44", phone="+255784987654",
        email="halima.r@outlook.com", address="Njiro, Arusha", branch=b_arusha,
        employment_status="SELF_EMPLOYED", monthly_income=Decimal('3500000.00'), credit_rating="GOOD",
        photo_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    )
    bw3 = Borrower.objects.create(
        first_name="Joseph", last_name="Mwita", id_number="19851120-31102-00003-88", phone="+255767456789",
        email="joseph.mwita@yahoo.com", address="Capripoint, Mwanza", branch=b_mwanza,
        employment_status="CIVIL_SERVANT", monthly_income=Decimal('1600000.00'), credit_rating="GOOD",
        photo_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    )
    bw4 = Borrower.objects.create(
        first_name="Rashid", last_name="Kikwete", id_number="19950708-41101-00004-12", phone="+255715234567",
        email="rashid.kikwete@gmail.com", address="Kisasa, Dodoma", branch=b_dodoma,
        employment_status="CONTRACTOR", monthly_income=Decimal('1200000.00'), credit_rating="POOR / HIGH RISK",
        photo_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
    )

    print("  [OK] Created 4 Tanzania borrowers with NIDA IDs & Passport Photos.")

    # 5. Tanzania Loans (TSH)
    today = date.today()
    
    l1 = Loan.objects.create(
        loan_number="LN-TZ-2026-1001", borrower=bw1, branch=b_dar, officer=u_officer_dar,
        principal_amount=Decimal('8500000.00'), interest_rate_pct=Decimal('14.00'), term_months=12,
        penalty_type='PERCENTAGE', penalty_value=Decimal('5.00'), status='DISBURSED',
        risk_score=88, risk_grade='LOW', disbursed_at=today - timedelta(days=120),
        due_date=today + timedelta(days=245), total_interest=Decimal('1190000.00'),
        total_payable=Decimal('9690000.00'), balance_remaining=Decimal('5200000.00')
    )

    l2 = Loan.objects.create(
        loan_number="LN-TZ-2026-1002", borrower=bw2, branch=b_arusha, officer=u_mgr_ars,
        principal_amount=Decimal('5000000.00'), interest_rate_pct=Decimal('15.00'), term_months=6,
        penalty_type='FLAT', penalty_value=Decimal('25000.00'), status='DISBURSED',
        risk_score=76, risk_grade='LOW', disbursed_at=today - timedelta(days=60),
        due_date=today + timedelta(days=120), total_interest=Decimal('375000.00'),
        total_payable=Decimal('5375000.00'), balance_remaining=Decimal('2875000.00')
    )

    l3 = Loan.objects.create(
        loan_number="LN-TZ-2026-1003", borrower=bw3, branch=b_mwanza, officer=u_admin,
        principal_amount=Decimal('3000000.00'), interest_rate_pct=Decimal('15.50'), term_months=6,
        penalty_type='PERCENTAGE', penalty_value=Decimal('4.50'), status='CLOSED',
        risk_score=82, risk_grade='LOW', disbursed_at=today - timedelta(days=180),
        due_date=today - timedelta(days=10), total_interest=Decimal('232500.00'),
        total_payable=Decimal('3232500.00'), balance_remaining=Decimal('0.00')
    )

    l4 = Loan.objects.create(
        loan_number="LN-TZ-2026-1004", borrower=bw4, branch=b_dodoma, officer=u_admin,
        principal_amount=Decimal('3500000.00'), interest_rate_pct=Decimal('15.00'), term_months=12,
        penalty_type='FLAT', penalty_value=Decimal('15000.00'), status='DEFAULTED',
        risk_score=38, risk_grade='CRITICAL', disbursed_at=today - timedelta(days=210),
        due_date=today - timedelta(days=30), total_interest=Decimal('525000.00'),
        total_payable=Decimal('4025000.00'), balance_remaining=Decimal('3800000.00')
    )

    l5 = Loan.objects.create(
        loan_number="LN-TZ-2026-1005", borrower=bw1, branch=b_dar, officer=u_officer_dar,
        principal_amount=Decimal('6000000.00'), interest_rate_pct=Decimal('14.00'), term_months=12,
        penalty_type='PERCENTAGE', penalty_value=Decimal('5.00'), status='PENDING_BRANCH_APPROVAL',
        risk_score=79, risk_grade='LOW', disbursed_at=None,
        due_date=None, total_interest=Decimal('840000.00'),
        total_payable=Decimal('6840000.00'), balance_remaining=Decimal('6840000.00')
    )

    print("  [OK] Created 5 representative loans in TSH.")

    # 6. Repayments
    Repayment.objects.create(
        loan=l1, amount_paid=Decimal('2245000.00'), principal_paid=Decimal('1950000.00'),
        interest_paid=Decimal('295000.00'), penalty_paid=Decimal('0.00'), payment_method='MPESA_TZ',
        reference_number='TZM9841029', recorded_by=u_officer_dar
    )
    Repayment.objects.create(
        loan=l1, amount_paid=Decimal('2245000.00'), principal_paid=Decimal('1950000.00'),
        interest_paid=Decimal('295000.00'), penalty_paid=Decimal('0.00'), payment_method='BANK_TRANSFER',
        reference_number='CRDB8472910', recorded_by=u_officer_dar
    )
    Repayment.objects.create(
        loan=l2, amount_paid=Decimal('2500000.00'), principal_paid=Decimal('2250000.00'),
        interest_paid=Decimal('250000.00'), penalty_paid=Decimal('0.00'), payment_method='TIGO_PESA',
        reference_number='TGO1102948', recorded_by=u_mgr_ars
    )
    Repayment.objects.create(
        loan=l3, amount_paid=Decimal('3232500.00'), principal_paid=Decimal('3000000.00'),
        interest_paid=Decimal('232500.00'), penalty_paid=Decimal('0.00'), payment_method='BANK_TRANSFER',
        reference_number='NMB-CHQ-009418', recorded_by=u_admin
    )

    print("  [OK] Created Tanzania repayment audit records.")

    # 7. Collaterals & Expiry Alerts
    Collateral.objects.create(
        loan=l1, borrower=bw1, collateral_type='VEHICLE',
        title_deed_or_reg_number='T 894 DZA (Toyota Land Cruiser V8)',
        description='2022 Toyota Land Cruiser V8. Original Kadi ya Gari lodged at Dar HQ.',
        estimated_market_value=Decimal('45000000.00'), forced_sale_value=Decimal('34000000.00'),
        insurance_policy_number='JUBILEE-TZ-948102',
        insurance_expiry_date=today + timedelta(days=14),
        valuation_expiry_date=today + timedelta(days=200),
        verification_status='VERIFIED',
        document_url='/uploads/kadi/T894DZA_kadi.pdf'
    )

    Collateral.objects.create(
        loan=l2, borrower=bw2, collateral_type='LAND_TITLE',
        title_deed_or_reg_number='HATI-ARS/NJIRO/4921',
        description='0.75 Acre Commercial Plot in Njiro, Arusha.',
        estimated_market_value=Decimal('35000000.00'), forced_sale_value=Decimal('25000000.00'),
        insurance_policy_number='ALLIANZ-TZ-8472',
        insurance_expiry_date=today - timedelta(days=5),
        valuation_expiry_date=today + timedelta(days=90),
        verification_status='EXPIRED',
        document_url='/uploads/hati/ARS_NJIRO_4921.pdf'
    )

    Collateral.objects.create(
        loan=l4, borrower=bw4, collateral_type='COMMERCIAL_PROPERTY',
        title_deed_or_reg_number='HATI-DOM/BLK-12/99',
        description='Commercial Storefront along Kisasa Rd, Dodoma.',
        estimated_market_value=Decimal('5000000.00'), forced_sale_value=Decimal('3500000.00'),
        insurance_policy_number='HERITAGE-TZ-1092',
        insurance_expiry_date=today + timedelta(days=5),
        valuation_expiry_date=today - timedelta(days=12),
        verification_status='FLAGGED',
        document_url='/uploads/hati/DOM_BLK_99.pdf'
    )

    print("  [OK] Created Tanzania Collaterals & insurance expiry alert triggers.")

    # 8. Financial Logs
    FinancialLog.objects.create(
        branch=b_dar, log_type='REVENUE_INTEREST', amount=Decimal('1190000.00'),
        transaction_date=today - timedelta(days=60), loan=l1, description="Interest Income Recognized LN-TZ-2026-1001"
    )
    FinancialLog.objects.create(
        branch=b_dar, log_type='REVENUE_FEE', amount=Decimal('127500.00'),
        transaction_date=today - timedelta(days=120), loan=l1, description="Processing Fee LN-TZ-2026-1001"
    )
    FinancialLog.objects.create(
        branch=b_dar, log_type='REVENUE_PENALTY', amount=Decimal('45000.00'),
        transaction_date=today - timedelta(days=30), loan=l1, description="Late Payment Penalty Collected"
    )

    FinancialLog.objects.create(
        branch=b_arusha, log_type='REVENUE_INTEREST', amount=Decimal('375000.00'),
        transaction_date=today - timedelta(days=45), loan=l2, description="Interest Income LN-TZ-2026-1002"
    )
    FinancialLog.objects.create(
        branch=b_arusha, log_type='REVENUE_FEE', amount=Decimal('75000.00'),
        transaction_date=today - timedelta(days=60), loan=l2, description="Application Fee LN-TZ-2026-1002"
    )

    FinancialLog.objects.create(
        branch=b_mwanza, log_type='REVENUE_INTEREST', amount=Decimal('232500.00'),
        transaction_date=today - timedelta(days=15), loan=l3, description="Full Interest Realized LN-TZ-2026-1003"
    )

    FinancialLog.objects.create(
        branch=b_dodoma, log_type='REVENUE_FEE', amount=Decimal('52500.00'),
        transaction_date=today - timedelta(days=210), loan=l4, description="Origination Fee LN-TZ-2026-1004"
    )
    FinancialLog.objects.create(
        branch=b_dodoma, log_type='LOSS_BAD_DEBT', amount=Decimal('3800000.00'),
        transaction_date=today - timedelta(days=30), loan=l4, description="Defaulted NPL Write-Off LN-TZ-2026-1004"
    )

    print("  [OK] Created Profit & Loss Financial Logs in TSH.")

    # 9. CRB Checks
    CRBCheck.objects.create(
        borrower=bw1, provider='CREDITINFO', credit_score=820, status='CLEARED',
        delinquent_accounts_count=0, total_delinquent_amount=Decimal('0.00'),
        summary="Borrower has clean credit profile across all Tanzania financial institutions.",
        request_payload='{"national_nida_id": "19880512-11105-00001-19", "provider": "CREDITINFO_TZ"}',
        response_payload='{"cip_score": 820, "cleared_status": "CLEARED"}'
    )
    CRBCheck.objects.create(
        borrower=bw4, provider='METROPOL', credit_score=420, status='BLACKLISTED',
        delinquent_accounts_count=3, total_delinquent_amount=Decimal('2850000.00'),
        summary="High risk defaulter with 3 non-performing digital & bank micro-loans in Tanzania.",
        request_payload='{"id_number": "19950708-41101-00004-12", "report_type": 2}',
        response_payload='{"score": 420, "delinquency_code": "RED", "has_clearance_certificate": false}'
    )

    print("  [OK] Created CRB Tanzania checks.")
    print("=== Database seeding completed successfully ===")

if __name__ == '__main__':
    run_seed()
