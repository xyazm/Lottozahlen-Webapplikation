import React, { useState } from 'react';
import './lottoschein.css';
import Button from '../../components/Button';
import { ReactComponent as CrossHandwrittenIcon } from '../../assets/handwritten-cross.svg';
import { ReactComponent as WarningIcon } from '../../assets/warning.svg';
import { ReactComponent as KleeblattIcon } from '../../assets/kleeblatt.svg';
import { useLottoschein } from '../../hooks/useLottoschein';
import ConfirmationMessage from '../../components/ConfirmationMessage';
import { useFeedback } from '../../hooks/useFeedback';

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

  const { 
    aifeedback, 
    codedfeedback,
    isLoading, 
    handleSubmitFeedback,
    saveFeedbackToDB,
    isSubmitted,
  } = useFeedback();

  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  //const [scheine, setScheine] = useState([]);

  const trackMousePosition = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAlertPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleSave = async () => {
    try {
      // Speichere Lottoscheine
      const saveResponse = await handleSaveScheine();
      if (saveResponse.status === 'success') {
        // IDs extrahieren
        const scheinIds = saveResponse.scheine.map(schein => schein.id);
        // Generiere Feedback
        await handleSubmitFeedback(scheine);
      } else {
        setConfirmationMessage('Fehler beim Speichern der Lottoscheine.');
        setMessageType('error');
      }
    } catch (err) {
      setConfirmationMessage(`Fehler: ${err.message}`);
      setMessageType('error');
    }
  };

  return (
    <div className="relative" onMouseMove={trackMousePosition}>
      <Alert 
        showAlert={showAlert} 
        alertPosition={alertPosition} 
        message={alertMessage} 
        />
      <ConfirmationMessage
        message={confirmationMessage}
        type={messageType}
      />
      <LottoscheinHeader />
      <LottoscheineGrid 
        scheine={scheine} 
        handleToggleNumber={!isSubmitted ? handleToggleNumber : null} 
        isSubmitted={isSubmitted}
      />
      <Button 
        buttonId="save-lottoscheine" 
        text="Lottoscheine abgeben"  
        onClick={!isSubmitted ? handleSave : null}
        disabled={isSubmitted}
      />
      {isSubmitted && (
        <div className="mt-4">
          {isLoading ? 'Analysieren...' : null}
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
    <div id="lottoschein-topic" className="bg-rubBlue text-rubGreen font-heading flex items-center justify-between w-full">
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
    <div id="lottoscheine-grid" className="flex flex-wrap items-start justify-items-center gap-4">
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