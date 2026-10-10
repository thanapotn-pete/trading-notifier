    /* =====================================================
       API CONFIG
       Node/Express backend runs on port 3000.
    ===================================================== */
    const API_BASE_URL = window.APP_CONFIG.API_BASE_URL + '/api';

    function getAuthToken() {
        return localStorage.getItem('auth_token');
    }



    async function apiRequest(path, options = {}) {
        const token = getAuthToken();
        if (!token) {
            window.location.href = 'login.html';
            throw new Error('ไม่พบ session token');
        }

        const response = await App.apiFetch(`/api${path}`, options);

        let data = {};
        try {
            data = await response.json();
        } catch (_) {
            data = {};
        }

        if (!response.ok) {
            throw new Error(data.error || `Request failed (${response.status})`);
        }

        return data;
    }

    function getFullName(user) {
        const first = user.first_name ?? user.firstName ?? user.name ?? '';
        const last = user.last_name ?? user.lastName ?? user.surname ?? '';
        return `${first} ${last}`.trim() || user.username || user.email || 'ผู้ใช้งาน';
    }

    function getInitial(user) {
        const fullName = getFullName(user).trim();
        return fullName ? fullName.charAt(0).toUpperCase() : 'U';
    }

    function formatDate(value) {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleDateString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value ?? '-';
    }

    function setUserToPage(user) {
        const firstName = user.first_name ?? user.firstName ?? user.name ?? '';
        const lastName = user.last_name ?? user.lastName ?? user.surname ?? '';
        const email = user.email ?? '';
        const fullName = getFullName(user);
        const initial = getInitial(user);

        document.getElementById('firstName').value = firstName;
        document.getElementById('lastName').value = lastName;
        document.getElementById('email').value = email;

        setText('profileName', fullName);
        setText('profileEmail', email || '-');
        setText('usernameValue', user.username ?? '-');
        setText('accountIdValue', user.account_id ?? user.accountId ?? user.id ?? '-');
        setText('createdAtValue', formatDate(user.created_at ?? user.createdAt));
        setText('statusValue', user.status ?? 'Active');
        setText('welcomeText', `ยินดีต้อนรับ, ${fullName}`);
        setText('userAvatar', initial);
        setText('profileAvatar', initial);

        window.originalProfile = {
            firstName,
            lastName,
            email
        };
    }

    /* =====================================================
       LOAD PROFILE
    ===================================================== */
    async function loadProfile() {
        try {
            const data = await apiRequest('/profile');
            setUserToPage(data);
        } catch (error) {
            if (error.message !== 'Unauthorized') {
                console.error('[Profile] Load error:', error);
                alert(`โหลดข้อมูลโปรไฟล์ไม่สำเร็จ\n${error.message}`);
            }
        }
    }

    /* =====================================================
       SAVE PROFILE
    ===================================================== */
    async function saveProfile() {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const button = document.querySelector('.primary-button[onclick="saveProfile()"]');

        if (!firstName) {
            alert('กรุณากรอกชื่อ');
            return;
        }

        if (!lastName) {
            alert('กรุณากรอกนามสกุล');
            return;
        }

        if (!email) {
            alert('กรุณากรอกอีเมล');
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            alert('รูปแบบอีเมลไม่ถูกต้อง');
            return;
        }

        try {
            if (button) {
                button.disabled = true;
                button.textContent = 'กำลังบันทึก...';
            }

            const data = await apiRequest('/profile', {
                method: 'PATCH',
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email
                })
            });

            setUserToPage(data);
            document.getElementById('profilePassword').value = '';
            alert('บันทึกข้อมูลบัญชีเรียบร้อยแล้ว ✓');
        } catch (error) {
            console.error('[Profile] Save error:', error);
            alert(`บันทึกข้อมูลไม่สำเร็จ\n${error.message}`);
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = '💾 บันทึก';
            }
        }
    }

    /* =====================================================
       RESET PROFILE
    ===================================================== */
    function resetProfile() {
        const original = window.originalProfile || {
            firstName: '',
            lastName: '',
            email: ''
        };

        document.getElementById('firstName').value = original.firstName;
        document.getElementById('lastName').value = original.lastName;
        document.getElementById('email').value = original.email;
        document.getElementById('profilePassword').value = '';
    }

    /* =====================================================
       TOGGLE PASSWORD
    ===================================================== */
    function togglePassword(inputId, button) {
        const input = document.getElementById(inputId);
        if (!input) return;

        if (input.type === 'password') {
            input.type = 'text';
            button.textContent = '◉';
        } else {
            input.type = 'password';
            button.textContent = '◉';
        }
    }

    /* =====================================================
       CHANGE PASSWORD
    ===================================================== */
    async function changePassword() {
        const current = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const button = document.querySelector('.primary-button[onclick="changePassword()"]');

        if (!current) {
            alert('กรุณากรอกรหัสผ่านปัจจุบัน');
            return;
        }

        if (!newPassword) {
            alert('กรุณากรอกรหัสผ่านใหม่');
            return;
        }

        if (newPassword.length < 8) {
            alert('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร');
            return;
        }

        if (newPassword.length > 72) {
            alert('รหัสผ่านใหม่ต้องไม่เกิน 72 ตัวอักษร');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
            return;
        }

        if (current === newPassword) {
            alert('รหัสผ่านใหม่ต้องไม่เหมือนรหัสผ่านปัจจุบัน');
            return;
        }

        try {
            if (button) {
                button.disabled = true;
                button.textContent = 'กำลังเปลี่ยนรหัสผ่าน...';
            }

            await apiRequest('/profile', {
                method: 'PATCH',
                body: JSON.stringify({
                    current_password: current,
                    password: newPassword
                })
            });

            alert('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว ✓');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } catch (error) {
            console.error('[Profile] Password error:', error);
            alert(`เปลี่ยนรหัสผ่านไม่สำเร็จ\n${error.message}`);
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = 'เปลี่ยนรหัสผ่าน';
            }
        }
    }

    /* =====================================================
       LOGOUT
    ===================================================== */
    function logout() {
        const confirmLogout = confirm('คุณต้องการออกจากระบบใช่หรือไม่?');

        if (!confirmLogout) return;

        localStorage.removeItem('auth_token');
        window.location.href = 'login.html';
    }

    /* =====================================================
       INITIALIZE
    ===================================================== */
    document.addEventListener('DOMContentLoaded', loadProfile);
