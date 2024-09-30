import React from 'react';
import { ReactComponent as RubLogo } from '../../assets/rub-logo.svg';
import { ReactComponent as LogOut } from '../../assets/log-out.svg'; 

export default function Header({ onLogout, sessionTimeLeft, isLoggedIn }) {
  // Formatierte Zeit anzeigen
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-10 w-full bg-rubBlue">
      <nav className="h-[80px] px-6 py-[20px] flex justify-between items-end">
        <a href="/#" className="flex-shrink-0">
          <RubLogo className="w-[209px]" />
        </a>

        {/* Session Timer und Status */}
        <div className="ml-auto text-white">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm">{formatTime(sessionTimeLeft)} || </span>
              <span className="text-sm">✅ Logged In</span>
            </div>
          ) : (
            <span className="text-sm">❌ Not Logged In</span>
          )}
        </div>

        {/* Logout Button */}
        <div className="ml-4 cursor-pointer" onClick={onLogout}>
          <LogOut className="my-1 w-[30px] fill-white hover:fill-gray-300" />
        </div>
      </nav>
    </header>
  );
}