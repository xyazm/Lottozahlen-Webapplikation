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
      </ul>

      <h2>Zweck der Datenverarbeitung</h2>
      <p>
        Die genannten Daten werden ausschließlich zum Zweck der Durchführung und Auswertung der Lottoschein-Muster-Analyse im Rahmen meiner Bachelorarbeit verwendet.
        Personenbezogene Daten werden gespeichert, um den Lernprozess rückverfolgen zu können. Diese Daten können nur vom Administrator eingesehen werden und werden ansonsten 
        ausschließlich anonymisiert in den Statistiken verarbeitet.
      </p>

      <h2>Speicherdauer</h2>
      <p>
        Die erhobenen Daten werden nach Abschluss der Bachelorarbeit und Veröffentlichung der Ergebnisse gelöscht, spätestens jedoch nach sechs Monaten.
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

      <h2>Haftungsausschluss</h2>
      <p>
        Diese Webanwendung dient ausschließlich Forschungs- und Lehrzwecken. Es handelt sich um eine reine Simulation, und es besteht keinerlei Anspruch auf Gewinne jeglicher Art. 
        Jede Ähnlichkeit dieser Webanwendung mit anderen Webseiten oder Plattformen ist rein zufällig und nicht beabsichtigt. Der Betreiber der Seite übernimmt keine Haftung für etwaige Missverständnisse oder irrtümliche Nutzungen der Seite.
      </p>

      <h2>Nutzungsbedingungen</h2>
      <p>
        Mit der Nutzung dieser Webanwendung und der ausdrücklichen Akzeptanz der Nutzungsbedingungen erklärt sich der Benutzer mit den folgenden Bedingungen einverstanden:
      </p>
      <ul className="body-list mb-6">
        <li>Die Nutzung der Webanwendung erfolgt ausschließlich zu Lehr- und Forschungszwecken.</li>
        <li>Es besteht kein Anspruch auf Gewinne oder andere Ansprüche.</li>
        <li>Personenbezogene Daten, die für die Rückverfolgung des Lernprozesses relevant sind, werden gespeichert.</li>
        <li>Die gespeicherten Daten können ausschließlich vom Administrator eingesehen werden und werden ansonsten anonymisiert in Statistiken verarbeitet.</li>
      </ul>

      <p>
        Durch die Nutzung der Webanwendung stimmen Sie diesen Bedingungen zu. Sollten Sie mit den Bedingungen nicht einverstanden sein, bitten wir Sie, die Anwendung nicht zu nutzen.
      </p>
    </div>
  );
}