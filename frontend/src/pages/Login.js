import React, { useState } from 'react';
import Button from '../components/Button';
import useAuth from '../hooks/useAuth';
import ConfirmationMessage from '../components/ConfirmationMessage'
import InputField from '../components/InputField';
import TermsPopup from '../components/TermsPopup';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { sendAccessCode, validateAccessCode, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [messageType, setMessageType] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const navigate = useNavigate('');

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
    if (response.isAdmin) {
      // Weiterleitung zur Admin-Seite
      navigate('/admin');
    } else if (isAuthenticated) {
      // Weiterleitung zur Lottoschein-Seite
      navigate('/lottoschein');
    } else {
      // Fehlermeldung setzen
      setConfirmationMessage(response.message);
      setMessageType('error');
    }
  };

  const handleAcceptTerms = async () => {
    // Nutzungsbedingungen akzeptieren und erneut versuchen
    const response = await sendAccessCode(email, true); // Übergebe `accept_terms: true`
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