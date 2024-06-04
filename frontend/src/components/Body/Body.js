import React, { useState } from 'react';
import Dashboard from '../Dashboard/Dashboard';
import Login from '../Login/Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

export default function Body() {
  const [token, setToken] = useState();

  return(
    <main className="bg-white flex-grow w-full">
      <div className="wrapper px-20 py-[100px]">
        {!token ? (
          <Login setToken={setToken} />
        ) : (
          <>
            <h1>Application</h1>
            <Router>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </Router>
          </>
        )}
      </div>
    </main>
  );
}