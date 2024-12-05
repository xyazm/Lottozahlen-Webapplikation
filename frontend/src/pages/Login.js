import React, { useState } from 'react';
import Button from '../components/Button';
import useAuth from '../hooks/useAuth';
import ConfirmationMessage from '../components/ConfirmationMessage'
import InputField from '../components/InputField';

export default function Login() {
  const { sendAccessCode, validateAccessCode} = useAuth();
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [messageType, setMessageType] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState(null);

  const handleSendAccessCode = async (e) => {
    e.preventDefault();
    const response = await sendAccessCode(email);
    setConfirmationMessage(response.message);
    setMessageType(response.status);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await validateAccessCode(email, accessCode);
    setConfirmationMessage(response.message);
    setMessageType(response.status);
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 lg:px-8 text-rubBlue">
    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2>Kontaktiere uns</h2>
      {/* Bestätigungsmeldung */}
      <ConfirmationMessage message={confirmationMessage} type={messageType} />
    </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="space-y-6">
          <InputField
            id="email"
            name="email"
            type="email"
            label="Login-ID / Ihre E-Mail"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button buttonId="send-access-code-button" text="Zugangscode anfordern" onClick={handleSendAccessCode} />
          <InputField
            placeholder="Zugangscode"
            id="accessCode"
            label="Zugangscode"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            required
          />
          <Button buttonId="login-button" text="Login" onClick={handleLogin} />
        </div>
      </div>
    </div>
  );
}