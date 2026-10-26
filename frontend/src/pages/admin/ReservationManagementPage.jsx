/**
 * Beheerderscomponent voor reserveringsbeheer.
 * Biedt een overzicht van alle reserveringen in de applicatie, inclusief filtermogelijkheden,
 * klant- en boekgegevens, en de functionaliteit om reserveringsstatussen live bij te werken.
 */
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
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [bezigMetWijzigen, setBezigMetWijzigen] = useState(null);

    async function laadReserveringen() {
        setLaden(true);
        setFout('');

        try {
            const data = await apiFetch('/api/reservations');
            setReserveringen(Array.isArray(data) ? data : []);
        } catch (error) {
            setFout(error.message || 'De reserveringen konden niet worden geladen.');
        } finally {
            setLaden(false);
        }
    }

    useEffect(() => {
        laadReserveringen();
    }, []);

    const gefilterdeReserveringen = [...reserveringen]
        .sort((a, b) => {
            const datumA = a.reservatieDatum ? new Date(a.reservatieDatum).getTime() : 0;
            const datumB = b.reservatieDatum ? new Date(b.reservatieDatum).getTime() : 0;
            return datumB - datumA;
        })
        .filter((reservering) => {
            const term = zoekterm.trim().toLocaleLowerCase('nl');

    const boekTitel = reservering.boek?.titel || '';
    const gebruikerNaam = reservering.gebruiker?.naam || '';
    const gebruikerEmail = reservering.gebruiker?.email || '';
    const reserveringId = String(reservering.id || '');

    const komtOvereenMetZoekterm =
        `${boekTitel} ${gebruikerNaam} ${gebruikerEmail} ${reserveringId}`
            .toLocaleLowerCase('nl')
            .includes(term);

    const komtOvereenMetStatus =
        statusFilter === 'ALL' || reservering.status === statusFilter;

    return komtOvereenMetZoekterm && komtOvereenMetStatus;
});





            async function wijzigStatus(reserveringId, nieuweStatus) {
        setFout('');
        setBericht('');
        setBezigMetWijzigen(reserveringId);

        try {
            const parameters = new URLSearchParams({ status: nieuweStatus });
            await apiFetch(`/api/reservations/${reserveringId}/status?${parameters.toString()}`, {
                method: 'PUT'
            });

            setBericht('De reserveringsstatus is succesvol bijgewerkt.');
            await laadReserveringen();
        } catch (error) {
            setFout(error.message || 'De reserveringsstatus kon niet worden gewijzigd.');
        } finally {
            setBezigMetWijzigen(null);
        }
    }

    // Functie om de juiste CSS-klasse te kiezen op basis van de status
    function getStatusClass(status) {
        switch (status) {
            case 'READY': return 'status-pill status-ready';
            case 'COLLECTED': return 'status-pill status-collected';
            case 'CANCELLED': return 'status-pill status-cancelled';
            default: return 'status-pill'; // PENDING of onbekend
        }
    }

    return (
        <PageLayout>
            <main className="dashboard-page">
                <section className="dashboard-heading">
                    <div>
                        <p className="eyebrow">BOEKHAVEN · BEHEER</p>
                        <h1>Reserveringsbeheer</h1>
                        <p className="section-description">
                            Bekijk reserveringen en beheer hun status.
                        </p>
                    </div>

                    <button
                        className="button button-outline"
                        type="button"
                        onClick={laadReserveringen}
                        disabled={laden || bezigMetWijzigen !== null}
                    >
                        ↻ Vernieuwen
                    </button>
                </section>

                <div style={{ marginBottom: '25px' }}>
                    <Link className="text-link" to="/admin">
                        ← Terug naar het dashboard
                    </Link>
                </div>

                {bericht && <div className="alert alert-success slide-in">{bericht}</div>}
                {fout && <div className="alert alert-error slide-in">{fout}</div>}

                <section
                    className="search-section fade-in"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        flexWrap: 'wrap'
                    }}
                >
                    <label className="search-box" style={{ flex: '1', minWidth: '250px' }}>
                        <span aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            value={zoekterm}
                            onChange={(event) => setZoekterm(event.target.value)}
                            placeholder="Zoek op reserveringsnummer, boek of klant..."
                            aria-label="Zoek reserveringen"
                        />
                    </label>


                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
        Filter op status:
    </span>

                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            aria-label="Filter reserveringen op status"
                            style={{
                                width: '180px',height:'35px', padding: '5px 6px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--white)', color: 'var(--brown-dark)', fontSize: '12px', cursor: 'pointer'
                            }}
                        >
                            <option value="ALL">Alle statussen</option>
                            <option value="PENDING">In afwachting</option>
                            <option value="READY">Klaar om afgehaald te worden</option>
                            <option value="COLLECTED">Afgehaald</option>
                            <option value="CANCELLED">Geannuleerd</option>
                        </select>
                    </label>


                </section>


                {laden && (
                    <p className="status-message fade-in">
                        De reserveringen worden geladen...
                    </p>
                )}

                {!laden && !fout && gefilterdeReserveringen.length === 0 && (
                    <div className="empty-state fade-in">
                        <h3>Geen reserveringen gevonden</h3>
                        <p>Er zijn geen reserveringen beschikbaar voor deze zoekopdracht.</p>
                    </div>
                )}

                {!laden && gefilterdeReserveringen.length > 0 && (
                    <div className="table-container fade-in">
                        <table className="management-table">
                            <thead>
                            <tr>
                                <th>Nummer</th>
                                <th>Klant</th>
                                <th>Boek</th>
                                <th>Datum</th>
                                <th>Huidige Status</th>
                                <th>Actie / Status wijzigen</th>
                            </tr>
                            </thead>
                            <tbody>
                            {gefilterdeReserveringen.map((reservering) => (
                                <tr key={reservering.id}>
                                    <td><span style={{ color: 'var(--muted)', fontWeight: 600 }}>#{reservering.id}</span></td>

                                    <td>
                                        <strong style={{ color: 'var(--brown-dark)' }}>
                                            {reservering.gebruiker?.naam || 'Onbekende klant'}
                                        </strong>
                                        <br />
                                        <small>{reservering.gebruiker?.email || ''}</small>
                                    </td>

                                    <td style={{ fontWeight: 500 }}>
                                        {reservering.boek?.titel || 'Onbekend boek'}
                                    </td>

                                    <td>
                                        {reservering.reservatieDatum
                                            ? new Date(reservering.reservatieDatum).toLocaleDateString('nl-BE')
                                            : 'Niet beschikbaar'}
                                    </td>

                                    <td>
                                            <span className={getStatusClass(reservering.status)}>
                                                {statussen[reservering.status] || reservering.status || 'Onbekend'}
                                            </span>
                                    </td>

                                    <td>
                                        <select
                                            aria-label={`Status van reservering ${reservering.id}`}
                                            value={reservering.status}
                                            disabled={bezigMetWijzigen === reservering.id}
                                            onChange={(event) => wijzigStatus(reservering.id, event.target.value)}
                                            style={{ minWidth: '200px', cursor: 'pointer' }}
                                        >
                                            {mogelijkeStatussen.map((status) => (
                                                <option key={status} value={status}>
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