import React, { useState, useEffect } from 'react';

export default function Admin({ setAnzahl }) {
  const [inputValue, setInputValue] = useState('');
  // Flask API for settings
  const API_URL = 'http://localhost:5000/settings'; 

  // Load settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setAnzahl(data.anzahlLottoscheine || 1); // Setze Standardwert
        setInputValue(data.anzahlLottoscheine || ''); // Setze den Input-Wert
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, [setAnzahl]);

  // Handle form submission
  const handleSubmit = async(e) => {
    e.preventDefault();
    const number = parseInt(inputValue, 10);
    if (!isNaN(number) && number > 0) {
      // Call the function to send data to the API
      await sendLottoscheinData(API_URL, number);
      setAnzahl(number); // Update the state after saving
    }
  };

  // Function to save the number of tickets
  async function sendLottoscheinData(apiUrl, number) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anzahlLottoscheine: number }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json(); 
      return data;
    } catch (error) {
      console.error('Error sending data:', error);
    }
  }


  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-4">Admin Seite</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Anzahl der Lottoscheine:</label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          Anzahl ändern
        </button>
      </form>
    </div>
  );
}
