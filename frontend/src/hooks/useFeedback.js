import { useState, useEffect } from 'react';

export function useFeedback() {
  const [aifeedback, setAiFeedback] = useState(''); 
  const [codedfeedback, setCodedFeedback] = useState(''); 
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(null); 
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scheineIds, setScheineIds] = useState([]);

  // Funktion für das AI-generierte Feedback
  const generateAIFeedback = async (scheine) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scheine }),
      });

      if (!response.ok) {
        throw new Error(`Fehler bei der AI-Feedback-Anfrage: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAiFeedback(data.prediction); // Setze AI-generiertes Feedback
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Funktion für das kombinierte Feedback aus der neuen Route
  const generateCombinedFeedback = async (scheine) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/user_analysen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scheine }),
      });

      if (!response.ok) {
        throw new Error(`Fehler bei der kombinierten Feedback-Anfrage: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setCodedFeedback(data.coded_feedback); // Setze kombiniertes Feedback
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

    // Funktion zum Speichern von Feedback in der Datenbank
  const saveFeedbackToDB = async (feedbackText, scheinIds) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/save-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ feedback_text: feedbackText, schein_ids: scheinIds }),
      });

      if (!response.ok) {
        throw new Error(`Fehler beim Speichern des Feedbacks: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return data.message; // Rückmeldung, ob Feedback gespeichert wurde
    } catch (err) {
      setError(err.message);
      throw err; // Fehler an den Aufrufer zurückgeben
    } finally {
      setIsLoading(false);
    }
  };

    // Überwache den Zustand des Feedbacks und speichere es, wenn fertig
  useEffect(() => {
    if (isSubmitted && aifeedback && codedfeedback) {
      const combinedFeedback = `${codedfeedback}\n\n${aifeedback}`;

      const saveFeedback = async () => {
        try {
          const message = await saveFeedbackToDB(combinedFeedback, scheineIds);
        } catch (err) {
          console.error('Fehler beim Speichern des Feedbacks:', err.message);
        }
      };

      saveFeedback();
    }
  }, [isSubmitted, aifeedback, codedfeedback, scheineIds]);

  const handleSubmitFeedback = async (scheineData) => {
    setIsSubmitted(true);
    const ids = scheineData.map((schein) => schein.id); // IDs der Scheine extrahieren
    setScheineIds(ids);
  
    // Feedback generieren
    await generateCombinedFeedback(scheineData);
    await generateAIFeedback(scheineData);
  };

  return {
    aifeedback,
    codedfeedback,
    isLoading,
    isSubmitted,
    handleSubmitFeedback,
    saveFeedbackToDB
  };
}