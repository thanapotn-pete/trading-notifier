<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>เข้าสู่ระบบ - TradeAnalytics</title>

    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: Arial, "Noto Sans Thai", sans-serif;
            background: #f5f8f7;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #222;
        }

        .login-container {
            width: 100%;
            max-width: 430px;
            padding: 20px;
        }

        .logo {
            text-align: center;
            margin-bottom: 30px;
        }

        .logo h1 {
            color: #087f68;
            font-size: 28px;
            margin-bottom: 8px;
        }

        .logo p {
            color: #777;
            font-size: 14px;
        }

        .login-card {
            background: white;
            border: 1px solid #e5e5e5;
            border-radius: 14px;
            padding: 35px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
        }

        .login-card h2 {
            font-size: 24px;
            margin-bottom: 8px;
        }

        .login-card .subtitle {
            color: #777;
            font-size: 14px;
            margin-bottom: 28px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            font-size: 14px;
            margin-bottom: 8px;
            color: #555;
        }

        .form-group input {
            width: 100%;
            height: 48px;
            padding: 0 14px;
            border: 1px solid #d5d5d5;
            border-radius: 8px;
            font-size: 15px;
            outline: none;
            transition: 0.2s;
        }

        .form-group input:focus {
            border-color: #087f68;
            box-shadow: 0 0 0 3px rgba(8, 127, 104, 0.1);
        }

        .password-wrapper {
            position: relative;
        }

        .password-wrapper input {
            padding-right: 45px;
        }

        .toggle-password {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            border: none;
            background: none;
            cursor: pointer;
            color: #777;
            font-size: 14px;
        }

        .login-button {
            width: 100%;
            height: 48px;
            border: none;
            border-radius: 8px;
            background: #087f68;
            color: white;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: 0.2s;
        }

        .login-button:hover {
            background: #066b58;
        }

        .login-button:disabled {
            background: #9bbdb5;
            cursor: not-allowed;
        }

        .error-message {
            display: none;
            background: #fff1f1;
            border: 1px solid #f2b8b8;
            color: #c62828;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 20px;
            font-size: 14px;
        }

        .success-message {
            display: none;
            background: #effaf6;
            border: 1px solid #b8e5d7;
            color: #087f68;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 20px;
            font-size: 14px;
        }

        .footer {
            text-align: center;
            color: #999;
            font-size: 13px;
            margin-top: 25px;
        }
    </style>
</head>

<body>

<div class="login-container">

    <div class="logo">
        <h1>TradeAnalytics</h1>
        <p>ระบบบริหารจัดการข้อมูลการเทรด</p>
    </div>

    <div class="login-card">

        <h2>เข้าสู่ระบบ</h2>
        <p class="subtitle">กรุณาเข้าสู่ระบบเพื่อใช้งานระบบ</p>

        <div id="errorMessage" class="error-message"></div>

        <div id="successMessage" class="success-message"></div>

        <form id="loginForm">

            <div class="form-group">
                <label for="email">อีเมล</label>

                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="กรอกอีเมล"
                    required
                    autocomplete="email"
                >
            </div>

            <div class="form-group">
                <label for="password">รหัสผ่าน</label>

                <div class="password-wrapper">

                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="กรอกรหัสผ่าน"
                        required
                        autocomplete="current-password"
                    >

                    <button
                        type="button"
                        class="toggle-password"
                        id="togglePassword"
                    >
                        แสดง
                    </button>

                </div>
            </div>

            <button
                type="submit"
                class="login-button"
                id="loginButton"
            >
                เข้าสู่ระบบ
            </button>

        </form>

        <div class="footer">
            TradeAnalytics
        </div>

    </div>

</div>

<script>
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
    const API_BASE_URL = 'https://trading-notifier-vrdb.onrender.com';

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
            localStorage.setItem('authToken', data.token);


            showSuccess('เข้าสู่ระบบสำเร็จ กำลังเข้าสู่ระบบ...');


            // รอสั้น ๆ แล้วไป Dashboard
            setTimeout(function () {

                window.location.href = 'dashboard.php';

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
</script>

</body>
</html>