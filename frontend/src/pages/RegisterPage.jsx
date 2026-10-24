import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PageLayout from '../components/PageLayout.jsx';

export default function RegisterPage() {
    const [naam, setNaam] = useState('');
    const [email, setEmail] = useState('');
    const [wachtwoord, setWachtwoord] = useState('');
    const [bevestiging, setBevestiging] = useState('');
    const [fout, setFout] = useState('');
    const [laden, setLaden] = useState(false);

    const { gebruiker, authLaden } = useAuth();
    const navigate = useNavigate();

    if (authLaden) {
        return (
            <PageLayout>
                <main className="auth-page fade-in">
                    <p className="status-message">Je gegevens worden geladen…</p>
                </main>
            </PageLayout>
        );
    }

    if (gebruiker) {
        return (
            <Navigate
                to={gebruiker.rol === 'ADMIN' ? '/admin' : '/mijn-account'}
                replace
            />
        );
    }

    async function verzend(event) {
        event.preventDefault();
        setFout('');

        if (wachtwoord.length < 8) {
            setFout('Je wachtwoord moet minstens 8 tekens bevatten.');
            return;
        }

        if (wachtwoord !== bevestiging) {
            setFout('De wachtwoorden komen niet overeen.');
            return;
        }

        setLaden(true);

        try {
            await apiFetch('/api/users/register', {
                method: 'POST',
                body: JSON.stringify({
                    naam: naam.trim(),
                    email: email.trim(),
                    wachtwoord
                })
            });

            navigate('/login', {
                replace: true,
                state: { bericht: 'Je account is aangemaakt. Je kunt nu inloggen.' }
            });
        } catch (error) {
            setFout(error.message || 'Registreren is niet gelukt.');
        } finally {
            setLaden(false);
        }
    }

    return (
        <PageLayout>
            <main className="auth-page fade-in">
                <section className="auth-card slide-in">
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <p className="eyebrow">WORD DEEL VAN BOEKHAVEN</p>
                        <h1 style={{ marginBottom: '10px' }}>Maak je account.</h1>
                        <p className="auth-intro" style={{ margin: 0 }}>
                            Bewaar je plek en volg je boekreservaties.
                        </p>
                    </div>

                    {fout && (
                        <div className="alert alert-error slide-in" role="alert">
                            {fout}
                        </div>
                    )}

                    <form onSubmit={verzend} className="form-stack">
                        <label>
                            Naam
                            <input
                                type="text"
                                autoComplete="name"
                                value={naam}
                                onChange={(event) => setNaam(event.target.value)}
                                placeholder="Bijv. Samia Hajji"
                                required
                            />
                        </label>

                        <label>
                            E-mailadres
                            <input
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="naam@voorbeeld.be"
                                required
                            />
                        </label>

                        <label>
                            Wachtwoord
                            <input
                                type="password"
                                autoComplete="new-password"
                                minLength={8}
                                value={wachtwoord}
                                onChange={(event) => setWachtwoord(event.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <small>Minstens 8 tekens.</small>
                        </label>

                        <label>
                            Bevestig wachtwoord
                            <input
                                type="password"
                                autoComplete="new-password"
                                value={bevestiging}
                                onChange={(event) => setBevestiging(event.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </label>

                        <button
                            className="button button-full"
                            type="submit"
                            disabled={laden}
                            style={{ marginTop: '12px' }}
                        >
                            {laden ? 'Account wordt aangemaakt…' : 'Account aanmaken'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Heb je al een account? <Link to="/login">Log in</Link>
                    </p>
                </section>
            </main>
        </PageLayout>
    );
}