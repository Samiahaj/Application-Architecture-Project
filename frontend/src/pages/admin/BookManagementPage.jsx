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
    const [auteurs, setAuteurs] = useState([]);
    const [auteurZoekterm, setAuteurZoekterm] = useState('');
    const [nieuweAuteurNaam, setNieuweAuteurNaam] = useState('');
    const [auteurToevoegen, setAuteurToevoegen] = useState(false);
    const [nieuwAuteurFormulierOpen, setNieuwAuteurFormulierOpen] = useState(false);
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
    async function laadAuteurs() {
        try {
            const data = await apiFetch('/api/authors');
            setAuteurs(Array.isArray(data) ? data : []);
        } catch (error) {
            setFout(error.message || 'De auteurs konden niet worden geladen.');
        }
    }
    async function voegAuteurToe() {
        const naam = nieuweAuteurNaam.trim();

        if (!naam) {
            setFout('Vul de naam van de auteur in.');
            return;
        }

        setFout('');
        setBericht('');

        // Controleer of de auteur al bestaat.
        const bestaandeAuteur = auteurs.find(
            (auteur) =>
                auteur.naam.trim().toLocaleLowerCase('nl') ===
                naam.toLocaleLowerCase('nl')
        );

        if (bestaandeAuteur) {
            setFormulier((vorig) => ({
                ...vorig,
                auteurs: vorig.auteurs.includes(bestaandeAuteur.id)
                    ? vorig.auteurs
                    : [...vorig.auteurs, bestaandeAuteur.id]
            }));

            setNieuweAuteurNaam('');
            setNieuwAuteurFormulierOpen(false);
            setBericht('Deze auteur bestaat al en is geselecteerd.');
            return;
        }

        setAuteurToevoegen(true);

        try {
            const nieuweAuteur = await apiFetch('/api/authors', {
                method: 'POST',
                body: JSON.stringify({ naam })
            });

            setAuteurs((vorigeAuteurs) => [
                ...vorigeAuteurs,
                nieuweAuteur
            ]);

            setFormulier((vorig) => ({
                ...vorig,
                auteurs: vorig.auteurs.includes(nieuweAuteur.id)
                    ? vorig.auteurs
                    : [...vorig.auteurs, nieuweAuteur.id]
            }));

            setNieuweAuteurNaam('');
            setNieuwAuteurFormulierOpen(false);
            setAuteurZoekterm('');

            setBericht('De auteur is toegevoegd en geselecteerd.');
        } catch (error) {
            setFout(
                error.message || 'De auteur kon niet worden toegevoegd.'
            );
        } finally {
            setAuteurToevoegen(false);
        }
    }

    async function verwijderAuteur(auteur) {
        const bevestigen = window.confirm(
            `Weet je zeker dat je de auteur "${auteur.naam}" wilt verwijderen? Deze auteur wordt ook verwijderd uit de gekoppelde boeken.`
        );

        if (!bevestigen) {
            return;
        }

        setFout('');
        setBericht('');

        try {
            await apiFetch(`/api/authors/${auteur.id}`, {
                method: 'DELETE'
            });

            // Verwijder de auteur uit de lijst.
            setAuteurs((vorigeAuteurs) =>
                vorigeAuteurs.filter((item) => item.id !== auteur.id)
            );

            // Verwijder de auteur ook uit de selectie van het formulier.
            setFormulier((vorig) => ({
                ...vorig,
                auteurs: vorig.auteurs.filter((id) => id !== auteur.id)
            }));

            setBericht(`De auteur "${auteur.naam}" is verwijderd.`);
        } catch (error) {
            setFout(
                error.message || 'De auteur kon niet worden verwijderd.'
            );
        }
    }
    useEffect(() => {
        laadBoeken();
        laadAuteurs();
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
            auteurs: formulier.auteurs.map((auteurId) => ({
                id: auteurId
            }))
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

                            <label>Auteurs</label>

                            {/* Auteurs déjà sélectionnés */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                    marginBottom: '12px'
                                }}
                            >
                                {formulier.auteurs.map((auteurId) => {
                                    const auteur = auteurs.find(
                                        (item) => item.id === auteurId
                                    );

                                    if (!auteur) {
                                        return null;
                                    }

                                    return (
                                        <span
                                            key={auteur.id}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '6px 10px',
                                                borderRadius: '20px',
                                                background: '#efe4d5'
                                            }}
                                        >
                {auteur.naam}

                                            <button
                                                type="button"
                                                aria-label={`Verwijder ${auteur.naam}`}
                                                onClick={() => {
                                                    setFormulier((vorig) => ({
                                                        ...vorig,
                                                        auteurs: vorig.auteurs.filter(
                                                            (id) => id !== auteur.id
                                                        )
                                                    }));
                                                }}
                                                style={{
                                                    border: 'none',
                                                    background: 'transparent',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                    ×
                </button>
            </span>
                                    );
                                })}
                            </div>

                            {/* Zoeken naar auteurs */}
                            <input
                                type="search"
                                value={auteurZoekterm}
                                onChange={(event) => setAuteurZoekterm(event.target.value)}
                                placeholder="Zoek een auteur..."
                                aria-label="Zoek een auteur"
                            />

                            {/* Zoekresultaten */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                    marginTop: '8px',
                                    marginBottom: '16px'
                                }}
                            >
                                {auteurs
                                    .filter((auteur) => {
                                        const naam = auteur.naam.toLocaleLowerCase('nl');
                                        const zoekterm = auteurZoekterm
                                            .trim()
                                            .toLocaleLowerCase('nl');

                                        return (
                                            !formulier.auteurs.includes(auteur.id) &&
                                            naam.includes(zoekterm)
                                        );
                                    })
                                    .slice(0, 10)
                                    .map((auteur) => (
                                        <div
                                            key={auteur.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormulier((vorig) => ({
                                                        ...vorig,
                                                        auteurs: vorig.auteurs.includes(auteur.id)
                                                            ? vorig.auteurs
                                                            : [...vorig.auteurs, auteur.id]
                                                    }));

                                                    setAuteurZoekterm('');
                                                }}
                                                style={{
                                                    flex: 1,
                                                    textAlign: 'left',
                                                    padding: '10px 12px',
                                                    border: '1px solid #e0d5c7',
                                                    borderRadius: '8px',
                                                    background: '#fffdf8',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                + {auteur.naam}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => verwijderAuteur(auteur)}
                                                aria-label={`Verwijder auteur ${auteur.naam}`}
                                                title="Auteur verwijderen"
                                                style={{
                                                    padding: '10px 12px',
                                                    border: '1px solid #e0d5c7',
                                                    borderRadius: '8px',
                                                    background: '#fffdf8',
                                                    color: '#b42318',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                            </div>

                            {/* Nieuwe auteur toevoegen */}
                            {!nieuwAuteurFormulierOpen ? (
                                <button
                                    className="button"
                                    type="button"
                                    onClick={() => {
                                        setNieuwAuteurFormulierOpen(true);
                                        setFout('');
                                        setBericht('');
                                    }}
                                >
                                    + Nieuwe auteur
                                </button>
                            ) : (
                                <div>
                                    <label htmlFor="nieuweAuteurNaam">
                                        Naam van de nieuwe auteur
                                    </label>

                                    <input
                                        id="nieuweAuteurNaam"
                                        type="text"
                                        value={nieuweAuteurNaam}
                                        onChange={(event) =>
                                            setNieuweAuteurNaam(event.target.value)
                                        }
                                        placeholder="Naam van de auteur"
                                    />

                                    <div
                                        className="profile-actions"
                                        style={{ marginTop: '10px' }}
                                    >
                                        <button
                                            className="button"
                                            type="button"
                                            onClick={voegAuteurToe}
                                            disabled={auteurToevoegen}
                                        >
                                            {auteurToevoegen
                                                ? 'Toevoegen...'
                                                : 'Auteur toevoegen'}
                                        </button>

                                        <button
                                            className="text-button"
                                            type="button"
                                            onClick={() => {
                                                setNieuwAuteurFormulierOpen(false);
                                                setNieuweAuteurNaam('');
                                                setFout('');
                                            }}
                                        >
                                            Annuleren
                                        </button>
                                    </div>
                                </div>
                            )}




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