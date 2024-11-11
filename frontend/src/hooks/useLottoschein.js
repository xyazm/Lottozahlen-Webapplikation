import { useEffect, useState, useCallback } from 'react';

// Lottoschein object for managing selections per Lottoschein
class LottoscheinObject {
  constructor(index) {
    this.index = index;
    this.selectedNumbers = [];
  }
  
  toggleNumber(num) {
    if (this.selectedNumbers.includes(num)) {
      this.selectedNumbers = this.selectedNumbers.filter(n => n !== num);
    } else if (this.selectedNumbers.length < 6) {
      this.selectedNumbers.push(num);
    } else {
      return false;
    }
    return true;
  }
  
  getSelectedNumbers() {
    return this.selectedNumbers;
  }
}

// Custom hook for managing Lottoschein state
export const useLottoschein = () => {
  const [anzahl, setAnzahl] = useState(0);
  const [scheine, setScheine] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertPosition, setAlertPosition] = useState({ x: 0, y: 0 });

  // Fetch the number of Lottoscheine
  useEffect(() => {
    fetch('http://localhost:5000/get-lottoschein-settings')
      .then(response => response.json())
      .then(data => {
        if (data && !data.error) setAnzahl(data);
        else console.error('No Lottoschein settings found.');
      })
      .catch(error => console.error('Error fetching settings:', error));
  }, []);

  // Initialize Lottoschein instances
  useEffect(() => {
    setScheine(Array.from({ length: anzahl }, (_, i) => new LottoscheinObject(i)));
  }, [anzahl]);

  // Toggle a number in a Lottoschein
  const toggleNumber = (num, index) => {
    const newScheine = [...scheine];
    const schein = newScheine[index];
    if (!schein.toggleNumber(num)) {
      showTemporaryAlert('You can select up to 6 numbers only.');
    } else {
      setScheine(newScheine);
    }
  };

  // Temporary alert display
  const showTemporaryAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  // Validate and save Lottoscheine
  const saveScheine = () => {
    const token = localStorage.getItem("token");
    if (scheine.some(schein => schein.getSelectedNumbers().length !== 6)) {
      showTemporaryAlert('Each Lottoschein must have exactly 6 numbers.');
      return;
    }

    const scheinData = scheine.map(schein => ({ numbers: schein.getSelectedNumbers() }));
    fetch('http://localhost:5000/save-lottoscheine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ scheine: scheinData }),
    }).then(response => {
      if (!response.ok) throw new Error('Error saving Lottoscheine');
      return response.json();
    }).catch(error => {
      console.error('Error saving Lottoscheine:', error);
    });
  };

  return {
    anzahl,
    scheine,
    showAlert,
    alertMessage,
    alertPosition,
    setAlertPosition,
    toggleNumber,
    saveScheine,
  };
};