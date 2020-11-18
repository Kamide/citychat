from flask import current_app
from itsdangerous import (
    BadSignature,
    SignatureExpired,
    TimedJSONWebSignatureSerializer
)


def encode_token(obj, salt, expires_in):
    return TimedJSONWebSignatureSerializer(
        secret_key=current_app.config['SECRET_KEY'],
        expires_in=expires_in
    ).dumps(obj=obj, salt=salt)


def decode_token(s, salt, expires_in):
    serializer = TimedJSONWebSignatureSerializer(
        secret_key=current_app.config['SECRET_KEY'],
        expires_in=expires_in
    )

    try:
        return serializer.loads(s=s, salt=salt)
    except (BadSignature, SignatureExpired):
        raise
