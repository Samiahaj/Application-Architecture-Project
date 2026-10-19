const API_BASE_URL = 'http://localhost:8080';

export async function apiFetch(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...options.headers,
        },
    });

    if (!response.ok) {
        let message = `Er ging iets mis (${response.status}).`;
        const contentType = response.headers.get('content-type') || '';
        try {
            if (contentType.includes('application/json')) {
                const data = await response.json();
                message = data.fout || data.message || data.detail || message;
            } else {
                const text = await response.text();
                if (text) message = text;
            }
        } catch {
            // De standaard foutmelding blijft behouden als het antwoord geen leesbare tekst bevat.
        }
        throw new Error(message);
    }

    if (response.status === 204) return null;
    const contentType = response.headers.get('content-type') || '';
    return contentType.includes('application/json') ? response.json() : null;
}

export { API_BASE_URL };
