const API_BASE_URL = 'http://localhost:3000';

async function getTrades() {
    const response = await fetch(`${API_BASE_URL}/api/trades`);

    if (!response.ok) {
        throw new Error('Failed to fetch trades');
    }

    return await response.json();
}

async function getSummary() {
    const response = await fetch(`${API_BASE_URL}/api/summary`);

    if (!response.ok) {
        throw new Error('Failed to fetch summary');
    }

    return await response.json();
}