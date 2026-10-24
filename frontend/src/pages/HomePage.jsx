/**
 * Openbare startpagina-component van de applicatie.
 * Toont een introductie-hero met inspirerende teksten, realtime zoek- en filterfunctionaliteit
 * voor de volledige boekencollectie, prijzen, voorraadstatus en dynamische boekomslagen.
 */


import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/api.js';
import PageLayout from '../components/PageLayout.jsx';

function auteursTekst(boek) {
    if (!Array.isArray(boek.auteurs) || boek.auteurs.length === 0) {
        return 'Auteur onbekend';
    }

    return boek.auteurs
        .map((auteur) => auteur.naam || auteur.voornaam || 'Onbekende auteur')
        .join(', ');
}

function prijsFormatter(prijs) {
    if (prijs === null || prijs === undefined || prijs === '') {
        return 'Niet beschikbaar';
    }
    const bedrag = Number(prijs);
    if (!Number.isFinite(bedrag)) {
        return 'Niet beschikbaar';
    }
    return bedrag.toLocaleString('nl-BE', {
        style: 'currency',
        currency: 'EUR'
    });
}

export default function HomePage() {
    const [boeken, setBoeken] = useState([]);
    const [zoekterm, setZoekterm] = useState('');
    const [laden, setLaden] = useState(true);
    const [fout, setFout] = useState('');

    useEffect(() => {
        let actief = true;

        apiFetch('/api/books')
            .then((data) => {
                if (actief) {
                    setBoeken(Array.isArray(data) ? data : []);
                }
            })
            .catch((error) => {
                if (actief) {
                    setFout(
                        error.message ||
                        'De collectie kon niet worden geladen.'
                    );
                }
            })
            .finally(() => {
                if (actief) {
                    setLaden(false);
                }
            });

        return () => {
            actief = false;
        };
    }, []);

    const gefilterdeBoeken = useMemo(() => {
        const term = zoekterm.trim().toLocaleLowerCase('nl');

        if (!term) {
            return boeken;
        }

        return boeken.filter((boek) =>
            `${boek.titel || ''} ${boek.omschrijving || ''} ${auteursTekst(boek)} ${boek.isbn || ''}`
                .toLocaleLowerCase('nl')
                .includes(term)
        );
    }, [boeken, zoekterm]);

    return (
        <PageLayout>
            <main>
                {/* Welkomstgedeelte */}
                <section className="hero-section fade-in">
                    <div className="hero-copy slide-in">
                        <p className="eyebrow">
                            JOUW VOLGENDE FAVORIETE VERHAAL
                        </p>

                        <h1>
                            Boeken die je
                            <br />
                            <em>bijblijven.</em>
                        </h1>

                        <p className="hero-description">
                            Ontdek verhalen om in te verdwijnen, nieuwe
                            perspectieven en schrijvers die je wereld groter
                            maken.
                        </p>

                        <a className="button" href="#collectie">
                            Ontdek de collectie{' '}
                            <span aria-hidden="true">↘</span>
                        </a>
                    </div>

                    <div className="hero-art fade-in" aria-hidden="true" style={{ animationDelay: '0.3s' }}>
                        <div className="art-circle" />

                        <div className="book book-one">
                            <span>
                                DE KUNST
                                <br />
                                VAN HET
                                <br />
                                VERHALEN
                            </span>
                            <small>BOEKHAVEN</small>
                        </div>

                        <div className="book book-two">
                            <span>
                                STILLE
                                <br />
                                WERELDEN
                            </span>
                        </div>

                        <div className="art-note">
                            Neem de tijd.
                            <br />
                            Lees iets moois.
                        </div>
                    </div>
                </section>

                {/* Boekencollectie */}
                <section className="collection-section fade-in" id="collectie" style={{ animationDelay: '0.2s' }}>
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">MET ZORG GEKOZEN</p>

                            <h2>Onze collectie</h2>

                            <p className="section-description">
                                Vind het boek dat bij jouw moment past.
                            </p>
                        </div>

                        <label className="search-box">
                            <span aria-hidden="true">⌕</span>

                            <input
                                type="search"
                                value={zoekterm}
                                onChange={(event) =>
                                    setZoekterm(event.target.value)
                                }
                                placeholder="Zoek op titel of auteur…"
                                aria-label="Zoek boeken"
                            />
                        </label>
                    </div>

                    {/* Laden */}
                    {laden && (
                        <p className="status-message fade-in">
                            De collectie wordt geladen…
                        </p>
                    )}

                    {/* Foutmelding */}
                    {!laden && fout && (
                        <div className="alert alert-error slide-in">
                            <p>{fout}</p>

                            <button
                                className="text-button"
                                onClick={() => window.location.reload()}
                            >
                                Opnieuw proberen
                            </button>
                        </div>
                    )}

                    {/* Geen boeken gevonden */}
                    {!laden && !fout && gefilterdeBoeken.length === 0 && (
                        <div className="empty-state slide-in">
                            <h3>Geen boeken gevonden</h3>
                            <p>
                                Probeer een andere zoekterm of controleer
                                later opnieuw onze collectie.
                            </p>
                        </div>
                    )}

                    {/* Boeken grid */}
                    {!laden && !fout && gefilterdeBoeken.length > 0 && (
                        <div className="book-grid">
                            {gefilterdeBoeken.map((boek, index) => {
                                const coverIndex = (boek.id ? boek.id % 5 : index % 5) + 1;

                                return (
                                    <article
                                        className="book-card slide-in"
                                        key={boek.id}
                                        style={{ animationDelay: `${0.1 * (index % 12)}s`, animationFillMode: 'both' }}
                                    >
                                        <Link
                                            className="book-cover-link"
                                            to={`/boeken/${boek.id}`}
                                            aria-label={`Bekijk ${boek.titel}`}
                                            style={{ display: 'block' }}
                                        >
                                            <div className="book-cover-container" style={{ height: '280px', overflow: 'hidden', borderRadius: 'var(--radius-small)', position: 'relative' }}>
                                                {boek.imageUrl && boek.imageUrl.startsWith('http') ? (
                                                    <img
                                                        src={boek.imageUrl}
                                                        alt={boek.titel}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                        onError={(e) => {
                                                            // Si l'image ne charge pas (erreur 404 par exemple), on cache l'image cassée
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className={`book-cover cover-theme-${coverIndex}`} style={{ height: '100%', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.8 }}>
                BOEKHAVEN · COLLECTIE
            </span>

                                                        <div>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', display: 'block', marginBottom: '8px', lineHeight: 1.2 }}>
                    {boek.titel}
                </span>

                                                            <span style={{ fontSize: '12px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {auteursTekst(boek)}
                </span>
                                                        </div>

                                                        <span aria-hidden="true" style={{ alignSelf: 'flex-end', fontSize: '20px', opacity: 0.4 }}>
                ✳
            </span>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        <div className="book-card-info">
                                            <span className="book-card-author">{auteursTekst(boek)}</span>

                                            <Link to={`/boeken/${boek.id}`}>
                                                <h3 className="book-card-title">{boek.titel}</h3>
                                            </Link>

                                            <p className="book-description">
                                                {boek.omschrijving || 'Geen beschrijving beschikbaar.'}
                                            </p>

                                            <div className="book-card-bottom">
                                                <span className="book-price">{prijsFormatter(boek.prijs)}</span>

                                                <span className={`stock-badge ${boek.voorraad > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                                    {boek.voorraad > 0 ? `Op voorraad (${boek.voorraad})` : 'Niet op voorraad'}
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Inspiratie */}
                <section className="quote-section slide-in" style={{ animationDelay: '0.4s' }}>
                    <p className="eyebrow">
                        EEN KLEIN MOMENT VOOR JEZELF
                    </p>

                    <blockquote>
                        “Een boek is een deur naar een wereld die op je wacht.”
                    </blockquote>

                    <p style={{ color: 'var(--burgundy)', fontWeight: 'bold', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        Maak het jezelf gemakkelijk. Het volgende verhaal
                        begint hier.
                    </p>
                </section>
            </main>
        </PageLayout>
    );
}