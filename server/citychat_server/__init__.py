from flask import Flask


def create_app():
    from citychat_server.mail import mail
    from citychat_server.models import db, migrate, login_manager
    from citychat_server.models import (
        user
    )
    from citychat_server.routes import cors

    app = Flask(__name__)
    app.config.from_pyfile('settings.py')

    db.init_app(app)
    migrate.init_app(app, db, render_as_batch=True)
    login_manager.init_app(app)
    cors.init_app(app)
    mail.init_app(app)

    with app.app_context():
        from citychat_server.routes import (
            auth
        )

        app.register_blueprint(auth.blueprint)

        return app
