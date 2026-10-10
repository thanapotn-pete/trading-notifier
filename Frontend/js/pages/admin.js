const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;
const TOKEN_KEY = 'auth_token';
const token = localStorage.getItem(TOKEN_KEY);
const userDialog = document.getElementById('userDialog');
const secretDialog = document.getElementById('secretDialog');
const userForm = document.getElementById('userForm');
const notice = document.getElementById('notice');
let users = [];
let editingId = null;

async function api(path, options = {}) {
    const response = await App.apiFetch(path, options);
    const data = await response.json().catch(() => ({}));
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
                <button class="icon-btn warn" title="ลบบัญชี" data-action="delete" data-id="${escapeHtml(user.id)}"><i class="bi bi-trash"></i></button>
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

document.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => document.getElementById(button.dataset.close).close());
});

function setFormError(id, message) {
    const element = document.getElementById(id);
    element.textContent = message || '';
    element.className = message ? 'notice error' : 'notice';
}

function askConfirm({ title, message, okLabel }) {
    return new Promise((resolve) => {
        const dialog = document.getElementById('confirmDialog');
        const ok = document.getElementById('confirmOk');
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        ok.textContent = okLabel || 'ยืนยัน';
        let result = false;
        const onOk = () => { result = true; dialog.close(); };
        const onClose = () => {
            ok.removeEventListener('click', onOk);
            dialog.removeEventListener('close', onClose);
            resolve(result);
        };
        ok.addEventListener('click', onOk);
        dialog.addEventListener('close', onClose);
        dialog.showModal();
    });
}

let passwordUserId = null;
let deleteUser = null;

function openPasswordDialog(user) {
    passwordUserId = user.id;
    document.getElementById('passwordForm').reset();
    document.getElementById('passwordTarget').textContent = `ตั้งรหัสผ่านใหม่ให้ ${user.email}`;
    setFormError('passwordError', '');
    document.getElementById('passwordDialog').showModal();
}

function openDeleteDialog(user) {
    deleteUser = user;
    document.getElementById('deleteForm').reset();
    document.getElementById('deleteTarget').textContent = user.email;
    document.getElementById('deleteSave').disabled = true;
    setFormError('deleteError', '');
    document.getElementById('deleteDialog').showModal();
}

document.getElementById('deleteConfirmInput').addEventListener('input', (event) => {
    document.getElementById('deleteSave').disabled =
        !deleteUser || event.target.value.trim().toLowerCase() !== String(deleteUser.email || '').toLowerCase();
});

document.getElementById('passwordForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = document.getElementById('passwordSave');
    button.disabled = true;
    try {
        await api(`/api/admin/users/${encodeURIComponent(passwordUserId)}/reset-password`, {
            method: 'POST',
            body: JSON.stringify({ password: document.getElementById('newPassword').value })
        });
        document.getElementById('passwordDialog').close();
        showNotice('รีเซ็ตรหัสผ่านแล้ว');
    } catch (error) {
        setFormError('passwordError', error.message);
    } finally {
        button.disabled = false;
    }
});

document.getElementById('deleteForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!deleteUser) return;
    const button = document.getElementById('deleteSave');
    button.disabled = true;
    try {
        await api(`/api/admin/users/${encodeURIComponent(deleteUser.id)}`, { method: 'DELETE' });
        document.getElementById('deleteDialog').close();
        showNotice('ลบบัญชีแล้ว');
        await loadUsers();
    } catch (error) {
        setFormError('deleteError', error.message);
        button.disabled = false;
    }
});

document.getElementById('usersBody').addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const user = users.find((item) => item.id === button.dataset.id);
    if (!user) return;
    if (button.dataset.action === 'edit') return openEditDialog(user);
    if (button.dataset.action === 'password') return openPasswordDialog(user);
    if (button.dataset.action === 'delete') return openDeleteDialog(user);
    if (button.dataset.action === 'toggle') {
        const next = !user.is_active;
        const confirmed = await askConfirm({
            title: next ? 'เปิดใช้งานบัญชี' : 'ระงับบัญชี',
            message: next
                ? `เปิดใช้งานบัญชี ${user.email} อีกครั้ง?`
                : `ระงับบัญชี ${user.email}? ผู้ใช้จะเข้าสู่ระบบและรับแจ้งเตือนไม่ได้จนกว่าจะเปิดใช้งานอีกครั้ง`,
            okLabel: next ? 'เปิดใช้งาน' : 'ระงับบัญชี'
        });
        if (!confirmed) return;
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
    if (!token) { window.location.href = 'login.html'; return; }
    try {
        const response = await App.apiFetch('/api/profile');
        const profile = await response.json().catch(() => ({}));
        if (!response.ok || profile.role !== 'admin') {
            window.location.href = 'dashboard.html';
            return;
        }
        const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.name || profile.email || 'ผู้ดูแลระบบ';
        document.getElementById('welcomeText').textContent = `ยินดีต้อนรับ, ${fullName}`;
        document.getElementById('userAvatar').textContent = fullName.charAt(0).toUpperCase();
        await loadUsers();
    } catch {
        showNotice('เชื่อมต่อ API ไม่สำเร็จ กรุณาตรวจสอบว่า Backend กำลังทำงาน', 'error');
    }
}
initialize();
