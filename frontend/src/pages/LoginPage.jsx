import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PageLayout from '../components/PageLayout.jsx';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [wachtwoord, setWachtwoord] = useState('');
    const [fout, setFout] = useState('');
    const [laden, setLaden] = useState(false);

    const { gebruiker, setGebruiker, authLaden } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (authLaden) {
        return (
            <PageLayout>
                <main className="auth-page">
                    <p className="status-message">
                        Je gegevens worden geladen…
                    </p>
                </main>
            </PageLayout>
        );
    }

    if (gebruiker) {
        return (
            <Navigate
                to={gebruiker.rol === 'ADMIN' ? '/admin' : '/home'}
                replace
            />
        );
    }

    async function verzend(event) {
        event.preventDefault();

        setFout('');
        setLaden(true);

        try {
            const ingelogdeGebruiker = await apiFetch('/api/users/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: email.trim(),
                    wachtwoord,
                }),
            });

            if (!ingelogdeGebruiker?.rol) {
                throw new Error(
                    'De server heeft geen gebruikersrol teruggestuurd.'
                );
            }

            setGebruiker(ingelogdeGebruiker);

            // Standaardbestemming na het inloggen.
            const standaardBestemming =
                ingelogdeGebruiker.rol === 'ADMIN'
                    ? '/admin'
                    : '/home';

            // Bewaar eventueel de oorspronkelijke bestemming,
            // bijvoorbeeld wanneer de gebruiker eerst een boek wilde bekijken.
            const vorigeBestemming = location.state?.from;

            const bestemming =
                typeof vorigeBestemming === 'string' &&
                vorigeBestemming.startsWith('/') &&
                !vorigeBestemming.startsWith('//')
                    ? vorigeBestemming
                    : standaardBestemming;

            navigate(bestemming, { replace: true });
        } catch (error) {
            setFout(
                error.message ||
                'Inloggen is niet gelukt. Controleer je gegevens.'
            );
        } finally {
            setLaden(false);
        }
    }

    return (
        <PageLayout>
            <main className="auth-page">
                <section className="auth-card">
                    <p className="eyebrow">FIJN DAT JE ER BENT</p>

                    <h1>Welkom terug.</h1>

                    <p className="auth-intro">
                        Log in om je account en reservaties te bekijken.
                    </p>

                    {location.state?.bericht && (
                        <div className="alert alert-success">
                            {location.state.bericht}
                        </div>
                    )}

                    {fout && (
                        <div className="alert alert-error" role="alert">
                            {fout}
                        </div>
                    )}

                    <form onSubmit={verzend} className="form-stack">
                        <label>
                            E-mailadres

                            <input
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                required
                            />
                        </label>

                        <label>
                            Wachtwoord

                            <input
                                type="password"
                                autoComplete="current-password"
                                value={wachtwoord}
                                onChange={(event) =>
                                    setWachtwoord(event.target.value)
                                }
                                required
                            />
                        </label>

                        <button
                            className="button button-full"
                            type="submit"
                            disabled={laden}
                        >
                            {laden
                                ? 'Bezig met inloggen…'
                                : 'Inloggen'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Nog geen account?{' '}
                        <Link to="/register">Maak er een aan</Link>
                    </p>
                </section>
            </main>
        </PageLayout>
    );
}
