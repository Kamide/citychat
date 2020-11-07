from flask import Blueprint, jsonify

blueprint = Blueprint('auth', __name__)


@blueprint.route('/', methods=['GET'])
def index():
    return jsonify(data='Hello, citychat-client!')
