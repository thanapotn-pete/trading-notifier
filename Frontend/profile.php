<!DOCTYPE html>
<html lang="th">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>TradeAnalytics - บัญชีผู้ใช้งาน</title>


    <!-- Google Font -->

    <link rel="preconnect" href="https://fonts.googleapis.com">

    <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossorigin
    >

    <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap"
        rel="stylesheet"
    >


    <!-- CSS หลัก -->

    <link
        rel="stylesheet"
        href="css/style.css"
    >


    <style>


        /* =====================================================
           GENERAL
        ===================================================== */

        body {

            font-family:
                'IBM Plex Sans Thai',
                'Noto Sans Thai',
                Arial,
                sans-serif;

            background: #f7f9f8;

            color: #1f2937;

        }


        /* =====================================================
           PROFILE PAGE
        ===================================================== */

        .profile-page {

            padding: 30px 28px 40px;

        }


        /* =====================================================
           PAGE HEADER
        ===================================================== */

        .profile-header {

            margin-bottom: 24px;

        }


        .profile-header h2 {

            margin: 0 0 7px;

            font-size: 24px;

            font-weight: 700;

            line-height: 1.3;

            color: #111917;

        }


        .profile-header p {

            margin: 0;

            font-size: 13px;

            color: #82908c;

        }


        /* =====================================================
           PROFILE GRID
        ===================================================== */

        .profile-grid {

            display: grid;

            grid-template-columns:
                minmax(280px, 0.75fr)
                minmax(0, 1.5fr);

            gap: 18px;

            align-items: start;

        }


        /* =====================================================
           CARD
        ===================================================== */

        .profile-card {

            background: white;

            border:
                1px solid
                #e5ebe9;

            border-radius: 12px;

            padding: 22px;

            margin-bottom: 18px;

            box-shadow:
                0 1px 3px
                rgba(
                    15,
                    23,
                    42,
                    0.025
                );

        }


        .profile-card:last-child {

            margin-bottom: 0;

        }


        /* =====================================================
           PROFILE SUMMARY
        ===================================================== */

        .profile-summary {

            text-align: center;

        }


        .profile-avatar-large {

            width: 82px;

            height: 82px;

            margin: 3px auto 15px;

            border-radius: 50%;

            background:
                linear-gradient(
                    135deg,
                    #087f68,
                    #0b9277
                );

            color: white;

            display: flex;

            align-items: center;

            justify-content: center;

            font-size: 27px;

            font-weight: 700;

            box-shadow:
                0 8px 20px
                rgba(
                    8,
                    127,
                    104,
                    0.18
                );

        }


        .profile-name {

            font-size: 18px;

            font-weight: 700;

            color: #1f2937;

            margin-bottom: 4px;

        }


        .profile-email {

            font-size: 12px;

            color: #8a9894;

            margin-bottom: 12px;

        }


        .account-badge {

            display: inline-flex;

            align-items: center;

            gap: 6px;

            padding: 6px 11px;

            border-radius: 20px;

            background: #edf8f5;

            color: #087f68;

            font-size: 10px;

            font-weight: 600;

        }


        .account-dot {

            width: 6px;

            height: 6px;

            border-radius: 50%;

            background: #14b87a;

        }


        /* =====================================================
           ACCOUNT INFO
        ===================================================== */

        .account-info {

            margin-top: 22px;

            padding-top: 18px;

            border-top:
                1px solid
                #eef2f1;

            text-align: left;

        }


        .info-row {

            display: flex;

            justify-content: space-between;

            align-items: center;

            padding: 10px 0;

        }


        .info-label {

            font-size: 11px;

            color: #8a9894;

        }


        .info-value {

            font-size: 11px;

            color: #334155;

            font-weight: 600;

        }


        /* =====================================================
           CARD HEADER
        ===================================================== */

        .card-header {

            display: flex;

            justify-content: space-between;

            align-items: flex-start;

            padding-bottom: 17px;

            margin-bottom: 4px;

            border-bottom:
                1px solid
                #eef2f1;

        }


        .card-header h3 {

            margin: 0 0 5px;

            font-size: 16px;

            font-weight: 700;

            color: #111917;

        }


        .card-header p {

            margin: 0;

            font-size: 11px;

            line-height: 1.5;

            color: #8a9894;

        }


        .header-icon {

            width: 38px;

            height: 38px;

            border-radius: 9px;

            display: flex;

            align-items: center;

            justify-content: center;

            background: #edf8f5;

            color: #087f68;

            font-size: 16px;

        }


        /* =====================================================
           FORM
        ===================================================== */

        .form-grid {

            display: grid;

            grid-template-columns:
                repeat(2, 1fr);

            gap: 16px;

            margin-top: 18px;

        }


        .form-group {

            display: flex;

            flex-direction: column;

        }


        .form-group.full {

            grid-column: 1 / -1;

        }


        .form-label {

            margin-bottom: 7px;

            font-size: 11px;

            color: #64746f;

            font-weight: 600;

        }


        .form-input {

            width: 100%;

            height: 42px;

            padding: 0 13px;

            border:
                1px solid
                #dbe4e1;

            border-radius: 8px;

            background: white;

            color: #334155;

            font-family: inherit;

            font-size: 12px;

            outline: none;

            transition:
                border-color 0.2s ease,
                box-shadow 0.2s ease;

        }


        .form-input:focus {

            border-color: #087f68;

            box-shadow:
                0 0 0 3px
                rgba(
                    8,
                    127,
                    104,
                    0.07
                );

        }


        .form-input:disabled {

            background: #f8faf9;

            color: #8a9894;

            cursor: not-allowed;

        }


        .form-hint {

            margin-top: 5px;

            font-size: 9px;

            color: #a0aba8;

        }


        /* =====================================================
           PASSWORD
        ===================================================== */

        .password-wrapper {

            position: relative;

        }


        .password-wrapper .form-input {

            padding-right: 42px;

        }


        .password-toggle {

            position: absolute;

            right: 10px;

            top: 50%;

            transform: translateY(-50%);

            border: none;

            background: transparent;

            color: #94a3b8;

            cursor: pointer;

            font-size: 15px;

        }


        .password-toggle:hover {

            color: #087f68;

        }


        /* =====================================================
           SAVE BUTTON
        ===================================================== */

        .form-actions {

            display: flex;

            justify-content: flex-end;

            gap: 9px;

            margin-top: 20px;

            padding-top: 17px;

            border-top:
                1px solid
                #eef2f1;

        }


        .secondary-button {

            height: 40px;

            padding: 0 15px;

            border:
                1px solid
                #dbe4e1;

            border-radius: 8px;

            background: white;

            color: #64746f;

            font-family: inherit;

            font-size: 11px;

            font-weight: 600;

            cursor: pointer;

        }


        .secondary-button:hover {

            background: #f8faf9;

        }


        .primary-button {

            height: 40px;

            padding: 0 17px;

            border: none;

            border-radius: 8px;

            background: #087f68;

            color: white;

            font-family: inherit;

            font-size: 11px;

            font-weight: 600;

            cursor: pointer;

            transition: 0.2s;

        }


        .primary-button:hover {

            background: #066b58;

            transform: translateY(-1px);

        }


        /* =====================================================
           MT5 CONNECTION
        ===================================================== */

        .connection-item {

            display: flex;

            justify-content: space-between;

            align-items: center;

            padding: 15px 0;

            border-bottom:
                1px solid
                #f1f5f9;

        }


        .connection-item:last-child {

            border-bottom: none;

        }


        .connection-left {

            display: flex;

            align-items: center;

            gap: 12px;

        }


        .connection-icon {

            width: 39px;

            height: 39px;

            border-radius: 9px;

            background: #edf8f5;

            color: #087f68;

            display: flex;

            align-items: center;

            justify-content: center;

            font-size: 15px;

        }


        .connection-name {

            font-size: 12px;

            font-weight: 600;

            color: #334155;

        }


        .connection-detail {

            margin-top: 3px;

            font-size: 10px;

            color: #94a3b8;

        }


        .connected-badge {

            padding: 5px 9px;

            border-radius: 20px;

            background: #edf8f5;

            color: #087f68;

            font-size: 9px;

            font-weight: 600;

        }


        /* =====================================================
           PREFERENCES
        ===================================================== */

        .preference-row {

            display: flex;

            justify-content: space-between;

            align-items: center;

            padding: 14px 0;

            border-bottom:
                1px solid
                #f1f5f9;

        }


        .preference-row:last-child {

            border-bottom: none;

        }


        .preference-name {

            font-size: 12px;

            font-weight: 600;

            color: #334155;

        }


        .preference-description {

            margin-top: 3px;

            font-size: 10px;

            color: #94a3b8;

        }


        .preference-select {

            min-width: 135px;

            height: 36px;

            padding: 0 10px;

            border:
                1px solid
                #dbe4e1;

            border-radius: 7px;

            background: white;

            color: #475569;

            font-family: inherit;

            font-size: 11px;

            outline: none;

        }


        .preference-select:focus {

            border-color: #087f68;

        }


        /* =====================================================
           DANGER ZONE
        ===================================================== */

        .danger-card {

            border:
                1px solid
                #f1d7d7;

        }


        .danger-header {

            display: flex;

            align-items: center;

            gap: 10px;

            margin-bottom: 13px;

        }


        .danger-icon {

            width: 34px;

            height: 34px;

            border-radius: 8px;

            background: #fff1f2;

            color: #dc2626;

            display: flex;

            align-items: center;

            justify-content: center;

            font-size: 15px;

        }


        .danger-title {

            font-size: 14px;

            font-weight: 700;

            color: #334155;

        }


        .danger-description {

            font-size: 11px;

            line-height: 1.6;

            color: #8a9894;

            margin-bottom: 15px;

        }


        .logout-button {

            height: 39px;

            padding: 0 14px;

            border:
                1px solid
                #f0caca;

            border-radius: 8px;

            background: #fffafa;

            color: #dc2626;

            font-family: inherit;

            font-size: 11px;

            font-weight: 600;

            cursor: pointer;

        }


        .logout-button:hover {

            background: #fff1f2;

        }


        /* =====================================================
           SIDEBAR
        ===================================================== */

        .logo {

            font-size: 17px !important;

        }


        .menu-item {

            font-size: 14px !important;

            padding: 11px 12px;

        }


        .menu-title {

            font-size: 12px !important;

        }


        .logout a {

            font-size: 14px !important;

        }


        /* =====================================================
           TOPBAR
        ===================================================== */

        .welcome {

            font-size: 13px;

        }


        .topbar h1 {

            font-size: 24px;

        }


        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1050px) {

            .profile-grid {

                grid-template-columns: 1fr;

            }

        }


        @media (max-width: 700px) {

            .profile-page {

                padding:
                    22px
                    16px
                    30px;

            }


            .form-grid {

                grid-template-columns: 1fr;

            }


            .form-group.full {

                grid-column: auto;

            }


            .form-actions {

                flex-direction: column;

            }


            .secondary-button,
            .primary-button {

                width: 100%;

            }


            .preference-row {

                align-items: flex-start;

                gap: 12px;

                flex-direction: column;

            }


            .preference-select {

                width: 100%;

            }

        }


    </style>

