# run.py
from app import create_app
import ssl

app = create_app()

context = ssl.SSLContext(ssl.PROTOCOL_TLS)
context.load_cert_chain('path/to/your/server.cert', 'path/to/your/server.key')


if __name__ == '__main__':
    app.run(debug=True)  # Setze debug=False in der Produktion