import { useState } from 'react';

export function useFeedback() {
  const [feedback, setFeedback] = useState(''); 
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(null); 

  const generateFeedback = async (scheine) => {
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
        throw new Error(`Fehler bei der Feedback-Anfrage: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setFeedback(data.prediction); 
    } catch (err) {
      setError(err.message); 
    } finally {
      setIsLoading(false); 
    }
  };

  return {
    feedback,
    isLoading,
    error,
    generateFeedback, // Funktion, um Feedback zu generieren
  };
}