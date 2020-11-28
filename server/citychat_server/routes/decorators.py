from functools import wraps

from flask import jsonify
from flask_api import status
from flask_jwt_extended import get_jwt_identity

from citychat_server.models.user import UserProfile


def get_current_user(route):
    @wraps(route)
    def decorated_route(*args, **kwargs):
        current_user = UserProfile.get_first_active(id=get_jwt_identity())

        if current_user:
            return route(current_user=current_user, *args, **kwargs)
        else:
            return jsonify(), status.HTTP_401_UNAUTHORIZED

    return decorated_route


def get_user(route):
    @wraps(route)
    def decorated_route(*args, **kwargs):
        try:
            kwargs['id'] = int(kwargs['id'])
            user = UserProfile.get_first_active(id=kwargs['id'])

            if user:
                return route(user=user, *args, **kwargs)
            else:
                return jsonify(), status.HTTP_404_NOT_FOUND
        except (KeyError, ValueError):
            return jsonify(), status.HTTP_400_BAD_REQUEST

    return decorated_route
