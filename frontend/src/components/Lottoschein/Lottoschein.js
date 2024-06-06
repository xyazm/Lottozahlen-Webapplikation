import React, { useEffect, useState } from 'react';
import './lottoschein.css';
import {ReactComponent as CrossHandwrittenIcon} from '../../assets/handwritten-cross.svg';
import {ReactComponent as WarningIcon} from '../../assets/warning.svg';

export default function Lottoschein({ anzahl }) {

  //Matrix (Array of Arrays) with numbers from 1 to 49 (7x7 matrix
  const [numbers, setNumbers] = useState([]);
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

  //Object with selected numbers for each Schein
  const [selectedNumbers, setSelectedNumbers] = useState({});
  const toggleNumber = (num, scheinIndex) => {
    const currentNumbers = selectedNumbers[scheinIndex] || [];
    if (currentNumbers.includes(num)) {
      setSelectedNumbers({ ...selectedNumbers, [scheinIndex]: currentNumbers.filter(n => n !== num) });
    } else {
      if (currentNumbers.length < 6) {
        setSelectedNumbers({ ...selectedNumbers, [scheinIndex]: [...currentNumbers, num] });
      } else {
        showTemporaryAlert();
      }
    }
  };

  //Alert message for selecting more than 6 numbers
  const [showAlert, setShowAlert] = useState(false);
  const showTemporaryAlert = () => {
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 8000); // Alert message will disappear after 3 seconds
  };

  return (
    <div className="relative">
      <div className='warning-box h-20 '>
        {showAlert && <AlertMessage />}
      </div>
      <div className="flex flex-wrap items-start justify-items-center gap-4">
        {Array.from({ length: anzahl }, (_, i) => (
          <div key={i} id={`lottschein-${i + 1}`} data-content={i + 1} className="flag grid grid-cols-7 gap-1 border-red-500 p-1 bg-red-100 border-[1.5px] hover-stift relative z-0 w-[max-content]">
            {numbers.map((row, j) => (
              row.map((num, k) => (
                <div key={`${j}-${k}`} className="group relative border bg-white border-red-500 text-red-500 p-1 flex items-center justify-center z-[-1]" onClick={() => toggleNumber(num, i)}>
                  {num}
                  <div className={`absolute bottom-1 right-1 z-3 transform ${selectedNumbers[i]?.includes(num) ? 'opacity-100' : 'group-hover:opacity-50 opacity-0'}`}>
                    <CrossHandwrittenIcon className='fill-black w-4' />
                  </div>
                </div>
              ))
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertMessage(){
  return(
    <div className="bg-gray-700 text-red-500 border border-red-400 p-4 rounded-lg flex items-center space-x-3 animate-fade-in-out">
      <WarningIcon className="w-5 h-5 fill-red-500" aria-hidden="true" />
      <span className="font-medium">Warnung!</span>
      <span>Sie haben bereits 6 Zahlen auf diesen Schein ausgewählt.</span>
    </div>
  );
}