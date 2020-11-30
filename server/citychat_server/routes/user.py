from flask import Blueprint, jsonify, request
from flask_api import status
from flask_jwt_extended import jwt_required
from sqlalchemy.sql import func, or_

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


@blueprint.route('/protected/user/self/relationships', methods=['GET'])
@jwt_required
@get_current_user
def get_relationships(current_user):
    relationships = UserRelationship.get_filtered(user_id=current_user.id)[0]
    friends = relationships.filter_by(relation=UserRelation.FRIEND.value)
    pending = relationships.filter(or_(
        UserRelationship.relation
        == UserRelation.FRIEND_REQUEST_FROM_A_TO_B.value,
        UserRelationship.relation
        == UserRelation.FRIEND_REQUEST_FROM_B_TO_A.value
    ))
    return jsonify(
        friends=[row.other_user_to_json(current_user.id) for row in friends],
        pending={
            'incoming': [
                row.other_user_to_json(current_user.id)
                for row in pending
                if row.user_is_requestee(current_user.id)
            ],
            'outgoing': [
                row.other_user_to_json(current_user.id)
                for row in pending
                if row.user_is_requester(current_user.id)
            ]
        }
    ), status.HTTP_200_OK


@blueprint.route('/protected/user/id/<user_id>', methods=['GET'])
@jwt_required
@get_user
def get_user_by_id(user_id, user):
    return jsonify(user=user.to_json(
        columns=['id', 'name']
    )), status.HTTP_200_OK


@blueprint.route('/protected/user/id/<user_id>/relationship', methods=['GET'])
@jwt_required
@get_current_user
@get_user
@distinct_users_required
def get_relationship(user_id, user, current_user):
    relationship, sorted_users = UserRelationship.get_first(
        user_id_pair=[user_id, current_user.id]
    )
    return jsonify(
        is_user_a=sorted_users['user_a'] == current_user.id,
        relationship=(
            relationship.relation if relationship
            else UserRelation.STRANGER()
        )
    ), status.HTTP_200_OK


@blueprint.route('/protected/user/id/<user_id>/friend/request',
                 methods=['POST'])
@jwt_required
@get_current_user
@get_user
@distinct_users_required
def send_friend_request(user_id, user, current_user):
    relationship, sorted_users, relation = UserRelationship.has_row(
        user_id_pair=[user_id, current_user.id],
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


@blueprint.route('/protected/user/id/<user_id>/friend/request/cancel',
                 endpoint='cancel_friend_request',
                 methods=['DELETE'])
@blueprint.route('/protected/user/id/<user_id>/friend/unfriend',
                 endpoint='unfriend',
                 methods=['DELETE'])
@blueprint.route('/protected/user/id/<user_id>/friend/request/reject',
                 endpoint='reject_friend_request',
                 methods=['DELETE'])
@jwt_required
@get_current_user
@get_user
@distinct_users_required
def unfriend(user_id, user, current_user):
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
        user_id_pair=[user_id, current_user.id],
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


@blueprint.route('/protected/user/id/<user_id>/friend/request/accept',
                 methods=['PUT'])
@jwt_required
@get_current_user
@get_user
@distinct_users_required
def accept_user_friend_request(user_id, user, current_user):
    relationship, *args = UserRelationship.get_first(
        user_id_pair=[user_id, current_user.id]
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
