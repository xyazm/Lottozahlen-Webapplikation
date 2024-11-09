# run.py
from app import create_app

app = create_app()

if __name__ == '__main__':
    # Starte die App mit SSL-Kontext auf Port 5001
    app.run(debug=True)  # Setze debug=False in der Produktion