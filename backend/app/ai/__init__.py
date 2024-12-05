from flask import Blueprint

feedback_routes = Blueprint('feedback', __name__)

# Importiere alle Funktionen und Routen aus den Untermodulen
from .groq_feedback import *