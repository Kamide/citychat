from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.inspection import inspect

db = SQLAlchemy()
migrate = Migrate(compare_type=True)


class CRUDMixin:
    @classmethod
    def filter_dict(cls, **kwargs):
        return {
            k: v
            for k, v in kwargs.items()
            if k in inspect(cls).c
        }

    @classmethod
    def get_first(cls, **kwargs):
        return cls.query.filter_by(**kwargs).first()

    @classmethod
    def has_row(cls, **kwargs):
        return cls.query.filter_by(**kwargs).scalar() is not None

    def to_json(self, columns=None):
        return {
            c.key: getattr(self, c.key)
            for c in inspect(self).mapper.column_attrs
            if not columns or c.key in columns
        }
