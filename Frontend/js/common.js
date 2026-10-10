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

    window.App = { API_BASE_URL, TOKEN_KEY, ROLE_KEY, getToken, clearSession, logout, escapeHtml, formatMoney, formatChartLabel, dedupeTickLabel, toast, confirm: confirmDialog, apiFetch, buildSidebarHtml };
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

    // ---------- เรียก API (แนบ token + จัดการ session หมดอายุที่เดียว) ----------
    // คืนค่าเป็น Response เหมือน fetch(); path ขึ้นต้นด้วย /api/...
    // ไม่มี token หรือได้ 401 → ล้าง session แล้วไปหน้า login (promise จะไม่จบ
    // เพราะหน้ากำลังเปลี่ยน จึงไม่มี error ขึ้นกะพริบ)
    // อย่าใช้กับหน้า login เอง เพราะ 401 ตรงนั้นแปลว่า "รหัสผ่านผิด"
    let redirectingToLogin = false;

    function goToLogin() {
        clearSession();
        if (!redirectingToLogin) {
            redirectingToLogin = true;
            window.location.href = 'login.html';
        }
        return new Promise(() => {});
    }

    function apiFetch(path, options = {}) {
        const token = getToken();
        if (!token) return goToLogin();

        const headers = { Authorization: `Bearer ${token}`, ...(options.headers || {}) };
        if (options.body !== undefined && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        return fetch(`${API_BASE_URL}${path}`, { ...options, headers }).then((response) =>
            response.status === 401 ? goToLogin() : response
        );
    }

    // ป้ายแกนเวลาของกราฟ: แสดงเฉพาะวันที่และเดือน เช่น "21 ก.ย."
    function formatChartLabel(value) {
        const d = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    }

    // ---------- ข้อความแจ้งผล (แทน alert) ----------
    // type: 'success' | 'error' | 'warning' | 'info'; ไม่ระบุ → เดาจากข้อความ
    function guessToastType(message) {
        const text = String(message);
        if (text.includes('✓')) return 'success';
        if (text.includes('ไม่สำเร็จ') || text.includes('ล้มเหลว') || text.includes('เซิร์ฟเวอร์ยัง')) return 'error';
        if (text.includes('กรุณา') || text.includes('ต้อง') || text.includes('ไม่ถูกต้อง') || text.includes('ไม่มีข้อมูล')) return 'warning';
        return 'info';
    }

    function toast(message, type) {
        let host = document.getElementById('toastHost');
        if (!host) {
            host = document.createElement('div');
            host.id = 'toastHost';
            host.className = 'toast-host';
            host.setAttribute('aria-live', 'polite');
            document.body.appendChild(host);
        }

        const kind = type || guessToastType(message);
        const item = document.createElement('div');
        item.className = `toast toast-${kind}`;
        item.setAttribute('role', kind === 'error' ? 'alert' : 'status');
        item.textContent = String(message).replace(/\s*✓\s*$/, '');

        const dismiss = () => item.remove();
        item.addEventListener('click', dismiss);
        host.appendChild(item);
        setTimeout(dismiss, kind === 'error' ? 8000 : 4500);
    }

    // ---------- กล่องยืนยัน (แทน confirm) → Promise<boolean> ----------
    function confirmDialog(message, options = {}) {
        return new Promise((resolve) => {
            const dialog = document.createElement('dialog');
            dialog.className = 'app-confirm';

            const text = document.createElement('p');
            text.textContent = message;

            const actions = document.createElement('div');
            actions.className = 'app-confirm-actions';

            const cancel = document.createElement('button');
            cancel.type = 'button';
            cancel.className = 'app-confirm-cancel';
            cancel.textContent = options.cancelLabel || 'ยกเลิก';

            const ok = document.createElement('button');
            ok.type = 'button';
            ok.className = 'app-confirm-ok';
            ok.textContent = options.okLabel || 'ยืนยัน';

            actions.append(cancel, ok);
            dialog.append(text, actions);
            document.body.appendChild(dialog);

            let result = false;
            cancel.addEventListener('click', () => dialog.close());
            ok.addEventListener('click', () => { result = true; dialog.close(); });
            dialog.addEventListener('close', () => { dialog.remove(); resolve(result); });
            dialog.showModal();
        });
    }

    // ---------- แทน onclick/onchange ในหน้า (CSP ไม่อนุญาต inline handler) ----------
    //   data-href="page.html"           คลิกแล้วไปหน้านั้น
    //   data-action="fn" [data-args='[1,"a"]']   คลิกแล้วเรียก window.fn(...args[, element])
    //   data-change="fn"                เปลี่ยนค่าแล้วเรียก window.fn()
    function callGlobal(name, args, element) {
        const fn = window[name];
        if (typeof fn !== 'function') {
            console.error(`[common] ไม่พบฟังก์ชัน ${name}`);
            return;
        }
        // ส่ง element เป็นอาร์กิวเมนต์สุดท้ายเมื่อฟังก์ชันรับเพิ่ม (เช่น togglePassword(inputId, button))
        fn(...args, ...(fn.length > args.length ? [element] : []));
    }

    function wireActions() {
        document.addEventListener('click', (event) => {
            const target = event.target.closest('[data-action], [data-href]');
            if (!target) return;

            if (target.dataset.href) {
                window.location.href = target.dataset.href;
                return;
            }

            let args = [];
            if (target.dataset.args) {
                try { args = JSON.parse(target.dataset.args); } catch { args = []; }
            }
            callGlobal(target.dataset.action, args, target);
        });

        document.addEventListener('change', (event) => {
            const target = event.target.closest('[data-change]');
            if (target) callGlobal(target.dataset.change, [], target);
        });
    }

    // ป้ายแกน X ของกราฟ: ซ่อนวันที่ที่ซ้ำกับป้ายก่อนหน้า (เทรดหลายรายการในวันเดียวกัน)
    // ต้องเป็น function ธรรมดา: Chart.js เรียกโดยให้ this = scale
    function dedupeTickLabel(value, index, ticks) {
        const label = this.getLabelForValue(value);
        if (index === 0) return label;
        const previous = this.getLabelForValue(ticks[index - 1].value);
        return label === previous ? '' : label;
    }

    // ---------- เมนู "จัดการบัญชี" (แสดงเฉพาะ admin) ----------
    function setAdminMenu(visible) {
        const item = document.getElementById('adminMenuItem');
        if (item) item.style.display = visible ? 'flex' : 'none';
    }

    // ---------- ป้ายสถานะมุมขวาบน (MT5 / Telegram) จากข้อมูลจริง ----------
    // state: 'ok' (เขียว) | 'warn' (เหลือง) | 'off' (เทา)
    function setBadge(element, state, text) {
        if (!element) return;
        element.classList.remove('is-off', 'is-warn');
        if (state === 'off') element.classList.add('is-off');
        if (state === 'warn') element.classList.add('is-warn');
        const dot = element.querySelector('.status-dot') || Object.assign(document.createElement('span'), { className: 'status-dot' });
        element.textContent = '';
        element.appendChild(dot);
        element.appendChild(document.createTextNode(text));
    }

    function getStatusBadges() {
        const badges = document.querySelectorAll('.topbar-right .status-badge');
        return badges.length >= 2 ? { mt5: badges[0], telegram: badges[1] } : null;
    }

    function updateTelegramBadge(badges, profile) {
        if (profile && profile.telegram_chat_id) setBadge(badges.telegram, 'ok', 'Telegram Active');
        else setBadge(badges.telegram, 'warn', 'ยังไม่ได้ตั้ง Telegram');
    }

    function updateMt5Badge(badges, trade) {
        const when = trade && (trade.timestamp || trade.closed_at || trade.created_at);
        const date = when ? new Date(when) : null;

        if (!date || Number.isNaN(date.getTime())) {
            setBadge(badges.mt5, 'off', 'MT5 · ยังไม่มีข้อมูล');
            return;
        }

        const label = date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
        const recent = Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
        setBadge(badges.mt5, recent ? 'ok' : 'off', `MT5 · เทรดล่าสุด ${label}`);
    }

    async function loadSessionInfo() {
        if (!getToken()) return;

        try {
            setAdminMenu(localStorage.getItem(ROLE_KEY) === 'admin');
        } catch { /* ignore */ }

        const badges = getStatusBadges();
        if (badges) {
            setBadge(badges.mt5, 'off', 'MT5 · กำลังตรวจสอบ');
            setBadge(badges.telegram, 'off', 'Telegram · กำลังตรวจสอบ');
        }

        try {
            const response = await apiFetch('/api/profile');
            if (response.ok) {
                const profile = await response.json();
                try { localStorage.setItem(ROLE_KEY, profile.role || 'user'); } catch { /* ignore */ }
                setAdminMenu(profile.role === 'admin');
                if (badges) updateTelegramBadge(badges, profile);
            } else if (badges) {
                setBadge(badges.telegram, 'off', 'Telegram · ไม่ทราบสถานะ');
            }
        } catch {
            if (badges) setBadge(badges.telegram, 'off', 'Telegram · ไม่ทราบสถานะ');
        }

        if (!badges) return;

        try {
            const response = await apiFetch('/api/trades?limit=1');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            updateMt5Badge(badges, Array.isArray(data.trades) ? data.trades[0] : null);
        } catch {
            setBadge(badges.mt5, 'off', 'MT5 · ไม่ทราบสถานะ');
        }
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
        wireActions();
        renderSidebar();
        wireChrome();
        loadSessionInfo();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
