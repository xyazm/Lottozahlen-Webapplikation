import React from 'react';
import Button from './Button';

export default function TermsPopup({ onAccept }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md">
        <h2 className="text-lg font-bold mb-4">Datenschutz- und Nutzungsbedingungen</h2>
        <p className="mb-4">
          Dieser Dienst ist ausschließlich für Forschungs- und Lehrzwecke gedacht.
          Es handelt sich nicht um ein echtes Glücksspiel. Es besteht kein Anrecht 
          auf Gewinne jeglicher Art. Durch die Nutzung erklären Sie sich einverstanden, 
          dass Ihre Daten anonymisiert verarbeitet werden.
        </p>
        <Button buttonId="terms-button" text="Akzeptieren" onClick={onAccept} />
      </div>
    </div>
  );
}