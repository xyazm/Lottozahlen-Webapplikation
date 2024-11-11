import { useState, useEffect, useCallback, useRef } from 'react';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(1800); // 30 Minuten
  const [timerActive, setTimerActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState(null);

  const sessionTimeoutRef = useRef(null);

  // API-Anfrage zum Versenden des Zugangscodes
  const sendAccessCode = async (email) => {
    if (!email.endsWith('@rub.de')) {
      setErrorMessage('Nur E-Mail-Adressen der RUB-Domäne (@rub.de) sind erlaubt.');
      setConfirmationMessage(null);
      return false;
    }

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setConfirmationMessage('Zugangscode wurde erfolgreich verschickt!');
        setErrorMessage(null);
        return true;
      } else {
        setErrorMessage('Fehler beim Senden des Zugangscodes.');
        setConfirmationMessage(null);
        return false;
      }
    } catch (error) {
      setErrorMessage(error.message);
      setConfirmationMessage(null);
      return false;
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

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;
        localStorage.setItem('token', token);
        login();
        setErrorMessage(null);
        return true;
      } else {
        setErrorMessage('Ungültiger Zugangscode oder E-Mail.');
        return false;
      }
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    }
  };

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setTimerActive(false);
    setSessionTimeLeft(0);
    localStorage.removeItem('token');
    alert('Deine Sitzung ist abgelaufen. Du wirst nun abgemeldet.');
    window.location.href = '/login';
  }, []);

  const resetSessionTimeout = useCallback(() => {
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);

    sessionTimeoutRef.current = setTimeout(() => {
      logout();
    }, sessionTimeLeft * 1000);
  }, [logout, sessionTimeLeft]);

  const login = useCallback(() => {
    setIsAuthenticated(true);
    setTimerActive(true);
    setSessionTimeLeft(1800);
    resetSessionTimeout();
    window.location.href = '/lottoschein';
  }, [resetSessionTimeout]);

  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      const response = await fetch('http://localhost:5000/verify-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setTimerActive(true);
        setSessionTimeLeft(1800);
        resetSessionTimeout();
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      }
    };

    checkTokenValidity();
  }, []);

  useEffect(() => {
    const handleActivity = () => {
      if (isAuthenticated) resetSessionTimeout();
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [resetSessionTimeout, isAuthenticated]);

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

  return {
    isAuthenticated,
    login,
    logout,
    sessionTimeLeft,
    errorMessage,
    confirmationMessage,
    sendAccessCode,
    validateAccessCode,
  };
};

export default useAuth;