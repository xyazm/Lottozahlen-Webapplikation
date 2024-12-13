from flask import Blueprint
from ..jwt_helper import login_required

feedback_routes = Blueprint('feedback', __name__)

# Importiere alle Funktionen und Routen aus den Untermodulen
from .groq_feedback import *