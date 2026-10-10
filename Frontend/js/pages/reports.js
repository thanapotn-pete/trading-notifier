// reports.js — สคริปต์ของหน้า "รายงาน" (reports.html)
// ดึงเทรด (สูงสุด 1,000 รายการล่าสุด) และโปรไฟล์จากเซิร์ฟเวอร์ → ให้ผู้ใช้เลือกช่วงเวลา (วันนี้
// / 7 / 30 / 90 วัน / ทั้งหมด)
// → คำนวณสถิติ แสดงการ์ดสรุป กราฟกำไรสะสม ตารางแยกรายคู่เงิน ตารางรายการเทรด และส่งออกเป็นไฟล์
// CSV
const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;  // ประกาศไว้ แต่ตอนนี้เรียก API ผ่าน App.apiFetch แล้ว จึงไม่ได้ใช้ตัวแปรนี้โดยตรง
const TOKEN_KEY = 'auth_token';  // ชื่อ key ที่เก็บ token ใน localStorage
let allTrades = [];  // เทรดทั้งหมดที่โหลดมาจากเซิร์ฟเวอร์
let filteredTrades = [];  // เทรดหลังกรองตามช่วงเวลา (ใช้แสดงผลและส่งออก CSV)
let profitChart = null;  // ตัวกราฟ Chart.js (เก็บไว้เพื่อทำลายก่อนวาดใหม่)

