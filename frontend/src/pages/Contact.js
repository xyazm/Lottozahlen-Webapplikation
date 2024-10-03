import React, { useState } from 'react';
import Button from '../components/Button/Button';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(''); 
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Weiter Logik zum absenden
    console.log("Nachricht gesendet:", { name, email, subject, message });
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 lg:px-8 text-rubBlue">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="text-left font-bold font-heading text-l leading-9 tracking-tight">
            Kontaktiere uns 
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-s font-medium font-heading leading-6">
              Ihr Name
            </label>
            <div className="mt-2">
              <input
                placeholder="Ihr Name"
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:rubBlue sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-s font-medium font-heading leading-6">
              Betreff
            </label>
            <div className="mt-2">
              <input
                placeholder="Betreff"
                id="subject"
                name="subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:rubBlue sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-s font-medium font-heading leading-6">
              Ihre E-Mail
            </label>
            <div className="mt-2">
              <input
                placeholder="Ihre E-Mail"
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:rubBlue sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-s font-medium font-heading leading-6">
              Ihre Nachricht
            </label>
            <div className="mt-2">
              <textarea
                placeholder="Ihre Nachricht"
                id="message"
                name="message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:rubBlue sm:text-sm sm:leading-6"
                rows="5"
              />
            </div>
          </div>

          <div>
            <Button buttonId="contact-button" text="Nachricht senden" />
          </div>
        </form>
      </div>
    </div>
  );
}