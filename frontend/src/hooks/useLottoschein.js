import { useState, useEffect } from 'react';

class LottoscheinObject {
  constructor(index) {
    this.index = index;
    this.selectedNumbers = [];
  }

  toggleNumber(num) {
    if (this.selectedNumbers.includes(num)) {
      this.selectedNumbers = this.selectedNumbers.filter(n => n !== num);
    } else {
      if (this.selectedNumbers.length < 6) {
        this.selectedNumbers.push(num);
      } else {
        return false;
      }
    }
    return true;
  }

  getSelectedNumbers() {
    return this.selectedNumbers;
  }
}

export function useLottoschein() {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertPosition, setAlertPosition] = useState({ x: 0, y: 0 });
  const [anzahl, setAnzahl] = useState(0);
  const [scheine, setScheine] = useState([]);
  const [useFeedback, setUseFeedback] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:5000/get-lottoschein-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }})
      .then(response => response.json())
      .then(data => {
        if (data && !data.error) {
          setAnzahl(data.anzahl);
          setUseFeedback(data.feedback)
        }
      })
      .catch(error => console.error('Fehler beim Abrufen der Einstellungen:', error));
  }, []);

  useEffect(() => {
    setScheine(Array.from({ length: anzahl }, (_, i) => new LottoscheinObject(i)));
  }, [anzahl]);

  const handleToggleNumber = (num, scheinIndex) => {
    const newScheine = [...scheine];
    const schein = newScheine[scheinIndex];
    if (!schein.toggleNumber(num)) {
      showTemporaryAlert('Sie können nur bis zu 6 Zahlen auswählen.');
    } else {
      setScheine(newScheine);
    }
  };

  const showTemporaryAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const validateScheine = () => {
    const invalidScheine = scheine.filter(schein => schein.getSelectedNumbers().length !== 6);
    if (invalidScheine.length > 0) {
      showTemporaryAlert('Jeder Lottoschein muss genau 6 Zahlen enthalten!');
      return false;
    }
    return true;
  };

  const handleSaveScheine = async() => {
    if (validateScheine()) {
      const scheinData = scheine.map(schein => ({
        numbers: schein.getSelectedNumbers()
      }));
      try {
        const response = await fetch('http://localhost:5000/save-lottoscheine', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ scheine: scheinData }),
        });
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Fehler beim Speichern der Lottoscheine:', error);
        return { status: 'error', message: error.message};
      }
    }
    return { status: 'error', message: "Etwas ist schief gelaufen."};
  };

  return {
    showAlert,
    alertMessage,
    alertPosition,
    scheine,
    useFeedback,
    handleToggleNumber,
    setAlertPosition,
    handleSaveScheine
  };
}