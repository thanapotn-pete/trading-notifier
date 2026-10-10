// admin.js — สคริปต์ของหน้า "จัดการบัญชี" (admin.html) เฉพาะผู้ดูแลระบบ (role = admin)
// แสดงตารางบัญชีทั้งหมด ค้นหาได้ และมีปุ่ม เพิ่มบัญชี / แก้ไข / รีเซ็ตรหัสผ่าน /
// ระงับ-เปิดบัญชี / ลบบัญชี
// ทุกปุ่มเรียก API ใต้ /api/admin/* ซึ่งเซิร์ฟเวอร์ตรวจสิทธิ์ admin ทุกครั้ง
// (หน้านี้แค่ซ่อน/แสดงปุ่มให้ใช้ง่าย)
const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;  // ประกาศไว้ แต่ตอนนี้เรียก API ผ่าน App.apiFetch แล้ว จึงไม่ได้ใช้ตัวแปรนี้โดยตรง
const TOKEN_KEY = 'auth_token';  // ชื่อ key ที่เก็บ token ใน localStorage
const token = localStorage.getItem(TOKEN_KEY);  // token ปัจจุบัน — ใช้เช็กตอนเริ่มหน้าว่าล็อกอินอยู่หรือไม่
// อ้างอิงองค์ประกอบในหน้า: กล่องเพิ่ม/แก้ไขบัญชี, กล่องแสดง webhook secret, ฟอร์ม
// และแถบข้อความแจ้งผล
const userDialog = document.getElementById('userDialog');
const secretDialog = document.getElementById('secretDialog');
const userForm = document.getElementById('userForm');
const notice = document.getElementById('notice');
let users = [];  // รายชื่อบัญชีที่โหลดมาจากเซิร์ฟเวอร์ (เก็บไว้ให้ค้นหาและวาดตาราง)
let editingId = null;  // id ของบัญชีที่กำลังแก้ไข (null = กำลังสร้างบัญชีใหม่)

// ตัวช่วยเรียก API ของหน้านี้: ใช้ App.apiFetch (แนบ token และจัดการ session หมดอายุให้)
// แล้วแปลงผลเป็น JSON
// 403 = ไม่ใช่ admin / ผลไม่ ok = โยน error พร้อมข้อความที่เซิร์ฟเวอร์ส่งมา
async function api(path, options = {}) {
    const response = await App.apiFetch(path, options);
    const data = await response.json().catch(() => ({}));
    if (response.status === 403) throw new Error('บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ');
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
}

