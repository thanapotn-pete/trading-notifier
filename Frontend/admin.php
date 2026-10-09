<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin | TradeAnalytics</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        :root { color-scheme: light; --green:#087f68; --ink:#17211e; --muted:#73807b; --line:#e5ebe8; --bg:#f5f8f7; }
        * { box-sizing:border-box; }
        body { margin:0; background:var(--bg); color:var(--ink); font-family:'IBM Plex Sans Thai',Arial,sans-serif; }
        button,input,select { font:inherit; }
        button { cursor:pointer; }
        .topbar { height:70px; background:white; border-bottom:1px solid var(--line); display:flex; align-items:center; justify-content:space-between; padding:0 max(24px,calc((100vw - 1180px)/2)); }
        .brand { display:flex; gap:10px; align-items:center; font-weight:700; font-size:18px; color:var(--green); }
        .brand i { font-size:22px; }
        .top-actions { display:flex; gap:10px; }
        .button { border:0; border-radius:8px; padding:10px 15px; font-weight:600; background:var(--green); color:white; }
        .button:hover { background:#066b58; }
        .button.secondary { background:white; color:#34423d; border:1px solid var(--line); }
        .button.danger { color:#a93030; background:#fff4f3; border:1px solid #f2d3d0; }
        .wrap { max-width:1180px; margin:32px auto; padding:0 22px; }
        .heading { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-bottom:22px; }
        h1 { margin:0 0 5px; font-size:27px; }
        .sub { margin:0; color:var(--muted); font-size:14px; }
        .cards { display:grid; grid-template-columns:repeat(3,1fr); gap:15px; margin-bottom:18px; }
        .stat,.panel { background:white; border:1px solid var(--line); border-radius:12px; box-shadow:0 2px 7px rgba(15,23,42,.025); }
        .stat { padding:17px 20px; }
        .stat-label { color:var(--muted); font-size:13px; }
        .stat-value { font-weight:700; font-size:25px; margin-top:2px; }
        .panel { overflow:hidden; }
        .toolbar { padding:16px; display:flex; justify-content:space-between; align-items:center; gap:12px; border-bottom:1px solid var(--line); }
        .search { width:min(100%,340px); height:41px; border:1px solid #dce4e0; border-radius:8px; padding:0 12px; outline:none; }
        .search:focus,input:focus,select:focus { border-color:#75b6a6; box-shadow:0 0 0 3px rgba(8,127,104,.09); outline:none; }
        .table-wrap { overflow-x:auto; }
        table { width:100%; border-collapse:collapse; min-width:850px; }
        th,td { padding:13px 16px; text-align:left; border-bottom:1px solid #edf1ef; font-size:13px; vertical-align:middle; }
        th { color:#718079; font-weight:600; background:#fbfcfc; white-space:nowrap; }
        tr:last-child td { border-bottom:0; }
        .person { font-weight:600; }
        .secondary-text { color:var(--muted); font-size:12px; margin-top:2px; }
        .badge { display:inline-flex; border-radius:20px; padding:4px 9px; font-size:11px; font-weight:600; }
        .badge.admin { background:#eef0ff; color:#4a52a7; }
        .badge.user { background:#edf7f3; color:#26765e; }
        .badge.active { background:#eaf8f1; color:#27845e; }
        .badge.inactive { background:#fff1ef; color:#ae4b40; }
        .actions { display:flex; gap:6px; white-space:nowrap; }
        .icon-btn { width:32px; height:32px; border:1px solid var(--line); border-radius:7px; background:#fff; color:#52605a; }
        .icon-btn:hover { color:var(--green); border-color:#a9cfc4; }
        .icon-btn.warn:hover { color:#b64036; border-color:#eab8b2; }
        .empty,.loading { text-align:center; padding:40px 15px; color:var(--muted); }
        .notice { display:none; border-radius:8px; padding:11px 13px; margin-bottom:15px; font-size:13px; }
        .notice.error { display:block; color:#9e2929; border:1px solid #f0c8c5; background:#fff2f1; }
        .notice.success { display:block; color:#176c53; border:1px solid #bee2d5; background:#f0faf6; }
        dialog { width:min(520px,calc(100vw - 28px)); max-height:90vh; border:1px solid var(--line); border-radius:14px; padding:0; box-shadow:0 20px 70px rgba(16,32,25,.2); }
        dialog::backdrop { background:rgba(18,30,25,.42); }
        .dialog-head { padding:19px 22px; border-bottom:1px solid var(--line); display:flex; justify-content:space-between; align-items:center; }
        .dialog-head h2 { font-size:19px; margin:0; }
        .dialog-body { padding:20px 22px 22px; }
        .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .field { margin-bottom:14px; }
        .field label { display:block; font-size:13px; color:#4f5e57; margin-bottom:6px; font-weight:500; }
        .field input,.field select { width:100%; height:42px; border:1px solid #dce4e0; border-radius:8px; padding:0 11px; background:white; }
        .help { color:var(--muted); font-size:12px; margin:4px 0 0; }
        .check-row { display:flex; align-items:center; gap:8px; margin:8px 0 18px; font-size:13px; }
        .dialog-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:18px; }
        .secret-box { background:#f5f8f7; border:1px solid var(--line); padding:12px; border-radius:8px; overflow-wrap:anywhere; font-family:monospace; font-size:13px; margin:12px 0; }
        @media(max-width:650px) { .wrap { margin:22px auto; padding:0 14px; } .heading { align-items:flex-start; flex-direction:column; } .cards { gap:8px; } .stat { padding:13px; } .stat-value { font-size:21px; } .toolbar { align-items:stretch; flex-direction:column; } .search { width:100%; } .topbar { padding:0 14px; } .form-grid { grid-template-columns:1fr; gap:0; } }
    </style>
</head>
<body>
<header class="topbar">
    <div class="brand"><i class="bi bi-graph-up-arrow"></i> TradeAnalytics <span style="color:#8b9691;font-weight:500;font-size:13px">Admin</span></div>
    <div class="top-actions">
        <a class="button secondary" href="dashboard.php" style="text-decoration:none"><i class="bi bi-grid"></i> Dashboard</a>
        <button class="button secondary" id="logoutButton" type="button"><i class="bi bi-box-arrow-right"></i> ออกจากระบบ</button>
    </div>
</header>
<main class="wrap">
    <section class="heading">
        <div><h1>จัดการบัญชี</h1><p class="sub">ดูแลบัญชีผู้ใช้ บทบาท และสถานะการใช้งาน</p></div>
        <button class="button" id="createButton" type="button"><i class="bi bi-person-plus"></i> เพิ่มบัญชี</button>
    </section>
    <div id="notice" class="notice" role="status"></div>
    <section class="cards" aria-label="Account summary">
        <div class="stat"><div class="stat-label">บัญชีทั้งหมด</div><div class="stat-value" id="totalCount">—</div></div>
        <div class="stat"><div class="stat-label">ผู้ใช้งาน</div><div class="stat-value" id="userCount">—</div></div>
        <div class="stat"><div class="stat-label">แอดมินที่ใช้งาน</div><div class="stat-value" id="adminCount">—</div></div>
    </section>
    <section class="panel">
        <div class="toolbar">
            <input class="search" id="searchInput" type="search" placeholder="ค้นหาชื่อหรืออีเมล..." aria-label="ค้นหาบัญชี">
            <span class="sub" id="resultCount"></span>
        </div>
        <div class="table-wrap"><table>
            <thead><tr><th>บัญชี</th><th>Telegram Chat ID</th><th>บทบาท</th><th>สถานะ</th><th>วันที่สร้าง</th><th>จัดการ</th></tr></thead>
            <tbody id="usersBody"><tr><td colspan="6" class="loading">กำลังโหลดบัญชี...</td></tr></tbody>
        </table></div>
    </section>
</main>

<dialog id="userDialog">
    <form id="userForm">
        <div class="dialog-head"><h2 id="dialogTitle">เพิ่มบัญชีผู้ใช้</h2><button class="icon-btn" type="button" id="closeDialog" aria-label="ปิด"><i class="bi bi-x-lg"></i></button></div>
        <div class="dialog-body">
            <div class="notice" id="formError"></div>
            <div class="form-grid">
                <div class="field"><label for="firstName">Firstname</label><input id="firstName" maxlength="100" required></div>
                <div class="field"><label for="lastName">Lastname</label><input id="lastName" maxlength="100" required></div>
            </div>
            <div class="field"><label for="email">Email</label><input id="email" type="email" maxlength="254" required></div>
            <div class="field" id="initialPasswordField"><label for="initialPassword">รหัสผ่านเริ่มต้น</label><input id="initialPassword" type="password" minlength="8" maxlength="72" autocomplete="new-password"><p class="help">กำหนดรหัสผ่านเริ่มต้นให้ผู้ใช้ แล้วส่งข้อมูลเข้าสู่ระบบให้ผู้ใช้ผ่านช่องทางที่ปลอดภัย</p></div>
            <div class="field"><label for="chatId">Telegram Chat ID <span class="help">(ไม่บังคับ)</span></label><input id="chatId" inputmode="numeric" placeholder="เช่น 123456789"></div>
            <div id="editFields" hidden>
                <div class="form-grid">
                    <div class="field"><label for="role">บทบาท</label><select id="role"><option value="user">User</option><option value="admin">Admin</option></select></div>
                </div>
                <label class="check-row"><input type="checkbox" id="isActive" checked> บัญชีเปิดใช้งาน</label>
            </div>
            <div class="dialog-actions"><button class="button secondary" type="button" id="cancelDialog">ยกเลิก</button><button class="button" id="saveButton" type="submit">บันทึก</button></div>
        </div>
    </form>
</dialog>

<dialog id="secretDialog">
    <div class="dialog-head"><h2>บัญชีพร้อมใช้งาน</h2><button class="icon-btn" type="button" id="closeSecret" aria-label="ปิด"><i class="bi bi-x-lg"></i></button></div>
    <div class="dialog-body">
        <p style="margin:0;color:#53615b;font-size:14px;line-height:1.65">คัดลอก Webhook Secret นี้สำหรับตั้งค่า EA/MT5 ของบัญชี เก็บไว้อย่างปลอดภัย ค่านี้จะแสดงครั้งเดียว ส่วนรหัสผ่านเริ่มต้นให้ส่งให้ผู้ใช้ผ่านช่องทางที่ปลอดภัย</p>
        <div class="secret-box" id="secretValue"></div>
        <button class="button secondary" id="copySecret" type="button"><i class="bi bi-copy"></i> คัดลอก Secret</button>
    </div>
</dialog>

<script>
const API_BASE_URL = 'http://localhost:3000';
const TOKEN_KEY = 'auth_token';
const token = localStorage.getItem(TOKEN_KEY);
const userDialog = document.getElementById('userDialog');
const secretDialog = document.getElementById('secretDialog');
const userForm = document.getElementById('userForm');
const notice = document.getElementById('notice');
let users = [];
let editingId = null;

async function api(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options.headers || {})
        }
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = 'login.php';
        throw new Error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
    }
    if (response.status === 403) throw new Error('บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ');
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
}

function showNotice(message, type = 'success') {
    notice.textContent = message;
    notice.className = `notice ${type}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (type === 'success') setTimeout(() => { notice.className = 'notice'; }, 4500);
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[char]));
}

function renderUsers() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const filtered = users.filter((user) =>
        `${user.first_name || ''} ${user.last_name || ''} ${user.name || ''} ${user.email || ''}`.toLowerCase().includes(query)
    );
    document.getElementById('totalCount').textContent = users.length;
    document.getElementById('userCount').textContent = users.filter((user) => user.role !== 'admin').length;
    document.getElementById('adminCount').textContent = users.filter((user) => user.role === 'admin' && user.is_active).length;
    document.getElementById('resultCount').textContent = `${filtered.length} บัญชี`;
    const body = document.getElementById('usersBody');
    if (!filtered.length) {
        body.innerHTML = `<tr><td colspan="6" class="empty">${users.length ? 'ไม่พบบัญชีที่ค้นหา' : 'ยังไม่มีบัญชีผู้ใช้'}</td></tr>`;
        return;
    }
    body.innerHTML = filtered.map((user) => {
        const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || '—';
        const created = user.created_at ? new Date(user.created_at).toLocaleDateString('th-TH') : '—';
        return `<tr>
            <td><div class="person">${escapeHtml(name)}</div><div class="secondary-text">${escapeHtml(user.email)}</div></td>
            <td>${escapeHtml(user.telegram_chat_id || '—')}</td>
            <td><span class="badge ${user.role === 'admin' ? 'admin' : 'user'}">${user.role === 'admin' ? 'Admin' : 'User'}</span></td>
            <td><span class="badge ${user.is_active ? 'active' : 'inactive'}">${user.is_active ? 'ใช้งาน' : 'ระงับ'}</span></td>
            <td>${escapeHtml(created)}</td>
            <td><div class="actions">
                <button class="icon-btn" title="แก้ไขบัญชี" data-action="edit" data-id="${escapeHtml(user.id)}"><i class="bi bi-pencil"></i></button>
                <button class="icon-btn" title="รีเซ็ตรหัสผ่าน" data-action="password" data-id="${escapeHtml(user.id)}"><i class="bi bi-key"></i></button>
                <button class="icon-btn ${user.is_active ? 'warn' : ''}" title="${user.is_active ? 'ระงับบัญชี' : 'เปิดใช้งานบัญชี'}" data-action="toggle" data-id="${escapeHtml(user.id)}"><i class="bi ${user.is_active ? 'bi-person-slash' : 'bi-person-check'}"></i></button>
            </div></td>
        </tr>`;
    }).join('');
}

async function loadUsers() {
    try {
        const data = await api('/api/admin/users');
        users = data.users || [];
        renderUsers();
    } catch (error) {
        showNotice(error.message, 'error');
        document.getElementById('usersBody').innerHTML = '<tr><td colspan="6" class="empty">โหลดบัญชีไม่สำเร็จ</td></tr>';
    }
}

function openCreateDialog() {
    editingId = null;
    userForm.reset();
    document.getElementById('dialogTitle').textContent = 'เพิ่มบัญชีผู้ใช้';
    document.getElementById('editFields').hidden = true;
    document.getElementById('email').disabled = false;
    document.getElementById('initialPasswordField').hidden = false;
    document.getElementById('initialPassword').required = true;
    document.getElementById('formError').className = 'notice';
    userDialog.showModal();
}

function openEditDialog(user) {
    editingId = user.id;
    userForm.reset();
    document.getElementById('dialogTitle').textContent = 'แก้ไขบัญชี';
    const nameParts = String(user.name || '').trim().split(/\s+/);
    document.getElementById('firstName').value = user.first_name || nameParts.shift() || '';
    document.getElementById('lastName').value = user.last_name || nameParts.join(' ');
    document.getElementById('email').value = user.email || '';
    document.getElementById('email').disabled = false;
    document.getElementById('initialPasswordField').hidden = true;
    document.getElementById('initialPassword').required = false;
    document.getElementById('chatId').value = user.telegram_chat_id || '';
    document.getElementById('role').value = user.role || 'user';
    document.getElementById('isActive').checked = Boolean(user.is_active);
    document.getElementById('editFields').hidden = false;
    document.getElementById('formError').className = 'notice';
    userDialog.showModal();
}

document.getElementById('createButton').addEventListener('click', openCreateDialog);
document.getElementById('closeDialog').addEventListener('click', () => userDialog.close());
document.getElementById('cancelDialog').addEventListener('click', () => userDialog.close());
document.getElementById('closeSecret').addEventListener('click', () => secretDialog.close());
document.getElementById('searchInput').addEventListener('input', renderUsers);
document.getElementById('logoutButton').addEventListener('click', () => {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = 'login.php';
});

userForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = document.getElementById('saveButton');
    button.disabled = true;
    const common = {
        first_name: document.getElementById('firstName').value.trim(),
        last_name: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        telegram_chat_id: document.getElementById('chatId').value.trim(),
        password: document.getElementById('initialPassword').value
    };
    try {
        if (editingId) {
            await api(`/api/admin/users/${encodeURIComponent(editingId)}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    ...common,
                    role: document.getElementById('role').value,
                    is_active: document.getElementById('isActive').checked
                })
            });
            userDialog.close();
            showNotice('บันทึกข้อมูลบัญชีแล้ว');
        } else {
            const data = await api('/api/admin/users', { method: 'POST', body: JSON.stringify(common) });
            userDialog.close();
            document.getElementById('secretValue').textContent = data.webhook_secret;
            secretDialog.showModal();
            showNotice('สร้างบัญชีแล้ว ส่งรหัสผ่านเริ่มต้นและข้อมูล Webhook ให้เจ้าของบัญชีผ่านช่องทางที่ปลอดภัย');
        }
        await loadUsers();
    } catch (error) {
        const formError = document.getElementById('formError');
        formError.textContent = error.message;
        formError.className = 'notice error';
    } finally {
        button.disabled = false;
    }
});

document.getElementById('usersBody').addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const user = users.find((item) => item.id === button.dataset.id);
    if (!user) return;
    if (button.dataset.action === 'edit') return openEditDialog(user);
    if (button.dataset.action === 'password') {
        const password = window.prompt(`รหัสผ่านใหม่สำหรับ ${user.email} (อย่างน้อย 8 ตัวอักษร)`);
        if (password === null) return;
        try {
            await api(`/api/admin/users/${encodeURIComponent(user.id)}/reset-password`, {
                method: 'POST', body: JSON.stringify({ password })
            });
            showNotice('รีเซ็ตรหัสผ่านแล้ว');
        } catch (error) { showNotice(error.message, 'error'); }
        return;
    }
    if (button.dataset.action === 'toggle') {
        const next = !user.is_active;
        if (!window.confirm(`${next ? 'เปิดใช้งาน' : 'ระงับ'}บัญชี ${user.email}?`)) return;
        try {
            await api(`/api/admin/users/${encodeURIComponent(user.id)}`, {
                method: 'PATCH', body: JSON.stringify({ is_active: next })
            });
            showNotice(next ? 'เปิดใช้งานบัญชีแล้ว' : 'ระงับบัญชีแล้ว');
            await loadUsers();
        } catch (error) { showNotice(error.message, 'error'); }
    }
});

document.getElementById('copySecret').addEventListener('click', async () => {
    const secret = document.getElementById('secretValue').textContent;
    try {
        await navigator.clipboard.writeText(secret);
        document.getElementById('copySecret').innerHTML = '<i class="bi bi-check2"></i> คัดลอกแล้ว';
    } catch {
        const range = document.createRange();
        range.selectNodeContents(document.getElementById('secretValue'));
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
});

async function initialize() {
    if (!token) { window.location.href = 'login.php'; return; }
    try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const profile = await response.json().catch(() => ({}));
        if (response.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            window.location.href = 'login.php';
            return;
        }
        if (!response.ok || profile.role !== 'admin') {
            window.location.href = 'dashboard.php';
            return;
        }
        await loadUsers();
    } catch {
        showNotice('เชื่อมต่อ API ไม่สำเร็จ กรุณาตรวจสอบว่า Backend กำลังทำงาน', 'error');
    }
}
initialize();
</script>
</body>
</html>
