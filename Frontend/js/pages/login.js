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
    const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;

    // ล็อกอินค้างอยู่แล้ว → ข้ามหน้านี้ (ตรวจกับ server ก่อน เพื่อไม่ให้วนลูปเมื่อ token หมดอายุ)
    (async function redirectIfSignedIn() {
        let token = null;
        try { token = localStorage.getItem('auth_token'); } catch (_) { return; }
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 401) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_role');
                return;
            }
            if (!response.ok) return;

            const profile = await response.json();
            localStorage.setItem('user_role', profile.role || 'user');
            window.location.replace(profile.role === 'admin' ? 'admin.html' : 'dashboard.html');
        } catch (_) {
            // API ไม่ตอบ: อยู่หน้า login ต่อไป
        }
    })();

    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');

    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');


    // แสดง / ซ่อน Password
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
    loginForm.addEventListener('submit', async function (event) {

        event.preventDefault();

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

            const response = await fetch(`${API_BASE_URL}/api/login`, {

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
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_role', data.role || 'user');


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


    function showError(message) {

        errorMessage.textContent = message;
        errorMessage.style.display = 'block';

    }


    function showSuccess(message) {

        successMessage.textContent = message;
        successMessage.style.display = 'block';

    }
