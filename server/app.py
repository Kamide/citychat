from dotenv import load_dotenv
from os import environ

from citychat_server import create_app
from citychat_server.routes import socketio

load_dotenv()

app = create_app()

if __name__ == '__main__':
    socketio.run(
        app,
        host=environ.get('APP_HOST') or 'localhost',
        port=environ.get('APP_PORT') or 5000
    )
