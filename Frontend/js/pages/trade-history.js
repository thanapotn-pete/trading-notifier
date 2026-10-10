// trade-history.js — สคริปต์ของหน้า "ประวัติการเทรด" (trade-history.html)
// โหลดเทรดล่าสุดสูงสุด 1,000 รายการจากเซิร์ฟเวอร์ → แสดงในตารางแบ่งหน้า (10 แถวต่อหน้า)
// มีค้นหาตามคู่เงิน / กรอง BUY-SELL / กรองตามวัน, การ์ดสรุป (ทั้งหมด ชนะ แพ้ Win Rate)
// และปุ่มส่งออกเป็นไฟล์ CSV
// การกรองและแบ่งหน้าทำในหน้าเว็บทั้งหมด ไม่ต้องเรียก API ซ้ำ
/*
|--------------------------------------------------------------------------
| Trade History - Real API
|--------------------------------------------------------------------------
| Frontend -> Node.js API -> Supabase
| ใช้ token ของผู้ใช้งานที่ login อยู่จาก localStorage.auth_token
|--------------------------------------------------------------------------
*/

const TRADE_HISTORY_TOKEN_KEY = 'auth_token'; // คีย์ Token ใน LocalStorage

let allTrades = []; // ตัวแปรเก็บข้อมูลเทรดทั้งหมด
let filteredTrades = []; // ตัวแปรเก็บข้อมูลหลังกดกรอง/ค้นหา
let currentPage = 1; // หน้าปัจจุบันของ Pagination
const rowsPerPage = 10; // จำนวนแถวต่อ 1 หน้า

/* =========================
   Helper
========================= */

// ฟังก์ชันดึง Token ยืนยันตัวตน
function getAuthToken() {
    return localStorage.getItem(TRADE_HISTORY_TOKEN_KEY);
}

// ฟังก์ชันป้องกัน XSS แปลงอักขระพิเศษ
// แปลงค่าเป็นตัวเลข ป้องกัน NaN
function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

// [กลุ่มฟังก์ชัน get* ด้านล่าง] ดึงค่าจากข้อมูลเทรดแบบรองรับชื่อฟิลด์หลายแบบ
// (กันกรณีชื่อคอลัมน์ต่างกัน) แล้วจัดรูปแบบสำหรับแสดงผล
// ดึงชื่อ Symbol จากหลายๆ รูปแบบคีย์ข้อมูล
function getSymbol(trade) {
    return trade.symbol ?? trade.instrument ?? trade.ticker ?? '-';
}

// ดึง Action (BUY / SELL) และแปลงเป็นตัวพิมพ์ใหญ่
function getAction(trade) {
    const value = trade.action ?? trade.side ?? trade.type ?? trade.direction ?? '';
    const normalized = String(value).toUpperCase();

    if (normalized.includes('SELL')) return 'SELL';
    if (normalized.includes('BUY')) return 'BUY';

    return normalized || '-';
}

// ดึงราคาซื้อขาย
function getPrice(trade) {
    return trade.close_price ??
           trade.closePrice ??
           trade.price ??
           trade.open_price ??
           trade.openPrice ??
           '-';
}

// ดึงจำนวน Lot
function getLot(trade) {
    return trade.lot ??
           trade.volume ??
           trade.quantity ??
           trade.lots ??
           '-';
}

// ดึงกำไรขาดทุน P/L
function getPnl(trade) {
    return toNumber(
        trade.pnl ??
        trade.profit ??
        trade.net_profit ??
        trade.netProfit ??
        0
    );
}

// ดึงสถานะการปิดออเดอร์
function getStatus(trade) {
    return trade.status ??
           trade.close_reason ??
           trade.closeReason ??
           trade.reason ??
           '-';
}

// ดึงเวลาทำรายการ
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

