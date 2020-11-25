from flask import Blueprint, current_app, jsonify, request
from flask_api import status
from flask_mail import Message
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    get_raw_jwt,
    jwt_optional,
    jwt_refresh_token_required,
    jwt_required,
    set_access_cookies,
    set_refresh_cookies
)
from itsdangerous import BadSignature, SignatureExpired
from sqlalchemy.sql import func

from citychat_server.forms import EmailForm, LoginForm, UserForm
from citychat_server.mail import debug_email, mail
from citychat_server.models import db
from citychat_server.models.jwt import JWTBlacklist
from citychat_server.models.user import User, UserProfile
from citychat_server.token import encode_token, decode_token

HOUR = 3600

blueprint = Blueprint('auth', __name__)


def send_confirmation(email_address):
    message = Message(
        subject='Please confirm your email address',
        recipients=[email_address]
    )
    token = encode_token(
        obj=email_address,
        salt='auth.signup_activate',
        expires_in=HOUR
    )
    message.body = (
        current_app.config['CLIENT_URL']
        + '/signup/activate/'
        + token.decode('utf-8')
    )
    mail.send(message)
    debug_email(message, current_app)


@blueprint.route('/public/signup', methods=['GET', 'POST'])
def signup():
    form = UserForm(id_prefix='signup', submit_label='Register')

    if request.method == 'POST':
        form.populate(request.get_json())

        if form.validate():
            if UserProfile.has_row(email=form.values['email']):
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
            return (
                jsonify(redirect='/signup/pending'),
                status.HTTP_202_ACCEPTED
            )
        else:
            return jsonify(errors=form.errors), status.HTTP_400_BAD_REQUEST

    return jsonify(form=form.to_json()), status.HTTP_200_OK


@blueprint.route('/public/signup/activate/<token>', methods=['PATCH'])
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
        return jsonify(), status.HTTP_201_CREATED
    except (BadSignature, SignatureExpired, ValueError):
        return jsonify(redirect='/signup/resend'), status.HTTP_400_BAD_REQUEST


@blueprint.route('/public/signup/resend', methods=['GET', 'POST'])
def signup_resend():
    form = EmailForm()

    if request.method == 'POST':
        form.populate(request.get_json())

        if form.validate():
            email = form.values['email']
            user_profile = UserProfile.get_first(email=email)

            if user_profile and not user_profile.user.is_active:
                send_confirmation(email)

            return (
                jsonify(redirect='/signup/pending'),
                status.HTTP_202_ACCEPTED
            )
        else:
            return jsonify(errors=form.errors), status.HTTP_400_BAD_REQUEST

    return jsonify(form=form.to_json()), status.HTTP_200_OK


@blueprint.route('/public/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()

    if request.method == 'POST':
        form.populate(request.get_json())

        if form.validate():
            user_profile = UserProfile.get_first_active(
                email=form.values['email']
            )

            if user_profile:
                user = user_profile.user

                if user.check_password(form.values['password']):
                    access_token = create_access_token(identity=user.id)
                    refresh_token = create_refresh_token(identity=user.id)
                    response = jsonify(redirect='/app')
                    set_access_cookies(response, access_token)
                    set_refresh_cookies(response, refresh_token)
                    return response, status.HTTP_200_OK

            form.errors['password'].append('You have entered an invalid '
                                           'username or password')
            return jsonify(errors=form.errors), status.HTTP_401_UNAUTHORIZED
        else:
            return jsonify(errors=form.errors), status.HTTP_400_BAD_REQUEST

    return jsonify(form=form.to_json()), status.HTTP_200_OK


@blueprint.route('/protected/login/check', methods=['GET'])
@jwt_optional
def login_check():
    user = User.get_first(id=get_jwt_identity())
    active = user.is_active if user else False
    return jsonify(active=active), status.HTTP_200_OK


@blueprint.route('/protected/logout', methods=['DELETE'])
@jwt_required
def logout_access_token():
    JWTBlacklist.insert_commit(get_raw_jwt())
    return jsonify(blacklisted=True), status.HTTP_200_OK


@blueprint.route('/private/logout', methods=['DELETE'])
@jwt_refresh_token_required
def logout_refresh_token():
    JWTBlacklist.insert_commit(get_raw_jwt())
    return jsonify(blacklisted=True), status.HTTP_200_OK


@blueprint.route('/private/refresh-token', methods=['POST'])
@jwt_refresh_token_required
def refresh_token():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    response = jsonify(status=200)
    set_access_cookies(response, access_token)
    return response, status.HTTP_200_OK
