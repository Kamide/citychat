from flask import Blueprint, jsonify, request
from flask_api import status
from flask_jwt_extended import jwt_required
from flask_socketio import join_room

from citychat_server.forms import MessageForm
from citychat_server.models import db
from citychat_server.models.chat import Chat, ChatParticipant, PrivateChat
from citychat_server.models.message import Message, MessageText
from citychat_server.routes import socketio
from citychat_server.routes.decorators import (
    get_current_user,
    get_user,
    io_get_current_user,
    io_participant_required,
    participant_required
)

blueprint = Blueprint('chat', __name__)


@blueprint.route('/protected/chat', methods=['GET'])
@jwt_required
@get_current_user
def get_conversations(current_user):
    conversations = (
        Chat.get_filtered(user_id=current_user.id)
        .join(Message)
        .order_by(Message.timestamp.desc())
    )
    return jsonify(
        conversations=[
            chat.to_public_json(
                current_user_id=current_user.id,
                get_latest_message=True
            )
            for chat in conversations
        ]
    ), status.HTTP_200_OK


@blueprint.route('/protected/chat/<chat_id>', methods=['GET'])
@jwt_required
@get_current_user
@participant_required
def get_chat(chat_id, chat, current_user):
    return jsonify(chat.to_public_json(
        current_user_id=current_user.id
    )), status.HTTP_200_OK


@blueprint.route('/protected/chat/<chat_id>/messages', methods=['GET'])
@jwt_required
@get_current_user
@participant_required
def get_messages(chat_id, chat, current_user):
    return jsonify(messages=[
        m.to_public_json() for m in chat.messages
    ]), status.HTTP_200_OK


@blueprint.route('/protected/chat/user/<user_id>', methods=['PUT'])
@jwt_required
@get_current_user
@get_user
def get_chat_with_user(user_id, user, current_user):
    chat = Chat.get_first(participant_id_set={current_user.id, user_id})

    if chat:
        return jsonify(chat_id=chat.id), status.HTTP_200_OK
    else:
        chat = Chat()
        db.session.add(chat)
        db.session.flush()

        private_chat = PrivateChat(id=chat.id)
        db.session.add(private_chat)
        db.session.flush()

        cp_current_user = ChatParticipant(
            chat_id=chat.id,
            participant_id=current_user.id
        )
        db.session.add(cp_current_user)

        if user_id != current_user.id:
            cp_user = ChatParticipant(chat_id=chat.id, participant_id=user_id)
            db.session.add(cp_user)

        db.session.commit()
        return jsonify(chat_id=chat.id), status.HTTP_201_CREATED


@blueprint.route('/protected/chat/<chat_id>/message/send', methods=['POST'])
@jwt_required
@get_current_user
@participant_required
def send_message(chat_id, chat, current_user):
    form = MessageForm()
    form.populate(request.get_json())

    if not form.validate():
        return jsonify(sent=False), status.HTTP_400_BAD_REQUEST

    message = Message(chat_id=chat_id, author_id=current_user.id)
    db.session.add(message)
    db.session.flush()

    text = MessageText(id=message.id, content=form.values['text'])
    db.session.add(text)
    db.session.commit()

    socketio.emit('message', message.to_public_json(), room=f'/chat/{chat_id}')
    return jsonify(sent=True), status.HTTP_200_OK


@socketio.on('join_chat')
@io_get_current_user
@io_participant_required
def join_chat(chat_id, chat, current_user, json, *args, **kwargs):
    join_room(f'/chat/{chat_id}')
