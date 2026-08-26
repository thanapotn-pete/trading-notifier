<?php

/*
|--------------------------------------------------------------------------
| Trade History
|--------------------------------------------------------------------------
| ตอนนี้ใช้ข้อมูลตัวอย่างเพื่อทำ UI ก่อน
| ภายหลังสามารถเปลี่ยนส่วน $trades ให้ดึงข้อมูลจาก Supabase ได้
|--------------------------------------------------------------------------
*/

$trades = [
    [
        'symbol' => 'EURUSD',
        'action' => 'BUY',
        'price' => '1.08520',
        'lot' => '0.10',
        'pnl' => 48.20,
        'status' => 'TP Hit',
        'timestamp' => '26/08/2026 09:42'
    ],
    [
        'symbol' => 'GBPUSD',
        'action' => 'SELL',
        'price' => '1.27450',
        'lot' => '0.05',
        'pnl' => -12.50,
        'status' => 'SL Hit',
        'timestamp' => '26/08/2026 08:35'
    ],
    [
        'symbol' => 'XAUUSD',
        'action' => 'BUY',
        'price' => '2430.50',
        'lot' => '0.02',
        'pnl' => 31.00,
        'status' => 'Manual',
        'timestamp' => '25/08/2026 16:20'
    ],
    [
        'symbol' => 'USDJPY',
        'action' => 'SELL',
        'price' => '148.205',
        'lot' => '0.08',
        'pnl' => 22.40,
        'status' => 'TP Hit',
        'timestamp' => '25/08/2026 14:15'
    ],
    [
        'symbol' => 'EURUSD',
        'action' => 'BUY',
        'price' => '1.08210',
        'lot' => '0.10',
        'pnl' => 36.80,
        'status' => 'TP Hit',
        'timestamp' => '25/08/2026 11:40'
    ],
    [
        'symbol' => 'GBPJPY',
        'action' => 'SELL',
        'price' => '198.420',
        'lot' => '0.05',
        'pnl' => -18.30,
        'status' => 'SL Hit',
        'timestamp' => '24/08/2026 17:05'
    ],
    [
        'symbol' => 'XAUUSD',
        'action' => 'BUY',
        'price' => '2422.80',
        'lot' => '0.03',
        'pnl' => 54.60,
        'status' => 'TP Hit',
        'timestamp' => '24/08/2026 13:22'
    ],
    [
        'symbol' => 'USDJPY',
        'action' => 'BUY',
        'price' => '147.850',
        'lot' => '0.05',
        'pnl' => 15.70,
        'status' => 'Manual',
        'timestamp' => '23/08/2026 10:18'
    ],
];


// คำนวณ Summary
$totalTrades = count($trades);

$winningTrades = 0;
$losingTrades = 0;
$totalProfit = 0;
$totalLoss = 0;
$totalPnl = 0;

foreach ($trades as $trade) {

    $totalPnl += $trade['pnl'];

    if ($trade['pnl'] > 0) {
        $winningTrades++;
        $totalProfit += $trade['pnl'];
    }

    if ($trade['pnl'] < 0) {
        $losingTrades++;
        $totalLoss += abs($trade['pnl']);
    }
}

$winRate = $totalTrades > 0
    ? ($winningTrades / $totalTrades) * 100
    : 0;

?>

<!DOCTYPE html>

