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
                    const gegevens = await apiFetch(
                        `/api/reviews/book/${id}`
                    );

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
                    setFout(
                        error.message ||
                        'De boekgegevens konden niet worden geladen.'
                    );
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
            setReserveringFout(
                'Je moet ingelogd zijn als gebruiker om een boek te reserveren.'
            );
            return;
        }

        if (boek?.voorraad != null && Number(boek.voorraad) <= 0) {
            setReserveringFout(
                'Dit boek is momenteel niet beschikbaar.'
            );
            return;
        }

        setReserveren(true);

        try {
            const parameters = new URLSearchParams({
                bookId: String(id)
            });

            await apiFetch(
                `/api/reservations?${parameters.toString()}`,
                {
                    method: 'POST'
                }
            );

            setReserveringSucces(
                'Je boek is succesvol gereserveerd!'
            );
        } catch (error) {
            setReserveringFout(
                error.message ||
                'Het boek kon niet worden gereserveerd. Probeer het opnieuw.'
            );
        } finally {
            setReserveren(false);
        }
    }

    async function verstuurReview(event) {
        event.preventDefault();

        setReviewFout('');
        setReviewSucces('');

        if (!gebruiker || gebruiker.rol !== 'USER') {
            setReviewFout(
                'Je moet ingelogd zijn om een beoordeling te plaatsen.'
            );
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

            await apiFetch(
                `/api/reviews?${parameters.toString()}`,
                {
                    method: 'POST'
                }
            );

            setReviewSucces(
                'Je beoordeling is succesvol geplaatst.'
            );

            setTekst('');

            const nieuweReviews = await apiFetch(
                `/api/reviews/book/${id}`
            );

            setReviews(
                Array.isArray(nieuweReviews) ? nieuweReviews : []
            );
        } catch (error) {
            setReviewFout(
                error.message ||
                'Je beoordeling kon niet worden geplaatst. Controleer of je aan de voorwaarden voldoet.'
            );
        } finally {
            setReviewLaden(false);
        }
    }

    if (laden) {
        return (
            <PageLayout>
                <main className="dashboard-page">
                    <p className="status-message">
                        De boekgegevens worden geladen...
                    </p>
                </main>
            </PageLayout>
        );
    }

    if (fout || !boek) {
        return (
            <PageLayout>
                <main className="dashboard-page">
                    <div className="alert alert-error">
                        {fout || 'Dit boek werd niet gevonden.'}
                    </div>

                    <Link className="button" to="/">
                        Terug naar de collectie
                    </Link>
                </main>
            </PageLayout>
        );
    }

    const gemiddeldeScore = reviews.length > 0
        ? reviews.reduce(
        (totaal, review) =>
            totaal + (Number(review.score) || 0),
        0
    ) / reviews.length
        : null;

    const voorraadBekend = boek.voorraad !== null
        && boek.voorraad !== undefined;

    const geenVoorraad = voorraadBekend
        && Number(boek.voorraad) <= 0;

    return (
        <PageLayout>
            <main className="dashboard-page book-detail-page">
                <Link className="text-link" to="/">
                    ← Terug naar de collectie
                </Link>

                <section className="book-detail">
                    <div className="book-detail-cover">



                    </div>

                    <div className="book-detail-info">
                        <p className="eyebrow">
                            ONTDEK DIT VERHAAL
                        </p>

                        <h1>{boek.titel}</h1>

                        <p className="book-author">
                            Door {auteursTekst(boek)}
                        </p>

                        <p className="book-description">
                            {boek.omschrijving
                                || 'Er is nog geen beschrijving beschikbaar.'}
                        </p>

                        <div className="book-detail-facts">
                            <p>
                                <strong>ISBN:</strong>{' '}
                                {boek.isbn || 'Niet beschikbaar'}
                            </p>

                            <p>
                                <strong>Prijs:</strong>{' '}
                                {prijsFormatter(boek.prijs)}
                            </p>

                            <p>
                                <strong>Beschikbare voorraad:</strong>{' '}
                                {voorraadBekend
                                    ? boek.voorraad
                                    : 'Niet beschikbaar'}
                            </p>
                        </div>

                        {gebruiker?.rol === 'USER' && (
                            <div className="reservation-actions">
                                <button
                                    className="button"
                                    type="button"
                                    onClick={reserveerBoek}
                                    disabled={reserveren || geenVoorraad}
                                >
                                    {reserveren
                                        ? 'Reservering verwerken...'
                                        : geenVoorraad
                                            ? 'Niet beschikbaar'
                                            : 'Reserveer dit boek'}
                                </button>

                                {reserveringFout && (
                                    <div
                                        className="alert alert-error"
                                        role="alert"
                                    >
                                        {reserveringFout}
                                    </div>
                                )}

                                {reserveringSucces && (
                                    <div
                                        className="reservation-success"
                                        role="status"
                                    >
                                        <p>{reserveringSucces}</p>

                                        <Link
                                            className="button"
                                            to="/mijn-reserveringen"
                                        >
                                            Bekijk mijn reserveringen
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {!gebruiker && (
                            <Link
                                className="button"
                                to="/login"
                                state={{
                                    from: {
                                        pathname: `/boeken/${boek.id}`
                                    }
                                }}
                            >
                                Log in om te reserveren
                            </Link>
                        )}
                    </div>
                </section>

                <section className="reviews-section">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">
                                ERVARINGEN VAN LEZERS
                            </p>

                            <h2>Beoordelingen</h2>
                        </div>

                        {gemiddeldeScore !== null && (
                            <p>
                                ★ {gemiddeldeScore.toFixed(1)} / 5
                                {' '}({reviews.length} beoordelingen)
                            </p>
                        )}
                    </div>

                    {reviews.length === 0 && (
                        <div className="empty-state">
                            <h3>Nog geen beoordelingen</h3>

                            <p>
                                Er zijn nog geen beoordelingen voor dit boek.
                            </p>
                        </div>
                    )}

                    <div className="reviews-list">
                        {reviews.map((review) => {
                            const aantalSterren = Math.max(
                                0,
                                Math.min(
                                    5,
                                    Number(review.score) || 0
                                )
                            );

                            return (
                                <article
                                    className="review-card"
                                    key={review.id}
                                >
                                    <div className="review-card-header">
                                        <h3>
                                            {review.gebruiker?.naam
                                                || 'Lezer'}
                                        </h3>

                                        <span
                                            aria-label={`${aantalSterren} op 5 sterren`}
                                        >
                                            {'★'.repeat(aantalSterren)}
                                            {'☆'.repeat(5 - aantalSterren)}
                                        </span>
                                    </div>

                                    <p>{review.tekst}</p>

                                    {review.antwoord && (
                                        <div className="review-answer">
                                            <strong>Reactie van BoekHaven</strong>
                                            <p>{review.antwoord}</p>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                </section>

                {gebruiker?.rol === 'USER' && (
                    <section className="review-form-section">
                        <p className="eyebrow">
                            DEEL JE ERVARING
                        </p>

                        <h2>Schrijf een beoordeling</h2>

                        <p>
                            Je kunt een beoordeling plaatsen als je aan
                            de voorwaarden voor dit boek voldoet.
                        </p>

                        <form
                            onSubmit={verstuurReview}
                            className="review-form"
                        >
                            <label htmlFor="score">
                                Jouw beoordeling
                            </label>

                            <select
                                id="score"
                                value={score}
                                onChange={(event) =>
                                    setScore(Number(event.target.value))
                                }
                            >
                                <option value={5}>
                                    5 sterren - Uitstekend
                                </option>

                                <option value={4}>
                                    4 sterren - Zeer goed
                                </option>

                                <option value={3}>
                                    3 sterren - Goed
                                </option>

                                <option value={2}>
                                    2 sterren - Matig
                                </option>

                                <option value={1}>
                                    1 ster - Slecht
                                </option>
                            </select>

                            <label htmlFor="tekst">
                                Jouw mening
                            </label>

                            <textarea
                                id="tekst"
                                value={tekst}
                                onChange={(event) =>
                                    setTekst(event.target.value)
                                }
                                placeholder="Wat vond je van dit boek?"
                                rows={5}
                                maxLength={2000}
                                required
                            />

                            {reviewFout && (
                                <div
                                    className="alert alert-error"
                                    role="alert"
                                >
                                    {reviewFout}
                                </div>
                            )}

                            {reviewSucces && (
                                <p
                                    className="status-message"
                                    role="status"
                                >
                                    {reviewSucces}
                                </p>
                            )}

                            <button
                                className="button"
                                type="submit"
                                disabled={reviewLaden}
                            >
                                {reviewLaden
                                    ? 'Beoordeling versturen...'
                                    : 'Beoordeling plaatsen'}
                            </button>
                        </form>
                    </section>
                )}
            </main>
        </PageLayout>
    );
}