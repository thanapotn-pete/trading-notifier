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

                <div class="welcome" id="welcomeUser">
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

                <div class="avatar" id="userAvatar">
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

                            <div class="stat-value profit" id="netProfit">
                                +$0.00
                            </div>

                            <div class="stat-description" id="profitDescription">
                                ยังไม่มีข้อมูลการเทรด
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

                            <div class="stat-value" id="winRate">
                                0.0%
                            </div>

                            <div class="stat-description" id="tradeCountDescription">
                                จาก 0 ออเดอร์
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

                            <div class="stat-value" id="profitFactor">
                                0.00
                            </div>

                            <div class="stat-description">
                                จากข้อมูลการเทรด
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

                            <div class="stat-value risk" id="riskScore">
                                LOW
                            </div>

                            <div class="stat-description" id="riskDescription">
                                ยังไม่มีข้อมูล
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
                                    data-period="7"
                                >
                                    1W
                                </button>


                                <button
                                    type="button"
                                    class="period"
                                    data-period="30"
                                >
                                    1M
                                </button>


                                <button
                                    type="button"
                                    class="period"
                                    data-period="90"
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


                        <div class="trade-list" id="recentTrades">

                            <div class="text-center py-4 text-muted">
                                กำลังโหลดข้อมูล...
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

                                <strong id="openNotificationStatus">
                                    กำลังโหลด...
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

                                <strong id="closeNotificationStatus">
                                    กำลังโหลด...
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

                                <strong id="riskNotificationStatus">
                                    กำลังโหลด...
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



<script>

const DASHBOARD_API_BASE_URL = 'http://localhost:3000';

let dashboardTrades = [];
let dashboardEquityChart = null;
let currentPeriod = 7;
let dashboardProfile = null;
let dashboardNotificationSettings = null;


// =====================================================
// GET TOKEN
// =====================================================

function getAuthToken() {
    return localStorage.getItem('auth_token');
}


// =====================================================
// LOAD DASHBOARD DATA
// =====================================================

async function loadDashboard() {

    const token = getAuthToken();

    if (!token) {
        window.location.href = 'login.php';
        return;
    }

    try {

        console.log('[Dashboard] Loading dashboard data...');

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const [tradesResponse, profileResponse, settingsResponse] =
            await Promise.all([
                fetch(
                    `${DASHBOARD_API_BASE_URL}/api/trades?limit=1000`,
                    {
                        method: 'GET',
                        headers
                    }
                ),
                fetch(
                    `${DASHBOARD_API_BASE_URL}/api/profile`,
                    {
                        method: 'GET',
                        headers
                    }
                ),
                fetch(
                    `${DASHBOARD_API_BASE_URL}/api/notification-settings`,
                    {
                        method: 'GET',
                        headers
                    }
                )
            ]);

        if (
            tradesResponse.status === 401 ||
            profileResponse.status === 401 ||
            settingsResponse.status === 401
        ) {
            console.warn('[Dashboard] Session expired');

            localStorage.removeItem('auth_token');
            window.location.href = 'login.php';
            return;
        }

        if (!tradesResponse.ok) {
            throw new Error(`Trades API HTTP ${tradesResponse.status}`);
        }

        const tradeData = await tradesResponse.json();
        dashboardTrades =
            Array.isArray(tradeData.trades)
                ? tradeData.trades
                : [];

        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            dashboardProfile = profileData.user || profileData || null;
        }

        if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json();
            dashboardNotificationSettings =
                settingsData.settings || settingsData || null;
        }

        console.log(
            '[Dashboard] Trades:',
            dashboardTrades.length
        );

        updateUserInfo();
        updateNotificationStatus();
        updateDashboard();

    } catch (error) {

        console.error(
            '[Dashboard] API Error:',
            error
        );

        document.getElementById(
            'recentTrades'
        ).innerHTML = `
            <div class="text-center py-4 text-danger">
                ไม่สามารถโหลดข้อมูลการเทรดได้
            </div>
        `;
    }
}


// =====================================================
// GET PNL
// =====================================================

function getPnl(trade) {

    const value =
        trade.pnl ??
        trade.profit ??
        trade.net_pnl ??
        trade.netProfit ??
        0;

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
}


// =====================================================
// GET SYMBOL
// =====================================================

function getSymbol(trade) {

    return (
        trade.symbol ??
        trade.instrument ??
        trade.ticker ??
        '-'
    );
}


// =====================================================
// GET ACTION
// =====================================================

function getAction(trade) {

    const action =
        trade.action ??
        trade.type ??
        trade.side ??
        trade.order_type ??
        '';

    return String(action).toLowerCase();
}


