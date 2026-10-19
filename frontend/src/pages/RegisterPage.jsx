import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PageLayout from '../components/PageLayout.jsx';

export default function RegisterPage() {
    const [naam, setNaam] = useState('');
    const [email, setEmail] = useState('');
    const [wachtwoord, setWachtwoord] = useState('');
    const [bevestiging, setBevestiging] = useState('');
    const [fout, setFout] = useState('');
    const [laden, setLaden] = useState(false);
    const { gebruiker, authLaden } = useAuth();
    const navigate = useNavigate();

    if (authLaden) return <PageLayout><main className="auth-page"><p className="status-message">Je gegevens worden geladen…</p></main></PageLayout>;
    if (gebruiker) return <Navigate to={gebruiker.rol === 'ADMIN' ? '/admin' : '/mijn-account'} replace />;

    async function verzend(event) {
        event.preventDefault();
        setFout('');
        if (wachtwoord.length < 8) { setFout('Je wachtwoord moet minstens 8 tekens bevatten.'); return; }
        if (wachtwoord !== bevestiging) { setFout('De wachtwoorden komen niet overeen.'); return; }
        setLaden(true);
        try {
            await apiFetch('/api/users/register', { method: 'POST', body: JSON.stringify({ naam: naam.trim(), email: email.trim(), wachtwoord }) });
            navigate('/login', { replace: true, state: { bericht: 'Je account is aangemaakt. Je kunt nu inloggen.' } });
        } catch (error) {
            setFout(error.message || 'Registreren is niet gelukt.');
        } finally {
            setLaden(false);
        }
    }

    return <PageLayout><main className="auth-page"><section className="auth-card"><p className="eyebrow">WORD DEEL VAN BOEKHAVEN</p><h1>Maak je account.</h1><p className="auth-intro">Bewaar je plek en volg je boekreservaties.</p>{fout && <div className="alert alert-error" role="alert">{fout}</div>}<form onSubmit={verzend} className="form-stack"><label>Naam<input type="text" autoComplete="name" value={naam} onChange={(event) => setNaam(event.target.value)} required /></label><label>E-mailadres<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Wachtwoord<input type="password" autoComplete="new-password" minLength={8} value={wachtwoord} onChange={(event) => setWachtwoord(event.target.value)} required /><small>Minstens 8 tekens.</small></label><label>Bevestig wachtwoord<input type="password" autoComplete="new-password" value={bevestiging} onChange={(event) => setBevestiging(event.target.value)} required /></label><button className="button button-full" type="submit" disabled={laden}>{laden ? 'Account wordt aangemaakt…' : 'Account aanmaken'}</button></form><p className="auth-switch">Heb je al een account? <Link to="/login">Log in</Link></p></section></main></PageLayout>;
}
