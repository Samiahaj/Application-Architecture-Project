/**
 * Authenticatiecontext en -provider voor de applicatie.
 * Beheert de gebruikerssessie, laadt het actieve gebruikersprofiel via de API
 * en stelt authenticatiestatus en helperfuncties ter beschikking via een React context.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [gebruiker, setGebruiker] = useState(null);
    const [authLaden, setAuthLaden] = useState(true);

    const laadGebruiker = useCallback(async () => {
        try {
            const profiel = await apiFetch('/api/users/profile');
            setGebruiker(profiel);
            return profiel;
        } catch {
            setGebruiker(null);
            return null;
        } finally {
            setAuthLaden(false);
        }
    }, []);

    useEffect(() => {
        laadGebruiker();
    }, [laadGebruiker]);

    const waarde = useMemo(() => ({
        gebruiker,
        setGebruiker,
        authLaden,
        laadGebruiker,
        isAdmin: gebruiker?.rol === 'ADMIN',
    }), [gebruiker, authLaden, laadGebruiker]);

    return <AuthContext.Provider value={waarde}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth moet binnen AuthProvider gebruikt worden.');
    return context;
}
