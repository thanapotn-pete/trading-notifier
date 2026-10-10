// statistics.js — สคริปต์ของหน้า "สถิติการเทรด" (statistics.html)
// ดึงเทรด (สูงสุด 1,000 รายการล่าสุด) + โปรไฟล์ → คำนวณสถิติในหน้าเว็บตามช่วงเวลาที่เลือก (7
// วัน / 30 วัน / 3 เดือน / ทั้งหมด)
// → แสดงการ์ดสถิติ ตารางแยกรายคู่เงิน กราฟกำไรสะสม และกราฟโดนัทสัดส่วนชนะ/แพ้
    const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;  // ที่อยู่ API อ่านจาก config.js (ค่าว่าง = origin เดียวกับหน้าเว็บ)

    let performanceChart = null;  // กราฟเส้นกำไรสะสม (เก็บไว้เพื่อทำลายก่อนวาดใหม่)
    let winLossChart = null;  // กราฟโดนัทสัดส่วนชนะ/แพ้
    let allTrades = [];  // เทรดทั้งหมดที่โหลดมา (กรองตามช่วงเวลาในหน้าเว็บ ไม่ต้องเรียก API ซ้ำ)
    let allStatistics = null;  // ประกาศไว้ แต่ตอนนี้สถิติคำนวณในหน้าเว็บโดย calculateStatistics จึงไม่ได้ใช้ค่านี้

    // อ่าน token ที่เก็บไว้ในเบราว์เซอร์
    function getToken() {
        return localStorage.getItem('auth_token');
    }

    // เรียก API โดยรับ URL เต็ม (ขึ้นต้นด้วย API_BASE_URL) แล้วตัดเหลือ path ส่งให้
    // App.apiFetch จากนั้นแปลงผลเป็น JSON
    async function apiFetch(url) {
        // url เป็น `${API_BASE_URL}/api/...` ส่วน App.apiFetch ต้องการเฉพาะ path
        const path = url.startsWith(API_BASE_URL) ? url.slice(API_BASE_URL.length) : url;
        const response = await App.apiFetch(path);

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || data.message || `HTTP ${response.status}`);
        }

        return data;
    }

    // จัดตัวเลขให้มีทศนิยมคงที่และคั่นหลักพัน (เช่น 1,234.50)
    function formatNumber(value, decimals = 2) {
        const number = Number(value || 0);
        return number.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    // แสดงเงินพร้อมเครื่องหมาย +$ / -$
    function formatMoney(value) {
        const number = Number(value || 0);
        const sign = number >= 0 ? '+$' : '-$';
        return sign + formatNumber(Math.abs(number), 2);
    }

    // เวลาของเทรด (ใช้เวลาปิดก่อน ถ้าไม่มีใช้เวลาเปิด) ถ้าไม่ถูกต้องคืน null
    function getTradeDate(trade) {
        const value = trade.closed_at || trade.timestamp || trade.created_at;
        if (!value) return null;

        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    // กรองเทรดตามช่วงเวลา: "all" = ทั้งหมด, ตัวเลข = ย้อนหลังกี่วัน
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

    // [สรุป] คำนวณสถิติจากเทรดที่ปิดแล้วในช่วงที่เลือก: จำนวนเทรด ชนะ/แพ้ กำไรรวม/ขาดทุนรวม Win
    // Rate Profit Factor
    // กำไร-ขาดทุนเฉลี่ย เทรดดี/แย่สุด และสถิติรายคู่เงิน (ตรรกะเดียวกับฝั่งเซิร์ฟเวอร์
    // แต่คำนวณในหน้าเว็บ
    // เพื่อให้เปลี่ยนช่วงเวลาได้ทันทีโดยไม่ต้องเรียก API ซ้ำ)
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

        // Win Rate (%) = เทรดที่ชนะ ÷ เทรดทั้งหมด × 100
        const winRate = totalTrades > 0
            ? (wins.length / totalTrades) * 100
            : 0;

        // Profit Factor = กำไรรวม ÷ |ขาดทุนรวม| (ไม่มีขาดทุนแต่มีกำไร = ∞)
        const profitFactor = totalLoss < 0
            ? totalProfit / Math.abs(totalLoss)
            : (totalProfit > 0 ? Infinity : 0);

        const avgWin = wins.length > 0
            ? totalProfit / wins.length
            : 0;

        const avgLoss = losses.length > 0
            ? totalLoss / losses.length
            : 0;

        // เทรดที่กำไรมากที่สุด และขาดทุนมากที่สุด
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

        // รวมสถิติแยกรายคู่เงิน: นับเทรด ชนะ แพ้ และกำไรรวมของแต่ละ symbol
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

    // ใส่ตัวเลขสถิติลงการ์ดและรายละเอียดบนหน้า (จำนวนเทรด Win Rate ชนะ/แพ้ กำไรสุทธิ Profit
    // Factor เฉลี่ย เทรดดี/แย่สุด)
    function updateSummary(stats) {
        document.getElementById('totalTrades').textContent =
            Number(stats.totalTrades || 0).toLocaleString('en-US');

        document.getElementById('winRate').textContent =
            Number(stats.winRate || 0).toFixed(1);

        document.getElementById('winningTrades').textContent =
            Number(stats.wins || 0).toLocaleString('en-US');

        document.getElementById('losingTrades').textContent =
            Number(stats.losses || 0).toLocaleString('en-US');

        document.getElementById('losingTradesDetails').textContent =
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

    // สร้างตารางสถิติแยกรายคู่เงิน พร้อมแถบแสดง Win Rate (ค่าที่มาจากข้อมูลผ่าน escapeHtml
    // เพื่อกัน XSS)
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

// เตรียมข้อมูลกราฟกำไรสะสม: เรียงเทรดที่ปิดแล้วตามเวลา แล้วบวกสะสมทีละเทรด ได้ป้ายแกน X
// (วันที่) กับค่าแกน Y
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

            labels.push(App.formatChartLabel(trade.date));

            values.push(Number(cumulative.toFixed(2)));
        });

        return { labels, values };
    }

    // วาดกราฟเส้นกำไรสะสม (ทำลายกราฟเดิมก่อนวาดใหม่ กันกราฟซ้อนกัน)
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
                                color: '#8a9793',
                                callback: App.dedupeTickLabel
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
                                    return App.formatMoney(value);
                                }
                            }
                        }
                    }
                }
            }
        );
    }

    // วาดกราฟโดนัทสัดส่วน เทรดชนะ : เทรดแพ้
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

    // [สรุป] โหลดข้อมูลตอนเปิดหน้า: เรียก trades (สูงสุด 1,000) กับ profile พร้อมกัน →
    // แสดงชื่อและอวตาร
    // → กรองตามช่วงเวลาที่เลือก (ค่าเริ่มต้น 30 วัน) → คำนวณและแสดงการ์ด ตาราง และกราฟ
    async function loadStatistics() {
        try {
            const [trades, profileData] = await Promise.all([
                apiFetch(`${API_BASE_URL}/api/trades?limit=1000`),
                apiFetch(`${API_BASE_URL}/api/profile`)
            ]);

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

            allTrades = Array.isArray(trades)
                ? trades
                : (trades.trades || trades.data || []);

            allStatistics = null;

            const filter = document.getElementById('periodFilter');

            // ค่าเริ่มต้นของหน้าเป็น 30 วัน
            // แปลงข้อความในเมนูช่วงเวลา (เช่น "7 วันที่ผ่านมา") เป็นค่าที่ฟังก์ชันกรองเข้าใจ
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

    // แปลงข้อความที่เลือกในเมนูช่วงเวลาเป็นค่า "7" / "30" / "90" / "all"
    function getPeriodValue() {
        const value = document.getElementById('periodFilter').value;

        if (value === '7 วันที่ผ่านมา') return '7';
        if (value === '3 เดือน') return '90';
        if (value === 'ทั้งหมด') return 'all';

        return '30';
    }

    // เมื่อเปลี่ยนช่วงเวลา: กรองและคำนวณใหม่ในหน้าเว็บทันที (ไม่ต้องเรียก API ซ้ำ)
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

    // เมื่อหน้าพร้อม เริ่มโหลดข้อมูลสถิติ
    document.addEventListener('DOMContentLoaded', loadStatistics);
