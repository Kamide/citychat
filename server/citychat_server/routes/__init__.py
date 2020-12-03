from flask import jsonify
from flask_api import status
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO

from citychat_server.models.jwt import JWTBlacklist

cors = CORS(supports_credentials=True)
jwt = JWTManager()
socketio = SocketIO(cors_allowed_origins='*')


@jwt.expired_token_loader
def expired_token_callback(expired_token):
    return jsonify(
        expired_token=expired_token['type']
    ), status.HTTP_401_UNAUTHORIZED


@jwt.token_in_blacklist_loader
def token_in_blacklist_callback(decoded_token):
    return JWTBlacklist.has_row(jti=decoded_token['jti'])
