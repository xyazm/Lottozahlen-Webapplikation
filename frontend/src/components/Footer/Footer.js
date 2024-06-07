import React from 'react';

export default function Footer() {
  return(
    <div className="w-full px-10">
      <div className="border-t border-gray-300"></div>
      <footer className="w-full py-4">
      <div className="px-4 flex space-x-4 items-center justify-between text-gray-600">
        <div className="flex space-x-4 items-center text-gray-600">
          <a href="/datenschutz" className=" hover:text-gray-800">Datenschutz</a>
          <a href="/impressum" className="hover:text-gray-800">Impressum</a>
        </div>
          <p className="">© 2024 Yassmin Mohandis. All rights reserved.</p>
      </div>
      </footer>
    </div>
  );
}