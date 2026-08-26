<?php

/*
|--------------------------------------------------------------------------
| Statistics
|--------------------------------------------------------------------------
| ตอนนี้ใช้ Mock Data สำหรับทำ UI
| ภายหลังจะเปลี่ยนเป็นข้อมูลจริงจาก Supabase
|--------------------------------------------------------------------------
*/


/* ================= SUMMARY DATA ================= */

$totalTrades = 200;

$winRate = 68.5;

$profitFactor = 2.14;

$netProfit = 2430;

$winningTrades = 137;

$losingTrades = 63;


/* ================= SYMBOL DATA ================= */

$symbolStats = [

    [
        'symbol' => 'EURUSD',
        'trades' => 52,
        'winRate' => 72,
        'pnl' => 820
    ],

    [
        'symbol' => 'GBPUSD',
        'trades' => 38,
        'winRate' => 61,
        'pnl' => 340
    ],

    [
        'symbol' => 'XAUUSD',
        'trades' => 64,
        'winRate' => 75,
        'pnl' => 1120
    ],

    [
        'symbol' => 'USDJPY',
        'trades' => 46,
        'winRate' => 63,
        'pnl' => 150
    ]

];

?>

<!DOCTYPE html>

<html lang="th">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        TradeAnalytics - สถิติการเทรด
    </title>


    <!-- =====================================================
         GOOGLE FONT
    ====================================================== -->

    <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
    >

    <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossorigin
    >

    <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
    >


    <!-- =====================================================
         BOOTSTRAP
    ====================================================== -->

    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
    >


    <!-- =====================================================
         BOOTSTRAP ICONS
    ====================================================== -->

    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
    >


    <!-- =====================================================
         MAIN CSS
    ====================================================== -->

    <link
        rel="stylesheet"
        href="css/style.css"
    >


    <!-- =====================================================
         PAGE CSS
    ====================================================== -->

    <style>


        /* =====================================================
           PAGE DESCRIPTION
        ===================================================== */

        .page-description {

            color: #8a9793;

            font-size: 12px;

            margin-top: 4px;

        }


        /* =====================================================
           DATE FILTER
        ===================================================== */

        .statistics-filter {

            display: flex;

            align-items: center;

            gap: 8px;

        }


        .statistics-select {

            height: 36px;

            border: 1px solid #dfe8e5;

            border-radius: 7px;

            padding: 0 12px;

            background: #ffffff;

            color: #53635e;

            font-family: inherit;

            font-size: 11px;

            outline: none;

            cursor: pointer;

        }


        .statistics-select:focus {

            border-color: #8acabb;

            box-shadow:
                0 0 0 3px
                rgba(8, 127, 104, 0.07);

        }


        /* =====================================================
           SUMMARY CARD
        ===================================================== */

        .statistics-card {

            background: #ffffff;

            border: 1px solid #e5ebe9;

            border-radius: 12px;

            min-height: 120px;

            padding: 19px;

            display: flex;

            align-items: center;

            justify-content: space-between;

            box-shadow:
                0 1px 3px
                rgba(15, 23, 42, 0.025);

            transition:
                transform 0.2s ease,
                box-shadow 0.2s ease;

        }


        .statistics-card:hover {

            transform: translateY(-1px);

            box-shadow:
                0 5px 18px
                rgba(15, 23, 42, 0.055);

        }


        .statistics-title {

            color: #71807b;

            font-size: 11px;

            font-weight: 500;

            margin-bottom: 7px;

        }


        .statistics-value {

            color: #17211f;

            font-size: 25px;

            font-weight: 600;

            letter-spacing: -0.5px;

            line-height: 1.2;

        }


        .statistics-value.green {

            color: #087f68;

        }


        .statistics-description {

            color: #9aa7a3;

            font-size: 10px;

            margin-top: 6px;

        }


        .statistics-icon {

            width: 40px;

            height: 40px;

            border-radius: 10px;

            background: #eef8f5;

            color: #087f68;

            display: flex;

            align-items: center;

            justify-content: center;

            flex-shrink: 0;

        }


        .statistics-icon i {

            font-size: 17px;

        }


        /* =====================================================
           CONTENT CARD
        ===================================================== */

        .statistics-box {

            background: #ffffff;

            border: 1px solid #e5ebe9;

            border-radius: 12px;

            padding: 19px;

            box-shadow:
                0 1px 3px
                rgba(15, 23, 42, 0.025);

        }


        .statistics-box-header {

            display: flex;

            align-items: center;

            justify-content: space-between;

            margin-bottom: 18px;

        }


        .statistics-box-title {

            margin: 0;

            color: #1c2825;

            font-size: 14px;

            font-weight: 600;

        }


        .statistics-box-subtitle {

            color: #9aa7a3;

            font-size: 10px;

        }


        /* =====================================================
           CHART
        ===================================================== */

        .statistics-chart {

            position: relative;

            height: 315px;

        }


        /* =====================================================
           WIN LOSS
        ===================================================== */

        .winloss-chart {

            height: 245px;

            position: relative;

            display: flex;

            align-items: center;

            justify-content: center;

        }


        .winloss-summary {

            text-align: center;

            margin-top: 5px;

        }


        .winloss-main {

            color: #087f68;

            font-size: 25px;

            font-weight: 600;

        }


        .winloss-label {

            color: #8a9793;

            font-size: 10px;

            margin-top: 2px;

        }


        .winloss-legend {

            display: flex;

            justify-content: center;

            gap: 25px;

            margin-top: 5px;

        }


        .legend-item {

            display: flex;

            align-items: center;

            gap: 6px;

            color: #64736e;

            font-size: 10px;

        }


        .legend-dot {

            width: 7px;

            height: 7px;

            border-radius: 50%;

        }


        .legend-dot.win {

            background: #087f68;

        }


        .legend-dot.loss {

            background: #dc2626;

        }


        /* =====================================================
           SYMBOL TABLE
        ===================================================== */

        .symbol-table {

            width: 100%;

            border-collapse: collapse;

        }


        .symbol-table th {

            padding: 11px 12px;

            background: #fafcfb;

            border-bottom: 1px solid #eef2f1;

            color: #82908c;

            font-size: 10px;

            font-weight: 500;

            text-align: left;

        }


        .symbol-table td {

            padding: 14px 12px;

            border-bottom: 1px solid #f0f3f2;

            color: #35423e;

            font-size: 11px;

        }


        .symbol-table tbody tr:last-child td {

            border-bottom: none;

        }


        .symbol-table tbody tr:hover {

            background: #fbfdfc;

        }


        .symbol-name {

            color: #26332f;

            font-size: 12px;

            font-weight: 600;

        }


        .symbol-subtitle {

            display: block;

            color: #9aa7a3;

            font-size: 9px;

            margin-top: 2px;

        }


        .winrate-value {

            color: #087f68;

            font-weight: 600;

        }


        .pnl-positive {

            color: #087f68;

            font-weight: 600;

        }


        /* =====================================================
           PROGRESS
        ===================================================== */

        .progress-wrapper {

            display: flex;

            align-items: center;

            gap: 9px;

        }


        .progress-bar-bg {

            width: 85px;

            height: 5px;

            background: #edf1ef;

            border-radius: 10px;

            overflow: hidden;

        }


        .progress-bar-fill {

            height: 100%;

            background: #087f68;

            border-radius: 10px;

        }


        /* =====================================================
           PERFORMANCE BOX
        ===================================================== */

        .performance-grid {

            display: grid;

            grid-template-columns:
                repeat(2, 1fr);

            gap: 10px;

        }


        .performance-item {

            padding: 13px;

            background: #fafcfb;

            border: 1px solid #eef2f1;

            border-radius: 9px;

        }


        .performance-label {

            color: #8a9793;

            font-size: 10px;

            margin-bottom: 5px;

        }


        .performance-value {

            color: #26332f;

            font-size: 16px;

            font-weight: 600;

        }


        .performance-value.green {

            color: #087f68;

        }


        .performance-value.red {

            color: #dc2626;

        }


        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 768px) {

            .statistics-filter {

                display: none;

            }


            .statistics-chart {

                height: 260px;

            }


            .winloss-chart {

                height: 230px;

            }


            .symbol-table {

                min-width: 650px;

            }


            .table-wrapper {

                overflow-x: auto;

            }

        }


    </style>