// =====================================================
// GET LOT
// =====================================================

function getLot(trade) {

    const lot = Number(
        trade.lot ??
        trade.lots ??
        trade.volume ??
        trade.quantity ??
        0
    );

    return Number.isFinite(lot)
        ? lot
        : 0;
}


// =====================================================
// GET STATUS
// =====================================================

function getStatus(trade) {

    return (
        trade.status ??
        trade.result ??
        trade.close_reason ??
        ''
    );
}

// =====================================================
// CLOSED TRADE CHECK
// =====================================================

function isClosedTrade(trade) {

    const status = String(
        trade.status ??
        trade.result ??
        ''
    ).toLowerCase();

    return (
        status === 'closed' ||
        status === 'close' ||
        Boolean(trade.closed_at)
    );
}


// =====================================================
// USER INFO
// =====================================================

function updateUserInfo() {

    const welcomeElement =
        document.getElementById('welcomeUser');

    const avatarElement =
        document.getElementById('userAvatar');

    if (!dashboardProfile) {
        return;
    }

    const name =
        dashboardProfile.full_name ??
        dashboardProfile.name ??
        dashboardProfile.username ??
        dashboardProfile.email ??
        'ผู้ใช้งาน';

    const displayName =
        String(name).trim() || 'ผู้ใช้งาน';

    if (welcomeElement) {
        welcomeElement.textContent =
            `ยินดีต้อนรับ, ${displayName}`;
    }

    if (avatarElement) {
        avatarElement.textContent =
            displayName.charAt(0).toUpperCase();
    }
}


// =====================================================
// NOTIFICATION STATUS
// =====================================================

function updateNotificationStatus() {

    const settings =
        dashboardNotificationSettings;

    if (!settings) {
        return;
    }

    const openElement =
        document.getElementById('openNotificationStatus');

    const closeElement =
        document.getElementById('closeNotificationStatus');

    const riskElement =
        document.getElementById('riskNotificationStatus');

    const masterEnabled =
        settings.enabled !== false;

    const openEnabled =
        masterEnabled &&
        settings.notify_buy !== false &&
        settings.notify_sell !== false;

    const closeEnabled =
        masterEnabled &&
        settings.notify_close !== false;

    const riskEnabled =
        masterEnabled &&
        settings.notify_risk !== false;

    if (openElement) {
        openElement.textContent =
            openEnabled
                ? 'เปิดใช้งาน'
                : 'ปิดใช้งาน';
    }

    if (closeElement) {
        closeElement.textContent =
            closeEnabled
                ? 'เปิดใช้งาน'
                : 'ปิดใช้งาน';
    }

    if (riskElement) {
        riskElement.textContent =
            riskEnabled
                ? 'เปิดใช้งาน'
                : 'ปิดใช้งาน';
    }
}


// =====================================================
// GET DATE
// =====================================================

function getTradeDate(trade) {

    return (
        trade.closed_at ??
        trade.timestamp ??
        trade.created_at ??
        trade.opened_at ??
        trade.date ??
        trade.time ??
        null
    );
}


// =====================================================
// GET FILTERED TRADES
// =====================================================

function getFilteredTrades() {

    if (currentPeriod === 'all') {
        return [...dashboardTrades];
    }

    const now = new Date();

    const startDate = new Date(now);

    startDate.setDate(
        startDate.getDate() - Number(currentPeriod)
    );

    return dashboardTrades.filter(trade => {

        const dateValue = getTradeDate(trade);

        if (!dateValue) {
            return false;
        }

        const tradeDate = new Date(dateValue);

        return (
            !Number.isNaN(tradeDate.getTime()) &&
            tradeDate >= startDate &&
            tradeDate <= now
        );

    });
}


// =====================================================
// CALCULATE STATISTICS
// =====================================================

function calculateStatistics(trades) {

    // Dashboard statistics should be based on completed trades.
    // Open positions must not affect Win Rate / Profit Factor.
    const closedTrades =
        trades.filter(isClosedTrade);

    const totalTrades =
        closedTrades.length;

    const wins =
        closedTrades.filter(
            trade => getPnl(trade) > 0
        );

    const losses =
        closedTrades.filter(
            trade => getPnl(trade) < 0
        );

    const totalProfit =
        wins.reduce(
            (sum, trade) =>
                sum + getPnl(trade),
            0
        );

    const totalLoss =
        losses.reduce(
            (sum, trade) =>
                sum + getPnl(trade),
            0
        );

    const netProfit =
        totalProfit + totalLoss;

    const winRate =
        totalTrades > 0
            ? (wins.length / totalTrades) * 100
            : 0;

    let profitFactor = 0;

    if (totalLoss < 0) {

        profitFactor =
            totalProfit /
            Math.abs(totalLoss);

    } else if (totalProfit > 0) {

        profitFactor = Infinity;

    }

    return {
        totalTrades,
        wins: wins.length,
        losses: losses.length,
        totalProfit,
        totalLoss,
        netProfit,
        winRate,
        profitFactor,
        closedTrades
    };
}


