from flask import Blueprint, jsonify, request
from flask_api import status
from flask_jwt_extended import jwt_required
from sqlalchemy.sql import func, or_

from citychat_server.models import db
from citychat_server.models.user import UserRelation, UserRelationship
from citychat_server.routes import socketio
from citychat_server.routes.decorators import (
    distinct_users_required,
    get_current_user,
    get_user
)

blueprint = Blueprint('user', __name__)


def emit_contact_update(relation_before, relation_after, user_pair):
    for user_from in user_pair:
        for user_to in user_pair:
            if user_from.id != user_to.id:
                socketio.emit(
                    'contact_update',
                    {
                        'relation_before': relation_before,
                        'relation_after': relation_after,
                        'user': user_from.profile.to_public_json()
                    },
                    room=f'/user/{user_to.id}')


def emit_relationship_update(user_id, relationship, merger={}):
    socketio.emit(
        'relation_update',
        relationship.to_public_json() | merger,
        room=f'/user/{user_id}')


@blueprint.route('/protected/self', methods=['GET'])
@jwt_required
@get_current_user
def get_self(current_user):
    return jsonify(
        user=current_user.profile.to_public_json()
    ), status.HTTP_200_OK


@blueprint.route('/protected/self/friends', methods=['GET'])
@jwt_required
@get_current_user
def get_friends(current_user):
    relationships = UserRelationship.get_filtered(user_id=current_user.id)[0]
    friends = relationships.filter_by(relation=UserRelation.FRIEND.value)
    return jsonify(friends=[
        row.other_user(current_user.id).profile.to_public_json()
        for row in friends
    ]), status.HTTP_200_OK


@blueprint.route('/protected/self/friends/requests', methods=['GET'])
@jwt_required
@get_current_user
def get_friend_requests(current_user):
    relationships = UserRelationship.get_filtered(user_id=current_user.id)[0]
    requests = relationships.filter(or_(
        UserRelationship.relation
        == UserRelation.FRIEND_REQUEST_FROM_A_TO_B.value,
        UserRelationship.relation
        == UserRelation.FRIEND_REQUEST_FROM_B_TO_A.value
    ))
    return jsonify(requests={
        'incoming': [
            row.other_user(current_user.id).profile.to_public_json()
            for row in requests
            if row.user_is_requestee(current_user.id)
        ],
        'outgoing': [
            row.other_user(current_user.id).profile.to_public_json()
            for row in requests
            if row.user_is_requester(current_user.id)
        ]
    }), status.HTTP_200_OK


@blueprint.route('/protected/user/id/<user_id>', methods=['GET'])
@jwt_required
@get_user
def get_user_by_id(user_id, user):
    return jsonify(user=user.profile.to_public_json()), status.HTTP_200_OK


@blueprint.route('/protected/user/id/<user_id>/relationship', methods=['GET'])
@jwt_required
@get_current_user
@get_user
@distinct_users_required
def get_relationship(user_id, user, current_user):
    relationship, *args = UserRelationship.get_first(
        user_id_pair=[user_id, current_user.id]
    )
    return jsonify(relationship=(
        relationship.relation if relationship else UserRelation.STRANGER()
    )), status.HTTP_200_OK


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
        relationship = UserRelationship(
            **sorted_users,
            relation=relation,
            since=func.now()
        )
        db.session.add(relationship)
        db.session.commit()
        emit_relationship_update(user_id, relationship)
        emit_contact_update(
            relation_before=UserRelation.STRANGER(),
            relation_after=relation,
            user_pair=[current_user, user]
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
        emit_relationship_update(user_id, relationship, {
            'relation': UserRelation.STRANGER()
        })
        emit_contact_update(
            relation_before=relationship.relation,
            relation_after=UserRelation.STRANGER(),
            user_pair=[current_user, user]
        )
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

    if relationship and relationship.user_is_requestee(current_user.id):
        relation = relationship.relation
        relationship.relation = UserRelation.FRIEND.value
        relationship.since = func.now()
        db.session.commit()
        emit_relationship_update(user_id, relationship)
        emit_contact_update(
            relation_before=relation,
            relation_after=UserRelation.FRIEND.value,
            user_pair=[current_user, user]
        )
        return jsonify(
            relationship=UserRelation.FRIEND.value
        ), status.HTTP_200_OK
    else:
        return jsonify(), status.HTTP_404_NOT_FOUND
