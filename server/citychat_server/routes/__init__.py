from flask_cors import CORS
from flask_jwt_extended import JWTManager

cors = CORS(supports_credentials=True)
jwt = JWTManager()
