import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import '../../index.css';
import Header from '../Header/Header'
import Body from '../Body/Body';
import Footer from '../Footer/Footer'
import Login from '../Login/Login'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null); // 'admin' oder 'student'

  const handleLogin = (type) => {
    setIsAuthenticated(true);
    setUserType(type);
  };

  return (
    <Router>
      <div className="flex flex-col items-center min-h-screen">
        <Header />
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={handleLogin} />} />

          <Route path="/admin" element={
            isAuthenticated && userType === 'admin' ? (
              <Body userType={userType} /> // Admin Komponente anzeigen
            ) : (
              <Navigate to="/login" /> // Redirect zur Login-Seite
            )
          } />

          <Route path="/lottoschein" element={
            isAuthenticated && userType === 'student' ? (
              <Body userType={userType} /> // Lottoschein Komponente anzeigen
            ) : (
              <Navigate to="/login" /> // Redirect zur Login-Seite
            )
          } />

          <Route path="/" element={<Navigate to="/login" />} /> {/* Redirect zur Login-Seite */}
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;