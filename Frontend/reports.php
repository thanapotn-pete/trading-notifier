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

        <div class="report-header">
            <div class="report-title">
                <h2>รายงานการเทรด</h2>
                <p>สรุปผลการเทรดและประสิทธิภาพการลงทุนจากข้อมูลจริง</p>
            </div>
            <div class="report-actions">
                <select class="date-select" id="periodSelect" onchange="changePeriod()">
                    <option value="today">วันนี้</option>
                    <option value="7">7 วันที่ผ่านมา</option>
                    <option value="30" selected>30 วันที่ผ่านมา</option>
                    <option value="90">90 วันที่ผ่านมา</option>
                    <option value="all">ทั้งหมด</option>
                </select>
                <button class="export-button" onclick="exportReport()">↓ Export รายงาน</button>
            </div>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <div><div class="summary-label">กำไรสุทธิ</div><div id="netProfit" class="summary-value green">$0.00</div><div id="profitDescription" class="summary-description">จากข้อมูลการเทรด</div></div>
                <div class="summary-icon">$</div>
            </div>
            <div class="summary-card">
                <div><div class="summary-label">จำนวนการเทรด</div><div id="totalTrades" class="summary-value">0</div><div class="summary-description">รายการทั้งหมด</div></div>
                <div class="summary-icon blue">⇄</div>
            </div>
            <div class="summary-card">
                <div><div class="summary-label">Win Rate</div><div id="winRate" class="summary-value green">0.0%</div><div id="winDescription" class="summary-description">ชนะ 0 ครั้ง</div></div>
                <div class="summary-icon">%</div>
            </div>
            <div class="summary-card">
                <div><div class="summary-label">Profit Factor</div><div id="profitFactor" class="summary-value">0.00</div><div class="summary-description">จากข้อมูลการเทรด</div></div>
                <div class="summary-icon">↗</div>
            </div>
        </div>

        <div class="report-grid">
            <div class="report-card">
                <div class="card-heading"><div><h3>กำไรสะสม</h3><p>การเปลี่ยนแปลงของกำไรตามช่วงเวลา</p></div></div>
                <div class="chart-container"><canvas id="profitChart"></canvas></div>
            </div>
            <div class="report-card">
                <div class="card-heading"><div><h3>สรุปผลการเทรด</h3><p>ภาพรวมกำไรและขาดทุน</p></div></div>
                <div class="profit-breakdown">
                    <div class="breakdown-item"><div class="breakdown-left"><span class="breakdown-dot"></span><span class="breakdown-name">Winning Trades</span></div><span id="winningTrades" class="breakdown-value green">0</span></div>
                    <div class="breakdown-item"><div class="breakdown-left"><span class="breakdown-dot loss"></span><span class="breakdown-name">Losing Trades</span></div><span id="losingTrades" class="breakdown-value red">0</span></div>
                    <div class="breakdown-item"><div class="breakdown-left"><span class="breakdown-dot"></span><span class="breakdown-name">Average Win</span></div><span id="avgWin" class="breakdown-value green">$0.00</span></div>
                    <div class="breakdown-item"><div class="breakdown-left"><span class="breakdown-dot loss"></span><span class="breakdown-name">Average Loss</span></div><span id="avgLoss" class="breakdown-value red">$0.00</span></div>
                    <div class="progress-section"><div class="progress-header"><span class="progress-label">Win Rate</span><span id="progressPercent" class="progress-percent">0.0%</span></div><div class="progress-bar"><div id="progressFill" class="progress-fill" style="width:0%"></div></div></div>
                </div>
            </div>
        </div>

        <div class="table-card">
            <div class="table-card-header"><div><h3>Performance by Symbol</h3><p>ประสิทธิภาพแยกตามคู่เงินและสินทรัพย์</p></div><span id="symbolCount" class="table-count">0 Symbols</span></div>
            <table>
                <thead><tr><th>SYMBOL</th><th>TRADES</th><th>WIN RATE</th><th>AVG. WIN</th><th>AVG. LOSS</th><th>P/L</th></tr></thead>
                <tbody id="symbolStatsBody"><tr><td colspan="6" style="text-align:center;padding:25px;color:#9aa7a3">กำลังโหลดข้อมูล...</td></tr></tbody>
            </table>
        </div>

        <div class="table-card">
            <div class="table-card-header"><div><h3>รายการเทรดในรายงาน</h3><p>รายละเอียดการเทรดจากข้อมูลจริง</p></div><span id="tradeCount" class="table-count">0 รายการ</span></div>
            <div class="trade-table-wrapper">
                <table>
                    <thead><tr><th>SYMBOL</th><th>ACTION</th><th>PRICE</th><th>LOT</th><th>P/L</th><th>STATUS</th><th>DATE / TIME</th></tr></thead>
                    <tbody id="tradeReportBody"><tr><td colspan="7" style="text-align:center;padding:25px;color:#9aa7a3">กำลังโหลดข้อมูล...</td></tr></tbody>
                </table>
            </div>
        </div>
    </div>

