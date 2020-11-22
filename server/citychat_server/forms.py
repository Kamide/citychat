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
    return s.strip() if isinstance(s, str) else ''


email = EmailField(
    label='Email Address',
    validators=[Required()],
    pre_filters=[strip]
)


class UserForm(Form):
    name = StringField(
        label='Name',
        validators=[Required(), Length(max=UserProfile.name.type.length)],
        pre_filters=[strip]
    )
    email = email
    password = PasswordField(
        label='Password',
        validators=[Required()],
        post_filters=[generate_password_hash]
    )
    submit = SubmitField(label='Submit')

    def __init__(self, id_prefix):
        super().__init__(method='post', id_prefix=id_prefix)


class EmailForm(Form):
    email = email
    submit = SubmitField(label='Send')

    def __init__(self):
        super().__init__(method='post', id_prefix='email')


class LoginForm(Form):
    email = email
    password = PasswordField(label='Password', validators=[Required()])
    submit = SubmitField(label='Log In')

    def __init__(self):
        super().__init__(method='post', id_prefix='login')
