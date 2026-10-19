import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../api/api.js';
import PageLayout from '../../components/PageLayout.jsx';

const leegBoek = {
    isbn: '',
    titel: '',
    omschrijving: '',
    prijs: '',
    voorraad: '',
    auteurs: []
};

function auteursTekst(boek) {
    if (!Array.isArray(boek.auteurs) || boek.auteurs.length === 0) {
        return 'Onbekende auteur';
    }

    return boek.auteurs
        .map((auteur) => auteur.naam || 'Onbekende auteur')
        .join(', ');
}

export default function BookManagementPage() {
    const [boeken, setBoeken] = useState([]);
    const [zoekterm, setZoekterm] = useState('');
    const [laden, setLaden] = useState(true);
    const [fout, setFout] = useState('');
    const [formulierOpen, setFormulierOpen] = useState(false);
    const [bewerkenId, setBewerkenId] = useState(null);
    const [formulier, setFormulier] = useState(leegBoek);
    const [opslaan, setOpslaan] = useState(false);
    const [bericht, setBericht] = useState('');

    async function laadBoeken() {
        setLaden(true);
        setFout('');

        try {
            const data = await apiFetch('/api/books');
            setBoeken(Array.isArray(data) ? data : []);
        } catch (error) {
            setFout(error.message || 'De boeken konden niet worden geladen.');
        } finally {
            setLaden(false);
        }
    }

    useEffect(() => {
        laadBoeken();
    }, []);

    const gefilterdeBoeken = useMemo(() => {
        const term = zoekterm.trim().toLocaleLowerCase('nl');

        if (!term) {
            return boeken;
        }

        return boeken.filter((boek) =>
            `${boek.titel || ''} ${boek.isbn || ''} ${auteursTekst(boek)}`
                .toLocaleLowerCase('nl')
                .includes(term)
        );
    }, [boeken, zoekterm]);

    function wijzigVeld(event) {
        const { name, value } = event.target;

        setFormulier((vorig) => ({
            ...vorig,
            [name]: value
        }));
    }

    function openNieuwBoek() {
        setBewerkenId(null);
        setFormulier(leegBoek);
        setFormulierOpen(true);
        setBericht('');
        setFout('');
    }

    function openBewerken(boek) {
        setBewerkenId(boek.id);

        setFormulier({
            isbn: boek.isbn || '',
            titel: boek.titel || '',
            omschrijving: boek.omschrijving || '',
            prijs: boek.prijs ?? '',
            voorraad: boek.voorraad ?? '',
            auteurs: Array.isArray(boek.auteurs)
                ? boek.auteurs.map((auteur) => auteur.id)
                : []
        });

        setFormulierOpen(true);
        setBericht('');
        setFout('');
    }

    async function verstuurFormulier(event) {
        event.preventDefault();
        setFout('');
        setBericht('');

        if (!formulier.titel.trim()) {
            setFout('Vul de titel van het boek in.');
            return;
        }

        if (formulier.prijs === '' || Number(formulier.prijs) < 0) {
            setFout('Vul een geldige prijs in.');
            return;
        }

        if (
            formulier.voorraad === '' ||
            !Number.isInteger(Number(formulier.voorraad)) ||
            Number(formulier.voorraad) < 0
        ) {
            setFout('Vul een geldige voorraad in.');
            return;
        }

        const boekData = {
            isbn: formulier.isbn.trim(),
            titel: formulier.titel.trim(),
            omschrijving: formulier.omschrijving.trim(),
            prijs: Number(formulier.prijs),
            voorraad: Number(formulier.voorraad),
            auteurs: formulier.auteurs
        };

        setOpslaan(true);

        try {
            if (bewerkenId !== null) {
                await apiFetch(`/api/books/${bewerkenId}`, {
                    method: 'PUT',
                    body: JSON.stringify(boekData)
                });

                setBericht('Het boek is bijgewerkt.');
            } else {
                await apiFetch('/api/books', {
                    method: 'POST',
                    body: JSON.stringify(boekData)
                });

                setBericht('Het boek is toegevoegd.');
            }

            setFormulierOpen(false);
            setFormulier(leegBoek);
            setBewerkenId(null);

            await laadBoeken();
        } catch (error) {
            setFout(
                error.message ||
                'Het boek kon niet worden opgeslagen.'
            );
        } finally {
            setOpslaan(false);
        }
    }

    async function verwijderBoek(boek) {
        const bevestigen = window.confirm(
            `Weet je zeker dat je "${boek.titel}" wilt verwijderen?`
        );

        if (!bevestigen) {
            return;
        }

        setFout('');
        setBericht('');

        try {
            await apiFetch(`/api/books/${boek.id}`, {
                method: 'DELETE'
            });

            setBericht('Het boek is verwijderd.');
            await laadBoeken();
        } catch (error) {
            setFout(
                error.message ||
                'Het boek kon niet worden verwijderd.'
            );
        }
    }

    return (
        <PageLayout>
            <main className="dashboard-page">
                <section className="section-heading">
                    <div>
                        <p className="eyebrow">BOEKHAVEN · BEHEER</p>
                        <h1>Boekenbeheer</h1>
                        <p className="section-description">
                            Beheer de boeken in de collectie.
                        </p>
                    </div>

                    <button
                        className="button"
                        type="button"
                        onClick={openNieuwBoek}
                    >
                        + Nieuw boek
                    </button>
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

                {formulierOpen && (
                    <section className="profile-action-card">
                        <div>
                            <p className="eyebrow">
                                {bewerkenId !== null
                                    ? 'BOEK AANPASSEN'
                                    : 'NIEUW BOEK'}
                            </p>

                            <h2>
                                {bewerkenId !== null
                                    ? 'Boek bewerken'
                                    : 'Boek toevoegen'}
                            </h2>
                        </div>

                        <form
                            className="review-form"
                            onSubmit={verstuurFormulier}
                        >
                            <label htmlFor="isbn">ISBN</label>
                            <input
                                id="isbn"
                                name="isbn"
                                value={formulier.isbn}
                                onChange={wijzigVeld}
                            />

                            <label htmlFor="titel">Titel *</label>
                            <input
                                id="titel"
                                name="titel"
                                value={formulier.titel}
                                onChange={wijzigVeld}
                                required
                            />

                            <label htmlFor="omschrijving">
                                Beschrijving
                            </label>
                            <textarea
                                id="omschrijving"
                                name="omschrijving"
                                value={formulier.omschrijving}
                                onChange={wijzigVeld}
                                rows={4}
                            />

                            <label htmlFor="prijs">Prijs (€) *</label>
                            <input
                                id="prijs"
                                name="prijs"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formulier.prijs}
                                onChange={wijzigVeld}
                                required
                            />

                            <label htmlFor="voorraad">
                                Voorraad *
                            </label>
                            <input
                                id="voorraad"
                                name="voorraad"
                                type="number"
                                min="0"
                                step="1"
                                value={formulier.voorraad}
                                onChange={wijzigVeld}
                                required
                            />

                            <div className="profile-actions">
                                <button
                                    className="button"
                                    type="submit"
                                    disabled={opslaan}
                                >
                                    {opslaan
                                        ? 'Opslaan...'
                                        : 'Opslaan'}
                                </button>

                                <button
                                    className="text-button"
                                    type="button"
                                    onClick={() => setFormulierOpen(false)}
                                >
                                    Annuleren
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                <section className="profile-action-card">
                    <div>
                        <h2>Collectie</h2>
                        <p>Zoek en beheer bestaande boeken.</p>
                    </div>

                    <label className="search-box">
                        <span aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            value={zoekterm}
                            onChange={(event) => setZoekterm(event.target.value)}
                            placeholder="Zoek op titel, ISBN of auteur..."
                            aria-label="Zoek boeken"
                        />
                    </label>
                </section>

                {laden && (
                    <p className="status-message">
                        De boeken worden geladen...
                    </p>
                )}

                {!laden && !fout && gefilterdeBoeken.length === 0 && (
                    <div className="empty-state">
                        <h3>Geen boeken gevonden</h3>
                        <p>Probeer een andere zoekterm.</p>
                    </div>
                )}

                {!laden && gefilterdeBoeken.length > 0 && (
                    <div className="table-container">
                        <table className="management-table">
                            <thead>
                            <tr>
                                <th>Titel</th>
                                <th>Auteur</th>
                                <th>Prijs</th>
                                <th>Voorraad</th>
                                <th>Acties</th>
                            </tr>
                            </thead>

                            <tbody>
                            {gefilterdeBoeken.map((boek) => (
                                <tr key={boek.id}>
                                    <td>{boek.titel}</td>
                                    <td>{auteursTekst(boek)}</td>
                                    <td>
                                        {Number(boek.prijs).toLocaleString(
                                            'nl-BE',
                                            {
                                                style: 'currency',
                                                currency: 'EUR'
                                            }
                                        )}
                                    </td>
                                    <td>{boek.voorraad ?? 0}</td>
                                    <td>
                                        <div className="profile-actions">
                                            <button
                                                className="text-button"
                                                type="button"
                                                onClick={() => openBewerken(boek)}
                                            >
                                                Bewerken
                                            </button>

                                            <button
                                                className="text-button"
                                                type="button"
                                                onClick={() => verwijderBoek(boek)}
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
                )}
            </main>
        </PageLayout>
    );
}