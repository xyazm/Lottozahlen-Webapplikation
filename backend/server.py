import flask

app = flask.Flask(__name__)

@app.route('/')

def hello():
    return 'Hello, World!'

print(flask.__version__)