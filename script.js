// Main Application Script
class App {
    static async init() {
        initializeDOM();
        this.setupEventListeners();
        this.setDefaultDates();
        this.initInternetMonitoring();
        Analytics.setupEventListeners();
        Analytics.setDefaultHourlyDate();
        Analytics.setDefaultStatsDateRange();
        await this.loadData();
    }

    static setupEventListeners() {
        // View toggle
        DOM.dashboardViewBtn.addEventListener('click', () => this.switchView('dashboard'));
        DOM.tableViewBtn.addEventListener('click', () => this.switchView('table'));

        // Date filters and refresh
        DOM.startDateInput.addEventListener('change', () => DataProcessor.filterAndRender());
        DOM.endDateInput.addEventListener('change', () => DataProcessor.filterAndRender());
        DOM.refreshBtn.addEventListener('click', () => this.loadData());

        // Table search and filters
        DOM.tableSearchInput.addEventListener('input', () => TableRenderer.applyFilters());
        DOM.campaignFilter.addEventListener('change', () => TableRenderer.applyFilters());
        DOM.crmFilter.addEventListener('change', () => TableRenderer.applyFilters());
        DOM.paymentModeFilter.addEventListener('change', () => TableRenderer.applyFilters());
        DOM.callingDateFilter.addEventListener('change', () => TableRenderer.applyFilters());
        
        // Summary table filters
        DOM.crmSearchInput.addEventListener('input', () => {
            TableRenderer.renderCrmSummaryTable(AppState.crmSummaryData);
        });
        DOM.crmCallingDateFilter.addEventListener('change', () => {
            TableRenderer.renderCrmSummaryTable(AppState.crmSummaryData);
        });
        DOM.ftdSearchInput.addEventListener('input', () => {
            TableRenderer.renderCampaignSummaryTable(AppState.campaignSummaryData);
        });
        
        // Attendance popup
        DOM.attendanceBtn.addEventListener('click', () => this.showAttendancePopup());
        DOM.closeAttendance.addEventListener('click', () => this.hideAttendancePopup());
        DOM.attendancePopup.addEventListener('click', (e) => {
            if (e.target === DOM.attendancePopup) this.hideAttendancePopup();
        });
        // FTD table doesn't need filters as it shows today's data only

        // Table sorting
        document.querySelectorAll('.sortable-header').forEach(header => {
            header.addEventListener('click', () => this.handleSort(header));
        });
    }

    static switchView(view) {
        AppState.currentView = view;
        
        if (view === 'dashboard') {
            DOM.dashboardView.classList.remove('hidden');
            DOM.tableView.classList.add('hidden');
            DOM.dashboardViewBtn.classList.add('active');
            DOM.tableViewBtn.classList.remove('active');
            DOM.slider.style.transform = 'translateX(0)';
        } else {
            DOM.dashboardView.classList.add('hidden');
            DOM.tableView.classList.remove('hidden');
            DOM.dashboardViewBtn.classList.remove('active');
            DOM.tableViewBtn.classList.add('active');
            DOM.slider.style.transform = 'translateX(100%)';
            // Set default sort indicator on Timestamp column
            this.setDefaultTableSort();
        }
    }

    static setDefaultDates() {
        const today = new Date();
        const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        // Format dates properly to avoid timezone issues
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        DOM.startDateInput.value = formatDate(firstOfMonth);
        DOM.endDateInput.value = formatDate(today);
    }

    static async loadData() {
        try {
            DOM.loadingOverlay.classList.remove('hidden');
            await DataService.fetchData();
            console.log('Data loaded:', AppState.allData.length, 'rows');
            DataProcessor.filterAndRender();
            this.hideMessage();
        } catch (error) {
            console.error('Data loading error:', error);
            this.showMessage('Failed to load data. Please try again.', 'error');
        } finally {
            DOM.loadingOverlay.classList.add('hidden');
        }
    }

    static showMessage(text, type = 'info') {
        DOM.messageText.textContent = text;
        DOM.messageBox.className = `message-box ${type}`;
        DOM.messageBox.classList.remove('hidden');
        setTimeout(() => this.hideMessage(), 5000);
    }

    static hideMessage() {
        DOM.messageBox.classList.add('hidden');
    }

    static setDefaultTableSort() {
        // Reset all headers
        document.querySelectorAll('.sortable-header').forEach(h => {
            h.dataset.sortOrder = '';
            h.classList.remove('asc', 'desc');
        });
        
        // Set Timestamp column as default sort (desc)
        const timestampHeader = document.querySelector('[data-sort-key="Timestamp"]');
        if (timestampHeader) {
            timestampHeader.dataset.sortOrder = 'desc';
            timestampHeader.classList.add('desc');
        }
    }

