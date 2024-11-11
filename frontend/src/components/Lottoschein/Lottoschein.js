import React, { useState } from 'react';
import './lottoschein.css';
import Button from '../Button/Button';
import { ReactComponent as CrossHandwrittenIcon } from '../../assets/handwritten-cross.svg';
import { ReactComponent as WarningIcon } from '../../assets/warning.svg';
import { ReactComponent as KleeblattIcon } from '../../assets/kleeblatt.svg';
import { useLottoschein } from '../../hooks/useLottoschein';

export default function Lottoschein() {
  const { 
    showAlert, 
    alertMessage, 
    alertPosition, 
    scheine, 
    handleToggleNumber, 
    setAlertPosition, 
    handleSaveScheine 
  } = useLottoschein();

  const trackMousePosition = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAlertPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="relative" onMouseMove={trackMousePosition}>
      <Alert showAlert={showAlert} alertPosition={alertPosition} message={alertMessage} />
      <LottoscheinHeader />
      <LottoscheineGrid scheine={scheine} handleToggleNumber={handleToggleNumber} />
      <Button buttonId="save-lottoscheine" text="Lottoscheine abgeben" onClick={handleSaveScheine} />
    </div>
  );
}

function LottoscheinHeader() {
  return (
    <div id="lottoschein-topic" className="bg-rubBlue text-rubGreen font-heading flex items-center justify-between w-full">
      <div id="lottoschein-topic-left" className="m-3 flex items-start">
        <KleeblattIcon className="w-8 h-8" />
        <h3 className="text-2xl">
          <span className="font-bold">RUB</span>Lotterie
        </h3>
      </div>
      <div id="lottoschein-topic-right" className="m-3 flex items-end">
        <h3 className="text-2xl">Gib dem Zufall keine Chance</h3>
      </div>
    </div>
  );
}

function LottoscheineGrid({ scheine, handleToggleNumber }) {
  return (
    <div id="lottoscheine-grid" className="flex flex-wrap items-start justify-items-center gap-4">
      {scheine.map((schein, i) => (
        <div key={i} id={`lottschein-${schein.index + 1}`} data-content={schein.index + 1} className="flag grid grid-cols-7 gap-1 border-rubGreen p-1 bg-green-100 border-[1.5px] hover-stift relative z-0 w-[max-content]">
          {Matrix7x7().map((row, j) => (
            row.map((num, k) => (
              <div 
              key={`${j}-${k}`} 
              className="group relative border bg-white border-rubGreen text-rubGreen p-1 flex items-center justify-center z-[-1]"
               onClick={() => handleToggleNumber(num, schein.index)}>
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

function Alert({ showAlert, alertPosition, message }) {
  return (
    <div id="selectednum-warning-box" className="h-20 absolute" style={{ left: alertPosition.x, top: alertPosition.y }}>
      {showAlert && (
        <div id="alert-tooltip-click" role="tooltip" className="absolute z-10 p-3 flex items-center text-[12px] text-white rounded-lg shadow-sm bg-gray-700 animate-fade-in-out w-60">
          <WarningIcon className="w-7 h-7 fill-red-500 mr-2" aria-hidden="true" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}

function Matrix7x7() {
  const numbers = [];
  let count = 1;
  for (let i = 0; i < 7; i++) {
    const row = [];
    for (let j = 0; j < 7; j++) {
      row.push(count);
      count++;
    }
    numbers.push(row);
  }
  return numbers;
}