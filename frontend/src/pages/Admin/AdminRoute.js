import React from 'react';
import { Navigate } from 'react-router-dom';

function AdminRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    if (!decodedToken.is_admin) {
      return <Navigate to="/lottoschein" />;
    }
  } catch (error) {
    console.error("Ungültiger Token:", error);
    return <Navigate to="/login" />;
  }

  return children;
}

export default AdminRoute;