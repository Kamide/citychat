from flask import Blueprint, jsonify, request
from flask_api import status
from flask_jwt_extended import jwt_required

from citychat_server.models.user import UserProfile

blueprint = Blueprint('search', __name__)


@blueprint.route('/protected/search', methods=['GET'])
@jwt_required
def search():
    q = request.args.get('q')

    if not q:
        return jsonify(), status.HTTP_400_BAD_REQUEST

    users = UserProfile.get_active().filter(UserProfile.name.ilike(f'%{q}%'))

    return jsonify(results=[
        u.to_json(columns=['id', 'name'])
        for u in users
    ]), status.HTTP_200_OK
