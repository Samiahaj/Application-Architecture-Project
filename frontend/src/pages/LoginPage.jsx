import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function LoginPage() {
    const navigate = useNavigate()
    const { laadGebruiker } = useAuth()
    const [email, setEmail] = useState('')
    const [wachtwoord, setWachtwoord] = useState('')
    const [foutmelding, setFoutmelding] = useState('')
    const [bezig, setBezig] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()

        setFoutmelding('')
        setBezig(true)

        try {
            const response = await fetch('http://localhost:8080/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    wachtwoord,
                }),
            })

            if (!response.ok) {
                const fout = await response.text()
                throw new Error(fout || 'E-mailadres of wachtwoord is onjuist.')
            }

            await laadGebruiker()

            const responseProfiel = await fetch(
                'http://localhost:8080/api/users/profile',
                {
                    credentials: 'include',
                },
            )

            if (!responseProfiel.ok) {
                throw new Error('Het gebruikersprofiel kon niet worden geladen.')
            }

            const profiel = await responseProfiel.json()

            if (profiel.rol === 'ADMIN') {
                navigate('/admin')
            } else {
                navigate('/')
            }
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

                <h1>Welkom terug</h1>
                <p>Log in en ontdek jouw volgende leesavontuur.</p>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="login-email">E-mailadres</label>
                    <input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="jouw@email.be"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />

                    <label htmlFor="login-password">Wachtwoord</label>
                    <input
                        id="login-password"
                        name="wachtwoord"
                        type="password"
                        placeholder="Jouw wachtwoord"
                        autoComplete="current-password"
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
                        {bezig ? 'Bezig...' : 'Inloggen'}
                    </button>
                </form>

                <p className="auth-switch">
                    Nog geen account? <Link to="/register">Registreren</Link>
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

export default LoginPage