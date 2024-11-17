from flask import Blueprint

analysis_routes = Blueprint('analysis', __name__)

# Importiere alle Funktionen und Routen aus den Untermodulen
from .haeufigkeit_der_zahlen import *
from .primzahlen_analyse import *
from .gitter_analyse import *
