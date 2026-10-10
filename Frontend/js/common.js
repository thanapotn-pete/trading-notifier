// common.js — ไฟล์กลางที่ "ทุกหน้า" โหลดใช้ร่วมกัน (โหลดต่อจาก config.js)
// ทำหน้าที่: เก็บ/ล้าง token ของผู้ใช้ • เรียก API พร้อมแนบ token • สร้างเมนูข้าง (sidebar) •
// แสดงข้อความแจ้งผล (toast) และกล่องยืนยัน • ผูกปุ่มต่าง ๆ ด้วย data-action • แสดงสถานะ
// MT5/Telegram มุมขวาบน •
// โชว์เมนู "จัดการบัญชี" เฉพาะ admin ฟังก์ชันที่เปิดให้หน้าอื่นใช้อยู่ใน window.App (เช่น
// App.apiFetch, App.toast)
// ฟังก์ชันและพฤติกรรมที่ใช้ร่วมกันทุกหน้า (ต้องโหลดต่อจาก js/config.js)
// ห่อโค้ดทั้งไฟล์ไว้ใน (function(){ ... })() เพื่อไม่ให้ตัวแปรภายในไปชนกับตัวแปรของหน้าอื่น
(function () {
    const TOKEN_KEY = 'auth_token';  // ชื่อ key ที่เก็บ token (JWT) ใน localStorage ของเบราว์เซอร์
    const ROLE_KEY = 'user_role';  // ชื่อ key ที่เก็บ role (user/admin) ไว้โชว์เมนู admin เร็ว ๆ ก่อนรอ API ตอบ
    const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;  // ที่อยู่ API (ค่าว่าง = origin เดียวกับหน้าเว็บ ตั้งไว้ใน config.js)

    // อ่าน token ที่เก็บไว้ (ถ้าเบราว์เซอร์ไม่ให้ใช้ localStorage คืน null)
    function getToken() {
        try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
    }

    // ล้างข้อมูลการล็อกอิน (token + role) ออกจากเบราว์เซอร์
    function clearSession() {
        try {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(ROLE_KEY);
        } catch { /* storage blocked */ }
    }

    // ออกจากระบบ: ล้างข้อมูลล็อกอินแล้วกลับไปหน้า login
    function logout() {
        clearSession();
        window.location.href = 'login.html';
    }

    // แปลงอักขระพิเศษ (& < > " ') เป็นรหัส HTML —
    // ต้องใช้ทุกครั้งที่เอาข้อมูลจากผู้ใช้/เซิร์ฟเวอร์ไปใส่ใน innerHTML
    // เพื่อกัน XSS (คนแอบฝังสคริปต์ผ่านชื่อ/ข้อความ)
    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // รูปแบบเงินสำหรับแกนกราฟ/ตัวเลข: "-$0.2", "$1,234.5" — กัน floating point เช่น -0.2000000000000001
    // [สรุป] จัดรูปแบบเงินให้อ่านง่าย: ปัดเศษ 2 ตำแหน่ง ใส่ลูกน้ำพันและเครื่องหมายลบหน้า $
    // (เช่น -$0.2, $1,234.5)
    // และกันปัญหาเลขทศนิยมของคอมพิวเตอร์ที่ทำให้ได้ค่าแปลก เช่น -0.2000000000000001
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

    // รวมฟังก์ชันที่ให้หน้าอื่นเรียกใช้ไว้ที่ window.App (เช่น App.apiFetch, App.toast,
    // App.confirm, App.formatMoney)
    window.App = { API_BASE_URL, TOKEN_KEY, ROLE_KEY, getToken, clearSession, logout, escapeHtml, formatMoney, formatChartLabel, dedupeTickLabel, toast, confirm: confirmDialog, apiFetch, buildSidebarHtml };
    // หน้าเดิมเรียก escapeHtml() แบบ global อยู่แล้ว
    window.escapeHtml = escapeHtml;

    // ---------- Sidebar (สร้างจากที่เดียว ใช้ร่วมทุกหน้า) ----------
    // เพิ่ม/แก้เมนูที่ MENU_ITEMS แล้วทุกหน้าเปลี่ยนตาม; เมนูที่ตรงกับไฟล์ปัจจุบันจะถูกไฮไลต์
    // รายการเมนูข้างทั้งหมด (ลิงก์ ไอคอน ชื่อ) — แก้/เพิ่มเมนูที่นี่ที่เดียว
    // ทุกหน้าจะเปลี่ยนตาม
    const MENU_ITEMS = [
        { href: 'dashboard.html', icon: 'bi-grid', label: 'Dashboard' },
        { href: 'trade-history.html', icon: 'bi-clock-history', label: 'ประวัติการเทรด' },
        { href: 'statistics.html', icon: 'bi-bar-chart', label: 'สถิติการเทรด' },
        { href: 'reports.html', icon: 'bi-file-earmark-text', label: 'รายงาน' },
        { title: 'การตั้งค่า' },
        { href: 'notifications.html', icon: 'bi-telegram', label: 'การแจ้งเตือน' },
        { href: 'profile.html', icon: 'bi-person', label: 'บัญชีผู้ใช้งาน' }
    ];

    // สร้าง HTML ของเมนู 1 อัน: เมนูที่ตรงกับหน้าปัจจุบันจะถูกไฮไลต์ (class active) และใส่
    // title/aria-label
    // ไว้ให้ตอนเมนูเหลือแต่ไอคอนบนมือถือ
    function menuLink({ href, icon, label }, currentFile, extra) {
        const isActive = href === currentFile;
        const active = isActive ? ' active' : '';
        // title/aria-label: บนมือถือ sidebar เหลือแต่ไอคอน จึงต้องมีชื่อให้เห็น (tooltip) และให้โปรแกรมอ่านหน้าจออ่านได้
        return `<a href="${href}" class="menu-item${active}" title="${label}" aria-label="${label}"` +
            `${isActive ? ' aria-current="page"' : ''}${extra || ''}>` +
            `<i class="bi ${icon}" aria-hidden="true"></i><span>${label}</span></a>`;
    }

    // ประกอบ HTML ของเมนูข้างทั้งหมด: โลโก้ + เมนูปกติ + เมนู "จัดการบัญชี" (ซ่อนไว้ก่อน) +
    // ปุ่มออกจากระบบ
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

        return '<div class="logo"><i class="bi bi-graph-up-arrow" aria-hidden="true"></i><span>TradeAnalytics</span></div>' +
            items + admin +
            '<div class="logout"><a href="#" title="ออกจากระบบ" aria-label="ออกจากระบบ"><i class="bi bi-box-arrow-right" aria-hidden="true"></i><span>ออกจากระบบ</span></a></div>';
    }

    // ใส่เมนูลงในแท็ก <aside class="sidebar"> ของหน้านั้น
    // โดยดูชื่อไฟล์ปัจจุบันเพื่อไฮไลต์เมนูให้ถูกอัน
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
    // กันไม่ให้สั่งเปลี่ยนหน้าไป login ซ้ำหลายรอบ (เมื่อหลาย API ตอบ 401 พร้อมกัน)
    let redirectingToLogin = false;

    // ล้างข้อมูลล็อกอินแล้วไปหน้า login คืน Promise ที่ไม่มีวันจบ
    // เพื่อให้โค้ดของหน้าที่เรียกอยู่หยุดรอ
    // แทนที่จะแสดง error ชั่วขณะก่อนเปลี่ยนหน้า
    function goToLogin() {
        clearSession();
        if (!redirectingToLogin) {
            redirectingToLogin = true;
            window.location.href = 'login.html';
        }
        return new Promise(() => {});
    }

    // [สรุป] ใช้เรียก API แทน fetch ธรรมดา: ใส่ token ใน header ให้อัตโนมัติ และถ้าไม่มี token
    // หรือเซิร์ฟเวอร์ตอบ 401 (หมดอายุ)
    // จะพากลับไปหน้า login เอง — หน้าอื่นจึงไม่ต้องเขียนโค้ดจัดการ session หมดอายุซ้ำ
    function apiFetch(path, options = {}) {
        const token = getToken();
        if (!token) return goToLogin();  // ยังไม่ล็อกอิน → ไปหน้า login

        const headers = { Authorization: `Bearer ${token}`, ...(options.headers || {}) };  // แนบ token แบบ Bearer ตามที่ api.js (requireSession) คาดหวัง
        if (options.body !== undefined && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        return fetch(`${API_BASE_URL}${path}`, { ...options, headers }).then((response) =>
            response.status === 401 ? goToLogin() : response
        );
    }

    // ป้ายแกนเวลาของกราฟ: แสดงเฉพาะวันที่และเดือน เช่น "21 ก.ย."
    // แปลงวันที่เป็นข้อความสั้นสำหรับแกนเวลาของกราฟ เช่น "21 ก.ย."
    // (ถ้าวันที่ไม่ถูกต้องคืนค่าว่าง)
    function formatChartLabel(value) {
        const d = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    }

    // ---------- ข้อความแจ้งผล (แทน alert) ----------
    // type: 'success' | 'error' | 'warning' | 'info'; ไม่ระบุ → เดาจากข้อความ
    // เดาชนิดของ toast จากข้อความ: มี ✓ = สำเร็จ, "ไม่สำเร็จ" = ผิดพลาด, "กรุณา/ต้อง" = เตือน,
    // นอกนั้น = ข้อมูลทั่วไป
    function guessToastType(message) {
        const text = String(message);
        if (text.includes('✓')) return 'success';
        if (text.includes('ไม่สำเร็จ') || text.includes('ล้มเหลว') || text.includes('เซิร์ฟเวอร์ยัง')) return 'error';
        if (text.includes('กรุณา') || text.includes('ต้อง') || text.includes('ไม่ถูกต้อง') || text.includes('ไม่มีข้อมูล')) return 'warning';
        return 'info';
    }

    // แสดงข้อความแจ้งผลเล็ก ๆ มุมขวาล่าง (แทน alert ที่เด้งขวางหน้าจอ) หายเองใน 4.5 วินาที
    // (ข้อผิดพลาด 8 วินาที)
    // ข้อความถูกใส่ด้วย textContent จึงปลอดภัยจาก XSS
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
    // แสดงกล่องถามยืนยัน (แทน confirm) คืน Promise<boolean>: true เมื่อกดปุ่มยืนยัน, false
    // เมื่อยกเลิก/ปิด
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
    // เรียกฟังก์ชันแบบ global ตามชื่อ (เช่น "saveProfile") โดยส่งอาร์กิวเมนต์ที่กำหนดไว้ใน
    // data-args
    // และส่งตัวปุ่มที่ถูกกดเป็นอาร์กิวเมนต์สุดท้ายถ้าฟังก์ชันรับเพิ่ม
    function callGlobal(name, args, element) {
        const fn = window[name];
        if (typeof fn !== 'function') {
            console.error(`[common] ไม่พบฟังก์ชัน ${name}`);
            return;
        }
        // ส่ง element เป็นอาร์กิวเมนต์สุดท้ายเมื่อฟังก์ชันรับเพิ่ม (เช่น togglePassword(inputId, button))
        fn(...args, ...(fn.length > args.length ? [element] : []));
    }

    // ดักการคลิก/การเปลี่ยนค่าทั้งหน้าเพียงที่เดียว (event delegation): ปุ่มที่มี data-href
    // จะเปลี่ยนหน้า
    // ปุ่มที่มี data-action จะเรียกฟังก์ชันตามชื่อ ใช้แทน onclick="..." ที่ CSP ห้ามไว้
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
    // แสดง/ซ่อนเมนู "จัดการบัญชี" (admin เท่านั้นที่เห็น — แต่การป้องกันจริงอยู่ที่เซิร์ฟเวอร์
    // requireAdmin)
    function setAdminMenu(visible) {
        const item = document.getElementById('adminMenuItem');
        if (item) item.style.display = visible ? 'flex' : 'none';
    }

    // ---------- ป้ายสถานะมุมขวาบน (MT5 / Telegram) จากข้อมูลจริง ----------
    // state: 'ok' (เขียว) | 'warn' (เหลือง) | 'off' (เทา)
    // [สรุป] เปลี่ยนข้อความและสีของป้ายสถานะ: เขียว = ปกติ, เหลือง = ต้องตั้งค่า, เทา =
    // ไม่มีข้อมูล (คงจุดสีเดิมไว้)
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

    // หาป้ายสถานะ 2 อันมุมขวาบน (อันแรก = MT5, อันที่สอง = Telegram) ถ้าหน้านั้นไม่มีป้าย คืน
    // null
    function getStatusBadges() {
        const badges = document.querySelectorAll('.topbar-right .status-badge');
        return badges.length >= 2 ? { mt5: badges[0], telegram: badges[1] } : null;
    }

    // ป้าย Telegram: มี chat id = "Telegram Active" (เขียว) / ยังไม่มี = "ยังไม่ได้ตั้ง
    // Telegram" (เหลือง)
    function updateTelegramBadge(badges, profile) {
        if (profile && profile.telegram_chat_id) setBadge(badges.telegram, 'ok', 'Telegram Active');
        else setBadge(badges.telegram, 'warn', 'ยังไม่ได้ตั้ง Telegram');
    }

    // [สรุป] ป้าย MT5: ดูเวลาเทรดล่าสุดที่เซิร์ฟเวอร์ได้รับจาก EA — ไม่เคยมีเทรด = เทา, ภายใน 7
    // วัน = เขียว, เก่ากว่านั้น = เทา
    // (ระบบไม่มีสัญญาณ "เชื่อมต่ออยู่" จาก EA โดยตรง จึงใช้เวลาเทรดล่าสุดแทน)
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

    // [สรุป] ทำงานตอนเปิดทุกหน้า: 1) โชว์เมนู admin ทันทีตามค่าที่แคชไว้  2) โหลด /api/profile
    // เพื่อยืนยัน role จริงและอัปเดตป้าย Telegram
    // 3) โหลดเทรดล่าสุด 1 รายการเพื่ออัปเดตป้าย MT5
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
    // ผูกเมนูโปรไฟล์มุมขวาบน (กดอวตารเพื่อเปิด/ปิด คลิกที่อื่นเพื่อปิด)
    // และปุ่มออกจากระบบทั้งสองจุด (ในเมนูโปรไฟล์ และใน sidebar)
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

    // ลำดับเริ่มทำงานของทุกหน้า: ผูกปุ่ม → สร้างเมนูข้าง → ผูกเมนูโปรไฟล์ → โหลดข้อมูลบัญชี
    function init() {
        wireActions();
        renderSidebar();
        wireChrome();
        loadSessionInfo();
    }

    // รัน init เมื่อหน้าพร้อม (ถ้าหน้าโหลดเสร็จไปแล้วก็รันทันที)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
