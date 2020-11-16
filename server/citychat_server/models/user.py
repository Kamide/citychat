import re

from flask_login import UserMixin
from sqlalchemy.orm import validates

from citychat_server.models import CRUDMixin, db


class User(db.Model, UserMixin, CRUDMixin):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    password = db.Column(db.String(255), nullable=False, unique=False)
    date_joined = db.Column(db.DateTime(), nullable=True, unique=False)

    PASSWORD_MINLEN = 8

    profile = db.relationship(
        'UserProfile',
        uselist=False,
        backref='user',
        cascade='all, delete'
    )

    def __str__(self):
        return f'(User {self.id}, Date Joined: {self.date_joined})'

    @property
    def is_active(self):
        return self.date_joined is not None


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
