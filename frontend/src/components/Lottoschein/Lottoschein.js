import React, { useEffect, useState } from 'react';
import './lottoschein.css';
import Button from '../Button/Button';
import {ReactComponent as CrossHandwrittenIcon} from '../../assets/handwritten-cross.svg';
import {ReactComponent as WarningIcon} from '../../assets/warning.svg';
import {ReactComponent as KleeblattIcon} from '../../assets/kleeblatt.svg';

// Class representing a Lottoschein object
class LottoscheinObject {
  // Constructor for Lottoschein object
  constructor(index) {
    this.index = index;
    this.selectedNumbers = [];
  }

  // Function to toggle number selection
  toggleNumber(num) {
    if (this.selectedNumbers.includes(num)) {
      this.selectedNumbers = this.selectedNumbers.filter(n => n !== num);
    } else {
      if (this.selectedNumbers.length < 6) {
        this.selectedNumbers.push(num);
      } else {
        console.log('You can only select up to 6 numbers.');
        return false;
      }
    }
    return true;
  }

  // Function to get selected numbers
  getSelectedNumbers() {
    return this.selectedNumbers;
  }
};

export default function Lottoschein({ anzahl }) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertPosition, setAlertPosition] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Array of Lottoschein objects
  const [scheine, setScheine] = useState([]);

  useEffect(() => {
    setScheine(Array.from({ length: anzahl }, (_, i) => new LottoscheinObject(i)));
  }, [anzahl]);

  // Function to handle number toggle
  const handleToggleNumber = (num, scheinIndex) => { 
    const newScheine = [...scheine]; // Copy array
    const schein = newScheine[scheinIndex]; // Get Lottoschein object
    if (!schein.toggleNumber(num)){
      showTemporaryAlert(); // Show warning if more than 6 numbers are selected
    } else {
      setScheine(newScheine); // Update state
    }
  };

  // Function to display selected numbers
  const handleShowSelectedNumbers = () => {
    scheine.forEach((scheinObject, index) => {
      console.log(`Selected numbers for Lottoschein ${index + 1}:`, scheinObject.getSelectedNumbers() || []);
    });
  };

  // Function to track mouse position
  const trackMousePosition = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  // Function to show temporary alert
  const showTemporaryAlert = () => {
    setAlertPosition(mousePosition);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 5000); // Hide alert after 5 seconds
  };

  return (
    <div className="relative" onMouseMove={trackMousePosition}>
      <Alert showAlert={showAlert} alertPosition={alertPosition} />
      <LottoscheinHeader />
      <LottoscheineGrid scheine={scheine} handleToggleNumber={handleToggleNumber} />
      <Button buttonId="show-selected-numbers" text="Show selected numbers" onClick={handleShowSelectedNumbers} />
    </div>
  );
}

// Component for Lottoschein header
function LottoscheinHeader() {
  return (
    <div id="lottoschein-topic" className="bg-rubBlue text-rubGreen font-heading flex items-center justify-between w-full">
      <div id="lottoschein-topic-left" className='m-3 flex items-start'>
        <KleeblattIcon className="w-8 h-8" />
        <h2 className="text-2xl ">
          <span className='font-bold'>RUB</span>Lotterie
        </h2>
      </div>
      <div id="lottoschein-topic-right" className='m-3 flex items-end'>
        <h2 className="text-2xl ">Gib dem Zufall keine Chance</h2>
      </div>
    </div>
  );
}

// Component for displaying the grid of Lottoscheine
function LottoscheineGrid({ scheine, handleToggleNumber }) {
  return (
    <div id="lottoscheine-grid" className="flex flex-wrap items-start justify-items-center gap-4">
      {scheine.map((schein, i) => (
        <div key={i} id={`lottschein-${schein.index + 1}`} data-content={schein.index + 1} className="flag grid grid-cols-7 gap-1 border-rubGreen p-1 bg-green-100 border-[1.5px] hover-stift relative z-0 w-[max-content]">
          {Matrix7x7().map((row, j) => (
            row.map((num, k) => (
              <div key={`${j}-${k}`} className="group relative border bg-white border-rubGreen text-rubGreen p-1 flex items-center justify-center z-[-1]" onClick={() => handleToggleNumber(num, schein.index)}>
                {num}
                <div className={`absolute bottom-1 right-1 z-3 transform ${schein.getSelectedNumbers().includes(num) ? 'opacity-100' : 'group-hover:opacity-50 opacity-0'}`}>
                  <CrossHandwrittenIcon className='fill-black w-4' />
                </div>
              </div>
            ))
          ))}
        </div>
      ))}
    </div>
  );
}

// Component for displaying alert
function Alert({ showAlert, alertPosition }){
  return(
    <div id="selectednum-warning-box" className='h-20 absolute' style={{ left: alertPosition.x, top: alertPosition.y }}>
      {showAlert && 
      <div id="alert-tooltip-click" role="tooltip" 
        className='absolute z-10 p-3 flex items-center text-[12px] text-white rounded-lg shadow-sm bg-gray-700 animate-fade-in-out w-60' >
        <WarningIcon className="w-7 h-7 fill-red-500 mr-2" aria-hidden="true" />
        <span>Sie haben bereits 6 Zahlen auf diesen Schein ausgewählt.</span>
      </div>
      }
    </div>
  );
}

// Function to generate a 7x7 matrix of numbers
function Matrix7x7() {
  const numbers = [];
  let count = 1;
  for(let i = 0; i < 7; i++) {
    const row = [];
    for(let j = 0; j < 7; j++) {
      row.push(count);
      count++;
    }
    numbers.push(row);
  }
  return numbers;
}