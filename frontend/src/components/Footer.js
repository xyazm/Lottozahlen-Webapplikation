import React from 'react';
import { Link } from 'react-router-dom';
import Datenschutz from '../pages/Datenschutz';
import Impressum from '../pages/Impressum';

export default function Footer() {
  return(
    <div className="w-full px-10">
      <div className="border-t border-gray-300"></div>
      <footer className="w-full py-4">
      <div className="px-4 flex space-x-4 items-center justify-between text-gray-600">
        <div className="flex space-x-4 items-center text-gray-600">
          <Link to="/datenschutz" className="hover:text-gray-800">Datenschutz</Link>
          <Link to="/impressum" className="hover:text-gray-800">Impressum</Link>
        </div>
          <p className="">© 2024 Yassmin Mohandis. All rights reserved.</p>
      </div>
      </footer>
    </div>
  );
}