<html lang="th">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>TradeAnalytics - ประวัติการเทรด</title>


    <!-- ================= GOOGLE FONT ================= -->

    <link rel="preconnect" href="https://fonts.googleapis.com">

    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
    >


    <!-- ================= BOOTSTRAP ================= -->

    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
    >


    <!-- ================= BOOTSTRAP ICONS ================= -->

    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
    >


    <!-- ================= MAIN CSS ================= -->

    <link rel="stylesheet" href="css/style.css">


    <!-- ================= PAGE CSS ================= -->

    <style>

        /* =========================================================
           PAGE HEADER
        ========================================================= */

        .page-description {
            color: #8a9793;

            font-size: 12px;

            margin-top: 4px;
        }


        .page-actions {
            display: flex;

            align-items: center;

            gap: 8px;
        }


        .btn-export {
            border: 1px solid #dce8e4;

            background: #ffffff;

            color: #087f68;

            border-radius: 8px;

            padding: 8px 13px;

            font-family: inherit;

            font-size: 12px;

            font-weight: 500;

            cursor: pointer;

            display: inline-flex;

            align-items: center;

            gap: 7px;

            transition: all 0.2s ease;
        }


        .btn-export:hover {
            background: #edf8f5;

            border-color: #c8dfd8;

            color: #066653;
        }


        /* =========================================================
           SUMMARY
        ========================================================= */

        .history-summary {
            margin-bottom: 16px;
        }


        .history-summary-card {
            background: #ffffff;

            border: 1px solid #e5ebe9;

            border-radius: 12px;

            padding: 17px 18px;

            min-height: 105px;

            display: flex;

            align-items: center;

            justify-content: space-between;

            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.025);
        }


        .history-summary-title {
            font-size: 11px;

            color: #7b8985;

            font-weight: 500;

            margin-bottom: 6px;
        }


        .history-summary-value {
            font-size: 22px;

            font-weight: 600;

            color: #17211f;

            letter-spacing: -0.4px;
        }


        .history-summary-value.green {
            color: #087f68;
        }


        .history-summary-value.red {
            color: #dc2626;
        }


        .history-summary-icon {
            width: 38px;

            height: 38px;

            border-radius: 9px;

            background: #eef8f5;

            color: #087f68;

            display: flex;

            align-items: center;

            justify-content: center;
        }


        /* =========================================================
           FILTER
        ========================================================= */

        .filter-card {
            background: #ffffff;

            border: 1px solid #e5ebe9;

            border-radius: 12px;

            padding: 16px 18px;

            margin-bottom: 16px;

            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.025);
        }


        .filter-row {
            display: flex;

            align-items: flex-end;

            gap: 10px;

            flex-wrap: wrap;
        }


        .filter-group {
            display: flex;

            flex-direction: column;

            gap: 5px;
        }


        .filter-label {
            font-size: 10px;

            color: #7b8985;

            font-weight: 500;
        }


        .filter-input,
        .filter-select {
            height: 37px;

            border: 1px solid #dfe8e5;

            border-radius: 7px;

            padding: 0 11px;

            background: #ffffff;

            color: #26332f;

            font-family: inherit;

            font-size: 11px;

            outline: none;

            min-width: 160px;

            transition: border-color 0.2s ease,
                        box-shadow 0.2s ease;
        }


        .filter-input:focus,
        .filter-select:focus {
            border-color: #8acabb;

            box-shadow: 0 0 0 3px rgba(8, 127, 104, 0.07);
        }


        .search-group {
            flex: 1;

            min-width: 220px;
        }


        .search-wrapper {
            position: relative;
        }


        .search-wrapper i {
            position: absolute;

            left: 11px;

            top: 50%;

            transform: translateY(-50%);

            color: #9aa7a3;

            font-size: 13px;
        }


        .search-wrapper .filter-input {
            width: 100%;

            padding-left: 32px;
        }


        .btn-search {
            height: 37px;

            border: none;

            border-radius: 7px;

            padding: 0 15px;

            background: #087f68;

            color: #ffffff;

            font-family: inherit;

            font-size: 11px;

            font-weight: 500;

            cursor: pointer;

            display: inline-flex;

            align-items: center;

            gap: 6px;

            transition: background 0.2s ease;
        }


        .btn-search:hover {
            background: #066653;
        }


        .btn-reset {
            height: 37px;

            border: 1px solid #dfe8e5;

            border-radius: 7px;

            padding: 0 13px;

            background: #ffffff;

            color: #64736e;

            font-family: inherit;

            font-size: 11px;

            font-weight: 500;

            cursor: pointer;

            transition: all 0.2s ease;
        }


        .btn-reset:hover {
            background: #f5f8f7;

            color: #087f68;
        }


        /* =========================================================
           TABLE
        ========================================================= */

        .table-card {
            background: #ffffff;

            border: 1px solid #e5ebe9;

            border-radius: 12px;

            overflow: hidden;

            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.025);
        }


        .table-top {
            padding: 17px 18px;

            display: flex;

            align-items: center;

            justify-content: space-between;

            border-bottom: 1px solid #eef2f1;
        }


        .table-title {
            margin: 0;

            font-size: 14px;

            font-weight: 600;

            color: #1c2825;
        }


        .table-count {
            font-size: 10px;

            color: #94a19d;
        }


        .table-responsive {
            overflow-x: auto;
        }


        .trade-table {
            width: 100%;

            border-collapse: collapse;

            min-width: 850px;
        }


        .trade-table thead {
            background: #fafcfb;
        }


        .trade-table th {
            padding: 12px 16px;

            color: #82908c;

            font-size: 10px;

            font-weight: 500;

            text-align: left;

            white-space: nowrap;

            border-bottom: 1px solid #eef2f1;

            letter-spacing: 0.15px;
        }


        .trade-table td {
            padding: 14px 16px;

            color: #35423e;

            font-size: 11px;

            font-weight: 400;

            border-bottom: 1px solid #f0f3f2;

            white-space: nowrap;

            vertical-align: middle;
        }


        .trade-table tbody tr {
            transition: background 0.15s ease;
        }


        .trade-table tbody tr:hover {
            background: #fbfdfc;
        }


        .trade-table tbody tr:last-child td {
            border-bottom: none;
        }


        /* =========================================================
           SYMBOL
        ========================================================= */

        .symbol-name {
            font-size: 12px;

            font-weight: 600;

            color: #26332f;
        }


        .symbol-type {
            display: block;

            margin-top: 2px;

            font-size: 9px;

            color: #9aa7a3;
        }


        /* =========================================================
           ACTION BADGE
        ========================================================= */

        .action-badge {
            display: inline-flex;

            align-items: center;

            justify-content: center;

            min-width: 48px;

            padding: 4px 8px;

            border-radius: 5px;

            font-size: 9px;

            font-weight: 600;
        }


        .action-buy {
            background: #e9f7f2;

            color: #087f68;
        }


        .action-sell {
            background: #fff0f0;

            color: #dc2626;
        }


        /* =========================================================
           STATUS BADGE
        ========================================================= */

        .trade-status {
            font-size: 10px;

            color: #6f7d78;
        }


        /* =========================================================
           PNL
        ========================================================= */

        .pnl-positive {
            color: #087f68;

            font-weight: 600;
        }


        .pnl-negative {
            color: #dc2626;

            font-weight: 600;
        }


        /* =========================================================
           PAGINATION
        ========================================================= */

        .table-footer {
            border-top: 1px solid #eef2f1;

            padding: 13px 16px;

            display: flex;

            align-items: center;

            justify-content: space-between;
        }


        .table-footer-info {
            font-size: 10px;

            color: #94a19d;
        }


        .pagination {
            display: flex;

            align-items: center;

            gap: 4px;
        }


        .page-button {
            width: 30px;

            height: 30px;

            border: 1px solid #e0e8e5;

            background: #ffffff;

            color: #64736e;

            border-radius: 6px;

            font-family: inherit;

            font-size: 10px;

            cursor: pointer;

            display: flex;

            align-items: center;

            justify-content: center;
        }


        .page-button:hover {
            background: #f0f8f6;

            color: #087f68;

            border-color: #cfe2dc;
        }


        .page-button.active {
            background: #087f68;

            color: #ffffff;

            border-color: #087f68;
        }


        .page-button.disabled {
            opacity: 0.45;

            cursor: default;
        }


        /* =========================================================
           RESPONSIVE
        ========================================================= */

        @media (max-width: 768px) {

            .page-actions {
                display: none;
            }


            .filter-row {
                flex-direction: column;

                align-items: stretch;
            }


            .filter-group,
            .search-group {
                width: 100%;

                min-width: 100%;
            }


            .filter-input,
            .filter-select {
                width: 100%;
            }


            .btn-search,
            .btn-reset {
                width: 100%;

                justify-content: center;
            }


            .table-footer {
                flex-direction: column;

                gap: 10px;

                align-items: flex-start;
            }

        }

    </style>

