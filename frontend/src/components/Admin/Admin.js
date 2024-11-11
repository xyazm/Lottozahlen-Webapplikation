import React, { useState, useEffect } from 'react';
import Button from '../Button/Button';
import Plot from 'react-plotly.js';

export default function Admin() {
  const [anzahlLottoscheine, setAnzahlLottoscheine] = useState(2); // Setze einen Default-Wert für die Anzahl der Lottoscheine
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);
  const [personalData, setPersonalData] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState(''); // State für die Bestätigungsmeldung
  const API_URL = 'http://localhost:5000/settings';

  const [plotData, setPlotData] = useState(null);


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

  // Fetch settings from the API when the component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        // Setze die erhaltenen Daten in den State
        setAnzahlLottoscheine(data.anzahlLottoscheine || 2); 
        setFeedbackEnabled(data.feedbackEnabled || false);
        setPersonalData(data.personalData || false);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []); // Dieser Hook wird nur einmal beim ersten Rendern aufgerufen

  useEffect(() => {
    // Abrufen der Daten von der Flask-API
    fetch('http://localhost:5000/haeufigkeit')
      .then(response => response.json())
      .then(data => {
        // Extrahiere data und layout von der API-Antwort
        if (data.plot_json) {
          setPlotData({
            data: data.plot_json.data,
            layout: data.plot_json.layout,
          });
        }
      });
  }, []);

  // Handle form submission to update the number of lottery tickets and other settings
  const handleSubmit = async (e) => {
    e.preventDefault();
    const number = parseInt(anzahlLottoscheine, 10);
    if (!isNaN(number) && number > 0) {
      await sendSettingsData(API_URL, number, feedbackEnabled, personalData);
      setConfirmationMessage('Einstellungen erfolgreich gespeichert!'); // Setze Bestätigungsmeldung
      // Optional: Setze die Bestätigungsmeldung nach 3 Sekunden zurück
      setTimeout(() => {
        setConfirmationMessage('');
      }, 3000);
    }
  };

  // Funktion zum Senden der aktualisierten Einstellungen an die API
  async function sendSettingsData(apiUrl, number, feedback, personal) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          anzahlLottoscheine: number,
          feedbackEnabled: feedback,
          personalData: personal,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data; // Hier kannst du weitere Aktionen durchführen, z.B. eine Bestätigung anzeigen
    } catch (error) {
      console.error('Error sending data:', error);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Willkommen Admin</h1>

      {/* Bestätigungsmeldung */}
      {confirmationMessage && (
        <div className="mb-4 p-3 bg-green-100 text-rubGreen rounded-md">
          {confirmationMessage}
        </div>
      )}

      {/* Einstellungen Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-rubBlue mb-4">Einstellungen</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {settings.map((setting, index) => (
            <Setting
              key={index}
              id={setting.id}  // Übergib die eindeutige ID
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
      </div>

      {/* Übersicht Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-rubBlue mb-4">Übersicht</h2>

        {/* Abgegebene Lottoscheine */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Abgegebene Lottoscheine:</h3>
          <p className="text-gray-600">Abgegebene Lottoscheine werden hier angezeigt.</p>
        </div>

        {/* Statistiken */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Statistiken:</h3>
          <p className="text-gray-600">Statistiken werden hier angezeigt.</p>
          {plotData ? (
            <Plot
              data={plotData.data}  // Daten für das Diagramm
              layout={plotData.layout}  // Layout für das Diagramm
              config={{ responsive: true }}  // Responsives Diagramm
            />
          ) : (
            <p>Lade Diagramm...</p> 
          )}
        </div>
      </div>
    </div>
  );
}

function Setting ({ id, label, value, onChange, type, tooltip }) {
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

        {/* Fragezeichen für Tooltip */}
        {tooltip && (
          <button
            type="button"
            className="ml-2 text-rubBlue hover:text-rubBlue"
            onClick={toggleTooltip}
          >
            ?
          </button>
        )}

        {/* Tooltip für Erklärung */}
        {showTooltip && (
          <div className="absolute left-[100px] top-[-5px] z-[999] mt-2 p-2 bg-gray-900 text-white border border-gray-300 rounded shadow-lg transition-opacity duration-500 $animate-fade-in-out">
          <span className="text-xs">{tooltip}</span> 
        </div>
        )}
      </label>

      {/* Input-Feld oder Toggle */}
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
        {/* Hier einfügen weiterer Seeting-Optionen */}
      </div>
    </div>
  );
};
