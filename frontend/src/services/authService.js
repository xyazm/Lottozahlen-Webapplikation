let sessionTimeout = null;

// Funktion zum Einloggen
export const login = (email) => {
  return fetch('http://localhost:5000/login', {  // Stelle sicher, dass die URL korrekt ist
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Falsche Anmeldedaten!');
      }
      return response.json();
    })
    .then((data) => {
      startSession(data.token); // Speichere den JWT-Token
      return data.token;
    });
};

// Funktion zum Abmelden
export const logout = () => {
  clearSession();
};

// Funktion zum Starten der Sitzung
const startSession = (token) => {
  localStorage.setItem('token', token); // Speichere den JWT-Token
  resetSessionTimeout();
};

// Funktion zum Zurücksetzen des Session-Timers
export const resetSessionTimeout = () => {
  clearTimeout(sessionTimeout);
  sessionTimeout = setTimeout(() => {
    alert('Session abgelaufen! Bitte erneut einloggen.');
    logout();
    window.location.href = '/login'; // Umleitung zur Login-Seite
  }, 30 * 60 * 1000); // 30 Minuten
};

// Funktion zum Beenden der Sitzung
const clearSession = () => {
  clearTimeout(sessionTimeout);
  localStorage.removeItem('token');
};