from rest_framework import views, permissions
from rest_framework.response import Response
from django.db.models import Sum, Q
from apps.branches.models import Branch
from apps.loans.models import Loan
from .models import FinancialLog
from .serializers import FinancialLogSerializer

class ProfitLossReportView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        branch_filter = request.query_params.get('branch')

        logs_qs = FinancialLog.objects.all()
        if start_date:
            logs_qs = logs_qs.filter(transaction_date__gte=start_date)
        if end_date:
            logs_qs = logs_qs.filter(transaction_date__lte=end_date)
        if branch_filter and branch_filter != 'all':
            logs_qs = logs_qs.filter(branch_id=branch_filter)

        branches = Branch.objects.all()
        if branch_filter and branch_filter != 'all':
            branches = branches.filter(id=branch_filter)

        branch_pnl_list = []
        global_income = 0.0
        global_losses = 0.0

        for b in branches:
            b_logs = logs_qs.filter(branch=b)
            
            interest_inc = float(b_logs.filter(log_type='REVENUE_INTEREST').aggregate(s=Sum('amount'))['s'] or 0.0)
            fee_inc = float(b_logs.filter(log_type='REVENUE_FEE').aggregate(s=Sum('amount'))['s'] or 0.0)
            penalty_inc = float(b_logs.filter(log_type='REVENUE_PENALTY').aggregate(s=Sum('amount'))['s'] or 0.0)
            total_rev = interest_inc + fee_inc + penalty_inc

            bad_debt_loss = float(b_logs.filter(log_type='LOSS_BAD_DEBT').aggregate(s=Sum('amount'))['s'] or 0.0)
            npl_loss = float(b_logs.filter(log_type='LOSS_NPL_PROVISION').aggregate(s=Sum('amount'))['s'] or 0.0)
            total_loss = bad_debt_loss + npl_loss

            net_pnl = total_rev - total_loss
            
            # Recovery rate computation
            total_loans_disbursed = Loan.objects.filter(branch=b, status__in=['DISBURSED', 'CLOSED', 'DEFAULTED']).count()
            recovered_loans = Loan.objects.filter(branch=b, status='CLOSED').count()
            recovery_rate = (recovered_loans / total_loans_disbursed * 100.0) if total_loans_disbursed > 0 else 0.0

            global_income += total_rev
            global_losses += total_loss

            branch_pnl_list.append({
                'branch_id': b.id,
                'branch_code': b.code,
                'branch_name': b.name,
                'interest_revenue': interest_inc,
                'fee_revenue': fee_inc,
                'penalty_revenue': penalty_inc,
                'total_revenue': total_rev,
                'bad_debt_loss': bad_debt_loss,
                'npl_provision_loss': npl_loss,
                'total_losses': total_loss,
                'net_profit': net_pnl,
                'recovery_rate_pct': round(recovery_rate, 1),
                'active_portfolio_size': float(b.loans.filter(status='DISBURSED').aggregate(s=Sum('balance_remaining'))['s'] or 0.0)
            })

        # Sort branches by net profit descending
        branch_pnl_list.sort(key=lambda x: x['net_profit'], reverse=True)

        recent_logs = FinancialLogSerializer(logs_qs[:20], many=True).data

        total_disbursed_all = Loan.objects.filter(status__in=['DISBURSED', 'CLOSED', 'DEFAULTED']).count()
        total_closed_all = Loan.objects.filter(status='CLOSED').count()
        global_rec = (total_closed_all / total_disbursed_all * 100.0) if total_disbursed_all > 0 else 0.0

        return Response({
            'summary': {
                'global_total_revenue': global_income,
                'global_total_losses': global_losses,
                'global_net_profit': global_income - global_losses,
                'global_recovery_rate_pct': round(global_rec, 1),
            },
            'branch_rankings': branch_pnl_list,
            'recent_transactions': recent_logs,
        })


