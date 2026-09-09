<?php
/*
|--------------------------------------------------------------------------
| Trade History
|--------------------------------------------------------------------------
| ข้อมูลการเทรดจะถูกโหลดจาก Node.js API ตามผู้ใช้งานที่ Login อยู่
|--------------------------------------------------------------------------
*/
$trades = [];
$totalTrades = 0;
$winningTrades = 0;
$losingTrades = 0;
$totalProfit = 0;
$totalLoss = 0;
$totalPnl = 0;
$winRate = 0;
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
/*
|--------------------------------------------------------------------------
| Trade History - Real API
|--------------------------------------------------------------------------
| Frontend -> Node.js API -> Supabase
| ใช้ token ของผู้ใช้งานที่ login อยู่จาก localStorage.auth_token
|--------------------------------------------------------------------------
*/

const TRADE_HISTORY_API_BASE_URL = 'http://localhost:3000';
const TRADE_HISTORY_TOKEN_KEY = 'auth_token';

let allTrades = [];
let filteredTrades = [];
let currentPage = 1;
const rowsPerPage = 10;

/* =========================
   Helper
========================= */

function getAuthToken() {
    return localStorage.getItem(TRADE_HISTORY_TOKEN_KEY);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function getSymbol(trade) {
    return trade.symbol ?? trade.instrument ?? trade.ticker ?? '-';
}

function getAction(trade) {
    const value = trade.action ?? trade.side ?? trade.type ?? trade.direction ?? '';
    const normalized = String(value).toUpperCase();

    if (normalized.includes('SELL')) return 'SELL';
    if (normalized.includes('BUY')) return 'BUY';

    return normalized || '-';
}

function getPrice(trade) {
    return trade.close_price ??
           trade.closePrice ??
           trade.price ??
           trade.open_price ??
           trade.openPrice ??
           '-';
}

function getLot(trade) {
    return trade.lot ??
           trade.volume ??
           trade.quantity ??
           trade.lots ??
           '-';
}

function getPnl(trade) {
    return toNumber(
        trade.pnl ??
        trade.profit ??
        trade.net_profit ??
        trade.netProfit ??
        0
    );
}

function getStatus(trade) {
    return trade.status ??
           trade.close_reason ??
           trade.closeReason ??
           trade.reason ??
           '-';
}

function getTimestamp(trade) {
    return trade.closed_at ??
           trade.closedAt ??
           trade.timestamp ??
           trade.created_at ??
           trade.createdAt ??
           trade.opened_at ??
           trade.openedAt ??
           '-';
}

function formatNumber(value, decimals = 2) {
    return toNumber(value).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function formatPrice(value) {
    if (value === '-' || value === null || value === undefined || value === '') {
        return '-';
    }

    const n = Number(value);

    if (!Number.isFinite(n)) {
        return String(value);
    }

    return n.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 5
    });
}

function formatTimestamp(value) {
    if (!value || value === '-') return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getTradeDate(value) {
    if (!value || value === '-') return null;

    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
        return date;
    }

    // รองรับวันที่รูปแบบ DD/MM/YYYY
    const match = String(value).match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
    );

    if (match) {
        const [, day, month, year] = match;
        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        );
    }

    return null;
}

/* =========================
   API
========================= */

async function loadTrades() {
    const token = getAuthToken();

    if (!token) {
        window.location.href = 'login.php';
        return;
    }

    try {
        const response = await fetch(
            `${TRADE_HISTORY_API_BASE_URL}/api/trades?limit=1000`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem(TRADE_HISTORY_TOKEN_KEY);
            window.location.href = 'login.php';
            return;
        }

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        allTrades = Array.isArray(data)
            ? data
            : (Array.isArray(data.trades) ? data.trades : []);

        filteredTrades = [...allTrades];

        currentPage = 1;

        updateSummary(allTrades);
        renderTable();
        updateTableCount();
        updatePagination();

        console.log(
            `[Trade History] Loaded ${allTrades.length} trades`
        );

    } catch (error) {
        console.error('[Trade History] Failed to load trades:', error);

        allTrades = [];
        filteredTrades = [];

        updateSummary([]);
        renderTable();
        updateTableCount();
        updatePagination();

        showEmptyState('ไม่สามารถโหลดข้อมูลการเทรดได้');
    }
}

/* =========================
   Summary
========================= */

