import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PageLayout from '../../components/PageLayout.jsx';

export default function ProfilePage() {
    const { gebruiker, setGebruiker } = useAuth();

    const [profiel, setProfiel] = useState(null);
    const [laden, setLaden] = useState(true);
    const [fout, setFout] = useState('');
    const [bericht, setBericht] = useState('');

    const [naam, setNaam] = useState('');
    const [email, setEmail] = useState('');

    const [oudWachtwoord, setOudWachtwoord] = useState('');
    const [nieuwWachtwoord, setNieuwWachtwoord] = useState('');
    const [herhaalWachtwoord, setHerhaalWachtwoord] = useState('');

    const [profielOpslaan, setProfielOpslaan] = useState(false);
    const [wachtwoordOpslaan, setWachtwoordOpslaan] = useState(false);

    useEffect(() => {
        let actief = true;

        async function laadProfiel() {
            try {
                const data = await apiFetch('/api/users/profile');

                if (actief) {
                    setProfiel(data);
                    setNaam(data.naam || '');
                    setEmail(data.email || '');
                }
            } catch (error) {
                if (actief) {
                    setFout(
                        error.message ||
                        'Je profielgegevens konden niet worden geladen.'
                    );
                }
            } finally {
                if (actief) {
                    setLaden(false);
                }
            }
        }

        laadProfiel();

        return () => {
            actief = false;
        };
    }, []);

    const gebruikerData = profiel || gebruiker;

    async function bewaarProfiel(event) {
        event.preventDefault();
        setFout('');
        setBericht('');

        if (!naam.trim() || !email.trim()) {
            setFout('Vul je naam en e-mailadres in.');
            return;
        }

        try {
            setProfielOpslaan(true);

            const data = await apiFetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    naam: naam.trim(),
                    email: email.trim(),
                }),
            });

            setProfiel(data);

            if (typeof setGebruiker === 'function') {
                setGebruiker(data);
            }

            setNaam(data.naam || '');
            setEmail(data.email || '');
            setBericht('Je persoonlijke gegevens zijn succesvol bijgewerkt.');
        } catch (error) {
            setFout(
                error.message ||
                'Je persoonlijke gegevens konden niet worden opgeslagen.'
            );
        } finally {
            setProfielOpslaan(false);
        }
    }

    async function bewaarWachtwoord(event) {
        event.preventDefault();
        setFout('');
        setBericht('');

        if (!oudWachtwoord || !nieuwWachtwoord || !herhaalWachtwoord) {
            setFout('Vul alle wachtwoordvelden in.');
            return;
        }

        if (nieuwWachtwoord.length < 8) {
            setFout('Je nieuwe wachtwoord moet minstens 8 tekens bevatten.');
            return;
        }

        if (nieuwWachtwoord !== herhaalWachtwoord) {
            setFout('De nieuwe wachtwoorden komen niet overeen.');
            return;
        }

        try {
            setWachtwoordOpslaan(true);

            await apiFetch('/api/users/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oudWachtwoord,
                    nieuwWachtwoord,
                }),
            });

            setOudWachtwoord('');
            setNieuwWachtwoord('');
            setHerhaalWachtwoord('');
            setBericht('Je wachtwoord is succesvol gewijzigd.');
        } catch (error) {
            setFout(
                error.message ||
                'Je wachtwoord kon niet worden gewijzigd.'
            );
        } finally {
            setWachtwoordOpslaan(false);
        }
    }

    return (
        <PageLayout>
            <main className="dashboard-page profile-page fade-in">
                <section className="dashboard-heading">
                    <div>
                        <p className="eyebrow">BOEKHAVEN · MIJN ACCOUNT</p>
                        <h1>Mijn profiel</h1>
                        <p className="section-description">
                            Bekijk en wijzig je persoonlijke gegevens en beheer je account.
                        </p>
                    </div>
                </section>

                {laden && (
                    <p className="status-message fade-in">
                        Je profiel wordt geladen...
                    </p>
                )}

                {!laden && fout && (
                    <div className="alert alert-error slide-in" role="alert">
                        {fout}
                    </div>
                )}

                {!laden && bericht && (
                    <div className="alert alert-success slide-in" role="status">
                        {bericht}
                    </div>
                )}

                {!laden && gebruikerData && (
                    <>
                        <section className="profile-card slide-in" style={{ animationDelay: '0.1s' }}>
                            <div className="profile-avatar" aria-hidden="true">
                                {naam ? naam.charAt(0).toUpperCase() : '?'}
                            </div>

                            <div className="profile-information">
                                <p className="eyebrow">PERSOONLIJKE GEGEVENS</p>

                                <div className="profile-field">
                                    <span>Naam</span>
                                    <strong>{gebruikerData.naam || 'Niet beschikbaar'}</strong>
                                </div>

                                <div className="profile-field">
                                    <span>E-mailadres</span>
                                    <strong>{gebruikerData.email || 'Niet beschikbaar'}</strong>
                                </div>

                                <div className="profile-field">
                                    <span>Accounttype</span>
                                    <span className="status-pill status-ready" style={{ display: 'inline-flex', width: 'fit-content' }}>
                                        {gebruikerData.rol === 'ADMIN' ? 'Beheerder' : 'Klant'}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', margin: '30px 0' }}>
                            <section className="panel slide-in" style={{ animationDelay: '0.2s', margin: 0 }}>
                                <div className="panel-heading" style={{ marginBottom: '20px' }}>
                                    <p className="eyebrow">ACCOUNT BEHEREN</p>
                                    <h2>Gegevens wijzigen</h2>
                                    <p className="section-description">Pas je naam of e-mailadres aan.</p>
                                </div>

                                <form onSubmit={bewaarProfiel} className="form-stack">
                                    <div className="form-group">
                                        <label htmlFor="profiel-naam">Naam</label>
                                        <input
                                            id="profiel-naam"
                                            type="text"
                                            value={naam}
                                            onChange={(event) => setNaam(event.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="profiel-email">E-mailadres</label>
                                        <input
                                            id="profiel-email"
                                            type="email"
                                            value={email}
                                            onChange={(event) => setEmail(event.target.value)}
                                            required
                                        />
                                    </div>

                                    <button
                                        className="button"
                                        type="submit"
                                        disabled={profielOpslaan}
                                        style={{ marginTop: '10px' }}
                                    >
                                        {profielOpslaan ? 'Opslaan...' : 'Gegevens opslaan'}
                                    </button>
                                </form>
                            </section>

                            <section className="panel slide-in" style={{ animationDelay: '0.3s', margin: 0 }}>
                                <div className="panel-heading" style={{ marginBottom: '20px' }}>
                                    <p className="eyebrow">BEVEILIGING</p>
                                    <h2>Wachtwoord wijzigen</h2>
                                    <p className="section-description">Stel een nieuw beveiligd wachtwoord in.</p>
                                </div>

                                <form onSubmit={bewaarWachtwoord} className="form-stack">
                                    <div className="form-group">
                                        <label htmlFor="oud-wachtwoord">Huidig wachtwoord</label>
                                        <input
                                            id="oud-wachtwoord"
                                            type="password"
                                            autoComplete="current-password"
                                            value={oudWachtwoord}
                                            onChange={(event) => setOudWachtwoord(event.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="nieuw-wachtwoord">Nieuw wachtwoord</label>
                                        <input
                                            id="nieuw-wachtwoord"
                                            type="password"
                                            autoComplete="new-password"
                                            value={nieuwWachtwoord}
                                            onChange={(event) => setNieuwWachtwoord(event.target.value)}
                                            minLength={8}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="herhaal-wachtwoord">Herhaal wachtwoord</label>
                                        <input
                                            id="herhaal-wachtwoord"
                                            type="password"
                                            autoComplete="new-password"
                                            value={herhaalWachtwoord}
                                            onChange={(event) => setHerhaalWachtwoord(event.target.value)}
                                            minLength={8}
                                            required
                                        />
                                    </div>

                                    <button
                                        className="button"
                                        type="submit"
                                        disabled={wachtwoordOpslaan}
                                        style={{ marginTop: '10px' }}
                                    >
                                        {wachtwoordOpslaan ? 'Opslaan...' : 'Wachtwoord wijzigen'}
                                    </button>
                                </form>
                            </section>
                        </div>
                    </>
                )}

                <section className="profile-actions slide-in" style={{ animationDelay: '0.4s', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '40px' }}>
                    <article className="panel" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <p className="eyebrow">JOUW BOEKEN</p>
                            <h2>Mijn reserveringen</h2>
                            <p className="section-description" style={{ marginBottom: '20px' }}>Bekijk je actieve reserveringen en volg hun status.</p>
                        </div>
                        <Link className="button button-outline" to="/mijn-reserveringen" style={{ alignSelf: 'flex-start' }}>
                            Bekijk reserveringen →
                        </Link>
                    </article>

                    <article className="panel" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <p className="eyebrow">ONTDEK MEER</p>
                            <h2>Onze collectie</h2>
                            <p className="section-description" style={{ marginBottom: '20px' }}>Ontdek een nieuw verhaal voor je volgende leesmoment.</p>
                        </div>
                        <Link className="button button-outline" to="/" style={{ alignSelf: 'flex-start' }}>
                            Bekijk collectie →
                        </Link>
                    </article>
                </section>
            </main>
        </PageLayout>
    );
}