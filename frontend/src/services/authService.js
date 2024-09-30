let sessionTimeout = null;

// Simulierte Admin- und Studentendaten
const adminCredentials = {
  email: 'admin@example.com',
  password: 'admin',
};

const studentCredentials = {
  email: 'student@example.com',
  password: 'student',
};

// Funktion zum Einloggen
export const login = (email, password) => {
  return new Promise((resolve, reject) => {
    if (email === adminCredentials.email && password === adminCredentials.password) {
      startSession('admin');
      resolve('admin');
    } else if (email === studentCredentials.email && password === studentCredentials.password) {
      startSession('student');
      resolve('student');
    } else {
      reject('Falsche Anmeldedaten!');
    }
  });
};

// Funktion zum Abmelden
export const logout = () => {
  clearSession();
};

// Funktion zum Starten der Sitzung
const startSession = (userType) => {
  localStorage.setItem('userType', userType);
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
  localStorage.removeItem('userType');
};