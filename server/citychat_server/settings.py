from dotenv import load_dotenv
from os import environ

load_dotenv()

FLASK_ENV = environ.get('FLASK_ENV')

SQLALCHEMY_DATABASE_URI = environ.get('SQLALCHEMY_DATABASE_URI')
SQLALCHEMY_TRACK_MODIFICATIONS = environ.get('SQLALCHEMY_TRACK_MODIFICATIONS')

MAIL_SERVER = environ.get('MAIL_SERVER')
MAIL_PORT = environ.get('MAIL_PORT')
MAIL_USE_TLS = environ.get('MAIL_USE_TLS')
MAIL_USE_SSL = environ.get('MAIL_USE_SSL')
MAIL_DEBUG = bool(environ.get('MAIL_DEBUG'))

MAIL_USERNAME = environ.get('MAIL_USERNAME')
MAIL_PASSWORD = environ.get('MAIL_PASSWORD')

MAIL_DEFAULT_SENDER = environ.get('MAIL_DEFAULT_SENDER')
MAIL_MAX_EMAILS = environ.get('MAIL_MAX_EMAILS')
MAIL_SUPPRESS_SEND = environ.get('MAIL_SUPPRESS_SEND')
MAIL_ASCII_ATTACHMENTS = environ.get('MAIL_ASCII_ATTACHMENTS')
