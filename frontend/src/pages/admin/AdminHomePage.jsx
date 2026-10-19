import { Link } from 'react-router-dom';
import PageLayout from '../../components/PageLayout.jsx';

export default function AdminHomePage() {
    const onderdelen = [
        {
            titel: 'Boeken',
            beschrijving: 'Voeg boeken toe, wijzig gegevens en beheer auteurs.',
            link: '/admin/boeken',
            symbool: '📚',
        },
        {
            titel: 'Gebruikers',
            beschrijving: 'Bekijk gebruikers, wijzig rollen en beheer accounts.',
            link: '/admin/gebruikers',
            symbool: '👥',
        },
        {
            titel: 'Reserveringen',
            beschrijving: 'Bekijk reserveringen en beheer hun status.',
            link: '/admin/reserveringen',
            symbool: '📋',
        },
    ];

    return (
        <PageLayout>
            <main className="admin-dashboard">
                <header className="admin-dashboard-header">
                    <p className="eyebrow">BOEKHAVEN · BEHEER</p>

                    <h1>Admin dashboard</h1>

                    <p>
                        Welkom in het beheerdersgedeelte.
                        Wat wil je vandaag beheren?
                    </p>
                </header>

                <section
                    className="admin-dashboard-grid"
                    aria-label="Beheerdersopties"
                >
                    {onderdelen.map((onderdeel) => (
                        <Link
                            key={onderdeel.link}
                            to={onderdeel.link}
                            className="admin-dashboard-card"
                        >
                            <span
                                className="admin-dashboard-icon"
                                aria-hidden="true"
                            >
                                {onderdeel.symbool}
                            </span>

                            <h2>{onderdeel.titel}</h2>

                            <p>{onderdeel.beschrijving}</p>

                            <span className="admin-dashboard-link">
                                Beheren →
                            </span>
                        </Link>
                    ))}
                </section>
            </main>
        </PageLayout>
    );
}