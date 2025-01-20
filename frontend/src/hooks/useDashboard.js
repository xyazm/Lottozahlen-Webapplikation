import { useState, useEffect } from 'react';

export function useDashboard() {
  const [minHaufigkeitDashboard, setMinHaeufigkeitDashboard] = useState(0);
  const [maxHaufigkeitDashboard, setMaxHaeufigkeitDashboard] = useState(0);
  const [abgegebeneScheineWoche, setAbgegebeneScheineWoche] = useState(0);
  const [scheineInsgesamt, setScheineInsgesamt] = useState(0);
  const [letzteAktualisierung, setLetzteAktualisierung] = useState('')
  const token = localStorage.getItem('token');

  const getHaeufigkeitForDashboard = async () => {
    try {
      const response = await fetch('http://localhost:5000/dashboardStatics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
      });

      const data = await response.json();
      setMaxHaeufigkeitDashboard(data.beliebtestezahl)
      setMinHaeufigkeitDashboard(data.unbeliebteste)
      setAbgegebeneScheineWoche(data.anzahlScheineWoche)
      setScheineInsgesamt(data.scheineInsgesamt)
      return data;
    } catch (error) {
      console.error('Error get Dashboard Statistics:', error);
      return { status: 'error', message: 'Fehler beim Dashboard Statistics' };
    }
  };
  const getLetzteAktualisierungHistorischeDB = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/latest-lotto-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
      });

      const data = await response.json();
      setLetzteAktualisierung(data.latestdate)
      return data;
    } catch (error) {
      console.error('Error get Dashboard Statistics Lottodata:', error);
      return { status: 'error', message: 'Fehler beim Dashboard Statistics Lottodata' };
    }
  };

  useEffect(() => {
    getHaeufigkeitForDashboard();
    getLetzteAktualisierungHistorischeDB();
  }, []);

  return {
    maxHaufigkeitDashboard,
    minHaufigkeitDashboard,
    abgegebeneScheineWoche,
    scheineInsgesamt,
    letzteAktualisierung
  };
}