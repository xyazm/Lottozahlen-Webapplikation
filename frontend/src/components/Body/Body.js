import React, { useState } from 'react';
import Lottoschein from '../Lottoschein/Lottoschein';
import Admin from '../Admin/Admin';

export default function Body() {
  const [anzahl, setAnzahl] = useState(1);
  return(
    <main className="bg-white flex-grow w-full">
      <div className="wrapper  px-20 py-[100px]">
        <Admin setAnzahl={setAnzahl} />
        <Lottoschein anzahl={anzahl} />
      </div>
    </main>
  )
}