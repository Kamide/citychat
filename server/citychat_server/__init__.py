from flask import Flask


def create_app():
    from citychat_server.models import db, migrate
    from citychat_server.models import models  # noqa: F401
    from citychat_server.mail import mail
    from citychat_server.routes import cors, jwt, socketio

    app = Flask(__name__)
    app.config.from_pyfile('settings.py')

    db.init_app(app)
    migrate.init_app(app, db, render_as_batch=True)
    mail.init_app(app)
    cors.init_app(app)
    jwt.init_app(app)
    socketio.init_app(app)

    with app.app_context():
        from citychat_server.routes import (
            auth,
            chat,
            search,
            user
        )

        app.register_blueprint(auth.blueprint)
        app.register_blueprint(chat.blueprint)
        app.register_blueprint(search.blueprint)
        app.register_blueprint(user.blueprint)

        return app
