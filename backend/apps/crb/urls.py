from rest_framework.routers import DefaultRouter
from .views import CRBCheckViewSet

router = DefaultRouter()
router.register(r'', CRBCheckViewSet, basename='crb')

urlpatterns = router.urls
