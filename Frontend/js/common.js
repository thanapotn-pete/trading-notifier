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

    // รูปแบบเงินสำหรับแกนกราฟ/ตัวเลข: "-$0.2", "$1,234.5" — กัน floating point เช่น -0.2000000000000001
    function formatMoney(value, digits = 2) {
        const n = Number(value);
        if (!Number.isFinite(n)) return '';
        const rounded = Number(n.toFixed(digits));
        const text = Math.abs(rounded).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: digits
        });
        return (rounded < 0 ? '-' : '') + '$' + text;
    }

    window.App = { API_BASE_URL, TOKEN_KEY, ROLE_KEY, getToken, clearSession, logout, escapeHtml, formatMoney, buildSidebarHtml };
    // หน้าเดิมเรียก escapeHtml() แบบ global อยู่แล้ว
    window.escapeHtml = escapeHtml;

    // ---------- Sidebar (สร้างจากที่เดียว ใช้ร่วมทุกหน้า) ----------
    // เพิ่ม/แก้เมนูที่ MENU_ITEMS แล้วทุกหน้าเปลี่ยนตาม; เมนูที่ตรงกับไฟล์ปัจจุบันจะถูกไฮไลต์
    const MENU_ITEMS = [
        { href: 'dashboard.html', icon: 'bi-grid', label: 'Dashboard' },
        { href: 'trade-history.html', icon: 'bi-clock-history', label: 'ประวัติการเทรด' },
        { href: 'statistics.html', icon: 'bi-bar-chart', label: 'สถิติการเทรด' },
        { href: 'reports.html', icon: 'bi-file-earmark-text', label: 'รายงาน' },
        { title: 'การตั้งค่า' },
        { href: 'notifications.html', icon: 'bi-telegram', label: 'การแจ้งเตือน' },
        { href: 'profile.html', icon: 'bi-person', label: 'บัญชีผู้ใช้งาน' }
    ];

    function menuLink({ href, icon, label }, currentFile, extra) {
        const active = href === currentFile ? ' active' : '';
        return `<a href="${href}" class="menu-item${active}"${extra || ''}>` +
            `<i class="bi ${icon}"></i><span>${label}</span></a>`;
    }

    function buildSidebarHtml(currentFile) {
        const items = MENU_ITEMS.map((item) =>
            item.title ? `<div class="menu-title">${item.title}</div>` : menuLink(item, currentFile)
        ).join('');

        // เมนูของ admin: ซ่อนไว้ก่อน แล้ว syncAdminMenu() จะแสดงเมื่อบัญชีเป็น admin
        const admin = menuLink(
            { href: 'admin.html', icon: 'bi-shield-lock', label: 'จัดการบัญชี' },
            currentFile,
            ' id="adminMenuItem" style="display:none"'
        );

        return '<div class="logo"><i class="bi bi-graph-up-arrow"></i><span>TradeAnalytics</span></div>' +
            items + admin +
            '<div class="logout"><a href="#"><i class="bi bi-box-arrow-right"></i><span>ออกจากระบบ</span></a></div>';
    }

    function renderSidebar() {
        const aside = document.querySelector('aside.sidebar');
        if (!aside) return;
        const currentFile = window.location.pathname.split('/').pop();
        aside.innerHTML = buildSidebarHtml(currentFile);
    }

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
        renderSidebar();
        wireChrome();
        syncAdminMenu();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
