from functools import wraps

from flask import jsonify, request
from flask_api import status
from flask_jwt_extended import decode_token, get_jwt_identity
from flask_socketio import emit
from jwt.exceptions import (
    DecodeError,
    ExpiredSignatureError,
    InvalidSignatureError
)
from werkzeug.exceptions import BadRequestKeyError

from citychat_server.models.user import User
from citychat_server.models.chat import Chat


def get_current_user(route):
    @wraps(route)
    def decorated_route(*args, **kwargs):
        current_user = User.get_first_active(id=get_jwt_identity())

        if current_user:
            return route(current_user=current_user, *args, **kwargs)
        else:
            return jsonify(), status.HTTP_401_UNAUTHORIZED

    return decorated_route


def get_user(route):
    @wraps(route)
    def decorated_route(*args, **kwargs):
        try:
            kwargs['user_id'] = int(kwargs['user_id'])
            user = User.get_first_active(id=kwargs['user_id'])

            if user:
                return route(user=user, *args, **kwargs)
            else:
                return jsonify(), status.HTTP_404_NOT_FOUND
        except (KeyError, ValueError):
            return jsonify(), status.HTTP_400_BAD_REQUEST

    return decorated_route


def get_users(route):
    @wraps(route)
    def decorated_route(*args, **kwargs):
        try:
            kwargs['user_id_list'] = kwargs['user_id_list'].split('-')
            kwargs['user_id_list'].sort()
            users = {kwargs['current_user']}

            for id in kwargs['user_id_list']:
                user = User.get_first_active(id=int(id))

                if user:
                    users.add(user)
                else:
                    return jsonify(), status.HTTP_404_NOT_FOUND

            return route(users=users, *args, **kwargs)
        except (KeyError, ValueError):
            return jsonify(), status.HTTP_400_BAD_REQUEST

    return decorated_route


def distinct_users_required(route):
    @wraps(route)
    def decorated_route(*args, **kwargs):
        try:
            if kwargs['user'].id == kwargs['current_user'].id:
                raise ValueError
            else:
                return route(*args, **kwargs)
        except (KeyError, ValueError):
            return jsonify(), status.HTTP_400_BAD_REQUEST

    return decorated_route


def participant_required(route):
    @wraps(route)
    def decorated_route(*args, **kwargs):
        try:
            kwargs['chat_id'] = int(kwargs['chat_id'])
            chat = Chat.get_first(id=kwargs['chat_id'])

            if chat:
                try:
                    if chat.has_participant(kwargs['current_user']):
                        return route(chat=chat, *args, **kwargs)
                    else:
                        return jsonify(), status.HTTP_403_FORBIDDEN
                except (KeyError):
                    return jsonify(), status.HTTP_400_BAD_REQUEST
            else:
                return jsonify(), status.HTTP_404_NOT_FOUND
        except (KeyError, ValueError):
            return jsonify(), status.HTTP_400_BAD_REQUEST

    return decorated_route


def emit_status(status, response=None):
    emit({'status': status} | (response or {}))


def io_get_current_user(io):
    @wraps(io)
    def decorated_io(*args, **kwargs):
        try:
            access_token = decode_token(request.args['jwt'])
            current_user = User.get_first(id=access_token['identity'])
            return io(current_user=current_user, *args, **kwargs)
        except ExpiredSignatureError:
            return emit_status(status.HTTP_401_UNAUTHORIZED, {
                'expired_token': 'access'
            })
        except (BadRequestKeyError, DecodeError, InvalidSignatureError):
            return emit_status(status.HTTP_401_UNAUTHORIZED)

    return decorated_io


def io_participant_required(io):
    @wraps(io)
    def decorated_io(*args, **kwargs):
        try:
            chat = Chat.get_first(id=int(args[0]['chat_id']))

            if chat:
                try:
                    if chat.has_participant(kwargs['current_user']):
                        return io(chat=chat, *args, **kwargs)
                    else:
                        return emit_status(status.HTTP_403_FORBIDDEN)
                except (KeyError):
                    return emit_status(status.HTTP_400_BAD_REQUEST)
            else:
                return emit_status(status.HTTP_404_NOT_FOUND)
        except (IndexError, KeyError, ValueError):
            return emit_status(status.HTTP_400_BAD_REQUEST)

    return decorated_io
