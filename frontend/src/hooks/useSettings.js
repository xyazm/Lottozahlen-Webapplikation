import { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

export function useSettings() {
  const [anzahlLottoscheine, setAnzahlLottoscheine] = useState(2);
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);
  const [personalData, setPersonalData] = useState(false);
  const token = localStorage.getItem('token');

  const handleUpdateLottoDatabase = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/update-lotto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
      });

    const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating database:', error);
      return { status: 'error', message: 'Fehler beim Aktualisieren der Lotto-Datenbank!' };
    }
  };


  const handleUpdateRandomLottoscheine = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/generate-lotto-tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating database:', error);
      return { status: 'error', message: 'Fehler beim Aktualisieren der Lotto-Datenbank!' };
    }
  };

  // Fetch settings from the API when the component mounts
  useEffect(() => {
    const fetchSettings = async () => {
    try {// Hole den Token aus dem lokalen Speicher
      if (!token) {
        throw new Error("Kein Token gefunden.");
      }
  
      const response = await fetch(`${API_URL}/admin/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // JWT hinzufügen
        },
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      setAnzahlLottoscheine(data.anzahlLottoscheine || 2);
      setFeedbackEnabled(data.feedbackEnabled || false);
      setPersonalData(data.personalData || false);
    } catch (error) {
      console.error('Error fetching admin settings:', error);
    }
    };

    fetchSettings();
  }, []); // This hook runs only once when the component mounts

  // Function to save settings
  const saveSettings = async (number, feedback, personal) => {
    try {
      const response = await fetch(`${API_URL}/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          anzahlLottoscheine: number,
          feedbackEnabled: feedback,
          personalData: personal,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending settings:', error);
      return { status: 'error', message: 'Fehler beim speichern der Einstellungen!' };
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