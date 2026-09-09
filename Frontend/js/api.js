const API_BASE_URL = 'http://localhost:3000';


// =========================
// API REQUEST
// =========================

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    let data;

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            `API Error: ${response.status}`
        );
    }

    return data;
}


// =========================
// LOGIN
// =========================

async function login(email, password) {
    return await apiRequest('/api/login', {
        method: 'POST',
        body: JSON.stringify({
            email,
            password
        })
    });
}


// =========================
// SETUP PASSWORD
// =========================

async function setupPassword(email, password) {
    return await apiRequest('/api/setup-password', {
        method: 'POST',
        body: JSON.stringify({
            email,
            password
        })
    });
}


// =========================
// TOKEN
// =========================

function saveToken(token) {
    localStorage.setItem('auth_token', token);
}

function getToken() {
    return localStorage.getItem('auth_token');
}

function removeToken() {
    localStorage.removeItem('auth_token');
}


// =========================
// AUTHENTICATED REQUEST
// =========================

async function authenticatedRequest(endpoint, options = {}) {
    const token = getToken();

    if (!token) {
        throw new Error('Please login first');
    }

    return await apiRequest(endpoint, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`
        }
    });
}


// =========================
// PROFILE
// =========================

async function getProfile() {
    return await authenticatedRequest('/api/profile');
}

async function updateProfile(profileData) {
    return await authenticatedRequest('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(profileData)
    });
}


// =========================
// TRADES
// =========================

async function getTrades() {
    return await authenticatedRequest('/api/trades');
}


// =========================
// SUMMARY
// =========================

async function getSummary() {
    return await authenticatedRequest('/api/summary');
}


// =========================
// STATISTICS
// =========================

async function getStatistics() {
    return await authenticatedRequest('/api/statistics');
}


// =========================
// NOTIFICATIONS
// =========================

async function getNotifications() {
    return await authenticatedRequest('/api/notifications');
}