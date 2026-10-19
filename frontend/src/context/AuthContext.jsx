import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [gebruiker, setGebruiker] = useState(null)
    const [laden, setLaden] = useState(true)

    async function laadGebruiker() {
        try {
            const response = await fetch(
                'http://localhost:8080/api/users/profile',
                {
                    method: 'GET',
                    credentials: 'include',
                },
            )

            if (!response.ok) {
                setGebruiker(null)
                return
            }

            const gegevens = await response.json()
            setGebruiker(gegevens)
        } catch (error) {
            console.error(
                'Fout bij het ophalen van de gebruiker:',
                error,
            )
            setGebruiker(null)
        } finally {
            setLaden(false)
        }
    }

    useEffect(() => {
        laadGebruiker()
    }, [])

    return (
        <AuthContext.Provider
            value={{
                gebruiker,
                setGebruiker,
                laden,
                laadGebruiker,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error(
            'useAuth moet binnen AuthProvider worden gebruikt.',
        )
    }

    return context
}