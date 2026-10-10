// profile.js — สคริปต์ของหน้า "บัญชีผู้ใช้งาน" (profile.html)
// • ดู/แก้ไขชื่อ นามสกุล อีเมล  • เปลี่ยนรหัสผ่าน (ต้องใส่รหัสปัจจุบัน)  •
// แสดงสถานะการเชื่อมต่อ Telegram / MT5
// • ออกจากระบบ  กฎต่าง ๆ ที่ตรวจในไฟล์นี้ (อีเมล/รหัสผ่าน) เป็นการเตือนผู้ใช้ให้เร็ว
// ส่วนด่านจริงอยู่ที่เซิร์ฟเวอร์ (auth.js / api.js)
    /* =====================================================
       API CONFIG
       Node/Express backend runs on port 3000.
    ===================================================== */
    const API_BASE_URL = window.APP_CONFIG.API_BASE_URL + '/api';  // ประกาศไว้ แต่ตอนนี้เรียกผ่าน App.apiFetch จึงไม่ได้ใช้ตัวแปรนี้โดยตรง

    // อ่าน token ที่เก็บไว้ในเบราว์เซอร์
    function getAuthToken() {
        return localStorage.getItem('auth_token');
    }



    // เรียก API ของหน้านี้ (path ไม่ต้องมี /api นำหน้า) ผ่าน App.apiFetch แล้วแปลงผลเป็น JSON
    // ถ้าไม่ ok โยน error พร้อมข้อความจากเซิร์ฟเวอร์
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

    // ประกอบชื่อเต็มจากชื่อ + นามสกุล (ถ้าไม่มีใช้ username หรืออีเมลแทน)
    function getFullName(user) {
        const first = user.first_name ?? user.firstName ?? user.name ?? '';
        const last = user.last_name ?? user.lastName ?? user.surname ?? '';
        return `${first} ${last}`.trim() || user.username || user.email || 'ผู้ใช้งาน';
    }

    // ตัวอักษรแรกของชื่อ (พิมพ์ใหญ่) ใช้เป็นข้อความในวงกลมอวตาร
    function getInitial(user) {
        const fullName = getFullName(user).trim();
        return fullName ? fullName.charAt(0).toUpperCase() : 'U';
    }

    // แปลงวันที่เป็นรูปแบบไทย วว/ดด/ปปปป (ปี พ.ศ.)
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

    // ใส่ข้อความลงองค์ประกอบตาม id (ถ้าไม่มีค่าให้ใส่ "-")
    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value ?? '-';
    }

    // [สรุป] นำข้อมูลผู้ใช้ที่ได้จากเซิร์ฟเวอร์มาใส่ในหน้า: ช่องฟอร์ม ชื่อ อีเมล วันที่สมัคร
    // สถานะ และอวตาร
    // และเก็บค่าเดิมไว้ที่ window.originalProfile (ใช้เทียบว่าผู้ใช้แก้อะไรบ้าง และใช้กับปุ่ม
    // "ยกเลิก")
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
       CONNECTION STATUS (ข้อมูลจริงจากบัญชีและเทรดล่าสุด)
    ===================================================== */
    // ใส่ข้อความและสีสถานะให้การ์ด "การเชื่อมต่อ" (เขียว = ปกติ, เหลือง = ยังไม่ตั้งค่า, เทา =
    // ไม่มีข้อมูล)
    function setConnection(prefix, state, detail, label) {
        const detailEl = document.getElementById(`${prefix}Detail`);
        const statusEl = document.getElementById(`${prefix}Status`);

        if (detailEl) detailEl.textContent = detail;

        if (statusEl) {
            statusEl.textContent = label;
            statusEl.classList.remove('is-off', 'is-warn');
            if (state === 'warn') statusEl.classList.add('is-warn');
            if (state === 'off') statusEl.classList.add('is-off');
        }
    }

    // แสดงสถานะ Telegram (ดูจากว่ามี chat id ไหม) และ MT5
    // (ดูจากเวลาเทรดล่าสุดที่เซิร์ฟเวอร์ได้รับ)
    async function renderConnections(user) {
        if (user.telegram_chat_id) {
            setConnection('telegram', 'ok', `Chat ID · ${user.telegram_chat_id}`, 'Connected');
        } else {
            setConnection('telegram', 'warn', 'ยังไม่ได้ตั้งค่า Chat ID', 'Not set');
        }

        // ไม่มีสัญญาณ "เชื่อมต่อ" จาก EA โดยตรง จึงใช้เวลาของเทรดล่าสุดที่ server ได้รับ
        try {
            const response = await App.apiFetch('/api/trades?limit=1');
            const data = response.ok ? await response.json() : null;
            const latest = data && Array.isArray(data.trades) ? data.trades[0] : null;
            const when = latest && (latest.timestamp || latest.closed_at);

            if (when) {
                setConnection('mt5', 'ok', `เทรดล่าสุด · ${formatDate(when)}`, 'Receiving');
            } else {
                setConnection('mt5', 'off', 'ยังไม่มีข้อมูลเทรดจาก MT5', 'No data');
            }
        } catch (error) {
            setConnection('mt5', 'off', 'ไม่ทราบสถานะ', 'Unknown');
        }
    }

    /* =====================================================
       LOAD PROFILE
    ===================================================== */
    // โหลดโปรไฟล์จาก GET /api/profile แล้วแสดงในหน้า (ถ้าไม่สำเร็จแสดง toast)
    async function loadProfile() {
        try {
            const data = await apiRequest('/profile');
            setUserToPage(data);
            renderConnections(data);
        } catch (error) {
            if (error.message !== 'Unauthorized') {
                console.error('[Profile] Load error:', error);
                App.toast(`โหลดข้อมูลโปรไฟล์ไม่สำเร็จ\n${error.message}`);
            }
        }
    }

    /* =====================================================
       SAVE PROFILE
    ===================================================== */
    // [สรุป] กดบันทึก: ตรวจว่าชื่อ นามสกุล อีเมลไม่ว่าง → ตรวจรูปแบบอีเมล (เฉพาะเมื่อแก้อีเมล)
    // → ส่ง "เฉพาะฟิลด์ที่เปลี่ยน" ไป PATCH /api/profile → แสดงผล (ไม่มีอะไรเปลี่ยนก็ไม่ยิง
    // API)
    async function saveProfile() {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const button = document.querySelector('.primary-button[data-action="saveProfile"]');
        const original = window.originalProfile || { firstName: '', lastName: '', email: '' };

        if (!firstName) {
            App.toast('กรุณากรอกชื่อ');
            return;
        }

        if (!lastName) {
            App.toast('กรุณากรอกนามสกุล');
            return;
        }

        if (!email) {
            App.toast('กรุณากรอกอีเมล');
            return;
        }

        // ตรวจรูปแบบอีเมลเฉพาะเมื่อแก้ไข: บัญชีเก่าที่มีอีเมลนอกกฎ ASCII ยังแก้ชื่อได้
        // (server เทียบอีเมลแบบไม่สนตัวพิมพ์เล็กใหญ่ จึงเทียบแบบเดียวกัน)
        const emailChanged = email.toLowerCase() !== String(original.email || '').toLowerCase();

        if (emailChanged) {
            if (!email.includes('@')) {
                App.toast('อีเมลต้องมีเครื่องหมาย @');
                return;
            }

            // ASCII เท่านั้น: ตัวอักษรอังกฤษ ตัวเลข และสัญลักษณ์ ต้องมี @ ตัวเดียวและมีจุดในโดเมน
            if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(email)) {
                App.toast('อีเมลต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือสัญลักษณ์เท่านั้น และอยู่ในรูปแบบ name@example.com');
                return;
            }
        }

        // ส่งเฉพาะฟิลด์ที่เปลี่ยน
        const changes = {};
        if (firstName !== original.firstName) changes.first_name = firstName;
        if (lastName !== original.lastName) changes.last_name = lastName;
        if (emailChanged) changes.email = email;

        if (Object.keys(changes).length === 0) {
            App.toast('ไม่มีข้อมูลที่เปลี่ยนแปลง', 'info');
            return;
        }

        try {
            if (button) {
                button.disabled = true;
                button.textContent = 'กำลังบันทึก...';
            }

            const data = await apiRequest('/profile', {
                method: 'PATCH',
                body: JSON.stringify(changes)
            });

            setUserToPage(data);
            App.toast('บันทึกข้อมูลบัญชีเรียบร้อยแล้ว ✓');
        } catch (error) {
            console.error('[Profile] Save error:', error);
            App.toast(`บันทึกข้อมูลไม่สำเร็จ\n${error.message}`);
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
    // ปุ่ม "ยกเลิก": คืนค่าในฟอร์มกลับเป็นค่าเดิมที่โหลดมา
    function resetProfile() {
        const original = window.originalProfile || {
            firstName: '',
            lastName: '',
            email: ''
        };

        document.getElementById('firstName').value = original.firstName;
        document.getElementById('lastName').value = original.lastName;
        document.getElementById('email').value = original.email;
    }

    /* =====================================================
       TOGGLE PASSWORD
    ===================================================== */
    // ปุ่มรูปตา: สลับช่องรหัสผ่านระหว่างซ่อน (password) กับแสดง (text)
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
    // [สรุป] เปลี่ยนรหัสผ่าน: ตรวจฝั่งหน้าเว็บก่อน (กรอกครบ, 8-72 ตัว, ASCII เท่านั้น,
    // ยืนยันตรงกัน, ไม่ซ้ำรหัสเดิม)
    // แล้วส่ง PATCH /api/profile พร้อมรหัสผ่านปัจจุบัน —
    // เซิร์ฟเวอร์ตรวจรหัสปัจจุบันและกฎซ้ำอีกครั้ง (ไม่เชื่อแค่ฝั่งหน้าเว็บ)
    async function changePassword() {
        const current = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const button = document.querySelector('.primary-button[data-action="changePassword"]');

        if (!current) {
            App.toast('กรุณากรอกรหัสผ่านปัจจุบัน');
            return;
        }

        if (!newPassword) {
            App.toast('กรุณากรอกรหัสผ่านใหม่');
            return;
        }

        if (newPassword.length < 8) {
            App.toast('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร');
            return;
        }

        if (newPassword.length > 72) {
            App.toast('รหัสผ่านใหม่ยาวเกินไป: ต้องไม่เกิน 72 ตัวอักษร');
            return;
        }

        // ต้องเป็นอักขระ ASCII (ตั้งแต่เว้นวรรคถึง ~) เท่านั้น เพราะ bcrypt อ่านแค่ 72 "ไบต์"
        // แรก
        // ภาษาไทย 1 ตัวนับ 3 ไบต์ ถ้าอนุญาตจะถูกตัดเงียบ ๆ จนรหัสสั้นกว่าที่ผู้ใช้คิด
        if (!/^[ -~]+$/.test(newPassword)) {
            App.toast('รหัสผ่านใหม่ต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือสัญลักษณ์เท่านั้น (ห้ามใช้ภาษาไทย)');
            return;
        }

        if (newPassword !== confirmPassword) {
            App.toast('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
            return;
        }

        if (current === newPassword) {
            App.toast('รหัสผ่านใหม่ต้องไม่เหมือนรหัสผ่านปัจจุบัน');
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

            App.toast('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว ✓');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } catch (error) {
            console.error('[Profile] Password error:', error);
            App.toast(`เปลี่ยนรหัสผ่านไม่สำเร็จ\n${error.message}`);
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
    // ปุ่มออกจากระบบ: ถามยืนยันด้วยกล่องในหน้า แล้วล้าง token และกลับไปหน้า login
    async function logout() {
        const confirmed = await App.confirm('คุณต้องการออกจากระบบใช่หรือไม่?', { okLabel: 'ออกจากระบบ' });

        if (!confirmed) return;

        App.logout();
    }

    /* =====================================================
       INITIALIZE
    ===================================================== */
    // เมื่อหน้าพร้อม เริ่มโหลดโปรไฟล์
    document.addEventListener('DOMContentLoaded', loadProfile);
