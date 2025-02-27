import React, { useState } from 'react';
import './lottoschein.css';
import Button from '../../components/Button';
import { ReactComponent as CrossHandwrittenIcon } from '../../assets/handwritten-cross.svg';
import { ReactComponent as WarningIcon } from '../../assets/warning.svg';
import { ReactComponent as KleeblattIcon } from '../../assets/kleeblatt.svg';
import { ReactComponent as HelpSvg } from '../../assets/help.svg';
import { useLottoschein } from '../../hooks/useLottoschein';
import ConfirmationMessage from '../../components/ConfirmationMessage';

export default function Lottoschein() {
  const { 
    showAlert, 
    alertMessage, 
    alertPosition, 
    scheine, 
    handleToggleNumber, 
    setAlertPosition, 
    handleSave,
    aifeedback,
    codedfeedback,
    isLoading, 
    isSubmitted, 
    showFeedback,
  } = useLottoschein();

  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  const toggleTooltip = () => {
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 5000);
  };

  const trackMousePosition = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAlertPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleSaveFeedbackAndScheine = async () => {
      const response = await handleSave();
      setConfirmationMessage(response.message);
      setMessageType(response.type);
  };

  return (
    <div className="m-4" onMouseMove={trackMousePosition}>
      <Alert 
        showAlert={showAlert} 
        alertPosition={alertPosition} 
        message={alertMessage} 
        />
      <ConfirmationMessage
        message={confirmationMessage}
        type={messageType}
      />
    
      <div className="bg-blue-50 shadow-lg rounded-xl p-6 pb-4 max-w-[900px] w-full border border-gray-200 mb-4">
      <LottoscheinHeader />
      <LottoscheineGrid 
        scheine={scheine} 
        handleToggleNumber={!isSubmitted ? handleToggleNumber : null} 
        isSubmitted={isSubmitted}
      />
      <p className="mt-4 text-sm text-center text-gray-500">
      Hinweis: Dieses Lottospiel ist nur eine Simulation und kein echtes Gewinnspiel.
    </p>
      </div>
      <div className="relative flex items-center">
      <Button 
        buttonId="save-lottoscheine" 
        text="Lottoscheine abgeben"  
        onClick={!isSubmitted ? handleSaveFeedbackAndScheine : null}
        disabled={isSubmitted}
      />
      <div className="cursor-pointer" onClick={toggleTooltip}>
        <HelpSvg className="w-4 fill-rubBlue hover:fill-gray-300" />
      </div>
    {/* Tooltip-Inhalt */}
    {showTooltip && (
      <div className="absolute left-[20px] top-[-10px] z-50 p-3 bg-gray-900 text-white border border-gray-300 rounded shadow-lg w-80">
        <h4 className="text-sm font-semibold mb-2">Anleitung:</h4>
        Kreuze pro Schein 6 Zahlen an, indem du auf die Zahlen klickst.
        Eine Zahl falsch angekreuzt? Kein Problem, klick einfach auf die Zahl dessen Wahl du rückgängig machen willst.
      </div>
    )}
    </div>
      {isSubmitted && showFeedback &&(
        <div className="mt-4">
          {isLoading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  Analysieren...
                <svg
                  className="animate-spin h-5 w-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.964 7.964 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            ) : null}
          <h3>Backend-Analyse</h3>
          <textarea
            className="w-full p-2 border rounded mt-2"
            value={codedfeedback}
            disabled
            rows="10"
          />
          <h3>Analyse vom KI-Model</h3>
          <textarea
            className="w-full p-2 border rounded mt-2"
            value={aifeedback}
            disabled
            rows="10"
          />
        </div>
      )}
    </div>
  );
}

function LottoscheinHeader() {
  return (
    <div id="lottoschein-topic" className="bg-rubBlue text-rubGreen font-heading flex items-center justify-between">
      <div id="lottoschein-topic-left" className="m-3 flex items-start">
        <KleeblattIcon className="w-8 h-8" />
        <h4 className="text-2xl">
          <span className="font-bold">RUB</span>Lotterie
        </h4>
      </div>
      <div id="lottoschein-topic-right" className="m-3 flex items-end">
        <h4 className="text-2xl">Gib dem Zufall keine Chance</h4>
      </div>
    </div>
    
  );
}

function LottoscheineGrid({ scheine, handleToggleNumber, isSubmitted }) {
  return (
    <div id="lottoscheine-grid" className="flex flex-wrap items-start justify-items-start pt-4  gap-4 w-full place-content-center">
      {scheine.map((schein, i) => (
        <div key={i} id={`lottschein-${schein.index + 1}`} data-content={schein.index + 1} className="flag grid grid-cols-7 gap-1 border-rubGreen p-1 bg-green-100 border-[1.5px] hover-stift relative z-0 w-[max-content]">
          {Matrix7x7().map((row, j) => (
            row.map((num, k) => (
              <div 
              key={`${j}-${k}`} 
              className="group relative border bg-white border-rubGreen text-rubGreen p-1 flex items-center justify-center z-[-1]"
               onClick={!isSubmitted ? () => handleToggleNumber(num, schein.index) : null}>
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