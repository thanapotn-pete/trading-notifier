// Adds the "จัดการบัญชี" sidebar item for administrators on every user page.
// Role is verified by the API (/api/profile); the cached value only avoids flicker.
(function () {
    const API_URL = 'http://localhost:3000';
    const ROLE_CACHE_KEY = 'user_role';

    function getToken() {
        try {
            return localStorage.getItem('authToken') || localStorage.getItem('auth_token');
        } catch {
            return null;
        }
    }

    function addMenuItem() {
        if (document.getElementById('adminMenuItem')) return;

        const items = document.querySelectorAll('.menu-item');
        if (!items.length) return;

        const anchor = Array.from(items).find((item) =>
            (item.getAttribute('href') || '').includes('profile.php')
        ) || items[items.length - 1];

        const link = document.createElement('a');
        link.href = 'admin.php';
        link.className = 'menu-item';
        link.id = 'adminMenuItem';
        link.innerHTML = '<i class="bi bi-shield-lock"></i><span>จัดการบัญชี</span>';
        anchor.insertAdjacentElement('afterend', link);
    }

    async function init() {
        const token = getToken();
        if (!token) return;

        try {
            if (localStorage.getItem(ROLE_CACHE_KEY) === 'admin') addMenuItem();
        } catch { /* storage blocked */ }

        try {
            const response = await fetch(`${API_URL}/api/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) return;
            const profile = await response.json();
            try { localStorage.setItem(ROLE_CACHE_KEY, profile.role || 'user'); } catch { /* ignore */ }
            if (profile.role === 'admin') addMenuItem();
            else document.getElementById('adminMenuItem')?.remove();
        } catch { /* API unreachable: keep whatever was rendered */ }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
