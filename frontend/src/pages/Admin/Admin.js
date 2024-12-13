import React, { useState } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Settings from './Settings';
import Statistics from './Statistics';
import LottoManagement from './LottoManagement'
import {ReactComponent as DownSvg} from '../../assets/down.svg';

export default function Admin() {
  return (
    <div className="relative min-h-screen">
      {/* Header mit Dropdown */}
      <header className="p-4 flex justify-between">
      <h2 className='mt-0'>Willkommen im Admin-Bereich!</h2>
        <AdminDropdown />
      </header>
      <main className="p-4">
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="lottomanagement" element={<LottoManagement />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}


function AdminDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Holt die aktuelle Route

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleNavigation = (path) => {
    navigate(path); // Navigiere zur ausgewählten Seite
    setIsOpen(false); // Schließe das Dropdown
  };

  // Ermittelt die aktuelle Seite anhand der Route
  const getCurrentPage = () => {
    switch (location.pathname) {
      case '/admin/dashboard':
        return 'Dashboard';
      case '/admin/settings':
        return 'Einstellungen';
      case '/admin/lottomanagement':
        return 'Verwaltung';
      case '/admin/statistics':
        return 'Statistiken';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center bg-rubBlue rounded-lg text-white font-heading transition duration-150 ease-in-out transform hover:shadow-lg hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 h-8 p-4 "
        type="button"
      >
        {getCurrentPage()}
        <DownSvg className="w-4 h-4 ml-1 fill-white" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 right-0 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow w-44">
          <ul className="py-2 text-sm text-gray-700" aria-labelledby="dropdownDefaultButton">
            <li>
              <button
                onClick={() => handleNavigation('/admin/dashboard')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/admin/settings')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Einstellungen
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/admin/lottomanagement')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Verwaltung
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/admin/statistics')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Statistiken
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation('/login')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Abmelden
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}