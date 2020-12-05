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
        backref='chat',
        cascade='all, delete',
        passive_updates=True,
        passive_deletes=True
    )


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
