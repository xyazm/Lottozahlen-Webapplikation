import { useState, useEffect } from 'react';

// Universelle Hook zum Laden der Analysen
export function usePlot() {
  const [plots, setPlots] = useState({}); // Dynamisches Objekt, das alle Plots enthält
  const apiURL = 'http://localhost:5000'; // URL des Backends
  const [source, setSource] = useState('user');
  const token = localStorage.getItem('token');

  const analyses = [
    { key: 'haeufigkeit', url: `${apiURL}/haeufigkeit`, label: 'Häufigkeit der Lottozahlen' },
    { key: 'primzahlenanalyse', url: `${apiURL}/primzahlenanalyse`, label: 'Anzahl Primezahlen pro Schein' },
    { key: 'gitteranalyse', url: `${apiURL}/gitteranalyse`, label: 'Verteilung der Lottozahlen im Gitter' },
    { key: 'verteilungsanalyse', url: `${apiURL}/verteilungsanalyse`, label: 'Verteilung und Distanz' },
    { key: 'aufeinanderfolgende_reihen', url: `${apiURL}/aufeinanderfolgende_reihen`, label: 'Aufeinanderfolgende Reihen' },
    { key: 'diagonaleanalyse', url: `${apiURL}/diagonaleanalyse`, label: 'Verteilung auf Diagonale' },
    { key: 'ungeradeanalyse', url: `${apiURL}/ungeradeanalyse`, label: 'Kombination aus Gerade und Ungerade Zahlen' },
    { key: 'summenanalyse', url: `${apiURL}/summenanalyse`, label: 'Summenwert von Lottozahlen' },
    { key: 'kleingrossanalyse', url: `${apiURL}/kleingrossanalyse`, label: 'Kombination aus kleinen und großen Zahlen' },
  ];

  useEffect(() => {
    analyses.forEach(({ key, url }) => {
      fetch(`${url}?source=${source}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            setPlots((prevPlots) => ({
              ...prevPlots,
              [`${key}_${source}`]: data[`${key}_plot_${source}`],
            }));
          }
        })
        .catch((error) => console.error(`Error fetching data for ${key}:`, error));
    });
  }, [source]);

  return { plots, analyses, source, setSource  };
}