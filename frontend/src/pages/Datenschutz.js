import React from 'react';

export default function Datenschutz() {
  return (
    <div className='m-6'>
      <h1>Datenschutzerklärung</h1>
      <p>
        Diese Datenschutzerklärung informiert über die Erhebung und Verarbeitung personenbezogener Daten im Rahmen der Lottoschein-Muster-Analyse.
      </p>

      <h2 >Verantwortlicher für die Datenverarbeitung</h2>
      <p className="mb-4">
        Verantwortlich für die Datenverarbeitung ist:
      </p>
      <address className="mb-10">
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

      <h2>Art der verarbeiteten Daten</h2>
      <p>
        Im Rahmen der Teilnahme an der Lottoschein-Muster-Analyse werden personenbezogene Daten verarbeitet. Diese Daten umfassen insbesondere:
      </p>
      <ul className="body-list mb-6">
        <li>Ihr Name</li>
        <li>Ihre RUB-Mailadresse</li>
        <li>(eventuell noch Studiengang?)</li>
      </ul>

      <h2>Zweck der Datenverarbeitung</h2>
      <p>
        Die genannten Daten werden ausschließlich zum Zweck der Durchführung und Auswertung der Lottoschein-Muster-Analyse im Rahmen meiner Bachelorarbeit verwendet.
      </p>

      <h2>Speicherdauer</h2>
      <p>
        Die erhobenen Daten werden nach Abschluss der Bachelorarbeit und Veröffentlichung der Ergebnisse gelöscht, spätestens jedoch nach [Angabe einer Frist, z.B. sechs Monate nach Abschluss].
      </p>

      <h2>Rechtsgrundlage</h2>
      <p>
        Die Verarbeitung Ihrer Daten erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Sie haben das Recht, diese Einwilligung jederzeit mit Wirkung für die Zukunft zu widerrufen.
      </p>

      <h2>Ihre Rechte</h2>
      <p>
        Sie haben das Recht, Auskunft über die von Ihnen gespeicherten Daten zu verlangen sowie die Berichtigung, Löschung oder Einschränkung der Verarbeitung Ihrer Daten zu fordern. Darüber hinaus haben Sie das Recht, eine Beschwerde bei der zuständigen Aufsichtsbehörde einzureichen.
      </p>

      <p>
        Bei Fragen zur Verarbeitung Ihrer personenbezogenen Daten oder zur Wahrnehmung Ihrer Rechte wenden Sie sich bitte an den oben genannten Verantwortlichen.
      </p>
    </div>
  );
}