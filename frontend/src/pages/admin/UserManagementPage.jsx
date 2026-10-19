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
            setFout(
                error.message ||
                'De gebruikers konden niet worden geladen.'
            );
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
            `Wil je de rol van ${item.naam} wijzigen naar ${nieuweRol}?`
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

            setBericht(`De rol van ${item.naam} is gewijzigd.`);
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
            `Weet je zeker dat je het account van ${item.naam} wilt verwijderen?`
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
            setFout(
                error.message ||
                'Het account kon niet worden verwijderd.'
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
                        <h1>Gebruikersbeheer</h1>
                        <p className="section-description">
                            Bekijk gebruikers, wijzig rollen en beheer accounts.
                        </p>
                    </div>
                </section>

                <div className="profile-actions">
                    <Link className="text-link" to="/admin">
                        ← Terug naar het dashboard
                    </Link>
                </div>

                <section className="profile-action-card">
                    <div>
                        <p className="eyebrow">GEBRUIKERS</p>
                        <h2>Alle gebruikers ({gebruikers.length})</h2>
                        <p>Zoek op naam, e-mailadres of rol.</p>
                    </div>

                    <label className="search-box">
                        <span aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            value={zoekterm}
                            onChange={(event) => setZoekterm(event.target.value)}
                            placeholder="Zoek een gebruiker..."
                            aria-label="Zoek gebruikers"
                        />
                    </label>
                </section>

                {fout && (
                    <div className="alert alert-error" role="alert">
                        {fout}
                    </div>
                )}

                {bericht && (
                    <p className="status-message" role="status">
                        {bericht}
                    </p>
                )}

                {laden ? (
                    <p className="status-message" role="status">
                        De gebruikers worden geladen...
                    </p>
                ) : gefilterdeGebruikers.length === 0 ? (
                    <div className="empty-state">
                        <h3>
                            {zoekterm
                                ? 'Geen gebruikers gevonden'
                                : 'Geen gebruikers beschikbaar'}
                        </h3>
                        <p>
                            {zoekterm
                                ? 'Probeer een andere zoekterm.'
                                : 'Er zijn geen gebruikers gevonden.'}
                        </p>
                    </div>
                ) : (
                    <section className="user-management-section">
                        <div className="table-container">
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
                                        <td>{item.naam}</td>
                                        <td>{item.email}</td>
                                        <td>
                                            {item.rol === 'ADMIN'
                                                ? 'Beheerder'
                                                : 'Klant'}
                                        </td>
                                        <td>
                                            <div className="profile-actions">
                                                <button
                                                    className="button"
                                                    type="button"
                                                    disabled={
                                                        bezigMetId !== null ||
                                                        String(item.id) === String(gebruiker?.id)
                                                    }
                                                    onClick={() => wijzigRol(item)}
                                                >
                                                    {bezigMetId === item.id
                                                        ? 'Bezig...'
                                                        : item.rol === 'ADMIN'
                                                            ? 'Maak klant'
                                                            : 'Maak beheerder'}
                                                </button>

                                                <button
                                                    className="button"
                                                    type="button"
                                                    disabled={
                                                        bezigMetId !== null ||
                                                        String(item.id) === String(gebruiker?.id)
                                                    }
                                                    onClick={() => verwijderGebruiker(item)}
                                                >
                                                    Verwijderen
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                <div className="profile-actions">
                    <button
                        className="button"
                        type="button"
                        onClick={laadGebruikers}
                        disabled={laden || bezigMetId !== null}
                    >
                        Vernieuwen
                    </button>
                </div>
            </main>
        </PageLayout>
    );
}