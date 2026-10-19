import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'

import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function AdminDashboardPage() {
    const { gebruiker } = useAuth()

    return (
        <main className="auth-page">
            <div className="auth-card">
                <h1>Admin dashboard</h1>
                <p>Welkom, {gebruiker?.naam}!</p>

                <p>Beheer hier de gebruikers, boeken en reserveringen.</p>
            </div>
        </main>
    )
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute role="USER" />}>
                <Route
                    path="/mijn-account"
                    element={<MijnAccountRedirect />}
                />
            </Route>

            <Route element={<ProtectedRoute role="ADMIN" />}>
                <Route
                    path="/admin"
                    element={<AdminDashboardPage />}
                />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

function MijnAccountRedirect() {
    return <Navigate to="/" replace />
}

export default App