</head>


<body>


<!-- =========================================================
     SIDEBAR
========================================================= -->

<aside class="sidebar">


    <div class="logo">

        <i>⌁</i>

        TradeAnalytics

    </div>


    <a
        href="dashboard.php"
        class="menu-item"
    >

        <span>▦</span>

        Dashboard

    </a>


    <a
        href="trade-history.php"
        class="menu-item"
    >

        <span>◷</span>

        ประวัติการเทรด

    </a>


    <a
        href="statistics.php"
        class="menu-item"
    >

        <span>▥</span>

        สถิติการเทรด

    </a>


    <a
        href="reports.php"
        class="menu-item"
    >

        <span>▤</span>

        รายงาน

    </a>


    <div class="menu-title">

        การตั้งค่า

    </div>


    <a
        href="notifications.php"
        class="menu-item"
    >

        <span>◉</span>

        การแจ้งเตือน

    </a>


    <a
        href="profile.php"
        class="menu-item active"
    >

        <span>♙</span>

        บัญชีผู้ใช้งาน

    </a>


    <div class="logout">

        <a
            href="#"
            onclick="logout()"
        >

            <span>↪</span>

            ออกจากระบบ

        </a>

    </div>


</aside>



<!-- =========================================================
     MAIN
========================================================= -->

