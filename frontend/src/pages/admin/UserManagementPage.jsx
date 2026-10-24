import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/PageLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiFetch } from '../../api/api.js';

export default function UserManagementPage() {
    const { gebruiker } = useAuth();

    const [gebruikers, setGebruikers] = useState([]);
    const [zoekterm, setZoekterm] = useState('');
    const [laden, setLaden] = useState(true);
    const [fout, setFout] = useState('');
    const [bericht, setBericht] = useState('');
    const [bezigMetId, setBezigMetId] = useState(null);

    const laadGebruikers = useCallback(async () => {
        setLaden(true);
        setFout('');

        try {
            const data = await apiFetch('/api/users');
            setGebruikers(Array.isArray(data) ? data : []);
        } catch (error) {
            setFout(error.message || 'De gebruikers konden niet worden geladen.');
        } finally {
            setLaden(false);
        }
    }, []);

    useEffect(() => {
        laadGebruikers();
    }, [laadGebruikers]);

    const gefilterdeGebruikers = useMemo(() => {
        const term = zoekterm.trim().toLocaleLowerCase('nl');

        if (!term) {
            return gebruikers;
        }

        return gebruikers.filter((item) =>
            `${item.naam || ''} ${item.email || ''} ${item.rol || ''}`
                .toLocaleLowerCase('nl')
                .includes(term)
        );
    }, [gebruikers, zoekterm]);

    async function wijzigRol(item) {
        const nieuweRol = item.rol === 'ADMIN' ? 'USER' : 'ADMIN';

        const bevestiging = window.confirm(
            `Wil je de rol van ${item.naam} wijzigen naar ${nieuweRol === 'ADMIN' ? 'Beheerder' : 'Klant'}?`
        );

        if (!bevestiging) {
            return;
        }

        setBezigMetId(item.id);
        setFout('');
        setBericht('');

        try {
            await apiFetch(`/api/users/${item.id}/role`, {
                method: 'PUT',
                body: JSON.stringify({ rol: nieuweRol }),
            });

            setBericht(`De rol van ${item.naam} is succesvol gewijzigd.`);
            await laadGebruikers();
        } catch (error) {
            setFout(error.message || 'De rol kon niet worden gewijzigd.');
        } finally {
            setBezigMetId(null);
        }
    }

    async function verwijderGebruiker(item) {
        if (String(item.id) === String(gebruiker?.id)) {
            setFout('Je kunt je eigen account niet verwijderen.');
            return;
        }

        const bevestiging = window.confirm(
            `Weet je zeker dat je het account van ${item.naam} wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`
        );

        if (!bevestiging) {
            return;
        }

        setBezigMetId(item.id);
        setFout('');
        setBericht('');

        try {
            await apiFetch(`/api/users/${item.id}`, {
                method: 'DELETE',
            });

            setGebruikers((huidigeGebruikers) =>
                huidigeGebruikers.filter(
                    (gebruikerItem) => gebruikerItem.id !== item.id
                )
            );

            setBericht(`Het account van ${item.naam} is verwijderd.`);
        } catch (error) {
            setFout(error.message || 'Het account kon niet worden verwijderd.');
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
                        <h1>Gebruikersbeheer</h1>
                        <p className="section-description">
                            Bekijk gebruikers, wijzig rollen en beheer accounts.
                        </p>
                    </div>

                    <button
                        className="button button-outline"
                        type="button"
                        onClick={laadGebruikers}
                        disabled={laden || bezigMetId !== null}
                    >
                        ↻ Vernieuwen
                    </button>
                </section>

                <div style={{ marginBottom: '25px' }}>
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

                <section className="search-section fade-in">
                    <label className="search-box">
                        <span aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            value={zoekterm}
                            onChange={(event) => setZoekterm(event.target.value)}
                            placeholder="Zoek op naam, e-mailadres of rol..."
                            aria-label="Zoek gebruikers"
                        />
                    </label>
                </section>

                {laden ? (
                    <p className="status-message fade-in" role="status">
                        De gebruikers worden geladen...
                    </p>
                ) : gefilterdeGebruikers.length === 0 ? (
                    <div className="empty-state fade-in">
                        <h3>Geen gebruikers gevonden</h3>
                        <p>
                            {zoekterm
                                ? 'Probeer een andere zoekterm.'
                                : 'Er zijn momenteel geen gebruikers geregistreerd.'}
                        </p>
                    </div>
                ) : (
                    <div className="table-container fade-in">
                        <table className="management-table">
                            <thead>
                            <tr>
                                <th>Naam</th>
                                <th>E-mailadres</th>
                                <th>Rol</th>
                                <th>Acties</th>
                            </tr>
                            </thead>

                            <tbody>
                            {gefilterdeGebruikers.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <strong style={{ color: 'var(--brown-dark)' }}>
                                            {item.naam}
                                        </strong>
                                    </td>
                                    <td>{item.email}</td>
                                    <td>
                                            <span
                                                className={`status-pill ${item.rol === 'ADMIN' ? 'status-collected' : 'status-ready'}`}
                                            >
                                                {item.rol === 'ADMIN' ? 'Beheerder' : 'Klant'}
                                            </span>
                                    </td>
                                    <td>
                                        {String(item.id) === String(gebruiker?.id) ? (
                                            <span style={{ fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic' }}>
                                                    Jouw account
                                                </span>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                <button
                                                    className="button button-outline button-small"
                                                    type="button"
                                                    disabled={bezigMetId !== null}
                                                    onClick={() => wijzigRol(item)}
                                                >
                                                    {bezigMetId === item.id
                                                        ? 'Bezig...'
                                                        : item.rol === 'ADMIN'
                                                            ? 'Maak klant'
                                                            : 'Maak beheerder'}
                                                </button>

                                                <button
                                                    className="text-button text-danger"
                                                    type="button"
                                                    disabled={bezigMetId !== null}
                                                    onClick={() => verwijderGebruiker(item)}
                                                >
                                                    Verwijderen
                                                </button>
                                            </div>
                                        )}
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