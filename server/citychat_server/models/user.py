import re

from sqlalchemy.orm import validates
from sqlalchemy.sql import func
from werkzeug.security import check_password_hash

from citychat_server.models import CRUDMixin, db


class User(db.Model, CRUDMixin):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    password = db.Column(db.String(255), nullable=False, unique=False)
    date_registered = db.Column(
        db.DateTime,
        nullable=False,
        unique=False,
        server_default=func.now()
    )
    date_activated = db.Column(db.DateTime, nullable=True, unique=False)

    PASSWORD_MINLEN = 8

    profile = db.relationship(
        'UserProfile',
        uselist=False,
        backref='user',
        cascade='all, delete',
        passive_deletes=True
    )

    def __str__(self):
        return (
            f'(User {self.id}, Date Registered: {self.date_registered}), '
            f'Date Activated: {self.date_activated}'
        )

    @property
    def is_active(self):
        return self.date_activated is not None

    def check_password(self, password):
        return check_password_hash(self.password, password)


class UserProfile(db.Model, CRUDMixin):
    __tablename__ = 'user_profile'

    id = db.Column(
        db.Integer,
        db.ForeignKey('user.id', ondelete='CASCADE'),
        primary_key=True
    )
    email = db.Column(db.String(254), nullable=False, unique=True)
    name = db.Column(db.String(255), nullable=False, unique=False)

    email_regex = r'[^@]+@[^@]+\.[^@]+'

    __tableargs__ = (
        db.CheckConstraint(f"email ~ '{email_regex}'", name='cc_email'),
        db.CheckConstraint('char_length(name) > 0', name='cc_name')
    )

    def __str__(self):
        return f'(Profile {self.id}, {self.email}, Name: {self.name})'

    @validates('email')
    def validate_email(self, key, value):
        if not value or not re.fullmatch(self.email_regex, value):
            raise ValueError('Please enter a valid email address')

        return value

    @classmethod
    def get_filtered(cls, **kwargs):
        email = kwargs.pop('email', None)

        if email:
            return (
                cls.query.filter(cls.email.ilike(email)).filter_by(**kwargs)
            )
        else:
            return cls.query.filter_by(**kwargs)

    @classmethod
    def get_first_active(cls, **kwargs):
        first = cls.get_first(**kwargs)
        return first if (first and first.user.is_active) else None

    @classmethod
    def get_active(cls):
        return cls.query.join(User).filter(User.date_activated.isnot(None))
