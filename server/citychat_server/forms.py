from citychat_server.cityform.fields import (
    EmailField,
    PasswordField,
    StringField,
    SubmitField
)
from citychat_server.cityform.form import Form
from citychat_server.cityform.validators import Length, Required
from citychat_server.models.user import UserProfile


class SignupForm(Form):
    name = StringField(
        label='Name',
        validators=[Required(), Length(max=UserProfile.name.type.length)]
    )
    email = EmailField(label='Email Address', validators=[Required()])
    password = PasswordField(label='Password', validators=[Required()])
    submit = SubmitField(label='Create New Account')
