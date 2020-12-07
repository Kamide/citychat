from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.inspection import inspect

db = SQLAlchemy()
migrate = Migrate(compare_type=True)


class CRUDMixin:
    @classmethod
    def dict_intersect(cls, **kwargs):
        return {
            k: v
            for k, v in kwargs.items()
            if k in inspect(cls).c
        }

    @classmethod
    def get_filtered(cls, **kwargs):
        return cls.query.filter_by(**kwargs)

    @classmethod
    def get_first(cls, **kwargs):
        return cls.get_filtered(**kwargs).first()

    @classmethod
    def has_row(cls, **kwargs):
        return cls.get_filtered(**kwargs).scalar() is not None

    @classmethod
    def insert_commit(cls, **kwargs):
        row = cls(**kwargs)

        if cls.has_row(**kwargs):
            return None

        db.session.add(row)
        db.session.commit()
        return row

    def to_json(self, operations=None):
        columns = inspect(self).mapper.column_attrs.keys()

        if operations:
            for operation in operations:
                if operation[0] == 'difference':
                    columns = [c for c in columns if c not in operation[1]]
                elif operation[0] == 'intersection':
                    columns = [c for c in columns if c in operation[1]]

        return {c: getattr(self, c) for c in columns}

    def to_public_json(self):
        return self.to_json()

    def __str__(self):
        return str(self.to_public_json())