<main class="main-content">


    <!-- =====================================================
         TOPBAR
    ====================================================== -->

    <header class="topbar">


        <div>

            <div class="welcome">

                ยินดีต้อนรับ, ผู้ใช้งาน

            </div>


            <h1>

                บัญชีผู้ใช้งาน

            </h1>

        </div>


        <div class="topbar-right">


            <div class="status-badge">

                <span class="status-dot"></span>

                MT5 Connected

            </div>


            <div class="status-badge">

                <span class="status-dot"></span>

                Telegram Active

            </div>


            <button
                class="icon-button"
                title="การแจ้งเตือน"
            >

                ♧

            </button>


            <div class="avatar">

                U

            </div>


        </div>


    </header>



    <!-- =====================================================
         CONTENT
    ====================================================== -->

    <div class="content profile-page">


        <!-- =================================================
             PAGE HEADER
        ================================================= -->

        <div class="profile-header">


            <h2>

                ตั้งค่าบัญชีผู้ใช้งาน

            </h2>


            <p>

                จัดการข้อมูลส่วนตัว ความปลอดภัย และการตั้งค่าของบัญชี

            </p>


        </div>



        <!-- =================================================
             PROFILE GRID
        ================================================= -->

        <div class="profile-grid">


            <!-- =================================================
                 LEFT COLUMN
            ================================================= -->

            <div>


                <!-- PROFILE SUMMARY -->

                <div class="profile-card profile-summary">


                    <div class="profile-avatar-large">

                        U

                    </div>


                    <div class="profile-name">

                        ผู้ใช้งาน

                    </div>


                    <div class="profile-email">

                        user@example.com

                    </div>


                    <div class="account-badge">

                        <span class="account-dot"></span>

                        บัญชีใช้งานอยู่

                    </div>



                    <div class="account-info">


                        <div class="info-row">


                            <span class="info-label">

                                Username

                            </span>


                            <span class="info-value">

                                user01

                            </span>


                        </div>


                        <div class="info-row">


                            <span class="info-label">

                                Account ID

                            </span>


                            <span class="info-value">

                                TA-000142

                            </span>


                        </div>


                        <div class="info-row">


                            <span class="info-label">

                                วันที่สมัคร

                            </span>


                            <span class="info-value">

                                15/08/2026

                            </span>


                        </div>


                        <div class="info-row">


                            <span class="info-label">

                                สถานะ

                            </span>


                            <span class="info-value">

                                Active

                            </span>


                        </div>


                    </div>


                </div>



                <!-- CONNECTION -->

                <div class="profile-card">


                    <div class="card-header">


                        <div>

                            <h3>

                                การเชื่อมต่อ

                            </h3>


                            <p>

                                สถานะบริการที่เชื่อมต่อกับระบบ

                            </p>

                        </div>


                    </div>



                    <div class="connection-item">


                        <div class="connection-left">


                            <div class="connection-icon">

                                M

                            </div>


                            <div>

                                <div class="connection-name">

                                    MetaTrader 5

                                </div>


                                <div class="connection-detail">

                                    MT5 Account · 12345678

                                </div>

                            </div>


                        </div>


                        <span class="connected-badge">

                            Connected

                        </span>


                    </div>



                    <div class="connection-item">


                        <div class="connection-left">


                            <div class="connection-icon">

                                T

                            </div>


                            <div>

                                <div class="connection-name">

                                    Telegram

                                </div>


                                <div class="connection-detail">

                                    Chat ID · 123456789

                                </div>

                            </div>


                        </div>


                        <span class="connected-badge">

                            Connected

                        </span>


                    </div>


                </div>


            </div>



            <!-- =================================================
                 RIGHT COLUMN
            ================================================= -->

            <div>


                <!-- PERSONAL INFORMATION -->

                <div class="profile-card">


                    <div class="card-header">


                        <div>

                            <h3>

                                ข้อมูลส่วนตัว

                            </h3>


                            <p>

                                แก้ไขข้อมูลพื้นฐานของบัญชีผู้ใช้งาน

                            </p>

                        </div>


                        <div class="header-icon">

                            ♙

                        </div>


                    </div>



                    <div class="form-grid">


                        <!-- NAME -->

                        <div class="form-group">


                            <label class="form-label">

                                ชื่อ

                            </label>


                            <input
                                type="text"
                                class="form-input"
                                id="firstName"
                                value="ผู้ใช้งาน"
                            >

                        </div>



                        <!-- USERNAME -->

                        <div class="form-group">


                            <label class="form-label">

                                Username

                            </label>


                            <input
                                type="text"
                                class="form-input"
                                value="user01"
                                disabled
                            >


                            <span class="form-hint">

                                Username ไม่สามารถเปลี่ยนได้

                            </span>

                        </div>



                        <!-- EMAIL -->

                        <div class="form-group full">


                            <label class="form-label">

                                Email

                            </label>


                            <input
                                type="email"
                                class="form-input"
                                id="email"
                                value="user@example.com"
                            >

                        </div>


                    </div>



                    <div class="form-actions">


                        <button
                            class="secondary-button"
                            onclick="resetProfile()"
                        >

                            ยกเลิก

                        </button>


                        <button
                            class="primary-button"
                            onclick="saveProfile()"
                        >

                            บันทึกข้อมูล

                        </button>


                    </div>


                </div>



                <!-- PASSWORD -->

                <div class="profile-card">


                    <div class="card-header">


                        <div>

                            <h3>

                                เปลี่ยนรหัสผ่าน

                            </h3>


                            <p>

                                แนะนำให้ใช้รหัสผ่านที่คาดเดาได้ยากและไม่ซ้ำกับบริการอื่น

                            </p>

                        </div>


                        <div class="header-icon">

                            🔒

                        </div>


                    </div>



                    <div class="form-grid">


                        <!-- OLD PASSWORD -->

                        <div class="form-group full">


                            <label class="form-label">

                                รหัสผ่านปัจจุบัน

                            </label>


                            <div class="password-wrapper">


                                <input
                                    type="password"
                                    class="form-input"
                                    id="currentPassword"
                                    placeholder="กรอกรหัสผ่านปัจจุบัน"
                                >


                                <button
                                    type="button"
                                    class="password-toggle"
                                    onclick="togglePassword('currentPassword', this)"
                                >

                                    ◉

                                </button>


                            </div>


                        </div>



                        <!-- NEW PASSWORD -->

                        <div class="form-group">


                            <label class="form-label">

                                รหัสผ่านใหม่

                            </label>


                            <div class="password-wrapper">


                                <input
                                    type="password"
                                    class="form-input"
                                    id="newPassword"
                                    placeholder="รหัสผ่านใหม่"
                                >


                                <button
                                    type="button"
                                    class="password-toggle"
                                    onclick="togglePassword('newPassword', this)"
                                >

                                    ◉

                                </button>


                            </div>

                        </div>



                        <!-- CONFIRM PASSWORD -->

                        <div class="form-group">


                            <label class="form-label">

                                ยืนยันรหัสผ่านใหม่

                            </label>


                            <div class="password-wrapper">


                                <input
                                    type="password"
                                    class="form-input"
                                    id="confirmPassword"
                                    placeholder="ยืนยันรหัสผ่าน"
                                >


                                <button
                                    type="button"
                                    class="password-toggle"
                                    onclick="togglePassword('confirmPassword', this)"
                                >

                                    ◉

                                </button>


                            </div>

                        </div>


                    </div>



                    <div class="form-actions">


                        <button
                            class="primary-button"
                            onclick="changePassword()"
                        >

                            เปลี่ยนรหัสผ่าน

                        </button>


                    </div>


                </div>



                <!-- PREFERENCES -->

                <div class="profile-card">


                    <div class="card-header">


                        <div>

                            <h3>

                                การตั้งค่าระบบ

                            </h3>


                            <p>

                                ตั้งค่าการแสดงผลและรูปแบบข้อมูลของระบบ

                            </p>

                        </div>


                        <div class="header-icon">

                            ⚙

                        </div>


                    </div>



                    <!-- TIMEZONE -->

                    <div class="preference-row">


                        <div>

                            <div class="preference-name">

                                Timezone

                            </div>


                            <div class="preference-description">

                                เขตเวลาที่ใช้แสดงวันที่และเวลา

                            </div>

                        </div>


                        <select class="preference-select">

                            <option selected>

                                Asia/Bangkok

                            </option>

                            <option>

                                Asia/Tokyo

                            </option>

                            <option>

                                UTC

                            </option>

                        </select>


                    </div>



                    <!-- CURRENCY -->

                    <div class="preference-row">


                        <div>

                            <div class="preference-name">

                                สกุลเงิน

                            </div>


                            <div class="preference-description">

                                สกุลเงินที่ใช้แสดงกำไรและขาดทุน

                            </div>

                        </div>


                        <select class="preference-select">

                            <option selected>

                                USD ($)

                            </option>

                            <option>

                                THB (฿)

                            </option>

                            <option>

                                EUR (€)

                            </option>

                        </select>


                    </div>



                    <!-- LANGUAGE -->

                    <div class="preference-row">


                        <div>

                            <div class="preference-name">

                                ภาษา

                            </div>


                            <div class="preference-description">

                                ภาษาที่ใช้ในหน้าเว็บไซต์

                            </div>

                        </div>


                        <select class="preference-select">

                            <option selected>

                                ภาษาไทย

                            </option>

                            <option>

                                English

                            </option>

                        </select>


                    </div>


                </div>



                <!-- DANGER ZONE -->

                <div class="profile-card danger-card">


                    <div class="danger-header">


                        <div class="danger-icon">

                            !

                        </div>


                        <div class="danger-title">

                            ออกจากระบบ

                        </div>


                    </div>


                    <div class="danger-description">

                        เมื่อออกจากระบบ คุณจะต้องเข้าสู่ระบบใหม่อีกครั้งเพื่อใช้งาน TradeAnalytics

                    </div>


                    <button
                        class="logout-button"
                        onclick="logout()"
                    >

                        ↪ ออกจากระบบ

                    </button>


                </div>


            </div>


        </div>


    </div>


