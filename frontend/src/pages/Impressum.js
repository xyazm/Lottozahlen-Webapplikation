import React from 'react';

export default function Impressum() {
  return (
    <div className='m-6'>
      <h1>Impressum</h1>
      <h2>Angaben gemäß § 5 TMG</h2>
      <p>Ruhr-Universität Bochum (RUB)</p>
      <p>[Institut oder Fachbereich]</p>
      <p>[Adresse der RUB]</p>

      <h2>Kontakt</h2>
      <p>Telefon: [Telefonnummer]</p>
      <p>
        E-Mail: <a href="mailto:[Kontakt E-Mail der RUB]" className="text-blue-600 hover:underline">[Kontakt E-Mail der RUB]</a>
      </p>

      <h2>Verantwortlich für den Inhalt</h2>
      <p>gemäß § 55 Abs. 2 RStV:</p>
      <p>[Name des Verantwortlichen]</p>
      <p>[Adresse des Verantwortlichen]</p>
    </div>
  );
}