import './App.css'

function App() {
  return (
      <div className="app">
        <header className="navbar">
          <a className="logo" href="/">
            Boek<span>Haven</span>
          </a>

          <nav className="navigation">
            <a href="#boeken">Boeken</a>
            <a href="#over-ons">Over ons</a>
          </nav>

          <div className="auth-buttons">
            <button className="login-button">Inloggen</button>
            <button className="register-button">Registreren</button>
          </div>
        </header>

        <main>
          <section className="hero">
            <div className="hero-content">
              <p className="eyebrow">JOUW VOLGENDE HOOFDSTUK BEGINT HIER</p>

              <h1>
                Ontdek verhalen.
                <br />
                <span>Vind jouw boek.</span>
              </h1>

              <p className="hero-description">
                Van spannende thrillers tot inspirerende verhalen:
                ontdek boeken die bij jou passen.
              </p>

              <a className="hero-button" href="#boeken">
                Ontdek onze boeken →
              </a>
            </div>

            <div className="hero-decoration" aria-hidden="true">
              <div className="book book-one">
                <span>VERHALEN</span>
                <strong>De kunst<br />van het lezen</strong>
              </div>

              <div className="book book-two">
                <span>ONTDEK</span>
                <strong>Nieuwe<br />werelden</strong>
              </div>
            </div>
          </section>

          <section className="catalog" id="boeken">
            <div className="section-heading">
              <div>
                <p className="eyebrow">ONZE COLLECTIE</p>
                <h2>Ontdek onze boeken</h2>
              </div>

              <p className="section-description">
                Jouw volgende favoriete boek wacht op je.
              </p>
            </div>

            <div className="empty-catalog">
              <div className="empty-icon">📚</div>
              <h3>Onze boeken komen eraan</h3>
              <p>
                We maken onze boekencollectie klaar.
                Binnenkort ontdek je hier ons volledige aanbod.
              </p>
            </div>
          </section>
        </main>

        <footer id="over-ons">
          <a className="logo footer-logo" href="/">
            Boek<span>Haven</span>
          </a>

          <p>Jouw plek om nieuwe verhalen te ontdekken.</p>

          <small>© 2026 BoekHaven · Application Architecture Project</small>
        </footer>
      </div>
  )
}

export default App