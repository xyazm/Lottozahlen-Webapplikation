import React from 'react';
import { BrowserRouter as Router} from 'react-router-dom';
import '../../index.css';
import Header from '../Header/Header';
import Body from '../Body/Body';
import Footer from '../Footer/Footer';
import useAuth from '../../hooks/useAuth'; // Verwende den Hook

function App() {
  const {
    isAuthenticated,
    userType,
    login,  // Login-Funktion vom Hook
    logout, // Logout-Funktion vom Hook
    sessionTimeLeft, // Verbleibende Session-Zeit
  } = useAuth();

  return (
    <Router>
      <div className="flex flex-col items-center min-h-screen">
        <Header onLogout={logout} sessionTimeLeft={sessionTimeLeft} isLoggedIn={isAuthenticated} />
        <Body userType={userType} onLogin={login} />
        <Footer />
      </div>
    </Router>
  );
}

export default App;