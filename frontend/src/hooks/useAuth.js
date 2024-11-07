import { useState, useEffect, useCallback } from 'react';
import { login as authLogin, logout as authLogout, resetSessionTimeout } from '../services/authService';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null); // 'admin' oder 'student'
  const [sessionTimeLeft, setSessionTimeLeft] = useState(1800); // 30 Minuten in Sekunden

  // Funktion zum Einloggen
  const login = useCallback((email, accessCode) => {
    return authLogin(email, accessCode) // authLogin sollte auch den accessCode verwenden
      .then((token) => {
        setIsAuthenticated(true);
        setSessionTimeLeft(1800); // Setzt den Session-Timer auf 30 Minuten
        return token; // Gebe den Token zurück
      })
      .catch((error) => {
        alert(error);
        throw error;
      });
  }, []);

  // Funktion zum Abmelden
  const logout = useCallback(() => {
    authLogout();
    setIsAuthenticated(false);
    setUserType(null);
    setSessionTimeLeft(0); // Timer zurücksetzen
  }, []);

  // Effekt zur Verwaltung des Session-Timers
  useEffect(() => {
    if (isAuthenticated) {
      resetSessionTimeout(); // Session-Timer zurücksetzen (vom authService)
    }
  }, [isAuthenticated]);

  // Timer herunterzählen
  useEffect(() => {
    if (isAuthenticated && sessionTimeLeft > 0) {
      const interval = setInterval(() => {
        setSessionTimeLeft((prevTime) => prevTime - 1);
      }, 1000); // Jede Sekunde herunterzählen

      return () => clearInterval(interval); // Aufräumen, wenn der Benutzer sich ausloggt
    } else if (sessionTimeLeft === 0) {
      logout(); // Session abgelaufen
    }
  }, [isAuthenticated, sessionTimeLeft, logout]);

  return {
    isAuthenticated,
    userType,
    login,
    logout,
    sessionTimeLeft, // Zeigt die verbleibende Zeit an
  };
};

export default useAuth;