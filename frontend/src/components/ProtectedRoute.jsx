import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ role }) {
    const { gebruiker, authLaden } = useAuth();
    const locatie = useLocation();

    if (authLaden) {
        return (
            <main className="page-shell">
                <p className="status-message">
                    Je gegevens worden geladen...
                </p>
            </main>
        );
    }

    if (!gebruiker) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: locatie }}
            />
        );
    }

    if (role && gebruiker.rol !== role) {
        return (
            <Navigate
                to={gebruiker.rol === 'ADMIN' ? '/admin' : '/home'}
                replace
            />
        );
    }

    return <Outlet />;
}