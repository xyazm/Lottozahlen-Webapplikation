import React, { useState } from 'react';
import Button from '../components/Button';
import ConfirmationMessage from '../components/ConfirmationMessage'
import InputField from '../components/InputField';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(''); 
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState(null);


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });

      if (response.ok) {
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } 
      const data = await response.json();
      setConfirmationMessage(data.message);
      setMessageType(data.status)

    } catch (error) {
      setConfirmationMessage('Es gab ein Problem mit der Anfrage.', error);
      setMessageType('error')
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 lg:px-8 text-rubBlue">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2>Kontaktiere uns</h2>
        {/* Bestätigungsmeldung */}
        <ConfirmationMessage message={confirmationMessage} type={messageType} />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
        <InputField
          label="Ihr Name"
          placeholder="Ihr Name"
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <InputField
          label="Betreff"
          placeholder="Betreff"
          id="subject"
          name="subject"
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <InputField
          id="email"
          name="email"
          type="email"
          label="Ihre E-Mail"
          placeholder="Ihre E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <InputField
          id="message"
          name="message"
          type="email"
          label="Ihre Nachricht"
          placeholder="Ihre Nachricht"
          value={message}
          rows="5"
          onChange={(e) => setMessage(e.target.value)}
          required
        />
          <div>
            <Button buttonId="contact-button" text="Nachricht senden" />
          </div>
        </form>
      </div>
    </div>
  );
}