from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import random
from .models import Borrower, LoanProduct, Loan, Repayment, LoanComment
from .serializers import BorrowerSerializer, LoanProductSerializer, LoanSerializer, RepaymentSerializer, LoanCommentSerializer
from apps.analytics.models import FinancialLog

class BorrowerViewSet(viewsets.ModelViewSet):
    queryset = Borrower.objects.all()
    serializer_class = BorrowerSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Borrower.objects.all()
        branch_id = self.request.query_params.get('branch')
        officer_id = self.request.query_params.get('officer_id')
        if branch_id and str(branch_id).lower() not in ['all', 'undefined', 'null', 'none', '']:
            qs = qs.filter(branch_id=branch_id)
        if officer_id and str(officer_id).lower() not in ['all', 'undefined', 'null', 'none', '']:
            qs = qs.filter(created_by_officer_id=officer_id)
        return qs

    def perform_create(self, serializer):
        borrower = serializer.save()
        from apps.authentication.models import User
        from .nextsms_service import send_nextsms

        username = borrower.phone.replace('+', '').strip() if borrower.phone else borrower.id_number
        if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(
                username=username,
                password='123456',
                first_name=borrower.first_name,
                last_name=borrower.last_name,
                email=borrower.email or '',
                role='BORROWER',
                branch=borrower.branch,
                phone_number=borrower.phone,
                borrower_id=borrower.id
            )
        else:
            user = User.objects.get(username=username)
            user.borrower_id = borrower.id
            user.role = 'BORROWER'
            user.save()

        branch_name = borrower.branch.name if borrower.branch else "Head Office"
        reg_msg = f"Ndugu {borrower.first_name} {borrower.last_name}, hongera! Umesajiliwa FKF MICRO-CREDIT ({branch_name}). Username ya kuingia mfomoni: {username}, Password: 123456."
        send_nextsms(to_phone=borrower.phone, message_text=reg_msg)

    @action(detail=True, methods=['post'])
    def verify_kyc(self, request, pk=None):
        borrower = self.get_object()
        kyc_status = request.data.get('kyc_status', 'VERIFIED')
        kyc_notes = request.data.get('kyc_notes', 'Uhakiki wa NIDA na Picha ya Passport umekamilika')
        
        borrower.kyc_status = kyc_status
        borrower.kyc_notes = kyc_notes
        borrower.save()
        return Response(BorrowerSerializer(borrower).data)

    @action(detail=True, methods=['post'])
    def transfer_branch(self, request, pk=None):
        borrower = self.get_object()
        new_branch_id = request.data.get('new_branch_id')
        
        if new_branch_id:
            from apps.branches.models import Branch
            branch_obj = Branch.objects.filter(id=new_branch_id).first()
            if branch_obj:
                borrower.branch = branch_obj
                borrower.save()
                borrower.loans.update(branch=branch_obj)

        return Response(BorrowerSerializer(borrower).data)

    def destroy(self, request, *args, **kwargs):
        borrower = self.get_object()
        user_role = request.data.get('user_role') or getattr(request.user, 'role', '')
        if user_role != 'SUPER_ADMIN':
            return Response({'error': 'Ni IT / Super Admin pekee anayeruhusiwa Kufuta Mkopaji.'}, status=status.HTTP_403_FORBIDDEN)
        
        borrower.loans.all().delete()
        from apps.authentication.models import User
        User.objects.filter(borrower_id=borrower.id).delete()
        borrower.delete()
        return Response({'message': f'Mkopaji {borrower.first_name} {borrower.last_name} ume-futwa kikamilifu.'})


class LoanProductViewSet(viewsets.ModelViewSet):
    queryset = LoanProduct.objects.all()
    serializer_class = LoanProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = LoanProduct.objects.all()
        branch_id = self.request.query_params.get('branch')
        if branch_id and str(branch_id).lower() not in ['all', 'undefined', 'null', 'none', '']:
            qs = qs.filter(branch_id=branch_id)
        return qs


class LoanViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Loan.objects.all()
        branch_id = self.request.query_params.get('branch')
        status_filter = self.request.query_params.get('status')
        officer_id = self.request.query_params.get('officer_id')
        if branch_id and str(branch_id).lower() not in ['all', 'undefined', 'null', 'none', '']:
            qs = qs.filter(branch_id=branch_id)
        if status_filter:
            qs = qs.filter(status=status_filter)
        if officer_id and str(officer_id).lower() not in ['all', 'undefined', 'null', 'none', '']:
            qs = qs.filter(created_by_officer_id=officer_id)
        
        # Self-correct math for legacy loans
        for loan in qs:
            from decimal import Decimal
            p = Decimal(str(loan.principal_amount or 0))
            r = Decimal(str(loan.interest_rate_pct or 0))
            expected_total = p + (p * r / Decimal('100'))
            if loan.total_payable != expected_total:
                loan.save()

        return qs

    def perform_create(self, serializer):
        borrower = serializer.validated_data.get('borrower')
        user = self.request.user
        
        # If user is a borrower, verify they don't have any active/pending loans
        if user.is_authenticated and user.role == 'BORROWER':
            active_loans = Loan.objects.filter(
                borrower=borrower
            ).exclude(
                status__in=['REPAID', 'BRANCH_REJECTED', 'RISK_FAILED', 'REJECTED']
            )
            if active_loans.exists():
                from rest_framework.exceptions import ValidationError
                raise ValidationError("Haiwezekani kuomba mkopo mpya ukiwa na mkopo mwingine unaoendelea kwenye akaunti yako.")

        field_comment = self.request.data.get('field_comment')
        officer_name = self.request.data.get('created_by_officer_name') or 'Afisa Mikopo'
        loan = serializer.save()
        
        FinancialLog.objects.create(
            branch=loan.branch,
            log_type='LOAN_ISSUANCE',
            amount=loan.principal_amount,
            description=f"Maombi ya Mkopo {loan.id} - {loan.borrower.first_name} {loan.borrower.last_name}"
        )

        if field_comment:
            from .models import LoanComment
            LoanComment.objects.create(
                loan=loan,
                author_name=officer_name,
                author_role="Afisa Mikopo (Ukaguzi wa Nyanjani)",
                comment=field_comment
            )

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Hatua 4: Super Admin Makao Makuu idhinisha mkopo kikamilifu → APPROVED"""
        loan = self.get_object()
        user_role = request.data.get('user_role') or getattr(request.user, 'role', '')
        if user_role != 'SUPER_ADMIN':
            return Response({'error': 'Ni Super Admin pekee kutoka Makao Makuu anayeruhusiwa Ku-Approve Mkopo Kikamilifu (Hatua ya 4).'}, status=status.HTTP_403_FORBIDDEN)

        # Allow final approval if it has branch approval or is progressing through workflow
        allowed_statuses = ['BRANCH_APPROVED', 'PENDING_BRANCH_APPROVAL', 'RISK_APPROVED', 'PENDING_RISK_REVIEW']
        if loan.status not in allowed_statuses:
            return Response({'error': f'Mkopo huu uko katika hali ya "{loan.status}" – hauwezi kuidhinishwa tena.'}, status=status.HTTP_400_BAD_REQUEST)

        loan.status = 'APPROVED'
        loan.save()

        LoanComment.objects.create(
            loan=loan,
            author_name='Super Admin (HQ)',
            author_role='Super Admin (Makao Makuu)',
            comment="🏆 HATUA 4 (FINAL APPROVAL): Mkopo umeidhinishwa kikamilifu na Super Admin Makao Makuu. Mkopo uko tayari kutolewa fedha (Disbursement)."
        )

        from .nextsms_service import send_nextsms
        msg = f"Hongera {loan.borrower.first_name}! Mkopo wako wa TZS {float(loan.principal_amount):,.0f} umeidhinishwa kikamilifu na FKF MICRO-CREDIT Makao Makuu (Tawi la {loan.branch.name})."
        send_nextsms(to_phone=loan.borrower.phone, message_text=msg)

        return Response(LoanSerializer(loan).data)

    @action(detail=True, methods=['post'])
    def risk_pass(self, request, pk=None):
        """Hatua 2: Tathmini ya Hatari (Risk Review) Imepita → PENDING_BRANCH_APPROVAL"""
        loan = self.get_object()
        user_role = request.data.get('user_role') or getattr(request.user, 'role', '')
        if user_role not in ['BRANCH_MANAGER', 'SUPER_ADMIN', 'LOAN_OFFICER', 'FIELD_OFFICER']:
            return Response({'error': 'Ni Meneja wa Tawi au Super Admin pekee anayeruhusiwa kufanya Risk Review.'}, status=status.HTTP_403_FORBIDDEN)

        if loan.status not in ['PENDING_RISK_REVIEW']:
            return Response({'error': f'Mkopo huu uko katika hali ya "{loan.status}" – hauhitaji Risk Review tena.'}, status=status.HTTP_400_BAD_REQUEST)

        reviewer_name = request.data.get('reviewer_name') or f"{request.data.get('user_first_name', '')} {request.data.get('user_last_name', '')}".strip() or 'Afisa wa Risk'
        notes = request.data.get('notes', '')

        loan.status = 'PENDING_BRANCH_APPROVAL'
        loan.risk_reviewed_by = reviewer_name
        loan.risk_reviewed_at = timezone.now()
        loan.risk_review_notes = notes
        loan.risk_review_decision = 'PASSED'
        loan.save()

        LoanComment.objects.create(
            loan=loan,
            author_name=reviewer_name,
            author_role='Risk Review Officer',
            comment=f"✅ HATUA 2 (RISK REVIEW – IMEPITA): Mkopo umepita tathmini ya hatari na umewasilishwa kwa Meneja wa Tawi kwa Hatua ya 3 (Branch Approval). {'Maelezo: ' + notes if notes else 'Mkopo hauna hatari kubwa.'}"
        )

        from .nextsms_service import send_nextsms
        msg = f"Habari {loan.borrower.first_name}! Ombi lako la mkopo wa TZS {float(loan.principal_amount):,.0f} limepita Hatua 2 (Tathmini ya Hatari) na liko Hatua 3 (Idhini ya Meneja wa Tawi). FKF MICRO-CREDIT."
        send_nextsms(to_phone=loan.borrower.phone, message_text=msg)

        return Response(LoanSerializer(loan).data)

    @action(detail=True, methods=['post'])
    def risk_fail(self, request, pk=None):
        """Hatua 2: Tathmini ya Hatari (Risk Review) Imeshindwa → RISK_FAILED"""
        loan = self.get_object()
        user_role = request.data.get('user_role') or getattr(request.user, 'role', '')
        if user_role not in ['BRANCH_MANAGER', 'SUPER_ADMIN', 'LOAN_OFFICER', 'FIELD_OFFICER']:
            return Response({'error': 'Ni Meneja wa Tawi au Super Admin pekee anayeruhusiwa kufanya Risk Review.'}, status=status.HTTP_403_FORBIDDEN)

        if loan.status not in ['PENDING_RISK_REVIEW']:
            return Response({'error': f'Mkopo huu uko katika hali ya "{loan.status}" – hauhitaji Risk Review tena.'}, status=status.HTTP_400_BAD_REQUEST)

        reviewer_name = request.data.get('reviewer_name') or f"{request.data.get('user_first_name', '')} {request.data.get('user_last_name', '')}".strip() or 'Afisa wa Risk'
        reason = request.data.get('notes') or request.data.get('reason', 'Mkopo haupiti vigezo vya tathmini ya hatari')

        loan.status = 'RISK_FAILED'
        loan.risk_reviewed_by = reviewer_name
        loan.risk_reviewed_at = timezone.now()
        loan.risk_review_notes = reason
        loan.risk_review_decision = 'FAILED'
        loan.save()

        LoanComment.objects.create(
            loan=loan,
            author_name=reviewer_name,
            author_role='Risk Review Officer',
            comment=f"❌ HATUA 2 (RISK REVIEW – IMESHINDWA): Mkopo haupiti tathmini ya hatari. Sababu: {reason}"
        )

        from .nextsms_service import send_nextsms
        msg = f"Samahani {loan.borrower.first_name}. Ombi lako la mkopo wa TZS {float(loan.principal_amount):,.0f} halikupita Hatua 2 (Tathmini ya Hatari). Wasiliana na tawi lako kwa maelezo zaidi. FKF MICRO-CREDIT."
        send_nextsms(to_phone=loan.borrower.phone, message_text=msg)

        return Response(LoanSerializer(loan).data)

    @action(detail=True, methods=['post'])
    def branch_approve(self, request, pk=None):
        """Hatua 3: Branch Manager idhinisha mkopo baada ya Risk Review → BRANCH_APPROVED → tuma kwa Super Admin Final"""
        loan = self.get_object()
        user_role = request.data.get('user_role') or getattr(request.user, 'role', '')
        if user_role not in ['BRANCH_MANAGER', 'SUPER_ADMIN']:
            return Response({'error': 'Ni Meneja wa Tawi au Super Admin pekee anayeruhusiwa kufanya Branch Approval.'}, status=status.HTTP_403_FORBIDDEN)

        if loan.status not in ['PENDING_BRANCH_APPROVAL', 'RISK_APPROVED']:
            return Response({'error': f'Mkopo huu uko katika hali ya "{loan.status}" – unapaswa kupitia Risk Review kwanza au uko tayari umeidhinishwa.'}, status=status.HTTP_400_BAD_REQUEST)

        reviewer_name = request.data.get('reviewer_name') or f"{request.data.get('user_first_name', '')} {request.data.get('user_last_name', '')}".strip() or 'Meneja wa Tawi'
        notes = request.data.get('notes', '')

        loan.status = 'BRANCH_APPROVED'
        loan.branch_reviewed_by = reviewer_name
        loan.branch_reviewed_at = timezone.now()
        loan.branch_review_notes = notes
        loan.branch_review_decision = 'APPROVED'
        loan.save()

        LoanComment.objects.create(
            loan=loan,
            author_name=reviewer_name,
            author_role='Meneja wa Tawi (Branch Approval)',
            comment=f"✅ HATUA 3 (BRANCH APPROVAL): Mkopo umeidhinishwa na Meneja wa Tawi na umewasilishwa kwa Super Admin Makao Makuu kwa Idhini ya Mwisho (Final Approval). {'Maelezo: ' + notes if notes else 'Mkopo umekamilika na kupitishwa na tawi.'}"
        )

        from .nextsms_service import send_nextsms
        msg = f"Habari {loan.borrower.first_name}! Ombi lako la mkopo wa TZS {float(loan.principal_amount):,.0f} limepitishwa na Meneja wa Tawi ({loan.branch.name}) na limewasilishwa Makao Makuu kwa Hatua ya 4 (Idhini ya Mwisho). FKF MICRO-CREDIT."
        send_nextsms(to_phone=loan.borrower.phone, message_text=msg)

        return Response(LoanSerializer(loan).data)

    @action(detail=True, methods=['post'])
    def branch_reject(self, request, pk=None):
        """Hatua 3: Branch Manager kataa mkopo → BRANCH_REJECTED"""
        loan = self.get_object()
        user_role = request.data.get('user_role') or getattr(request.user, 'role', '')
        if user_role not in ['BRANCH_MANAGER', 'SUPER_ADMIN']:
            return Response({'error': 'Ni Meneja wa Tawi au Super Admin pekee anayeruhusiwa kukataa mkopo.'}, status=status.HTTP_403_FORBIDDEN)

        if loan.status not in ['PENDING_BRANCH_APPROVAL', 'RISK_APPROVED', 'PENDING_RISK_REVIEW']:
            return Response({'error': f'Mkopo huu uko katika hali ya "{loan.status}" – hauwezi kukataliwa tena.'}, status=status.HTTP_400_BAD_REQUEST)

        reviewer_name = request.data.get('reviewer_name') or f"{request.data.get('user_first_name', '')} {request.data.get('user_last_name', '')}".strip() or 'Meneja wa Tawi'
        reason = request.data.get('notes') or request.data.get('reason', 'Sababu haikutolewa')

        loan.status = 'BRANCH_REJECTED'
        loan.branch_reviewed_by = reviewer_name
        loan.branch_reviewed_at = timezone.now()
        loan.branch_review_notes = reason
        loan.branch_review_decision = 'REJECTED'
        loan.save()

        LoanComment.objects.create(
            loan=loan,
            author_name=reviewer_name,
            author_role='Meneja wa Tawi (Branch Rejection)',
            comment=f"❌ HATUA 3 (BRANCH REJECTION): Mkopo umekataliwa na Meneja wa Tawi. Sababu: {reason}"
        )

        from .nextsms_service import send_nextsms
        msg = f"Samahani {loan.borrower.first_name}. Ombi lako la mkopo wa TZS {float(loan.principal_amount):,.0f} limekataliwa na Tawi la {loan.branch.name}. Wasiliana na tawi lako kwa maelezo zaidi. FKF MICRO-CREDIT."
        send_nextsms(to_phone=loan.borrower.phone, message_text=msg)

        return Response(LoanSerializer(loan).data)


    @action(detail=True, methods=['post', 'get'])
    def comments(self, request, pk=None):
        loan = self.get_object()
        if request.method == 'POST':
            comment_text = request.data.get('comment', '').strip()
            author_name = request.data.get('author_name') or request.data.get('user_name') or 'Afisa Mkopo'
            author_role = request.data.get('author_role') or request.data.get('user_role') or 'Loan Officer'
            
            if not comment_text:
                return Response({'error': 'Tafadhali andika maoni yoyote kabla ya kuhifadhi.'}, status=status.HTTP_400_BAD_REQUEST)
                
            comment_obj = LoanComment.objects.create(
                loan=loan,
                author_name=author_name,
                author_role=author_role,
                comment=comment_text
            )
            return Response(LoanCommentSerializer(comment_obj).data, status=status.HTTP_201_CREATED)

        comments_qs = loan.comments.all()
        return Response(LoanCommentSerializer(comments_qs, many=True).data)

    @action(detail=True, methods=['post'])
    def disburse(self, request, pk=None):
        loan = self.get_object()
        loan.status = 'DISBURSED'
        loan.disbursed_at = timezone.now()
        
        loan.disbursement_method = request.data.get('disbursement_method', 'MOBILE_MONEY')
        loan.disbursement_provider = request.data.get('disbursement_provider', 'M-Pesa')
        loan.disbursement_account_no = request.data.get('disbursement_account_no', loan.borrower.phone or '')
        loan.disbursed_by_staff_name = request.data.get('disbursed_by_staff_name', 'Branch Manager')
        loan.disbursed_by_staff_role = request.data.get('disbursed_by_staff_role', 'Branch Management')
        loan.disbursed_branch_name = request.data.get('disbursed_branch_name', loan.branch.name if loan.branch else 'Head Office')
        
        loan.save()

        FinancialLog.objects.create(
            branch=loan.branch,
            log_type='LOAN_DISBURSEMENT',
            amount=loan.principal_amount,
            description=f"Kutoa Mkopo LN-TZ-{loan.id} kwa {loan.borrower.first_name} {loan.borrower.last_name} via {loan.disbursement_method} ({loan.disbursement_provider})"
        )

        # Send NextSMS disbursement confirmation to Borrower
        from .nextsms_service import send_nextsms
        details_txt = f" (Njia: {loan.disbursement_method} - {loan.disbursement_provider} {loan.disbursement_account_no or ''})" if loan.disbursement_method != 'CASH' else f" (Fedha Taslimu tawi la {loan.disbursed_branch_name} kutoka kwa {loan.disbursed_by_staff_name})"
        msg = f"Hongera {loan.borrower.first_name}! Mkopo wako Namba LN-TZ-{loan.id} wa TZS {float(loan.principal_amount):,.0f} umetolewa kikamilifu{details_txt}. FKF MICRO-CREDIT."
        send_nextsms(to_phone=loan.borrower.phone, message_text=msg)

        return Response(LoanSerializer(loan).data)

    @action(detail=True, methods=['post'])
    def flag_default(self, request, pk=None):
        loan = self.get_object()
        loan.status = 'DEFAULTED'
        loan.save()
        return Response(LoanSerializer(loan).data)

    def destroy(self, request, *args, **kwargs):
        loan = self.get_object()
        user_role = request.data.get('user_role') or getattr(request.user, 'role', '')
        if user_role != 'SUPER_ADMIN':
            return Response({'error': 'Ni IT / Super Admin pekee anayeruhusiwa Kufuta Mkopo kabisa.'}, status=status.HTTP_403_FORBIDDEN)
        
        loan.repayments.all().delete()
        loan.delete()
        return Response({'message': f'Mkopo LN-TZ-{loan.id} ume-futwa kabisa kwenye mfumo.'})

    def update(self, request, *args, **kwargs):
        loan = self.get_object()
        user_role = request.data.get('user_role') or getattr(request.user, 'role', '')
        if user_role not in ['SUPER_ADMIN', 'BRANCH_MANAGER']:
            return Response({'error': 'Ni Super Admin au Meneja wa Tawi pekee anayeruhusiwa Ku-Edit Mkopo.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def renew_loan(self, request, pk=None):
        loan = self.get_object()
        interest_paid = Decimal(str(request.data.get('interest_paid', '0')))
        payment_method = request.data.get('payment_method', 'MPESA')
        ref_no = request.data.get('reference_number') or f"RNW-TZ-{random.randint(100000, 999999)}"

        calculated_interest = loan.principal_amount * (loan.interest_rate_pct / Decimal('100'))
        if interest_paid <= Decimal('0.00'):
            interest_paid = calculated_interest

        # Record Interest Repayment
        Repayment.objects.create(
            loan=loan,
            amount_paid=interest_paid,
            payment_method=payment_method,
            reference_number=ref_no
        )

        # Financial Log
        FinancialLog.objects.create(
            branch=loan.branch,
            log_type='REPAYMENT_COLLECTION',
            amount=interest_paid,
            interest_portion=interest_paid,
            principal_portion=Decimal('0.00'),
            description=f"Malipo ya Riba ya Kurenew Mkopo LN-TZ-{loan.id} ({ref_no})"
        )

        # Renew Loan: Add tenure and recalculate total payable
        loan.total_payable = loan.principal_amount + calculated_interest
        loan.balance_remaining = loan.total_payable
        loan.status = 'DISBURSED'
        loan.start_date = timezone.now().date()
        loan.due_date = timezone.now().date() + timedelta(days=int(loan.tenure_months * 30))
        loan.save()

        from .nextsms_service import send_nextsms
        msg = f"Hongera! Mkopo wako LN-TZ-{loan.id} umefanyiwa RENEWAL upya baada ya kulipa Riba ya TZS {float(interest_paid):,.0f}. Salio jipya ni TZS {float(loan.total_payable):,.0f}. FKF MICRO-CREDIT."
        send_nextsms(to_phone=loan.borrower.phone, message_text=msg)

        return Response({
            "message": f"Mkopo LN-TZ-{loan.id} umefanikiwa kurenewiwa upya!",
            "loan": LoanSerializer(loan).data
        })

    @action(detail=False, methods=['post'])
    def send_nextsms(self, request):
        phone = request.data.get('phone')
        message = request.data.get('message')
        sender_id = request.data.get('sender_id')
        username = request.data.get('username')
        password = request.data.get('password')
        api_url = request.data.get('api_url')

        from .nextsms_service import send_nextsms
        result = send_nextsms(
            to_phone=phone,
            message_text=message,
            sender_id=sender_id,
            username=username,
            password=password,
            api_url=api_url
        )
        return Response(result)


class RepaymentViewSet(viewsets.ModelViewSet):
    queryset = Repayment.objects.all()
    serializer_class = RepaymentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Repayment.objects.all()
        branch_id = self.request.query_params.get('branch')
        if branch_id and str(branch_id).lower() not in ['all', 'undefined', 'null', 'none', '']:
            qs = qs.filter(loan__branch_id=branch_id)
        return qs

    def create(self, request, *args, **kwargs):
        loan_id = request.data.get('loan')
        amount_paid = Decimal(str(request.data.get('amount_paid', '0')))
        payment_method = request.data.get('payment_method', 'MPESA')
        ref_no = request.data.get('reference_number') or f"PAY-TZ-{random.randint(100000, 999999)}"

        loan = Loan.objects.get(id=loan_id)
        
        interest_portion = min(amount_paid * Decimal('0.3'), loan.balance_remaining)
        principal_portion = amount_paid - interest_portion

        loan.balance_remaining = max(Decimal('0.00'), loan.balance_remaining - amount_paid)
        if loan.balance_remaining == Decimal('0.00'):
            loan.status = 'REPAID'
        loan.save()

        repayment = Repayment.objects.create(
            loan=loan,
            amount_paid=amount_paid,
            payment_method=payment_method,
            reference_number=ref_no
        )

        FinancialLog.objects.create(
            branch=loan.branch,
            log_type='REPAYMENT_COLLECTION',
            amount=amount_paid,
            interest_portion=interest_portion,
            principal_portion=principal_portion,
            description=f"Rejesho {ref_no} kwa Mkopo {loan.id}"
        )

        # Send NextSMS payment confirmation to Borrower
        from .nextsms_service import send_nextsms
        msg = f"Risiti {ref_no}: Tumepokea rejesho lako la TZS {float(amount_paid):,.0f}. Salio la mkopo wako LN-TZ-{loan.id} ni TZS {float(loan.balance_remaining):,.0f}. FKF MICRO-CREDIT."
        send_nextsms(to_phone=loan.borrower.phone, message_text=msg)

        return Response(RepaymentSerializer(repayment).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        user_role = request.data.get('user_role') or getattr(request.user, 'role', '')
        if user_role != 'SUPER_ADMIN':
            return Response({'error': 'Ni IT / Super Admin pekee anayeruhusiwa Kufuta Rejesho (Delete Payment).'}, status=status.HTTP_403_FORBIDDEN)
        repayment = self.get_object()
        loan = repayment.loan
        loan.balance_remaining += repayment.amount_paid
        loan.save()
        repayment.delete()
        return Response({'message': 'Rejesho limefutwa kikamilifu na salio limerudishwa.'})

    @action(detail=True, methods=['post'])
    def approve_payment(self, request, pk=None):
        user_role = request.data.get('user_role') or getattr(request.user, 'role', '')
        if user_role != 'SUPER_ADMIN':
            return Response({'error': 'Ni IT / Super Admin pekee anayeruhusiwa Kuidhinisha Rejesho (Approve Payment).'}, status=status.HTTP_403_FORBIDDEN)
        repayment = self.get_object()
        repayment.status = 'APPROVED'
        repayment.save()
        return Response(RepaymentSerializer(repayment).data)

    @action(detail=True, methods=['post'])
    def reverse_payment(self, request, pk=None):
        user_role = request.data.get('user_role') or getattr(request.user, 'role', '')
        if user_role != 'SUPER_ADMIN':
            return Response({'error': 'Ni IT / Super Admin pekee anayeruhusiwa Ku-Reverse Rejesho (Reverse Payment).'}, status=status.HTTP_403_FORBIDDEN)
        repayment = self.get_object()
        loan = repayment.loan
        loan.balance_remaining += repayment.amount_paid
        if loan.status == 'REPAID':
            loan.status = 'DISBURSED'
        loan.save()
        repayment.status = 'REVERSED'
        repayment.save()
        return Response({'message': 'Muamala wa Rejesho ume-reversiwa kikamilifu.'})

    @action(detail=True, methods=['post'])
    def waive_penalty(self, request, pk=None):
        user_role = request.data.get('user_role') or getattr(request.user, 'role', '')
        if user_role != 'SUPER_ADMIN':
            return Response({'error': 'Ni IT / Super Admin pekee anayeruhusiwa Kusamehe Faini (Waive Penalty).'}, status=status.HTTP_403_FORBIDDEN)
        repayment = self.get_object()
        repayment.penalty_waived = True
        repayment.save()
        return Response({'message': 'Faini imesamehewa kikamilifu na Super Admin.'})
