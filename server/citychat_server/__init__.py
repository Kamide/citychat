from flask import Flask

from citychat_server.models import db, migrate, login_manager
from citychat_server.routes import cors


def create_app():
    app = Flask(__name__)
    app.config.from_pyfile('settings.py')

    db.init_app(app)
    migrate.init_app(app, db, render_as_batch=True)
    login_manager.init_app(app)
    cors.init_app(app)

    with app.app_context():
        from citychat_server.routes import (
            auth
        )

        app.register_blueprint(auth.blueprint)

        return app
