import React from 'react';

export default function Impressum() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Impressum</h1>

      <h2 className="text-2xl font-semibold mb-4">Angaben gemäß § 5 TMG</h2>
      <p className="mb-4">
        Ruhr-Universität Bochum (RUB)
      </p>
      <p className="mb-4">
        [Institut oder Fachbereich]
      </p>
      <p className="mb-4">
        [Adresse der RUB]
      </p>

      <h2 className="text-2xl font-semibold mb-4">Kontakt</h2>
      <p className="mb-4">
        Telefon: [Telefonnummer]
      </p>
      <p className="mb-4">
        E-Mail: <a href="mailto:[Kontakt E-Mail der RUB]" className="text-blue-600 hover:underline">[Kontakt E-Mail der RUB]</a>
      </p>

      <h2 className="text-2xl font-semibold mb-4">Verantwortlich für den Inhalt</h2>
      <p className="mb-4">
        gemäß § 55 Abs. 2 RStV:
      </p>
      <p className="mb-4">
        [Name des Verantwortlichen]
      </p>
      <p className="mb-4">
        [Adresse des Verantwortlichen]
      </p>
    </div>
  );
}