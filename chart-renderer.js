// Chart Renderer - Handles all chart rendering
// Register the datalabels plugin
Chart.register(ChartDataLabels);

class ChartRenderer {
    static renderDashboard() {
        // No charts to render anymore - tables are handled in DataProcessor
    }

    static renderPaymentDateChart(data) {
        const labels = Object.keys(data).sort();
        const amounts = labels.map(date => data[date]);
        const counts = labels.map(date => {
            return AppState.filteredData.filter(row => row['Payment Date'] === date).length;
        });
        
        const ctx = document.getElementById('paymentDateChart').getContext('2d');
        AppState.charts.paymentDateChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Amount',
                    data: amounts,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: CONFIG.CHART_COLORS.primary,
                    borderWidth: 2,
                    borderRadius: 4
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
                            label: function(context) {
                                const amount = context.parsed.y;
                                const count = counts[context.dataIndex];
                                return [
                                    `Amount: ₹${amount.toLocaleString('en-IN')}`,
                                    `Count: ${count} transactions`
                                ];
                            }
                        }
                    },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'top',
                        formatter: (value) => `₹${(value/1000).toFixed(0)}K`,
                        font: { size: 10, weight: 'bold' },
                        color: '#374151'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount (₹)',
                            font: { weight: 'bold' }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    static renderCallingDateChart(data) {
        const labels = Object.keys(data).sort();
        const amounts = labels.map(date => data[date]);
        const counts = labels.map(date => {
            return AppState.filteredData.filter(row => row['Calling Date'] === date).length;
        });
        
        const ctx = document.getElementById('callingDateChart').getContext('2d');
        AppState.charts.callingDateChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Amount',
                    data: amounts,
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: CONFIG.CHART_COLORS.success,
                    borderWidth: 2,
                    borderRadius: 4
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
                            label: function(context) {
                                const amount = context.parsed.y;
                                const count = counts[context.dataIndex];
                                return [
                                    `Amount: ₹${amount.toLocaleString('en-IN')}`,
                                    `Count: ${count} transactions`
                                ];
                            }
                        }
                    },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'top',
                        formatter: (value) => `₹${(value/1000).toFixed(0)}K`,
                        font: { size: 10, weight: 'bold' },
                        color: '#374151'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount (₹)',
                            font: { weight: 'bold' }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    static renderPaymentModeChart(data) {
        const labels = Object.keys(data);
        const counts = labels.map(mode => data[mode].count);
        const amounts = labels.map(mode => data[mode].amount);
        
        const ctx = document.getElementById('paymentModeChart').getContext('2d');
        AppState.charts.paymentModeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: counts,
                    backgroundColor: CONFIG.PIE_COLORS,
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    hoverBorderWidth: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const count = context.parsed;
                                const amount = amounts[context.dataIndex];
                                const percentage = ((count / counts.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                                return [
                                    `${context.label}: ${percentage}%`,
                                    `Count: ${count} transactions`,
                                    `Amount: ₹${amount.toLocaleString('en-IN')}`
                                ];
                            }
                        }
                    },
                    datalabels: {
                        display: true,
                        formatter: (value, context) => {
                            const percentage = ((value / counts.reduce((a, b) => a + b, 0)) * 100).toFixed(0);
                            return percentage > 5 ? `${percentage}%` : '';
                        },
                        font: { size: 11, weight: 'bold' },
                        color: '#ffffff'
                    }
                },
                cutout: '60%'
            }
        });
    }
}