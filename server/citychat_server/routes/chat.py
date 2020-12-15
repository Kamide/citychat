from flask import Blueprint, jsonify, request
from flask_api import status
from flask_jwt_extended import jwt_required
from flask_socketio import join_room

from citychat_server.forms import MessageForm
from citychat_server.models import db
from citychat_server.models.chat import (
    Chat,
    ChatParticipant,
    DirectChat,
    GroupChat
)
from citychat_server.models.message import Message, MessageText
from citychat_server.routes import socketio
from citychat_server.routes.decorators import (
    get_current_user,
    get_users,
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


@blueprint.route('/protected/chat/users/<user_id_list>', methods=['PUT'])
@jwt_required
@get_current_user
@get_users
def get_chat_with_users(user_id_list, users, current_user):
    participant_id_set = {user.id for user in users}
    chat = Chat.get_first(participant_id_set=participant_id_set)

    if chat:
        return jsonify(chat_id=chat.id), status.HTTP_200_OK
    else:
        chat = Chat()
        db.session.add(chat)
        db.session.flush()

        if len(participant_id_set) > 2:
            group_chat = GroupChat(id=chat.id)
            db.session.add(group_chat)
            db.session.flush()
        else:
            direct_chat = DirectChat(id=chat.id)
            db.session.add(direct_chat)
            db.session.flush()

        for pid in participant_id_set:
            chat_participant = ChatParticipant(
                chat_id=chat.id,
                participant_id=pid
            )
            db.session.add(chat_participant)
            db.session.flush()

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

    if (
        form.values['parent_id']
        and Message.has_row(id=form.values['parent_id'])
    ):
        message.parent_id = form.values['parent_id']

    db.session.add(message)
    db.session.flush()

    text = MessageText(id=message.id, content=form.values['text'])
    db.session.add(text)
    db.session.commit()

    socketio.emit('message', message.to_public_json(), room=f'/chat/{chat_id}')

    for p in chat.participants:
        socketio.emit(
            'chat_list_update', chat.to_public_json(
                current_user_id=p.participant_id,
                get_latest_message=True
            ),
            room=f'/user/{p.participant_id}/chat/list'
        )

    return jsonify(sent=True), status.HTTP_200_OK


@socketio.on('join_chat')
@io_get_current_user
@io_participant_required
def join_chat(*args, **kwargs):
    join_room(f"/chat/{kwargs['chat'].id}")


@socketio.on('join_chat_list')
@io_get_current_user
def join_chat_list(*args, **kwargs):
    join_room(f"/user/{kwargs['current_user'].id}/chat/list")
