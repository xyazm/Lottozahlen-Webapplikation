import { useState, useEffect, useCallback } from 'react';

let sessionTimeout = null;

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(1800); // 30 Minuten
  const [timerActive, setTimerActive] = useState(false);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setTimerActive(false);
    setSessionTimeLeft(0);
    localStorage.removeItem('token'); // Entfernt den Token aus localStorage
    alert('Deine Sitzung ist abgelaufen. Du wirst nun abgemeldet.');
    window.location.href = '/login'; // Weiterleitung zum Login
  }, []);

  const resetSessionTimeout = useCallback(() => {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
      logout();
    }, 30 * 60 * 1000);
  }, [logout]);

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
          'Content-Type': 'application/json' 
        }
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setTimerActive(true); 
        setSessionTimeLeft(1800);
        resetSessionTimeout();
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('token'); // Entferne den ungültigen Token
      }
    };

    checkTokenValidity();
  }, [resetSessionTimeout]);

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