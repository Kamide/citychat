from collections import deque
from enum import Enum
import re

from sqlalchemy.orm import validates
from sqlalchemy.sql import func, or_
from werkzeug.security import check_password_hash

from citychat_server.enum import EnumMixin
from citychat_server.models import CRUDMixin, db


class User(CRUDMixin, db.Model):
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
    conversations = db.relationship(
        'ChatParticipant',
        uselist=True,
        backref='participant',
        cascade='all, delete',
        passive_updates=True,
        passive_deletes=True
    )
    messages = db.relationship(
        'Message',
        uselist=True,
        backref='author',
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


class UserProfile(CRUDMixin, db.Model):
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


class UserRelation(EnumMixin, Enum):
    FRIEND_REQUEST_FROM_A_TO_B = 'FX'
    FRIEND_REQUEST_FROM_B_TO_A = 'XF'
    FRIEND = 'F'

    @classmethod
    def STRANGER(self):
        return 'S'

    @classmethod
    def to_binary(cls, value):
        return int(''.join('0' if c == 'X' else '1' for c in value), 2)


class UserRelationship(CRUDMixin, db.Model):
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
        db.String(2),
        nullable=True,
        unique=False
    )
    since = db.Column(
        db.DateTime,
        nullable=True,
        unique=False
    )

    __table_args__ = (
        db.PrimaryKeyConstraint('user_a', 'user_b', name='pk_user_relation'),
        db.CheckConstraint('user_a < user_b', name='cc_user_relation_pk'),
        db.CheckConstraint(f'relation IN ({UserRelation.to_quoted_csv_str()})',
                           name='cc_user_relation_relation')
    )

    @validates('user_a', 'user_b')
    def validates_user_id_pair(self, key, value):
        lhs = value if key == 'user_a' else self.user_a
        rhs = value if key == 'user_b' else self.user_b

        if lhs is not None and rhs is not None and not lhs < rhs:
            raise ValueError('Value of user_a must be less than user_b')

        return value

    @validates('relation')
    def validates(self, key, value):
        if value not in UserRelation.to_list():
            raise ValueError(
                'Relation must be one of the following values: '
                + UserRelation.to_csv_str()
            )

        return value

    @classmethod
    def sort_user_id_pair(cls, user_id_pair):
        return {
            'user_a': min(user_id_pair[0], user_id_pair[1]),
            'user_b': max(user_id_pair[0], user_id_pair[1])
        }

    @classmethod
    def resolve_friend_requester(cls, sorted_user_id_pair, current_user_id):
        if sorted_user_id_pair['user_a'] == current_user_id:
            return UserRelation.FRIEND_REQUEST_FROM_A_TO_B.value
        else:
            return UserRelation.FRIEND_REQUEST_FROM_B_TO_A.value

    @classmethod
    def resolve_friend_requestee(cls, sorted_user_id_pair, current_user_id):
        if sorted_user_id_pair['user_a'] == current_user_id:
            return UserRelation.FRIEND_REQUEST_FROM_B_TO_A.value
        else:
            return UserRelation.FRIEND_REQUEST_FROM_A_TO_B.value

    @classmethod
    def get_filtered(cls, **kwargs):
        user_id = kwargs.pop('user_id', None)
        user_id_pair = kwargs.pop('user_id_pair', None)
        status = kwargs.pop('status', None)
        values = deque()

        if user_id:
            values.appendleft(
                cls.query.filter(
                    or_(cls.user_a == user_id, cls.user_b == user_id)
                ).filter_by(**kwargs)
            )
            return values
        elif user_id_pair:
            sorted_user_id_pair = cls.sort_user_id_pair(user_id_pair)
            kwargs |= sorted_user_id_pair

            if status:
                current_user_id = status.get('current_user_id')
                assert isinstance(current_user_id, int)

                if status.get('requester'):
                    relation = cls.resolve_friend_requester(
                        sorted_user_id_pair, current_user_id
                    )
                else:
                    relation = cls.resolve_friend_requestee(
                        sorted_user_id_pair, current_user_id
                    )

                if status.get('insert'):
                    kwargs['relation'] = relation

                values.appendleft(relation)

            values.appendleft(sorted_user_id_pair)

        values.appendleft(cls.query.filter_by(**kwargs))
        return values

    @classmethod
    def get_first(cls, **kwargs):
        filtered, *args = cls.get_filtered(**kwargs)
        return (filtered.first(), *args)

    @classmethod
    def has_row(cls, **kwargs):
        filtered, *args = cls.get_filtered(**kwargs)
        return (filtered.scalar() is not None, *args)

    @classmethod
    def insert_commit(cls, **kwargs):
        row = cls(**kwargs)

        if cls.has_row(**kwargs)[0]:
            return None

        db.session.add(row)
        db.session.commit()
        return row

    def other_user_to_json(self, user_id):
        id = self.user_a if self.user_a != user_id else self.user_b
        return UserProfile.get_first(id=id).to_json(columns=['id', 'name'])

    def user_is_requester(self, user_id):
        p = 0b10 if self.user_a == user_id else 0b01
        q = UserRelation.to_binary(self.relation)
        return p & q

    def user_is_requestee(self, user_id):
        return not self.user_is_requester(user_id)
