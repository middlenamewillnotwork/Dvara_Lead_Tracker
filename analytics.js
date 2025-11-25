// Analytics Module - Advanced Analytics Features
class Analytics {
    static charts = {};

    static renderAnalytics() {
        this.renderDayWiseLeadChart();
        this.renderHourlyLeadChart();
        this.renderLeadStatsTable();
    }

    static renderDayWiseLeadChart() {
        const canvas = document.getElementById('dayWiseChart');
        if (!canvas) return;

        // Get date range for day-wise chart
        const dayStartDate = document.getElementById('dayWiseStartDate')?.value;
        const dayEndDate = document.getElementById('dayWiseEndDate')?.value;
        
        // Filter data by date range if provided
        let chartData = AppState.allData;
        if (dayStartDate && dayEndDate) {
            const start = new Date(dayStartDate);
            const end = new Date(dayEndDate);
            end.setHours(23, 59, 59, 999); // Include full end date
            chartData = AppState.allData.filter(row => {
                if (!row['Timestamp']) return false;
                const rowDate = new Date(row['Timestamp']);
                return rowDate >= start && rowDate <= end;
            });
        }

        // Group leads by day within date range
        const dayWiseData = {};
        chartData.forEach(row => {
            if (!row['Timestamp']) return;
            const date = new Date(row['Timestamp']).toDateString();
            dayWiseData[date] = (dayWiseData[date] || 0) + 1;
        });

        const sortedDates = Object.keys(dayWiseData).sort((a, b) => new Date(a) - new Date(b));
        const counts = sortedDates.map(date => dayWiseData[date]);

        if (this.charts.dayWiseChart) {
            this.charts.dayWiseChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        this.charts.dayWiseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedDates.map(date => new Date(date).toLocaleDateString()),
                datasets: [{
                    label: 'Lead Count',
                    data: counts,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'top',
                        formatter: (value) => value,
                        font: { size: 10, weight: 'bold' },
                        color: '#374151'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Lead Count' }
                    }
                }
            }
        });
    }

    static renderHourlyLeadChart() {
        const canvas = document.getElementById('hourlyChart');
        if (!canvas) return;

        const selectedDate = document.getElementById('hourlyDateFilter')?.value || new Date().toISOString().split('T')[0];
        const targetDate = new Date(selectedDate).toDateString();

        // Group leads by 30-minute intervals (7am to 9pm = 28 intervals)
        const intervalData = Array(28).fill(0); // 14 hours * 2 intervals per hour = 28
        AppState.allData.forEach(row => {
            if (!row['Timestamp']) return;
            const rowDate = new Date(row['Timestamp']);
            if (rowDate.toDateString() === targetDate) {
                const hour = rowDate.getHours();
                const minute = rowDate.getMinutes();
                if (hour >= 7 && hour <= 21) {
                    const intervalIndex = (hour - 7) * 2 + Math.floor(minute / 30);
                    if (intervalIndex < 28) {
                        intervalData[intervalIndex]++;
                    }
                }
            }
        });

        // Generate 30-minute interval labels
        const intervals = [];
        for (let h = 7; h <= 21; h++) {
            for (let m = 0; m < 60; m += 30) {
                if (h === 21 && m > 0) break; // Stop at 21:00
                intervals.push(`${h}:${m.toString().padStart(2, '0')}`);
            }
        }

        if (this.charts.hourlyChart) {
            this.charts.hourlyChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        this.charts.hourlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: intervals,
                datasets: [{
                    label: '30-min Intervals',
                    data: intervalData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'top',
                        formatter: (value) => value > 0 ? value : '',
                        font: { size: 9, weight: 'bold' },
                        color: '#374151'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Lead Count' }
                    },
                    x: {
                        title: { display: true, text: '30-Minute Intervals' },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }

    static renderLeadStatsTable() {
        const tbody = document.getElementById('leadStatsTableBody');
        if (!tbody) return;

        const isFullDay = document.getElementById('statsToggle')?.checked || false;
        const startDate = document.getElementById('statsStartDate')?.value;
        const endDate = document.getElementById('statsEndDate')?.value;
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const currentTime = new Date();

        // Filter data by date range if provided
        let filteredData = AppState.allData;
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            filteredData = AppState.allData.filter(row => {
                if (!row['Timestamp']) return false;
                const rowDate = new Date(row['Timestamp']);
                return rowDate >= start && rowDate <= end;
            });
        }

        // Calculate all daily leads with dates (use all data for today count, not filtered)
        const dailyLeadsWithDates = {};
        filteredData.forEach(row => {
            if (!row['Timestamp']) return;
            const rowDate = new Date(row['Timestamp']);
            const dateStr = rowDate.toDateString();
            
            if (!dailyLeadsWithDates[dateStr]) {
                dailyLeadsWithDates[dateStr] = { count: 0, date: rowDate };
            }
            
            // Apply "till now" logic for all days if toggle is off
            if (isFullDay) {
                dailyLeadsWithDates[dateStr].count++;
            } else {
                // For today, count only till current time
                if (dateStr === today) {
                    if (rowDate <= currentTime) {
                        dailyLeadsWithDates[dateStr].count++;
                    }
                } else {
                    // For other days, count till same time of day
                    const sameTimeOnThatDay = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate(), currentTime.getHours(), currentTime.getMinutes());
                    if (rowDate <= sameTimeOnThatDay) {
                        dailyLeadsWithDates[dateStr].count++;
                    }
                }
            }
        });

        // Calculate today's count from all data (not filtered by date range)
        let todayCount = 0;
        AppState.allData.forEach(row => {
            if (!row['Timestamp']) return;
            const rowDate = new Date(row['Timestamp']);
            if (rowDate.toDateString() === today) {
                if (isFullDay) {
                    todayCount++;
                } else {
                    if (rowDate <= currentTime) {
                        todayCount++;
                    }
                }
            }
        });

        // Get best and lowest days (excluding today)
        const otherDays = Object.entries(dailyLeadsWithDates).filter(([date]) => date !== today);
        let bestDayData = { count: 0, date: null };
        let lowestDayData = { count: Infinity, date: null };
        
        otherDays.forEach(([dateStr, data]) => {
            if (data.count > bestDayData.count) {
                bestDayData = { count: data.count, date: data.date };
            }
            if (data.count < lowestDayData.count) {
                lowestDayData = { count: data.count, date: data.date };
            }
        });

        if (lowestDayData.count === Infinity) lowestDayData.count = 0;

        const yesterdayCount = dailyLeadsWithDates[yesterday]?.count || 0;

        const formatDate = (date) => date ? date.toLocaleDateString('en-GB') : 'N/A';
        
        // Calculate comparisons
        const bestDifference = todayCount - bestDayData.count;
        const isBestAhead = bestDifference >= 0;
        const bestComparisonText = isBestAhead 
            ? `<i class="fas fa-arrow-up text-green-500 mr-1"></i>Ahead by ${Math.abs(bestDifference)} leads`
            : `<i class="fas fa-arrow-down text-red-500 mr-1"></i>Behind by ${Math.abs(bestDifference)} leads`;
        const bestComparisonColor = isBestAhead ? 'text-green-600' : 'text-red-600';

        const yesterdayDifference = todayCount - yesterdayCount;
        const isYesterdayAhead = yesterdayDifference >= 0;
        const yesterdayComparisonText = isYesterdayAhead 
            ? `<i class="fas fa-arrow-up text-green-500 mr-1"></i>Ahead by ${Math.abs(yesterdayDifference)} leads`
            : `<i class="fas fa-arrow-down text-red-500 mr-1"></i>Behind by ${Math.abs(yesterdayDifference)} leads`;
        const yesterdayComparisonColor = isYesterdayAhead ? 'text-green-600' : 'text-red-600';

        tbody.innerHTML = `
            <tr>
                <td><i class="fas fa-trophy text-yellow-500 mr-2"></i>Best Day (${formatDate(bestDayData.date)})</td>
                <td class="font-bold text-green-600">${bestDayData.count}</td>
            </tr>
            <tr>
                <td><i class="fas fa-calendar-minus text-blue-500 mr-2"></i>Yesterday</td>
                <td class="font-bold">${yesterdayCount}</td>
            </tr>
            <tr>
                <td><i class="fas fa-arrow-down text-red-500 mr-2"></i>Lowest Day (${formatDate(lowestDayData.date)})</td>
                <td class="font-bold text-red-600">${lowestDayData.count}</td>
            </tr>
            <tr>
                <td><i class="fas fa-calendar-day text-purple-500 mr-2"></i>Today ${isFullDay ? '(Full)' : '(Till Now)'}</td>
                <td class="font-bold text-purple-600">${todayCount}</td>
            </tr>
            <tr style="background-color: #f8fafc;">
                <td class="text-center ${bestComparisonColor} font-medium" style="padding: 0.5rem; border-right: 1px solid #e2e8f0;">
                    ${bestComparisonText} vs Best Day
                </td>
                <td class="text-center ${yesterdayComparisonColor} font-medium" style="padding: 0.5rem;">
                    ${yesterdayComparisonText} vs Yesterday
                </td>
            </tr>
        `;
    }

    static setDefaultStatsDateRange() {
        const statsStartDate = document.getElementById('statsStartDate');
        const statsEndDate = document.getElementById('statsEndDate');
        if (statsStartDate && statsEndDate) {
            const today = new Date();
            const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            
            // Check if saved dates exist and are from current month
            const savedStart = localStorage.getItem('statsStartDate');
            const savedEnd = localStorage.getItem('statsEndDate');
            const currentMonthStart = formatDate(firstOfMonth);
            const currentToday = formatDate(today);
            
            // Use saved dates if they exist and start date is from current month, otherwise use current month
            if (savedStart && savedEnd && savedStart.startsWith(currentMonthStart.substring(0, 7))) {
                statsStartDate.value = savedStart;
                statsEndDate.value = currentToday; // Always update end date to today
            } else {
                statsStartDate.value = currentMonthStart;
                statsEndDate.value = currentToday;
            }
            
            // Save to localStorage
            localStorage.setItem('statsStartDate', statsStartDate.value);
            localStorage.setItem('statsEndDate', statsEndDate.value);
        }
    }
    
    static saveStatsDateRange() {
        const statsStartDate = document.getElementById('statsStartDate');
        const statsEndDate = document.getElementById('statsEndDate');
        if (statsStartDate && statsEndDate) {
            localStorage.setItem('statsStartDate', statsStartDate.value);
            localStorage.setItem('statsEndDate', statsEndDate.value);
        }
    }

    static setupEventListeners() {
        const hourlyDateFilter = document.getElementById('hourlyDateFilter');
        if (hourlyDateFilter) {
            hourlyDateFilter.addEventListener('change', () => {
                this.renderHourlyLeadChart();
            });
        }

        const statsToggle = document.getElementById('statsToggle');
        if (statsToggle) {
            statsToggle.addEventListener('change', () => {
                this.renderLeadStatsTable();
            });
        }

        const statsStartDate = document.getElementById('statsStartDate');
        const statsEndDate = document.getElementById('statsEndDate');
        if (statsStartDate) {
            statsStartDate.addEventListener('change', () => {
                this.saveStatsDateRange();
                this.renderLeadStatsTable();
            });
        }
        if (statsEndDate) {
            statsEndDate.addEventListener('change', () => {
                this.saveStatsDateRange();
                this.renderLeadStatsTable();
            });
        }

        const dayWiseStartDate = document.getElementById('dayWiseStartDate');
        const dayWiseEndDate = document.getElementById('dayWiseEndDate');
        if (dayWiseStartDate) {
            dayWiseStartDate.addEventListener('change', () => {
                this.saveDayWiseDateRange();
                this.renderDayWiseLeadChart();
            });
        }
        if (dayWiseEndDate) {
            dayWiseEndDate.addEventListener('change', () => {
                this.saveDayWiseDateRange();
                this.renderDayWiseLeadChart();
            });
        }
    }

    static setDefaultDayWiseDateRange() {
        const dayStartDate = document.getElementById('dayWiseStartDate');
        const dayEndDate = document.getElementById('dayWiseEndDate');
        if (dayStartDate && dayEndDate) {
            const today = new Date();
            const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            
            const savedStart = localStorage.getItem('dayWiseStartDate');
            const savedEnd = localStorage.getItem('dayWiseEndDate');
            const currentMonthStart = formatDate(firstOfMonth);
            const currentToday = formatDate(today);
            
            if (savedStart && savedEnd && savedStart.startsWith(currentMonthStart.substring(0, 7))) {
                dayStartDate.value = savedStart;
                dayEndDate.value = currentToday;
            } else {
                dayStartDate.value = currentMonthStart;
                dayEndDate.value = currentToday;
            }
            
            localStorage.setItem('dayWiseStartDate', dayStartDate.value);
            localStorage.setItem('dayWiseEndDate', dayEndDate.value);
        }
    }
    
    static saveDayWiseDateRange() {
        const dayStartDate = document.getElementById('dayWiseStartDate');
        const dayEndDate = document.getElementById('dayWiseEndDate');
        if (dayStartDate && dayEndDate) {
            localStorage.setItem('dayWiseStartDate', dayStartDate.value);
            localStorage.setItem('dayWiseEndDate', dayEndDate.value);
        }
    }

    static setDefaultHourlyDate() {
        const hourlyDateFilter = document.getElementById('hourlyDateFilter');
        if (hourlyDateFilter) {
            const today = new Date().toISOString().split('T')[0];
            hourlyDateFilter.value = today;
        }
    }
}