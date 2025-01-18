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
  <main className="flex-grow container bg-lightGray flex flex-col p-8 h-full items-center justify-center">
    <div className="flex-grow p-8 w-full bg-white rounded-md shadow-md">
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