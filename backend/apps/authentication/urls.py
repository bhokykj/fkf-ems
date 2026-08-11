from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView, VerifyOTPView, ForgotPasswordSendOTPView, ForgotPasswordResetPasswordView,
    CurrentUserView, StaffListView, CreateStaffView, ResetPasswordView, TransferStaffView,
    EditStaffView, DeleteStaffView, UpdateStaffPayrollView, FieldExpenseViewSet, SendResetPasscodeSMSView,
    JobVacancyViewSet, JobApplicationViewSet, ApplicantRegisterView
)

router = DefaultRouter()
router.register(r'field-expenses', FieldExpenseViewSet, basename='field-expense')
router.register(r'vacancies', JobVacancyViewSet, basename='job-vacancy')
router.register(r'job-applications', JobApplicationViewSet, basename='job-application')

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('applicant_register/', ApplicantRegisterView.as_view(), name='applicant-register'),
    path('verify_otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('forgot_password/send_otp/', ForgotPasswordSendOTPView.as_view(), name='forgot-password-send-otp'),
    path('forgot_password/reset/', ForgotPasswordResetPasswordView.as_view(), name='forgot-password-reset'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('staff/', StaffListView.as_view(), name='staff-list'),
    path('demo-users/', StaffListView.as_view(), name='demo-users-list'),
    path('create_staff/', CreateStaffView.as_view(), name='create-staff'),
    path('reset_password/', ResetPasswordView.as_view(), name='reset-password'),
    path('send_reset_sms/', SendResetPasscodeSMSView.as_view(), name='send-reset-sms'),
    path('transfer_staff/', TransferStaffView.as_view(), name='transfer-staff'),
    path('staff/<int:pk>/edit/', EditStaffView.as_view(), name='edit-staff'),
    path('staff/<int:pk>/delete/', DeleteStaffView.as_view(), name='delete-staff'),
    path('staff/<int:pk>/payroll/', UpdateStaffPayrollView.as_view(), name='update-staff-payroll'),
    path('', include(router.urls)),
]
