import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../api/api.js';
import PageLayout from '../../components/PageLayout.jsx';

const statussen = {
    PENDING: 'In afwachting',
    READY: 'Klaar om afgehaald te worden',
    COLLECTED: 'Afgehaald',
    CANCELLED: 'Geannuleerd'
};

const mogelijkeStatussen = [
    'PENDING',
    'READY',
    'COLLECTED',
    'CANCELLED'
];

export default function ReservationManagementPage() {
    const [reserveringen, setReserveringen] = useState([]);
    const [laden, setLaden] = useState(true);
    const [fout, setFout] = useState('');
    const [bericht, setBericht] = useState('');
    const [zoekterm, setZoekterm] = useState('');
    const [bezigMetWijzigen, setBezigMetWijzigen] = useState(null);

    async function laadReserveringen() {
        setLaden(true);
        setFout('');

        try {
            // Het endpoint voor alle reserveringen moet in de backend bestaan.
            const data = await apiFetch('/api/reservations');

            setReserveringen(Array.isArray(data) ? data : []);
        } catch (error) {
            setFout(
                error.message ||
                'De reserveringen konden niet worden geladen.'
            );
        } finally {
            setLaden(false);
        }
    }

    useEffect(() => {
        laadReserveringen();
    }, []);

    const gefilterdeReserveringen = reserveringen.filter((reservering) => {
        const term = zoekterm.trim().toLocaleLowerCase('nl');

        if (!term) {
            return true;
        }

        const boekTitel = reservering.boek?.titel || '';
        const gebruikerNaam = reservering.gebruiker?.naam || '';
        const gebruikerEmail = reservering.gebruiker?.email || '';
        const reserveringId = String(reservering.id || '');

        return `${boekTitel} ${gebruikerNaam} ${gebruikerEmail} ${reserveringId}`
            .toLocaleLowerCase('nl')
            .includes(term);
    });

    async function wijzigStatus(reserveringId, nieuweStatus) {
        setFout('');
        setBericht('');
        setBezigMetWijzigen(reserveringId);

        try {
            const parameters = new URLSearchParams({
                status: nieuweStatus
            });

            await apiFetch(
                `/api/reservations/${reserveringId}/status?${parameters.toString()}`,
                {
                    method: 'PUT'
                }
            );

            setBericht('De reserveringsstatus is bijgewerkt.');

            await laadReserveringen();
        } catch (error) {
            setFout(
                error.message ||
                'De reserveringsstatus kon niet worden gewijzigd.'
            );
        } finally {
            setBezigMetWijzigen(null);
        }
    }

    return (
        <PageLayout>
            <main className="dashboard-page">
                <section className="section-heading">
                    <div>
                        <p className="eyebrow">BOEKHAVEN · BEHEER</p>
                        <h1>Reserveringsbeheer</h1>
                        <p className="section-description">
                            Bekijk reserveringen en beheer hun status.
                        </p>
                    </div>
                </section>

                <p>
                    <Link className="text-link" to="/admin">
                        ← Terug naar het dashboard
                    </Link>
                </p>

                {bericht && (
                    <div className="status-message">
                        {bericht}
                    </div>
                )}

                {fout && (
                    <div className="alert alert-error">
                        {fout}
                    </div>
                )}

                <section className="profile-action-card">
                    <div>
                        <h2>Alle reserveringen</h2>
                        <p>
                            Zoek op reserveringsnummer, boek of klant.
                        </p>
                    </div>

                    <label className="search-box">
                        <span aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            value={zoekterm}
                            onChange={(event) => setZoekterm(event.target.value)}
                            placeholder="Zoek een reservering..."
                            aria-label="Zoek reserveringen"
                        />
                    </label>
                </section>

                {laden && (
                    <p className="status-message">
                        De reserveringen worden geladen...
                    </p>
                )}

                {!laden && !fout && gefilterdeReserveringen.length === 0 && (
                    <div className="empty-state">
                        <h3>Geen reserveringen gevonden</h3>
                        <p>
                            Er zijn geen reserveringen beschikbaar voor deze zoekopdracht.
                        </p>
                    </div>
                )}

                {!laden && gefilterdeReserveringen.length > 0 && (
                    <div className="table-container">
                        <table className="management-table">
                            <thead>
                            <tr>
                                <th>Nummer</th>
                                <th>Klant</th>
                                <th>Boek</th>
                                <th>Datum</th>
                                <th>Prijs</th>
                                <th>Status</th>
                                <th>Status wijzigen</th>
                            </tr>
                            </thead>

                            <tbody>
                            {gefilterdeReserveringen.map((reservering) => (
                                <tr key={reservering.id}>
                                    <td>#{reservering.id}</td>

                                    <td>
                                        <strong>
                                            {reservering.gebruiker?.naam ||
                                                'Onbekende klant'}
                                        </strong>
                                        <br />
                                        <small>
                                            {reservering.gebruiker?.email || ''}
                                        </small>
                                    </td>

                                    <td>
                                        {reservering.boek?.titel ||
                                            'Onbekend boek'}
                                    </td>

                                    <td>
                                        {reservering.reservatieDatum
                                            ? new Date(
                                                reservering.reservatieDatum
                                            ).toLocaleDateString('nl-BE')
                                            : 'Niet beschikbaar'}
                                    </td>

                                    <td>
                                        {reservering.boek?.prijs != null
                                            ? new Intl.NumberFormat('nl-BE', {
                                                style: 'currency',
                                                currency: 'EUR'
                                            }).format(reservering.boek.prijs)
                                            : 'Niet beschikbaar'}
                                    </td>
                                    <td>
                                        {statussen[reservering.status] ||
                                            reservering.status ||
                                            'Onbekend'}
                                    </td>

                                    <td>
                                        <select
                                            aria-label={`Status van reservering ${reservering.id}`}
                                            value={reservering.status}
                                            disabled={
                                                bezigMetWijzigen === reservering.id
                                            }
                                            onChange={(event) =>
                                                wijzigStatus(
                                                    reservering.id,
                                                    event.target.value
                                                )
                                            }
                                        >
                                            {mogelijkeStatussen.map((status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {statussen[status]}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </PageLayout>
    );
}