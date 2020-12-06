from functools import wraps

from flask import jsonify
from flask_api import status
from flask_jwt_extended import get_jwt_identity

from citychat_server.models.user import UserProfile


def get_current_user(route):
    @wraps(route)
    def decorated_route(*args, **kwargs):
        current_user_profile = UserProfile.get_first_active(
            id=get_jwt_identity()
        )

        if current_user_profile:
            return route(
                current_user=current_user_profile.user,
                *args, **kwargs
            )
        else:
            return jsonify(), status.HTTP_401_UNAUTHORIZED

    return decorated_route


def get_user(route):
    @wraps(route)
    def decorated_route(*args, **kwargs):
        try:
            kwargs['user_id'] = int(kwargs['user_id'])
            user_profile = UserProfile.get_first_active(id=kwargs['user_id'])

            if user_profile:
                return route(user=user_profile.user, *args, **kwargs)
            else:
                return jsonify(), status.HTTP_404_NOT_FOUND
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
