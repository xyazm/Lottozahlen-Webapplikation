import React from 'react';

export default function Home() {

  return (
    <div className='m-6'>
      <h1>Willkommen zu meiner Bachelorarbeit</h1>
      <p>
      Schon mal über Zufall nachgedacht? Ist der Zufall wirklich „unberechenbar“ oder lassen sich doch Muster erkennen?
      Diese Webseite bietet dir einen einfachen Einstieg in das Verständnis von Zufall und Wahrscheinlichkeiten. Hier kannst
      du Lottoscheine ausfüllen und direkt herausfinden, wie zufällig deine Entscheidungen tatsächlich sind.
    </p>

    <h2>Ziel der Webseite</h2>
    <p>
      Diese Webanwendung wurde im Rahmen meiner Bachelorarbeit entwickelt, um dir ein besseres Verständnis von Zufall zu vermitteln.
      Nach dem Ausfüllen der Lottoscheine bekommst du ein Feedback, das dir zeigt, welche Muster du gewählt hast und wie nah deine
      Auswahl an einer echten Zufallsverteilung liegt.
    </p>

    <h2>Wie funktioniert’s?</h2>
    <ol>
      <li>
        <strong>Login:</strong>
        <ul className="body-list mb-6">
          <li>Klicke oben auf „Login“ und gib deine RUB-Mailadresse ein.</li>
          <li>Du erhältst einen Zugangscode per E-Mail, der 20 Minuten gültig und nur einmal nutzbar ist.</li>
        </ul>
      </li>
      <li>
        <strong>Nutzungsbedingungen akzeptieren:</strong>
        <ul className="body-list mb-6">
          <li>Beim ersten Login erscheint ein Hinweisfenster mit den Nutzungsbedingungen. Lies sie durch und akzeptiere sie, um die Webseite nutzen zu können.</li>
        </ul>
      </li>
      <li>
        <strong>Lottoscheine ausfüllen:</strong>
        <ul className="body-list mb-6">
          <li>Nach dem Login gelangst du direkt zur Lottoschein-Seite.</li>
          <li>Markiere pro Schein 6 Zahlen, indem du auf die Felder klickst.</li>
          <li>Falls du eine Zahl wieder entfernen möchtest, klicke einfach erneut auf die markierte Zahl.</li>
          <li>Eine Warnung erscheint, wenn du mehr oder weniger als 6 Zahlen markierst.</li>
        </ul>
      </li>
      <li>
        <strong>Abgabe und Feedback:</strong>
        <ul className="body-list mb-6">
          <li>Sobald alle Scheine ausgefüllt sind, klickst du auf „Lottoscheine abgeben“.</li>
          <li>Du erhältst eine Analyse, die zeigt:
            <ul>
              <li>Welche Muster du gewählt hast.</li>
              <li>Wie nah deine Auswahl an einer zufälligen Verteilung liegt.</li>
            </ul>
          </li>
        </ul>
      </li>
    </ol>

    <h2>Wichtige Hinweise</h2>
    <ul>
      <li>Die Webseite dient ausschließlich Lehr- und Forschungszwecken.</li>
      <li>Es handelt sich um eine Simulation – es gibt keine echten Gewinne.</li>
      <li>Deine Daten werden anonymisiert verarbeitet und nicht weitergegeben.</li>
    </ul>
    <p className='pt-4'>
      Viel Spaß bei deiner Analyse und beim Entdecken der Welt des Zufalls!
    </p>
    </div>
  );
};