</head>


<body>


<div class="app">


    <!-- =========================================================
         SIDEBAR
    ========================================================= -->

    <aside class="sidebar">


        <!-- LOGO -->

        <div class="logo">

            <i class="bi bi-graph-up-arrow"></i>

            <span>TradeAnalytics</span>

        </div>


        <!-- DASHBOARD -->

        <a href="dashboard.php" class="menu-item">

            <i class="bi bi-grid"></i>

            <span>Dashboard</span>

        </a>


        <!-- TRADE HISTORY -->

        <a href="trade-history.php" class="menu-item active">

            <i class="bi bi-clock-history"></i>

            <span>ประวัติการเทรด</span>

        </a>


        <!-- STATISTICS -->

        <a href="statistics.php" class="menu-item">

            <i class="bi bi-bar-chart"></i>

            <span>สถิติการเทรด</span>

        </a>


        <!-- REPORT -->

        <a href="reports.php" class="menu-item">

            <i class="bi bi-file-earmark-text"></i>

            <span>รายงาน</span>

        </a>


        <!-- SETTING -->

        <div class="menu-title">
            การตั้งค่า
        </div>


        <!-- NOTIFICATIONS -->

        <a href="notifications.php" class="menu-item">

            <i class="bi bi-telegram"></i>

            <span>การแจ้งเตือน</span>

        </a>


        <!-- PROFILE -->

        <a href="profile.php" class="menu-item">

            <i class="bi bi-person"></i>

            <span>บัญชีผู้ใช้งาน</span>

        </a>


        <!-- LOGOUT -->

        <div class="logout">

            <a href="#">

                <i class="bi bi-box-arrow-right"></i>

                <span>ออกจากระบบ</span>

            </a>

        </div>


    </aside>



    <!-- =========================================================
         MAIN
    ========================================================= -->

    <main class="main-content">


        <!-- =====================================================
             TOPBAR
        ===================================================== -->

        <header class="topbar">


            <div>

                <div class="welcome">
                    ยินดีต้อนรับ, ผู้ใช้งาน
                </div>

                <h1>
                    ประวัติการเทรด
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
                    aria-label="การแจ้งเตือน"
                >

                    <i class="bi bi-bell"></i>

                </button>


                <!-- USER -->

                <div class="avatar">
                    U
                </div>


            </div>

        </header>



        <!-- =====================================================
             CONTENT
        ===================================================== -->

        <section class="content">


            <!-- =================================================
                 PAGE TITLE
            ================================================= -->

            <div class="d-flex justify-content-between align-items-end mb-3">


                <div>

                    <div class="page-description">

                        รายการซื้อขายที่บันทึกจากระบบ MT5

                    </div>

                </div>


                <div class="page-actions">

                    <button
                        type="button"
                        class="btn-export"
                    >

                        <i class="bi bi-download"></i>

                        Export รายงาน

                    </button>

                </div>


            </div>



            <!-- =================================================
                 SUMMARY
            ================================================= -->

            <div class="row g-3 history-summary">


                <!-- TOTAL TRADES -->

                <div class="col-md-6 col-xl-3">

                    <div class="history-summary-card">

                        <div>

                            <div class="history-summary-title">
                                จำนวนการเทรด
                            </div>

                            <div class="history-summary-value">
                                <?= $totalTrades ?>
                            </div>

                        </div>


                        <div class="history-summary-icon">

                            <i class="bi bi-arrow-left-right"></i>

                        </div>

                    </div>

                </div>



                <!-- WIN -->

                <div class="col-md-6 col-xl-3">

                    <div class="history-summary-card">

                        <div>

                            <div class="history-summary-title">
                                ชนะ
                            </div>

                            <div class="history-summary-value green">
                                <?= $winningTrades ?>
                            </div>

                        </div>


                        <div class="history-summary-icon">

                            <i class="bi bi-check-circle"></i>

                        </div>

                    </div>

                </div>



                <!-- LOSS -->

                <div class="col-md-6 col-xl-3">

                    <div class="history-summary-card">

                        <div>

                            <div class="history-summary-title">
                                แพ้
                            </div>

                            <div class="history-summary-value red">
                                <?= $losingTrades ?>
                            </div>

                        </div>


                        <div
                            class="history-summary-icon"
                            style="
                                background:#fff2f2;
                                color:#dc2626;
                            "
                        >

                            <i class="bi bi-x-circle"></i>

                        </div>

                    </div>

                </div>



                <!-- WIN RATE -->

                <div class="col-md-6 col-xl-3">

                    <div class="history-summary-card">

                        <div>

                            <div class="history-summary-title">
                                Win Rate
                            </div>

                            <div class="history-summary-value">
                                <?= number_format($winRate, 1) ?>%
                            </div>

                        </div>


                        <div class="history-summary-icon">

                            <i class="bi bi-percent"></i>

                        </div>

                    </div>

                </div>


            </div>



            <!-- =================================================
                 FILTER
            ================================================= -->

            <div class="filter-card">


                <div class="filter-row">


                    <!-- SEARCH -->

                    <div class="filter-group search-group">

                        <label class="filter-label">
                            ค้นหา
                        </label>


                        <div class="search-wrapper">

                            <i class="bi bi-search"></i>

                            <input
                                type="text"
                                class="filter-input"
                                placeholder="ค้นหา Symbol เช่น EURUSD"
                                id="tradeSearch"
                            >

                        </div>

                    </div>



                    <!-- ACTION -->

                    <div class="filter-group">

                        <label class="filter-label">
                            ประเภท
                        </label>


                        <select
                            class="filter-select"
                            id="actionFilter"
                        >

                            <option value="">
                                ทั้งหมด
                            </option>

                            <option value="BUY">
                                BUY
                            </option>

                            <option value="SELL">
                                SELL
                            </option>

                        </select>

                    </div>



                    <!-- DATE -->

                    <div class="filter-group">

                        <label class="filter-label">
                            วันที่
                        </label>


                        <input
                            type="date"
                            class="filter-input"
                        >

                    </div>



                    <!-- SEARCH BUTTON -->

                    <button
                        type="button"
                        class="btn-search"
                        onclick="filterTrades()"
                    >

                        <i class="bi bi-search"></i>

                        ค้นหา

                    </button>



                    <!-- RESET -->

                    <button
                        type="button"
                        class="btn-reset"
                        onclick="resetFilters()"
                    >

                        รีเซ็ต

                    </button>


                </div>


            </div>



            <!-- =================================================
                 TABLE
            ================================================= -->

            <div class="table-card">


                <!-- TABLE HEADER -->

                <div class="table-top">


                    <h2 class="table-title">
                        รายการเทรด
                    </h2>


                    <span class="table-count">
                        <?= $totalTrades ?> รายการ
                    </span>


                </div>



                <!-- TABLE -->

                <div class="table-responsive">


                    <table class="trade-table">


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
                                    วันที่ / เวลา
                                </th>

                            </tr>

                        </thead>


                        <tbody id="tradeTableBody">


                            <?php foreach ($trades as $trade): ?>

                                <tr
                                    data-symbol="<?= htmlspecialchars($trade['symbol']) ?>"
                                    data-action="<?= htmlspecialchars($trade['action']) ?>"
                                >


                                    <!-- SYMBOL -->

                                    <td>

                                        <span class="symbol-name">

                                            <?= htmlspecialchars($trade['symbol']) ?>

                                        </span>


                                        <span class="symbol-type">

                                            Forex / Trading

                                        </span>

                                    </td>



                                    <!-- ACTION -->

                                    <td>

                                        <?php if ($trade['action'] === 'BUY'): ?>

                                            <span class="action-badge action-buy">

                                                BUY

                                            </span>

                                        <?php else: ?>

                                            <span class="action-badge action-sell">

                                                SELL

                                            </span>

                                        <?php endif; ?>

                                    </td>



                                    <!-- PRICE -->

                                    <td>

                                        <?= htmlspecialchars($trade['price']) ?>

                                    </td>



                                    <!-- LOT -->

                                    <td>

                                        <?= htmlspecialchars($trade['lot']) ?>

                                    </td>



                                    <!-- PNL -->

                                    <td>

                                        <?php if ($trade['pnl'] >= 0): ?>

                                            <span class="pnl-positive">

                                                +$<?= number_format($trade['pnl'], 2) ?>

                                            </span>

                                        <?php else: ?>

                                            <span class="pnl-negative">

                                                -$<?= number_format(abs($trade['pnl']), 2) ?>

                                            </span>

                                        <?php endif; ?>

                                    </td>



                                    <!-- STATUS -->

                                    <td>

                                        <span class="trade-status">

                                            <?= htmlspecialchars($trade['status']) ?>

                                        </span>

                                    </td>



                                    <!-- TIMESTAMP -->

                                    <td>

                                        <?= htmlspecialchars($trade['timestamp']) ?>

                                    </td>


                                </tr>

                            <?php endforeach; ?>


                        </tbody>


                    </table>


                </div>



                <!-- =================================================
                     FOOTER
                ================================================= -->

                <div class="table-footer">


                    <div class="table-footer-info">

                        แสดง <?= $totalTrades ?> รายการ

                    </div>


                    <div class="pagination">


                        <button
                            type="button"
                            class="page-button disabled"
                        >

                            <i class="bi bi-chevron-left"></i>

                        </button>


                        <button
                            type="button"
                            class="page-button active"
                        >
                            1
                        </button>


                        <button
                            type="button"
                            class="page-button"
                        >
                            2
                        </button>


                        <button
                            type="button"
                            class="page-button"
                        >
                            3
                        </button>


                        <button
                            type="button"
                            class="page-button"
                        >

                            <i class="bi bi-chevron-right"></i>

                        </button>


                    </div>


                </div>


            </div>


        </section>


    </main>


