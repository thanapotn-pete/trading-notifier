const ctx = document.getElementById('equityChart');

new Chart(ctx, {

    type: 'line',

    data: {

        labels: [
            'มิ.ย. 1',
            'มิ.ย. 3',
            'มิ.ย. 6',
            'มิ.ย. 9',
            'มิ.ย. 12'
        ],

        datasets: [{

            label: 'Equity',

            data: [
                1000,
                1120,
                1250,
                1390,
                1500
            ],

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