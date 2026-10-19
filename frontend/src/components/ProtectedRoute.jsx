import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function ProtectedRoute({ role }) {
    const { gebruiker, laden } = useAuth()

    if (laden) {
        return <p className="loading-message">Laden...</p>
    }

    if (!gebruiker) {
        return <Navigate to="/login" replace />
    }

    if (role && gebruiker.rol !== role) {
        if (gebruiker.rol === 'ADMIN') {
            return <Navigate to="/admin" replace />
        }

        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default ProtectedRoute