import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// Erstelle den AuthContext
const AuthContext = createContext();

// Custom Hook für den einfachen Zugriff auf den Context
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider-Komponente zum Bereitstellen des Contexts
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(1800); // 30 Minuten Session
  const [timerActive, setTimerActive] = useState(false);
  const sessionTimeoutRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL;

  // Funktion zum Einloggen mit Token
  const login = useCallback((token) => {
    localStorage.setItem('token', token);
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    setIsAdmin(decodedToken.is_admin);
    setIsAuthenticated(true);
    startSessionTimer(); // Starte den Session-Timer nach Login
  }, []);

  // Funktion zum Ausloggen
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setTimerActive(false);
    setSessionTimeLeft(0);
    clearTimeout(sessionTimeoutRef.current); // Bereinige den Timer
    alert('Deine Sitzung ist abgelaufen. Du wirst nun abgemeldet.');
    window.location.href = '/login';
  }, []);

  // Funktion zum Starten des Session-Timers
  const startSessionTimer = useCallback(() => {
    setTimerActive(true);
    setSessionTimeLeft(1800); // Setze 30 Minuten neu
    resetSessionTimeout();
  }, []);

  // Funktion zum Zurücksetzen des Session-Timers
  const resetSessionTimeout = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    refreshToken();
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);

    sessionTimeoutRef.current = setTimeout(() => {
      logout();
    }, sessionTimeLeft * 1000);
  }, [logout, sessionTimeLeft]);

    // Funktion zum Erneuern des Tokens
    const refreshToken = useCallback(async () => {
      const token = localStorage.getItem('token');
      if (!token) return; // Wenn kein gültiger Token existiert, abbrechen
  
      try {
        const response = await fetch(`${API_URL}/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });
  
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.access_token);
        } else {
          console.error('Token-Erneuerung fehlgeschlagen.');
        }
      } catch (error) {
        console.error('Fehler bei der Token-Erneuerung:', error);
      }
    }, []);

  // API-Anfrage zum Versenden des Zugangscodes
  const sendAccessCode = async (email, acceptTerms = false) => {
    if (!email.endsWith('@rub.de')) {
      return { status: 'error', message: 'Nur E-Mail-Adressen der RUB-Domäne (@rub.de) sind erlaubt.' };
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, accept_terms: acceptTerms }),
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  };

  // API-Anfrage zur Überprüfung des Zugangscodes und Login-Start
  const validateAccessCode = async (email, accessCode) => {
    try {
      const response = await fetch(`${API_URL}/validate_code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, access_code: accessCode }),
        credentials: 'include',
      });
      const data = await response.json();

      if (data.access_token) {
        const token = data.access_token;
        login(token);
        return data;
      } else {
        console.error('Kein Token im Response erhalten.');
        return { status: 'error', message: 'Ungültiger Zugangscode oder Passwort.' };
      }
    } catch (error) {
      console.error('Fehler beim API-Aufruf:', error);
      return { status: 'error', message: error.message };
    }
  };

  // Token-Verifizierung beim ersten Laden der App
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(decodedToken.is_admin);
        setIsAuthenticated(true);
        startSessionTimer(); 
      } catch (error) {
        console.error('Ungültiger Token:', error);
        logout();
      }
    }
  }, [logout, startSessionTimer]);

  // Überwache die Session-Zeit und aktualisiere den Timer
  useEffect(() => {
    if (isAuthenticated && sessionTimeLeft > 0 && timerActive) {
      const interval = setInterval(() => {
        setSessionTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (sessionTimeLeft === 0) {
      logout();
    }
  }, [isAuthenticated, sessionTimeLeft, logout, timerActive]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        login,
        logout,
        sessionTimeLeft,
        sendAccessCode,
        validateAccessCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};