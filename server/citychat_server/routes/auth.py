from flask import Blueprint, jsonify, request

from citychat_server.forms import SignupForm

blueprint = Blueprint('auth', __name__)


@blueprint.route('/signup', methods=['GET', 'POST'])
def signup():
    form = SignupForm(request.method, id_prefix='signup')

    if request.method == 'POST':
        pass

    return jsonify(form=form.to_json())
