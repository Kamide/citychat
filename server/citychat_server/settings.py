from dotenv import load_dotenv
from os import environ

load_dotenv()

FLASK_ENV = environ.get('FLASK_ENV')
SQLALCHEMY_DATABASE_URI = environ.get('SQLALCHEMY_DATABASE_URI')
SQLALCHEMY_TRACK_MODIFICATIONS = environ.get('SQLALCHEMY_TRACK_MODIFICATIONS')
