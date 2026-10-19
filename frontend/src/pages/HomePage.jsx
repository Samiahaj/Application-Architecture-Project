import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import LogoutButton from '../components/LogoutButton.jsx'
import '../App.css'

const API_URL = 'http://localhost:8080/api/books'

function HomePage() {
    const [boeken, setBoeken] = useState([])
    const [zoekterm, setZoekterm] = useState('')
    const [laden, setLaden] = useState(true)
    const [fout, setFout] = useState('')
    const [gebruiker, setGebruiker] = useState(null)

    useEffect(() => {
        async function laadGebruiker() {
            try {
                const response = await fetch(
                    'http://localhost:8080/api/users/profile',
                    {
                        method: 'GET',
                        credentials: 'include',
                    },
                )

                if (!response.ok) {
                    setGebruiker(null)
                    return
                }

                const gegevens = await response.json()
                setGebruiker(gegevens)
            } catch (error) {
                console.error('Fout bij het ophalen van de gebruiker:', error)
                setGebruiker(null)
            }
        }

        laadGebruiker()
    }, [])
    useEffect(() => {
        async function laadBoeken() {
            try {
                const response = await fetch(API_URL)

                if (!response.ok) {
                    throw new Error('De boeken konden niet worden geladen.')
                }

                const gegevens = await response.json()
                setBoeken(Array.isArray(gegevens) ? gegevens : [])
            } catch (error) {
                console.error('Fout bij het laden van de boeken:', error)
                setFout(
                    'De boekencollectie is momenteel niet bereikbaar. Controleer of de server actief is.',
                )
            } finally {
                setLaden(false)
            }
        }

        laadBoeken()
    }, [])

    const gefilterdeBoeken = useMemo(() => {
        const zoek = zoekterm.trim().toLowerCase()

        if (!zoek) return boeken

        return boeken.filter((boek) => {
            const titel = boek.titel ?? ''
            const omschrijving = boek.omschrijving ?? ''
            const auteurs = (boek.auteurs ?? [])
                .map((auteur) => auteur.naam ?? '')
                .join(' ')

            return `${titel} ${omschrijving} ${auteurs}`
                .toLowerCase()
                .includes(zoek)
        })
    }, [boeken, zoekterm])

    function formatteerPrijs(prijs) {
        if (prijs == null) return 'Prijs niet beschikbaar'

        return new Intl.NumberFormat('nl-BE', {
            style: 'currency',
            currency: 'EUR',
        }).format(Number(prijs))
    }

    function haalAuteursOp(boek) {
        if (!boek.auteurs || boek.auteurs.length === 0) {
            return 'Auteur onbekend'
        }

        return boek.auteurs
            .map((auteur) => auteur.naam)
            .filter(Boolean)
            .join(', ')
    }

    return (
        <div className="app">
            <header className="navbar">
                <a className="logo" href="#home" aria-label="BoekHaven - Home">
                    <span className="logo-icon">B</span>
                    <span className="logo-name">
            Boek<span>Haven</span>
          </span>
                </a>

                <nav className="navigation" aria-label="Hoofdnavigatie">
                    <a href="#home">Home</a>
                    <a href="#boeken">Boeken</a>
                    <a href="#over-ons">Over ons</a>
                </nav>

                <div className="auth-buttons">
                    {gebruiker ? (
                        <>
      <span className="welcome-user">
        Welkom, {gebruiker.naam}!
      </span>
                        </>
                    ) : (
                        <>
                            <Link className="login-button" to="/login">
                                Inloggen
                            </Link>

                            <Link className="register-button" to="/register">
                                Registreren
                            </Link>
                        </>
                    )}
                </div>
            </header>

            <main>
                <section className="hero" id="home">
                    <div className="hero-content">
                        <div className="eyebrow">
                            <span className="eyebrow-line" />
                            JOUW ONLINE BOEKENWERELD
                        </div>

                        <h1>
                            Elk boek opent
                            <br />
                            een <span>nieuwe</span>
                            <br />
                            <span className="italic-title">wereld.</span>
                        </h1>

                        <p className="hero-description">
                            Laat je meeslepen door bijzondere verhalen, ontdek nieuwe
                            ideeën en vind boeken die bij jou passen. Jouw volgende
                            avontuur begint bij BoekHaven.
                        </p>

                        <div className="hero-actions">
                            <a className="primary-button" href="#boeken">
                                Ontdek onze boeken <span aria-hidden="true">→</span>
                            </a>

                            <a className="text-button" href="#over-ons">
                                Ons verhaal
                            </a>
                        </div>

                        <div className="hero-note">
                            <span className="note-star">✳</span>
                            <span>
                Neem de tijd en ontdek jouw volgende leesavontuur
              </span>
                        </div>
                    </div>

                    <div className="hero-visual" aria-label="Illustratie van boeken">
                        <div className="visual-circle circle-one" />
                        <div className="visual-circle circle-two" />

                        <div className="floating-label label-top">
                            <span>✦</span> De magie van lezen
                        </div>

                        <div className="book-stack">
                            <div className="illustrated-book book-back">
                                <span className="cover-small">BOEKHAVEN COLLECTIE</span>

                                <div className="cover-art art-back">
                                    <span className="art-sun" />
                                    <span className="art-hill hill-one" />
                                    <span className="art-hill hill-two" />
                                </div>

                                <span className="cover-title">Een andere wereld</span>
                                <span className="cover-bottom">
                  EEN VERHAAL OM TE ONTDEKKEN
                </span>
                            </div>

                            <div className="illustrated-book book-front">
                                <span className="cover-small">TIJD OM TE DROMEN</span>

                                <div className="cover-art art-front">
                                    <span className="art-moon">✳</span>
                                    <span className="art-plant plant-one" />
                                    <span className="art-plant plant-two" />
                                    <span className="art-plant plant-three" />
                                </div>

                                <span className="cover-title">
                  Tussen
                  <br />
                  de pagina's
                </span>

                                <span className="cover-bottom">BOEKHAVEN</span>
                            </div>
                        </div>

                        <div className="floating-label label-bottom">
                            <span>♡</span> Jouw volgende favoriete boek
                        </div>

                        <span className="decoration-star star-one">✳</span>
                        <span className="decoration-star star-two">✦</span>
                    </div>

                    <div className="hero-bottom">
                        <span>NEEM EEN MOMENT VOOR JEZELF</span>
                        <span className="hero-bottom-line" />
                        <span>BLADZIJDE NA BLADZIJDE</span>
                    </div>
                </section>

                <section className="intro-section">
                    <div className="intro-number">01 / WELKOM</div>

                    <p>
                        Een goed boek lees je niet alleen.
                        <span> Je beleeft het.</span>
                    </p>

                    <div className="intro-description">
                        Bij BoekHaven begint elk boek aan een nieuw avontuur.
                        Verken onze collectie en laat je verrassen door verhalen
                        die je bijblijven.
                    </div>
                </section>

                <section className="catalog" id="boeken">
                    <div className="catalog-heading">
                        <div>
                            <div className="eyebrow">
                                <span className="eyebrow-line" />
                                DE BOEKHAVEN BIBLIOTHEEK
                            </div>

                            <h2>
                                Vind jouw
                                <br />
                                volgende <span>favoriete boek.</span>
                            </h2>
                        </div>

                        <p className="catalog-intro">
                            Neem rustig een kijkje in onze collectie.
                            Misschien wacht jouw volgende favoriete verhaal hier op je.
                        </p>
                    </div>

                    <div className="catalog-toolbar">
                        <div className="catalog-count">
                            <span className="count-dot" />

                            {laden
                                ? 'Collectie laden…'
                                : `${gefilterdeBoeken.length} boek${gefilterdeBoeken.length === 1 ? '' : 'en'}`}
                        </div>

                        <label className="search-box">
              <span className="search-icon" aria-hidden="true">
                ⌕
              </span>

                            <input
                                type="search"
                                placeholder="Zoek op titel, auteur of omschrijving..."
                                value={zoekterm}
                                onChange={(event) => setZoekterm(event.target.value)}
                                aria-label="Zoek een boek of auteur"
                            />

                            {zoekterm && (
                                <button
                                    className="clear-search"
                                    type="button"
                                    onClick={() => setZoekterm('')}
                                    aria-label="Zoekopdracht wissen"
                                >
                                    ×
                                </button>
                            )}
                        </label>
                    </div>

                    {laden && (
                        <div className="catalog-message" role="status">
                            <div className="loader" />
                            <h3>We maken de boekenkast klaar...</h3>
                            <p>
                                Een ogenblik geduld, we laden de beschikbare boeken.
                            </p>
                        </div>
                    )}

                    {!laden && fout && (
                        <div className="catalog-message error-message" role="alert">
                            <span className="message-icon">!</span>
                            <h3>De collectie is tijdelijk niet bereikbaar</h3>
                            <p>{fout}</p>

                            <button
                                className="primary-button retry-button"
                                type="button"
                                onClick={() => window.location.reload()}
                            >
                                Opnieuw proberen <span aria-hidden="true">↻</span>
                            </button>
                        </div>
                    )}

                    {!laden && !fout && boeken.length === 0 && (
                        <div className="catalog-message">
                            <span className="message-icon">⌑</span>
                            <h3>Jouw volgende leesavontuur begint hier.</h3>
                            <p>
                                Er zijn momenteel geen boeken beschikbaar.
                                Kom binnenkort terug en ontdek onze collectie.
                            </p>
                        </div>
                    )}

                    {!laden &&
                        !fout &&
                        boeken.length > 0 &&
                        gefilterdeBoeken.length === 0 && (
                            <div className="catalog-message">
                                <span className="message-icon">⌕</span>
                                <h3>Geen boeken gevonden</h3>
                                <p>
                                    Probeer een andere titel, omschrijving of auteursnaam.
                                </p>

                                <button
                                    className="text-button reset-button"
                                    type="button"
                                    onClick={() => setZoekterm('')}
                                >
                                    Zoekopdracht wissen
                                </button>
                            </div>
                        )}

                    {!laden && !fout && gefilterdeBoeken.length > 0 && (
                        <div className="book-grid">
                            {gefilterdeBoeken.map((boek, index) => (
                                <article className="book-card" key={boek.id}>
                                    <div className={`book-cover cover-variant-${index % 4}`}>
                                        <div className="cover-topline">
                                            <span>BOEKHAVEN</span>
                                            <span className="cover-symbol">✳</span>
                                        </div>

                                        <div className="cover-illustration">
                                            <span className="cover-orbit orbit-one" />
                                            <span className="cover-orbit orbit-two" />
                                            <span className="cover-sun" />
                                            <span className="cover-land land-one" />
                                            <span className="cover-land land-two" />
                                            <span className="cover-land land-three" />
                                        </div>

                                        <div className="cover-book-info">
                      <span className="cover-label">
                        EEN VERHAAL OM TE ONTDEKKEN
                      </span>

                                            <h3>{boek.titel}</h3>

                                            <span className="cover-author">
                        {haalAuteursOp(boek)}
                      </span>
                                        </div>
                                    </div>

                                    <div className="book-card-info">
                                        <div className="book-card-author">
                                            {haalAuteursOp(boek)}
                                        </div>

                                        <h3 className="book-card-title">{boek.titel}</h3>

                                        <p className="book-description">
                                            {boek.omschrijving ||
                                                'Ontdek dit boek uit onze collectie.'}
                                        </p>

                                        <div className="book-card-bottom">
                      <span className="book-price">
                        {formatteerPrijs(boek.prijs)}
                      </span>

                                            <span
                                                className={`stock-badge ${
                                                    Number(boek.voorraad) > 0
                                                        ? 'in-stock'
                                                        : 'out-of-stock'
                                                }`}
                                            >
                        {Number(boek.voorraad) > 0
                            ? 'Op voorraad'
                            : 'Niet beschikbaar'}
                      </span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    <div className="catalog-footer">
                        <span>BOEKHAVEN · JOUW VOLGENDE VERHAAL</span>
                        <span className="catalog-footer-symbol">✳</span>
                    </div>
                </section>

                <section className="about-section" id="over-ons">
                    <div className="about-decoration" aria-hidden="true">
                        <span className="about-big-letter">B</span>
                        <span className="about-star">✳</span>
                    </div>

                    <div className="about-content">
                        <div className="eyebrow eyebrow-light">
                            <span className="eyebrow-line" />
                            ONS VERHAAL
                        </div>

                        <h2>
                            De mooiste
                            <br />
                            avonturen beginnen
                            <br />
                            <span>tussen twee kaften.</span>
                        </h2>

                        <p>
                            BoekHaven is een online boekhandelproject voor iedereen
                            die van lezen houdt. Ontdek boeken, reserveer je volgende
                            leesavontuur en deel jouw mening over gelezen verhalen.
                        </p>

                        <a className="about-button" href="#boeken">
                            Bekijk de collectie <span aria-hidden="true">→</span>
                        </a>
                    </div>
                </section>

                <section className="quote-section">
                    <span className="quote-mark">“</span>

                    <p>
                        Een boek is een open venster
                        <br />
                        naar een andere wereld.
                    </p>

                    <span className="quote-caption">
            SLA DE VOLGENDE BLADZIJDE OM.
          </span>
                </section>
            </main>

            <footer className="footer">
                <div className="footer-main">
                    <div className="footer-brand">
                        <a className="logo footer-logo" href="#home">
                            <span className="logo-icon">B</span>
                            <span className="logo-name">
                Boek<span>Haven</span>
              </span>
                        </a>

                        <p>
                            Boeken, verhalen
                            <br />
                            en duizend werelden om te ontdekken.
                        </p>
                    </div>

                    <div className="footer-links">
                        <span className="footer-heading">NAVIGATIE</span>
                        <a href="#home">Home</a>
                        <a href="#boeken">Boeken</a>
                        <a href="#over-ons">Over ons</a>
                    </div>

                    <div className="footer-links">
                        <span className="footer-heading">WAAR WIJ VAN HOUDEN</span>
                        <span>Leesplezier</span>
                        <span>Nieuwe ontdekkingen</span>
                        <span>Verhalen delen</span>
                    </div>
                </div>

                <div className="footer-bottom">
                    <span>© 2026 BoekHaven · Project Application Architecture</span>
                    <a href="#home">Terug naar boven ↑</a>
                </div>
            </footer>
        </div>
    )
}

export default HomePage