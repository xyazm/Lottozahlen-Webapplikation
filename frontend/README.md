# Bachelorarbeitsprojekt

## Thema
Das Thema meiner Bachelorarbeit lautet "Analyse von Lotto-Mustern". Das Projekt umfasst eine Webanwendung, die es Benutzern ermöglicht, Lottoergebnisse und -muster zu analysieren, um informierte Entscheidungen zu treffen.

## Erste Schritte

### Voraussetzungen
Stellen Sie sicher, dass Sie Folgendes auf Ihrem Rechner installiert haben:
- Node.js (für das React-Frontend)
- Python (für das Flask-Backend)
- Einen Paketmanager wie `npm` oder `yarn` für JavaScript-Abhängigkeiten.

### Projekt einrichten

1. **Repository klonen**
   ```bash
   git clone https://github.com/xyazm/Lottozahlen-Webapplikation.git
   ```
   ```bash
   cd your-project-directory
   ```

2. **Virtuelle Umgebung für Flask erstellen und aktivieren**

   ```bash
   source venv/bin/activate  
   ```

3. **Flask-Abhängigkeiten installieren**
   ```bash
   pip install -r requirements.txt 
   ```
   ```bash
   pip freeze > requirements.txt 
   ```

### Server starten

#### React-Entwicklungsserver starten
Öffnen Sie ein neues Terminal, navigieren Sie in das React-Frontend-Verzeichnis (z.B. `frontend`) und führen Sie aus:
```bash
npm install  
```
```bash
npm start    # React-Entwicklungsserver starten, beenden Control+C
```
```bash
npm run build   # React-Prod 
```

Die React-App sollte jetzt unter "http://localhost:3000" laufen.

#### Flask-Server starten
In einem weiteren Terminal, stellen Sie sicher, dass Sie im Verzeichnis Ihres Flask-Backends sind und führen Sie aus:
```bash
flask run  
```
Die Flask-API sollte jetzt unter "http://localhost:5000" laufen.

## To-Do
- [ ] Admin login
- [ ] prüfen der Token und sicherheit

## Erledigte Aufgaben
- [x] Login Timer 
- [x] Logik für Kontakformular mit Mailtrap
- [x] Token setzen
- [x] Login Session bricht beim aktualisieren ab
- [x] Login -> Pin per Mail für Studenten, nur für rub studenten