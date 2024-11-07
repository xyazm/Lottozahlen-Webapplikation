import React, { useState } from 'react';
import Button from '../Button/Button';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Cookies from 'js-cookie';


export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState(''); // Zustand für die Bestätigung
  const navigate = useNavigate();

  const fetchProtectedData = async () => {
    const token = Cookies.get('token'); // Token aus den Cookies holen
    const response = await fetch('https://localhost:5000/protected', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Token im Header hinzufügen
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('Error data:', errorData);
      throw new Error('Fehler beim Zugriff auf geschützte Route!');
    }

    const data = await response.json();
    console.log('Protected data:', data); // Die geschützten Daten hier verwenden
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // E-Mail-Domäne überprüfen (nur RUB-Domäne)
    if (!email.endsWith('@rub.de')) {
      setErrorMessage('Nur E-Mail-Adressen der RUB-Domäne (@rub.de) sind erlaubt.');
      return;
    }
  
  // Zugangscode validieren
  try {
    const response = await fetch('https://localhost:5000/validate_code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, access_code: accessCode }), // Zugangscode hier senden
    });

    if (!response.ok) {
      throw new Error('Ungültiger Zugangscode!');
    }

    // Benutzerdaten im useAuth login
    const data = await response.json();

    // Hier das Token speichern, das vom Server zurückgegeben wurde
    if (data.token) {
      Cookies.set('token', data.token, {
        sameSite: 'None', // oder 'Lax' je nach Bedarf
        secure: true // Setzen Sie dies auf true, wenn Sie HTTPS verwenden
    });
    }

    await login(email, accessCode); // Verwende die login-Funktion aus dem useAuth-Hook
    await fetchProtectedData();

    navigate('/lottoschein'); // Navigation zur gewünschten Seite
  } catch (error) {
    setErrorMessage(error.message); // Fehlerfall
  }
};

  const handleSendAccessCode = () => {
    fetch('https://localhost:5000/login', { // Diese Route muss vorhanden sein
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json"
      },
      body: JSON.stringify({ email }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Fehler beim Senden des Zugangscodes!');
        }
        return response.json();
      })
      .then(() => {
        setConfirmationMessage('Zugangscode wurde erfolgreich verschickt!'); // Erfolgsmeldung
      })
      .catch((error) => {
        setErrorMessage(error.message); // Fehlerfall
      });
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 lg:px-8 text-rubBlue">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="text-left">Logge dich mit deinem RUB-Konto ein</h2>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {confirmationMessage && <p className="text-green-500">{confirmationMessage}</p>} {/* Bestätigungsnachricht */}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
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
            <div className="mt-4">
            <Button buttonId="send-access-code-button" text="Zugangscode anfordern" onClick={handleSendAccessCode} />
          </div>
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
          </div>

          <div>
            <Button buttonId="login-button" text="Login" />
          </div>
        </form>
      </div>
    </div>
  );
}