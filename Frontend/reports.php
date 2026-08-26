<!DOCTYPE html>
<html lang="th">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>TradeAnalytics - รายงาน</title>


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


    <!-- Chart.js -->

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>


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
           REPORT PAGE
        ===================================================== */

        .report-page {

            padding: 30px 28px 40px;

        }


        /* =====================================================
           PAGE HEADER
        ===================================================== */

        .report-header {

            display: flex;

            justify-content: space-between;

            align-items: flex-end;

            margin-bottom: 24px;

        }


        .report-title h2 {

            margin: 0 0 7px;

            font-size: 24px;

            line-height: 1.3;

            font-weight: 700;

            color: #111917;

        }


        .report-title p {

            margin: 0;

            font-size: 13px;

            color: #82908c;

        }


        /* =====================================================
           HEADER ACTION
        ===================================================== */

        .report-actions {

            display: flex;

            align-items: center;

            gap: 10px;

        }


        .date-select {

            height: 40px;

            padding: 0 13px;

            border:
                1px solid
                #dbe4e1;

            border-radius: 8px;

            background: white;

            color: #475569;

            font-family: inherit;

            font-size: 12px;

            outline: none;

            cursor: pointer;

        }


        .date-select:focus {

            border-color: #087f68;

        }


        .export-button {

            height: 40px;

            padding: 0 16px;

            border: none;

            border-radius: 8px;

            background: #087f68;

            color: white;

            font-family: inherit;

            font-size: 12px;

            font-weight: 600;

            cursor: pointer;

            display: flex;

            align-items: center;

            gap: 7px;

            transition: 0.2s;

        }


        .export-button:hover {

            background: #066b58;

            transform: translateY(-1px);

        }


        /* =====================================================
           SUMMARY GRID
        ===================================================== */

        .summary-grid {

            display: grid;

            grid-template-columns:
                repeat(4, 1fr);

            gap: 14px;

            margin-bottom: 18px;

        }


        .summary-card {

            background: white;

            border:
                1px solid
                #e5ebe9;

            border-radius: 11px;

            padding: 19px;

            min-height: 125px;

            display: flex;

            justify-content: space-between;

            align-items: flex-start;

            box-shadow:
                0 1px 3px
                rgba(
                    15,
                    23,
                    42,
                    0.025
                );

        }


        .summary-label {

            font-size: 11px;

            color: #82908c;

            margin-bottom: 8px;

        }


        .summary-value {

            font-size: 24px;

            font-weight: 700;

            line-height: 1.2;

            color: #111827;

        }


        .summary-value.green {

            color: #087f68;

        }


        .summary-value.red {

            color: #dc2626;

        }


        .summary-description {

            margin-top: 7px;

            font-size: 10px;

            color: #9aa6a2;

        }


        .summary-icon {

            width: 40px;

            height: 40px;

            border-radius: 9px;

            display: flex;

            align-items: center;

            justify-content: center;

            background: #edf8f5;

            color: #087f68;

            font-size: 17px;

        }


        .summary-icon.red {

            background: #fff1f2;

            color: #dc2626;

        }


        .summary-icon.blue {

            background: #eff6ff;

            color: #2563eb;

        }


        /* =====================================================
           MAIN GRID
        ===================================================== */

        .report-grid {

            display: grid;

            grid-template-columns:
                minmax(0, 1.55fr)
                minmax(300px, 0.75fr);

            gap: 18px;

            margin-bottom: 18px;

        }


        /* =====================================================
           CARD
        ===================================================== */

        .report-card {

            background: white;

            border:
                1px solid
                #e5ebe9;

            border-radius: 11px;

            padding: 20px;

            box-shadow:
                0 1px 3px
                rgba(
                    15,
                    23,
                    42,
                    0.025
                );

        }


        .card-heading {

            display: flex;

            justify-content: space-between;

            align-items: flex-start;

            margin-bottom: 15px;

        }


        .card-heading h3 {

            margin: 0 0 4px;

            font-size: 15px;

            font-weight: 700;

            color: #1f2937;

        }


        .card-heading p {

            margin: 0;

            font-size: 11px;

            color: #94a3b8;

        }


        /* =====================================================
           CHART
        ===================================================== */

        .chart-container {

            position: relative;

            height: 300px;

        }


        /* =====================================================
           PROFIT BREAKDOWN
        ===================================================== */

        .profit-breakdown {

            display: flex;

            flex-direction: column;

            gap: 15px;

        }


        .breakdown-item {

            display: flex;

            justify-content: space-between;

            align-items: center;

            padding-bottom: 14px;

            border-bottom:
                1px solid
                #f1f5f9;

        }


        .breakdown-item:last-child {

            border-bottom: none;

            padding-bottom: 0;

        }


        .breakdown-left {

            display: flex;

            align-items: center;

            gap: 10px;

        }


        .breakdown-dot {

            width: 9px;

            height: 9px;

            border-radius: 50%;

            background: #087f68;

        }


        .breakdown-dot.loss {

            background: #dc2626;

        }


        .breakdown-dot.neutral {

            background: #94a3b8;

        }


        .breakdown-name {

            font-size: 12px;

            color: #64748b;

        }


        .breakdown-value {

            font-size: 13px;

            font-weight: 600;

            color: #1f2937;

        }


        .breakdown-value.green {

            color: #087f68;

        }


        .breakdown-value.red {

            color: #dc2626;

        }


        /* =====================================================
           PROGRESS
        ===================================================== */

        .progress-section {

            margin-top: 18px;

        }


        .progress-header {

            display: flex;

            justify-content: space-between;

            margin-bottom: 7px;

        }


        .progress-label {

            font-size: 11px;

            color: #64748b;

        }


        .progress-percent {

            font-size: 11px;

            font-weight: 600;

            color: #087f68;

        }


        .progress-bar {

            width: 100%;

            height: 7px;

            background: #edf2f0;

            border-radius: 10px;

            overflow: hidden;

        }


        .progress-fill {

            height: 100%;

            background: #087f68;

            border-radius: 10px;

        }


        /* =====================================================
           SYMBOL TABLE
        ===================================================== */

        .table-card {

            background: white;

            border:
                1px solid
                #e5ebe9;

            border-radius: 11px;

            overflow: hidden;

            margin-bottom: 18px;

        }


        .table-card-header {

            padding: 19px 20px;

            border-bottom:
                1px solid
                #eef2f1;

            display: flex;

            justify-content: space-between;

            align-items: center;

        }


        .table-card-header h3 {

            margin: 0 0 4px;

            font-size: 15px;

            font-weight: 700;

        }


        .table-card-header p {

            margin: 0;

            font-size: 11px;

            color: #94a3b8;

        }


        .table-count {

            font-size: 11px;

            color: #94a3b8;

        }


        table {

            width: 100%;

            border-collapse: collapse;

        }


        thead {

            background: #fafcfb;

        }


        th {

            padding: 12px 14px;

            text-align: left;

            font-size: 10px;

            font-weight: 600;

            color: #7b8985;

            text-transform: uppercase;

            letter-spacing: 0.2px;

            border-bottom:
                1px solid
                #eef2f1;

        }


        td {

            padding: 14px;

            font-size: 11px;

            color: #475569;

            border-bottom:
                1px solid
                #f1f5f9;

        }


        tbody tr:hover {

            background: #fbfdfc;

        }


        tbody tr:last-child td {

            border-bottom: none;

        }


        .symbol-name {

            font-weight: 700;

            color: #1f2937;

        }


        .symbol-sub {

            display: block;

            margin-top: 3px;

            font-size: 9px;

            color: #a0aba8;

        }


        .win-badge {

            display: inline-flex;

            padding: 5px 9px;

            border-radius: 6px;

            background: #edf8f5;

            color: #087f68;

            font-size: 10px;

            font-weight: 600;

        }


        .profit-text {

            color: #087f68;

            font-weight: 700;

        }


        .loss-text {

            color: #dc2626;

            font-weight: 700;

        }


        /* =====================================================
           TRADE REPORT
        ===================================================== */

        .trade-table-wrapper {

            overflow-x: auto;

        }


        .action-badge {

            display: inline-flex;

            align-items: center;

            justify-content: center;

            min-width: 42px;

            padding: 5px 8px;

            border-radius: 6px;

            font-size: 9px;

            font-weight: 700;

        }


        .action-buy {

            background: #edf8f5;

            color: #087f68;

        }


        .action-sell {

            background: #fff1f2;

            color: #dc2626;

        }


        .status-text {

            font-size: 10px;

            color: #64748b;

        }


        .date-text {

            font-size: 10px;

            color: #64748b;

            white-space: nowrap;

        }


        /* =====================================================
           SIDEBAR / TOPBAR OVERRIDE
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


        .welcome {

            font-size: 13px;

        }


        .topbar h1 {

            font-size: 24px;

        }


        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1100px) {

            .summary-grid {

                grid-template-columns:
                    repeat(2, 1fr);

            }


            .report-grid {

                grid-template-columns: 1fr;

            }

        }


        @media (max-width: 700px) {

            .report-page {

                padding:
                    22px
                    16px
                    30px;

            }


            .report-header {

                flex-direction: column;

                align-items: flex-start;

                gap: 15px;

            }


            .report-actions {

                width: 100%;

            }


            .date-select {

                flex: 1;

            }


            .export-button {

                flex-shrink: 0;

            }


            .summary-grid {

                grid-template-columns: 1fr;

            }


            .report-title h2 {

                font-size: 21px;

            }


            .report-card {

                padding: 16px;

            }


            .chart-container {

                height: 240px;

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
        class="menu-item active"
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

                รายงาน

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

    <div class="content report-page">


        <!-- =================================================
             HEADER
        ================================================= -->

        <div class="report-header">


            <div class="report-title">


                <h2>

                    รายงานการเทรด

                </h2>


                <p>

                    สรุปผลการเทรดและประสิทธิภาพการลงทุน

                </p>


            </div>


            <div class="report-actions">


                <select
                    class="date-select"
                    id="periodSelect"
                    onchange="changePeriod()"
                >

                    <option value="today">
                        วันนี้
                    </option>

                    <option value="7">
                        7 วันที่ผ่านมา
                    </option>

                    <option
                        value="30"
                        selected
                    >
                        30 วันที่ผ่านมา
                    </option>

                    <option value="90">
                        90 วันที่ผ่านมา
                    </option>

                </select>


                <button
                    class="export-button"
                    onclick="exportReport()"
                >

                    ↓

                    Export รายงาน

                </button>


            </div>


        </div>



        <!-- =================================================
             SUMMARY
        ================================================= -->

        <div class="summary-grid">


            <!-- NET PROFIT -->

            <div class="summary-card">


                <div>

                    <div class="summary-label">

                        กำไรสุทธิ

                    </div>


                    <div class="summary-value green">

                        +$2,430

                    </div>


                    <div class="summary-description">

                        ↑ 12.4% จากช่วงก่อนหน้า

                    </div>

                </div>


                <div class="summary-icon">

                    $

                </div>


            </div>



            <!-- TOTAL TRADES -->

            <div class="summary-card">


                <div>

                    <div class="summary-label">

                        จำนวนการเทรด

                    </div>


                    <div class="summary-value">

                        200

                    </div>


                    <div class="summary-description">

                        รายการทั้งหมด

                    </div>

                </div>


                <div class="summary-icon blue">

                    ⇄

                </div>


            </div>



            <!-- WIN RATE -->

            <div class="summary-card">


                <div>

                    <div class="summary-label">

                        Win Rate

                    </div>


                    <div class="summary-value green">

                        68.5%

                    </div>


                    <div class="summary-description">

                        ชนะ 137 ครั้ง

                    </div>

                </div>


                <div class="summary-icon">

                    %

                </div>


            </div>



            <!-- PROFIT FACTOR -->

            <div class="summary-card">


                <div>

                    <div class="summary-label">

                        Profit Factor

                    </div>


                    <div class="summary-value">

                        2.14

                    </div>


                    <div class="summary-description">

                        ประสิทธิภาพของระบบ

                    </div>

                </div>


                <div class="summary-icon">

                    ↗

                </div>


            </div>


        </div>



        <!-- =================================================
             CHART + BREAKDOWN
        ================================================= -->

        <div class="report-grid">


            <!-- PROFIT CHART -->

            <div class="report-card">


                <div class="card-heading">


                    <div>

                        <h3>

                            กำไรสะสม

                        </h3>


                        <p>

                            การเปลี่ยนแปลงของกำไรตามช่วงเวลา

                        </p>

                    </div>


                </div>


                <div class="chart-container">

                    <canvas id="profitChart"></canvas>

                </div>


            </div>



            <!-- BREAKDOWN -->

            <div class="report-card">


                <div class="card-heading">


                    <div>

                        <h3>

                            สรุปผลการเทรด

                        </h3>


                        <p>

                            ภาพรวมกำไรและขาดทุน

                        </p>

                    </div>


                </div>


                <div class="profit-breakdown">


                    <div class="breakdown-item">


                        <div class="breakdown-left">

                            <span class="breakdown-dot"></span>

                            <span class="breakdown-name">
                                Winning Trades
                            </span>

                        </div>


                        <span class="breakdown-value green">
                            137
                        </span>


                    </div>



                    <div class="breakdown-item">


                        <div class="breakdown-left">

                            <span class="breakdown-dot loss"></span>

                            <span class="breakdown-name">
                                Losing Trades
                            </span>

                        </div>


                        <span class="breakdown-value red">
                            63
                        </span>


                    </div>



                    <div class="breakdown-item">


                        <div class="breakdown-left">

                            <span class="breakdown-dot"></span>

                            <span class="breakdown-name">
                                Average Win
                            </span>

                        </div>


                        <span class="breakdown-value green">
                            +$42.80
                        </span>


                    </div>



                    <div class="breakdown-item">


                        <div class="breakdown-left">

                            <span class="breakdown-dot loss"></span>

                            <span class="breakdown-name">
                                Average Loss
                            </span>

                        </div>


                        <span class="breakdown-value red">
                            -$18.40
                        </span>


                    </div>



                    <div class="progress-section">


                        <div class="progress-header">


                            <span class="progress-label">

                                Win Rate

                            </span>


                            <span class="progress-percent">

                                68.5%

                            </span>


                        </div>


                        <div class="progress-bar">

                            <div
                                class="progress-fill"
                                style="width:68.5%"
                            ></div>

                        </div>


                    </div>


                </div>


            </div>


        </div>



        <!-- =================================================
             SYMBOL PERFORMANCE
        ================================================= -->

        <div class="table-card">


            <div class="table-card-header">


                <div>

                    <h3>

                        Performance by Symbol

                    </h3>


                    <p>

                        ประสิทธิภาพแยกตามคู่เงินและสินทรัพย์

                    </p>

                </div>


                <span class="table-count">

                    5 Symbols

                </span>


            </div>


            <table>


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
                            AVG. WIN
                        </th>

                        <th>
                            AVG. LOSS
                        </th>

                        <th>
                            P/L
                        </th>

                    </tr>

                </thead>


                <tbody>


                    <tr>

                        <td>

                            <span class="symbol-name">
                                EURUSD
                            </span>

                            <span class="symbol-sub">
                                Forex / Trading
                            </span>

                        </td>

                        <td>
                            52
                        </td>

                        <td>

                            <span class="win-badge">
                                72%
                            </span>

                        </td>

                        <td>
                            +$38.40
                        </td>

                        <td>
                            -$16.20
                        </td>

                        <td class="profit-text">
                            +$820
                        </td>

                    </tr>



                    <tr>

                        <td>

                            <span class="symbol-name">
                                GBPUSD
                            </span>

                            <span class="symbol-sub">
                                Forex / Trading
                            </span>

                        </td>

                        <td>
                            38
                        </td>

                        <td>

                            <span class="win-badge">
                                61%
                            </span>

                        </td>

                        <td>
                            +$35.10
                        </td>

                        <td>
                            -$19.80
                        </td>

                        <td class="profit-text">
                            +$340
                        </td>

                    </tr>



                    <tr>

                        <td>

                            <span class="symbol-name">
                                XAUUSD
                            </span>

                            <span class="symbol-sub">
                                Gold / Trading
                            </span>

                        </td>

                        <td>
                            45
                        </td>

                        <td>

                            <span class="win-badge">
                                69%
                            </span>

                        </td>

                        <td>
                            +$52.30
                        </td>

                        <td>
                            -$22.40
                        </td>

                        <td class="profit-text">
                            +$760
                        </td>

                    </tr>



                    <tr>

                        <td>

                            <span class="symbol-name">
                                USDJPY
                            </span>

                            <span class="symbol-sub">
                                Forex / Trading
                            </span>

                        </td>

                        <td>
                            35
                        </td>

                        <td>

                            <span class="win-badge">
                                66%
                            </span>

                        </td>

                        <td>
                            +$41.20
                        </td>

                        <td>
                            -$17.90
                        </td>

                        <td class="profit-text">
                            +$420
                        </td>

                    </tr>



                    <tr>

                        <td>

                            <span class="symbol-name">
                                GBPJPY
                            </span>

                            <span class="symbol-sub">
                                Forex / Trading
                            </span>

                        </td>

                        <td>
                            30
                        </td>

                        <td>

                            <span class="win-badge">
                                57%
                            </span>

                        </td>

                        <td>
                            +$32.80
                        </td>

                        <td>
                            -$21.50
                        </td>

                        <td class="profit-text">
                            +$90
                        </td>

                    </tr>


                </tbody>


            </table>


        </div>



        <!-- =================================================
             TRADE REPORT
        ================================================= -->

        <div class="table-card">


            <div class="table-card-header">


                <div>

                    <h3>

                        รายการเทรดในรายงาน

                    </h3>


                    <p>

                        รายละเอียดการเทรดล่าสุด

                    </p>

                </div>


                <span class="table-count">

                    8 รายการ

                </span>


            </div>


            <div class="trade-table-wrapper">


                <table>


                    <thead>

                        <tr>

                            <th>
                                SYMBOL
                            </th>

                            <th>
                                ACTION
                            </th>

                            <th>
                                PRICE
                            </th>

                            <th>
                                LOT
                            </th>

                            <th>
                                P/L
                            </th>

                            <th>
                                STATUS
                            </th>

                            <th>
                                DATE / TIME
                            </th>

                        </tr>

                    </thead>


                    <tbody>


                        <tr>

                            <td>

                                <span class="symbol-name">
                                    EURUSD
                                </span>

                            </td>

                            <td>

                                <span class="action-badge action-buy">
                                    BUY
                                </span>

                            </td>

                            <td>
                                1.08520
                            </td>

                            <td>
                                0.10
                            </td>

                            <td class="profit-text">
                                +$48.20
                            </td>

                            <td class="status-text">
                                TP Hit
                            </td>

                            <td class="date-text">
                                26/08/2026 09:42
                            </td>

                        </tr>



                        <tr>

                            <td>

                                <span class="symbol-name">
                                    GBPUSD
                                </span>

                            </td>

                            <td>

                                <span class="action-badge action-sell">
                                    SELL
                                </span>

                            </td>

                            <td>
                                1.27450
                            </td>

                            <td>
                                0.05
                            </td>

                            <td class="loss-text">
                                -$12.50
                            </td>

                            <td class="status-text">
                                SL Hit
                            </td>

                            <td class="date-text">
                                26/08/2026 08:35
                            </td>

                        </tr>



                        <tr>

                            <td>

                                <span class="symbol-name">
                                    XAUUSD
                                </span>

                            </td>

                            <td>

                                <span class="action-badge action-buy">
                                    BUY
                                </span>

                            </td>

                            <td>
                                2430.50
                            </td>

                            <td>
                                0.02
                            </td>

                            <td class="profit-text">
                                +$31.00
                            </td>

                            <td class="status-text">
                                Manual
                            </td>

                            <td class="date-text">
                                25/08/2026 16:20
                            </td>

                        </tr>



                        <tr>

                            <td>

                                <span class="symbol-name">
                                    USDJPY
                                </span>

                            </td>

                            <td>

                                <span class="action-badge action-sell">
                                    SELL
                                </span>

                            </td>

                            <td>
                                148.205
                            </td>

                            <td>
                                0.08
                            </td>

                            <td class="profit-text">
                                +$22.40
                            </td>

                            <td class="status-text">
                                TP Hit
                            </td>

                            <td class="date-text">
                                25/08/2026 14:15
                            </td>

                        </tr>



                        <tr>

                            <td>

                                <span class="symbol-name">
                                    EURUSD
                                </span>

                            </td>

                            <td>

                                <span class="action-badge action-buy">
                                    BUY
                                </span>

                            </td>

                            <td>
                                1.08210
                            </td>

                            <td>
                                0.10
                            </td>

                            <td class="profit-text">
                                +$36.80
                            </td>

                            <td class="status-text">
                                TP Hit
                            </td>

                            <td class="date-text">
                                25/08/2026 11:40
                            </td>

                        </tr>



                        <tr>

                            <td>

                                <span class="symbol-name">
                                    GBPJPY
                                </span>

                            </td>

                            <td>

                                <span class="action-badge action-sell">
                                    SELL
                                </span>

                            </td>

                            <td>
                                198.420
                            </td>

                            <td>
                                0.05
                            </td>

                            <td class="loss-text">
                                -$18.30
                            </td>

                            <td class="status-text">
                                SL Hit
                            </td>

                            <td class="date-text">
                                24/08/2026 17:05
                            </td>

                        </tr>



                        <tr>

                            <td>

                                <span class="symbol-name">
                                    XAUUSD
                                </span>

                            </td>

                            <td>

                                <span class="action-badge action-buy">
                                    BUY
                                </span>

                            </td>

                            <td>
                                2422.80
                            </td>

                            <td>
                                0.03
                            </td>

                            <td class="profit-text">
                                +$54.60
                            </td>

                            <td class="status-text">
                                TP Hit
                            </td>

                            <td class="date-text">
                                24/08/2026 13:22
                            </td>

                        </tr>



                        <tr>

                            <td>

                                <span class="symbol-name">
                                    USDJPY
                                </span>

                            </td>

                            <td>

                                <span class="action-badge action-buy">
                                    BUY
                                </span>

                            </td>

                            <td>
                                147.850
                            </td>

                            <td>
                                0.05
                            </td>

                            <td class="profit-text">
                                +$15.70
                            </td>

                            <td class="status-text">
                                Manual
                            </td>

                            <td class="date-text">
                                23/08/2026 10:18
                            </td>

                        </tr>


                    </tbody>


                </table>


            </div>


        </div>


    </div>


</main>



<!-- =========================================================
     JAVASCRIPT
========================================================= -->

<script>


    /* =====================================================
       PROFIT CHART
    ===================================================== */

    const chartCanvas =
        document.getElementById(
            'profitChart'
        );


    new Chart(
        chartCanvas,
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

                            1075,

                            1155,

                            1245,

                            1320,

                            1380,

                            1450,

                            1510,

                            1595,

                            1685,

                            1780

                        ],

                        borderWidth: 2,

                        pointRadius: 3,

                        pointHoverRadius: 5,

                        tension: 0.35,

                        fill: true,

                        borderColor: '#087f68',

                        backgroundColor:
                            'rgba(8,127,104,0.10)'

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,


                plugins: {

                    legend: {

                        display: false

                    }

                },


                scales: {

                    x: {

                        grid: {

                            display: false

                        },

                        ticks: {

                            color: '#94a3b8',

                            font: {

                                family:
                                    'IBM Plex Sans Thai',

                                size: 10

                            }

                        }

                    },


                    y: {

                        grid: {

                            color: '#edf1ef'

                        },

                        ticks: {

                            color: '#94a3b8',

                            font: {

                                family:
                                    'IBM Plex Sans Thai',

                                size: 10

                            },

                            callback:
                                function(value) {

                                    return '$' + value;

                                }

                        }

                    }

                }

            }

        }

    );



    /* =====================================================
       PERIOD
    ===================================================== */

    function changePeriod() {

        const value =
            document.getElementById(
                'periodSelect'
            ).value;


        console.log(
            'Selected period:',
            value
        );


        /*
         * ตอนนี้เป็น UI ก่อน
         * หลังเชื่อม Supabase
         * ค่อยเอาค่านี้ไป query วันที่จริง
         */

    }



    /* =====================================================
       EXPORT CSV
    ===================================================== */

    function exportReport() {


        const rows = [

            [
                'Symbol',
                'Action',
                'Price',
                'Lot',
                'P/L',
                'Status',
                'Date'
            ],


            [
                'EURUSD',
                'BUY',
                '1.08520',
                '0.10',
                '+48.20',
                'TP Hit',
                '26/08/2026 09:42'
            ],


            [
                'GBPUSD',
                'SELL',
                '1.27450',
                '0.05',
                '-12.50',
                'SL Hit',
                '26/08/2026 08:35'
            ],


            [
                'XAUUSD',
                'BUY',
                '2430.50',
                '0.02',
                '+31.00',
                'Manual',
                '25/08/2026 16:20'
            ],


            [
                'USDJPY',
                'SELL',
                '148.205',
                '0.08',
                '+22.40',
                'TP Hit',
                '25/08/2026 14:15'
            ],


            [
                'EURUSD',
                'BUY',
                '1.08210',
                '0.10',
                '+36.80',
                'TP Hit',
                '25/08/2026 11:40'
            ]

        ];


        const csv =
            rows
                .map(
                    row =>
                        row
                            .map(
                                value =>
                                    `"${value}"`
                            )
                            .join(',')
                )
                .join('\n');


        const blob =
            new Blob(
                [
                    '\uFEFF' + csv
                ],
                {
                    type:
                        'text/csv;charset=utf-8;'
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement(
                'a'
            );


        link.href = url;

        link.download =
            'trade-report.csv';


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


        URL.revokeObjectURL(
            url
        );

    }


</script>


</body>

</html>