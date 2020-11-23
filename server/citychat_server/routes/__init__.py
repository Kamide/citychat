from flask import jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

cors = CORS(supports_credentials=True)
jwt = JWTManager()


def jwt_error_response(f):
    def wrapper(*args, **kwargs):
        message = f(*args, **kwargs)

        if isinstance(message, dict):
            return jsonify(jwt={'status': 401} | message), 401
        else:
            return jsonify(jwt={
                'status': 401,
                'message': message
            }), 401

    return wrapper


@jwt.claims_verification_failed_loader
@jwt_error_response
def claims_verification_failed_loader(callback):
    return callback


@jwt.expired_token_loader
@jwt_error_response
def expired_token_callback(expired_token):
    expired_access_token = expired_token['type'] == 'access'
    return {
        'expired': {
            'access_token': expired_access_token,
            'refresh_token': not expired_access_token
        }
    }


@jwt.invalid_token_loader
@jwt_error_response
def invalid_token_loader(callback):
    return callback


@jwt.needs_fresh_token_loader
@jwt_error_response
def needs_fresh_token_loader(callback):
    return callback


@jwt.revoked_token_loader
@jwt_error_response
def revoked_token_loader(callback):
    return callback


@jwt.unauthorized_loader
@jwt_error_response
def unauthorized_loader_callback(callback):
    return callback


@jwt.user_loader_error_loader
@jwt_error_response
def user_loader_error_loader(callback):
    return callback
