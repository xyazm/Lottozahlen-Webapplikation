import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Lottoschein from '../Lottoschein/Lottoschein';
import Admin from '../Admin/Admin';
import Login from '../Login/Login'; 
import Home from '../../pages/Home';  // Importiere die Startseite
import Contact from '../../pages/Contact'; 
import Datenschutz from '../../pages/Datenschutz';  // Importiere die Datenschutzseite
import Impressum from '../../pages/Impressum';  // Importiere die Impressumseite

export default function Body({ userType, isAuthenticated }) {

  return (
  <main className="min-h-screen bg-lightGray flex items-center justify-center px-24 py-12 w-[100%]"> {/* Hintergrund hellgrau, horizontaler Abstand 100px */}
    <div className="container min-h-[calc(100vh-64px)] bg-white p-8 rounded-md shadow-md"> {/* Weißer Container für Inhalt */}
      <Routes>
        {/* Startseite, wenn der Benutzer nicht authentifiziert ist */}
        <Route path="/" element={<Home />} />

        {/* Login-Seite */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/lottoschein" /> : <Login />} />

        {/* Lottoschein-Seite, nur zugänglich wenn eingeloggt */}
        <Route path="/lottoschein" element={isAuthenticated ? <Lottoschein /> : <Navigate to="/login" />} />

        {/* Weitere Seiten */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/impressum" element={<Impressum />} />
      </Routes>
    </div>
  </main>
  );
}