// [กลุ่มฟังก์ชันช่วยเล็ก ๆ] getToken = อ่าน token | num = แปลงเป็นตัวเลข (ไม่ใช่ตัวเลข = 0) |
// formatMoney = แสดงเงินแบบ +$ / -$
// getPnl / getTradeDate / getAction / getPrice / getLot / getStatus =
// ดึงค่าจากเทรดแบบรองรับชื่อฟิลด์หลายแบบ
function getToken() { return localStorage.getItem(TOKEN_KEY); }
function num(v) { const n=Number(v); return Number.isFinite(n) ? n : 0; }
function formatMoney(v) { const n=num(v); return (n>=0?'+$':'-$') + Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function getPnl(t) { return t?.pnl == null ? null : num(t.pnl); }  // กำไร/ขาดทุนของเทรด (null = ยังไม่ปิดออเดอร์)
function getTradeDate(t) { const raw=t?.closed_at || t?.timestamp || t?.created_at || t?.opened_at || t?.date || t?.time; const d=raw ? new Date(raw) : null; return d && !Number.isNaN(d.getTime()) ? d : null; }  // เวลาของเทรด (ใช้เวลาปิดก่อน ถ้าไม่มีใช้เวลาเปิด)
function getAction(t) { return String(t?.action || t?.type || t?.side || t?.direction || '').toUpperCase(); }
function getPrice(t) { return t?.price ?? t?.open_price ?? t?.entry_price ?? t?.entryPrice ?? ''; }
function getLot(t) { return t?.volume ?? t?.lot ?? t?.lots ?? ''; }
function getStatus(t) { return t?.status || t?.close_reason || t?.reason || (getPnl(t) == null ? 'OPEN' : 'CLOSED'); }

// เรียก API ผ่าน App.apiFetch แล้วแปลงผลเป็น JSON — ถ้าไม่ ok โยน error
// พร้อมข้อความจากเซิร์ฟเวอร์
async function apiFetch(path) {
    const res=await App.apiFetch(path);
    const data=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
    return data;
}

// กรองเทรดตามช่วงเวลาที่เลือกในเมนู: today = ตั้งแต่เที่ยงคืนวันนี้, ตัวเลข = ย้อนหลัง N วัน,
// all = ทั้งหมด
function filterByPeriod(trades) {
    const period = document.getElementById('periodSelect').value;

    if (period === 'all') {
        return [...trades];
    }

    const now = new Date();
    const start = new Date(now);

    if (period === 'today') {
        start.setHours(0, 0, 0, 0);

        return trades.filter(t => {
            const d = getTradeDate(t);
            return d && d >= start && d <= now;
        });
    }

    start.setDate(
        start.getDate() - Number(period)
    );

    return trades.filter(t => {
        const d = getTradeDate(t);

        return (
            d &&
            d >= start &&
            d <= now
        );
    });
}

// [สรุป] คำนวณสถิติจากเทรดที่ปิดแล้ว: จำนวนเทรด ชนะ/แพ้ กำไรสุทธิ Win Rate
// Profit Factor (กำไรรวม ÷ ขาดทุนรวม) และกำไร/ขาดทุนเฉลี่ยต่อเทรด
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

// ใส่ตัวเลขสถิติลงการ์ดสรุปและแถบ Win Rate บนหน้า
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

// สร้างตารางสถิติแยกรายคู่เงิน (จำนวนเทรด Win Rate กำไร/ขาดทุนเฉลี่ย กำไรรวม)
// เรียงจากกำไรมากไปน้อย
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

// สร้างตารางรายการเทรด เรียงใหม่ → เก่า (ค่าทุกช่องผ่าน escapeHtml เพื่อกัน XSS)
function updateTradeTable(trades) {
    const body=document.getElementById('tradeReportBody'); document.getElementById('tradeCount').textContent=trades.length+' รายการ';
    if(!trades.length){body.innerHTML='<tr><td colspan="7" style="text-align:center;padding:25px;color:#9aa7a3">ยังไม่มีข้อมูลการเทรด</td></tr>';return;}
    body.innerHTML=[...trades].sort((a,b)=>(getTradeDate(b)?.getTime()||0)-(getTradeDate(a)?.getTime()||0)).map(t=>{
        const action=getAction(t), pnl=getPnl(t), d=getTradeDate(t); const actionClass=action==='SELL'?'action-sell':'action-buy';
        const date=d?d.toLocaleString('th-TH',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'-';
        return `<tr><td><span class="symbol-name">${escapeHtml(t.symbol||t.instrument||'-')}</span></td><td><span class="action-badge ${actionClass}">${escapeHtml(action||'-')}</span></td><td>${escapeHtml(getPrice(t))}</td><td>${escapeHtml(getLot(t))}</td><td class="${pnl!==null&&pnl<0?'loss-text':'profit-text'}">${pnl===null?'-':formatMoney(pnl)}</td><td class="status-text">${escapeHtml(getStatus(t))}</td><td class="date-text">${date}</td></tr>`;
    }).join('');
}

// วาดกราฟกำไรสะสม: เรียงเทรดตามเวลา แล้วบวกสะสมทีละเทรด (แกน X เป็นวันที่
// และซ่อนวันที่ที่ซ้ำกัน)
function updateChart(trades) {
    const completed=trades.filter(t=>getPnl(t)!==null && getTradeDate(t)).sort((a,b)=>getTradeDate(a)-getTradeDate(b));
    let cumulative=0; const labels=[],values=[];
    completed.forEach(t=>{cumulative+=getPnl(t);labels.push(App.formatChartLabel(getTradeDate(t)));values.push(Number(cumulative.toFixed(2)));});
    if(profitChart) profitChart.destroy();
    profitChart=new Chart(document.getElementById('profitChart'),{type:'line',data:{labels:labels.length?labels:['ไม่มีข้อมูล'],datasets:[{label:'กำไรสะสม',data:values.length?values:[0],borderWidth:2,pointRadius:3,pointHoverRadius:5,tension:.35,fill:true,borderColor:'#087f68',backgroundColor:'rgba(8,127,104,.10)'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:'#94a3b8',font:{family:'IBM Plex Sans Thai',size:10},callback:App.dedupeTickLabel}},y:{grid:{color:'#edf1ef'},ticks:{color:'#94a3b8',font:{family:'IBM Plex Sans Thai',size:10},callback:v=>App.formatMoney(v)}}}}});
}

// รวมขั้นตอนแสดงผลทั้งหมด: กรองช่วงเวลา → คำนวณสถิติ → อัปเดตการ์ด ตารางทั้งสอง และกราฟ
function render(){ filteredTrades=filterByPeriod(allTrades); const stats=calculateStats(filteredTrades); updateSummary(stats); updateSymbolTable(filteredTrades); updateTradeTable(filteredTrades); updateChart(filteredTrades); }
// ถูกเรียกเมื่อเปลี่ยนช่วงเวลาในเมนู (ผูกผ่าน data-change ใน HTML) → วาดทั้งหน้าใหม่
function changePeriod(){ render(); }

// ครอบค่าด้วยเครื่องหมาย " และแปลง " ภายในเป็น "" ตามกฎของไฟล์ CSV
function csvEscape(v){return `"${String(v??'').replace(/"/g,'""')}"`;}
// ส่งออกรายการเทรดที่กรองอยู่เป็นไฟล์ CSV (ใส่ BOM ให้ Excel อ่านภาษาไทยถูก) แล้วสั่งดาวน์โหลด
function exportReport(){
    const rows=[['Symbol','Action','Price','Lot','P/L','Status','Date']];
    filteredTrades.forEach(t=>{const d=getTradeDate(t);rows.push([t.symbol||t.instrument||'',getAction(t),getPrice(t),getLot(t),getPnl(t)??'',getStatus(t),d?d.toLocaleString('th-TH'):'' ]);});
    const csv='\uFEFF'+rows.map(r=>r.map(csvEscape).join(',')).join('\n'); const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='trade-report.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

// [สรุป] โหลดข้อมูลตอนเปิดหน้า: เรียก trades (สูงสุด 1,000) กับ profile พร้อมกัน → เก็บเทรด →
// แสดงชื่อและอวตารผู้ใช้
// → วาดทั้งหน้า; ถ้าล้มเหลวแสดงข้อความ error ในตาราง
async function loadReport(){
    try {
        const [tradesData, profileData] = await Promise.all([
            apiFetch('/api/trades?limit=1000'),
            apiFetch('/api/profile')
        ]);

        allTrades = Array.isArray(tradesData)
            ? tradesData
            : (tradesData.trades || []);

        const profile = profileData.user || profileData || {};

        const name =
            profile.full_name ||
            profile.name ||
            profile.username ||
            profile.email ||
            'ผู้ใช้งาน';

        const welcomeUser = document.getElementById('welcomeUser');

        if (welcomeUser) {
            welcomeUser.textContent = `ยินดีต้อนรับ, ${name}`;
        }
        const userAvatar = document.getElementById('userAvatar');

if (userAvatar) {
    userAvatar.textContent = name.charAt(0).toUpperCase();
}

        render();

        console.log('[Reports] Loaded trades:', allTrades.length);
        console.log('[Reports] Loaded user:', name);

    } catch(err) {
        console.error('[Reports]', err);

        const welcomeUser = document.getElementById('welcomeUser');
        if (welcomeUser) {
            welcomeUser.textContent = 'ยินดีต้อนรับ, ผู้ใช้งาน';
        }

        document.getElementById('tradeReportBody').innerHTML =
            `<tr><td colspan="7" style="text-align:center;padding:25px;color:#dc2626">โหลดข้อมูลไม่สำเร็จ: ${escapeHtml(err.message)}</td></tr>`;
    }
}

document.addEventListener('DOMContentLoaded',loadReport);  // เริ่มโหลดรายงานเมื่อหน้าพร้อม
