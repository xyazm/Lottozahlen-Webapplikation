import React, { useEffect, useState } from 'react';
import './lottoschein.css';
import {ReactComponent as CrossHandwritten} from '../../assets/handwritten-cross.svg';
import {ReactComponent as PencilIcon} from '../../assets/pen.svg';

export default function Lottoschein() {
  const [numbers, setNumbers] = useState([]);

  const pencilIcon = require('../../assets/pen.svg');
  const pencilIconUrl = URL.createObjectURL(new Blob([pencilIcon], { type: 'image/svg+xml' }));


  useEffect(() => {
    const tempNumbers = [];
    let count = 1;
    for(let i = 0; i < 7; i++) {
      const row = [];
      for(let j = 0; j < 7; j++) {
        row.push(count);
        count++;
      }
      tempNumbers.push(row);
    }
    setNumbers(tempNumbers);
  }, []);

return (
  <div className="flex flex-col items-center min-h-screen">
    <div id="lottschein" className="grid grid-cols-7 gap-2 border-red-500 p-1 flag bg-red-100 border-[1.5px]">
      {numbers.map((row, i) => (
        row.map((num, j) => (
          <div key={`${i}-${j}`} className="group relative border bg-white border-red-500 text-red-500 p-1 flex items-center justify-center hover:cursor-pen">
            {num}
            <div className="absolute bottom-1 right-1 transform opacity-0 group-hover:opacity-100">
              <CrossHandwritten className='fill-black w-4'/>
            </div>
          </div>
        ))
      ))}
    </div>
  </div>
);
}