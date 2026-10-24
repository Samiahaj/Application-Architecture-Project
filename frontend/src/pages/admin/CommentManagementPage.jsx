/**
 * Beheerderscomponent voor commentaar- en beoordelingsbeheer.
 * Biedt een overzicht van klantrecensies per boek, inclusief sterrenbeoordelingen,
 * gebruikersgegevens en de functionaliteit om als beheerder professionele antwoorden toe te voegen of bij te werken.
 */
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
                bestaandeAntwoorden[commentaar.id] = commentaar.antwoord || '';
            });
            setAntwoorden(bestaandeAntwoorden);
        } catch (error) {
            setFout(error.message || 'De beoordelingen konden niet worden geladen.');
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
                    item.id === commentaar.id ? { ...item, ...bijgewerktCommentaar } : item
                )
            );

            setBericht('Het antwoord is opgeslagen.');
        } catch (error) {
            setFout(error.message || 'Het antwoord kon niet worden opgeslagen.');
        } finally {
            setBezigMetId(null);
        }
    }

    return (
        <PageLayout>
            <main className="dashboard-page">
                <section className="dashboard-heading">
                    <div>
                        <p className="eyebrow">BOEKHAVEN · BEHEER</p>
                        <h1>Commentaarbeheer</h1>
                        <p className="section-description">
                            Bekijk beoordelingen en beantwoord reacties van klanten.
                        </p>
                    </div>

                    <button
                        className="button button-outline"
                        type="button"
                        onClick={laadCommentaren}
                        disabled={laden || bezigMetId !== null}
                    >
                        ↻ Vernieuwen
                    </button>
                </section>

                <div style={{ marginBottom: '35px' }}>
                    <Link className="text-link" to="/admin">
                        ← Terug naar het dashboard
                    </Link>
                </div>

                {bericht && (
                    <div className="alert alert-success slide-in" role="status">
                        {bericht}
                    </div>
                )}

                {fout && (
                    <div className="alert alert-error slide-in" role="alert">
                        {fout}
                    </div>
                )}

                {laden ? (
                    <p className="status-message fade-in" role="status">
                        De beoordelingen worden geladen...
                    </p>
                ) : commentaren.length === 0 ? (
                    <div className="empty-state fade-in">
                        <h3>Geen beoordelingen gevonden</h3>
                        <p>Er zijn momenteel geen beoordelingen beschikbaar.</p>
                    </div>
                ) : (
                    <section className="review-admin-grid fade-in">
                        {commentaren.map((commentaar) => {
                            const score = Math.max(0, Math.min(5, Number(commentaar.score) || 0));

                            return (
                                <article className="review-admin-card" key={commentaar.id}>
                                    <div className="review-admin-header">
                                        <div className="review-admin-user">
                                            <div className="user-avatar">
                                                {(commentaar.gebruiker?.naam || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3>{commentaar.gebruiker?.naam || 'Onbekende klant'}</h3>
                                                <span className="user-email">{commentaar.gebruiker?.email || 'Geen e-mail'}</span>
                                            </div>
                                        </div>
                                        <div className="review-admin-stars">
                                            <span className="stars-filled">{'★'.repeat(score)}</span>
                                            <span className="stars-empty">{'☆'.repeat(5 - score)}</span>
                                        </div>
                                    </div>

                                    <div className="review-admin-body">
                                        <p className="review-book-title">
                                            Betreft: <em>{commentaar.boek?.titel || 'Onbekend boek'}</em>
                                        </p>
                                        <blockquote className="review-text">
                                            "{commentaar.tekst}"
                                        </blockquote>
                                    </div>

                                    <div className="review-admin-reply">
                                        <label className="reply-label" htmlFor={`reply-${commentaar.id}`}>
                                            Jouw antwoord (Beheerder)
                                        </label>
                                        <textarea
                                            id={`reply-${commentaar.id}`}
                                            className="reply-textarea"
                                            value={antwoorden[commentaar.id] || ''}
                                            onChange={(event) =>
                                                setAntwoorden((huidige) => ({
                                                    ...huidige,
                                                    [commentaar.id]: event.target.value,
                                                }))
                                            }
                                            maxLength={1000}
                                            rows={3}
                                            placeholder="Schrijf een professioneel antwoord..."
                                        />
                                        <div className="reply-actions">
                                            <span className="char-count">
                                                {(antwoorden[commentaar.id] || '').length}/1000 tekens
                                            </span>
                                            <button
                                                className="button button-small"
                                                type="button"
                                                disabled={bezigMetId !== null || !(antwoorden[commentaar.id] || '').trim()}
                                                onClick={() => verstuurAntwoord(commentaar)}
                                            >
                                                {bezigMetId === commentaar.id
                                                    ? 'Bezig...'
                                                    : commentaar.antwoord
                                                        ? 'Antwoord bijwerken'
                                                        : 'Antwoord versturen'}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}
            </main>
        </PageLayout>
    );
}