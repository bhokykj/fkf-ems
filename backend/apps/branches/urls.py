from rest_framework.routers import DefaultRouter
from .views import BranchViewSet, RegionViewSet, DistrictViewSet, WardViewSet, StreetViewSet, BranchCapitalRequestViewSet

router = DefaultRouter()
router.register(r'regions', RegionViewSet, basename='region')
router.register(r'districts', DistrictViewSet, basename='district')
router.register(r'wards', WardViewSet, basename='ward')
router.register(r'streets', StreetViewSet, basename='street')
router.register(r'capital-requests', BranchCapitalRequestViewSet, basename='capital-request')
router.register(r'', BranchViewSet, basename='branch')

urlpatterns = router.urls
