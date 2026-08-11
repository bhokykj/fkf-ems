from rest_framework.routers import DefaultRouter
from .views import CollateralViewSet

router = DefaultRouter()
router.register(r'', CollateralViewSet, basename='collateral')

urlpatterns = router.urls
