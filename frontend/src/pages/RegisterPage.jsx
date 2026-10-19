import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function RegisterPage() {
    const navigate = useNavigate()

    const [naam, setNaam] = useState('')
    const [email, setEmail] = useState('')
    const [wachtwoord, setWachtwoord] = useState('')
    const [foutmelding, setFoutmelding] = useState('')
    const [bezig, setBezig] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()

        setFoutmelding('')
        setBezig(true)

        try {
            const response = await fetch('http://localhost:8080/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    naam,
                    email,
                    wachtwoord,
                }),
            })

            if (!response.ok) {
                const fout = await response.text()
                throw new Error(fout || 'Registreren is mislukt.')
            }

            alert('Je account is aangemaakt! Je kunt nu inloggen.')
            navigate('/login')
        } catch (error) {
            setFoutmelding(
                error.message || 'Er is iets misgegaan. Probeer het opnieuw.',
            )
        } finally {
            setBezig(false)
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <Link className="logo" to="/">
                    <span className="logo-icon">B</span>
                    <span className="logo-name">
            Boek<span>Haven</span>
          </span>
                </Link>

                <h1>Maak je account aan</h1>
                <p>Word lid van BoekHaven en ontdek nieuwe verhalen.</p>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="register-name">Naam</label>
                    <input
                        id="register-name"
                        name="naam"
                        type="text"
                        placeholder="Jouw naam"
                        autoComplete="name"
                        value={naam}
                        onChange={(event) => setNaam(event.target.value)}
                        required
                    />

                    <label htmlFor="register-email">E-mailadres</label>
                    <input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="jouw@email.be"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />

                    <label htmlFor="register-password">Wachtwoord</label>
                    <input
                        id="register-password"
                        name="wachtwoord"
                        type="password"
                        placeholder="Minstens 8 tekens"
                        autoComplete="new-password"
                        minLength={8}
                        value={wachtwoord}
                        onChange={(event) => setWachtwoord(event.target.value)}
                        required
                    />

                    {foutmelding && (
                        <p className="auth-error" role="alert">
                            {foutmelding}
                        </p>
                    )}

                    <button
                        className="primary-button auth-submit"
                        type="submit"
                        disabled={bezig}
                    >
                        {bezig ? 'Bezig...' : 'Account aanmaken'}
                    </button>
                </form>

                <p className="auth-switch">
                    Heb je al een account? <Link to="/login">Inloggen</Link>
                </p>

                <button
                    className="text-button auth-back"
                    type="button"
                    onClick={() => navigate('/')}
                >
                    ← Terug naar de homepagina
                </button>
            </div>
        </main>
    )
}

export default RegisterPage