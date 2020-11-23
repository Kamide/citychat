from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from citychat_server.models.user import UserProfile

blueprint = Blueprint('user', __name__)


@blueprint.route('/protected/user/self', methods=['GET'])
@jwt_required
def user_self():
    user = UserProfile.get_first(id=get_jwt_identity())
    return jsonify(user=user.to_json())
