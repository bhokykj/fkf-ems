import random
from django.utils import timezone
from rest_framework import status, views, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, FieldExpense, JobVacancy, JobApplication
from .serializers import UserSerializer, FieldExpenseSerializer, JobVacancySerializer, JobApplicationSerializer
from apps.branches.models import Branch
from apps.loans.nextsms_service import send_nextsms

class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Tafadhali ingiza Username na Password.'}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve user from database
        user = User.objects.filter(username=username).first()

        # If default admin missing, bootstrap
        if not user and username in ['admin', 'manager', 'officer']:
            default_role = 'SUPER_ADMIN' if username == 'admin' else ('BRANCH_MANAGER' if username == 'manager' else 'LOAN_OFFICER')
            branch = Branch.objects.first()
            user = User.objects.create_user(
                username=username,
                password=password or 'admin123',
                first_name=username.capitalize(),
                last_name='FKF',
                role=default_role,
                branch=branch,
                phone_number='0790980123'
            )

        direct_login = request.data.get('direct_login', False)

        if not user or not user.check_password(password):
            return Response({'error': 'Jina la mtumiaji (Username) au Password si sahihi.'}, status=status.HTTP_400_BAD_REQUEST)

        # If user selected Direct Login without OTP step
        if direct_login:
            serializer = UserSerializer(user)
            return Response({
                'success': True,
                'token': f'fkf-live-token-{user.id}-{user.role.lower()}',
                'user': serializer.data
            })

        # Generate 6-digit OTP Code
        otp = str(random.randint(100000, 999999))
        user.otp_code = otp
        user.otp_created_at = timezone.now()
        user.save()

        # Target phone number for OTP
        target_phone = user.phone_number or '0790980123'

        # Dispatch OTP Code via NextSMS using Sender ID: FKF CODE
        otp_msg = f"FKF CODE: Code yako ya kuingilia mfumo wa FKF MICRO-CREDIT ni: {otp}. Usitoe code hii kwa mtu yeyote."
        send_nextsms(to_phone=target_phone, message_text=otp_msg, sender_id='FKF CODE')

        # Mask phone number for display
        masked_phone = target_phone[:4] + "****" + target_phone[-2:] if len(target_phone) >= 10 else target_phone

        return Response({
            'success': True,
            'step': 'OTP_REQUIRED',
            'username': user.username,
            'phone': target_phone,
            'masked_phone': masked_phone,
            'sender_id': 'FKF CODE',
            'message': f'Code ya uhakiki imetumwa kwa SMS kwenda {masked_phone} (Sender ID: FKF CODE).'
        })


