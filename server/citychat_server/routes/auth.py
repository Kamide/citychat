from flask import Blueprint, current_app, jsonify, request
from flask_api import status
from flask_mail import Message
from itsdangerous import BadSignature, SignatureExpired
from sqlalchemy.sql import func

from citychat_server.forms import EmailForm, LoginForm, UserForm
from citychat_server.mail import debug_email, mail
from citychat_server.models import db
from citychat_server.models.user import User, UserProfile
from citychat_server.routes import client_url_for
from citychat_server.token import encode_token, decode_token

HOUR = 3600

blueprint = Blueprint('auth', __name__)


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
                return jsonify(errors=form.errors), status.HTTP_409_CONFLICT

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
            return jsonify(redirect='/signup/pending'), \
                status.HTTP_202_ACCEPTED
        else:
            return jsonify(errors=form.errors), status.HTTP_400_BAD_REQUEST

    return jsonify(form=form.to_json()), status.HTTP_200_OK


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
        return jsonify(redirect=''), status.HTTP_201_CREATED
    except (BadSignature, SignatureExpired, ValueError):
        return jsonify(redirect='/signup/resend'), status.HTTP_400_BAD_REQUEST


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

            return jsonify(redirect='/signup/pending'), \
                status.HTTP_202_ACCEPTED
        else:
            return jsonify(errors=form.errors), status.HTTP_400_BAD_REQUEST

    return jsonify(form=form.to_json()), status.HTTP_200_OK


@blueprint.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()

    if request.method == 'POST':
        form.populate(request.get_json())

        if form.validate():
            user_profile = UserProfile.get_first(email=form.values['email'])

            if user_profile and user_profile.user.is_active \
               and user_profile.user.check_password(form.values['password']):
                return jsonify(redirect='/'), status.HTTP_200_OK

            form.errors['password'].append('You have entered an invalid '
                                           'username or password')
            return jsonify(errors=form.errors), status.HTTP_401_UNAUTHORIZED
        else:
            return jsonify(errors=form.errors), status.HTTP_400_BAD_REQUEST

    return jsonify(form=form.to_json()), status.HTTP_200_OK
