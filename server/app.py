from dotenv import load_dotenv
from os import environ

from citychat_server import create_app

load_dotenv()

app = create_app()

if __name__ == '__main__':
    app.run(host=environ.get('APP_HOST') or 'localhost',
            port=environ.get('APP_PORT') or 5000)