</div>



<!-- =========================================================
     JAVASCRIPT
========================================================= -->

<script>

    function filterTrades() {

        const search =
            document
                .getElementById('tradeSearch')
                .value
                .toLowerCase()
                .trim();


        const action =
            document
                .getElementById('actionFilter')
                .value;


        const rows =
            document.querySelectorAll(
                '#tradeTableBody tr'
            );


        rows.forEach(row => {

            const symbol =
                row
                    .getAttribute('data-symbol')
                    .toLowerCase();


            const rowAction =
                row.getAttribute('data-action');


            const searchMatch =
                symbol.includes(search);


            const actionMatch =
                action === ''
                || rowAction === action;


            if (searchMatch && actionMatch) {

                row.style.display = '';

            } else {

                row.style.display = 'none';

            }

        });

    }



    function resetFilters() {

        document.getElementById('tradeSearch').value = '';

        document.getElementById('actionFilter').value = '';

        const rows =
            document.querySelectorAll(
                '#tradeTableBody tr'
            );


        rows.forEach(row => {

            row.style.display = '';

        });

    }



    // กด Enter ในช่องค้นหา

    document
        .getElementById('tradeSearch')
        .addEventListener('keydown', function(event) {

            if (event.key === 'Enter') {

                filterTrades();

            }

        });

</script>


</body>

</html>