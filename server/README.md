# CityChat Server

## First-Time Initialization

To create and start a virtual environment with Python 3.9.0 and the required packages, run:

```bash
pyenv local 3.9.0
eval "$(pyenv init -)"
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Starting the Virtual Environment

To start the virtual environment, run:

```bash
source venv/bin/activate
```

## Flask CLI Initialization

For Flask CLI commands, run:

```bash
export FLASK_APP=citychat_server
```

## Starting the Server

### Python CLI

To start the server with the Python CLI, run:

```bash
python app.py
```

### Flask CLI

To start the server with the Flask CLI, run:

```bash
flask run
```
