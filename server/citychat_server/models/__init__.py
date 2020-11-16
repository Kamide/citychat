from flask_login import LoginManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.inspection import inspect

db = SQLAlchemy()
migrate = Migrate(compare_type=True)
login_manager = LoginManager()
login_manager.login_view = 'auth.login'


class CRUDMixin:
    @classmethod
    def filter_dict(cls, c=None, **kwargs):
        if c:
            return {
                k: v
                for k, v in kwargs.items()
                if k in (inspect(cls).c and c)
            }
        else:
            return {
                k: v
                for k, v in kwargs.items()
                if k in inspect(cls).c
            }

    @classmethod
    def has_row(cls, **kwargs):
        return cls.query.filter_by(**kwargs).scalar() is not None
