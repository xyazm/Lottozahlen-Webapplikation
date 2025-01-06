import React from 'react';
import { Routes, Route, Navigate} from 'react-router-dom';
import Lottoschein from '../pages/Lottoschein/Lottoschein';
import Admin from '../pages/Admin/Admin';
import Login from '../pages/Login'; 
import Home from '../pages/Home';  
import Contact from '../pages/Contact'; 
import Datenschutz from '../pages/Datenschutz';  
import Impressum from '../pages/Impressum';  
import AdminRoute from '../pages/Admin/AdminRoute'; 
import { useAuth } from '../context/AuthContext';

export default function Body() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
  <main className="min-h-screen bg-lightGray flex items-center justify-center px-24 py-12 w-[100%]"> {/* Hintergrund hellgrau, horizontaler Abstand 100px */}
    <div className="container min-h-[calc(100vh-64px)] bg-white p-8 rounded-md shadow-md"> {/* Weißer Container für Inhalt */}
      <Routes>
        {/* Startseite, wenn der Benutzer nicht authentifiziert ist */}
        <Route path="/" element={<Home />} />

          {/* Login-Seite */}
          <Route 
          path="/login" 
          element={
            isAuthenticated ? (<Navigate to={isAdmin ? '/admin' : '/lottoschein'} />   
            ) : (
            <Login /> )
          } 
          />
          {/* Lottoschein-Seite */}
          <Route path="/lottoschein" element={isAuthenticated ? <Lottoschein /> : <Navigate to="/login" />} />

          {/* Admin-Seite */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
        {/* Weitere Seiten */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/impressum" element={<Impressum />} />
      </Routes>
    </div>
  </main>
  );
}