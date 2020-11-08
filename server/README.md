# CityChat Server

## First-Time Initialization

To create a virtual environment with Python 3.9.0 and the required packages, run:

```bash
pyenv local 3.9.0
eval "$(pyenv init -)"
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Starting the Server

To start the server, run:

```bash
source venv/bin/activate
python app.py
```

If preferred, to start the server with the Flask CLI, run:

```bash
source venv/bin/activate
export FLASK_APP=citychat_server
flask run
```