class VerifyOTPView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        otp_code = request.data.get('otp_code')

        if not username or not otp_code:
            return Response({'error': 'Tafadhali ingiza Code uliyotumiwa kwa SMS.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(username=username).first()
        if not user:
            return Response({'error': 'Akaunti haikupatikana.'}, status=status.HTTP_404_NOT_FOUND)

        # Check OTP match
        if user.otp_code and user.otp_code.strip() == str(otp_code).strip():
            # Clear OTP after successful login
            user.otp_code = None
            user.save()

            serializer = UserSerializer(user)
            return Response({
                'success': True,
                'token': f'fkf-live-token-{user.id}-{user.role.lower()}',
                'user': serializer.data
            })
        
        return Response({'error': 'Code uliyoingiza si sahihi. Angalia SMS kwenye simu yako na ujaribu tena.'}, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordSendOTPView(views.APIView):
    """
    Sends reset OTP via SMS when user clicks "Forgot Password"
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        query = request.data.get('username_or_phone')
        if not query:
            return Response({'error': 'Ingiza Username au Namba ya Simu.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(username=query).first() or User.objects.filter(phone_number=query).first()
        if not user:
            return Response({'error': 'Hakuna akaunti yenye Username au Namba hii ya Simu.'}, status=status.HTTP_404_NOT_FOUND)

        # Generate 6-digit reset OTP
        reset_otp = str(random.randint(100000, 999999))
        user.otp_code = reset_otp
        user.otp_created_at = timezone.now()
        user.save()

        target_phone = user.phone_number or '0790980123'
        sms_msg = f"FKF CODE: Code ya kubadilisha password ya akaunti yako ya FKF MICRO-CREDIT ni: {reset_otp}. Usitoe kwa mtu yeyote."
        send_nextsms(to_phone=target_phone, message_text=sms_msg, sender_id='FKF CODE')

        masked_phone = target_phone[:4] + "****" + target_phone[-2:] if len(target_phone) >= 10 else target_phone

        return Response({
            'success': True,
            'username': user.username,
            'phone': target_phone,
            'masked_phone': masked_phone,
            'sender_id': 'FKF CODE',
            'message': f'Code ya kubadilisha password imetumwa kwa SMS kwenda {masked_phone} (Sender ID: FKF CODE).'
        })


class ForgotPasswordResetPasswordView(views.APIView):
    """
    Resets password using OTP code received via SMS
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        otp_code = request.data.get('otp_code')
        new_password = request.data.get('new_password')

        if not username or not otp_code or not new_password:
            return Response({'error': 'Tafadhali jaza taarifa zote zilizotakiwa.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(username=username).first()
        if not user:
            return Response({'error': 'Akaunti haikupatikana.'}, status=status.HTTP_404_NOT_FOUND)

        if not user.otp_code or user.otp_code.strip() != str(otp_code).strip():
            return Response({'error': 'Code ya SMS si sahihi. Jaribu tena.'}, status=status.HTTP_400_BAD_REQUEST)

        # Update password
        user.set_password(new_password)
        user.otp_code = None
        user.save()

        # Send confirmation SMS
        target_phone = user.phone_number or '0790980123'
        conf_msg = f"FKF LOANS: Password ya akaunti yako ya FKF MICRO-CREDIT imebadilishwa kikamilifu. Sasa unaweza kuingia."
        send_nextsms(to_phone=target_phone, message_text=conf_msg)

        return Response({
            'success': True,
            'message': 'Password yako imebadilishwa kikamilifu! Sasa unaweza kuingia.'
        })


class StaffListView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        qs = User.objects.exclude(role='BORROWER').order_by('-id')
        branch_id = request.query_params.get('branch')
        if branch_id and str(branch_id).lower() not in ['all', 'undefined', 'null', 'none', '']:
            qs = qs.filter(branch_id=branch_id)
        return Response(UserSerializer(qs, many=True).data)


class CurrentUserView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user_id = request.query_params.get('user_id')
        if user_id:
            user = User.objects.filter(id=user_id).first()
        else:
            user = User.objects.first()
        
        if user:
            return Response(UserSerializer(user).data)
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class CreateStaffView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password', '123456')
            first_name = request.data.get('first_name', '')
            last_name = request.data.get('last_name', '')
            email = request.data.get('email', '')
            role = request.data.get('role', 'LOAN_OFFICER')
            branch_id = request.data.get('branch_id') or request.data.get('branch')
            employee_id = request.data.get('employee_id', '')
            phone_number = request.data.get('phone_number', '')
            passport_photo = request.data.get('passport_photo', '')

            if not username:
                return Response({'error': 'Jina la kuingilia (Username) linahitajika.'}, status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(username=username).exists():
                return Response({'error': f'Username "@{username}" imeshazajiliwa tayari. Tumia username nyingine.'}, status=status.HTTP_400_BAD_REQUEST)

            branch = None
            if branch_id:
                branch = Branch.objects.filter(id=branch_id).first()

            user = User.objects.create_user(
                username=username,
                password=password,
                first_name=first_name,
                last_name=last_name,
                email=email,
                role=role,
                branch=branch,
                employee_id=employee_id,
                phone_number=phone_number
            )

            if passport_photo:
                user.passport_photo = passport_photo
                user.save()

            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Hitilafu ya Server wakati wa kusajili: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResetPasswordView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_id = request.data.get('user_id')
        new_password = request.data.get('new_password')
        if not user_id or not new_password:
            return Response({'error': 'user_id and new_password required'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password reset successfully'})


class TransferStaffView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_id = request.data.get('user_id')
        new_branch_id = request.data.get('new_branch_id')
        if not user_id or not new_branch_id:
            return Response({'error': 'user_id and new_branch_id required'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(id=user_id).first()
        branch = Branch.objects.filter(id=new_branch_id).first()
        if not user or not branch:
            return Response({'error': 'User or Branch not found'}, status=status.HTTP_404_NOT_FOUND)
        user.branch = branch
        user.save()
        return Response(UserSerializer(user).data)


class EditStaffView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, pk=None):
        user_role = request.data.get('user_role') or getattr(request.user, 'role', '')
        if user_role != 'SUPER_ADMIN':
            return Response({'error': 'Ni IT / Super Admin pekee anayeruhusiwa Ku-Edit Staff account.'}, status=status.HTTP_403_FORBIDDEN)
        user = User.objects.filter(id=pk).first()
        if not user:
            return Response({'error': 'Mtumishi hakupatikana.'}, status=status.HTTP_404_NOT_FOUND)

        if 'username' in request.data and request.data['username']:
            user.username = request.data['username']
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'email' in request.data:
            user.email = request.data['email']
        if 'phone_number' in request.data:
            user.phone_number = request.data['phone_number']
        if 'role' in request.data:
            user.role = request.data['role']
        if 'branch_id' in request.data:
            b = Branch.objects.filter(id=request.data['branch_id']).first()
            if b:
                user.branch = b
        if 'passport_photo' in request.data:
            user.passport_photo = request.data['passport_photo']
        if 'password' in request.data and request.data['password']:
            user.set_password(request.data['password'])
        
        user.save()
        return Response(UserSerializer(user).data)


class DeleteStaffView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def delete(self, request, pk=None):
        user_role = request.data.get('user_role') or getattr(request.user, 'role', '')
        if user_role != 'SUPER_ADMIN':
            return Response({'error': 'Ni IT / Super Admin pekee anayeruhusiwa Kufuta Mtumishi.'}, status=status.HTTP_403_FORBIDDEN)
        user = User.objects.filter(id=pk).first()
        if not user:
            return Response({'error': 'Mtumishi hakupatikana.'}, status=status.HTTP_404_NOT_FOUND)
        
        if user.is_superuser or user.role == 'SUPER_ADMIN':
            return Response({'error': 'Huwezi kufuta Super Admin mkuu wa mfumo.'}, status=status.HTTP_400_BAD_REQUEST)
            
        user.delete()
        return Response({'message': 'Mtumishi amefutwa kikamilifu.'})


class UpdateStaffPayrollView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, pk=None):
        user = User.objects.filter(id=pk).first()
        if not user:
            return Response({'error': 'Mtumishi hakupatikana.'}, status=status.HTTP_404_NOT_FOUND)

        fields = [
            'basic_salary', 'transport_allowance', 'housing_allowance', 'field_allowance',
            'payment_method', 'payment_provider', 'payment_account_no', 'nssf_number', 'nhif_number',
            'enable_nssf', 'enable_nhif'
        ]
        for f in fields:
            if f in request.data:
                setattr(user, f, request.data[f])
        user.save()
        return Response(UserSerializer(user).data)


class FieldExpenseViewSet(viewsets.ModelViewSet):
    queryset = FieldExpense.objects.all()
    serializer_class = FieldExpenseSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = FieldExpense.objects.all()
        branch_id = self.request.query_params.get('branch')
        if branch_id and str(branch_id).lower() not in ['all', 'undefined', 'null', 'none', '']:
            qs = qs.filter(branch_id=branch_id)
        return qs

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        exp = self.get_object()
        exp.status = 'APPROVED'
        exp.approved_by = request.data.get('approved_by', 'Super Admin')
        exp.save()
        return Response(self.get_serializer(exp).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        exp = self.get_object()
        exp.status = 'REJECTED'
        exp.approved_by = request.data.get('approved_by', 'Super Admin')
        exp.save()
        return Response(self.get_serializer(exp).data)


class SendResetPasscodeSMSView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        target_type = request.data.get('target_type', 'STAFF')
        target_id = request.data.get('target_id')
        passcode = request.data.get('passcode')
        
        if not target_id or not passcode:
            return Response({'error': 'target_id na passcode zinahitajika.'}, status=status.HTTP_400_BAD_REQUEST)

        phone_number = None
        target_name = ""

        if target_type == 'STAFF':
            user = User.objects.filter(id=target_id).first()
            if user:
                phone_number = user.phone_number
                target_name = f"{user.first_name} {user.last_name}".strip() or user.username
        else:
            from apps.loans.models import Borrower
            b = Borrower.objects.filter(id=target_id).first()
            if b:
                phone_number = b.phone
                target_name = f"{b.first_name} {b.last_name}".strip()

        if not phone_number:
            return Response({'error': 'Namba ya simu ya mtumiaji huyu haikupatikana.'}, status=status.HTTP_400_BAD_REQUEST)

        sms_msg = f"FKF CODE: Ndugu {target_name}, Security PIN/Password yako mpya ya mfumo wa FKF MICRO-CREDIT ni: {passcode}. Usitoe kwa mtu yeyote."
        sms_res = send_nextsms(to_phone=phone_number, message_text=sms_msg, sender_id='FKF CODE')

        return Response({
            'success': True,
            'message': f'SMS ya Passcode mpya ({passcode}) imetumwa kwa mafanikio kwenda {phone_number}!',
            'sms_result': sms_res
        })


class JobVacancyViewSet(viewsets.ModelViewSet):
    queryset = JobVacancy.objects.all()
    serializer_class = JobVacancySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = JobVacancy.objects.all()
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs


class ApplicantRegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        full_name = request.data.get('full_name', '')
        phone = request.data.get('phone', '')
        email = request.data.get('email', '')

        if not username or not password:
            return Response({'error': 'Username na Password zinahitajika.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': f'Username "{username}" tayari inatumiwa. Tumia Username nyingine au Ingia.'}, status=status.HTTP_400_BAD_REQUEST)

        names = full_name.strip().split(' ')
        first_name = names[0] if names else ''
        last_name = names[-1] if len(names) > 1 else ''

        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone,
            email=email,
            role='JOB_APPLICANT'
        )

        return Response({
            'success': True,
            'message': f'Akaunti ya Mwombaji ({username}) imesajiliwa kikamilifu! Sasa unaweza kuomba kazi.',
            'user': UserSerializer(user).data
        })


class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = JobApplication.objects.all()
        vacancy_id = self.request.query_params.get('vacancy')
        status_param = self.request.query_params.get('status')
        applicant_id = self.request.query_params.get('applicant_id')

        if vacancy_id:
            qs = qs.filter(vacancy_id=vacancy_id)
        if status_param:
            qs = qs.filter(status=status_param)
        if applicant_id:
            qs = qs.filter(applicant_id=applicant_id)
        return qs

    def perform_create(self, serializer):
        app_no = f"APP-2026-{random.randint(1000, 9999)}"
        applicant_id = self.request.data.get('applicant_id')
        applicant_user = User.objects.filter(id=applicant_id).first() if applicant_id else None

        app = serializer.save(application_no=app_no, applicant=applicant_user, status='SUBMITTED')

        # Send instant NextSMS notification to applicant
        if app.phone:
            from apps.loans.nextsms_service import send_nextsms
            msg = f"Ndugu {app.full_name}, ombi lako la kazi ({app.job_title}) Namba {app_no} limepokelewa FKF MICRO-CREDIT. Tutawasiliana nawe hivi karibuni."
            send_nextsms(to_phone=app.phone, message_text=msg)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        app = self.get_object()
        new_status = request.data.get('status')
        hr_notes = request.data.get('hr_notes', '')
        send_sms = request.data.get('send_sms', True)

        if new_status:
            app.status = new_status
        if hr_notes:
            app.hr_notes = hr_notes
        app.save()

        if send_sms and app.phone:
            from apps.loans.nextsms_service import send_nextsms
            sms_text = f"Ndugu {app.full_name}, hali ya ombi lako la kazi ({app.job_title}) Namba {app.application_no} imebadilishwa kuwa: {app.get_status_display()}. FKF MICRO-CREDIT."
            send_nextsms(to_phone=app.phone, message_text=sms_text)

        return Response(JobApplicationSerializer(app).data)

    @action(detail=True, methods=['post'])
    def schedule_interview(self, request, pk=None):
        app = self.get_object()
        interview_date = request.data.get('interview_date')
        interview_venue = request.data.get('interview_venue', 'Ofisi Kuu ya FKF Micro-Credit / Online')
        
        app.interview_date = interview_date
        app.interview_venue = interview_venue
        app.status = 'INTERVIEW'
        app.save()

        if app.phone:
            from apps.loans.nextsms_service import send_nextsms
            sms_msg = f"Ndugu {app.full_name}, umechaguliwa kufanya usaili (Interview) wa nafasi ya {app.job_title}. Tarehe: {interview_date}, Ukumbi: {interview_venue}. FKF MICRO-CREDIT."
            send_nextsms(to_phone=app.phone, message_text=sms_msg)

        return Response(JobApplicationSerializer(app).data)

    @action(detail=True, methods=['post'])
    def convert_to_employee(self, request, pk=None):
        app = self.get_object()
        role = request.data.get('role', 'LOAN_OFFICER')
        basic_salary = Decimal(str(request.data.get('basic_salary', app.offered_salary or 800000)))
        branch_id = request.data.get('branch_id')

        names = app.full_name.strip().split(' ')
        first_name = names[0]
        last_name = names[-1] if len(names) > 1 else 'Staff'

        # Generate unique username from phone or email or name
        clean_phone = app.phone.replace('+', '').replace(' ', '').strip()
        username = clean_phone if clean_phone else f"staff_{app.id}"

        from apps.branches.models import Branch
        branch_obj = Branch.objects.filter(id=branch_id).first() if branch_id else None

        if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(
                username=username,
                password='123456',
                first_name=first_name,
                last_name=last_name,
                email=app.email or '',
                role=role,
                branch=branch_obj,
                phone_number=app.phone,
                basic_salary=basic_salary,
                employee_id=f"EMP-FKF-{app.id:03d}"
            )
        else:
            user = User.objects.get(username=username)
            user.role = role
            user.basic_salary = basic_salary
            if branch_obj:
                user.branch = branch_obj
            user.save()

        app.status = 'HIRED'
        app.hired_staff_id = user.id
        app.save()

        # Send welcome SMS to new employee
        if app.phone:
            from apps.loans.nextsms_service import send_nextsms
            welcome_msg = f"Hongera sana {app.full_name}! Umesajiliwa rasmi kama Mtumishi FKF MICRO-CREDIT ({role}). Username: {username}, Passcode: 123456."
            send_nextsms(to_phone=app.phone, message_text=welcome_msg)

        return Response({
            'success': True,
            'message': f'Mwombaji {app.full_name} amesajiliwa kikamilifu kama Mtumishi rasmi wa FKF MICRO-CREDIT!',
            'user_id': user.id,
            'application': JobApplicationSerializer(app).data
        })
