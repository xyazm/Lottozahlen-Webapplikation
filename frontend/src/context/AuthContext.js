import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(1800); 
  const [timerActive, setTimerActive] = useState(false);
  const sessionTimeoutRef = useRef(null);

  // Funktion zum Einloggen mit Token
  const login = useCallback((token) => {
    localStorage.setItem('token', token);
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    setIsAdmin(decodedToken.is_admin);
    setIsAuthenticated(true);
    startSessionTimer();
  }, []);

  // Funktion zum Ausloggen
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setTimerActive(false);
    setSessionTimeLeft(0);
    clearTimeout(sessionTimeoutRef.current);
    alert('Deine Sitzung ist abgelaufen. Du wirst nun abgemeldet.');
    window.location.href = '/login';
  }, []);

  // Funktion zum Starten des Session-Timers
  const startSessionTimer = useCallback(() => {
    setTimerActive(true);
    setSessionTimeLeft(1800); // 30 Minuten
    resetSessionTimeout();
  }, []);

  // Funktion zum Zurücksetzen des Session-Timers
  const resetSessionTimeout = useCallback(() => {
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);

    sessionTimeoutRef.current = setTimeout(() => {
      logout();
    }, sessionTimeLeft * 1000);
  }, [logout, sessionTimeLeft]);

  // API-Anfrage zum Versenden des Zugangscodes
  const sendAccessCode = async (email, acceptTerms = false) => {
    if (!email.endsWith('@rub.de')) {
      return { status: 'error', message: 'Nur E-Mail-Adressen der RUB-Domäne (@rub.de) sind erlaubt.' };
    }

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, accept_terms: acceptTerms }),
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
      const response = await fetch('http://localhost:5000/validate_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, access_code: accessCode }),
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