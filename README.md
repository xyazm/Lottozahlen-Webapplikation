# Bachelorarbeit - Lottoscheinanalyse

## Easy Start with Docker

### Repository klonen
Klonen des Repositories inklusive Submodule:

```bash
git clone --recurse-submodules https://github.com/xyazm/Lottozahlen-Webapplikation.git
```

Auf der Seite von Groq soll ein API-Key erstellt werden. Registriere dich kostenlos unter [Groq Console](https://console.groq.com/keys) und erstelle dort einen API-Key.

### `.env` Datei im Backend
Ergänze die Datei `.env.txt` im `backend`-Verzeichnis mit den erforderlichen Variablen:

```env
JWT_SECRET=your_jwt_secret_here
SECRET_KEY=your_secret_key_here
MAIL_USERNAME=your_mail_username_here
MAIL_PASSWORD=your_mail_password_here
MAIL_DEFAULT_SENDER=your_email@example.com
MAIL_SERVER=mail_server
MAIL_POR=mail_port
GROQ_API_KEY=your_groq_api_key_here
```
> JWT_SECRET und SECRET_KEY: Erstelle diese Schlüssel selbst, z. B. mit einem sicheren Passwort-Generator. Eine Länge von mindestens 32 Zeichen wird empfohlen.

> Entferne die Endung `.txt`, sodass die Datei nur noch `.env` heißt.

### `.env` Datei im frontend
Entferne die Dateiendung `.txt` in der Datei `.env.txt` im `Frontend`-Verzeichnis, sodass die Datei nur noch `.env` heißt.

### Docker starten
Starte die Anwendung mit Docker:

```bash
docker-compose up -d
```

Die Datenbank wird automatisch mit Beispieldaten und einem Standard-Admin-Benutzer befüllt. Die Zugangsdaten des Admin-Benutzers lauten:
- **Benutzername:** `admin`
- **Passwort:** `admin`

---

## Manueller Setup-Prozess

### Repository klonen
Klonen des Repositories inklusive Submodule:

```bash
git clone --recurse-submodules <URL-zum-Repository>
```

### 1. Neuen Datenbank-User erstellen
Erstelle einen neuen MySQL-Datenbank-Benutzer und eine Datenbank, beispielsweise mit dem Namen `Bachelorarbeit_Lottoscheinanalyse`.

### 2. Groq API-Key erstellen
Registriere dich kostenlos unter [Groq Console](https://console.groq.com/keys) und erstelle dort einen API-Key.

### 3. `.env.txt` Datei ergänzen
Ergänze die Datei `.env.txt` im `backend`-Verzeichnis mit den folgenden Variablen:

```env
JWT_SECRET=your_jwt_secret_here
SECRET_KEY=your_secret_key_here
MAIL_USERNAME=your_mail_username_here
MAIL_PASSWORD=your_mail_password_here
MAIL_DEFAULT_SENDER=your_email@example.com
MAIL_SERVER=mail_server
MAIL_POR=mail_port
DB_USER=datenbank_user
DB_PASSWORD=passwort_des_users
DB_SERVER=name_des_datenbank_servers_zb_localhost
DB_NAME=name_der_db_beispiel_Bachelorarbeit_Lottoscheinanalyse
FLASK_APP=app:create_app
FLASK_ENV=development
FLASK_RUN_PORT=5000
GROQ_API_KEY=your_groq_api_key_here
```

> Entferne die Endung `.txt`, sodass die Datei nur noch `.env` heißt.

### `.env` Datei im frontend
Entferne die Dateiendung `.txt` in der Datei `.env.txt` im `Frontend`-Verzeichnis, sodass die Datei nur noch `.env` heißt.
Ändere den Port auf 5000, in der `.env` Datei.

### 4. Admin-Benutzer einfügen
Füge einen Admin-Benutzer in die Datenbank ein:

```sql
INSERT INTO admins (id, name, email, password)
VALUES (1, 'Admin Name', 'Admin Login-ID', 'gehashtes_passwort');
```

Das Backend hasht das Passwort mit der Methode `pbkdf2:sha256`.

### 5. Virtuelle Umgebung erstellen und Abhängigkeiten installieren
Im `backend`-Verzeichnis:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m flask db upgrade
```

Starte anschließend das Backend:

```bash
python -m flask run
```

### 7. Frontend installieren und starten
Wechsle in das `frontend`-Verzeichnis:

```bash
npm install
npm start
```

> **Hinweis:** Stelle sicher, dass du mindestens Node.js `v22.11.0` installiert hast.

---
Die Webanwendung ist dann über http://localhost:3000/ erreichbar.