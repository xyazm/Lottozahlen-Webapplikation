import React from 'react';

export default function ConfirmationMessage({ message, type }) {
  if (!message) return null;

  // Farben basierend auf dem Typ
  const styles = {
    success: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
  };

  // Standardtyp, falls nicht angegeben
  const styleClass = styles[type] || styles.success;

  return (
    <div className={`mb-4 p-3 rounded-md ${styleClass}`}>
      {message}
    </div>
  );
}