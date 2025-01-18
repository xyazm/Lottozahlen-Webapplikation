import React, { useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import Button from '../../components/Button';
import ConfirmationMessage from '../../components/ConfirmationMessage';
import HelpSvg from '../../assets/help.svg';

export default function Settings() {
  const {
    anzahlLottoscheine,
    feedbackEnabled,
    personalData,
    setAnzahlLottoscheine,
    setFeedbackEnabled,
    setPersonalData,
    saveSettings,
    handleUpdateLottoDatabase,
    handleUpdateRandomLottoscheine,
  } = useSettings();

  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Objekt für alle Einstellungen
  const settings = [
    {
      id: 'lottoValue-setting',
      label: 'Anzahl der Lottoscheine',
      value: anzahlLottoscheine,
      type: 'number',
      onChange: (e) => setAnzahlLottoscheine(e.target.value),
      tooltip: 'Gibt an, wie viele Lottoscheine ein Student maximal abgeben kann.',
    },
    {
      id: 'feedback-setting',
      label: 'Feedback erlauben',
      value: feedbackEnabled,
      type: 'toggle',
      onChange: (e) => setFeedbackEnabled(e.target.checked),
      tooltip: 'Erlaubt es den Studenten, Ai-generierten Feedback und die Ergebnisse zur Musteranalyse zu sehen.',
    },
    {
      id: 'personaldata-setting',
      label: 'Abgabe Anonym oder Personenbezogen?',
      value: personalData,
      type: 'toggle',
      onChange: (e) => setPersonalData(e.target.checked),
      tooltip: 'Legt fest, ob die Abgabe anonym oder mit den persönlichen Daten der Studenten erfolgt.',
    }
  ];

  const handleDBUpdate = async (e) => {
    e.preventDefault();
    const response = await handleUpdateLottoDatabase();
    setConfirmationMessage(response.message);
    setMessageType(response.status)
    setTimeout(() => setConfirmationMessage(''), 3000);
  } ;

  const handleRandomScheineUpdate = async (e) => {
    e.preventDefault();
    const response = await handleUpdateRandomLottoscheine();
    setConfirmationMessage(response.message);
    setMessageType(response.status)
    setTimeout(() => setConfirmationMessage(''), 3000);
  } ;

  // Handle form submission to update the number of lottery tickets and other settings
  const handleSubmit = async (e) => {
    e.preventDefault();
    const number = parseInt(anzahlLottoscheine, 10);
    if (!isNaN(number) && number > 0) {
      const response = await saveSettings(number, feedbackEnabled, personalData);
      setConfirmationMessage(response.message);
      setMessageType(response.status)
      setTimeout(() => setConfirmationMessage(''), 3000);
    }
  };

  return (
    <div className="p-6 mx-auto relative">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Willkommen Admin</h1>

      {/* Bestätigungsmeldung */}
      <ConfirmationMessage message={confirmationMessage} type={messageType} />

      {/* Einstellungen Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-rubBlue mb-4">Einstellungen</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {settings.map((setting, index) => (
            <Setting
              key={index}
              id={setting.id}
              label={setting.label}
              value={setting.value}
              type={setting.type}
              onChange={setting.onChange}
              tooltip={setting.tooltip}
            />
          ))}
          {/* Submit Button */}
          <Button buttonId="savesettings-button" text="Einstellungen speichern" />
        </form>
         {/* Schaltfläche zur Aktualisierung der Datenbank */}
         <h2 className="text-xl font-semibold text-rubBlue mb-4">Datenbank aktualisieren</h2>
         <div className="space-y-6">
         <DatabaseLottoscheine 
            handleDBUpdate={handleDBUpdate} 
            handleRandomScheineUpdate={handleRandomScheineUpdate}
         />
         </div>
      </div>
    </div>
  );
};

function DatabaseLottoscheine({ handleDBUpdate, handleRandomScheineUpdate }) {
    const actions = [
      {
        label: 'Lottozahlen-Historie aktualisieren:',
        buttonText: 'Update',
        onClick: handleDBUpdate,
      },
      {
        label: 'Erstelle neue "Zufällige" Lottoscheine:',
        buttonText: 'Generiere',
        onClick: handleRandomScheineUpdate,
      },
    ];
  
    return (
      <div className="space-y-6">
        {actions.map((action, index) => (
          <div key={index} className="relative flex items-center mb-4">
            {/* Beschriftung */}
            <label className="text-sm font-medium text-gray-700 w-2/3 flex items-center">
              {action.label}
            </label>
  
            {/* Schaltfläche */}
            <div className="w-1/3 flex items-center">
              <Button
                buttonId={`action-button-${index}`}
                text={action.buttonText}
                onClick={action.onClick}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  function Setting({ id, label, value, onChange, type, tooltip}) {
    const [showTooltip, setShowTooltip] = useState(false);
  
    const toggleTooltip = () => {
      setShowTooltip(true);
      setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
    };
  
    return (
      <div className="relative flex items-center mb-4">
        <label className="text-sm font-medium text-gray-700 w-2/3 flex items-center">
          {label}
          {tooltip && (
            <button
              type="button"
              className="ml-2 text-rubBlue hover:text-rubBlue"
              onClick={toggleTooltip}
            >
              <img src={HelpSvg} alt="Hilfe" className="h-3 w-3" />
            </button>
          )}
  
          {showTooltip && (
            <div className="absolute left-[100px] top-[-5px] z-[999] mt-2 p-2 bg-gray-900 text-white border border-gray-300 rounded shadow-lg transition-opacity duration-500 $animate-fade-in-out">
              <span className="text-xs">{tooltip}</span>
            </div>
          )}
        </label>
  
        <div className="w-1/3 flex items-center">
          {type === 'number' ? (
            <input
              id={id}
              type="number"
              min="1"
              value={value}
              onChange={onChange}
              className="mt-1 block w-full py-1.5 px-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rubBlue focus:border-rubBlue sm:text-sm"
            />
          ) : (
            <div className="flex items-center">
              <input
                id={id}
                type="checkbox"
                checked={value}
                onChange={onChange}
                className="sr-only peer"
              />
              <label
                htmlFor={id}
                className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-rubGreen"
              ></label>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {value ? 'Ja' : 'Nein'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }