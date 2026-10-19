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
                const data = await apiFetch(
                    `/api/reservations/user/${gebruiker.id}`
                );

                if (actief) {
                    setReserveringen(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (actief) {
                    setFout(
                        error.message ||
                        'Je reserveringen konden niet worden geladen.'
                    );
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
            <main className="dashboard-page">
                <section className="section-heading">
                    <div>
                        <p className="eyebrow">BOEKHAVEN · MIJN ACCOUNT</p>
                        <h1>Mijn reserveringen</h1>
                        <p className="section-description">
                            Bekijk je gereserveerde boeken en hun status.
                        </p>
                    </div>
                </section>

                <div className="profile-actions">
                    <Link className="text-link" to="/profiel">
                        ← Terug naar mijn profiel
                    </Link>

                    <Link className="text-link" to="/">
                        Ontdek de collectie →
                    </Link>
                </div>

                {laden && (
                    <p className="status-message">
                        Je reserveringen worden geladen...
                    </p>
                )}

                {!laden && fout && (
                    <div className="alert alert-error">
                        {fout}
                    </div>
                )}

                {!laden && !fout && reserveringen.length === 0 && (
                    <div className="empty-state">
                        <h2>Je hebt nog geen reserveringen</h2>
                        <p>
                            Ontdek onze collectie en reserveer je volgende boek.
                        </p>
                        <Link className="button" to="/">
                            Bekijk de collectie
                        </Link>
                    </div>
                )}

                {!laden && !fout && reserveringen.length > 0 && (
                    <div className="reservation-list">
                        {reserveringen.map((reservering) => (
                            <article
                                className="profile-action-card"
                                key={reservering.id}
                            >
                                <div>
                                    <p className="eyebrow">
                                        RESERVERING #{reservering.id}
                                    </p>

                                    <h2>
                                        {reservering.boek?.titel ||
                                            'Onbekende titel'}
                                    </h2>

                                    <p>
                                        <strong>Reservatiedatum:</strong>{' '}
                                        {reservering.reservatieDatum
                                            ? new Date(
                                                reservering.reservatieDatum
                                            ).toLocaleDateString('nl-BE')
                                            : 'Niet beschikbaar'}
                                    </p>

                                    <p>
                                        <strong>Status:</strong>{' '}
                                        {statussen[reservering.status] ||
                                            reservering.status ||
                                            'Onbekend'}
                                    </p>
                                </div>

                                {reservering.boek?.id && (
                                    <Link
                                        className="button"
                                        to={`/boeken/${reservering.boek.id}`}
                                    >
                                        Bekijk boek →
                                    </Link>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </PageLayout>
    );
}