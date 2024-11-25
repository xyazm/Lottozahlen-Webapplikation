# run.py
from app import create_app
from flask_caching import Cache

# Cache-Instanz erstellen
cache = Cache()

app = create_app()

if __name__ == '__main__':

     # Cache initialisieren
    cache.init_app(app)

    # Hook: Cache beim Beenden des Servers löschen
    @app.teardown_appcontext
    def clear_cache_on_shutdown(exception=None):
        print("Server wird heruntergefahren. Cache wird geleert...")
        cache.clear()
    app.run(debug=True)  # Setze debug=False in der Produktion