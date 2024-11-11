import { useState, useEffect } from 'react';

export function usePlot() {
    const [haeufigkeitPlot, setHaeufigkeitPlot] = useState(null);
    const [gitterPlot, setGitterPlot] = useState(null);
    const [primePlot, setPrimePlot] = useState(null);
  
    useEffect(() => {
        // Abruf der Häufigkeit der Lottozahlen
        fetch('http://localhost:5000/haeufigkeit')
          .then(response => response.json())
          .then(data => {
            if (data && data.haeufigkeit_plot) {
              setHaeufigkeitPlot(data.haeufigkeit_plot);
            }
          })
          .catch(error => console.error('Error fetching Häufigkeit data:', error));
    
        // Abruf der Gitteranalyse
        fetch('http://localhost:5000/gitteranalyse')
          .then(response => response.json())
          .then(data => {
            if (data && data.gitter_plot) {
              setGitterPlot(data.gitter_plot);
            }
          })
          .catch(error => console.error('Error fetching Gitteranalyse data:', error));
    
        // Abruf der Prime-Analyse
        fetch('http://localhost:5000/zahlenanalyse')
          .then(response => response.json())
          .then(data => {
            if (data && data.zahlenanalyse_plot) {
              setPrimePlot(data.zahlenanalyse_plot);
            }
          })
          .catch(error => console.error('Error fetching Zahlenanalyse data:', error));
      }, []);
  
    return { haeufigkeitPlot, gitterPlot, primePlot };
}