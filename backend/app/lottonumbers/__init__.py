from flask import Blueprint

lotto_db = Blueprint('lotto', __name__)

# Importiere alle Funktionen und Routen aus den Untermodulen
from .update_lotto_data import *
from .lottoscheine import *