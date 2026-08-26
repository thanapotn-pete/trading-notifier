<!DOCTYPE html>
<html lang="th">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>TradeAnalytics - การแจ้งเตือน</title>

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
    <link rel="stylesheet" href="css/style.css">


    <style>

        /* =====================================================
           NOTIFICATION PAGE
        ===================================================== */

        body {
            font-family:
                'IBM Plex Sans Thai',
                'Noto Sans Thai',
                Arial,
                sans-serif;

            background: #f7f9f8;
        }


        /* =====================================================
           PAGE CONTENT
        ===================================================== */

        .notification-page {
            padding: 30px 28px 35px !important;
        }


        /* =====================================================
           PAGE INTRO
        ===================================================== */

        .notification-intro {
            display: flex;

            justify-content: space-between;

            align-items: flex-end;

            margin-bottom: 24px;

            padding: 2px 0;
        }


        .notification-intro h2 {
            margin: 0 0 8px;

            font-size: 23px !important;

            font-weight: 700;

            line-height: 1.3;

            color: #111917;

            letter-spacing: -0.4px;
        }


        .notification-intro p {
            margin: 0;

            font-size: 13px !important;

            line-height: 1.5;

            color: #7b8985;
        }


        /* =====================================================
           CONNECTION STATUS
        ===================================================== */

        .connection-status {
            display: flex;

            align-items: center;

            gap: 7px;

            padding: 9px 14px;

            border-radius: 20px;

            background: #edf8f5;

            color: #087f68;

            font-size: 12px !important;

            font-weight: 600;

            white-space: nowrap;
        }


        .connection-dot {
            width: 7px;

            height: 7px;

            border-radius: 50%;

            background: #14b87a;

            box-shadow:
                0 0 0 3px rgba(20, 184, 122, 0.08);
        }


        /* =====================================================
           TELEGRAM CONNECTION CARD
        ===================================================== */

        .telegram-card {
            background:
                linear-gradient(
                    135deg,
                    #087f68,
                    #0b9277
                );

            border-radius: 13px;

            padding: 24px 26px;

            color: white;

            display: flex;

            justify-content: space-between;

            align-items: center;

            margin-bottom: 22px;

            box-shadow:
                0 8px 24px
                rgba(8, 127, 104, 0.14);
        }


        .telegram-left {
            display: flex;

            align-items: center;

            gap: 16px;
        }


        .telegram-icon {
            width: 52px;

            height: 52px;

            border-radius: 13px;

            background:
                rgba(
                    255,
                    255,
                    255,
                    0.16
                );

            display: flex;

            align-items: center;

            justify-content: center;

            font-size: 24px;

            flex-shrink: 0;
        }


        .telegram-title {
            font-size: 17px !important;

            font-weight: 700;

            margin-bottom: 6px;

            line-height: 1.3;
        }


        .telegram-description {
            font-size: 12px !important;

            line-height: 1.5;

            color:
                rgba(
                    255,
                    255,
                    255,
                    0.82
                );
        }


        .telegram-button {
            border:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.35
                );

            background:
                rgba(
                    255,
                    255,
                    255,
                    0.12
                );

            color: white;

            border-radius: 8px;

            padding: 10px 16px;

            font-size: 12px !important;

            font-weight: 600;

            cursor: pointer;

            transition: 0.2s;
        }


        .telegram-button:hover {
            background:
                rgba(
                    255,
                    255,
                    255,
                    0.22
                );

            transform: translateY(-1px);
        }


        /* =====================================================
           MAIN GRID
        ===================================================== */

        .notification-grid {
            display: grid;

            grid-template-columns:
                minmax(0, 1.5fr)
                minmax(320px, 0.8fr);

            gap: 18px;
        }


        /* =====================================================
           CARD
        ===================================================== */

        .settings-card {
            background: #ffffff;

            border:
                1px solid
                #e5ebe9;

            border-radius: 12px;

            padding: 22px;

            margin-bottom: 18px;

            box-shadow:
                0 1px 3px
                rgba(15, 23, 42, 0.025);

            transition:
                box-shadow 0.2s ease,
                border-color 0.2s ease;
        }


        .settings-card:hover {
            border-color: #dce5e2;

            box-shadow:
                0 5px 18px
                rgba(15, 23, 42, 0.045);
        }


        .settings-card:last-child {
            margin-bottom: 0;
        }


        /* =====================================================
           SETTINGS HEADER
        ===================================================== */

        .settings-header {
            display: flex;

            justify-content: space-between;

            align-items: flex-start;

            padding-bottom: 17px;

            border-bottom:
                1px solid
                #eef2f1;

            margin-bottom: 4px;
        }


        .settings-title {
            margin: 0;

            font-size: 16px !important;

            font-weight: 700;

            line-height: 1.4;

            color: #111917;
        }


        .settings-description {
            margin: 6px 0 0;

            font-size: 12px !important;

            line-height: 1.5;

            color: #8a9894;
        }


        /* =====================================================
           MASTER SWITCH
        ===================================================== */

        .master-status {
            display: flex;

            align-items: center;

            gap: 9px;
        }


        .master-label {
            font-size: 12px !important;

            color: #087f68;

            font-weight: 600;
        }


        .switch {
            position: relative;

            width: 44px;

            height: 24px;

            display: inline-block;

            flex-shrink: 0;
        }


        .switch input {
            opacity: 0;

            width: 0;

            height: 0;
        }


        .slider {
            position: absolute;

            inset: 0;

            cursor: pointer;

            background: #cbd5e1;

            border-radius: 20px;

            transition: 0.25s;
        }


        .slider:before {
            content: "";

            position: absolute;

            width: 18px;

            height: 18px;

            left: 3px;

            top: 3px;

            background: white;

            border-radius: 50%;

            transition: 0.25s;

            box-shadow:
                0 1px 3px
                rgba(0, 0, 0, 0.15);
        }


        .switch input:checked + .slider {
            background: #087f68;
        }


        .switch input:checked + .slider:before {
            transform: translateX(20px);
        }


        .switch input:disabled + .slider {
            cursor: not-allowed;

            opacity: 0.65;
        }


        /* =====================================================
           NOTIFICATION OPTION
        ===================================================== */

        .notification-option {
            display: flex;

            justify-content: space-between;

            align-items: center;

            padding: 17px 2px;

            border-bottom:
                1px solid
                #f1f5f9;
        }


        .notification-option:last-child {
            border-bottom: none;
        }


        .option-left {
            display: flex;

            align-items: center;

            gap: 14px;
        }


        .option-icon {
            width: 40px;

            height: 40px;

            border-radius: 10px;

            background: #eef8f5;

            color: #087f68;

            display: flex;

            align-items: center;

            justify-content: center;

            font-size: 16px !important;

            flex-shrink: 0;
        }


        .option-icon.orange {
            background: #fff7ed;

            color: #ea580c;
        }


        .option-icon.red {
            background: #fff1f2;

            color: #dc2626;
        }


        .option-icon.blue {
            background: #eff6ff;

            color: #2563eb;
        }


        .option-name {
            font-size: 14px !important;

            font-weight: 600;

            line-height: 1.4;

            color: #1f2937;
        }


        .option-description {
            margin-top: 4px;

            font-size: 11px !important;

            line-height: 1.5;

            color: #8a9894;
        }


        /* =====================================================
           CHAT ID
        ===================================================== */

        .input-group {
            margin-top: 18px;
        }


        .input-label {
            display: block;

            margin-bottom: 8px;

            font-size: 12px !important;

            color: #64746f;

            font-weight: 600;
        }


        .input-row {
            display: flex;

            gap: 8px;
        }


        .text-input {
            flex: 1;

            height: 42px;

            border:
                1px solid
                #dbe4e1;

            border-radius: 8px;

            padding: 0 13px;

            color: #334155;

            font-size: 13px !important;

            outline: none;

            transition:
                border-color 0.2s ease,
                box-shadow 0.2s ease;
        }


        .text-input::placeholder {
            color: #a4afac;
        }


        .text-input:focus {
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


        .save-button {
            height: 42px;

            padding: 0 18px;

            border: none;

            border-radius: 8px;

            background: #087f68;

            color: white;

            font-size: 12px !important;

            font-weight: 600;

            cursor: pointer;

            transition: 0.2s;
        }


        .save-button:hover {
            background: #066b58;

            transform: translateY(-1px);
        }


        /* =====================================================
           TEST TELEGRAM
        ===================================================== */

        .test-box {
            margin-top: 18px;

            padding: 15px;

            border-radius: 9px;

            background: #f8faf9;

            border:
                1px solid
                #edf2f0;
        }


        .test-box-title {
            font-size: 12px !important;

            color: #334155;

            font-weight: 600;

            margin-bottom: 5px;
        }


        .test-box-description {
            font-size: 11px !important;

            line-height: 1.5;

            color: #8a9894;

            margin-bottom: 11px;
        }


        .test-button {
            border:
                1px solid
                #cfe5df;

            background: white;

            color: #087f68;

            border-radius: 7px;

            padding: 8px 13px;

            font-size: 11px !important;

            font-weight: 600;

            cursor: pointer;

            transition: 0.2s;
        }


        .test-button:hover {
            background: #edf8f5;

            border-color: #b8dcd2;
        }


        /* =====================================================
           RECENT NOTIFICATIONS
        ===================================================== */

        .recent-item {
            display: flex;

            gap: 13px;

            padding: 15px 0;

            border-bottom:
                1px solid
                #f1f5f9;
        }


        .recent-item:last-child {
            border-bottom: none;
        }


        .recent-icon {
            width: 36px;

            height: 36px;

            border-radius: 9px;

            background: #edf8f5;

            color: #087f68;

            display: flex;

            align-items: center;

            justify-content: center;

            flex-shrink: 0;

            font-size: 14px !important;
        }


        .recent-icon.loss {
            background: #fff1f2;

            color: #dc2626;
        }


        .recent-icon.warning {
            background: #fff7ed;

            color: #ea580c;
        }


        .recent-name {
            font-size: 12px !important;

            font-weight: 600;

            line-height: 1.4;

            color: #334155;
        }


        .recent-message {
            margin-top: 4px;

            font-size: 11px !important;

            line-height: 1.5;

            color: #8a9894;
        }


        .recent-time {
            margin-top: 5px;

            font-size: 10px !important;

            color: #a4afac;
        }


        /* =====================================================
           TELEGRAM PREVIEW
        ===================================================== */

        .telegram-preview {
            background: #f5f7f8;

            border-radius: 10px;

            padding: 15px;

            margin-top: 15px;
        }


        .preview-header {
            display: flex;

            align-items: center;

            gap: 8px;

            margin-bottom: 10px;
        }


        .preview-avatar {
            width: 30px;

            height: 30px;

            border-radius: 50%;

            background: #087f68;

            color: white;

            display: flex;

            justify-content: center;

            align-items: center;

            font-size: 11px;

            font-weight: 700;
        }


        .preview-name {
            font-size: 11px !important;

            font-weight: 600;

            color: #334155;
        }


        .telegram-message {
            background: white;

            border-radius: 9px;

            padding: 14px;

            font-size: 11px !important;

            line-height: 1.8;

            color: #334155;

            border:
                1px solid
                #e9eeee;
        }


        .message-profit {
            color: #087f68;

            font-weight: 700;
        }


        .message-loss {
            color: #dc2626;

            font-weight: 700;
        }


        /* =====================================================
           SIDEBAR TEXT
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

            .notification-page {
                padding:
                    25px
                    22px
                    30px !important;
            }


            .notification-grid {
                grid-template-columns: 1fr;
            }

        }


        @media (max-width: 700px) {

            .notification-page {
                padding:
                    22px
                    16px
                    25px !important;
            }


            .notification-intro {
                flex-direction: column;

                align-items: flex-start;

                gap: 12px;
            }


            .notification-intro h2 {
                font-size: 21px !important;
            }


            .notification-intro p {
                font-size: 12px !important;
            }


            .telegram-card {
                flex-direction: column;

                align-items: flex-start;

                gap: 15px;

                padding: 20px;
            }


            .telegram-button {
                width: 100%;
            }


            .settings-card {
                padding: 18px;
            }


            .option-name {
                font-size: 13px !important;
            }


            .option-description {
                font-size: 10px !important;
            }


            .input-row {
                flex-direction: column;
            }


            .save-button {
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
        class="menu-item active"
    >

        <span>◉</span>

        การแจ้งเตือน

    </a>


    <a
        href="profile.php"
        class="menu-item"
    >

        <span>♙</span>

        บัญชีผู้ใช้งาน

    </a>


    <div class="logout">

        <a href="#">

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
                การแจ้งเตือน
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


            <button class="icon-button">
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

    <div class="content notification-page">


        <!-- =================================================
             PAGE INTRO
        ================================================= -->

        <div class="notification-intro">


            <div>

                <h2>
                    ตั้งค่าการแจ้งเตือน
                </h2>

                <p>
                    จัดการรูปแบบการแจ้งเตือนและการเชื่อมต่อ Telegram
                </p>

            </div>


            <div class="connection-status">

                <span class="connection-dot"></span>

                Telegram เชื่อมต่อแล้ว

            </div>


        </div>



        <!-- =================================================
             TELEGRAM CONNECTION
        ================================================= -->

        <div class="telegram-card">


            <div class="telegram-left">


                <div class="telegram-icon">
                    ✈
                </div>


                <div>

                    <div class="telegram-title">
                        Telegram Notification
                    </div>

                    <div class="telegram-description">
                        รับการแจ้งเตือนการเทรดแบบเรียลไทม์ผ่าน Telegram
                    </div>

                </div>


            </div>


            <button
                class="telegram-button"
                onclick="testTelegram()"
            >

                ทดสอบการเชื่อมต่อ

            </button>


        </div>



        <!-- =================================================
             GRID
        ================================================== -->

        <div class="notification-grid">


            <!-- =================================================
                 LEFT COLUMN
            ================================================= -->

            <div>


                <!-- =================================================
                     EVENT SETTINGS
                ================================================= -->

                <div class="settings-card">


                    <div class="settings-header">


                        <div>

                            <h3 class="settings-title">
                                ประเภทการแจ้งเตือน
                            </h3>

                            <p class="settings-description">
                                เลือกเหตุการณ์ที่ต้องการให้ระบบส่งข้อความแจ้งเตือน
                            </p>

                        </div>


                        <div class="master-status">

                            <span
                                class="master-label"
                                id="masterLabel"
                            >
                                เปิดใช้งาน
                            </span>


                            <label class="switch">

                                <input
                                    type="checkbox"
                                    id="masterSwitch"
                                    checked
                                    onchange="toggleAllNotifications()"
                                >

                                <span class="slider"></span>

                            </label>

                        </div>


                    </div>



                    <!-- OPEN ORDER -->

                    <div class="notification-option">


                        <div class="option-left">


                            <div class="option-icon">
                                ↑
                            </div>


                            <div>

                                <div class="option-name">
                                    เปิดออเดอร์
                                </div>

                                <div class="option-description">
                                    แจ้งเตือนเมื่อมีการเปิดคำสั่งซื้อใหม่
                                </div>

                            </div>


                        </div>


                        <label class="switch">

                            <input
                                type="checkbox"
                                class="notification-switch"
                                checked
                            >

                            <span class="slider"></span>

                        </label>


                    </div>



                    <!-- CLOSE ORDER -->

                    <div class="notification-option">


                        <div class="option-left">


                            <div class="option-icon blue">
                                ↓
                            </div>


                            <div>

                                <div class="option-name">
                                    ปิดออเดอร์
                                </div>

                                <div class="option-description">
                                    แจ้งเตือนเมื่อปิดออเดอร์และสรุปกำไรขาดทุน
                                </div>

                            </div>


                        </div>


                        <label class="switch">

                            <input
                                type="checkbox"
                                class="notification-switch"
                                checked
                            >

                            <span class="slider"></span>

                        </label>


                    </div>



                    <!-- TP SL -->

                    <div class="notification-option">


                        <div class="option-left">


                            <div class="option-icon">
                                ◎
                            </div>


                            <div>

                                <div class="option-name">
                                    TP / SL
                                </div>

                                <div class="option-description">
                                    แจ้งเตือนเมื่อ Take Profit หรือ Stop Loss ถูก Trigger
                                </div>

                            </div>


                        </div>


                        <label class="switch">

                            <input
                                type="checkbox"
                                class="notification-switch"
                                checked
                            >

                            <span class="slider"></span>

                        </label>


                    </div>



                    <!-- RISK ALERT -->

                    <div class="notification-option">


                        <div class="option-left">


                            <div class="option-icon orange">
                                !
                            </div>


                            <div>

                                <div class="option-name">
                                    Risk Alert
                                </div>

                                <div class="option-description">
                                    แจ้งเตือนเมื่อความเสี่ยงหรือ Drawdown สูงกว่าที่กำหนด
                                </div>

                            </div>


                        </div>


                        <label class="switch">

                            <input
                                type="checkbox"
                                class="notification-switch"
                                checked
                            >

                            <span class="slider"></span>

                        </label>


                    </div>



                    <!-- DAILY SUMMARY -->

                    <div class="notification-option">


                        <div class="option-left">


                            <div class="option-icon blue">
                                ▣
                            </div>


                            <div>

                                <div class="option-name">
                                    Daily Summary
                                </div>

                                <div class="option-description">
                                    ส่งสรุปผลการเทรดประจำวัน
                                </div>

                            </div>


                        </div>


                        <label class="switch">

                            <input
                                type="checkbox"
                                class="notification-switch"
                                checked
                            >

                            <span class="slider"></span>

                        </label>


                    </div>



                    <!-- WEEKLY SUMMARY -->

                    <div class="notification-option">


                        <div class="option-left">


                            <div class="option-icon">
                                ▣
                            </div>


                            <div>

                                <div class="option-name">
                                    Weekly Summary
                                </div>

                                <div class="option-description">
                                    ส่งสรุปผลการเทรดประจำสัปดาห์
                                </div>

                            </div>


                        </div>


                        <label class="switch">

                            <input
                                type="checkbox"
                                class="notification-switch"
                            >

                            <span class="slider"></span>

                        </label>


                    </div>


                </div>



                <!-- =================================================
                     CHAT ID
                ================================================== -->

                <div class="settings-card">


                    <div class="settings-header">

                        <div>

                            <h3 class="settings-title">
                                Telegram Chat ID
                            </h3>

                            <p class="settings-description">
                                กำหนด Chat ID สำหรับรับการแจ้งเตือนจากระบบ
                            </p>

                        </div>

                    </div>


                    <div class="input-group">


                        <label class="input-label">
                            Chat ID
                        </label>


                        <div class="input-row">


                            <input
                                type="text"
                                class="text-input"
                                id="chatId"
                                value="123456789"
                                placeholder="กรอก Telegram Chat ID"
                            >


                            <button
                                class="save-button"
                                onclick="saveChatId()"
                            >
                                บันทึก
                            </button>


                        </div>


                    </div>


                    <div class="test-box">


                        <div class="test-box-title">
                            ทดสอบการแจ้งเตือน
                        </div>


                        <div class="test-box-description">
                            ระบบจะส่งข้อความตัวอย่างไปยัง Telegram Chat ID ที่กำหนด
                        </div>


                        <button
                            class="test-button"
                            onclick="sendTestMessage()"
                        >
                            ส่งข้อความทดสอบ
                        </button>


                    </div>


                </div>


            </div>



            <!-- =================================================
                 RIGHT COLUMN
            ================================================== -->

            <div>


                <!-- =================================================
                     RECENT NOTIFICATIONS
                ================================================== -->

                <div class="settings-card">


                    <div class="settings-header">

                        <div>

                            <h3 class="settings-title">
                                การแจ้งเตือนล่าสุด
                            </h3>

                            <p class="settings-description">
                                รายการแจ้งเตือนที่ระบบส่งล่าสุด
                            </p>

                        </div>

                    </div>



                    <!-- ITEM -->

                    <div class="recent-item">


                        <div class="recent-icon">
                            ↑
                        </div>


                        <div>

                            <div class="recent-name">
                                เปิดออเดอร์ EURUSD
                            </div>

                            <div class="recent-message">
                                Buy · 0.10 lot · Price 1.08520
                            </div>

                            <div class="recent-time">
                                วันนี้ 09:42
                            </div>

                        </div>


                    </div>



                    <!-- ITEM -->

                    <div class="recent-item">


                        <div class="recent-icon">
                            ✓
                        </div>


                        <div>

                            <div class="recent-name">
                                Take Profit Hit
                            </div>

                            <div class="recent-message">
                                EURUSD · Profit +$48.20
                            </div>

                            <div class="recent-time">
                                วันนี้ 09:40
                            </div>

                        </div>


                    </div>



                    <!-- ITEM -->

                    <div class="recent-item">


                        <div class="recent-icon loss">
                            ↓
                        </div>


                        <div>

                            <div class="recent-name">
                                Stop Loss Hit
                            </div>

                            <div class="recent-message">
                                GBPUSD · Loss -$12.50
                            </div>

                            <div class="recent-time">
                                วันนี้ 08:35
                            </div>

                        </div>


                    </div>



                    <!-- ITEM -->

                    <div class="recent-item">


                        <div class="recent-icon warning">
                            !
                        </div>


                        <div>

                            <div class="recent-name">
                                Risk Alert
                            </div>

                            <div class="recent-message">
                                Drawdown สูงถึง 8.2%
                            </div>

                            <div class="recent-time">
                                เมื่อวาน 16:21
                            </div>

                        </div>


                    </div>


                </div>



                <!-- =================================================
                     TELEGRAM PREVIEW
                ================================================== -->

                <div class="settings-card">


                    <div class="settings-header">

                        <div>

                            <h3 class="settings-title">
                                ตัวอย่างข้อความ
                            </h3>

                            <p class="settings-description">
                                ตัวอย่างการแจ้งเตือนที่จะส่งไปยัง Telegram
                            </p>

                        </div>

                    </div>



                    <div class="telegram-preview">


                        <div class="preview-header">


                            <div class="preview-avatar">
                                TA
                            </div>


                            <div class="preview-name">
                                TradeAnalytics Bot
                            </div>


                        </div>


                        <div class="telegram-message">

                            📈
                            <strong>เปิดออเดอร์</strong>

                            <br>

                            Symbol:
                            <strong>EURUSD</strong>

                            <br>

                            Action:
                            <strong>BUY</strong>

                            <br>

                            Lot:
                            0.10

                            <br>

                            Price:
                            1.08520

                            <br>

                            TP:
                            1.09000

                            <br>

                            SL:
                            1.08000

                            <br><br>

                            Status:
                            <span class="message-profit">
                                MT5 Connected
                            </span>

                        </div>


                    </div>


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
       MASTER SWITCH
    ===================================================== */

    function toggleAllNotifications() {

        const master =
            document.getElementById(
                'masterSwitch'
            );


        const switches =
            document.querySelectorAll(
                '.notification-switch'
            );


        switches.forEach(
            function (item) {

                item.checked =
                    master.checked;

                item.disabled =
                    !master.checked;

            }
        );


        const label =
            document.getElementById(
                'masterLabel'
            );


        if (master.checked) {

            label.textContent =
                'เปิดใช้งาน';

        } else {

            label.textContent =
                'ปิดใช้งาน';

        }

    }



    /* =====================================================
       SAVE CHAT ID
    ===================================================== */

    function saveChatId() {

        const chatId =
            document.getElementById(
                'chatId'
            ).value.trim();


        if (!chatId) {

            alert(
                'กรุณากรอก Telegram Chat ID'
            );

            return;

        }


        alert(
            'บันทึก Telegram Chat ID เรียบร้อยแล้ว'
        );

    }



    /* =====================================================
       TEST TELEGRAM
    ===================================================== */

    function testTelegram() {

        alert(
            'Telegram เชื่อมต่อเรียบร้อยแล้ว ✓'
        );

    }



    /* =====================================================
       SEND TEST MESSAGE
    ===================================================== */

    function sendTestMessage() {

        const chatId =
            document.getElementById(
                'chatId'
            ).value.trim();


        if (!chatId) {

            alert(
                'กรุณากรอก Telegram Chat ID ก่อน'
            );

            return;

        }


        alert(
            'ส่งข้อความทดสอบไปยัง Telegram แล้ว ✓'
        );

    }



    /* =====================================================
       INITIAL STATE
    ===================================================== */

    toggleAllNotifications();


</script>


</body>

</html>