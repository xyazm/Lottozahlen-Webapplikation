import React, { useState, useEffect } from 'react';
import Button from '../Button/Button';

export default function Admin() {
  const [inputValue, setInputValue] = useState(2); // Setze einen Default-Wert für die Anzahl der Lottoscheine
  const [feedbackAllowed, setFeedbackAllowed] = useState(false);
  const [dataPrivacyAllowed, setDataPrivacyAllowed] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState(''); // State für die Bestätigungsmeldung
  const API_URL = 'http://localhost:5000/settings';

  // Fetch settings from the API when the component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        // Setze die erhaltenen Daten in den State
        setInputValue(data.anzahlLottoscheine || 2); 
        setFeedbackAllowed(data.feedbackEnabled || false);
        setDataPrivacyAllowed(data.personalData || false);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []); // Dieser Hook wird nur einmal beim ersten Rendern aufgerufen

  // Handle form submission to update the number of lottery tickets and other settings
  const handleSubmit = async (e) => {
    e.preventDefault();
    const number = parseInt(inputValue, 10);
    if (!isNaN(number) && number > 0) {
      await sendSettingsData(API_URL, number, feedbackAllowed, dataPrivacyAllowed);
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

        {/* Anzahl Lottoscheine */}
        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center"> {/* Flexbox für die Ausrichtung */}
            <label className="block text-sm font-medium text-gray-700 mr-2">Anzahl der Lottoscheine:</label>
            <input
              type="number"
              min="1"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="mt-1 block w-20 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-rubBlue focus:border-rubBlue sm:text-sm"
              required
            />
          </div>

          
          {/* Feedback Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Feedback erlauben:</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={feedbackAllowed}
                onChange={(e) => setFeedbackAllowed(e.target.checked)} // Setze den State basierend auf dem Checkbox-Status
                className="toggle-checkbox hidden"
              />
              <label className={`toggle-label ${feedbackAllowed ? 'bg-rubGreen' : 'bg-gray-300'} relative inline-block w-12 h-6 rounded-full cursor-pointer`}>
                <span className={`absolute left-1 top-0.5 w-5 h-5 rounded-full transition-transform duration-300 transform ${feedbackAllowed ? 'translate-x-full bg-rubGreen' : 'bg-white'}`}></span>
              </label>
              <span className="ml-2 text-sm">{feedbackAllowed ? 'Ja' : 'Nein'}</span>
            </div>
          </div>

          {/* Personenbezogene Daten */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Erlauben personenbezogene Daten:</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={dataPrivacyAllowed}
                onChange={(e) => setDataPrivacyAllowed(e.target.checked)} // Setze den State basierend auf dem Checkbox-Status
                className="toggle-checkbox hidden"
              />
              <label className={`toggle-label ${dataPrivacyAllowed ? 'bg-rubGreen' : 'bg-gray-300'} relative inline-block w-12 h-6 rounded-full cursor-pointer`}>
                <span className={`absolute left-1 top-0.5 w-5 h-5 rounded-full transition-transform duration-300 transform ${dataPrivacyAllowed ? 'translate-x-full bg-green-500' : 'bg-white'}`}></span>
              </label>
              <span className="ml-2 text-sm">{dataPrivacyAllowed ? 'Ja' : 'Nein'}</span>
            </div>
          </div>

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
        </div>
      </div>
    </div>
  );
}