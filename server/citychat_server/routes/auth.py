from flask import Blueprint, current_app, jsonify, request
from flask_mail import Message
from itsdangerous import BadSignature, SignatureExpired
from sqlalchemy.sql import func

from citychat_server.forms import EmailForm, UserForm
from citychat_server.mail import debug_email, mail
from citychat_server.models import db
from citychat_server.models.user import User, UserProfile
from citychat_server.routes import client_url_for
from citychat_server.token import encode_token, decode_token

blueprint = Blueprint('auth', __name__)
HOUR = 3600


def send_confirmation(email_address):
    message = Message(
        subject='Please confirm your email address',
        recipients=[email_address]
    )
    message.body = client_url_for(
        'auth.signup_activate',
        token=encode_token(
            obj=email_address,
            salt='auth.signup_activate',
            expires_in=HOUR
        )
    )
    mail.send(message)
    debug_email(message, current_app)


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

            send_confirmation(user_profile.email)
            return jsonify(redirect='/signup/pending'), 202
        else:
            return jsonify(errors=form.errors), 400

    return jsonify(form=form.to_json()), 200


@blueprint.route('/signup/activate/<token>', methods=['GET'])
def signup_activate(token):
    try:
        email = decode_token(
            s=token,
            salt='auth.signup_activate',
            expires_in=HOUR
        )
        user_profile = UserProfile.get_first(email=email)

        if not user_profile or user_profile.user.is_active:
            raise ValueError

        user_profile.user.date_activated = func.now()
        db.session.commit()
        return jsonify(redirect=''), 200
    except (BadSignature, SignatureExpired, ValueError):
        return jsonify(redirect='/signup/resend'), 404


@blueprint.route('/signup/resend', methods=['GET', 'POST'])
def signup_resend():
    form = EmailForm()

    if request.method == 'POST':
        form.populate(request.get_json())

        if form.validate():
            email = form.values['email']
            user_profile = UserProfile.get_first(email=email)

            if user_profile and not user_profile.user.is_active:
                send_confirmation(email)

            return jsonify(redirect='/signup/pending'), 400
        else:
            return jsonify(errors=form.errors), 400

    return jsonify(form=form.to_json()), 200
