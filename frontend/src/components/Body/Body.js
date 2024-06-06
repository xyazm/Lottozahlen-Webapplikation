import React, { useState } from 'react';
import Lottoschein from '../Lottoschein/Lottoschein';

export default function Body() {
  return(
    <main className="bg-white flex-grow w-full">
      <div className="wrapper  px-20 py-[100px]">
      <Lottoschein anzahl={2}/>
      </div>
    </main>
  );
}