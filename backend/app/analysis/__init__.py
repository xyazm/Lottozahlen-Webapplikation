from flask import Blueprint

analysis_routes = Blueprint('analysis', __name__)

# Importiere alle Funktionen und Routen aus den Untermodulen
from .haeufigkeit_der_zahlen import *
from .primzahlen_analyse import *
from .gitter_analyse import *
from .verteilungs_analyse import *
from .aufeinanderfolgene_zahlen import *
from .diagonale_analyse import *
from .ungerade_zahlen import *
from .summen_analyse import *
from .kleine_grosse_analyse import *