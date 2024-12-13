import { useState } from 'react';

export function useFeedback() {
  const [aifeedback, setAiFeedback] = useState(''); 
  const [codedfeedback, setCodedFeedback] = useState(''); 
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(null); 

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

  return {
    aifeedback,
    codedfeedback,
    isLoading,
    error,
    generateAIFeedback, 
    generateCombinedFeedback,
  };
}