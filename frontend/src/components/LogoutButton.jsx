import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function LogoutButton() {
    const { setGebruiker } = useAuth()
    const navigate = useNavigate()

    async function uitloggen() {
        try {
            const response = await fetch('http://localhost:8080/logout', {
                method: 'POST',
                credentials: 'include',
            })

            if (!response.ok) {
                throw new Error('Uitloggen is niet gelukt.')
            }

            setGebruiker(null)
            navigate('/login')
        } catch (error) {
            console.error('Fout bij het uitloggen:', error)
            alert('Uitloggen is niet gelukt. Probeer opnieuw.')
        }
    }

    return (
        <button type="button" onClick={uitloggen}>
            Uitloggen
        </button>
    )
}

export default LogoutButton