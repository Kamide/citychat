from enum import IntEnum
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
        passive_updates=True,
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
        db.ForeignKey(
            column='user.id',
            name='fk_user_profile_id',
            onupdate='CASCADE',
            ondelete='CASCADE'
        ),
        primary_key=True
    )
    email = db.Column(db.String(254), nullable=False, unique=True)
    name = db.Column(db.String(255), nullable=False, unique=False)

    email_regex = r'[^@]+@[^@]+\.[^@]+'

    __table_args__ = (
        db.CheckConstraint(f"email ~ '{email_regex}'",
                           name='cc_user_profile_email'),
        db.CheckConstraint('char_length(name) > 0',
                           name='cc_user_profile_name')
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
    def get_first_inactive(cls, **kwargs):
        first = cls.get_first(**kwargs)
        return first if (first and not first.user.is_active) else None

    @classmethod
    def get_active(cls):
        return cls.query.join(User).filter(User.date_activated.isnot(None))


class UserRelation(IntEnum):
    friend_request_pending = 0
    friend = 1


class UserRelationship(db.Model, CRUDMixin):
    __tablename__ = 'user_relationship'

    user_a = db.Column(
        db.Integer,
        db.ForeignKey(
            column='user.id',
            name='fk_user_relationship_user_a',
            onupdate='CASCADE',
            ondelete='CASCADE'
        ),
        primary_key=True
    )
    user_b = db.Column(
        db.Integer,
        db.ForeignKey(
            column='user.id',
            name='fk_user_relationship_user_b',
            onupdate='CASCADE',
            ondelete='CASCADE'
        ),
        primary_key=True
    )
    relation = db.Column(
        db.Enum(UserRelation, name='user_relation'),
        nullable=False,
        unique=False
    )
    since = db.Column(
        db.DateTime,
        nullable=False,
        unique=False,
        server_default=func.now()
    )

    __table_args__ = (
        db.PrimaryKeyConstraint('user_a', 'user_b', name='pk_user_relation'),
        db.CheckConstraint('user_a < user_b', name='cc_user_relation_pk')
    )

    @validates('user_a', 'user_b')
    def validates_users(self, key, value):
        lhs = value if key == 'user_a' else self.user_a
        rhs = value if key == 'user_b' else self.user_b

        if lhs is not None and rhs is not None and not lhs < rhs:
            raise ValueError('Value of user_a must be less than user_b')

        return value
