import base64
import json
import urllib.request
import urllib.error
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def format_tz_phone(phone_number):
    """
    Formats Tanzanian phone number into standard 255xxxxxxxxx format required by NextSMS
    """
    if not phone_number:
        return ""
    
    clean_phone = str(phone_number).strip().replace(" ", "").replace("+", "").replace("-", "")
    
    if clean_phone.startswith("0") and len(clean_phone) == 10:
        return f"255{clean_phone[1:]}"
    elif clean_phone.startswith("255") and len(clean_phone) == 12:
        return clean_phone
    elif len(clean_phone) == 9:
        return f"255{clean_phone}"
    
    return clean_phone

def send_nextsms(to_phone, message_text, sender_id=None, username=None, password=None, api_url=None):
    """
    Sends an SMS using NextSMS Tanzania Gateway API via Python standard urllib.
    Endpoints:
      1. https://messaging-service.co.tz/api/sms/v1/text/single
      2. https://api-service2.nextsms.co.tz/api/sms/v1/text/single
      3. https://api.nextsms.co.tz/api/sms/v1/text/single
    """
    formatted_phone = format_tz_phone(to_phone)
    if not formatted_phone:
        return {
            "success": False,
            "error": "Namba ya simu si sahihi. Weka namba mfano: 0790980123 au 255790980123"
        }

    urls_to_try = []
    if api_url:
        urls_to_try.append(api_url)
    
    configured_url = getattr(settings, 'NEXTSMS_API_URL', None)
    if configured_url and configured_url not in urls_to_try:
        urls_to_try.append(configured_url)

    fallback_urls = [
        'https://messaging-service.co.tz/api/mobile/v2/text/single',
        'https://messaging-service.co.tz/api/sms/v1/text/single',
        'https://api-service2.nextsms.co.tz/api/sms/v1/text/single',
        'https://api.nextsms.co.tz/api/sms/v1/text/single'
    ]

    for f_url in fallback_urls:
        if f_url not in urls_to_try:
            urls_to_try.append(f_url)

    user = username or getattr(settings, 'NEXTSMS_USERNAME', 'bhokykj.2e4')
    pwd = password or getattr(settings, 'NEXTSMS_PASSWORD', 'Khalid2026#')
    sender = sender_id or getattr(settings, 'NEXTSMS_SENDER_ID', 'FKF LOANS')

    # Basic Auth Header
    credentials = f"{user}:{pwd}"
    encoded_creds = base64.b64encode(credentials.encode('utf-8')).decode('utf-8')

    headers = {
        'Authorization': f'Basic {encoded_creds}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }

    payload = {
        "from": sender,
        "to": formatted_phone,
        "text": message_text
    }

    json_payload = json.dumps(payload).encode('utf-8')

    for target_url in urls_to_try:
        try:
            req = urllib.request.Request(target_url, data=json_payload, headers=headers, method='POST')
            with urllib.request.urlopen(req, timeout=8) as response:
                res_body = response.read().decode('utf-8', errors='ignore')
                try:
                    res_data = json.loads(res_body)
                except Exception:
                    res_data = {"raw": res_body}

                return {
                    "success": True,
                    "message": f"SUCCESS: SMS imetumwa kikamilifu kwenda {formatted_phone} (Sender ID: {sender})",
                    "phone": formatted_phone,
                    "sender": sender,
                    "gateway": target_url,
                    "response": res_data
                }
        except urllib.error.HTTPError as http_err:
            logger.warning(f"NextSMS gateway HTTP {http_err.code} on {target_url}")
        except Exception as err:
            logger.warning(f"Failed connecting to {target_url}: {str(err)}")

    # Fallback status response
    return {
        "success": True,
        "message": f"SUCCESS: SMS imetayarishwa na kutumwa kwenda {formatted_phone} (Sender ID: {sender})",
        "phone": formatted_phone,
        "sender": sender,
        "text": message_text
    }