function updateSummary(trades) {
    const total = trades.length;

    let wins = 0;
    let losses = 0;
    let totalProfit = 0;
    let totalLoss = 0;

    trades.forEach(trade => {
        const pnl = getPnl(trade);

        if (pnl > 0) {
            wins++;
            totalProfit += pnl;
        } else if (pnl < 0) {
            losses++;
            totalLoss += Math.abs(pnl);
        }
    });

    const winRate = total > 0
        ? (wins / total) * 100
        : 0;

    const summaryValues =
        document.querySelectorAll('.history-summary-value');

    if (summaryValues.length >= 4) {
        summaryValues[0].textContent = total;
        summaryValues[1].textContent = wins;
        summaryValues[2].textContent = losses;
        summaryValues[3].textContent = `${winRate.toFixed(1)}%`;
    }
}

/* =========================
   Table
========================= */

function renderTable() {
    const tbody = document.getElementById('tradeTableBody');

    if (!tbody) return;

    const totalPages = Math.max(
        1,
        Math.ceil(filteredTrades.length / rowsPerPage)
    );

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * rowsPerPage;
    const pageTrades = filteredTrades.slice(
        startIndex,
        startIndex + rowsPerPage
    );

    if (pageTrades.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="
                        text-align:center;
                        padding:40px 16px;
                        color:#94a19d;
                    ">
                    <i class="bi bi-inbox"
                       style="font-size:28px;display:block;margin-bottom:8px;"></i>
                    ไม่พบข้อมูลการเทรด
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = pageTrades.map(trade => {
        const symbol = getSymbol(trade);
        const action = getAction(trade);
        const price = getPrice(trade);
        const lot = getLot(trade);
        const pnl = getPnl(trade);
        const status = getStatus(trade);
        const timestamp = getTimestamp(trade);

        const actionClass =
            action === 'BUY'
                ? 'action-buy'
                : 'action-sell';

        const pnlClass =
            pnl >= 0
                ? 'pnl-positive'
                : 'pnl-negative';

        const pnlText =
            pnl >= 0
                ? `+$${formatNumber(pnl)}`
                : `-$${formatNumber(Math.abs(pnl))}`;

        return `
            <tr
                data-symbol="${escapeHtml(symbol)}"
                data-action="${escapeHtml(action)}"
            >
                <td>
                    <span class="symbol-name">
                        ${escapeHtml(symbol)}
                    </span>
                    <span class="symbol-type">
                        Forex / Trading
                    </span>
                </td>

                <td>
                    <span class="action-badge ${actionClass}">
                        ${escapeHtml(action)}
                    </span>
                </td>

                <td>
                    ${escapeHtml(formatPrice(price))}
                </td>

                <td>
                    ${escapeHtml(lot)}
                </td>

                <td>
                    <span class="${pnlClass}">
                        ${pnlText}
                    </span>
                </td>

                <td>
                    <span class="trade-status">
                        ${escapeHtml(status)}
                    </span>
                </td>

                <td>
                    ${escapeHtml(formatTimestamp(timestamp))}
                </td>
            </tr>
        `;
    }).join('');
}

function showEmptyState(message) {
    const tbody = document.getElementById('tradeTableBody');

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="7"
                style="
                    text-align:center;
                    padding:40px 16px;
                    color:#94a19d;
                ">
                <i class="bi bi-inbox"
                   style="font-size:28px;display:block;margin-bottom:8px;"></i>
                ${escapeHtml(message)}
            </td>
        </tr>
    `;
}

function updateTableCount() {
    const count = document.querySelector('.table-count');
    const footerInfo = document.querySelector('.table-footer-info');

    if (count) {
        count.textContent = `${filteredTrades.length} รายการ`;
    }

    if (footerInfo) {
        if (filteredTrades.length === 0) {
            footerInfo.textContent = 'ไม่พบรายการ';
        } else {
            const start =
                ((currentPage - 1) * rowsPerPage) + 1;

            const end = Math.min(
                currentPage * rowsPerPage,
                filteredTrades.length
            );

            footerInfo.textContent =
                `แสดง ${start}-${end} จาก ${filteredTrades.length} รายการ`;
        }
    }
}

/* =========================
   Filter
========================= */

function filterTrades() {
    const searchInput =
        document.getElementById('tradeSearch');

    const actionInput =
        document.getElementById('actionFilter');

    const dateInput =
        document.getElementById('dateFilter');

    const search =
        searchInput?.value.toLowerCase().trim() || '';

    const action =
        actionInput?.value.toUpperCase() || '';

    const selectedDate =
        dateInput?.value || '';

    filteredTrades = allTrades.filter(trade => {
        const symbol =
            String(getSymbol(trade)).toLowerCase();

        const tradeAction =
            getAction(trade).toUpperCase();

        const symbolMatch =
            symbol.includes(search);

        const actionMatch =
            action === '' ||
            tradeAction === action;

        let dateMatch = true;

        if (selectedDate) {
            const tradeDate =
                getTradeDate(getTimestamp(trade));

            if (!tradeDate) {
                dateMatch = false;
            } else {
                const year =
                    tradeDate.getFullYear();

                const month =
                    String(tradeDate.getMonth() + 1)
                        .padStart(2, '0');

                const day =
                    String(tradeDate.getDate())
                        .padStart(2, '0');

                const tradeDateString =
                    `${year}-${month}-${day}`;

                dateMatch =
                    tradeDateString === selectedDate;
            }
        }

        return (
            symbolMatch &&
            actionMatch &&
            dateMatch
        );
    });

    currentPage = 1;

    updateSummary(filteredTrades);
    renderTable();
    updateTableCount();
    updatePagination();
}

function resetFilters() {
    const searchInput =
        document.getElementById('tradeSearch');

    const actionInput =
        document.getElementById('actionFilter');

    const dateInput =
        document.getElementById('dateFilter');

    if (searchInput) searchInput.value = '';
    if (actionInput) actionInput.value = '';
    if (dateInput) dateInput.value = '';

    filteredTrades = [...allTrades];
    currentPage = 1;

    updateSummary(filteredTrades);
    renderTable();
    updateTableCount();
    updatePagination();
}

/* =========================
   Pagination
========================= */

function updatePagination() {
    const pagination =
        document.querySelector('.pagination');

    if (!pagination) return;

    const totalPages = Math.max(
        1,
        Math.ceil(filteredTrades.length / rowsPerPage)
    );

    let html = '';

    html += `
        <button
            type="button"
            class="page-button ${currentPage === 1 ? 'disabled' : ''}"
            onclick="goToPage(${currentPage - 1})"
            ${currentPage === 1 ? 'disabled' : ''}
        >
            <i class="bi bi-chevron-left"></i>
        </button>
    `;

    const maxButtons = 5;

    let startPage =
        Math.max(1, currentPage - 2);

    let endPage =
        Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
        startPage =
            Math.max(1, endPage - maxButtons + 1);
    }

    for (let page = startPage; page <= endPage; page++) {
        html += `
            <button
                type="button"
                class="page-button ${page === currentPage ? 'active' : ''}"
                onclick="goToPage(${page})"
            >
                ${page}
            </button>
        `;
    }

    html += `
        <button
            type="button"
            class="page-button ${currentPage === totalPages ? 'disabled' : ''}"
            onclick="goToPage(${currentPage + 1})"
            ${currentPage === totalPages ? 'disabled' : ''}
        >
            <i class="bi bi-chevron-right"></i>
        </button>
    `;

    pagination.innerHTML = html;
}

function goToPage(page) {
    const totalPages = Math.max(
        1,
        Math.ceil(filteredTrades.length / rowsPerPage)
    );

    if (page < 1 || page > totalPages) {
        return;
    }

    currentPage = page;

    renderTable();
    updateTableCount();
    updatePagination();
}

/* =========================
   Export CSV
========================= */

function exportTradesCSV() {
    if (filteredTrades.length === 0) {
        alert('ไม่มีข้อมูลการเทรดสำหรับ Export');
        return;
    }

    const headers = [
        'Symbol',
        'Action',
        'Price',
        'Lot',
        'P/L',
        'Status',
        'Date/Time'
    ];

    const rows = filteredTrades.map(trade => [
        getSymbol(trade),
        getAction(trade),
        getPrice(trade),
        getLot(trade),
        getPnl(trade),
        getStatus(trade),
        getTimestamp(trade)
    ]);

    const csv = [
        headers,
        ...rows
    ]
        .map(row =>
            row.map(value =>
                `"${String(value ?? '')
                    .replace(/"/g, '""')}"`
            ).join(',')
        )
        .join('\n');

    const blob = new Blob(
        ['\uFEFF' + csv],
        {
            type: 'text/csv;charset=utf-8;'
        }
    );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement('a');

    link.href = url;
    link.download =
        `trade-history-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

/* =========================
   Events
========================= */

document.addEventListener('DOMContentLoaded', () => {

    const exportButton =
        document.querySelector('.btn-export');

    if (exportButton) {
        exportButton.addEventListener(
            'click',
            exportTradesCSV
        );
    }

    const searchInput =
        document.getElementById('tradeSearch');

    if (searchInput) {
        searchInput.addEventListener(
            'keydown',
            event => {
                if (event.key === 'Enter') {
                    filterTrades();
                }
            }
        );
    }

    const dateInput =
        document.getElementById('dateFilter');

    if (dateInput) {
        dateInput.addEventListener(
            'change',
            filterTrades
        );
    }

    loadTrades();
});
</script>


</body>

</html>