</head>


<body>


<div class="app">


    <!-- =====================================================
         SIDEBAR
    ====================================================== -->

    <aside class="sidebar">


        <!-- LOGO -->

        <div class="logo">

            <i class="bi bi-graph-up-arrow"></i>

            <span>
                TradeAnalytics
            </span>

        </div>


        <!-- DASHBOARD -->

        <a
            href="dashboard.php"
            class="menu-item"
        >

            <i class="bi bi-grid"></i>

            <span>
                Dashboard
            </span>

        </a>


        <!-- TRADE HISTORY -->

        <a
            href="trade-history.php"
            class="menu-item"
        >

            <i class="bi bi-clock-history"></i>

            <span>
                ประวัติการเทรด
            </span>

        </a>


        <!-- STATISTICS -->

        <a
            href="statistics.php"
            class="menu-item active"
        >

            <i class="bi bi-bar-chart"></i>

            <span>
                สถิติการเทรด
            </span>

        </a>


        <!-- REPORTS -->

        <a
            href="reports.php"
            class="menu-item"
        >

            <i class="bi bi-file-earmark-text"></i>

            <span>
                รายงาน
            </span>

        </a>


        <!-- SETTING -->

        <div class="menu-title">
            การตั้งค่า
        </div>


        <!-- NOTIFICATIONS -->

        <a
            href="notifications.php"
            class="menu-item"
        >

            <i class="bi bi-telegram"></i>

            <span>
                การแจ้งเตือน
            </span>

        </a>


        <!-- PROFILE -->

        <a
            href="profile.php"
            class="menu-item"
        >

            <i class="bi bi-person"></i>

            <span>
                บัญชีผู้ใช้งาน
            </span>

        </a>


        <!-- LOGOUT -->

        <div class="logout">

            <a href="#">

                <i class="bi bi-box-arrow-right"></i>

                <span>
                    ออกจากระบบ
                </span>

            </a>

        </div>


    </aside>



    <!-- =====================================================
         MAIN
    ====================================================== -->

    <main class="main-content">


        <!-- =================================================
             TOPBAR
        ================================================== -->

        <header class="topbar">


            <div>

                <div class="welcome">
                    ยินดีต้อนรับ, ผู้ใช้งาน
                </div>


                <h1>
                    สถิติการเทรด
                </h1>

            </div>


            <div class="topbar-right">


                <!-- MT5 -->

                <span class="status-badge">

                    <span class="status-dot"></span>

                    MT5 Connected

                </span>


                <!-- TELEGRAM -->

                <span class="status-badge">

                    <span class="status-dot"></span>

                    Telegram Active

                </span>


                <!-- NOTIFICATION -->

                <button
                    type="button"
                    class="icon-button"
                >

                    <i class="bi bi-bell"></i>

                </button>


                <!-- AVATAR -->

                <div class="avatar">
                    U
                </div>


            </div>

        </header>



        <!-- =================================================
             CONTENT
        ================================================== -->

        <section class="content">


            <!-- =================================================
                 PAGE DESCRIPTION + FILTER
            ================================================== -->

            <div
                class="d-flex justify-content-between align-items-end mb-3"
            >


                <div>

                    <div class="page-description">

                        วิเคราะห์ผลการเทรด
                        และประสิทธิภาพการลงทุน

                    </div>

                </div>


                <div class="statistics-filter">

                    <select
                        class="statistics-select"
                        id="periodFilter"
                    >

                        <option>
                            7 วันที่ผ่านมา
                        </option>

                        <option selected>
                            30 วันที่ผ่านมา
                        </option>

                        <option>
                            3 เดือน
                        </option>

                        <option>
                            ทั้งหมด
                        </option>

                    </select>

                </div>


            </div>



            <!-- =================================================
                 SUMMARY CARDS
            ================================================== -->

            <div class="row g-3 mb-3">


                <!-- TOTAL TRADES -->

                <div class="col-md-6 col-xl-3">

                    <div class="statistics-card">


                        <div>

                            <div class="statistics-title">
                                TOTAL TRADES
                            </div>


                            <div class="statistics-value">
                                <?= number_format($totalTrades) ?>
                            </div>


                            <div class="statistics-description">
                                จำนวนออเดอร์ทั้งหมด
                            </div>

                        </div>


                        <div class="statistics-icon">

                            <i class="bi bi-arrow-left-right"></i>

                        </div>


                    </div>

                </div>



                <!-- WIN RATE -->

                <div class="col-md-6 col-xl-3">

                    <div class="statistics-card">


                        <div>

                            <div class="statistics-title">
                                WIN RATE
                            </div>


                            <div class="statistics-value green">
                                <?= number_format($winRate, 1) ?>%
                            </div>


                            <div class="statistics-description">
                                <?= $winningTrades ?> ครั้งที่ชนะ
                            </div>

                        </div>


                        <div class="statistics-icon">

                            <i class="bi bi-trophy"></i>

                        </div>


                    </div>

                </div>



                <!-- NET PROFIT -->

                <div class="col-md-6 col-xl-3">

                    <div class="statistics-card">


                        <div>

                            <div class="statistics-title">
                                NET PROFIT
                            </div>


                            <div class="statistics-value green">
                                +$<?= number_format($netProfit) ?>
                            </div>


                            <div class="statistics-description">
                                ผลกำไรสุทธิ
                            </div>

                        </div>


                        <div class="statistics-icon">

                            <i class="bi bi-currency-dollar"></i>

                        </div>


                    </div>

                </div>



                <!-- PROFIT FACTOR -->

                <div class="col-md-6 col-xl-3">

                    <div class="statistics-card">


                        <div>

                            <div class="statistics-title">
                                PROFIT FACTOR
                            </div>


                            <div class="statistics-value">
                                <?= number_format($profitFactor, 2) ?>
                            </div>


                            <div class="statistics-description">
                                ประสิทธิภาพของระบบ
                            </div>

                        </div>


                        <div class="statistics-icon">

                            <i class="bi bi-graph-up"></i>

                        </div>


                    </div>

                </div>


            </div>



            <!-- =================================================
                 CHART ROW
            ================================================== -->

            <div class="row g-3 mb-3">


                <!-- PERFORMANCE OVERVIEW -->

                <div class="col-lg-8">


                    <div class="statistics-box">


                        <div class="statistics-box-header">


                            <div>

                                <h2 class="statistics-box-title">
                                    Performance Overview
                                </h2>


                                <div class="statistics-box-subtitle">
                                    กำไรสะสมตามช่วงเวลา
                                </div>

                            </div>


                        </div>


                        <div class="statistics-chart">

                            <canvas
                                id="performanceChart"
                            ></canvas>

                        </div>


                    </div>


                </div>



                <!-- WIN LOSS -->

                <div class="col-lg-4">


                    <div class="statistics-box">


                        <div class="statistics-box-header">

                            <div>

                                <h2 class="statistics-box-title">
                                    Win / Loss
                                </h2>


                                <div class="statistics-box-subtitle">
                                    สัดส่วนผลการเทรด
                                </div>

                            </div>

                        </div>


                        <div class="winloss-chart">

                            <canvas
                                id="winLossChart"
                            ></canvas>

                        </div>


                        <div class="winloss-summary">


                            <div class="winloss-main">
                                <?= number_format($winRate, 1) ?>%
                            </div>


                            <div class="winloss-label">
                                Win Rate
                            </div>


                            <div class="winloss-legend">


                                <div class="legend-item">

                                    <span class="legend-dot win"></span>

                                    ชนะ <?= $winningTrades ?>

                                </div>


                                <div class="legend-item">

                                    <span class="legend-dot loss"></span>

                                    แพ้ <?= $losingTrades ?>

                                </div>


                            </div>


                        </div>


                    </div>


                </div>


            </div>



            <!-- =================================================
                 SYMBOL PERFORMANCE
            ================================================== -->

            <div class="row g-3">


                <!-- SYMBOL TABLE -->

                <div class="col-lg-8">


                    <div class="statistics-box">


                        <div class="statistics-box-header">


                            <div>

                                <h2 class="statistics-box-title">
                                    Performance by Symbol
                                </h2>


                                <div class="statistics-box-subtitle">
                                    ประสิทธิภาพแยกตามคู่เงิน
                                </div>

                            </div>


                        </div>


                        <div class="table-wrapper">


                            <table class="symbol-table">


                                <thead>

                                    <tr>

                                        <th>
                                            SYMBOL
                                        </th>

                                        <th>
                                            TRADES
                                        </th>

                                        <th>
                                            WIN RATE
                                        </th>

                                        <th>
                                            PERFORMANCE
                                        </th>

                                        <th>
                                            P/L
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>


                                    <?php foreach ($symbolStats as $item): ?>


                                        <tr>


                                            <!-- SYMBOL -->

                                            <td>

                                                <span class="symbol-name">

                                                    <?= $item['symbol'] ?>

                                                </span>


                                                <span class="symbol-subtitle">

                                                    Trading Symbol

                                                </span>

                                            </td>



                                            <!-- TRADES -->

                                            <td>

                                                <?= $item['trades'] ?>

                                            </td>



                                            <!-- WIN RATE -->

                                            <td>

                                                <span class="winrate-value">

                                                    <?= $item['winRate'] ?>%

                                                </span>

                                            </td>



                                            <!-- PROGRESS -->

                                            <td>


                                                <div class="progress-wrapper">


                                                    <div class="progress-bar-bg">


                                                        <div
                                                            class="progress-bar-fill"
                                                            style="width: <?= $item['winRate'] ?>%;"
                                                        ></div>


                                                    </div>


                                                    <span
                                                        style="
                                                            font-size:10px;
                                                            color:#82908c;
                                                        "
                                                    >

                                                        <?= $item['winRate'] ?>%

                                                    </span>


                                                </div>


                                            </td>



                                            <!-- PNL -->

                                            <td>

                                                <span class="pnl-positive">

                                                    +$<?= number_format($item['pnl']) ?>

                                                </span>

                                            </td>


                                        </tr>


                                    <?php endforeach; ?>


                                </tbody>


                            </table>


                        </div>


                    </div>


                </div>



                <!-- PERFORMANCE DETAILS -->

                <div class="col-lg-4">


                    <div class="statistics-box">


                        <div class="statistics-box-header">


                            <div>

                                <h2 class="statistics-box-title">
                                    Performance Details
                                </h2>


                                <div class="statistics-box-subtitle">
                                    ข้อมูลเพิ่มเติม
                                </div>

                            </div>


                        </div>


                        <div class="performance-grid">


                            <!-- WINNING -->

                            <div class="performance-item">


                                <div class="performance-label">
                                    Winning Trades
                                </div>


                                <div class="performance-value green">
                                    <?= $winningTrades ?>
                                </div>


                            </div>



                            <!-- LOSING -->

                            <div class="performance-item">


                                <div class="performance-label">
                                    Losing Trades
                                </div>


                                <div class="performance-value red">
                                    <?= $losingTrades ?>
                                </div>


                            </div>



                            <!-- AVG WIN -->

                            <div class="performance-item">


                                <div class="performance-label">
                                    Average Win
                                </div>


                                <div class="performance-value green">
                                    +$42.80
                                </div>


                            </div>



                            <!-- AVG LOSS -->

                            <div class="performance-item">


                                <div class="performance-label">
                                    Average Loss
                                </div>


                                <div class="performance-value red">
                                    -$18.40
                                </div>


                            </div>



                            <!-- BEST TRADE -->

                            <div class="performance-item">


                                <div class="performance-label">
                                    Best Trade
                                </div>


                                <div class="performance-value green">
                                    +$186.50
                                </div>


                            </div>



                            <!-- WORST TRADE -->

                            <div class="performance-item">


                                <div class="performance-label">
                                    Worst Trade
                                </div>


                                <div class="performance-value red">
                                    -$72.30
                                </div>


                            </div>


                        </div>


                    </div>


                </div>


            </div>


        </section>


    </main>


