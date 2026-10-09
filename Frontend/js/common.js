// ฟังก์ชันและพฤติกรรมที่ใช้ร่วมกันทุกหน้า (ต้องโหลดต่อจาก js/config.js)
(function () {
    const TOKEN_KEY = 'auth_token';
    const ROLE_KEY = 'user_role';
    const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;

    function getToken() {
        try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
    }

    function clearSession() {
        try {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(ROLE_KEY);
        } catch { /* storage blocked */ }
    }

    function logout() {
        clearSession();
        window.location.href = 'login.html';
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    window.App = { API_BASE_URL, TOKEN_KEY, ROLE_KEY, getToken, clearSession, logout, escapeHtml };
    // หน้าเดิมเรียก escapeHtml() แบบ global อยู่แล้ว
    window.escapeHtml = escapeHtml;

    // ---------- เมนู "จัดการบัญชี" (แสดงเฉพาะ admin) ----------
    function setAdminMenu(visible) {
        const item = document.getElementById('adminMenuItem');
        if (item) item.style.display = visible ? 'flex' : 'none';
    }

    async function syncAdminMenu() {
        const token = getToken();
        if (!token) return;

        try {
            setAdminMenu(localStorage.getItem(ROLE_KEY) === 'admin');
        } catch { /* ignore */ }

        try {
            const response = await fetch(`${API_BASE_URL}/api/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) return;
            const profile = await response.json();
            try { localStorage.setItem(ROLE_KEY, profile.role || 'user'); } catch { /* ignore */ }
            setAdminMenu(profile.role === 'admin');
        } catch { /* API unreachable: keep cached state */ }
    }

    // ---------- เมนูโปรไฟล์มุมขวาบน + ปุ่มออกจากระบบ ----------
    function wireChrome() {
        const avatar = document.getElementById('userAvatar');
        const dropdown = document.getElementById('profileDropdown');

        avatar?.addEventListener('click', () => dropdown?.classList.toggle('show'));

        document.addEventListener('click', (event) => {
            if (dropdown && avatar && !avatar.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.classList.remove('show');
            }
        });

        const onLogout = (event) => {
            event.preventDefault();
            logout();
        };
        document.getElementById('avatarLogout')?.addEventListener('click', onLogout);
        document.querySelector('.sidebar .logout a')?.addEventListener('click', onLogout);
    }

    function init() {
        wireChrome();
        syncAdminMenu();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
