import React from 'react';
import './lottoschein.css';
import Button from '../Button/Button';
import { ReactComponent as CrossHandwrittenIcon } from '../../assets/handwritten-cross.svg';
import { ReactComponent as WarningIcon } from '../../assets/warning.svg';
import { ReactComponent as KleeblattIcon } from '../../assets/kleeblatt.svg';
import { useLottoschein } from '../../hooks/useLottoschein';

// Generate a 7x7 matrix for grid numbers
function Matrix7x7() {
  return Array.from({ length: 7 }, (_, i) => 
    Array.from({ length: 7 }, (_, j) => i * 7 + j + 1)
  );
}

// Lottoschein component
export default function Lottoschein() {
  const {
    anzahl,
    scheine,
    showAlert,
    alertMessage,
    alertPosition,
    setAlertPosition,
    toggleNumber,
    saveScheine,
  } = useLottoschein();

  return (
    <div className="relative" onMouseMove={(e) => setAlertPosition({ x: e.clientX, y: e.clientY })}>
      <Alert showAlert={showAlert} position={alertPosition} message={alertMessage} />
      <LottoscheinHeader />
      <LottoscheineGrid scheine={scheine} toggleNumber={toggleNumber} />
      <Button buttonId="save-lottoscheine" text="Submit Lottoscheine" onClick={saveScheine} />
    </div>
  );
}

// Header for Lottoschein
function LottoscheinHeader() {
  return (
    <div id="lottoschein-topic" className="bg-rubBlue text-rubGreen font-heading flex items-center justify-between w-full">
      <div id="lottoschein-topic-left" className="m-3 flex items-start">
        <KleeblattIcon className="w-8 h-8" />
        <h3 className="text-2xl"><span className="font-bold">RUB</span> Lottery</h3>
      </div>
      <div id="lottoschein-topic-right" className="m-3 flex items-end">
        <h3 className="text-2xl">Don't leave it to chance</h3>
      </div>
    </div>
  );
}

// Grid of Lottoscheine
function LottoscheineGrid({ scheine, toggleNumber }) {
  return (
    <div id="lottoscheine-grid" className="flex flex-wrap gap-4">
      {scheine.map((schein, i) => (
        <div key={i} className="lottoschein-card grid grid-cols-7 gap-1">
          {Matrix7x7().flat().map(num => (
            <div
              key={num}
              className="number-cell"
              onClick={() => toggleNumber(num, i)}
            >
              {num}
              {schein.getSelectedNumbers().includes(num) && <CrossHandwrittenIcon />}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Alert component for notifications
function Alert({ showAlert, position, message }) {
  return (
    <div id="alert-container" style={{ left: position.x, top: position.y }}>
      {showAlert && (
        <div className="alert">
          <WarningIcon />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}