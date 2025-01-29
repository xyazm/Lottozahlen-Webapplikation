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
  const [showFeedback, setShowFeedback] = useState(true);
  const [aifeedback, setAiFeedback] = useState('');
  const [codedfeedback, setCodedFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API_URL}/get-lottoschein-settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },credentials: 'include',})
      .then(response => response.json())
      .then(data => {
        if (data && !data.error) {
          setAnzahl(data.anzahl);
          setShowFeedback(data.feedback)
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

  const handleSave = async () => {
    if (validateScheine()) {
      const scheinData = scheine.map((schein) => schein.getSelectedNumbers());
      setIsLoading(true);
      setIsSubmitted(true);

      const codedFeedback = await generateCombinedFeedback(scheinData);
      const aiFeedback = await generateAIFeedback(scheinData, codedFeedback);

      const combinedFeedback = `${codedFeedback}\n\n${aiFeedback}`;

      try {
        const response = await fetch(`${API_URL}/save-feedback-and-lottoscheine`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            feedback_text: combinedFeedback,
            scheine: scheinData
          }),
          credentials: 'include',
        });
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Fehler beim Speichern der Lottoscheine:', error);
        return { status: 'error', message: 'Netzwerkfehler beim Speichern der Lottoscheine.' };
      }
    }
    return { status: 'error', message: 'Jeder Lottoschein muss genau 6 Zahlen enthalten!' };
  };

    // Funktion für das AI-generierte Feedback
    const generateAIFeedback = async (scheine, codedFeedback) => {
      setIsLoading(true);
      // try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/predict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ scheine , codedFeedback }),
          credentials: 'include',
        });
  
        if (!response.ok) {
          throw new Error(`Fehler bei der AI-Feedback-Anfrage: ${response.statusText}`);
        }
  
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
  
        setAiFeedback(data.prediction); 
        setIsLoading(false);
        return data.prediction;
    };
  
    // Funktion für das kombinierte Feedback aus der neuen Route
    const generateCombinedFeedback = async (scheine) => {
      setIsLoading(true);
      // setError(null);
      // try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/user_analysen`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ scheine }),
          credentials: 'include',
        });
  
        if (!response.ok) {
          throw new Error(`Fehler bei der kombinierten Feedback-Anfrage: ${response.statusText}`);
        }
  
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
  
        setCodedFeedback(data.coded_feedback); 
        return data.coded_feedback;
    };

  return {
    showAlert,
    alertMessage,
    alertPosition,
    scheine,
    showFeedback,
    handleToggleNumber,
    setAlertPosition,
    handleSave,
    aifeedback,
    codedfeedback,
    isLoading,
    isSubmitted
  };
}