// จัดรูปแบบตัวเลขทศนิยม
function formatNumber(value, decimals = 2) {
    return toNumber(value).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

// จัดรูปแบบราคา
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

// จัดรูปแบบเวลาเป็นภาษาไทย
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

// แปลงวันที่สำหรับระบบกรอง
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

// [สรุป] โหลดข้อมูลตอนเปิดหน้า: ไม่มี token → ไปหน้า login / เรียก GET /api/trades?limit=1000
// → (ถ้า 403 ออกจากระบบ) → โหลดโปรไฟล์มาแสดงชื่อ-อวตาร → เก็บเทรดทั้งหมด → แสดงสรุป ตาราง
// และปุ่มแบ่งหน้า
// ฟังก์ชันโหลดข้อมูลประวัติการเทรดจาก Node.js API
async function loadTrades() {
    const token = getAuthToken();

    // ถ้าไม่มี Token ให้เตะกลับไปหน้า Login
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // ยิง Request ไปดึงประวัติการเทรด
        const response = await App.apiFetch('/api/trades?limit=1000');

        // 401 (token หมดอายุ) จัดการโดย App.apiFetch แล้ว; 403 = ไม่มีสิทธิ์ → ออกจากระบบ
        if (response.status === 403) {
            App.clearSession();
            window.location.href = 'login.html';
            return;
        }

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        // ดึงข้อมูลโปรไฟล์ผู้ใช้งานมาแสดงที่ Topbar
        try {
            const profileResponse = await App.apiFetch('/api/profile');

            if (profileResponse.ok) {
                const profileData = await profileResponse.json();
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
            }
        } catch (profileError) {
            console.warn('[Trade History] Failed to load profile:', profileError);
        }

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

// ใส่ตัวเลขสรุป 4 ช่อง: จำนวนเทรด / ชนะ / แพ้ / Win Rate — คำนวณจากรายการที่กำลังแสดงอยู่
// (จึงเปลี่ยนไปตามตัวกรอง)
// คำนวณสรุปผลกำไร/ขาดทุน และ Win Rate
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

// [สรุป] วาดตารางเฉพาะ "หน้าปัจจุบัน" (ตัดรายการด้วย rowsPerPage) ค่าทุกช่องผ่าน escapeHtml
// เพื่อกัน XSS
// ถ้าไม่มีข้อมูลจะแสดงข้อความ "ไม่พบข้อมูลการเทรด"
// เรนเดอร์ข้อมูลลงในตาราง HTML
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

// แสดงข้อความว่างเปล่าเมื่อโหลดไม่ได้
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

// อัปเดตจำนวนรายการที่แสดงใต้ตาราง
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

// [สรุป] กรองรายการเทรดด้วยเงื่อนไข 3 อย่างพร้อมกัน (ต้องตรงทั้งหมด): ชื่อคู่เงินที่พิมพ์ค้นหา,
// ประเภท BUY/SELL, และวันที่เลือก
// จากนั้นกลับไปหน้า 1 แล้วอัปเดตสรุป ตาราง และปุ่มแบ่งหน้า
// ฟังก์ชันกรองข้อมูล (ค้นหา Symbol, ประเภท, วันที่)
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

// รีเซ็ตตัวกรองทั้งหมด
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

// สร้างปุ่ม ก่อนหน้า / เลขหน้า (แสดงสูงสุด 5 ปุ่มรอบหน้าปัจจุบัน) / ถัดไป
// ปุ่มแต่ละอันมี data-action="goToPage" และ data-args ให้ common.js เรียก goToPage
// ให้เมื่อถูกกด (ไม่ใช้ onclick เพราะ CSP ห้าม)
// อัปเดตปุ่มแบ่งหน้า (Pagination)
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
            data-action="goToPage" data-args="[${currentPage - 1}]"
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
                data-action="goToPage" data-args="[${page}]"
            >
                ${page}
            </button>
        `;
    }

    html += `
        <button
            type="button"
            class="page-button ${currentPage === totalPages ? 'disabled' : ''}"
            data-action="goToPage" data-args="[${currentPage + 1}]"
            ${currentPage === totalPages ? 'disabled' : ''}
        >
            <i class="bi bi-chevron-right"></i>
        </button>
    `;

    pagination.innerHTML = html;
}

// ถ้าเลขหน้าอยู่ในช่วงที่มีจริง → เปลี่ยนหน้าแล้ววาดตารางและปุ่มใหม่
// เปลี่ยนหน้าตาราง
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

// [สรุป] ส่งออกเทรดที่กรองอยู่เป็นไฟล์ CSV: ประกอบข้อความ CSV (ครอบทุกค่าด้วย " ) → ใส่ BOM
// เพื่อให้ Excel อ่านภาษาไทยถูก
// → สร้างไฟล์ชั่วคราวในหน่วยความจำ (Blob) → สร้างลิงก์ดาวน์โหลดแล้วคลิกให้เอง
// ฟังก์ชันดาวน์โหลดรายงานเป็นไฟล์ CSV
function exportTradesCSV() {
    if (filteredTrades.length === 0) {
        App.toast('ไม่มีข้อมูลการเทรดสำหรับ Export');
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

// เมื่อหน้าพร้อม: ผูกปุ่มส่งออก CSV, ให้กด Enter ในช่องค้นหาเพื่อกรองได้
// แล้วเริ่มโหลดข้อมูลเทรด
// ดักจับ Event เมื่อโหลดหน้าเว็บเสร็จ
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


    loadTrades();
});