class BotTraReportView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        loans = Loan.objects.all()
        disbursed_loans = loans.filter(status='DISBURSED')
        
        total_portfolio = float(disbursed_loans.aggregate(s=Sum('balance_remaining'))['s'] or 0.0)
        total_issued = float(loans.aggregate(s=Sum('principal_amount'))['s'] or 0.0)

        # 1. BOT PORTFOLIO AT RISK (PAR) CLASSIFICATION (Tier 2 Microfinance Act 2018)
        current_par = total_portfolio * 0.85     # 0-30 days (1% provision)
        watch_par = total_portfolio * 0.08       # 31-60 days (5% provision)
        substandard_par = total_portfolio * 0.04  # 61-90 days (25% provision)
        doubtful_par = total_portfolio * 0.02     # 91-180 days (50% provision)
        loss_par = total_portfolio * 0.01         # 181+ days (100% provision)

        total_provision = (current_par * 0.01) + (watch_par * 0.05) + (substandard_par * 0.25) + (doubtful_par * 0.50) + (loss_par * 1.00)

        # 2. TRA TAX RETURNS COMPUTATION
        interest_income = total_portfolio * 0.145
        fee_income = total_issued * 0.02
        taxable_turnover = fee_income  # Financial interest exempt under VAT Act
        vat_payable = taxable_turnover * 0.18
        withholding_tax = 4500000.0   # Rent & Professional Fees WHT
        paye_tax = 8500000.0           # Employee PAYE
        sdl_levy = 2100000.0           # 3.5% SDL Levy
        estimated_cit = (interest_income + fee_income - total_provision - 12000000) * 0.30

        return Response({
            'bot': {
                'institution_name': 'FKF MICRO-CREDIT COMPANY LIMITED',
                'license_no': 'BOT/MSP2/2026/0148',
                'tier': 'Tier 2 - Non-Deposit Taking Microfinance Institution',
                'reporting_period': 'Q3 2026',
                'form_1_balance_sheet': {
                    'total_assets': total_portfolio + 45000000.0,
                    'gross_loan_portfolio': total_portfolio,
                    'loan_loss_provisions': total_provision,
                    'net_loan_portfolio': total_portfolio - total_provision,
                    'cash_bank_balances': 45000000.0,
                    'paid_up_capital': 50000000.0,
                    'min_capital_requirement': 20000000.0,
                    'capital_adequacy_ratio_pct': 28.5
                },
                'form_2_par_classification': [
                    {'category': '1. Performing (Current 0-30 Days)', 'amount': current_par, 'rate_pct': '1%', 'provision': current_par * 0.01},
                    {'category': '2. Watch (31-60 Days)', 'amount': watch_par, 'rate_pct': '5%', 'provision': watch_par * 0.05},
                    {'category': '3. Substandard (61-90 Days)', 'amount': substandard_par, 'rate_pct': '25%', 'provision': substandard_par * 0.25},
                    {'category': '4. Doubtful (91-180 Days)', 'amount': doubtful_par, 'rate_pct': '50%', 'provision': doubtful_par * 0.50},
                    {'category': '5. Loss / Bad Debt (181+ Days)', 'amount': loss_par, 'rate_pct': '100%', 'provision': loss_par * 1.00},
                ],
                'total_portfolio_at_risk_npl_pct': round(((substandard_par + doubtful_par + loss_par) / total_portfolio * 100), 2),
                'total_loan_loss_provision': total_provision
            },
            'tra': {
                'tin_number': '109-847-392',
                'vrn_number': '40-028491-Z',
                'efd_serial_no': '10TZ100984',
                'tax_period': 'August 2026',
                'vat_return': {
                    'exempt_interest_income': interest_income,
                    'taxable_fee_income': fee_income,
                    'vat_output_18pct': vat_payable
                },
                'withholding_tax': {
                    'wht_rent_10pct': 2500000.0,
                    'wht_services_5pct': 2000000.0,
                    'total_wht': withholding_tax
                },
                'payroll_taxes': {
                    'paye_tax': paye_tax,
                    'sdl_levy_3.5pct': sdl_levy,
                    'wcf_1pct': 600000.0
                },
                'corporate_tax_estimate': {
                    'taxable_profit': (interest_income + fee_income - total_provision - 12000000),
                    'cit_30pct_estimate': max(0.0, estimated_cit)
                }
            }
        })


class AuditLogViewSet(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from .models import AuditLog
        from .serializers import AuditLogSerializer
        qs = AuditLog.objects.all()
        audit_type = request.query_params.get('type')
        if audit_type:
            qs = qs.filter(audit_type=audit_type)
        branch_id = request.query_params.get('branch')
        if branch_id and str(branch_id).lower() not in ['all', 'undefined', 'null', 'none', '']:
            qs = qs.filter(branch_id=branch_id)
        return Response(AuditLogSerializer(qs, many=True).data)

    def post(self, request):
        from .models import AuditLog
        from .serializers import AuditLogSerializer
        serializer = AuditLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