    static handleSort(header) {
        const key = header.dataset.sortKey;
        const currentOrder = header.dataset.sortOrder || 'desc';
        const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
        
        // Reset all headers
        document.querySelectorAll('.sortable-header').forEach(h => {
            h.dataset.sortOrder = '';
            h.classList.remove('asc', 'desc');
        });
        
        // Set current header
        header.dataset.sortOrder = newOrder;
        header.classList.add(newOrder);
        
        // Sort and render based on table
        const table = header.closest('table');
        if (table.querySelector('#crmSummaryTableBody')) {
            const sorted = DataProcessor.sortTable([...AppState.crmSummaryData], key, newOrder);
            TableRenderer.renderCrmSummaryTable(sorted, true);
        } else if (table.querySelector('#campaignSummaryTableBody')) {
            // FTD table sorting - use the same method as renderCampaignSummaryTable
            const today = new Date().toDateString();
            const todayData = AppState.allData.filter(row => {
                if (!row['Timestamp']) return false;
                const rowDate = new Date(row['Timestamp']).toDateString();
                return rowDate === today;
            });
            
            const ftdByCRM = {};
            todayData.forEach(row => {
                const crmId = row['SPOC Name'];
                if (crmId && !ftdByCRM[crmId]) ftdByCRM[crmId] = { count: 0 };
                if (crmId) ftdByCRM[crmId].count++;
            });
            
            let ftdData = Object.keys(ftdByCRM).map(crmId => ({
                crmId,
                count: ftdByCRM[crmId].count
            }));
            
            const sorted = DataProcessor.sortTable(ftdData, key, newOrder);
            
            // Render manually since it's FTD data
            const tbody = document.querySelector('#campaignSummaryTableBody');
            tbody.innerHTML = '';
            
            sorted.forEach(item => {
                const centre = App.getCentre(item.crmId);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.crmId}</td>
                    <td>${centre}</td>
                    <td>${item.count}</td>
                `;
                tbody.appendChild(row);
            });
            
            const totalCount = sorted.reduce((sum, item) => sum + item.count, 0);
            const totalElement = document.getElementById('campaignTotalCount');
            if (totalElement) totalElement.textContent = totalCount.toString();
        } else if (table.querySelector('#dataTableBody')) {
            const sorted = DataProcessor.sortTable([...AppState.filteredData], key, newOrder);
            TableRenderer.renderTable(sorted);
        }
    }

    static initInternetMonitoring() {
        this.updateInternetStatus();
        
        // Check internet status every 30 seconds
        setInterval(() => this.updateInternetStatus(), 30000);
        
        // Listen for online/offline events
        window.addEventListener('online', () => this.updateInternetStatus());
        window.addEventListener('offline', () => this.updateInternetStatus());
    }

    static updateInternetStatus() {
        const isOnline = navigator.onLine;
        
        if (isOnline) {
            DOM.liveDataStatus.style.display = 'flex';
            DOM.internetStatus.style.display = 'none';
        } else {
            DOM.liveDataStatus.style.display = 'none';
            DOM.internetStatus.style.display = 'flex';
        }
    }
    
    static showAttendancePopup() {
        this.renderAttendanceList();
        DOM.attendancePopup.classList.remove('hidden');
    }
    
    static hideAttendancePopup() {
        DOM.attendancePopup.classList.add('hidden');
    }
    
    static renderAttendanceList() {
        const allAgents = [...new Set(AppState.allData.map(row => row['SPOC Name']).filter(Boolean))].sort();
        const attendance = this.getAttendance();
        
        DOM.attendanceList.innerHTML = '';
        
        allAgents.forEach(agent => {
            const status = attendance[agent] || 'present';
            const div = document.createElement('div');
            div.className = 'grid grid-cols-3 gap-4 p-3 border-b';
            const centre = this.getCentre(agent);
            div.innerHTML = `
                <div class="border-r pr-4">
                    <span class="font-medium">${agent}</span>
                </div>
                <div class="border-r pr-4">
                    <div class="flex gap-3">
                        <label class="flex items-center">
                            <input type="radio" name="${agent}" value="present" ${status === 'present' ? 'checked' : ''} class="mr-1">
                            Present
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="${agent}" value="absent" ${status === 'absent' ? 'checked' : ''} class="mr-1">
                            Absent
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="${agent}" value="attr" ${status === 'attr' ? 'checked' : ''} class="mr-1">
                            ATTR
                        </label>
                    </div>
                </div>
                <div>
                    <div class="flex gap-3">
                        <label class="flex items-center">
                            <input type="radio" name="centre_${agent}" value="Rajajinagar" ${centre === 'Rajajinagar' ? 'checked' : ''} class="mr-1">
                            Rajajinagar
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="centre_${agent}" value="Gopalan Mall" ${centre === 'Gopalan Mall' ? 'checked' : ''} class="mr-1">
                            Gopalan Mall
                        </label>
                    </div>
                </div>
            `;
            
            div.querySelectorAll('input[name="' + agent + '"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    this.updateAttendance(agent, radio.value);
                });
            });
            
            div.querySelectorAll('input[name="centre_' + agent + '"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    this.updateCentre(agent, radio.value);
                });
            });
            
            DOM.attendanceList.appendChild(div);
        });
    }
    
    static getAttendance() {
        const stored = localStorage.getItem('spocAttendance');
        const attendance = stored ? JSON.parse(stored) : {};
        
        // Reset absent to present daily (keep ATTR)
        const today = new Date().toDateString();
        const lastUpdate = localStorage.getItem('attendanceLastUpdate');
        
        if (lastUpdate !== today) {
            Object.keys(attendance).forEach(agent => {
                if (attendance[agent] === 'absent') {
                    attendance[agent] = 'present';
                }
            });
            localStorage.setItem('attendanceLastUpdate', today);
            localStorage.setItem('spocAttendance', JSON.stringify(attendance));
        }
        
        return attendance;
    }
    
    static updateAttendance(agent, status) {
        const attendance = this.getAttendance();
        attendance[agent] = status;
        localStorage.setItem('spocAttendance', JSON.stringify(attendance));
        
        // Refresh zero leads table
        TableRenderer.renderZeroLeadsTable();
    }
    
    static getCentre(agent) {
        const stored = localStorage.getItem('spocCentres');
        const centres = stored ? JSON.parse(stored) : {};
        return centres[agent] || 'Rajajinagar';
    }
    
    static updateCentre(agent, centre) {
        const stored = localStorage.getItem('spocCentres');
        const centres = stored ? JSON.parse(stored) : {};
        centres[agent] = centre;
        localStorage.setItem('spocCentres', JSON.stringify(centres));
        
        // Refresh tables
        DataProcessor.filterAndRender();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => App.init());