<!-- =========================================================
     JAVASCRIPT
========================================================= -->

<script>
const API_BASE_URL = 'http://localhost:3000';
const TOKEN_KEY = 'auth_token';
let allTrades = [];
let filteredTrades = [];
let profitChart = null;

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function escapeHtml(value) { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }
function num(v) { const n=Number(v); return Number.isFinite(n) ? n : 0; }
function formatMoney(v) { const n=num(v); return (n>=0?'+$':'-$') + Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function getPnl(t) { return t?.pnl == null ? null : num(t.pnl); }
function getTradeDate(t) { const raw=t?.closed_at || t?.timestamp || t?.created_at || t?.opened_at || t?.date || t?.time; const d=raw ? new Date(raw) : null; return d && !Number.isNaN(d.getTime()) ? d : null; }
function getAction(t) { return String(t?.action || t?.type || t?.side || t?.direction || '').toUpperCase(); }
function getPrice(t) { return t?.price ?? t?.open_price ?? t?.entry_price ?? t?.entryPrice ?? ''; }
function getLot(t) { return t?.volume ?? t?.lot ?? t?.lots ?? ''; }
function getStatus(t) { return t?.status || t?.close_reason || t?.reason || (getPnl(t) == null ? 'OPEN' : 'CLOSED'); }

async function apiFetch(path) {
    const token=getToken();
    if(!token) { window.location.href='login.php'; throw new Error('ไม่พบ token กรุณาเข้าสู่ระบบ'); }
    const res=await fetch(API_BASE_URL+path,{headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'}});
    if(res.status===401){ localStorage.removeItem(TOKEN_KEY); window.location.href='login.php'; throw new Error('Session หมดอายุ'); }
    const data=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
    return data;
}

function filterByPeriod(trades) {
    const period=document.getElementById('periodSelect').value;
    if(period==='all') return [...trades];
    const now=new Date();
    let start=new Date(now); start.setHours(0,0,0,0);
    if(period==='today') return trades.filter(t=>{const d=getTradeDate(t); return d && d>=start;});
    start.setDate(start.getDate()-Number(period)+1);
    return trades.filter(t=>{const d=getTradeDate(t); return d && d>=start && d<=now;});
}

function calculateStats(trades) {
    const completed=trades.filter(t=>getPnl(t)!==null);
    const wins=completed.filter(t=>getPnl(t)>0);
    const losses=completed.filter(t=>getPnl(t)<0);
    const totalPnl=completed.reduce((s,t)=>s+getPnl(t),0);
    const grossProfit=wins.reduce((s,t)=>s+getPnl(t),0);
    const grossLoss=Math.abs(losses.reduce((s,t)=>s+getPnl(t),0));
    return { totalTrades:completed.length, wins:wins.length, losses:losses.length, totalPnl, grossProfit, grossLoss,
        winRate:completed.length ? wins.length/completed.length*100 : 0,
        profitFactor:grossLoss ? grossProfit/grossLoss : (grossProfit ? Infinity : 0),
        avgWin:wins.length ? grossProfit/wins.length : 0,
        avgLoss:losses.length ? -grossLoss/losses.length : 0 };
}

function updateSummary(stats) {
    const net=document.getElementById('netProfit'); net.textContent=formatMoney(stats.totalPnl); net.className='summary-value '+(stats.totalPnl<0?'red':'green');
    document.getElementById('totalTrades').textContent=stats.totalTrades.toLocaleString('en-US');
    document.getElementById('winRate').textContent=stats.winRate.toFixed(1)+'%';
    document.getElementById('winDescription').textContent=`ชนะ ${stats.wins} ครั้ง`;
    document.getElementById('profitFactor').textContent=Number.isFinite(stats.profitFactor)?stats.profitFactor.toFixed(2):'∞';
    document.getElementById('winningTrades').textContent=stats.wins;
    document.getElementById('losingTrades').textContent=stats.losses;
    document.getElementById('avgWin').textContent=formatMoney(stats.avgWin);
    document.getElementById('avgLoss').textContent=formatMoney(stats.avgLoss);
    document.getElementById('progressPercent').textContent=stats.winRate.toFixed(1)+'%';
    document.getElementById('progressFill').style.width=Math.min(100,Math.max(0,stats.winRate))+'%';
}

function updateSymbolTable(trades) {
    const map={};
    trades.filter(t=>getPnl(t)!==null).forEach(t=>{
        const symbol=t.symbol || t.instrument || 'UNKNOWN';
        if(!map[symbol]) map[symbol]={symbol,trades:0,wins:0,pnl:0,winsPnl:0,lossPnl:0,losses:0};
        const x=map[symbol], pnl=getPnl(t); x.trades++; x.pnl+=pnl;
        if(pnl>0){x.wins++;x.winsPnl+=pnl;} else if(pnl<0){x.losses++;x.lossPnl+=pnl;}
    });
    const rows=Object.values(map).sort((a,b)=>b.pnl-a.pnl);
    document.getElementById('symbolCount').textContent=rows.length+' Symbols';
    const body=document.getElementById('symbolStatsBody');
    if(!rows.length){body.innerHTML='<tr><td colspan="6" style="text-align:center;padding:25px;color:#9aa7a3">ยังไม่มีข้อมูลการเทรด</td></tr>';return;}
    body.innerHTML=rows.map(x=>{const wr=x.trades?x.wins/x.trades*100:0;const aw=x.wins?x.winsPnl/x.wins:0;const al=x.losses?x.lossPnl/x.losses:0;return `<tr><td><span class="symbol-name">${escapeHtml(x.symbol)}</span><span class="symbol-sub">Trading Symbol</span></td><td>${x.trades.toLocaleString('en-US')}</td><td><span class="win-badge">${wr.toFixed(1)}%</span></td><td>${formatMoney(aw)}</td><td class="${al<0?'loss-text':''}">${formatMoney(al)}</td><td class="${x.pnl>=0?'profit-text':'loss-text'}">${formatMoney(x.pnl)}</td></tr>`;}).join('');
}

function updateTradeTable(trades) {
    const body=document.getElementById('tradeReportBody'); document.getElementById('tradeCount').textContent=trades.length+' รายการ';
    if(!trades.length){body.innerHTML='<tr><td colspan="7" style="text-align:center;padding:25px;color:#9aa7a3">ยังไม่มีข้อมูลการเทรด</td></tr>';return;}
    body.innerHTML=[...trades].sort((a,b)=>(getTradeDate(b)?.getTime()||0)-(getTradeDate(a)?.getTime()||0)).map(t=>{
        const action=getAction(t), pnl=getPnl(t), d=getTradeDate(t); const actionClass=action==='SELL'?'action-sell':'action-buy';
        const date=d?d.toLocaleString('th-TH',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'-';
        return `<tr><td><span class="symbol-name">${escapeHtml(t.symbol||t.instrument||'-')}</span></td><td><span class="action-badge ${actionClass}">${escapeHtml(action||'-')}</span></td><td>${escapeHtml(getPrice(t))}</td><td>${escapeHtml(getLot(t))}</td><td class="${pnl!==null&&pnl<0?'loss-text':'profit-text'}">${pnl===null?'-':formatMoney(pnl)}</td><td class="status-text">${escapeHtml(getStatus(t))}</td><td class="date-text">${date}</td></tr>`;
    }).join('');
}

function updateChart(trades) {
    const completed=trades.filter(t=>getPnl(t)!==null && getTradeDate(t)).sort((a,b)=>getTradeDate(a)-getTradeDate(b));
    let cumulative=0; const labels=[],values=[];
    completed.forEach(t=>{cumulative+=getPnl(t);labels.push(getTradeDate(t).toLocaleDateString('th-TH',{day:'numeric',month:'short'}));values.push(Number(cumulative.toFixed(2)));});
    if(profitChart) profitChart.destroy();
    profitChart=new Chart(document.getElementById('profitChart'),{type:'line',data:{labels:labels.length?labels:['ไม่มีข้อมูล'],datasets:[{label:'กำไรสะสม',data:values.length?values:[0],borderWidth:2,pointRadius:3,pointHoverRadius:5,tension:.35,fill:true,borderColor:'#087f68',backgroundColor:'rgba(8,127,104,.10)'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:'#94a3b8',font:{family:'IBM Plex Sans Thai',size:10}}},y:{grid:{color:'#edf1ef'},ticks:{color:'#94a3b8',font:{family:'IBM Plex Sans Thai',size:10},callback:v=>'$'+v}}}}});
}

function render(){ filteredTrades=filterByPeriod(allTrades); const stats=calculateStats(filteredTrades); updateSummary(stats); updateSymbolTable(filteredTrades); updateTradeTable(filteredTrades); updateChart(filteredTrades); }
function changePeriod(){ render(); }

function csvEscape(v){return `"${String(v??'').replace(/"/g,'""')}"`;}
function exportReport(){
    const rows=[['Symbol','Action','Price','Lot','P/L','Status','Date']];
    filteredTrades.forEach(t=>{const d=getTradeDate(t);rows.push([t.symbol||t.instrument||'',getAction(t),getPrice(t),getLot(t),getPnl(t)??'',getStatus(t),d?d.toLocaleString('th-TH'):'' ]);});
    const csv='\uFEFF'+rows.map(r=>r.map(csvEscape).join(',')).join('\n'); const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='trade-report.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

async function loadReport(){
    try { const data=await apiFetch('/api/trades?limit=1000'); allTrades=Array.isArray(data)?data:(data.trades||[]); render(); console.log('[Reports] Loaded trades:',allTrades.length); }
    catch(err){ console.error('[Reports]',err); document.getElementById('tradeReportBody').innerHTML=`<tr><td colspan="7" style="text-align:center;padding:25px;color:#dc2626">โหลดข้อมูลไม่สำเร็จ: ${escapeHtml(err.message)}</td></tr>`; }
}

document.addEventListener('DOMContentLoaded',loadReport);
</script>


</body>

</html>