import React from 'react';
import Button from './Button';

export default function TermsPopup({ onAccept }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md">
        <h2 className="font-bold mb-4">Datenschutz- und Nutzungsbedingungen</h2>
        <p className="mb-4">
  Dieser Dienst ist ausschließlich für Forschungs- und Lehrzwecke gedacht.
  Es handelt sich nicht um ein echtes Glücksspiel. Es besteht kein Anrecht 
  auf Gewinne jeglicher Art.
</p>
<p className="mb-4">
  <h3 className="font-bold">Zustimmungserklärung:</h3>
  Durch die Nutzung dieser Webanwendung erklären Sie sich mit folgenden Bedingungen einverstanden:
</p>
<ol className="mb-4">
  <li>
    Ihre personenbezogenen Daten werden gemäß dieser Datenschutzerklärung verarbeitet.
  </li>
  <li>
    Sie stimmen zu, dass die von Ihnen ausgefüllten Lottoscheine und die daraus 
    abgeleiteten Daten anonymisiert in die Analyse einfließen.
  </li>
  <li>
    Sie bestätigen, dass die Nutzung der Webanwendung rein zu Lehr- und Forschungszwecken erfolgt und keine Rechte auf Gewinne oder andere Ansprüche bestehen.
  </li>
  <li>
    Sie akzeptieren die in dieser Datenschutzerklärung aufgeführten Haftungsausschlüsse.
  </li>
</ol>
        <Button buttonId="terms-button" text="Akzeptieren" onClick={onAccept} />
      </div>
    </div>
  );
}