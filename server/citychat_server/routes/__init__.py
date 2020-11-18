from flask import current_app, url_for
from flask_cors import CORS

cors = CORS()


def client_url_for(endpoint, **values):
    return current_app.config['CLIENT_URL'] + url_for(endpoint, **values)
