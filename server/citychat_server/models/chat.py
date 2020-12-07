from sqlalchemy.sql import func

from citychat_server.models import CRUDMixin, db


class Chat(CRUDMixin, db.Model):
    __tablename__ = 'chat'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    participants = db.relationship(
        'ChatParticipant',
        uselist=True,
        backref='chat',
        cascade='all, delete',
        passive_updates=True,
        passive_deletes=True
    )
    messages = db.relationship(
        'Message',
        uselist=True,
        order_by='asc(Message.timestamp)',
        backref='chat',
        cascade='all, delete',
        passive_updates=True,
        passive_deletes=True,
    )

    private_chat = db.relationship(
        'PrivateChat',
        uselist=False,
        backref='chat',
        cascade='all, delete',
        passive_updates=True,
        passive_deletes=True
    )

    @property
    def latest_message(self):
        try:
            return self.messages[-1]
        except IndexError:
            return None

    @classmethod
    def get_filtered(cls, **kwargs):
        user_id = kwargs.pop('user_id', None)
        participant_id_set = kwargs.pop('participant_id_set', None)

        if user_id is not None:
            return (
                cls.query.filter_by(**kwargs)
                .filter(cls.participants.any(
                    ChatParticipant.participant_id == user_id
                ))
            )
        elif participant_id_set:
            return (
                cls.query.filter_by(**kwargs)
                .join(ChatParticipant)
                .group_by(cls.id)
                .having(func.every(
                    ChatParticipant.participant_id in participant_id_set
                ))
            )
        else:
            return cls.query.filter_by(**kwargs)

    def has_participant(self, participant):
        for p in self.participants:
            if p.participant_id == participant.id:
                return True

        return False

    def resolve_name(self, **kwargs):
        if self.private_chat:
            current_user_id = kwargs.get('current_user_id')
            current_user_name = 'CityChat User'
            names = []

            for p in self.participants:
                if p.participant_id != current_user_id:
                    names.append(p.name)
                else:
                    current_user_name = p.name

            return ', '.join(names) or current_user_name
        else:
            return 'Chat'

    def to_public_json(self, get_latest_message=False, **kwargs):
        json = {
            'chat': self.to_json() | {'name': self.resolve_name(**kwargs)},
            'participants': {
                p.participant_id: (
                    p.to_public_json()
                    | p.participant.profile.to_public_json()
                )
                for p in self.participants
            }
        }

        if get_latest_message:
            json |= {'latest_message': (
                self.latest_message.to_public_json()
                if self.latest_message else None
            )}

        return json


class ChatParticipant(CRUDMixin, db.Model):
    __tablename__ = 'chat_participant'

    chat_id = db.Column(
        db.ForeignKey(
            column='chat.id',
            name='fk_chat_participant_chat_id',
            onupdate='CASCADE',
            ondelete='CASCADE'
        ),
        primary_key=True
    )
    participant_id = db.Column(
        db.ForeignKey(
            column='user.id',
            name='fk_chat_participant_participant',
            onupdate='CASCADE',
            ondelete='CASCADE'
        ),
        primary_key=True
    )
    nickname = db.Column(db.String(255), nullable=True, unique=False)

    __table_args__ = (
        db.PrimaryKeyConstraint('chat_id', 'participant_id',
                                name='pk_chat_participant'),
    )

    @property
    def name(self):
        return self.nickname or self.participant.profile.name

    def to_public_json(self):
        return self.to_json(operations=[('difference', {'chat_id'})])


class PrivateChat(CRUDMixin, db.Model):
    __tablename__ = 'private_chat'

    id = db.Column(
        db.ForeignKey(
            column='chat.id',
            name='fk_private_chat_chat_id',
            onupdate='CASCADE',
            ondelete='CASCADE'
        ),
        primary_key=True
    )
