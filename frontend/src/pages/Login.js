import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import ConfirmationMessage from '../components/ConfirmationMessage'
import InputField from '../components/InputField';
import TermsPopup from '../components/TermsPopup';

export default function Login() {
  const { sendAccessCode, validateAccessCode  } = useAuth();
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [messageType, setMessageType] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const navigate = useNavigate();

  const handleSendAccessCode = async (e) => {
    e.preventDefault();
    const response = await sendAccessCode(email);

    if (response.status === 'terms_not_accepted') {
      setShowTermsPopup(true);
    } else {
      setConfirmationMessage(response.message);
      setMessageType(response.status);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await validateAccessCode(email, accessCode);
    console.log('API Response:', response);
    setConfirmationMessage(response.message);
    setMessageType(response.status);
    if (response.status === 'success') {
      const targetPath = response.isAdmin ? '/admin' : '/lottoschein'; // Zielpfad je nach Rolle
      navigate(targetPath);
    }
  };

  const handleAcceptTerms = async () => {
    const response = await sendAccessCode(email, true); 
    if (response.status === 'success') {
      setShowTermsPopup(false);
      setConfirmationMessage(response.message);
      setMessageType(response.status);
    } else {
      setConfirmationMessage(response.message || 'Fehler beim Akzeptieren der Nutzungsbedingungen.');
      setMessageType('error');
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 lg:px-8 text-rubBlue">
      {showTermsPopup && <TermsPopup onAccept={handleAcceptTerms} />}
    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
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