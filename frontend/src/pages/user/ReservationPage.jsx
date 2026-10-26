/**
 * Component voor het overzicht van de reserveringen van de ingelogde gebruiker.
 * Toont alle reserveringen inclusief status, boekdetails en directe links om de betreffende boeken te bekijken.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PageLayout from '../../components/PageLayout.jsx';



const statussen = {
    PENDING: 'In afwachting',
    READY: 'Klaar om af te halen',
    COLLECTED: 'Opgehaald',
    CANCELLED: 'Geannuleerd'
};

function getStatusClass(status) {
    switch (status) {
        case 'READY': return 'status-pill status-ready';
        case 'COLLECTED': return 'status-pill status-collected';
        case 'CANCELLED': return 'status-pill status-cancelled';
        default: return 'status-pill';
    }
}

export default function ReservationPage() {
    const { gebruiker } = useAuth();

    const [reserveringen, setReserveringen] = useState([]);
    const [laden, setLaden] = useState(true);
    const [fout, setFout] = useState('');

    useEffect(() => {
        if (!gebruiker?.id) {
            setLaden(false);
            return;
        }

        let actief = true;

        async function laadReserveringen() {
            try {
                const data = await apiFetch(`/api/reservations/user/${gebruiker.id}`);

                if (actief) {
                    setReserveringen(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (actief) {
                    setFout(error.message || 'Je reserveringen konden niet worden geladen.');
                }
            } finally {
                if (actief) {
                    setLaden(false);
                }
            }
        }

        laadReserveringen();

        return () => {
            actief = false;
        };
    }, [gebruiker?.id]);

    return (
        <PageLayout>
            <main className="dashboard-page fade-in">
                <section className="dashboard-heading">
                    <div>
                        <p className="eyebrow">BOEKHAVEN · MIJN ACCOUNT</p>
                        <h1>Mijn reserveringen</h1>
                        <p className="section-description">
                            Bekijk je gereserveerde boeken en volg hun status.
                        </p>
                    </div>
                </section>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', flexWrap: 'wrap', gap: '15px' }}>
                    <Link className="text-link" to="/profiel">
                        ← Terug naar mijn profiel
                    </Link>

                    <Link className="text-link" to="/">
                        Ontdek de collectie →
                    </Link>
                </div>

                {laden && (
                    <p className="status-message fade-in">
                        Je reserveringen worden geladen...
                    </p>
                )}

                {!laden && fout && (
                    <div className="alert alert-error slide-in">
                        {fout}
                    </div>
                )}

                {!laden && !fout && reserveringen.length === 0 && (
                    <div className="empty-state slide-in" style={{ padding: '60px 20px', background: 'var(--white)', borderRadius: 'var(--radius-medium)', border: '1px solid var(--line)' }}>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', marginBottom: '10px' }}>Je hebt nog geen reserveringen</h3>
                        <p style={{ color: 'var(--muted)', marginBottom: '25px' }}>
                            Ontdek onze collectie en reserveer je volgende favoriete boek.
                        </p>
                        <Link className="button" to="/">
                            Bekijk de collectie
                        </Link>
                    </div>
                )}

                {!laden && !fout && reserveringen.length > 0 && (
                    <div className="reservation-list slide-in" style={{ display: 'grid', gap: '20px' }}>
                        {[...reserveringen]
                            .sort((a, b) => new Date(b.reservatieDatum) - new Date(a.reservatieDatum))
                            .map((reservering, index) => {
                            const boek = reservering.boek;
                            const coverIndex = boek?.titel ? (boek.titel.length % 5) + 1 : 1;

                            return (
                                <article
                                    className="panel slide-in"
                                    key={reservering.id}
                                    style={{
                                        animationDelay: `${0.1 * (index % 10)}s`,
                                        animationFillMode: 'both',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '20px',
                                        margin: 0
                                    }}
                                >
                                    {/* Mini-couverture du livre */}
                                    <div style={{ width: '70px', height: '95px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                                        {boek?.imageUrl ? (
                                            <img
                                                src={boek.imageUrl}
                                                alt={boek.titel}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className={`book-cover cover-theme-${coverIndex}`} style={{ height: '100%', padding: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '8px' }}>
                                                <span style={{ opacity: 0.8, textTransform: 'uppercase' }}>BOEKHAVEN</span>
                                                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '10px', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {boek?.titel || 'Boek'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '240px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <p className="eyebrow" style={{ margin: 0 }}>
                                                RESERVERING #{reservering.id}
                                            </p>
                                            <span className={getStatusClass(reservering.status)}>
                                                {statussen[reservering.status] || reservering.status || 'Onbekend'}
                                            </span>
                                        </div>

                                        <h2 style={{ margin: '5px 0', fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--brown-dark)' }}>
                                            {boek?.titel || 'Onbekende titel'}
                                        </h2>

                                        <div style={{ display: 'flex', gap: '25px', fontSize: '13px', color: 'var(--muted)', marginTop: '5px', flexWrap: 'wrap' }}>
                                            <span>
                                                <strong>Datum:</strong>{' '}
                                                {reservering.reservatieDatum
                                                    ? new Date(reservering.reservatieDatum).toLocaleDateString('nl-BE')
                                                    : 'Niet beschikbaar'}
                                            </span>
                                            <span>
                                                <strong>Prijs:</strong>{' '}
                                                {boek?.prijs != null
                                                    ? Number(boek.prijs).toLocaleString('nl-BE', {
                                                        style: 'currency',
                                                        currency: 'EUR',
                                                    })
                                                    : 'Niet beschikbaar'}
                                            </span>
                                        </div>
                                    </div>

                                    {boek?.id && (
                                        <Link
                                            className="button button-outline button-small"
                                            to={`/boeken/${boek.id}`}
                                        >
                                            Bekijk boek →
                                        </Link>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>
        </PageLayout>
    );
}