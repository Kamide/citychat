from flask import Blueprint, jsonify
from flask_api import status
from flask_jwt_extended import jwt_required

from citychat_server.models.chat import Chat
from citychat_server.models.message import Message
from citychat_server.routes.decorators import (
    get_current_user,
    participant_required
)

blueprint = Blueprint('chat', __name__)


@blueprint.route('/protected/chat', methods=['GET'])
@jwt_required
@get_current_user
def get_conversations(current_user):
    conversations = (
        Chat.get_filtered(participants=[current_user]).join(Message)
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