</div>



<!-- =========================================================
     CHART.JS
========================================================= -->

<script
    src="https://cdn.jsdelivr.net/npm/chart.js"
></script>


<script>


    /* =========================================================
       PERFORMANCE CHART
    ========================================================= */

    const performanceCanvas =
        document.getElementById(
            'performanceChart'
        );


    const performanceChart =
        new Chart(
            performanceCanvas,
            {

                type: 'line',

                data: {

                    labels: [

                        '1 มิ.ย.',
                        '3 มิ.ย.',
                        '6 มิ.ย.',
                        '9 มิ.ย.',
                        '12 มิ.ย.',
                        '15 มิ.ย.',
                        '18 มิ.ย.',
                        '21 มิ.ย.',
                        '24 มิ.ย.',
                        '27 มิ.ย.',
                        '30 มิ.ย.'

                    ],

                    datasets: [

                        {

                            label: 'กำไรสะสม',

                            data: [

                                1000,
                                1080,
                                1160,
                                1250,
                                1320,
                                1380,
                                1450,
                                1510,
                                1600,
                                1690,
                                1780

                            ],

                            borderColor: '#087f68',

                            backgroundColor:
                                'rgba(8, 127, 104, 0.10)',

                            borderWidth: 2,

                            pointRadius: 3,

                            pointHoverRadius: 5,

                            tension: 0.35,

                            fill: true

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {

                        intersect: false,

                        mode: 'index'

                    },

                    plugins: {

                        legend: {

                            display: false

                        },

                        tooltip: {

                            backgroundColor: '#17211f',

                            titleFont: {

                                family:
                                    'IBM Plex Sans Thai'

                            },

                            bodyFont: {

                                family:
                                    'IBM Plex Sans Thai'

                            },

                            padding: 10,

                            displayColors: false

                        }

                    },

                    scales: {

                        x: {

                            grid: {

                                display: false

                            },

                            ticks: {

                                font: {

                                    family:
                                        'IBM Plex Sans Thai',

                                    size: 10

                                },

                                color: '#8a9793'

                            }

                        },

                        y: {

                            grid: {

                                color:
                                    '#eef2f1'

                            },

                            ticks: {

                                font: {

                                    family:
                                        'IBM Plex Sans Thai',

                                    size: 10

                                },

                                color: '#8a9793',

                                callback: function(value) {

                                    return '$' + value;

                                }

                            }

                        }

                    }

                }

            }

        );



    /* =========================================================
       WIN / LOSS CHART
    ========================================================= */

    const winLossCanvas =
        document.getElementById(
            'winLossChart'
        );


    const winLossChart =
        new Chart(
            winLossCanvas,
            {

                type: 'doughnut',

                data: {

                    labels: [

                        'ชนะ',

                        'แพ้'

                    ],

                    datasets: [

                        {

                            data: [

                                <?= $winningTrades ?>,

                                <?= $losingTrades ?>

                            ],

                            backgroundColor: [

                                '#087f68',

                                '#dc2626'

                            ],

                            borderWidth: 0,

                            hoverOffset: 4

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: '72%',

                    plugins: {

                        legend: {

                            display: false

                        },

                        tooltip: {

                            backgroundColor: '#17211f',

                            padding: 10,

                            displayColors: false

                        }

                    }

                }

            }

        );


</script>


</body>

</html>