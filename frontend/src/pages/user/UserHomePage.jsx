import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PageLayout from '../../components/PageLayout.jsx';

function auteursTekst(boek) {
    if (!Array.isArray(boek.auteurs) || boek.auteurs.length === 0) {
        return 'Auteur onbekend';
    }

    return boek.auteurs
        .map((auteur) => auteur.naam || auteur.voornaam || 'Onbekende auteur')
        .join(', ');
}

export default function UserHomePage() {
    const [boeken, setBoeken] = useState([]);
    const [zoekterm, setZoekterm] = useState('');
    const [laden, setLaden] = useState(true);
    const [fout, setFout] = useState('');

    const { gebruiker } = useAuth();

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
                    setFout(error.message || 'De collectie kon niet worden geladen.');
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

        if (!term) return boeken;

        return boeken.filter((boek) =>
            `${boek.titel || ''} ${boek.omschrijving || ''} ${auteursTekst(boek)} ${boek.isbn || ''}`
                .toLocaleLowerCase('nl')
                .includes(term)
        );
    }, [boeken, zoekterm]);

    return (
        <PageLayout>
            <main>
                <section className="hero-section">
                    <div className="hero-copy">
                        <p className="eyebrow">WELKOM TERUG BIJ BOEKHAVEN</p>

                        <h1>
                            Fijn dat je<br />
                            <em>er bent.</em>
                        </h1>

                        <p className="hero-description">
                            {gebruiker?.naam
                                ? `Hallo ${gebruiker.naam}, ontdek je volgende favoriete verhaal.`
                                : 'Ontdek verhalen om in te verdwijnen en schrijvers die je wereld groter maken.'}
                        </p>

                        <a className="button" href="#collectie">
                            Ontdek de collectie <span aria-hidden="true">↘</span>
                        </a>
                    </div>

                    <div className="hero-art" aria-hidden="true">
                        <div className="art-circle" />

                        <div className="book book-one">
                            <span>DE KUNST<br />VAN HET<br />VERHALEN</span>
                            <small>BOEKHAVEN</small>
                        </div>

                        <div className="book book-two">
                            <span>STILLE<br />WERELDEN</span>
                        </div>

                        <div className="art-note">
                            Neem de tijd.<br />
                            Lees iets moois.
                        </div>
                    </div>
                </section>

                <section className="collection-section" id="collectie">
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
                                value={zoekterm}
                                onChange={(event) => setZoekterm(event.target.value)}
                                placeholder="Zoek op titel of auteur…"
                                aria-label="Zoek boeken"
                            />
                        </label>
                    </div>

                    {laden && (
                        <p className="status-message">
                            De collectie wordt geladen…
                        </p>
                    )}

                    {!laden && fout && (
                        <div className="alert alert-error">
                            {fout}
                            <button
                                className="text-button"
                                onClick={() => window.location.reload()}
                            >
                                Opnieuw proberen
                            </button>
                        </div>
                    )}

                    {!laden && !fout && gefilterdeBoeken.length === 0 && (
                        <div className="empty-state">
                            <h3>Geen boeken gevonden</h3>
                            <p>Probeer een andere zoekterm.</p>
                        </div>
                    )}

                    <div className="book-grid">
                        {gefilterdeBoeken.map((boek, index) => (
                            <article className="book-card" key={boek.id}>
                                <div className={`book-cover cover-${index % 6}`}>
                                    <span className="cover-label">
                                        BOEKHAVEN · COLLECTIE
                                    </span>

                                    <span className="cover-title">
                                        {boek.titel}
                                    </span>

                                    <span className="cover-author">
                                        {auteursTekst(boek)}
                                    </span>

                                    <span className="cover-decoration" aria-hidden="true">
                                        ✳
                                    </span>
                                </div>

                                <div className="book-info">
                                    <p className="book-author">
                                        {auteursTekst(boek)}
                                    </p>

                                    <h3>{boek.titel}</h3>

                                    <p className="book-description">
                                        {boek.omschrijving}
                                    </p>

                                    <div className="book-card-bottom">
                                        <strong>
                                            {Number(boek.prijs).toLocaleString('nl-BE', {
                                                style: 'currency',
                                                currency: 'EUR',
                                            })}
                                        </strong>

                                        <Link
                                            className="text-link"
                                            to={`/boeken/${boek.id}`}
                                        >
                                            Bekijk boek <span aria-hidden="true">→</span>
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="quote-section">
                    <p className="eyebrow">EEN KLEIN MOMENT VOOR JEZELF</p>

                    <blockquote>
                        “Een boek is een deur naar een wereld die op je wacht.”
                    </blockquote>

                    <p>
                        Maak het jezelf gemakkelijk. Het volgende verhaal begint hier.
                    </p>
                </section>
            </main>
        </PageLayout>
    );
}