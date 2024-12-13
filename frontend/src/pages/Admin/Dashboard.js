import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    maxHaufigkeitDashboard,
    minHaufigkeitDashboard,
    abgegebeneScheineWoche,
    scheineInsgesamt,
    letzteAktualisierung
  } = useDashboard();

  const stats = [
    {
      id: 1,
      label: 'Beliebteste und unbeliebteste Zahl der Woche',
      value: maxHaufigkeitDashboard+' / '+minHaufigkeitDashboard,
    },
    {
      id: 2,
      label: 'Eingereichte Lottoscheine der letzten Woche',
      value: abgegebeneScheineWoche,
    },
    {
      id: 3,
      label: 'Eingereichte Lottoscheine insgesamt',
      value: scheineInsgesamt,
    },
    {
      id: 4,
      label: 'Letzter stand Lottoziehungen',
      value: letzteAktualisierung,
    },
  ];

  const actions = [
    {
      id: 1,
      label: 'Lottoscheine verwalten',
      path: '/admin/lottomanagement',
    },
    {
      id: 2,
      label: 'Einstellungen ändern',
      path: '/admin/settings',
    },
    {
      id: 3,
      label: 'Statistiken anzeigen',
      path: '/admin/statistics',
    },
  ];

  return (
    <div className="p-6">
      {/* Begrüßung */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between h-full"
          >
            <p className="text-gray-600 text-sm mb-2">{stat.label}</p> 
            <p className="text-2xl font-semibold text-gray-800 mt-auto">{stat.value}</p> 
          </div>
        ))}
      </div>

      {/* Aktionen */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Aktionen</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => navigate(action.path)}
              className="bg-rubBlue text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-800 transition-all"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}