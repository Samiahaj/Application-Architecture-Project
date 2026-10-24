/**
 * Hoofdingang van de React-applicatie.
 * Initialiseert de root-DOM-element en omsluit de hoofdcomponent (App)
 * met StrictMode, routering (BrowserRouter), authenticatiebeheer (AuthProvider)
 * en de globale stylesheets.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';
import './app.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
);
