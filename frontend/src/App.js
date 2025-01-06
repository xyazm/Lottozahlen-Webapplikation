import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './styles/index.css';
import Header from './components/Header';
import Body from './components/Body';
import Footer from './components/Footer';
import CookieConsent from 'react-cookie-consent';
import Cookies from 'js-cookie';
import { AuthProvider } from './context/AuthContext';

function App() {
  const [cookiesAccepted, setCookiesAccepted] = useState(false);

  useEffect(() => {
    const accepted = Cookies.get('cookiesAccepted');
    if (accepted) {
      setCookiesAccepted(true);
    }
  }, []);

  const handleAcceptCookies = () => {
    Cookies.set('cookiesAccepted', true, { expires: 365 });
    setCookiesAccepted(true);
    console.log('Cookies accepted');
  };

  return (
    <AuthProvider>
    <Router>
      <div className="flex flex-col items-center min-h-screen bg-lightGray">
        <Header />
        <Body />
        <Footer />
        {!cookiesAccepted && (
          <CookieConsent
            onAccept={handleAcceptCookies}
            buttonText="Cookies akzeptieren"
            declineButtonText="Ablehnen"
            enableDeclineButton
            style={{ background: "#2B373B", color: "#fff" }}
            buttonStyle={{ color: "#fff", fontSize: "13px" }}
            declineButtonStyle={{ color: "#fff", fontSize: "13px" }}
          >
            Diese Website verwendet Cookies, um dir eine bessere Erfahrung zu bieten. 
            Durch die Nutzung dieser Seite erklärst du dich mit unserer Verwendung von Cookies einverstanden.
          </CookieConsent>
        )}
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;