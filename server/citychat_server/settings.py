from distutils.util import strtobool
from dotenv import load_dotenv
from os import environ

load_dotenv()

FLASK_ENV = environ.get('FLASK_ENV')

CLIENT_URL = environ.get('CLIENT_URL')

SECRET_KEY = environ.get('SECRET_KEY')
JWT_SECRET_KEY = environ.get('JWT_SECRET_KEY')

JWT_TOKEN_LOCATION = [
    location.strip()
    for location in environ.get('JWT_TOKEN_LOCATION').split(',')
]
JWT_ACCESS_COOKIE_PATH = environ.get('JWT_ACCESS_COOKIE_PATH')
JWT_REFRESH_COOKIE_PATH = environ.get('JWT_REFRESH_COOKIE_PATH')

JWT_COOKIE_SAMESITE = environ.get('JWT_COOKIE_SAMESITE')
JWT_COOKIE_SECURE = strtobool(environ.get('JWT_COOKIE_SECURE'))
JWT_COOKIE_CSRF_PROTECT = strtobool(environ.get('JWT_COOKIE_CSRF_PROTECT'))

JWT_BLACKLIST_ENABLED = True
JWT_BLACKLIST_TOKEN_CHECKS = ['access', 'refresh']

SQLALCHEMY_DATABASE_URI = environ.get('SQLALCHEMY_DATABASE_URI')
SQLALCHEMY_TRACK_MODIFICATIONS = strtobool(
    environ.get('SQLALCHEMY_TRACK_MODIFICATIONS')
)

MAIL_SERVER = environ.get('MAIL_SERVER')
MAIL_PORT = int(environ.get('MAIL_PORT'))
MAIL_USE_TLS = strtobool(environ.get('MAIL_USE_TLS'))
MAIL_USE_SSL = strtobool(environ.get('MAIL_USE_SSL'))
MAIL_DEBUG = strtobool(environ.get('MAIL_DEBUG'))

MAIL_USERNAME = environ.get('MAIL_USERNAME')
MAIL_PASSWORD = environ.get('MAIL_PASSWORD')

MAIL_DEFAULT_SENDER = environ.get('MAIL_DEFAULT_SENDER')
MAIL_MAX_EMAILS = environ.get('MAIL_MAX_EMAILS')
MAIL_SUPPRESS_SEND = strtobool(environ.get('MAIL_SUPPRESS_SEND'))
MAIL_ASCII_ATTACHMENTS = strtobool(environ.get('MAIL_ASCII_ATTACHMENTS'))
