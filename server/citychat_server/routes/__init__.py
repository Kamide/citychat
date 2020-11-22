from flask import jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

cors = CORS(supports_credentials=True)
jwt = JWTManager()


@jwt.expired_token_loader
def my_expired_token_callback(expired_token):
    expired_access = expired_token['type'] == 'access'
    return jsonify(jwt={
        'status': 401,
        'expired': {
            'access': expired_access,
            'refresh': not expired_access
        }
    }), 401
