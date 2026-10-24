import { Link } from 'react-router-dom';
import PageLayout from '../../components/PageLayout.jsx';

export default function AdminHomePage() {
    const onderdelen = [
        {
            titel: 'Boeken',
            beschrijving: 'Voeg boeken toe, wijzig gegevens en beheer auteurs.',
            link: '/admin/boeken',
        },
        {
            titel: 'Gebruikers',
            beschrijving: 'Bekijk gebruikers, wijzig rollen en beheer accounts.',
            link: '/admin/gebruikers',
        },
        {
            titel: 'Reserveringen',
            beschrijving: 'Bekijk reserveringen en beheer hun status.',
            link: '/admin/reserveringen',
        },
        {
            titel: 'Commentaarbeheer',
            beschrijving: 'Bekijk beoordelingen en beantwoord vragen van klanten.',
            link: '/admin/commentaren',
        },
    ];

    return (
        <PageLayout>
            <main className="dashboard-page">
                <header className="dashboard-heading">
                    <div>
                        <p className="eyebrow">BOEKHAVEN · BEHEER</p>
                        <h1>Admin dashboard</h1>
                        <p className="section-description">
                            Welkom in het beheerdersgedeelte. Wat wil je vandaag beheren?
                        </p>
                    </div>
                </header>

                <section
                    className="dashboard-grid"
                    aria-label="Beheerdersopties"
                >
                    {onderdelen.map((onderdeel) => (
                        <Link
                            key={onderdeel.link}
                            to={onderdeel.link}
                            className="panel"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                textDecoration: 'none',
                                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(182, 154, 112, 0.05) 10px, rgba(182, 154, 112, 0.05) 20px)'
                            }}
                        >
                            <h2>{onderdeel.titel}</h2>

                            <p className="section-description" style={{ marginBottom: '25px' }}>
                                {onderdeel.beschrijving}
                            </p>

                            <span className="text-link" style={{ marginTop: 'auto' }}>
                                Beheren →
                            </span>
                        </Link>
                    ))}
                </section>
            </main>
        </PageLayout>
    );
}