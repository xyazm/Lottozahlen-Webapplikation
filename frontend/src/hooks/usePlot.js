import { useState, useEffect } from 'react';

export function usePlot() {
    const [haeufigkeitPlot, setHaeufigkeitPlot] = useState(null);
    const [gitterPlot, setGitterPlot] = useState(null);
  
    useEffect(() => {
      // Abruf der Häufigkeit der Lottozahlen
      fetch('http://localhost:5000/haeufigkeit')
        .then(response => response.json())
        .then(data => {
          if (data) {
            setHaeufigkeitPlot({
              data: data.data,
              layout: data.layout,
            });
          }
        })
        .catch(error => console.error('Error fetching Häufigkeit data:', error));
  
      // Abruf der Gitteranalyse (Scatterplot)
      fetch('http://localhost:5000/gitteranalyse')
        .then(response => response.json())
        .then(data => {
          if (data && data.gitter_plot) {
            setGitterPlot(data.gitter_plot); // Speichern des Scatterplots
          }
        })
        .catch(error => console.error('Error fetching Gitteranalyse data:', error));
    }, []);
  
    return { haeufigkeitPlot, gitterPlot };
}