// แสดงแถบข้อความแจ้งผลบนหน้า (สำเร็จ = เขียว หายเองใน 4.5 วินาที / error = แดง)
// และเลื่อนขึ้นบนสุดให้เห็น
function showNotice(message, type = 'success') {
    notice.textContent = message;
    notice.className = `notice ${type}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (type === 'success') setTimeout(() => { notice.className = 'notice'; }, 4500);
}

// [สรุป] วาดตารางบัญชี: กรองตามคำค้น (ชื่อหรืออีเมล) → อัปเดตการ์ดสรุป (ทั้งหมด / ผู้ใช้ /
// แอดมินที่ใช้งาน)
// → สร้างแถวพร้อมปุ่มแก้ไข รีเซ็ตรหัส ระงับ ลบ
function renderUsers() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    // คัดเฉพาะบัญชีที่ชื่อหรืออีเมลตรงกับคำค้น
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
    // สร้าง HTML ของแต่ละแถว — ค่าทุกช่องที่มาจากฐานข้อมูลผ่าน escapeHtml เพื่อกัน XSS
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

// โหลดรายชื่อบัญชีทั้งหมดจาก GET /api/admin/users แล้ววาดตาราง
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

// เปิดกล่อง "เพิ่มบัญชี": ล้างฟอร์ม ซ่อนช่อง role/สถานะ (ใช้เฉพาะตอนแก้ไข)
// และบังคับกรอกรหัสผ่านเริ่มต้น
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

// เปิดกล่อง "แก้ไขบัญชี": ใส่ข้อมูลเดิมลงฟอร์ม แสดงช่อง role/สถานะ และซ่อนช่องรหัสผ่าน
// (รหัสผ่านเปลี่ยนผ่านปุ่ม "รีเซ็ตรหัสผ่าน" แยกต่างหาก)
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

// ผูกปุ่มต่าง ๆ: เพิ่มบัญชี / ปิดกล่อง / ค้นหา (พิมพ์แล้วกรองตารางทันที)
document.getElementById('createButton').addEventListener('click', openCreateDialog);
document.getElementById('closeDialog').addEventListener('click', () => userDialog.close());
document.getElementById('cancelDialog').addEventListener('click', () => userDialog.close());
document.getElementById('closeSecret').addEventListener('click', () => secretDialog.close());
document.getElementById('searchInput').addEventListener('input', renderUsers);


// [สรุป] เมื่อกดบันทึกในกล่องเพิ่ม/แก้ไข:
// • กำลังแก้ไข (editingId มีค่า) → PATCH /api/admin/users/:id
// • สร้างใหม่ → POST /api/admin/users แล้วแสดง webhook secret ให้คัดลอก (แสดงครั้งเดียว
// ไว้ใส่ใน EA)
// สำเร็จแล้วโหลดตารางใหม่ / ถ้า error แสดงข้อความในกล่อง
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

// ปุ่มที่มี data-close จะปิดกล่องข้อความ (dialog) ที่ระบุชื่อไว้
document.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => document.getElementById(button.dataset.close).close());
});

// แสดง/ซ่อนข้อความ error ในกล่องนั้น (ส่งข้อความว่าง = ซ่อน)
function setFormError(id, message) {
    const element = document.getElementById(id);
    element.textContent = message || '';
    element.className = message ? 'notice error' : 'notice';
}

// แสดงกล่องยืนยัน (ใช้ตอนระงับ/เปิดบัญชี) คืน Promise: true ถ้ากดยืนยัน, false ถ้ายกเลิก
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

// เก็บบัญชีที่กำลังจัดการอยู่ในกล่อง "รีเซ็ตรหัสผ่าน" และกล่อง "ลบบัญชี"
let passwordUserId = null;
let deleteUser = null;

// เปิดกล่อง "รีเซ็ตรหัสผ่าน" ของบัญชีที่เลือก
function openPasswordDialog(user) {
    passwordUserId = user.id;
    document.getElementById('passwordForm').reset();
    document.getElementById('passwordTarget').textContent = `ตั้งรหัสผ่านใหม่ให้ ${user.email}`;
    setFormError('passwordError', '');
    document.getElementById('passwordDialog').showModal();
}

// เปิดกล่อง "ลบบัญชี": ต้องพิมพ์อีเมลของบัญชีให้ตรงก่อน ปุ่มลบจึงจะกดได้ (กันกดพลาด)
function openDeleteDialog(user) {
    deleteUser = user;
    document.getElementById('deleteForm').reset();
    document.getElementById('deleteTarget').textContent = user.email;
    document.getElementById('deleteSave').disabled = true;
    setFormError('deleteError', '');
    document.getElementById('deleteDialog').showModal();
}

// ปุ่มลบจะกดได้ก็ต่อเมื่ออีเมลที่พิมพ์ตรงกับอีเมลของบัญชีที่จะลบ (ไม่สนตัวพิมพ์เล็กใหญ่)
document.getElementById('deleteConfirmInput').addEventListener('input', (event) => {
    document.getElementById('deleteSave').disabled =
        !deleteUser || event.target.value.trim().toLowerCase() !== String(deleteUser.email || '').toLowerCase();
});

// ส่งรหัสผ่านใหม่ไป POST /api/admin/users/:id/reset-password (เซิร์ฟเวอร์ตรวจกฎรหัสผ่านและส่ง
// error กลับมาแสดงในกล่อง)
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

// ส่งคำสั่งลบไป DELETE /api/admin/users/:id แล้วโหลดตารางใหม่ (เซิร์ฟเวอร์กันการลบตัวเองและ
// admin คนสุดท้าย)
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

// [สรุป] ดักการคลิกปุ่มในตาราง (event delegation): แก้ไข / รีเซ็ตรหัส / ลบ →
// เปิดกล่องที่เกี่ยวข้อง
// ส่วนระงับ/เปิดบัญชี → ถามยืนยันก่อนแล้ว PATCH is_active
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

// ปุ่มคัดลอก webhook secret: ใช้ clipboard ถ้าได้ ถ้าไม่ได้ก็ไฮไลต์ข้อความให้ผู้ใช้กดคัดลอกเอง
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

// [สรุป] เริ่มหน้า: ไม่มี token → ไปหน้า login / โหลดโปรไฟล์ ถ้าไม่ใช่ admin → กลับ Dashboard
// (เซิร์ฟเวอร์ตรวจสิทธิ์อีกชั้นเสมอ) → แสดงชื่อและอวตาร → โหลดตารางบัญชี
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
initialize();  // เริ่มทำงานทันทีที่โหลดสคริปต์
