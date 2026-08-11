from rest_framework.routers import DefaultRouter
from .views import BorrowerViewSet, LoanProductViewSet, LoanViewSet, RepaymentViewSet

router = DefaultRouter()
router.register(r'borrowers', BorrowerViewSet, basename='borrower')
router.register(r'products', LoanProductViewSet, basename='loanproduct')
router.register(r'repayments', RepaymentViewSet, basename='repayment')
router.register(r'', LoanViewSet, basename='loan')

urlpatterns = router.urls
