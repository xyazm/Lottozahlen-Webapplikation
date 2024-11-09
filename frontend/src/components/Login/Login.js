import React, { useState } from 'react';
import Button from '../Button/Button';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth'


export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState(''); // Zustand für die Bestätigung
  const navigate = useNavigate();

  const handleSendAccessCode = async (e) => {
    e.preventDefault(); 
    if (!email.endsWith('@rub.de')) {
      setErrorMessage('Nur E-Mail-Adressen der RUB-Domäne (@rub.de) sind erlaubt.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({email})
    });

    if (response.ok) {
      setConfirmationMessage('Zugangscode wurde erfolgreich verschickt!');
      setErrorMessage('');
    } else {
      setErrorMessage('Fehler beim Senden des Zugangscodes.');
      setConfirmationMessage('');
    }
    } catch (error) {
      setErrorMessage(error.message);
      setConfirmationMessage('');
    }
  };

  // Funktion, um den Login zu starten
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/validate_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, access_code: accessCode }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;
        localStorage.setItem('token', token); // Speichere den Token im localStorage
        login(); // Authentifizierung starten
        navigate('/lottoschein'); // Weiterleitung nach dem Login
      } else {
        setErrorMessage('Ungültiger Zugangscode oder E-Mail.');
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 lg:px-8 text-rubBlue">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="text-left">Logge dich mit deinem RUB-Konto ein</h2>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {confirmationMessage && <p className="text-green-500">{confirmationMessage}</p>} {/* Bestätigungsnachricht */}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-l font-medium font-heading leading-6">
              Login-ID / E-Mail
            </label>
            <input
              placeholder="E-Mail"
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300"
            />
            <Button buttonId="send-access-code-button" text="Zugangscode anfordern" onClick={handleSendAccessCode} />
          </div>

          <div>
            <label htmlFor="accessCode" className="block text-l font-medium font-heading leading-6">
              Zugangscode
            </label>
            <input
              placeholder="Zugangscode"
              id="accessCode"
              required
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300"
            />
            <Button buttonId="login-button" text="Login" onClick={handleLogin}/>
          </div>
        </div>
      </div>
    </div>
  );
}