import re

from flask_login import UserMixin
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from werkzeug.security import generate_password_hash

from citychat_server.models import db
from citychat_server.models.comparators import (
    CasefoldComparator,
    PasswordComparator
)


class User(db.Model, UserMixin):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    password = db.Column(db.String(255), nullable=False, unique=False)
    date_joined = db.Column(db.DateTime(), nullable=True, unique=False)

    password_minlen = 8

    profile = db.relationship(
        'user_profile',
        uselist=False,
        backref='user',
        cascade='all, delete'
    )

    @property
    def is_active(self):
        return self.date_joined is not None

    @hybrid_property
    def pwhash(self):
        return self.password

    @pwhash.setter
    def pwhash(self, password):
        if (len(password) < self.password_minlen):
            raise ValueError('length of password is less than '
                             f'{self.password_minlen} characters')

        self.password = generate_password_hash(password)

    @pwhash.comparator
    def pwhash(self, password):
        return PasswordComparator(password)


class UserProfile(db.Model):
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

    @hybrid_property
    def email_norm(self):
        return self.email.casefold()

    @email_norm.setter
    def email_norm(self, email):
        self.email = email.strip()

    @email_norm.comparator
    def email_norm(self, email):
        return CasefoldComparator(email)

    @validates('email')
    def validate_email(self, key, value):
        if not value:
            raise ValueError('email address is empty')

        if not re.fullmatch(self.email_regex, value):
            raise ValueError('email address format is invalid')

        return value

    @hybrid_property
    def name_norm(self):
        return self.name

    @name_norm.setter
    def name_norm(self, name):
        if not name or not name.strip():
            raise ValueError('name is empty')

        self.name = name.strip()

    @name_norm.comparator
    def name_norm(self, name):
        return CasefoldComparator(name)