import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/settings';

export function useSettings() {
  const [anzahlLottoscheine, setAnzahlLottoscheine] = useState(2);
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);
  const [personalData, setPersonalData] = useState(false);

  const handleUpdateLottoDatabase = async () => {
    try {
      const response = await fetch('http://localhost:5000/update-lotto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return data = await response.json();
    } catch (error) {
      console.error('Error updating database:', error);
    }
  };


  const handleUpdateRandomLottoscheine = async () => {
    try {
      const response = await fetch('http://localhost:5000/generate-lotto-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating database:', error);
    }
  };

  // Fetch settings from the API when the component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setAnzahlLottoscheine(data.anzahlLottoscheine || 2); 
        setFeedbackEnabled(data.feedbackEnabled || false);
        setPersonalData(data.personalData || false);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []); // This hook runs only once when the component mounts

  // Function to save settings
  const saveSettings = async (number, feedback, personal) => {
    try {
      const response = await fetch(API_URL, {
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
      return data;
    } catch (error) {
      console.error('Error sending settings:', error);
    }
  };

  return {
    anzahlLottoscheine,
    feedbackEnabled,
    personalData,
    setAnzahlLottoscheine,
    setFeedbackEnabled,
    setPersonalData,
    saveSettings,
    handleUpdateLottoDatabase,
    handleUpdateRandomLottoscheine,
  };
}