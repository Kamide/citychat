from datetime import datetime as dt

from citychat_server.models import CRUDMixin, db


class JWTBlacklist(db.Model, CRUDMixin):
    __tablename__ = 'jwt_blacklist'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    audience = db.Column(
        db.Integer,
        db.ForeignKey('user.id', ondelete='SET NULL'),
        nullable=True,
        unique=False
    )
    jti = db.Column(db.String(255), nullable=False, unique=True)
    token_type = db.Column(db.String(255), nullable=False, unique=False)
    issue_date = db.Column(db.DateTime, nullable=False, unique=False)
    expiration_date = db.Column(db.DateTime, nullable=False, unique=False)

    def __str__(self):
        return str(self.to_json())

    @classmethod
    def insert_commit(cls, decoded_token):
        return super().insert_commit(
            audience=decoded_token['identity'],
            jti=decoded_token['jti'],
            token_type=decoded_token['type'],
            issue_date=dt.fromtimestamp(decoded_token['iat']),
            expiration_date=dt.fromtimestamp(decoded_token['exp'])
        )
