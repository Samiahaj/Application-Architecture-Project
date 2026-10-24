/**
 * Header-component van de applicatie. Biedt navigatie,
 * dynamische menu-opties op basis van de gebruikersrol (gast, USER of ADMIN)
 * en de functionaliteit om veilig uit te loggen.
 */

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function SiteHeader() {
    const { gebruiker, setGebruiker } = useAuth();
    const navigate = useNavigate();

    async function uitloggen() {
        try {
            await apiFetch('/logout', {
                method: 'POST'
            });
        } catch (error) {
            // De sessie kan al verlopen zijn; de lokale toestand wordt hoe dan ook gewist.
            console.warn(
                'Uitloggen bij de server is niet bevestigd:',
                error.message
            );
        } finally {
            setGebruiker(null);

            navigate('/login', {
                replace: true,
                state: {
                    bericht: 'Je bent uitgelogd.'
                }
            });
        }
    }

    return (
        <header className="site-header">
            <div className="header-inner">
                <Link
                    className="brand"
                    to="/"
                    aria-label="BoekHaven startpagina"
                >
                    <span className="brand-mark">B</span>
                    <span>
                        Boek<span className="brand-accent">Haven</span>
                    </span>
                </Link>

                <nav
                    className="main-nav"
                    aria-label="Hoofdnavigatie"
                >
                    {gebruiker?.rol === 'USER' ? (
                        <>
                            <NavLink to="/home">Mijn startpagina</NavLink>
                            <NavLink to="/profiel">Mijn profiel</NavLink>
                            <NavLink to="/mijn-reserveringen">
                                Mijn reserveringen
                            </NavLink>
                        </>
                    ) : gebruiker?.rol === 'ADMIN' ? (
                        <>
                            <NavLink to="/admin" end>
                                Dashboard
                            </NavLink>

                            <NavLink to="/admin/boeken">
                                Boeken
                            </NavLink>

                            <NavLink to="/admin/gebruikers">
                                Gebruikers
                            </NavLink>

                            <NavLink to="/admin/reserveringen">
                                Reserveringen
                            </NavLink>
                            <NavLink to="/admin/commentaren">
                                Commentarenbeheer
                            </NavLink>
                        </>
                    ) : (
                        <NavLink to="/" end>
                            Collectie
                        </NavLink>
                    )}
                </nav>

                <div className="header-actions">
                    {gebruiker ? (
                        <>
                            <span className="welcome-user">
                                Hallo, {gebruiker.naam}
                            </span>

                            <button
                                className="button button-outline button-small"
                                type="button"
                                onClick={uitloggen}
                            >
                                Uitloggen
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                className="header-login"
                                to="/login"
                            >
                                Inloggen
                            </Link>

                            <Link
                                className="button button-small"
                                to="/register"
                            >
                                Account maken
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

