import React from 'react';

export default function Datenschutz() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Datenschutzerklärung</h1>
      <p className="mb-6">
        Diese Datenschutzerklärung informiert über die Erhebung und Verarbeitung personenbezogener Daten im Rahmen der Lottoschein-Muster-Analyse.
      </p>

      <h2 className="text-2xl font-semibold mb-4">Verantwortlicher für die Datenverarbeitung</h2>
      <p className="mb-4">
        Verantwortlich für die Datenverarbeitung ist:
      </p>
      <address className="mb-4">
        [Name der verantwortlichen Person]
        <br />
        Ruhr-Universität Bochum (RUB)
        <br />
        [Institut oder Fachbereich]
        <br />
        [Adresse]
        <br />
        [Kontakt E-Mail]
      </address>

      <h2 className="text-2xl font-semibold mb-4">Art der verarbeiteten Daten</h2>
      <p className="mb-4">
        Im Rahmen der Teilnahme an der Lottoschein-Muster-Analyse werden personenbezogene Daten verarbeitet. Diese Daten umfassen insbesondere:
      </p>
      <ul className="mb-6 list-disc list-inside pl-5">
        <li>Ihr Name</li>
        <li>Ihre RUB-Mailadresse</li>
        <li>(eventuell noch Studiengang?)</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">Zweck der Datenverarbeitung</h2>
      <p className="mb-6">
        Die genannten Daten werden ausschließlich zum Zweck der Durchführung und Auswertung der Lottoschein-Muster-Analyse im Rahmen meiner Bachelorarbeit verwendet.
      </p>

      <h2 className="text-2xl font-semibold mb-4">Speicherdauer</h2>
      <p className="mb-6">
        Die erhobenen Daten werden nach Abschluss der Bachelorarbeit und Veröffentlichung der Ergebnisse gelöscht, spätestens jedoch nach [Angabe einer Frist, z.B. sechs Monate nach Abschluss].
      </p>

      <h2 className="text-2xl font-semibold mb-4">Rechtsgrundlage</h2>
      <p className="mb-6">
        Die Verarbeitung Ihrer Daten erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Sie haben das Recht, diese Einwilligung jederzeit mit Wirkung für die Zukunft zu widerrufen.
      </p>

      <h2 className="text-2xl font-semibold mb-4">Ihre Rechte</h2>
      <p className="mb-6">
        Sie haben das Recht, Auskunft über die von Ihnen gespeicherten Daten zu verlangen sowie die Berichtigung, Löschung oder Einschränkung der Verarbeitung Ihrer Daten zu fordern. Darüber hinaus haben Sie das Recht, eine Beschwerde bei der zuständigen Aufsichtsbehörde einzureichen.
      </p>

      <p className="mb-6">
        Bei Fragen zur Verarbeitung Ihrer personenbezogenen Daten oder zur Wahrnehmung Ihrer Rechte wenden Sie sich bitte an den oben genannten Verantwortlichen.
      </p>
    </div>
  );
}