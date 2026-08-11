from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root_view(request):
    return JsonResponse({
        "status": "ONLINE",
        "system": "FKF MICRO-CREDIT CORE ENGINE v2.0",
        "message": "Karibu FKF Micro-Credit API Service",
        "endpoints": {
            "auth": "/api/auth/",
            "branches": "/api/branches/",
            "loans": "/api/loans/",
            "borrowers": "/api/loans/borrowers/",
            "collaterals": "/api/collaterals/",
            "analytics": "/api/analytics/",
            "crb": "/api/crb/",
            "admin": "/admin/"
        }
    })

urlpatterns = [
    path('', api_root_view),
    path('api/', api_root_view),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/branches/', include('apps.branches.urls')),
    path('api/loans/', include('apps.loans.urls')),
    path('api/collaterals/', include('apps.collateral.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/crb/', include('apps.crb.urls')),
]
