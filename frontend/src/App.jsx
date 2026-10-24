/**
 * Hoofdcomponent en router van de applicatie.
 * Configureert alle openbare routes, beveiligde gebruikersroutes en beheerdersroutes
 * met op rollen gebaseerde toegangscontrole en dynamische doorverwijzingen.
 */

import { Navigate, Route, Routes } from 'react-router-dom';

import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Openbare pagina's
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import BookDetailPage from './pages/user/BookDetailPage.jsx';

// Gebruikerspagina's
import UserHomePage from './pages/user/UserHomePage.jsx';
import ProfilePage from './pages/user/ProfilePage.jsx';
import ReservationPage from './pages/user/ReservationPage.jsx';

// Beheerderspagina's
import AdminHomePage from './pages/admin/AdminHomePage.jsx';
import UserManagementPage from './pages/admin/UserManagementPage.jsx';
import BookManagementPage from './pages/admin/BookManagementPage.jsx';
import ReservationManagementPage from './pages/admin/ReservationManagementPage.jsx';
import CommentManagementPage from './pages/admin/CommentManagementPage.jsx';
function StartRedirect() {
    const { gebruiker, authLaden } = useAuth();

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
        return <Navigate to="/" replace />;
    }

    if (gebruiker.rol === 'ADMIN') {
        return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/home" replace />;
}

export default function App() {
    return (
        <Routes>
            {/* Openbare pagina's */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Boekdetails zijn openbaar */}
            <Route path="/boeken/:id" element={<BookDetailPage />} />

            {/* Gebruikerspagina's */}
            <Route element={<ProtectedRoute role="USER" />}>
                <Route path="/home" element={<UserHomePage />} />
                <Route path="/profiel" element={<ProfilePage />} />
                <Route
                    path="/mijn-reserveringen"
                    element={<ReservationPage />}
                />
            </Route>

            {/* Beheerderspagina's */}
            <Route element={<ProtectedRoute role="ADMIN" />}>
                <Route
                    path="/admin"
                    element={<AdminHomePage />}
                />

                <Route
                    path="/admin/gebruikers"
                    element={<UserManagementPage />}
                />

                <Route
                    path="/admin/boeken"
                    element={<BookManagementPage />}
                />

                <Route
                    path="/admin/reserveringen"
                    element={<ReservationManagementPage />}
                />
                <Route
                    path="/admin/commentaren"
                    element={<CommentManagementPage />}
                />
            </Route>

            {/* Doorverwijzing na het inloggen */}
            <Route
                path="/start"
                element={<StartRedirect />}
            />

            {/* Onbekende pagina's */}
            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
}