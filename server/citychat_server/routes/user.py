from flask import Blueprint, jsonify, request
from flask_api import status
from flask_jwt_extended import jwt_required
from sqlalchemy.sql import func

from citychat_server.models import db
from citychat_server.models.user import UserRelation, UserRelationship
from citychat_server.routes.decorators import (
    distinct_users_required,
    get_current_user,
    get_user
)

blueprint = Blueprint('user', __name__)


@blueprint.route('/protected/user/self', methods=['GET'])
@jwt_required
@get_current_user
def get_self(current_user):
    return jsonify(
        user=current_user.to_json(columns=['id', 'name'])
    ), status.HTTP_200_OK


@blueprint.route('/protected/user/id/<id>', methods=['GET'])
@jwt_required
@get_user
def get_user_by_id(id, user):
    return jsonify(user=user.to_json(
        columns=['id', 'name']
    )), status.HTTP_200_OK


@blueprint.route('/protected/user/id/<id>/relationship', methods=['GET'])
@jwt_required
@get_current_user
@get_user
@distinct_users_required
def get_relationship(id, current_user, user):
    relationship, sorted_users = UserRelationship.get_first(
        user_ids=[id, current_user.id]
    )
    return jsonify(
        relationship=(
            relationship.relation if relationship
            else UserRelation.STRANGER()
        ),
        is_user_a=sorted_users['user_a'] == current_user.id
    ), status.HTTP_200_OK


@blueprint.route('/protected/user/id/<id>/friend/request', methods=['POST'])
@jwt_required
@get_current_user
@get_user
@distinct_users_required
def send_friend_request(id, current_user, user):
    relationship, sorted_users, relation = UserRelationship.has_row(
        user_ids=[id, current_user.id],
        status={
            'current_user_id': current_user.id,
            'requester': True
        }
    )

    if relationship:
        return jsonify(), status.HTTP_409_CONFLICT
    else:
        UserRelationship.insert_commit(
            **sorted_users,
            relation=relation,
            since=func.now()
        )
        return jsonify(relationship=relation), status.HTTP_201_CREATED


@blueprint.route('/protected/user/id/<id>/friend/request/cancel',
                 endpoint='cancel_friend_request',
                 methods=['DELETE'])
@blueprint.route('/protected/user/id/<id>/friend/unfriend',
                 endpoint='unfriend',
                 methods=['DELETE'])
@blueprint.route('/protected/user/id/<id>/friend/request/reject',
                 endpoint='reject_friend_request',
                 methods=['DELETE'])
@jwt_required
@get_current_user
@get_user
@distinct_users_required
def unfriend(id, current_user, user):
    if request.endpoint == 'user.unfriend':
        kwargs = {'relation': UserRelation.FRIEND.value}
    else:
        who = (
            'requester' if request.endpoint == 'user.cancel_friend_request'
            else 'requestee'
        )
        kwargs = {'status': {
            'current_user_id': current_user.id,
            'insert': True,
            who: True
        }}

    relationship, *args = UserRelationship.get_first(
        user_ids=[id, current_user.id],
        **kwargs
    )

    if relationship:
        db.session.delete(relationship)
        db.session.commit()
        return jsonify(
            relationship=UserRelation.STRANGER()
        ), status.HTTP_200_OK
    else:
        return jsonify(), status.HTTP_404_NOT_FOUND


@blueprint.route('/protected/user/id/<id>/friend/request/accept',
                 methods=['PUT'])
@jwt_required
@get_current_user
@get_user
@distinct_users_required
def accept_user_friend_request(id, current_user, user):
    relationship, *args = UserRelationship.get_first(
        user_ids=[id, current_user.id]
    )

    if relationship:
        relationship.relation = UserRelation.FRIEND.value
        relationship.since = func.now()
        db.session.commit()
        return jsonify(
            relationship=UserRelation.FRIEND.value
        ), status.HTTP_200_OK
    else:
        return jsonify(), status.HTTP_404_NOT_FOUND
