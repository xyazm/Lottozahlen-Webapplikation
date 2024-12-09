import { useState, useEffect, useCallback, useRef } from 'react';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(1800); // 30 Minuten
  const [timerActive, setTimerActive] = useState(false);
  const sessionTimeoutRef = useRef(null);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setTimerActive(false);
    setSessionTimeLeft(0);
    localStorage.removeItem('token'); // Entfernt den Token aus localStorage
    alert('Deine Sitzung ist abgelaufen. Du wirst nun abgemeldet.');
    window.location.href = '/login'; // Weiterleitung zum Login
  }, []);

  const resetSessionTimeout = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current); // Timeout löschen
    }

    sessionTimeoutRef.current = setTimeout(() => {
      logout(); // Logout nach der festgelegten Zeit
    }, sessionTimeLeft * 1000); // Timeout in Millisekunden
  }, [logout, sessionTimeLeft]);


  const login = useCallback(() => {
    setIsAuthenticated(true);
    setTimerActive(true);
    setSessionTimeLeft(1800);
    resetSessionTimeout();
    window.location.href = '/lottoschein'; 
  }, [resetSessionTimeout]);

  useEffect(() => {
    // Token-Überprüfung nur beim ersten Laden der Seite
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
        setSessionTimeLeft(1800); // Setze die Session-Zeit auf 30 Minuten
        resetSessionTimeout(); // Starte den Session-Timeout
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('token'); // Entferne den ungültigen Token
      }
    };

    checkTokenValidity(); // Nur einmal beim ersten Laden ausführen
  }, []); 

  useEffect(() => {
    const handleActivity = () => {
      if (isAuthenticated) {
        resetSessionTimeout();
      }
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
    setTimerActive,
  };
};

export default useAuth;