import React, { useState } from 'react';
import Lottoschein from '../Lottoschein/Lottoschein';
import Admin from '../Admin/Admin';
import Login from '../Login/Login'; 

export default function Body({ userType, onLogin }) {
  const [anzahl, setAnzahl] = useState(1);

  return (
    <main className="bg-white flex-grow w-full">
      <div className="wrapper px-20 py-[100px]">
        {userType === 'admin' && <Admin setAnzahl={setAnzahl} />} {/* Admin Komponente */}
        {userType === 'student' && <Lottoschein anzahl={anzahl} />} {/* Lottoschein Komponente */}
        {!userType && <Login onLogin={onLogin} />} {/* Login-Komponente anzeigen, wenn kein Benutzer angemeldet ist */}
      </div>
    </main>
  );
}