import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Lottoschein from '../Lottoschein/Lottoschein';
import Admin from '../Admin/Admin';
import Login from '../Login/Login'; 
import Home from '../../pages/Home';  // Importiere die Startseite
import Contact from '../../pages/Contact'; 
import Datenschutz from '../../pages/Datenschutz';  // Importiere die Datenschutzseite
import Impressum from '../../pages/Impressum';  // Importiere die Impressumseite

export default function Body({ userType, onLogin }) {
  const [anzahl, setAnzahl] = useState(1);

  return (
    <main className="bg-white flex-grow w-full">
      <div className="wrapper px-20 py-[100px]">
        <Routes>
          {/* Startseite, wenn der Benutzer nicht authentifiziert ist */}
          <Route path="/" element={<Home />} />

          {/* Login-Seite */}
          <Route path="/login" element={!userType ? <Login onLogin={onLogin} /> : <Navigate to="/" />} />

          {/* Routen für Admin */}
          <Route path="/admin" element={userType === 'admin' ? <Admin setAnzahl={setAnzahl} /> : <Navigate to="/" />} />

          {/* Routen für Lottoschein */}
          <Route path="/lottoschein" element={userType === 'student' ? <Lottoschein anzahl={anzahl} /> : <Navigate to="/" />} />

          <Route path="/contact" element={<Contact />} /> {/* Kontakt */}
          <Route path="/datenschutz" element={<Datenschutz />} /> {/* Datenschutz */}
          <Route path="/impressum" element={<Impressum />} /> {/* Impressum */}
        </Routes>
      </div>
    </main>
  );
}