// =====================================================
// UPDATE DASHBOARD
// =====================================================

function updateDashboard() {

    const filteredTrades =
        getFilteredTrades();

    const stats =
        calculateStatistics(
            filteredTrades
        );


    // NET PROFIT

    const netProfitElement =
        document.getElementById(
            'netProfit'
        );

    netProfitElement.textContent =
        `${stats.netProfit >= 0 ? '+' : '-'}$${Math.abs(stats.netProfit).toFixed(2)}`;

    netProfitElement.classList.toggle(
        'profit',
        stats.netProfit >= 0
    );

    netProfitElement.classList.toggle(
        'loss',
        stats.netProfit < 0
    );


    // WIN RATE

    document.getElementById(
        'winRate'
    ).textContent =
        `${stats.winRate.toFixed(1)}%`;

    document.getElementById(
        'tradeCountDescription'
    ).textContent =
        `จาก ${stats.totalTrades} ออเดอร์`;


    // PROFIT FACTOR

    document.getElementById(
        'profitFactor'
    ).textContent =

        Number.isFinite(
            stats.profitFactor
        )

            ? stats.profitFactor.toFixed(2)

            : stats.totalProfit > 0
                ? '∞'
                : '0.00';


    // PROFIT DESCRIPTION

    document.getElementById(
        'profitDescription'
    ).textContent =

        stats.totalTrades > 0
            ? `${stats.wins} Win / ${stats.losses} Loss`
            : 'ยังไม่มีข้อมูลการเทรด';


    // RISK SCORE

    updateRiskScore(stats);


    // RECENT TRADES

    renderRecentTrades();


    // EQUITY CURVE

    renderEquityChart(
        filteredTrades
    );
}


// =====================================================
// RISK SCORE
// =====================================================

function calculateMaxDrawdown(trades) {

    const sortedTrades =
        [...trades]
            .filter(isClosedTrade)
            .sort((a, b) => {
                const dateA =
                    new Date(getTradeDate(a) || 0).getTime();

                const dateB =
                    new Date(getTradeDate(b) || 0).getTime();

                return dateA - dateB;
            });

    let equity = 0;
    let peak = 0;
    let maxDrawdown = 0;

    sortedTrades.forEach(trade => {

        equity += getPnl(trade);

        peak = Math.max(peak, equity);

        const drawdown =
            peak - equity;

        maxDrawdown =
            Math.max(maxDrawdown, drawdown);
    });

    return maxDrawdown;
}


function updateRiskScore(stats) {

    const riskElement =
        document.getElementById(
            'riskScore'
        );

    const descriptionElement =
        document.getElementById(
            'riskDescription'
        );

    if (stats.totalTrades === 0) {

        riskElement.textContent =
            'LOW';

        descriptionElement.textContent =
            'ยังไม่มีข้อมูล';

        return;
    }

    const maxDrawdown =
        calculateMaxDrawdown(stats.closedTrades);

    let risk = 'LOW';

    if (
        stats.winRate < 40 ||
        maxDrawdown >= 100
    ) {

        risk = 'HIGH';

    } else if (
        stats.winRate < 55 ||
        maxDrawdown >= 50
    ) {

        risk = 'MEDIUM';

    }

    riskElement.textContent =
        risk;

    descriptionElement.textContent =
        `Win Rate ${stats.winRate.toFixed(1)}% · Max DD $${maxDrawdown.toFixed(2)}`;
}


// =====================================================
// RENDER RECENT TRADES
// =====================================================

