import { useState, useEffect } from 'react';

export function usePlot() {
    const [haeufigkeitPlot, setHaeufigkeitPlot] = useState(null);
    const [gitterPlot, setGitterPlot] = useState(null);
    const [primePlot, setPrimePlot] = useState(null);
    const [tester1, settester1] = useState(false);
    const [tester2, settester2] = useState('');
    
  
    useEffect(() => {
        // Abruf der Häufigkeit der Lottozahlen
        fetch('http://localhost:5000/haeufigkeit')
          .then(response => response.json())
          .then(data => {
            if (data) {
              setHaeufigkeitPlot(data.haeufigkeit_plot);
              //settester1(data.heatmap_plot);
              settester2(data.scatter_plot);
            }
          })
          .catch(error => console.error('Error fetching Häufigkeit data:', error));

        // Abruf der Prime-Analyse
        fetch('http://localhost:5000/zahlenanalyse')
          .then(response => response.json())
          .then(data => {
            if (data && data.zahlenanalyse_plot) {
              setPrimePlot(data.zahlenanalyse_plot);
            }
          })
          .catch(error => console.error('Error fetching Zahlenanalyse data:', error));

        // Abruf der Gitteranalyse
        fetch('http://localhost:5000/gitteranalyse')
        .then(response => response.json())
        .then(data => {
          if (data) {
            setGitterPlot(data.gitterplot);
          }
        })
        .catch(error => console.error('Error fetching Gitteranalyse data:', error));
      }, []);
  
    return { haeufigkeitPlot, primePlot, gitterPlot, tester1, tester2 };
}