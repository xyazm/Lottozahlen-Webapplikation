from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import random
import string
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS to allow cross-origin requests
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

SETTINGS_FILE = 'settings.json'

# Load settings from the JSON file
def load_settings():
    if os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE, 'r') as file:
            return json.load(file)
    return {}

# Save settings to the JSON file
def save_settings(settings):
    with open(SETTINGS_FILE, 'w') as file:
        json.dump(settings, file, indent=4)

@app.route('/settings', methods=['GET'])
def get_settings():
    settings = load_settings()
    return jsonify(settings)

@app.route('/settings', methods=['POST'])
def update_settings():
    new_settings = request.json
    save_settings(new_settings)
    return jsonify({'message': 'Settings saved successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Start the server on port 5000