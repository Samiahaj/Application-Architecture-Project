/**
 * Detailpagina-component voor een individueel boek.
 * Toont uitgebreide boekinformatie (inclusief afbeeldingen en auteurs), de voorraadstatus,
 * de functionaliteit voor gebruikers om boeken te reserveren, en een sectie om recensies te bekijken, in te dienen of te beantwoorden.
 */

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PageLayout from '../../components/PageLayout.jsx';



function auteursTekst(boek) {
    if (!Array.isArray(boek?.auteurs) || boek.auteurs.length === 0) {
        return 'Auteur onbekend';
    }

    return boek.auteurs
        .map((auteur) => auteur.naam || 'Onbekende auteur')
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

export default function BookDetailPage() {
    const { id } = useParams();
    const { gebruiker } = useAuth();

    const [boek, setBoek] = useState(null);
    const [reviews, setReviews] = useState([]);

    const [laden, setLaden] = useState(true);
    const [fout, setFout] = useState('');

    const [reserveren, setReserveren] = useState(false);
    const [reserveringFout, setReserveringFout] = useState('');
    const [reserveringSucces, setReserveringSucces] = useState('');

    const [score, setScore] = useState(5);
    const [tekst, setTekst] = useState('');
    const [reviewFout, setReviewFout] = useState('');
    const [reviewSucces, setReviewSucces] = useState('');
    const [reviewLaden, setReviewLaden] = useState(false);

    useEffect(() => {
        let actief = true;


        window.scrollTo({ top: 0, behavior: 'smooth' });

        async function laadBoekEnReviews() {
            setLaden(true);
            setFout('');

            try {
                const boekData = await apiFetch(`/api/books/${id}`);

                if (!boekData) {
                    throw new Error('Dit boek werd niet gevonden.');
                }

                let reviewsData = [];

                try {
                    const gegevens = await apiFetch(`/api/reviews/book/${id}`);
                    reviewsData = Array.isArray(gegevens) ? gegevens : [];
                } catch {
                    reviewsData = [];
                }

                if (actief) {
                    setBoek(boekData);
                    setReviews(reviewsData);
                }
            } catch (error) {
                if (actief) {
                    setBoek(null);
                    setFout(error.message || 'De boekgegevens konden niet worden geladen.');
                }
            } finally {
                if (actief) {
                    setLaden(false);
                }
            }
        }

        laadBoekEnReviews();

        return () => {
            actief = false;
        };
    }, [id]);

    async function reserveerBoek() {
        setReserveringFout('');
        setReserveringSucces('');

        if (!gebruiker || gebruiker.rol !== 'USER') {
            setReserveringFout('Je moet ingelogd zijn als gebruiker om een boek te reserveren.');
            return;
        }

        if (boek?.voorraad != null && Number(boek.voorraad) <= 0) {
            setReserveringFout('Dit boek is momenteel niet beschikbaar.');
            return;
        }

        setReserveren(true);

        try {
            const parameters = new URLSearchParams({ bookId: String(id) });
            await apiFetch(`/api/reservations?${parameters.toString()}`, { method: 'POST' });
            setReserveringSucces('Je boek is succesvol gereserveerd!');
        } catch (error) {
            setReserveringFout(error.message || 'Het boek kon niet worden gereserveerd. Probeer het opnieuw.');
        } finally {
            setReserveren(false);
        }
    }

    async function verstuurReview(event) {
        event.preventDefault();
        setReviewFout('');
        setReviewSucces('');

        if (!gebruiker || gebruiker.rol !== 'USER') {
            setReviewFout('Je moet ingelogd zijn om een beoordeling te plaatsen.');
            return;
        }

        if (!tekst.trim()) {
            setReviewFout('Vul een beoordeling in.');
            return;
        }

        setReviewLaden(true);

        try {
            const parameters = new URLSearchParams({
                bookId: String(id),
                score: String(score),
                tekst: tekst.trim()
            });

            await apiFetch(`/api/reviews?${parameters.toString()}`, { method: 'POST' });

            setReviewSucces('Je beoordeling is succesvol geplaatst.');
            setTekst('');

            const nieuweReviews = await apiFetch(`/api/reviews/book/${id}`);
            setReviews(Array.isArray(nieuweReviews) ? nieuweReviews : []);
        } catch (error) {
            setReviewFout(error.message || 'Je beoordeling kon niet worden geplaatst. Controleer of je aan de voorwaarden voldoet.');
        } finally {
            setReviewLaden(false);
        }
    }

    if (laden) {
        return (
            <PageLayout>
                <main className="dashboard-page fade-in">
                    <p className="status-message">De boekgegevens worden geladen...</p>
                </main>
            </PageLayout>
        );
    }

    if (fout || !boek) {
        return (
            <PageLayout>
                <main className="dashboard-page fade-in">
                    <div className="alert alert-error">{fout || 'Dit boek werd niet gevonden.'}</div>
                    <Link className="button" to="/">Terug naar de collectie</Link>
                </main>
            </PageLayout>
        );
    }

    const gemiddeldeScore = reviews.length > 0
        ? reviews.reduce((totaal, review) => totaal + (Number(review.score) || 0), 0) / reviews.length
        : null;

    const voorraadBekend = boek.voorraad !== null && boek.voorraad !== undefined;
    const geenVoorraad = voorraadBekend && Number(boek.voorraad) <= 0;
    const coverIndex = (boek.id ? boek.id % 5 : 0) + 1;

    return (
        <PageLayout>
            <main className="dashboard-page book-detail-page fade-in">
                <div style={{ marginBottom: '35px' }}>
                    <Link className="text-link" to="/">
                        ← Terug naar de collectie
                    </Link>
                </div>

                <section className="book-detail" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '50px', alignItems: 'start' }}>
                    <div className="book-detail-cover slide-in" style={{ animationDelay: '0.1s' }}>
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
                    </div>

                    <div className="book-detail-info slide-in" style={{ animationDelay: '0.2s', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <p className="eyebrow" style={{ marginBottom: '10px' }}>{auteursTekst(boek)}</p>
                            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '38px', color: 'var(--brown-dark)', margin: '0 0 15px 0' }}>
                                {boek.titel}
                            </h1>
                            {boek.isbn && (
                                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '15px' }}>
                                    ISBN: {boek.isbn}
                                </p>
                            )}

                            {Array.isArray(boek.genres) && boek.genres.length > 0 && (
                                <p style={{
                                    fontSize: '14px',
                                    color: 'var(--burgundy)',
                                    margin: '0 0 15px 0',
                                    fontWeight: 600
                                }}>
                                    Genres : {boek.genres.join(', ')}
                                </p>
                            )}


                        </div>

                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--brown)' }}>
                            {prijsFormatter(boek.prijs)}
                        </div>

                        <div>
                            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--brown-light)', marginBottom: '8px' }}>
                                Over dit boek
                            </h3>
                            <p style={{ lineHeight: '1.8', color: '#6e6257', margin: 0 }}>
                                {boek.omschrijving || 'Geen omschrijving beschikbaar voor dit boek.'}
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                            <span className={`stock-badge ${!geenVoorraad ? 'in-stock' : 'out-of-stock'}`} style={{ fontSize: '12px' }}>
                                {!geenVoorraad ? `Op voorraad (${boek.voorraad} beschikbaar)` : 'Momenteel niet op voorraad'}
                            </span>
                        </div>

                        {gebruiker?.rol === 'USER' && (
                            <div style={{ marginTop: '20px' }}>
                                <button
                                    className="button"
                                    type="button"
                                    onClick={reserveerBoek}
                                    disabled={reserveren || geenVoorraad}
                                    style={{ opacity: geenVoorraad ? 0.6 : 1, cursor: geenVoorraad ? 'not-allowed' : 'pointer' }}
                                >
                                    {reserveren ? 'Bezig met reserveren...' : 'Boek reserveren'}
                                </button>

                                {reserveringFout && <div className="alert alert-error" style={{ marginTop: '15px' }}>{reserveringFout}</div>}
                                {reserveringSucces && <div className="alert alert-success" style={{ marginTop: '15px' }}>{reserveringSucces}</div>}
                            </div>
                        )}
                    </div>
                </section>

                <section className="reviews-section fade-in" style={{ animationDelay: '0.3s', marginTop: '60px', paddingTop: '60px', borderTop: '1px solid var(--line)' }}>
                    <div className="section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <p className="eyebrow">ERVARINGEN VAN LEZERS</p>
                            <h2>Beoordelingen</h2>
                        </div>

                        {gemiddeldeScore !== null && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--champagne)', color: 'var(--white)', padding: '10px 20px', borderRadius: '30px' }}>
                                <span style={{ fontSize: '20px' }}>★</span>
                                <strong style={{ fontSize: '18px' }}>{gemiddeldeScore.toFixed(1)}</strong>
                                <span style={{ fontSize: '14px', opacity: 0.9 }}>/ 5 ({reviews.length})</span>
                            </div>
                        )}
                    </div>

                    {reviews.length === 0 && (
                        <div className="empty-state" style={{ marginTop: '25px' }}>
                            <h3>Nog geen beoordelingen</h3>
                            <p>Er zijn nog geen beoordelingen voor dit boek. Wees de eerste om je mening te delen!</p>
                        </div>
                    )}

                    <div className="reviews-list" style={{ display: 'grid', gap: '20px', marginTop: '30px' }}>
                        {reviews.map((review) => {
                            const aantalSterren = Math.max(0, Math.min(5, Number(review.score) || 0));

                            return (
                                <article className="review-card" key={review.id} style={{ background: 'var(--white)', padding: '25px', borderRadius: 'var(--radius-small)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-soft)' }}>
                                    <div className="review-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--brown-dark)' }}>
                                            {review.gebruiker?.naam || 'Lezer'}
                                        </h3>
                                        <span aria-label={`${aantalSterren} op 5 sterren`} style={{ color: '#dcb344', letterSpacing: '2px' }}>
                                            {'★'.repeat(aantalSterren)}
                                            <span style={{ color: '#dfd5c5' }}>{'☆'.repeat(5 - aantalSterren)}</span>
                                        </span>
                                    </div>

                                    <p style={{ margin: 0, fontStyle: 'italic', lineHeight: '1.6', color: 'var(--brown)' }}>
                                        "{review.tekst}"
                                    </p>

                                    {review.antwoord && (
                                        <div className="review-answer" style={{ marginTop: '20px', padding: '15px', background: '#fdfcfa', borderLeft: '3px solid var(--champagne)', borderRadius: '0 var(--radius-small) var(--radius-small) 0' }}>
                                            <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--brown-light)', marginBottom: '5px' }}>
                                                Reactie van BoekHaven
                                            </strong>
                                            <p style={{ margin: 0, fontSize: '14px' }}>{review.antwoord}</p>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                </section>

                {gebruiker?.rol === 'USER' && (
                    <section className="review-form-section slide-in" style={{ animationDelay: '0.4s', marginTop: '40px', background: 'var(--cream)', padding: '40px', borderRadius: 'var(--radius-medium)' }}>
                        <p className="eyebrow">DEEL JE ERVARING</p>
                        <h2 style={{ marginBottom: '25px' }}>Schrijf een beoordeling</h2>

                        <form onSubmit={verstuurReview} className="form-stack">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label htmlFor="score">Jouw beoordeling</label>
                                <select id="score" value={score} onChange={(event) => setScore(Number(event.target.value))} style={{ padding: '12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-small)', background: 'var(--white)' }}>
                                    <option value={5}>5 sterren - Uitstekend</option>
                                    <option value={4}>4 sterren - Zeer goed</option>
                                    <option value={3}>3 sterren - Goed</option>
                                    <option value={2}>2 sterren - Matig</option>
                                    <option value={1}>1 ster - Slecht</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}>
                                <label htmlFor="tekst">Jouw mening</label>
                                <textarea
                                    id="tekst"
                                    value={tekst}
                                    onChange={(event) => setTekst(event.target.value)}
                                    placeholder="Wat vond je van dit boek? Deel je gedachten..."
                                    rows={5}
                                    maxLength={2000}
                                    style={{ padding: '15px', border: '1px solid var(--line)', borderRadius: 'var(--radius-small)', background: 'var(--white)', resize: 'vertical' }}
                                    required
                                />
                            </div>

                            {reviewFout && <div className="alert alert-error" role="alert" style={{ marginTop: '15px' }}>{reviewFout}</div>}
                            {reviewSucces && <div className="alert alert-success" role="status" style={{ marginTop: '15px' }}>{reviewSucces}</div>}

                            <button className="button" type="submit" disabled={reviewLaden} style={{ marginTop: '20px' }}>
                                {reviewLaden ? 'Beoordeling versturen...' : 'Beoordeling plaatsen'}
                            </button>
                        </form>
                    </section>
                )}
            </main>
        </PageLayout>
    );
}