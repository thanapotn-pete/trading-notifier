<!DOCTYPE html>
<html lang="th">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>TradeAnalytics - Dashboard</title>


    <!-- ================= GOOGLE FONT ================= -->

    <link rel="preconnect" href="https://fonts.googleapis.com">

    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
    >


    <!-- ================= BOOTSTRAP 5 ================= -->

    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
    >


    <!-- ================= BOOTSTRAP ICONS ================= -->

    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
    >


    <!-- ================= CSS ของเรา ================= -->

    <link rel="stylesheet" href="css/style.css">


</head>


<body>

<div class="app">


    <!-- ================= SIDEBAR ================= -->

    <aside class="sidebar">


        <!-- LOGO -->

        <div class="logo">

            <i class="bi bi-graph-up-arrow"></i>

            <span>TradeAnalytics</span>

        </div>


        <!-- MENU -->

        <div class="menu-section">


            <!-- Dashboard -->

            <a href="dashboard.php" class="menu-item active">

                <i class="bi bi-grid"></i>

                <span>Dashboard</span>

            </a>


            <!-- Trade History -->

            <a href="trade-history.php" class="menu-item">

                <i class="bi bi-clock-history"></i>

                <span>ประวัติการเทรด</span>

            </a>


            <!-- Statistics -->

            <a href="statistics.php" class="menu-item">

                <i class="bi bi-bar-chart"></i>

                <span>สถิติการเทรด</span>

            </a>


            <!-- Reports -->

            <a href="reports.php" class="menu-item">

                <i class="bi bi-file-earmark-text"></i>

                <span>รายงาน</span>

            </a>


            <!-- Setting -->

            <div class="menu-title">
                การตั้งค่า
            </div>


            <!-- Notifications -->

            <a href="notifications.php" class="menu-item">

                <i class="bi bi-telegram"></i>

                <span>การแจ้งเตือน</span>

            </a>


            <!-- Profile -->

            <a href="profile.php" class="menu-item">

                <i class="bi bi-person"></i>

                <span>บัญชีผู้ใช้งาน</span>

            </a>


        </div>


        <!-- LOGOUT -->

        <div class="logout">

            <a href="#">

                <i class="bi bi-box-arrow-right"></i>

                <span>ออกจากระบบ</span>

            </a>

        </div>


    </aside>



    <!-- ================= MAIN ================= -->

    <main class="main-content">


        <!-- ================= TOPBAR ================= -->

        <header class="topbar">


            <div>

                <div class="welcome">
                    ยินดีต้อนรับ, ผู้ใช้งาน
                </div>


                <h1>
                    Dashboard
                </h1>

            </div>


            <!-- TOPBAR RIGHT -->

            <div class="topbar-right">


                <!-- MT5 STATUS -->

                <span class="status-badge">

                    <span class="status-dot"></span>

                    MT5 Connected

                </span>


                <!-- TELEGRAM STATUS -->

                <span class="status-badge">

                    <span class="status-dot"></span>

                    Telegram Active

                </span>


                <!-- NOTIFICATION -->

                <button
                    type="button"
                    class="icon-button"
                    aria-label="การแจ้งเตือน"
                >

                    <i class="bi bi-bell"></i>

                </button>


                <!-- AVATAR -->

                <div class="avatar">
                    U
                </div>


            </div>


        </header>



        <!-- ================= CONTENT ================= -->

        <section class="content">


            <!-- ===================================================== -->
            <!-- SUMMARY CARDS -->
            <!-- ===================================================== -->

            <div class="row g-3">


                <!-- ================= PROFIT ================= -->

                <div class="col-md-6 col-xl-3">

                    <div class="stat-card">

                        <div>

                            <div class="stat-title">
                                กำไรสุทธิ
                            </div>

                            <div class="stat-value profit">
                                +$2,430
                            </div>

                            <div class="stat-description">
                                ↑ 12.4% เดือนนี้
                            </div>

                        </div>


                        <div class="stat-icon">

                            <i class="bi bi-currency-dollar"></i>

                        </div>

                    </div>

                </div>



                <!-- ================= WIN RATE ================= -->

                <div class="col-md-6 col-xl-3">

                    <div class="stat-card">

                        <div>

                            <div class="stat-title">
                                WIN RATE
                            </div>

                            <div class="stat-value">
                                68.5%
                            </div>

                            <div class="stat-description">
                                จาก 200 ออเดอร์
                            </div>

                        </div>


                        <div class="stat-icon">

                            <i class="bi bi-trophy"></i>

                        </div>

                    </div>

                </div>



                <!-- ================= PROFIT FACTOR ================= -->

                <div class="col-md-6 col-xl-3">

                    <div class="stat-card">

                        <div>

                            <div class="stat-title">
                                PROFIT FACTOR
                            </div>

                            <div class="stat-value">
                                2.14
                            </div>

                            <div class="stat-description">
                                ดีกว่าค่าเฉลี่ย
                            </div>

                        </div>


                        <div class="stat-icon">

                            <i class="bi bi-graph-up"></i>

                        </div>

                    </div>

                </div>



                <!-- ================= RISK SCORE ================= -->

                <div class="col-md-6 col-xl-3">

                    <div class="stat-card">

                        <div>

                            <div class="stat-title">
                                RISK SCORE
                            </div>

                            <div class="stat-value risk">
                                MEDIUM
                            </div>

                            <div class="stat-description">
                                Max DD 8.2%
                            </div>

                        </div>


                        <div class="stat-icon">

                            <i class="bi bi-shield-check"></i>

                        </div>

                    </div>

                </div>


            </div>



            <!-- ===================================================== -->
            <!-- CHART + RECENT ORDERS -->
            <!-- ===================================================== -->

            <div class="row g-3 mt-1">


                <!-- ================= EQUITY CURVE ================= -->

                <div class="col-lg-8">

                    <div class="card-box">


                        <div class="card-header">

                            <h2>
                                Equity Curve
                            </h2>


                            <div class="period-buttons">

                                <button
                                    type="button"
                                    class="period active"
                                >
                                    1W
                                </button>


                                <button
                                    type="button"
                                    class="period"
                                >
                                    1M
                                </button>


                                <button
                                    type="button"
                                    class="period"
                                >
                                    3M
                                </button>

                            </div>


                        </div>


                        <div class="chart-area">

                            <canvas id="equityChart"></canvas>

                        </div>


                    </div>

                </div>



                <!-- ================= RECENT ORDERS ================= -->

                <div class="col-lg-4">

                    <div class="card-box">


                        <div class="card-header">

                            <h2>
                                ออเดอร์ล่าสุด
                            </h2>


                            <a href="trade-history.php">
                                ดูทั้งหมด →
                            </a>

                        </div>


                        <div class="trade-list">


                            <!-- EURUSD -->

                            <div class="trade-item">

                                <div>

                                    <strong>
                                        EURUSD
                                    </strong>

                                    <small>
                                        Buy · 0.10 lot · TP hit
                                    </small>

                                </div>


                                <strong class="profit">
                                    +$48.20
                                </strong>

                            </div>



                            <!-- GBPUSD -->

                            <div class="trade-item">

                                <div>

                                    <strong>
                                        GBPUSD
                                    </strong>

                                    <small>
                                        Sell · 0.05 lot · SL hit
                                    </small>

                                </div>


                                <strong class="loss">
                                    -$12.50
                                </strong>

                            </div>



                            <!-- XAUUSD -->

                            <div class="trade-item">

                                <div>

                                    <strong>
                                        XAUUSD
                                    </strong>

                                    <small>
                                        Buy · 0.02 lot · Manual
                                    </small>

                                </div>


                                <strong class="profit">
                                    +$31.00
                                </strong>

                            </div>



                            <!-- USDJPY -->

                            <div class="trade-item">

                                <div>

                                    <strong>
                                        USDJPY
                                    </strong>

                                    <small>
                                        Sell · 0.08 lot · TP hit
                                    </small>

                                </div>


                                <strong class="profit">
                                    +$22.40
                                </strong>

                            </div>


                        </div>


                    </div>

                </div>


            </div>



            <!-- ===================================================== -->
            <!-- TELEGRAM NOTIFICATION -->
            <!-- ===================================================== -->

            <div class="card-box mt-3">


                <div class="card-header">

                    <h2>
                        Telegram Notification
                    </h2>


                    <a href="notifications.php">

                        <i class="bi bi-telegram"></i>

                        เชื่อมต่อแล้ว

                    </a>

                </div>



                <div class="row g-3">


                    <!-- ================= OPEN ORDER ================= -->

                    <div class="col-md-4">

                        <div class="notification-card">

                            <i class="bi bi-arrow-up"></i>


                            <div>

                                <span>
                                    เปิดออเดอร์
                                </span>

                                <strong>
                                    เปิดใช้งาน
                                </strong>

                            </div>

                        </div>

                    </div>



                    <!-- ================= CLOSE ORDER ================= -->

                    <div class="col-md-4">

                        <div class="notification-card">

                            <i class="bi bi-arrow-down"></i>


                            <div>

                                <span>
                                    ปิดออเดอร์
                                </span>

                                <strong>
                                    เปิดใช้งาน
                                </strong>

                            </div>

                        </div>

                    </div>



                    <!-- ================= RISK ALERT ================= -->

                    <div class="col-md-4">

                        <div class="notification-card">

                            <i class="bi bi-exclamation-triangle"></i>


                            <div>

                                <span>
                                    Risk Alert
                                </span>

                                <strong>
                                    เปิดใช้งาน
                                </strong>

                            </div>

                        </div>

                    </div>


                </div>


            </div>


        </section>


    </main>


</div>



<!-- ================= CHART.JS ================= -->

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>




<script src="./js/script.js"></script>


</body>

</html>