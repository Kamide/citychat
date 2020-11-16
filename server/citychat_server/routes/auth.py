from flask import Blueprint, jsonify, request

from citychat_server.forms import UserForm
from citychat_server.models import db
from citychat_server.models.user import User, UserProfile

blueprint = Blueprint('auth', __name__)


@blueprint.route('/signup', methods=['GET', 'POST'])
def signup():
    form = UserForm()

    if request.method == 'POST':
        form.populate(request.get_json())

        if form.validate():
            if UserProfile.has_row(**UserProfile.filter_dict(c=['email'],
                                                             **form.values)):
                form.errors['email'].append('This email address '
                                            'is already in use')
                return jsonify(errors=form.errors), 409

            user = User(**User.filter_dict(**form.values))
            db.session.add(user)
            db.session.flush()

            user_profile = UserProfile(
                id=user.id,
                **UserProfile.filter_dict(**form.values)
            )
            db.session.add(user_profile)
            db.session.commit()
            return jsonify(redirect='/signup/await'), 202
        else:
            return jsonify(errors=form.errors), 400

    return jsonify(form=form.to_json()), 200
