import { useState, useEffect, useCallback, useRef } from 'react';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [sessionTimeLeft, setSessionTimeLeft] = useState(1800); // 30 Minuten
  const [timerActive, setTimerActive] = useState(false);

  const sessionTimeoutRef = useRef(null);

  const acceptTerms = async (email) => {
    try {
      const response = await fetch('http://localhost:5000/accept_terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
      return data;
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  };

  // API-Anfrage zum Versenden des Zugangscodes
  const sendAccessCode = async (email, acceptTerms = false) => {
    if (!email.endsWith('@rub.de')) {
      return { status: 'error', message: 'Nur E-Mail-Adressen der RUB-Domäne (@rub.de) sind erlaubt.'};
    }

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, accept_terms: acceptTerms })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { status: 'error', message: error.message};
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
        localStorage.setItem('token', token);
  
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
  
        
      if (decodedToken.is_admin) {
        setIsAdmin(true);
        setIsAuthenticated(true); // Admin-Status setzen und authentifiziert
        return { isAdmin: true };
      } else {
        setIsAdmin(false);
        setIsAuthenticated(true); // Student-Status setzen und authentifiziert
        return { isAdmin: false };
      }
    } else {
      console.error("Kein Token im Response erhalten.");
      return { status: 'error', message: 'Ungültiger Zugangscode oder Passwort.' };
    }
    } catch (error) {
      console.error("Fehler beim API-Aufruf:", error);
      return { status: 'error', message: error.message};
    }
  };

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setIsAdmin(false);
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
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(decodedToken.is_admin); 
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
    isAdmin,
    login,
    logout,
    sessionTimeLeft,
    sendAccessCode,
    validateAccessCode,
  };
};

export default useAuth;