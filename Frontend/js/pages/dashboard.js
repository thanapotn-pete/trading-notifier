/*
|--------------------------------------------------------------------------
| Dashboard Script - จัดการการโหลดข้อมูลและเรนเดอร์ UI
|--------------------------------------------------------------------------
*/


let dashboardTrades = [];          // ตัวแปรเก็บรายการเทรดทั้งหมด
let dashboardEquityChart = null;   // ตัวแปรเก็บอินสแตนซ์ของกราฟ Equity Curve
let currentPeriod = 7;             // กำหนดช่วงเวลาเริ่มต้นดูกราฟ (7 วัน)
let dashboardProfile = null;       // ตัวแปรเก็บข้อมูลโปรไฟล์ผู้ใช้
let dashboardNotificationSettings = null; // ตัวแปรเก็บการตั้งค่า Telegram Notification


// =====================================================
// GET TOKEN (ฟังก์ชันดึง Auth Token จาก LocalStorage)
// =====================================================

function getAuthToken() {
    return localStorage.getItem('auth_token');
}


// =====================================================
// LOAD DASHBOARD DATA (ฟังก์ชันดึงข้อมูลทั้งหมดสำหรับ Dashboard แบบ Parallel ด้วย Promise.all)
// =====================================================

async function loadDashboard() {

    const token = getAuthToken();

    // ถ้าไม่มี Token ให้ดีดกลับไปหน้า Login ทันที
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {

        console.log('[Dashboard] Loading dashboard data...');

        // ยิง API 3 ตัวพร้อมกัน (Trades, Profile, Notification Settings)
        // App.apiFetch แนบ token และพาไปหน้า login เองเมื่อ session หมดอายุ
        const [tradesResponse, profileResponse, settingsResponse] =
            await Promise.all([
                App.apiFetch('/api/trades?limit=1000'),
                App.apiFetch('/api/profile'),
                App.apiFetch('/api/notification-settings')
            ]);

        if (!tradesResponse.ok) {
            throw new Error(`Trades API HTTP ${tradesResponse.status}`);
        }

        // แปลงข้อมูล Response เป็น JSON และเก็บลงตัวแปร
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

        // เรียกฟังก์ชันอัปเดตข้อมูลบนหน้าจอ
        updateUserInfo();
        updateNotificationStatus();
        updateDashboard();

    } catch (error) {

        console.error(
            '[Dashboard] API Error:',
            error
        );

        // แสดงข้อความแจ้งเตือนหากโหลดข้อมูลไม่สำเร็จ
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
// GET PNL (ดึงค่ากำไร/ขาดทุนจากออเดอร์)
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
// GET SYMBOL (ดึงชื่อคู่เงินหรือ Symbol)
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
// GET ACTION (ดึงประเภทคำสั่ง BUY/SELL)
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
// GET LOT (ดึงขนาด Lot ของออเดอร์)
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
// GET STATUS (ดึงสถานะออเดอร์)
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
// CLOSED TRADE CHECK (ตรวจสอบว่าออเดอร์ปิดไปแล้วหรือยัง)
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
// USER INFO (อัปเดตชื่อผู้ใช้และตัวอักษรย่อใน Avatar)
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
// NOTIFICATION STATUS (อัปเดตสถานะการแจ้งเตือนบนหน้า Dashboard)
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
// GET DATE (ดึงวันที่จากออเดอร์)
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
// GET FILTERED TRADES (กรองข้อมูลตามช่วงเวลา 1W, 1M, 3M)
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
// CALCULATE STATISTICS (คำนวณสถิติภาพรวม เช่น Win Rate, Profit Factor)
// =====================================================

function calculateStatistics(trades) {

    // สถิติบน Dashboard จะอิงจากออเดอร์ที่ปิดแล้วเท่านั้น
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
// UPDATE DASHBOARD (อัปเดตข้อมูลแสดงผลทั้งหมดบน Dashboard)
// =====================================================

function updateDashboard() {

    const filteredTrades =
        getFilteredTrades();

    const stats =
        calculateStatistics(
            filteredTrades
        );


    // NET PROFIT
    // แสดงผลกำไรสุทธิพร้อมเปลี่ยนสี (เขียว/แดง) ตามค่าบวก/ลบ
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
    // แสดงอัตราการชนะและจำนวนออเดอร์
    document.getElementById(
        'winRate'
    ).textContent =
        `${stats.winRate.toFixed(1)}%`;

    document.getElementById(
        'tradeCountDescription'
    ).textContent =
        `จาก ${stats.totalTrades} ออเดอร์`;


    // PROFIT FACTOR
    // แสดงค่า Profit Factor
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
    // แสดงจำนวน Win / Loss
    document.getElementById(
        'profitDescription'
    ).textContent =

        stats.totalTrades > 0
            ? `${stats.wins} Win / ${stats.losses} Loss`
            : 'ยังไม่มีข้อมูลการเทรด';


    // RISK SCORE
    // คำนวณและอัปเดตระดับความเสี่ยง
    updateRiskScore(stats);


    // RECENT TRADES
    // เรนเดอร์รายการออเดอร์ล่าสุด
    renderRecentTrades();


    // EQUITY CURVE
    // วาดกราฟเส้น Equity Curve
    renderEquityChart(
        filteredTrades
    );
}


// =====================================================
// RISK SCORE (คำนวณ Max Drawdown เพื่อประเมินระดับความเสี่ยง)
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

    // กำหนดเงื่อนไขระดับความเสี่ยง (HIGH, MEDIUM, LOW) ตาม Win Rate และ Max Drawdown
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
// RENDER RECENT TRADES (เรนเดอร์รายการออเดอร์ล่าสุด 4 รายการ)
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

    // เรียงลำดับจากออเดอร์ล่าสุดไปเก่าสุด แล้วตัดมาแค่ 4 รายการแรก
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
// EQUITY CURVE (วาดกราฟเส้น Cumulative P/L ด้วย Chart.js)
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

    // เรียงลำดับออเดอร์ตามวันที่เพื่อคำนวณกำไรสะสม (Cumulative)
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
                    ? App.formatChartLabel(date)
                    : `Trade ${index + 1}`

            );

            values.push(
                Number(
                    cumulative.toFixed(2)
                )
            );

        }
    );


    // หากมีกราฟเดิมอยู่ให้ทำลายทิ้งก่อนสร้างใหม่เพื่อป้องกันบั๊กซ้อนทับ
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

                                        return ` กำไรสุทธิ: ${value >= 0 ? '+' : '-'}$${Math.abs(value).toFixed(2)}`;

                                    }

                            }

                        }

                    },

                    scales: {

                        x: {
                            ticks: {
                                callback: App.dedupeTickLabel
                            }
                        },

                        y: {

                            beginAtZero:
                                false,

                            ticks: {

                                callback:
                                    function(value) {

                                        return App.formatMoney(value);

                                    }

                            }

                        }

                    }

                }

            }
        );
}


// =====================================================
// PERIOD BUTTONS (ดักจับ Event การเปลี่ยนช่วงเวลาดูกราฟ 1W, 1M, 3M)
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
// ESCAPE HTML (ฟังก์ชันป้องกัน Cross-Site Scripting - XSS)
// =====================================================

// =====================================================
// LOGOUT (ฟังก์ชันออกจากระบบจาก Sidebar)
// =====================================================


// =====================================================
// PROFILE DROPDOWN (จัดการเปิด-ปิดเมนูโปรไฟล์ขวาบน)
// =====================================================



// =====================================================
// LOAD WHEN PAGE READY (เริ่มต้นโหลดข้อมูลเมื่อหน้าเว็บพร้อมใช้งาน)
// =====================================================

document.addEventListener(
    'DOMContentLoaded',
    function() {

        loadDashboard();

    }
);
