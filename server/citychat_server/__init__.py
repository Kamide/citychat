from flask import Flask


def create_app():
    from citychat_server import models
    from citychat_server.mail import mail
    from citychat_server.routes import cors, jwt

    app = Flask(__name__)
    app.config.from_pyfile('settings.py')

    models.db.init_app(app)
    models.migrate.init_app(app, models.db, render_as_batch=True)
    mail.init_app(app)
    cors.init_app(app)
    jwt.init_app(app)

    with app.app_context():
        from citychat_server.routes import (
            auth,
            user
        )

        app.register_blueprint(auth.blueprint)
        app.register_blueprint(user.blueprint)

        return app
