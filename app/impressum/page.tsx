import Link from "next/link";

export const metadata = {
  title: "Imprint - banana.fyi",
  description: "Legal Notice (Imprint) for banana.fyi",
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to app
        </Link>

        <h1 className="text-4xl font-bold text-white mb-8">Imprint</h1>

        <div className="prose prose-invert prose-zinc max-w-none">
          <p className="text-white/70 text-lg mb-6">
            Angaben gemäß § 5 TMG
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Diensteanbieter</h2>
            <p className="text-white/60 mb-4">
              [Vorname Nachname]<br />
              [Straße Hausnummer]<br />
              [PLZ Ort]<br />
              Deutschland
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Kontakt</h2>
            <p className="text-white/60 mb-4">
              E-Mail:{" "}
              <a href="mailto:hello@banana.fyi" className="text-white hover:underline">
                hello@banana.fyi
              </a>
            </p>
            {/* Uncomment when phone number is available
            <p className="text-white/60 mb-4">
              Telefon: [Telefonnummer]
            </p>
            */}
          </section>

          {/* Uncomment when VAT ID is available
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Umsatzsteuer-ID</h2>
            <p className="text-white/60 mb-4">
              Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:<br />
              [DE XXX XXX XXX]
            </p>
          </section>
          */}

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            <p className="text-white/60 mb-4">
              [Vorname Nachname]<br />
              [Straße Hausnummer]<br />
              [PLZ Ort]<br />
              Deutschland
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">EU-Streitschlichtung</h2>
            <p className="text-white/60 mb-4">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p className="text-white/60 mb-4">
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Verbraucherstreitbeilegung/Universalschlichtungsstelle
            </h2>
            <p className="text-white/60 mb-4">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Haftung für Inhalte</h2>
            <p className="text-white/60 mb-4">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen.
            </p>
            <p className="text-white/60 mb-4">
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
              allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch
              erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
              Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend
              entfernen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Haftung für Links</h2>
            <p className="text-white/60 mb-4">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
              übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder
              Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der
              Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum
              Zeitpunkt der Verlinkung nicht erkennbar.
            </p>
            <p className="text-white/60 mb-4">
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
              Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
              Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Urheberrecht</h2>
            <p className="text-white/60 mb-4">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
              dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
              der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
              Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind
              nur für den privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
            <p className="text-white/60 mb-4">
              Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die
              Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche
              gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden,
              bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen
              werden wir derartige Inhalte umgehend entfernen.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
