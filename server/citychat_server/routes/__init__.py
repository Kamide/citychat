from flask_cors import CORS
from flask_jwt_extended import JWTManager

from citychat_server.models.jwt import JWTBlacklist

cors = CORS(supports_credentials=True)
jwt = JWTManager()


@jwt.expired_token_loader
def expired_token_callback(expired_token):
    expired_access_token = expired_token['type'] == 'access'
    return {
        'expired': {
            'accessToken': expired_access_token,
            'refreshToken': not expired_access_token
        }
    }


@jwt.token_in_blacklist_loader
def token_in_blacklist_callback(decoded_token):
    return JWTBlacklist.has_row(jti=decoded_token['jti'])
