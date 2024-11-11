import React, { useState } from 'react';
import Button from '../Button/Button';
import useAuth from '../../hooks/useAuth';

export default function Login() {
  const { sendAccessCode, validateAccessCode, errorMessage, confirmationMessage } = useAuth();
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');

  const handleSendAccessCode = async (e) => {
    e.preventDefault();
    await sendAccessCode(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await validateAccessCode(email, accessCode);
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 lg:px-8 text-rubBlue">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="text-left">Logge dich mit deinem RUB-Konto ein</h2>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {confirmationMessage && <p className="text-green-500">{confirmationMessage}</p>}
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
            <Button buttonId="login-button" text="Login" onClick={handleLogin} />
          </div>
        </div>
      </div>
    </div>
  );
}