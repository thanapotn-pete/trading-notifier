

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
                                <span id="totalTrades">0</span>
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
                                <span id="winRate">0.0</span>%
                            </div>


                            <div class="statistics-description">
                                <span id="winningTrades">0</span> ครั้งที่ชนะ
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
                                <span id="netProfitSign">+$</span><span id="netProfit">0.00</span>
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
                                <span id="profitFactor">0.00</span>
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
                                <span id="winRateCenter">0.0</span>%
                            </div>


                            <div class="winloss-label">
                                Win Rate
                            </div>


                            <div class="winloss-legend">


                                <div class="legend-item">

                                    <span class="legend-dot win"></span>

                                    ชนะ <span id="winningTradesLegend">0</span>

                                </div>


                                <div class="legend-item">

                                    <span class="legend-dot loss"></span>

                                    แพ้ <span id="losingTrades">0</span>

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


                                <tbody id="symbolStatsBody">
                                    <tr>
                                        <td colspan="5" style="text-align:center; color:#9aa7a3; padding:25px;">
                                            กำลังโหลดข้อมูล...
                                        </td>
                                    </tr>
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
                                    <span id="winningTradesDetails">0</span>
                                </div>


                            </div>



                            <!-- LOSING -->

                            <div class="performance-item">


                                <div class="performance-label">
                                    Losing Trades
                                </div>


                                <div class="performance-value red">
                                    <span id="losingTrades">0</span>
                                </div>


                            </div>



                            <!-- AVG WIN -->

                            <div class="performance-item">


                                <div class="performance-label">
                                    Average Win
                                </div>


                                <div class="performance-value green">
                                    <span id="avgWin">+$0.00</span>
                                </div>


                            </div>



                            <!-- AVG LOSS -->

                            <div class="performance-item">


                                <div class="performance-label">
                                    Average Loss
                                </div>


                                <div class="performance-value red">
                                    <span id="avgLoss">-$0.00</span>
                                </div>


                            </div>



                            <!-- BEST TRADE -->

                            <div class="performance-item">


                                <div class="performance-label">
                                    Best Trade
                                </div>


                                <div class="performance-value green">
                                    <span id="bestTrade">+$0.00</span>
                                </div>


                            </div>



                            <!-- WORST TRADE -->

                            <div class="performance-item">


                                <div class="performance-label">
                                    Worst Trade
                                </div>


                                <div class="performance-value red">
                                    <span id="worstTrade">-$0.00</span>
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
    const API_BASE_URL = 'http://localhost:3000';

    let performanceChart = null;
    let winLossChart = null;
    let allTrades = [];
    let allStatistics = null;

    function getToken() {
        return localStorage.getItem('auth_token');
    }

    async function apiFetch(url) {
        const token = getToken();

        if (!token) {
            throw new Error('ไม่พบ session กรุณาเข้าสู่ระบบใหม่');
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || data.message || `HTTP ${response.status}`);
        }

        return data;
    }

    function formatNumber(value, decimals = 2) {
        const number = Number(value || 0);
        return number.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    function formatMoney(value) {
        const number = Number(value || 0);
        const sign = number >= 0 ? '+$' : '-$';
        return sign + formatNumber(Math.abs(number), 2);
    }

    function getTradeDate(trade) {
        const value = trade.closed_at || trade.timestamp || trade.created_at;
        if (!value) return null;

        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function getFilteredTrades(period) {
        if (period === 'all') {
            return [...allTrades];
        }

        const days = Number(period);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return allTrades.filter((trade) => {
            const date = getTradeDate(trade);
            return date && date >= cutoff;
        });
    }

    function calculateStatistics(trades) {
        const completedTrades = trades.filter(
            (trade) => trade.pnl !== null && trade.pnl !== undefined
        );

        const totalTrades = completedTrades.length;

        const wins = completedTrades.filter(
            (trade) => Number(trade.pnl || 0) > 0
        );

        const losses = completedTrades.filter(
            (trade) => Number(trade.pnl || 0) < 0
        );

        const totalProfit = wins.reduce(
            (sum, trade) => sum + Number(trade.pnl || 0),
            0
        );

        const totalLoss = losses.reduce(
            (sum, trade) => sum + Number(trade.pnl || 0),
            0
        );

        const totalPnl = completedTrades.reduce(
            (sum, trade) => sum + Number(trade.pnl || 0),
            0
        );

        const winRate = totalTrades > 0
            ? (wins.length / totalTrades) * 100
            : 0;

        const profitFactor = totalLoss < 0
            ? totalProfit / Math.abs(totalLoss)
            : (totalProfit > 0 ? Infinity : 0);

        const avgWin = wins.length > 0
            ? totalProfit / wins.length
            : 0;

        const avgLoss = losses.length > 0
            ? totalLoss / losses.length
            : 0;

        const bestTrade = completedTrades.length > 0
            ? completedTrades.reduce((best, trade) =>
                Number(trade.pnl || 0) > Number(best.pnl || 0)
                    ? trade
                    : best
            )
            : null;

        const worstTrade = completedTrades.length > 0
            ? completedTrades.reduce((worst, trade) =>
                Number(trade.pnl || 0) < Number(worst.pnl || 0)
                    ? trade
                    : worst
            )
            : null;

        const symbolMap = {};

        completedTrades.forEach((trade) => {
            const symbol = trade.symbol || 'Unknown';
            const pnl = Number(trade.pnl || 0);

            if (!symbolMap[symbol]) {
                symbolMap[symbol] = {
                    symbol,
                    trades: 0,
                    wins: 0,
                    losses: 0,
                    totalPnl: 0
                };
            }

            symbolMap[symbol].trades += 1;
            symbolMap[symbol].totalPnl += pnl;

            if (pnl > 0) {
                symbolMap[symbol].wins += 1;
            } else if (pnl < 0) {
                symbolMap[symbol].losses += 1;
            }
        });

        const bySymbol = Object.values(symbolMap).map((item) => ({
            symbol: item.symbol,
            trades: item.trades,
            wins: item.wins,
            losses: item.losses,
            winRate: item.trades > 0
                ? (item.wins / item.trades) * 100
                : 0,
            totalPnl: item.totalPnl
        }));

        return {
            totalTrades,
            wins: wins.length,
            losses: losses.length,
            totalProfit,
            totalLoss,
            totalPnl,
            winRate,
            profitFactor,
            avgWin,
            avgLoss,
            bestTrade,
            worstTrade,
            bySymbol
        };
    }

    function updateSummary(stats) {
        document.getElementById('totalTrades').textContent =
            Number(stats.totalTrades || 0).toLocaleString('en-US');

        document.getElementById('winRate').textContent =
            Number(stats.winRate || 0).toFixed(1);

        document.getElementById('winningTrades').textContent =
            Number(stats.wins || 0).toLocaleString('en-US');

        document.getElementById('losingTrades').textContent =
            Number(stats.losses || 0).toLocaleString('en-US');

        const netProfit = Number(stats.totalPnl || 0);
        const netProfitSign = document.getElementById('netProfitSign');

        netProfitSign.textContent = netProfit >= 0 ? '+$' : '-$';
        document.getElementById('netProfit').textContent =
            formatNumber(Math.abs(netProfit), 2);

        const profitFactor = Number(stats.profitFactor);
        document.getElementById('profitFactor').textContent =
            Number.isFinite(profitFactor)
                ? profitFactor.toFixed(2)
                : '∞';

        document.getElementById('avgWin').textContent =
            formatMoney(stats.avgWin);

        document.getElementById('avgLoss').textContent =
            formatMoney(stats.avgLoss);

        document.getElementById('bestTrade').textContent =
            stats.bestTrade
                ? formatMoney(stats.bestTrade.pnl)
                : '$0.00';

        document.getElementById('worstTrade').textContent =
            stats.worstTrade
                ? formatMoney(stats.worstTrade.pnl)
                : '$0.00';

        document.querySelector('.winloss-main').textContent =
            `${Number(stats.winRate || 0).toFixed(1)}%`;

        const legendItems = document.querySelectorAll('.legend-item');

        if (legendItems[0]) {
            legendItems[0].innerHTML =
                `<span class="legend-dot win"></span> ชนะ ${stats.wins || 0}`;
        }

        if (legendItems[1]) {
            legendItems[1].innerHTML =
                `<span class="legend-dot loss"></span> แพ้ ${stats.losses || 0}`;
        }

        const winningDetails = document.getElementById('winningTradesDetails');
        if (winningDetails) {
            winningDetails.textContent =
                Number(stats.wins || 0).toLocaleString('en-US');
        }

        const winningLegend = document.getElementById('winningTradesLegend');
        if (winningLegend) {
            winningLegend.textContent =
                Number(stats.wins || 0).toLocaleString('en-US');
        }
    }

    function updateSymbolTable(symbolStats) {
        const body = document.getElementById('symbolStatsBody');

        if (!symbolStats || symbolStats.length === 0) {
            body.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; color:#9aa7a3; padding:25px;">
                        ยังไม่มีข้อมูลการเทรด
                    </td>
                </tr>
            `;
            return;
        }

        body.innerHTML = symbolStats.map((item) => {
            const winRate = Number(item.winRate || 0);
            const pnl = Number(item.totalPnl || 0);

            return `
                <tr>
                    <td>
                        <span class="symbol-name">
                            ${escapeHtml(item.symbol)}
                        </span>
                        <span class="symbol-subtitle">
                            Trading Symbol
                        </span>
                    </td>

                    <td>
                        ${Number(item.trades || 0).toLocaleString('en-US')}
                    </td>

                    <td>
                        <span class="winrate-value">
                            ${winRate.toFixed(1)}%
                        </span>
                    </td>

                    <td>
                        <div class="progress-wrapper">
                            <div class="progress-bar-bg">
                                <div
                                    class="progress-bar-fill"
                                    style="width: ${Math.min(100, Math.max(0, winRate))}%;"
                                ></div>
                            </div>

                            <span style="font-size:10px; color:#82908c;">
                                ${winRate.toFixed(1)}%
                            </span>
                        </div>
                    </td>

                    <td>
                        <span class="${pnl >= 0 ? 'pnl-positive' : 'performance-value red'}">
                            ${formatMoney(pnl)}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function buildPerformanceData(trades) {
        const completed = trades
            .filter((trade) => trade.pnl !== null && trade.pnl !== undefined)
            .map((trade) => ({
                ...trade,
                date: getTradeDate(trade)
            }))
            .filter((trade) => trade.date)
            .sort((a, b) => a.date - b.date);

        let cumulative = 0;

        const labels = [];
        const values = [];

        completed.forEach((trade) => {
            cumulative += Number(trade.pnl || 0);

            labels.push(
                trade.date.toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short'
                })
            );

            values.push(Number(cumulative.toFixed(2)));
        });

        return { labels, values };
    }

    function updatePerformanceChart(trades) {
        const { labels, values } = buildPerformanceData(trades);

        if (performanceChart) {
            performanceChart.destroy();
        }

        performanceChart = new Chart(
            document.getElementById('performanceChart'),
            {
                type: 'line',

                data: {
                    labels: labels.length ? labels : ['ไม่มีข้อมูล'],

                    datasets: [{
                        label: 'กำไรสะสม',
                        data: values.length ? values : [0],
                        borderColor: '#087f68',
                        backgroundColor: 'rgba(8, 127, 104, 0.10)',
                        borderWidth: 2,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        tension: 0.35,
                        fill: true
                    }]
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
                                family: 'IBM Plex Sans Thai'
                            },
                            bodyFont: {
                                family: 'IBM Plex Sans Thai'
                            },
                            padding: 10,
                            displayColors: false,

                            callbacks: {
                                label: function(context) {
                                    return 'กำไรสะสม: $' +
                                        formatNumber(context.parsed.y, 2);
                                }
                            }
                        }
                    },

                    scales: {
                        x: {
                            grid: {
                                display: false
                            },

                            ticks: {
                                font: {
                                    family: 'IBM Plex Sans Thai',
                                    size: 10
                                },
                                color: '#8a9793'
                            }
                        },

                        y: {
                            grid: {
                                color: '#eef2f1'
                            },

                            ticks: {
                                font: {
                                    family: 'IBM Plex Sans Thai',
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
    }

    function updateWinLossChart(stats) {
        if (winLossChart) {
            winLossChart.destroy();
        }

        winLossChart = new Chart(
            document.getElementById('winLossChart'),
            {
                type: 'doughnut',

                data: {
                    labels: ['ชนะ', 'แพ้'],

                    datasets: [{
                        data: [
                            Number(stats.wins || 0),
                            Number(stats.losses || 0)
                        ],

                        backgroundColor: [
                            '#087f68',
                            '#dc2626'
                        ],

                        borderWidth: 0,
                        hoverOffset: 4
                    }]
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
    }

    async function loadStatistics() {
        try {
            const trades = await apiFetch(
                `${API_BASE_URL}/api/trades?limit=1000`
            );

            allTrades = Array.isArray(trades)
                ? trades
                : (trades.trades || trades.data || []);

            allStatistics = null;

            const filter = document.getElementById('periodFilter');

            // ค่าเริ่มต้นของหน้าเป็น 30 วัน
            const filteredTrades = getFilteredTrades(filter.value === '7 วันที่ผ่านมา'
                ? '7'
                : filter.value === '3 เดือน'
                    ? '90'
                    : filter.value === 'ทั้งหมด'
                        ? 'all'
                        : '30'
            );

            const stats = calculateStatistics(filteredTrades);

            updateSummary(stats);
            updateSymbolTable(stats.bySymbol);
            updatePerformanceChart(filteredTrades);
            updateWinLossChart(stats);

        } catch (error) {
            console.error('Statistics API Error:', error);

            const message =
                error.message || 'ไม่สามารถโหลดข้อมูลสถิติได้';

            document.getElementById('symbolStatsBody').innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; color:#dc2626; padding:25px;">
                        ${escapeHtml(message)}
                    </td>
                </tr>
            `;
        }
    }

    function getPeriodValue() {
        const value = document.getElementById('periodFilter').value;

        if (value === '7 วันที่ผ่านมา') return '7';
        if (value === '3 เดือน') return '90';
        if (value === 'ทั้งหมด') return 'all';

        return '30';
    }

    document.getElementById('periodFilter').addEventListener(
        'change',
        function() {
            const filteredTrades = getFilteredTrades(getPeriodValue());
            const stats = calculateStatistics(filteredTrades);

            updateSummary(stats);
            updateSymbolTable(stats.bySymbol);
            updatePerformanceChart(filteredTrades);
            updateWinLossChart(stats);
        }
    );

    document.addEventListener('DOMContentLoaded', loadStatistics);
</script>


</body>

</html>