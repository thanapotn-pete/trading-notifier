// login.js — สคริปต์ของหน้าเข้าสู่ระบบ (login.html)
// ขั้นตอน: กรอกอีเมล+รหัสผ่าน → ส่งไป POST /api/login → ได้ token (บัตรผ่าน) กับ role → เก็บใน
// localStorage
// → พาไปหน้า admin (ถ้าเป็นผู้ดูแล) หรือ Dashboard (ผู้ใช้ทั่วไป)
// ถ้าล็อกอินค้างอยู่แล้วจะข้ามหน้านี้ไปเลย
    /*
     * Backend API
     *
     * Production ของพีท:
     * https://trading-notifier-vrdb.onrender.com
     *
     * ถ้าจะทดสอบ Backend ที่เครื่องตัวเอง
     * เปลี่ยนเป็น:
     * http://localhost:3000
     */
    const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;  // ที่อยู่ API อ่านจาก config.js (ค่าว่าง = origin เดียวกับหน้าเว็บ)

    // ล็อกอินค้างอยู่แล้ว → ข้ามหน้านี้ (ตรวจกับ server ก่อน เพื่อไม่ให้วนลูปเมื่อ token หมดอายุ)
    // [สรุป] ถ้ามี token เก็บไว้อยู่แล้ว ให้ถามเซิร์ฟเวอร์ (GET /api/profile) ว่ายังใช้ได้ไหม
    // ใช้ได้ → ข้ามไปหน้าของตัวเองเลย / หมดอายุ → ล้างทิ้งแล้วแสดงฟอร์ม login ตามปกติ
    // (ตรวจกับเซิร์ฟเวอร์ก่อน กันวนลูป)
    (async function redirectIfSignedIn() {
        let token = null;
        try { token = localStorage.getItem('auth_token'); } catch (_) { return; }
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 401) {  // token ใช้ไม่ได้/หมดอายุ → ล้างทิ้ง แล้วแสดงฟอร์ม login
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_role');
                return;
            }
            if (!response.ok) return;

            const profile = await response.json();
            localStorage.setItem('user_role', profile.role || 'user');
            // ไปหน้าของตัวเอง: admin → หน้าจัดการบัญชี, ผู้ใช้ทั่วไป → Dashboard
            // (replace = ไม่เก็บหน้า login ไว้ในประวัติ กดย้อนกลับแล้วจะไม่วนกลับมา)
            window.location.replace(profile.role === 'admin' ? 'admin.html' : 'dashboard.html');
        } catch (_) {
            // API ไม่ตอบ: อยู่หน้า login ต่อไป
        }
    })();

    // อ้างอิงองค์ประกอบในหน้า: ฟอร์ม ปุ่ม กล่องข้อความ error/สำเร็จ และช่องรหัสผ่าน
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');

    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');


    // แสดง / ซ่อน Password
    // ปุ่ม "แสดง/ซ่อน" รหัสผ่าน: สลับชนิดของช่องระหว่าง password (จุดดำ) กับ text
    // (เห็นตัวอักษร)
    togglePassword.addEventListener('click', function () {

        if (passwordInput.type === 'password') {

            passwordInput.type = 'text';
            togglePassword.textContent = 'ซ่อน';

        } else {

            passwordInput.type = 'password';
            togglePassword.textContent = 'แสดง';

        }

    });


    // Login
    // [สรุป] เมื่อกดเข้าสู่ระบบ: ตรวจว่ากรอกครบ → ส่งอีเมล+รหัสผ่านไป POST /api/login → ได้
    // token กับ role → เก็บไว้ → เปลี่ยนหน้า
    // ถ้าไม่สำเร็จแสดงข้อความ error (เซิร์ฟเวอร์ตอบข้อความเดียวกันทุกกรณี
    // ไม่บอกว่าอีเมลมีอยู่หรือไม่)
    loginForm.addEventListener('submit', async function (event) {

        event.preventDefault();  // กันไม่ให้เบราว์เซอร์ส่งฟอร์มแบบเดิมและรีโหลดหน้า

        // ซ่อนข้อความเก่า
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';

        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;

        if (!email || !password) {

            showError('กรุณากรอกอีเมลและรหัสผ่าน');

            return;
        }


        // ป้องกันการกดซ้ำ
        loginButton.disabled = true;
        loginButton.textContent = 'กำลังเข้าสู่ระบบ...';


        try {

            const response = await fetch(`${API_BASE_URL}/api/login`, {  // ใช้ fetch ตรง ๆ (ไม่ใช้ App.apiFetch) เพราะ 401 ตรงนี้แปลว่า "รหัสผิด" ไม่ใช่ "session หมดอายุ"

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })

            });


            let data = {};

            try {
                data = await response.json();
            } catch (e) {
                data = {};
            }


            // Login ไม่สำเร็จ
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
                );

            }


            // Backend ของพีทระบุว่าจะคืน { token }
            if (!data.token) {

                throw new Error(
                    'เข้าสู่ระบบสำเร็จ แต่ Backend ไม่ได้ส่ง token กลับมา'
                );

            }


            // เก็บ token เอาไว้ใช้เรียก API อื่น
            localStorage.setItem('auth_token', data.token);  // เก็บ token (บัตรผ่าน) ไว้ใช้เรียก API ทุกหน้า
            localStorage.setItem('user_role', data.role || 'user');  // เก็บ role ไว้โชว์เมนู admin ได้เร็ว (การตรวจสิทธิ์จริงอยู่ที่เซิร์ฟเวอร์เสมอ)


            showSuccess('เข้าสู่ระบบสำเร็จ กำลังเข้าสู่ระบบ...');


            // รอสั้น ๆ แล้วไป Dashboard
            setTimeout(function () {

                window.location.href = data.role === 'admin'
                    ? 'admin.html'
                    : 'dashboard.html';

            }, 700);


        } catch (error) {

            console.error('Login error:', error);

            showError(
                error.message ||
                'ไม่สามารถเชื่อมต่อกับระบบได้'
            );

        } finally {

            loginButton.disabled = false;
            loginButton.textContent = 'เข้าสู่ระบบ';

        }

    });


    // แสดงข้อความ error สีแดงใต้ฟอร์ม
    function showError(message) {

        errorMessage.textContent = message;
        errorMessage.style.display = 'block';

    }


    // แสดงข้อความสำเร็จสีเขียวใต้ฟอร์ม
    function showSuccess(message) {

        successMessage.textContent = message;
        successMessage.style.display = 'block';

    }
