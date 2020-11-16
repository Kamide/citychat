from werkzeug.security import generate_password_hash

from citychat_server.cityform.fields import (
    EmailField,
    PasswordField,
    StringField,
    SubmitField
)
from citychat_server.cityform.form import Form
from citychat_server.cityform.validators import Length, Required
from citychat_server.models.user import UserProfile


def strip(s):
    return s.strip()


class UserForm(Form):
    name = StringField(
        label='Name',
        validators=[Required(), Length(max=UserProfile.name.type.length)],
        pre_filters=[strip]
    )
    email = EmailField(
        label='Email Address',
        validators=[Required()],
        pre_filters=[strip]
    )
    password = PasswordField(
        label='Password',
        validators=[Required()],
        post_filters=[generate_password_hash]
    )
    submit = SubmitField(label='Submit')

    def __init__(self):
        super().__init__(method='post', id_prefix='user')
