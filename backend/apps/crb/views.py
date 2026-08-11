from rest_framework import viewsets, views, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
import json
import random
from django.utils import timezone
from .models import CRBCheck
from .serializers import CRBCheckSerializer
from apps.loans.models import Borrower

class CRBCheckViewSet(viewsets.ModelViewSet):
    queryset = CRBCheck.objects.all()
    serializer_class = CRBCheckSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def execute_check(self, request):
        borrower_id = request.data.get('borrower_id')
        provider = request.data.get('provider', 'CREDITINFO')

        try:
            borrower = Borrower.objects.get(id=borrower_id)
        except Borrower.DoesNotExist:
            return Response({'error': 'Borrower not found'}, status=status.HTTP_404_NOT_FOUND)

        # Generate realistic score based on borrower ID last digit
        seed_score = (int(borrower.id_number[-2:]) * 7) % 500 + 400
        score = max(300, min(850, seed_score))

        if score >= 700:
            crb_status = 'CLEARED'
            delinquent_cnt = 0
            delinquent_amt = 0.0
            summary = "No adverse records found. Borrower credit profile is Excellent."
        elif score >= 580:
            crb_status = 'PERFORMING'
            delinquent_cnt = 0
            delinquent_amt = 0.0
            summary = "Satisfactory repayment history across active mobile & bank loans in Tanzania."
        elif score >= 450:
            crb_status = 'NON_PERFORMING'
            delinquent_cnt = 1
            delinquent_amt = 250000.00
            summary = "1 Non-performing loan account flagged. Late repayment pattern detected."
        else:
            crb_status = 'BLACKLISTED'
            delinquent_cnt = 3
            delinquent_amt = 2850000.00
            summary = "Multiple defaulted accounts reported. High default risk."

        # Construct production-grade payload blueprints for Tanzania
        if provider == 'CREDITINFO':
            request_payload = {
                "header": {
                    "client_id": "FKF_MICRO_CREDIT_TZ_8819",
                    "country": "TANZANIA",
                    "timestamp": timezone.now().isoformat(),
                    "signature": "SHA256_tz8f11c22b..."
                },
                "payload": {
                    "national_nida_id": borrower.id_number,
                    "first_name": borrower.first_name,
                    "last_name": borrower.last_name,
                    "phone": borrower.phone,
                    "inquiry_reason": "LOAN_APPLICATION_EVALUATION"
                }
            }
            response_payload = {
                "status_code": 200,
                "creditinfo_ref": f"CI-TZA-{random.randint(1000000, 9999999)}",
                "cip_score": score,
                "risk_grade": "A+" if score >= 700 else ("B" if score >= 580 else "D"),
                "cleared_status": crb_status,
                "delinquencies": delinquent_cnt,
                "total_default_amount_tsh": delinquent_amt
            }
        else: # METROPOL
            request_payload = {
                "api_key": "METROPOL_TZ_API_LIVE_FKF_KEY",
                "report_type": 2,
                "id_type": "NIDA",
                "id_number": borrower.id_number
            }
            response_payload = {
                "metropol_result_code": "00",
                "delinquency_code": "GREEN" if score >= 600 else "RED",
                "score": score,
                "has_clearance_certificate": score >= 650,
                "summary": summary
            }

        check_obj = CRBCheck.objects.create(
            borrower=borrower,
            provider=provider,
            credit_score=score,
            status=crb_status,
            delinquent_accounts_count=delinquent_cnt,
            total_delinquent_amount=delinquent_amt,
            summary=summary,
            request_payload=json.dumps(request_payload, indent=2),
            response_payload=json.dumps(response_payload, indent=2)
        )

        if score >= 700:
            borrower.credit_rating = 'EXCELLENT'
        elif score >= 580:
            borrower.credit_rating = 'GOOD'
        else:
            borrower.credit_rating = 'POOR / HIGH RISK'
        borrower.save()

        return Response(CRBCheckSerializer(check_obj).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def blueprints(self, request):
        return Response({
            "creditinfo": {
                "provider_name": "Creditinfo Tanzania CRB API v3",
                "base_url": "https://api.creditinfo.co.tz/v3/credit-report",
                "auth_header": "Authorization: Bearer <JWT_OAUTH2_TOKEN>",
                "sample_request_schema": {
                    "national_nida_id": "19920814-11105-00001-12",
                    "inquiry_reason": "LOAN_APPLICATION_EVALUATION"
                },
                "sample_response_schema": {
                    "cip_score": 750,
                    "cleared_status": "CLEARED",
                    "delinquencies": 0
                }
            },
            "metropol": {
                "provider_name": "Metropol CRB Tanzania REST API v2",
                "base_url": "https://api.metropol.co.tz/v2/score",
                "auth_header": "X-Metropol-Api-Key: <LIVE_API_KEY>",
                "sample_request_schema": {
                    "id_number": "19920814-11105-00001-12",
                    "report_type": 2
                },
                "sample_response_schema": {
                    "score": 720,
                    "delinquency_code": "GREEN",
                    "has_clearance_certificate": True
                }
            }
        })
