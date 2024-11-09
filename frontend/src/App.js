import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router} from 'react-router-dom';
import './styles/index.css';
import Header from './components/Header/Header';
import Body from './components/Body/Body';
import Footer from './components/Footer/Footer';
import useAuth from './hooks/useAuth'; 
import CookieConsent from 'react-cookie-consent';
import Cookies from 'js-cookie';

function App() {
  const {
    isAuthenticated,
    userType,
    logout, // Logout-Funktion vom Hook
    sessionTimeLeft, // Verbleibende Session-Zeit
  } = useAuth();

  const [cookiesAccepted, setCookiesAccepted] = useState(false);

  useEffect(() => {
    // Überprüfen, ob der Benutzer bereits Cookies akzeptiert hat
    const accepted = Cookies.get('cookiesAccepted');
    if (accepted) {
      setCookiesAccepted(true);
    }
  }, []);

  const handleAcceptCookies = () => {
    // Setze ein Cookie, um zu speichern, dass der Benutzer Cookies akzeptiert hat
    Cookies.set('cookiesAccepted', true, { expires: 365 });
    setCookiesAccepted(true);
    console.log('Cookies accepted');
  };

  useEffect(() => {
    // Überprüfen, ob der Benutzer bereits Cookies akzeptiert hat
    const accepted = Cookies.get('cookiesAccepted');
    if (accepted) {
      setCookiesAccepted(true);
    }
  }, []);

  return (
    <Router>
      <div className="flex flex-col items-center min-h-screen bg-lightGray">
        <Header onLogout={logout} sessionTimeLeft={sessionTimeLeft} isLoggedIn={isAuthenticated} />
        <Body userType={userType} isAuthenticated={isAuthenticated} />
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
  );
}

export default App;