import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../api/api.js';
import PageLayout from '../../components/PageLayout.jsx';

export default function CommentManagementPage() {
    const [commentaren, setCommentaren] = useState([]);
    const [antwoorden, setAntwoorden] = useState({});
    const [laden, setLaden] = useState(true);
    const [bezigMetId, setBezigMetId] = useState(null);
    const [fout, setFout] = useState('');
    const [bericht, setBericht] = useState('');

    async function laadCommentaren() {
        setLaden(true);
        setFout('');

        try {
            const data = await apiFetch('/api/reviews');

            const lijst = Array.isArray(data) ? data : [];
            setCommentaren(lijst);

            const bestaandeAntwoorden = {};

            lijst.forEach((commentaar) => {
                bestaandeAntwoorden[commentaar.id] =
                    commentaar.antwoord || '';
            });

            setAntwoorden(bestaandeAntwoorden);
        } catch (error) {
            setFout(
                error.message ||
                'De beoordelingen konden niet worden geladen.'
            );
        } finally {
            setLaden(false);
        }
    }

    useEffect(() => {
        laadCommentaren();
    }, []);

    async function verstuurAntwoord(commentaar) {
        const antwoord = antwoorden[commentaar.id]?.trim() || '';

        if (!antwoord) {
            setFout('Vul eerst een antwoord in.');
            return;
        }

        setFout('');
        setBericht('');
        setBezigMetId(commentaar.id);

        try {
            const bijgewerktCommentaar = await apiFetch(
                `/api/reviews/${commentaar.id}/answer`,
                {
                    method: 'PUT',
                    body: JSON.stringify({ antwoord }),
                }
            );

            setCommentaren((huidigeCommentaren) =>
                huidigeCommentaren.map((item) =>
                    item.id === commentaar.id
                        ? { ...item, ...bijgewerktCommentaar }
                        : item
                )
            );

            setBericht('Het antwoord is opgeslagen.');
        } catch (error) {
            setFout(
                error.message ||
                'Het antwoord kon niet worden opgeslagen.'
            );
        } finally {
            setBezigMetId(null);
        }
    }

    return (
        <PageLayout>
            <main className="dashboard-page">
                <section className="section-heading">
                    <div>
                        <p className="eyebrow">BOEKHAVEN · BEHEER</p>
                        <h1>Commentaarbeheer</h1>
                        <p className="section-description">
                            Bekijk beoordelingen en beantwoord reacties van klanten.
                        </p>
                    </div>
                </section>

                <div className="profile-actions">
                    <Link className="text-link" to="/admin">
                        ← Terug naar het dashboard
                    </Link>
                </div>

                {bericht && (
                    <p className="status-message" role="status">
                        {bericht}
                    </p>
                )}

                {fout && (
                    <div className="alert alert-error" role="alert">
                        {fout}
                    </div>
                )}

                <section className="profile-action-card">
                    <div>
                        <p className="eyebrow">BEOORDELINGEN</p>
                        <h2>Alle beoordelingen ({commentaren.length})</h2>
                        <p>
                            Lees de beoordelingen en geef indien nodig een antwoord.
                        </p>
                    </div>

                    <button
                        className="button"
                        type="button"
                        onClick={laadCommentaren}
                        disabled={laden || bezigMetId !== null}
                    >
                        Vernieuwen
                    </button>
                </section>

                {laden ? (
                    <p className="status-message" role="status">
                        De beoordelingen worden geladen...
                    </p>
                ) : commentaren.length === 0 ? (
                    <div className="empty-state">
                        <h3>Geen beoordelingen gevonden</h3>
                        <p>Er zijn momenteel geen beoordelingen beschikbaar.</p>
                    </div>
                ) : (
                    <section className="user-management-section">
                        {commentaren.map((commentaar) => (
                            <article
                                className="profile-action-card"
                                key={commentaar.id}
                            >
                                <div>
                                    <p className="eyebrow">
                                        BEOORDELING #{commentaar.id}
                                    </p>

                                    <h2>
                                        {commentaar.boek?.titel ||
                                            'Onbekend boek'}
                                    </h2>

                                    <p>
                                        <strong>Klant:</strong>{' '}
                                        {commentaar.gebruiker?.naam ||
                                            'Onbekende klant'}
                                    </p>

                                    <p>
                                        <strong>E-mailadres:</strong>{' '}
                                        {commentaar.gebruiker?.email ||
                                            'Niet beschikbaar'}
                                    </p>

                                    <p>
                                        <strong>Score:</strong>{' '}
                                        {'★'.repeat(commentaar.score || 0)}
                                        {'☆'.repeat(
                                            Math.max(0, 5 - (commentaar.score || 0))
                                        )}
                                    </p>

                                    <p>
                                        <strong>Beoordeling:</strong>
                                    </p>

                                    <p>{commentaar.tekst}</p>

                                    <label>
                                        <strong>Antwoord van de beheerder</strong>
                                        <textarea
                                            value={antwoorden[commentaar.id] || ''}
                                            onChange={(event) =>
                                                setAntwoorden((huidigeAntwoorden) => ({
                                                    ...huidigeAntwoorden,
                                                    [commentaar.id]:
                                                    event.target.value,
                                                }))
                                            }
                                            maxLength={1000}
                                            rows={4}
                                            placeholder="Schrijf een antwoord..."
                                        />
                                    </label>

                                    <p>
                                        <small>
                                            {(antwoorden[commentaar.id] || '').length}
                                            /1000 tekens
                                        </small>
                                    </p>

                                    <button
                                        className="button"
                                        type="button"
                                        disabled={
                                            bezigMetId !== null ||
                                            !(antwoorden[commentaar.id] || '').trim()
                                        }
                                        onClick={() =>
                                            verstuurAntwoord(commentaar)
                                        }
                                    >
                                        {bezigMetId === commentaar.id
                                            ? 'Bezig...'
                                            : commentaar.antwoord
                                                ? 'Antwoord bijwerken'
                                                : 'Antwoord versturen'}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </PageLayout>
    );
}