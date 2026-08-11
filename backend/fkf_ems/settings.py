import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'fkf-ems-cloud-secure-secret-key-2026-production')

DEBUG = os.environ.get('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['.onrender.com', 'localhost', '127.0.0.1', '0.0.0.0']

CSRF_TRUSTED_ORIGINS = [
    'https://*.onrender.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
]

# NextSMS Tanzania Gateway Configuration
NEXTSMS_USERNAME = os.environ.get('NEXTSMS_USERNAME', 'bhokykj.2e4')
NEXTSMS_PASSWORD = os.environ.get('NEXTSMS_PASSWORD', 'Khalid2026#')
NEXTSMS_SENDER_ID = os.environ.get('NEXTSMS_SENDER_ID', 'FKF LOANS')
NEXTSMS_API_URL = os.environ.get('NEXTSMS_API_URL', 'https://messaging-service.co.tz/api/mobile/v2/text/single')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'corsheaders',
    
    # FKF-EMS System Apps
    'apps.branches',
    'apps.authentication',
    'apps.loans',
    'apps.collateral',
    'apps.analytics',
    'apps.crb',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'fkf_ems.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'fkf_ems.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Custom User Model
AUTH_USER_MODEL = 'authentication.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}

# Increase upload max memory size for Passport Size photos & Base64 images (50MB limit)
DATA_UPLOAD_MAX_MEMORY_SIZE = 52428800
FILE_UPLOAD_MAX_MEMORY_SIZE = 52428800
