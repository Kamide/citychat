from sqlalchemy.sql import func

from citychat_server.models import CRUDMixin, db


class Message(CRUDMixin, db.Model):
    __tablename__ = 'message'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    chat_id = db.Column(
        db.ForeignKey(
            column='chat.id',
            name='fk_message_chat_id',
            onupdate='CASCADE',
            ondelete='CASCADE'
        ),
        nullable=False,
        unique=False
    )
    author_id = db.Column(
        db.ForeignKey(
            column='user.id',
            name='fk_message_author_id',
            onupdate='CASCADE',
            ondelete='CASCADE'
        ),
        nullable=False,
        unique=False
    )
    timestamp = db.Column(
        db.DateTime,
        nullable=False,
        unique=False,
        server_default=func.now()
    )
    parent_id = db.Column(
        db.ForeignKey(
            column='message.id',
            name='fk_message_parent_id',
            onupdate='CASCADE',
            ondelete='CASCADE'
        ),
        nullable=True,
        unique=False
    )

    children = db.relationship(
        'Message',
        uselist=True,
        backref=db.backref('parent', remote_side=[id]),
        cascade='all, delete',
        passive_updates=True,
        passive_deletes=True
    )
    text = db.relationship(
        'MessageText',
        uselist=False,
        backref='message',
        cascade='all, delete',
        passive_updates=True,
        passive_deletes=True
    )

    def to_json(self, operations=None):
        return super().to_json(operations) | {'timestamp': str(self.timestamp)}

    def to_public_json(self):
        return self.to_json(
            operations=[('difference', {'chat_id'})]
        ) | self.text.to_json() if self.text else {}


class MessageText(CRUDMixin, db.Model):
    __tablename__ = 'message_text'

    id = db.Column(
        db.Integer,
        db.ForeignKey(
            column='message.id',
            name='fk_message_text_id',
            onupdate='CASCADE',
            ondelete='CASCADE'
        ),
        primary_key=True
    )
    content = db.Column(db.String(512), nullable=False, unique=False)

    __table_args__ = (
        db.CheckConstraint('char_length(content) > 0',
                           name='cc_message_text_content'),
    )