function renderRecentTrades() {

    const container =
        document.getElementById(
            'recentTrades'
        );

    if (!dashboardTrades.length) {

        container.innerHTML = `
            <div class="text-center py-4 text-muted">
                ยังไม่มีข้อมูลการเทรด
            </div>
        `;

        return;
    }

    const recentTrades =
        [...dashboardTrades]
            .sort((a, b) => {

                const dateA =
                    new Date(
                        getTradeDate(a) || 0
                    ).getTime();

                const dateB =
                    new Date(
                        getTradeDate(b) || 0
                    ).getTime();

                return dateB - dateA;

            })
            .slice(0, 4);

    container.innerHTML =
        recentTrades.map(
            trade => {

                const pnl =
                    getPnl(trade);

                const symbol =
                    getSymbol(trade);

                const action =
                    getAction(trade);

                const lot =
                    getLot(trade);

                const status =
                    getStatus(trade);

                let actionText =
                    'Trade';

                if (
                    action.includes('buy')
                ) {

                    actionText =
                        'Buy';

                } else if (
                    action.includes('sell')
                ) {

                    actionText =
                        'Sell';

                } else if (
                    action
                ) {

                    actionText =
                        action;

                }

                const statusText =
                    status || 'Closed';

                return `
                    <div class="trade-item">

                        <div>

                            <strong>
                                ${escapeHtml(symbol)}
                            </strong>

                            <small>
                                ${escapeHtml(actionText)}
                                · ${lot.toFixed(2)} lot
                                · ${escapeHtml(statusText)}
                            </small>

                        </div>

                        <strong
                            class="${pnl >= 0 ? 'profit' : 'loss'}"
                        >
                            ${pnl >= 0 ? '+' : '-'}$${Math.abs(pnl).toFixed(2)}
                        </strong>

                    </div>
                `;

            }
        ).join('');
}


// =====================================================
// EQUITY CURVE
// =====================================================

function renderEquityChart(trades) {

    const closedTrades =
        trades.filter(isClosedTrade);

    const canvas =
        document.getElementById(
            'equityChart'
        );

    if (!canvas) {
        return;
    }

    const sortedTrades =
        [...closedTrades]
            .sort((a, b) => {

                const dateA =
                    new Date(
                        getTradeDate(a) || 0
                    ).getTime();

                const dateB =
                    new Date(
                        getTradeDate(b) || 0
                    ).getTime();

                return dateA - dateB;

            });

    let cumulative = 0;

    const labels = [];
    const values = [];

    sortedTrades.forEach(
        (trade, index) => {

            cumulative +=
                getPnl(trade);

            const date =
                getTradeDate(trade);

            labels.push(

                date
                    ? new Date(date)
                        .toLocaleDateString(
                            'th-TH',
                            {
                                day: 'numeric',
                                month: 'short'
                            }
                        )
                    : `Trade ${index + 1}`

            );

            values.push(
                Number(
                    cumulative.toFixed(2)
                )
            );

        }
    );


    if (dashboardEquityChart) {
        dashboardEquityChart.destroy();
    }


    dashboardEquityChart =
        new Chart(
            canvas,
            {

                type: 'line',

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label:
                                'Cumulative P/L',

                            data:
                                values,

                            borderWidth:
                                2,

                            tension:
                                0.3,

                            fill:
                                true,

                            pointRadius:
                                2

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    interaction: {

                        intersect:
                            false,

                        mode:
                            'index'

                    },

                    plugins: {

                        legend: {

                            display:
                                false

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function(context) {

                                        const value =
                                            Number(
                                                context.raw || 0
                                            );

                                        return ` P/L: ${value >= 0 ? '+' : '-'}$${Math.abs(value).toFixed(2)}`;

                                    }

                            }

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                false,

                            ticks: {

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
}


// =====================================================
// PERIOD BUTTONS
// =====================================================

document
    .querySelectorAll('.period')
    .forEach(button => {

        button.addEventListener(
            'click',
            function() {

                document
                    .querySelectorAll('.period')
                    .forEach(btn => {

                        btn.classList.remove(
                            'active'
                        );

                    });

                this.classList.add(
                    'active'
                );

                currentPeriod =
                    this.dataset.period;

                updateDashboard();

            }
        );

    });


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

    return String(value)

        .replace(
            /&/g,
            '&amp;'
        )

        .replace(
            /</g,
            '&lt;'
        )

        .replace(
            />/g,
            '&gt;'
        )

        .replace(
            /"/g,
            '&quot;'
        )

        .replace(
            /'/g,
            '&#039;'
        );

}


// =====================================================
// LOGOUT
// =====================================================

document
    .querySelector('.logout a')
    ?.addEventListener(
        'click',
        function(e) {

            e.preventDefault();

            localStorage.removeItem(
                'auth_token'
            );

            window.location.href =
                'login.php';

        }
    );


// =====================================================
// LOAD WHEN PAGE READY
// =====================================================

document.addEventListener(
    'DOMContentLoaded',
    function() {

        loadDashboard();

    }
);

</script>

</body>

</html>