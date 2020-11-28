from flask import Blueprint, jsonify
from flask_api import status
from flask_jwt_extended import jwt_required

from citychat_server.routes.decorators import (
    get_current_user,
    get_user
)

blueprint = Blueprint('user', __name__)


@blueprint.route('/protected/user/self', methods=['GET'])
@jwt_required
@get_current_user
def user_self(current_user):
    return jsonify(
        user=current_user.to_json(columns=['id', 'name'])
    ), status.HTTP_200_OK


@blueprint.route('/protected/user/id/<id>', methods=['GET'])
@jwt_required
@get_user
def user_from_id(id, user):
    return jsonify(user=user.to_json(
        columns=['id', 'name']
    )), status.HTTP_200_OK
