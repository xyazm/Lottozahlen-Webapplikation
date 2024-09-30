import React, { useState }  from 'react';
import Button from '../Button/Button'
import { useNavigate } from 'react-router-dom';

export default function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Zwei BeispielAccounts -> in DB auslagern
  const adminCredentials = {
    email: 'admin@example.com', // Ändere dies zur Admin-E-Mail
    password: 'deinAdminPasswort', // Ändere dies zum Admin-Passwort
  };
  const studentCredentials = {
    email: 'student@example.com',
    password: 'deinStudentPasswort',
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Überprüfen der Anmeldedaten
    if (email === adminCredentials.email && password === adminCredentials.password) {
      setIsAuthenticated('admin'); // Authentifizierung auf Admin setzen
      navigate('/admin'); // Redirect zur Admin-Seite
    } else if (email === studentCredentials.email && password === studentCredentials.password) {
      setIsAuthenticated('student'); // Authentifizierung auf Student setzen
      navigate('/lottoschein'); // Redirect zur Lottoschein-Seite
    } else {
      alert('Falsche Anmeldedaten!');
    }
  };

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 lg:px-8  text-rubBlue">

          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="text-left font-bold font-heading text-l leading-9 tracking-tight">
              Logge dich mit deinen Rub-Konto ein
            </h2>
          </div>
    
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={handleSubmit} action="#" method="POST">
              <div>
                <label htmlFor="email" className="block text-s font-medium font-heading leading-6">
                  Login-ID / E-Mail
                </label>
                <div className="mt-2">
                  <input
                    placeholder="E-Mail"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:rubBlue sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
    
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-s font-medium font-heading leading-6">
                    Passwort
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    placeholder="Passwort"
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:rubBlue sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div>
                <Button buttonId="login-button" text="Login"/>
              </div>
            </form>
          </div>
        </div>
      );
}