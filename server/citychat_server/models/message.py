from sqlalchemy.sql import func

from citychat_server.models import CRUDMixin, db


class Message(CRUDMixin, db.Model):
    __tablename__ = 'message'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    author = db.Column(
        db.ForeignKey(
            column='user.id',
            name='fk_message_author',
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
        uselist=True,
        backref='message',
        cascade='all, delete',
        passive_updates=True,
        passive_deletes=True
    )


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
