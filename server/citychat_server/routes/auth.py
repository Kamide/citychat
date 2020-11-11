from flask import Blueprint, jsonify

from citychat_server.routes.cityform import (
    city_input,
    city_input_required,
    city_label,
    city_submit,
    prefix_id
)

blueprint = Blueprint('auth', __name__)


@blueprint.route('/signup', methods=['GET'])
def index():
    fields = [
        city_label(html_for='username', value='Username'),
        city_input_required(type='text',
                            id='username',
                            args={'maxLength': 32,
                                  'pattern': r'^\w+$'}),

        city_label(html_for='password', value='Password'),
        city_input_required(type='password', id='password'),

        city_label(html_for='email', value='Email Address'),
        city_input_required(type='email',
                            id='email',
                            args={'maxLength': 254,
                                  'pattern': r'[^@]+@[^@]+\.[^@]+'}),

        city_label(html_for='name', value='Name'),
        city_input(type='text', id='name', args={'maxLength': 255}),

        city_submit(id='submit', value='Create New Account')
    ]
    prefix_id(fields, 'signUp')
    return jsonify(fields=fields)