</main>



<!-- =========================================================
     JAVASCRIPT
========================================================= -->

<script>


    /* =====================================================
       SAVE PROFILE
    ===================================================== */

    function saveProfile() {

        const name =
            document
                .getElementById(
                    'firstName'
                )
                .value
                .trim();


        const email =
            document
                .getElementById(
                    'email'
                )
                .value
                .trim();


        if (!name) {

            alert(
                'กรุณากรอกชื่อ'
            );

            return;

        }


        if (!email) {

            alert(
                'กรุณากรอก Email'
            );

            return;

        }


        alert(
            'บันทึกข้อมูลบัญชีเรียบร้อยแล้ว ✓'
        );

    }



    /* =====================================================
       RESET PROFILE
    ===================================================== */

    function resetProfile() {

        document
            .getElementById(
                'firstName'
            )
            .value =
                'ผู้ใช้งาน';


        document
            .getElementById(
                'email'
            )
            .value =
                'user@example.com';

    }



    /* =====================================================
       TOGGLE PASSWORD
    ===================================================== */

    function togglePassword(
        inputId,
        button
    ) {

        const input =
            document
                .getElementById(
                    inputId
                );


        if (
            input.type ===
            'password'
        ) {

            input.type =
                'text';

            button.textContent =
                '◉';

        } else {

            input.type =
                'password';

            button.textContent =
                '◉';

        }

    }



    /* =====================================================
       CHANGE PASSWORD
    ===================================================== */

    function changePassword() {

        const current =
            document
                .getElementById(
                    'currentPassword'
                )
                .value;


        const newPassword =
            document
                .getElementById(
                    'newPassword'
                )
                .value;


        const confirm =
            document
                .getElementById(
                    'confirmPassword'
                )
                .value;


        if (!current) {

            alert(
                'กรุณากรอกรหัสผ่านปัจจุบัน'
            );

            return;

        }


        if (!newPassword) {

            alert(
                'กรุณากรอกรหัสผ่านใหม่'
            );

            return;

        }


        if (
            newPassword.length < 6
        ) {

            alert(
                'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'
            );

            return;

        }


        if (
            newPassword !==
            confirm
        ) {

            alert(
                'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน'
            );

            return;

        }


        alert(
            'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว ✓'
        );


        document
            .getElementById(
                'currentPassword'
            )
            .value = '';


        document
            .getElementById(
                'newPassword'
            )
            .value = '';


        document
            .getElementById(
                'confirmPassword'
            )
            .value = '';

    }



    /* =====================================================
       LOGOUT
    ===================================================== */

    function logout() {

        const confirmLogout =
            confirm(
                'คุณต้องการออกจากระบบใช่หรือไม่?'
            );


        if (
            confirmLogout
        ) {

            alert(
                'ออกจากระบบเรียบร้อยแล้ว'
            );

        }

    }


</script>


</body>

</html>