/**
 * Beheerderscomponent voor het beheren van de boekencollectie.
 * Biedt functionaliteit voor het opzoeken, toevoegen, bewerken en verwijderen van boeken
 * (inclusief beheer van boekomslagen via bestandsuploads en het koppelen van auteurs).
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../api/api.js';
import PageLayout from '../../components/PageLayout.jsx';

const leegBoek = {
    isbn: '',
    titel: '',
    omschrijving: '',
    genres: [],
    prijs: '',
    voorraad: '',
    imageFile: null,
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
    const [nieuwGenre, setNieuwGenre] = useState('');

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

        const bestaandeAuteur = auteurs.find(
            (auteur) => auteur.naam.trim().toLocaleLowerCase('nl') === naam.toLocaleLowerCase('nl')
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

            setAuteurs((vorigeAuteurs) => [...vorigeAuteurs, nieuweAuteur]);
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
            setFout(error.message || 'De auteur kon niet worden toegevoegd.');
        } finally {
            setAuteurToevoegen(false);
        }
    }

    async function verwijderAuteur(auteur) {
        const bevestigen = window.confirm(
            `Weet je zeker dat je de auteur "${auteur.naam}" wilt verwijderen? Deze auteur wordt ook verwijderd uit de gekoppelde boeken.`
        );

        if (!bevestigen) return;

        setFout('');
        setBericht('');

        try {
            await apiFetch(`/api/authors/${auteur.id}`, { method: 'DELETE' });
            setAuteurs((vorigeAuteurs) => vorigeAuteurs.filter((item) => item.id !== auteur.id));
            setFormulier((vorig) => ({
                ...vorig,
                auteurs: vorig.auteurs.filter((id) => id !== auteur.id)
            }));
            setBericht(`De auteur "${auteur.naam}" is verwijderd.`);
        } catch (error) {
            setFout(error.message || 'De auteur kon niet worden verwijderd.');
        }
    }

    useEffect(() => {
        laadBoeken();
        laadAuteurs();
    }, []);

    const gefilterdeBoeken = useMemo(() => {
        const term = zoekterm.trim().toLocaleLowerCase('nl');
        if (!term) return boeken;

        return boeken.filter((boek) =>
            `${boek.titel || ''} ${boek.isbn || ''} ${auteursTekst(boek)}`
                .toLocaleLowerCase('nl')
                .includes(term)
        );
    }, [boeken, zoekterm]);
    const beschikbareGenres = useMemo(() => {
        const genresUitBoeken = boeken.flatMap((boek) =>
            Array.isArray(boek.genres)
                ? boek.genres
                : boek.genre
                    ? [boek.genre]
                    : []
        );

        return [...new Set([
            ...genresUitBoeken,
            ...formulier.genres
        ])]
            .map((genre) => genre.trim())
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, 'nl'));
    }, [boeken, formulier.genres]);

    function voegGenreToe() {
        const genre = nieuwGenre.trim();

        if (!genre) return;

        const bestaandGenre = beschikbareGenres.find(
            (item) =>
                item.toLocaleLowerCase('nl') ===
                genre.toLocaleLowerCase('nl')
        );

        const gekozenGenre = bestaandGenre || genre;

        setFormulier((vorig) => ({
            ...vorig,
            genres: vorig.genres.includes(gekozenGenre)
                ? vorig.genres
                : [...vorig.genres, gekozenGenre]
        }));

        setNieuwGenre('');
    }
    function wijzigVeld(event) {
        const { name, value } = event.target;
        setFormulier((vorig) => ({ ...vorig, [name]: value }));
    }

    function openNieuwBoek() {
        setBewerkenId(null);
        setFormulier(leegBoek);
        setFormulierOpen(true);
        setBericht('');
        setFout('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function openBewerken(boek) {
        setBewerkenId(boek.id);
        setFormulier({
            isbn: boek.isbn || '',
            titel: boek.titel || '',
            omschrijving: boek.omschrijving || '',
            genres: Array.isArray(boek.genres)
                ? boek.genres
                : boek.genre
                    ? [boek.genre]
                    : [],
            prijs: boek.prijs ?? '',
            voorraad: boek.voorraad ?? '',
            imageFile: null,
            auteurs: Array.isArray(boek.auteurs) ? boek.auteurs.map((auteur) => auteur.id) : []
        });
        setFormulierOpen(true);
        setBericht('');
        setFout('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function verstuurFormulier(event) {
        event.preventDefault();
        setFout('');
        setBericht('');

        if (!formulier.titel.trim()) {
            setFout('Vul de titel van het boek in.');
            return;
        }

        if (!formulier.isbn.trim()) {
            setFout('Vul het ISBN van het boek in.');
            return;
        }

        if (!formulier.omschrijving.trim()) {
            setFout('Vul de beschrijving van het boek in.');
            return;
        }

        if (!Array.isArray(formulier.genres) || formulier.genres.length === 0) {
            setFout('Selecteer minstens één genre voor het boek.');
            return;
        }

        if (
            formulier.prijs === '' ||
            !Number.isFinite(Number(formulier.prijs)) ||
            Number(formulier.prijs) <= 0
        ) {
            setFout('Vul een prijs groter dan nul in.');
            return;
        }

        if (
            formulier.voorraad === '' ||
            !Number.isInteger(Number(formulier.voorraad)) ||
            Number(formulier.voorraad) < 0
        ) {
            setFout('Vul een geldige voorraad in. De voorraad mag niet negatief zijn.');
            return;
        }
        const formData = new FormData();
        formData.append('isbn', formulier.isbn.trim());
        formData.append('titel', formulier.titel.trim());
        formData.append('omschrijving', formulier.omschrijving.trim());
        formulier.genres.forEach((genre) => {
            formData.append('genres', genre);
        });
        formData.append('prijs', formulier.prijs);
        formData.append('voorraad', formulier.voorraad);

        if (formulier.imageFile) {
            formData.append('image', formulier.imageFile);
        }

        formulier.auteurs.forEach((auteurId) => {
            formData.append('auteurIds', auteurId);
        });

        setOpslaan(true);

        try {

            if (bewerkenId !== null) {
                await apiFetch(`/api/books/${bewerkenId}`, {
                    method: 'PUT',
                    body: formData
                });
                setBericht('Het boek is bijgewerkt.');
            } else {
                await apiFetch('/api/books', {
                    method: 'POST',
                    body: formData
                });
                setBericht('Het boek is toegevoegd.');
            }

            setFormulierOpen(false);
            setFormulier(leegBoek);
            setBewerkenId(null);
            await laadBoeken();
        } catch (error) {
            setFout(error.message || 'Het boek kon niet worden opgeslagen.');
        } finally {
            setOpslaan(false);
        }
    }

    async function verwijderBoek(boek) {
        const bevestigen = window.confirm(`Weet je zeker dat je "${boek.titel}" wilt verwijderen?`);
        if (!bevestigen) return;

        setFout('');
        setBericht('');

        try {
            await apiFetch(`/api/books/${boek.id}`, { method: 'DELETE' });
            setBericht('Het boek is verwijderd.');
            await laadBoeken();
        } catch (error) {
            setFout(error.message || 'Het boek kon niet worden verwijderd.');
        }
    }

    return (
        <PageLayout>
            <main className="dashboard-page">
                <section className="dashboard-heading">
                    <div>
                        <p className="eyebrow">BOEKHAVEN · BEHEER</p>
                        <h1>Boekenbeheer</h1>
                        <p className="section-description">
                            Beheer de boeken in de collectie.
                        </p>
                    </div>

                    <button className="button" type="button" onClick={openNieuwBoek}>
                        Nieuw boek toevoegen
                    </button>
                </section>

                <div style={{ marginBottom: '35px' }}>
                    <Link className="text-link" to="/admin">
                        ← Terug naar het dashboard
                    </Link>
                </div>

                {bericht && <div className="alert alert-success slide-in">{bericht}</div>}
                {fout && <div className="alert alert-error slide-in">{fout}</div>}

                {formulierOpen && (
                    <section className="panel form-panel slide-in">
                        <div className="panel-heading">
                            <div>
                                <p className="eyebrow">
                                    {bewerkenId !== null ? 'BOEK AANPASSEN' : 'NIEUW BOEK'}
                                </p>
                                <h2>{bewerkenId !== null ? 'Boek bewerken' : 'Boek toevoegen'}</h2>
                            </div>
                        </div>

                        <form className="form-stack" onSubmit={verstuurFormulier} noValidate>
                            <div className="form-grid">
                                <div>
                                    <label htmlFor="isbn">ISBN</label>
                                    <input id="isbn" name="isbn" value={formulier.isbn} onChange={wijzigVeld} />
                                </div>
                                <div>
                                    <label htmlFor="titel">Titel *</label>
                                    <input id="titel" name="titel" value={formulier.titel} onChange={wijzigVeld} required />
                                </div>
                            </div>

                            <label htmlFor="omschrijving">Beschrijving</label>
                            <textarea id="omschrijving" name="omschrijving" value={formulier.omschrijving} onChange={wijzigVeld} rows={3} />


                            <fieldset style={{
                                border: '1px solid var(--line)',
                                borderRadius: '8px',
                                padding: '15px',
                                margin: '0'
                            }}>
                                <legend style={{ padding: '0 6px', fontWeight: 600 }}>
                                    Genres *
                                </legend>

                                {beschikbareGenres.map((genre) => (
                                    <label
                                        key={genre}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            margin: '8px 16px 8px 0',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formulier.genres.includes(genre)}
                                            onChange={(event) => {
                                                setFormulier((vorig) => ({
                                                    ...vorig,
                                                    genres: event.target.checked
                                                        ? [...vorig.genres, genre]
                                                        : vorig.genres.filter(
                                                            (item) => item !== genre
                                                        )
                                                }));
                                            }}
                                        />
                                        {genre}
                                    </label>
                                ))}

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '8px',
                                        marginTop: '12px'
                                    }}
                                >
                                    <input
                                        type="text"
                                        value={nieuwGenre}
                                        onChange={(event) => setNieuwGenre(event.target.value)}
                                        placeholder="Nieuw genre..."
                                        aria-label="Nieuw genre"
                                    />

                                    <button
                                        className="button button-outline button-small"
                                        type="button"
                                        onClick={voegGenreToe}
                                        disabled={!nieuwGenre.trim()}
                                    >
                                        + Genre toevoegen
                                    </button>
                                </div>
                            </fieldset>




                            <label htmlFor="imageFile">Boekomslag (Afbeelding vanaf PC)</label>
                            <input
                                id="imageFile"
                                type="file"
                                accept="image/*"
                                onChange={(event) => {
                                    const bestand = event.target.files[0];
                                    setFormulier((vorig) => ({ ...vorig, imageFile: bestand }));
                                }}
                            />

                            <label>Auteurs</label>
                            <div className="author-tags-container">
                                {formulier.auteurs.map((auteurId) => {
                                    const auteur = auteurs.find((item) => item.id === auteurId);
                                    if (!auteur) return null;
                                    return (
                                        <span key={auteur.id} className="author-tag">
                                            {auteur.naam}
                                            <button
                                                type="button"
                                                className="author-tag-remove"
                                                onClick={() => setFormulier((vorig) => ({
                                                    ...vorig,
                                                    auteurs: vorig.auteurs.filter((id) => id !== auteur.id)
                                                }))}
                                            >
                                                Sluiten
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>

                            <input
                                type="search"
                                value={auteurZoekterm}
                                onChange={(event) => setAuteurZoekterm(event.target.value)}
                                placeholder="Zoek of typ de naam van een auteur..."
                                className="author-search-input"
                            />

                            <div className="author-search-results">
                                {auteurs
                                    .filter((auteur) => {
                                        const naam = auteur.naam.toLocaleLowerCase('nl');
                                        const zoekterm = auteurZoekterm.trim().toLocaleLowerCase('nl');
                                        return !formulier.auteurs.includes(auteur.id) && naam.includes(zoekterm);
                                    })
                                    .slice(0, 5)
                                    .map((auteur) => (
                                        <div key={auteur.id} className="author-result-item">
                                            <button
                                                type="button"
                                                className="author-add-btn"
                                                onClick={() => {
                                                    setFormulier((vorig) => ({
                                                        ...vorig,
                                                        auteurs: vorig.auteurs.includes(auteur.id) ? vorig.auteurs : [...vorig.auteurs, auteur.id]
                                                    }));
                                                    setAuteurZoekterm('');
                                                }}
                                            >
                                                + {auteur.naam}
                                            </button>
                                            <button
                                                type="button"
                                                className="author-delete-btn"
                                                onClick={() => verwijderAuteur(auteur)}
                                            >
                                                Verwijder
                                            </button>
                                        </div>
                                    ))}
                            </div>

                            {!nieuwAuteurFormulierOpen ? (
                                <button className="text-button" type="button" onClick={() => setNieuwAuteurFormulierOpen(true)}>
                                    + Nieuwe auteur aanmaken
                                </button>
                            ) : (
                                <div className="new-author-box">
                                    <label htmlFor="nieuweAuteurNaam">Naam van de nieuwe auteur</label>
                                    <input
                                        id="nieuweAuteurNaam"
                                        type="text"
                                        value={nieuweAuteurNaam}
                                        onChange={(event) => setNieuweAuteurNaam(event.target.value)}
                                        placeholder="Bijv. J.K. Rowling"
                                    />
                                    <div className="form-actions-inline">
                                        <button className="button button-small" type="button" onClick={voegAuteurToe} disabled={auteurToevoegen}>
                                            {auteurToevoegen ? 'Bezig...' : 'Opslaan'}
                                        </button>
                                        <button className="text-button" type="button" onClick={() => setNieuwAuteurFormulierOpen(false)}>
                                            Annuleren
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="form-grid">
                                <div>
                                    <label htmlFor="prijs">Prijs (€) *</label>
                                    <input id="prijs" name="prijs" type="number" min="0" step="0.01" value={formulier.prijs} onChange={wijzigVeld} required />
                                </div>
                                <div>
                                    <label htmlFor="voorraad">Voorraad *</label>
                                    <input id="voorraad" name="voorraad" type="number" min="0" step="1" value={formulier.voorraad} onChange={wijzigVeld} required />
                                </div>
                            </div>

                            <div className="form-actions" style={{ marginTop: '20px', borderTop: '1px solid var(--line)', paddingTop: '20px' }}>
                                <button className="button" type="submit" disabled={opslaan}>
                                    {opslaan ? 'Bezig met opslaan...' : 'Boek opslaan'}
                                </button>
                                <button className="button button-outline" type="button" onClick={() => setFormulierOpen(false)}>
                                    Annuleren
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                <section className="search-section">
                    <label className="search-box">
                        <span aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            value={zoekterm}
                            onChange={(event) => setZoekterm(event.target.value)}
                            placeholder="Zoek in de collectie op titel, ISBN of auteur..."
                        />
                    </label>
                </section>

                {laden && <p className="status-message fade-in">Collectie wordt geladen...</p>}

                {!laden && !fout && gefilterdeBoeken.length === 0 && (
                    <div className="empty-state fade-in">
                        <h3>Geen boeken gevonden</h3>
                        <p>Probeer een andere zoekterm of voeg een nieuw boek toe.</p>
                    </div>
                )}

                {!laden && gefilterdeBoeken.length > 0 &&/table-container fade-in/.test("table-container fade-in") && (
                    <div className="table-container fade-in">
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
                                        {Number(boek.prijs).toLocaleString('nl-BE', {
                                            style: 'currency',
                                            currency: 'EUR'
                                        })}
                                    </td>
                                    <td>
                                            <span style={{ color: boek.voorraad > 0 ? 'var(--green)' : '#b42318', fontWeight: 600 }}>
                                                {boek.voorraad}
                                            </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                className="button button-outline button-small"
                                                type="button"
                                                onClick={() => openBewerken(boek)}
                                            >
                                                Bewerken
                                            </button>
                                            <button
                                                className="text-button text-danger"
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