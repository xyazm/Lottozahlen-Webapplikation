import React from 'react';
import { BrowserRouter as Router} from 'react-router-dom';
import './styles/index.css';
import Header from './components/Header/Header';
import Body from './components/Body/Body';
import Footer from './components/Footer/Footer';
import useAuth from './hooks/useAuth'; 

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
      <div className="flex flex-col items-center min-h-screen bg-lightGray">
        <Header onLogout={logout} sessionTimeLeft={sessionTimeLeft} isLoggedIn={isAuthenticated} />
        <Body userType={userType} onLogin={login} />
        <Footer />
      </div>
    </Router>
  );
}

export default App;