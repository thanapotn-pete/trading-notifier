const API_BASE_URL = 'http://localhost:3000';

const token = localStorage.getItem('auth_token');


// =========================
// CHECK LOGIN
// =========================

if (!token) {
    window.location.href = 'login.php';
}


// =========================
// API REQUEST
// =========================

async function apiRequest(endpoint) {

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {

        method: 'GET',

        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }

    });


    let data = {};

    try {

        data = await response.json();

    } catch (error) {

        data = {};

    }


    if (!response.ok) {

        if (response.status === 401) {

            localStorage.removeItem('auth_token');

            window.location.href = 'login.php';

            return;

        }


        throw new Error(
            data.error || `API Error: ${response.status}`
        );

    }


    return data;

}


// =========================
// LOAD DASHBOARD
// =========================

async function loadDashboard() {

    try {

        console.log('Loading dashboard...');


        const [summary, statistics, trades] = await Promise.all([

            apiRequest('/api/summary'),

            apiRequest('/api/statistics'),

            apiRequest('/api/trades?limit=50')

        ]);


        console.log('Summary:', summary);

        console.log('Statistics:', statistics);

        console.log('Trades:', trades);


        // =========================
        // SUMMARY
        // =========================

        updateSummary(summary);


        // =========================
        // STATISTICS
        // =========================

        updateStatistics(statistics);


        // =========================
        // TRADES
        // =========================

        updateTrades(trades);


        // =========================
        // EQUITY CHART
        // =========================

        updateEquityChart(trades);


    } catch (error) {

        console.error('Dashboard Error:', error);

    }

}


// =========================
// UPDATE SUMMARY
// =========================

function updateSummary(summary) {

    console.log('Updating summary:', summary);

    /*
     * ตอนนี้ยังไม่แก้ข้อมูล Summary
     * จนกว่าจะตรวจสอบชื่อ field
     * ที่ Backend ส่งกลับมาจริง
     */

}


// =========================
// UPDATE STATISTICS
// =========================

function updateStatistics(statistics) {

    console.log('Updating statistics:', statistics);

    /*
     * ตอนนี้ยังไม่แก้ข้อมูล Statistics
     * จนกว่าจะตรวจสอบชื่อ field
     * ที่ Backend ส่งกลับมาจริง
     */

}


// =========================
// UPDATE TRADES
// =========================

function updateTrades(data) {

    console.log('Updating trades:', data);

    /*
     * ตอนนี้ยังไม่แก้ Trade List
     * จนกว่าจะตรวจสอบโครงสร้างข้อมูลจริง
     */

}


// =========================
// EQUITY CHART
// =========================

let equityChart = null;


function updateEquityChart(data) {

    const canvas = document.getElementById('equityChart');


    if (!canvas) {

        console.warn('equityChart not found');

        return;

    }


    // =========================
    // GET TRADES ARRAY
    // =========================

    const trades = Array.isArray(data)
        ? data
        : (data?.trades || []);


    console.log('Equity Chart Trades:', trades);


    // =========================
    // DESTROY OLD CHART
    // =========================

    if (equityChart) {

        equityChart.destroy();

        equityChart = null;

    }


    // =========================
    // NO DATA
    // =========================

    if (trades.length === 0) {

        console.warn('No trades data for equity chart');


        equityChart = new Chart(canvas, {

            type: 'line',

            data: {

                labels: ['ไม่มีข้อมูล'],

                datasets: [{

                    label: 'Equity',

                    data: [0],

                    borderWidth: 2,

                    tension: 0.4,

                    fill: true

                }]

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

                    y: {

                        beginAtZero: false

                    }

                }

            }

        });


        return;

    }


    // =========================
    // SORT TRADES BY DATE
    // =========================

    const sortedTrades = [...trades].sort(function (a, b) {

        const dateA = new Date(
            a.closed_at ||
            a.timestamp ||
            a.created_at ||
            a.date ||
            0
        ).getTime();


        const dateB = new Date(
            b.closed_at ||
            b.timestamp ||
            b.created_at ||
            b.date ||
            0
        ).getTime();


        return dateA - dateB;

    });


    // =========================
    // CREATE EQUITY DATA
    // =========================

    let equity = 1000;

    const labels = [];

    const equityData = [];


    sortedTrades.forEach(function (trade, index) {

        // รองรับชื่อ field P/L หลายรูปแบบ
        const pnl = Number(

            trade.pnl ??

            trade.profit ??

            trade.profit_loss ??

            trade.profitLoss ??

            0

        );


        equity += pnl;


        // =========================
        // DATE LABEL
        // =========================

        const dateValue =

            trade.closed_at ??

            trade.timestamp ??

            trade.created_at ??

            trade.date ??

            null;


        let label = `Trade ${index + 1}`;


        if (dateValue) {

            const date = new Date(dateValue);


            if (!isNaN(date.getTime())) {

                label = date.toLocaleDateString('th-TH', {

                    day: 'numeric',

                    month: 'short'

                });

            }

        }


        labels.push(label);

        equityData.push(equity);

    });


    // =========================
    // DEBUG
    // =========================

    console.log('Equity Labels:', labels);

    console.log('Equity Data:', equityData);


    // =========================
    // CREATE CHART
    // =========================

    equityChart = new Chart(canvas, {

        type: 'line',

        data: {

            labels: labels,

            datasets: [{

                label: 'Equity',

                data: equityData,

                borderWidth: 2,

                tension: 0.4,

                fill: true,

                pointRadius: 3,

                pointHoverRadius: 5

            }]

        },


        options: {

            responsive: true,

            maintainAspectRatio: false,


            plugins: {

                legend: {

                    display: false

                },

                tooltip: {

                    callbacks: {

                        label: function (context) {

                            return `Equity: $${Number(
                                context.raw
                            ).toLocaleString()}`;

                        }

                    }

                }

            },


            scales: {

                y: {

                    beginAtZero: false,

                    ticks: {

                        callback: function (value) {

                            return '$' + Number(
                                value
                            ).toLocaleString();

                        }

                    }

                }

            }

        }

    });

}


// =========================
// START
// =========================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        loadDashboard();

    }
);