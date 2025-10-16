// Table Renderer - Handles all table rendering and interactions
class TableRenderer {
    static renderCrmSummaryTable(data, skipSort = false) {
        const tbody = DOM.crmSummaryTableBody;
        tbody.innerHTML = '';
        
        // Apply filters
        const searchTerm = DOM.crmSearchInput ? DOM.crmSearchInput.value.toLowerCase() : '';
        const timestampFilter = DOM.crmCallingDateFilter ? DOM.crmCallingDateFilter.value : '';
        
        let filteredData = data;
        if (searchTerm || timestampFilter) {
            filteredData = this.getFilteredCrmData(searchTerm, timestampFilter);
        }
        
        // Only apply default sorting if not already sorted
        if (!skipSort) {
            filteredData.sort((a, b) => b.count - a.count);
        }
        
        filteredData.forEach(item => {
            const centre = App.getCentre(item.crmId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.crmId}</td>
                <td>${centre}</td>
                <td>${item.count}</td>
            `;
            tbody.appendChild(row);
        });
        
        // Update totals
        const totalCount = filteredData.reduce((sum, item) => sum + item.count, 0);
        DOM.crmTotalCount.textContent = totalCount.toString();
    }

    static renderCampaignSummaryTable(data, skipSort = false) {
        const tbody = DOM.campaignSummaryTableBody;
        tbody.innerHTML = '';
        
        // Filter for today's data only (FTD - First Time Deposit)
        const searchTerm = DOM.ftdSearchInput ? DOM.ftdSearchInput.value.toLowerCase() : '';
        const today = new Date().toDateString();
        const todayData = AppState.filteredData.filter(row => {
            if (!row['Timestamp']) return false;
            const rowDate = new Date(row['Timestamp']).toDateString();
            const matchesDate = rowDate === today;
            const matchesSearch = !searchTerm || (row['SPOC Name'] && row['SPOC Name'].toLowerCase().includes(searchTerm));
            return matchesDate && matchesSearch;
        });
        
        // Aggregate today's data by SPOC
        const ftdByCRM = {};
        todayData.forEach(row => {
            const crmId = row['SPOC Name'];
            if (!ftdByCRM[crmId]) ftdByCRM[crmId] = { count: 0 };
            ftdByCRM[crmId].count++;
        });
        
        let filteredData = Object.keys(ftdByCRM).map(crmId => ({
            crmId,
            count: ftdByCRM[crmId].count
        }));
        
        // Only apply default sorting if not already sorted
        if (!skipSort) {
            filteredData.sort((a, b) => b.count - a.count);
        }
        
        filteredData.forEach(item => {
            const centre = App.getCentre(item.crmId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.crmId}</td>
                <td>${centre}</td>
                <td>${item.count}</td>
            `;
            tbody.appendChild(row);
        });
        
        // Update totals
        const totalCount = filteredData.reduce((sum, item) => sum + item.count, 0);
        DOM.campaignTotalCount.textContent = totalCount.toString();
    }

    static renderZeroLeadsTable() {
        if (!DOM.zeroLeadsTableBody || !AppState.allData.length) return;
        
        const today = new Date().toDateString();
        const todayData = AppState.allData.filter(row => {
            if (!row['Timestamp']) return false;
            const rowDate = new Date(row['Timestamp']).toDateString();
            return rowDate === today;
        });
        
        const todayAgents = new Set(todayData.map(row => row['SPOC Name']).filter(Boolean));
        const allAgents = new Set(AppState.allData.map(row => row['SPOC Name']).filter(Boolean));
        
        // Get attendance and filter only present agents
        const attendance = App.getAttendance();
        const presentAgents = [...allAgents].filter(agent => {
            const status = attendance[agent] || 'present';
            return status === 'present';
        });
        
        const zeroLeadsAgents = presentAgents.filter(agent => !todayAgents.has(agent));
        
        const tbody = DOM.zeroLeadsTableBody;
        tbody.innerHTML = '';
        
        zeroLeadsAgents.forEach(agent => {
            const centre = App.getCentre(agent);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${agent}</td>
                <td>${centre}</td>
            `;
            tbody.appendChild(row);
        });
        
        // Update title with count
        if (DOM.zeroLeadsTitle) {
            DOM.zeroLeadsTitle.textContent = `Agents with 0 Leads Today: ${zeroLeadsAgents.length}`;
        }
    }

    static renderTopMtdTable() {
        if (!DOM.topMtdTableBody || !AppState.allData.length) return;
        
        const today = new Date();
        const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const mtdData = AppState.allData.filter(row => {
            if (!row['Timestamp']) return false;
            const rowDate = new Date(row['Timestamp']);
            return rowDate >= firstOfMonth && rowDate <= today;
        });
        
        const agentCounts = {};
        mtdData.forEach(row => {
            const agent = row['SPOC Name'];
            if (agent) {
                agentCounts[agent] = (agentCounts[agent] || 0) + 1;
            }
        });
        
        const sortedAgents = Object.entries(agentCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        const tbody = DOM.topMtdTableBody;
        tbody.innerHTML = '';
        
        sortedAgents.forEach(([agent, count], index) => {
            const centre = App.getCentre(agent);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${agent}</td>
                <td>${centre}</td>
                <td>${count}</td>
            `;
            tbody.appendChild(row);
        });
    }

    static renderTopFtdTable() {
        if (!DOM.topFtdTableBody || !AppState.allData.length) return;
        
        const today = new Date().toDateString();
        const todayData = AppState.allData.filter(row => {
            if (!row['Timestamp']) return false;
            const rowDate = new Date(row['Timestamp']).toDateString();
            return rowDate === today;
        });
        
        const agentCounts = {};
        todayData.forEach(row => {
            const agent = row['SPOC Name'];
            if (agent) {
                agentCounts[agent] = (agentCounts[agent] || 0) + 1;
            }
        });
        
        const sortedAgents = Object.entries(agentCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        const tbody = DOM.topFtdTableBody;
        tbody.innerHTML = '';
        
        sortedAgents.forEach(([agent, count], index) => {
            const centre = App.getCentre(agent);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${agent}</td>
                <td>${centre}</td>
                <td>${count}</td>
            `;
            tbody.appendChild(row);
        });
    }

    static renderTable(data) {
        const tbody = DOM.dataTableBody;
        tbody.innerHTML = '';
        
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row['SPOC Name'] || ''}</td>
                <td>${row['Customer Name'] || ''}</td>
                <td>${row['Mobile Number'] || ''}</td>
                <td>${row['Company'] || ''}</td>
                <td>${row['State'] || ''}</td>
                <td>${row['Source of come'] || ''}</td>
                <td>${row['Unique ID'] || ''}</td>
                <td>${row['Amount Received'] || ''}</td>
                <td>${row['Transaction Mode'] || ''}</td>
                <td>${row['Filing Type'] || ''}</td>
                <td>${row['Timestamp'] || ''}</td>
                <td><button class="copy-btn" onclick="TableRenderer.copyRowData(this)" title="Copy transaction details"><i class="fas fa-copy"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    static populateFilters() {
        const data = AppState.filteredData;
        
        // Get unique values for each filter
        const campaigns = [...new Set(data.map(row => row['Source of come']).filter(Boolean))].sort();
        const crmIds = [...new Set(data.map(row => row['SPOC Name']).filter(Boolean))].sort();
        const paymentModes = [...new Set(data.map(row => row['Transaction Mode']).filter(Boolean))].sort();
        const timestamps = [...new Set(data.map(row => {
            if (!row['Timestamp']) return null;
            return new Date(row['Timestamp']).toDateString();
        }).filter(Boolean))].sort((a, b) => new Date(a) - new Date(b));
        
        // Populate dropdowns
        this.populateSelect(DOM.campaignFilter, campaigns, 'All Source');
        this.populateSelect(DOM.crmFilter, crmIds, 'All SPOC');
        this.populateSelect(DOM.paymentModeFilter, paymentModes, 'All Transaction Mode');
        this.populateSelect(DOM.callingDateFilter, timestamps, 'All Date');
    }
    
    static populateSelect(selectElement, options, defaultText) {
        if (!selectElement) return;
        selectElement.innerHTML = `<option value="">${defaultText}</option>`;
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
    }

    static applyFilters() {
        const searchTerm = DOM.tableSearchInput.value.toLowerCase();
        const campaignFilter = DOM.campaignFilter.value;
        const crmFilter = DOM.crmFilter.value;
        const paymentModeFilter = DOM.paymentModeFilter.value;
        const callingDateFilter = DOM.callingDateFilter.value;
        
        let filtered = AppState.filteredData.filter(row => {
            // Search filter
            const matchesSearch = !searchTerm || Object.values(row).some(value => 
                String(value).toLowerCase().includes(searchTerm)
            );
            
            // Dropdown filters
            const matchesCampaign = !campaignFilter || row['Source of come'] === campaignFilter;
            const matchesCrm = !crmFilter || row['SPOC Name'] === crmFilter;
            const matchesPaymentMode = !paymentModeFilter || row['Transaction Mode'] === paymentModeFilter;
            const matchesTimestamp = !callingDateFilter || (row['Timestamp'] && new Date(row['Timestamp']).toDateString() === callingDateFilter);
            
            return matchesSearch && matchesCampaign && matchesCrm && matchesPaymentMode && matchesTimestamp;
        });
        
        this.renderTable(filtered);
        this.updateTableCount(filtered);
    }

    static filterTable(searchTerm) {
        this.applyFilters();
    }

    static populateSummaryFilters() {
        const data = AppState.filteredData;
        
        // Get unique dates (date only, not time) and sort chronologically
        const dates = [...new Set(data.map(row => {
            if (!row['Timestamp']) return null;
            return new Date(row['Timestamp']).toDateString();
        }).filter(Boolean))].sort((a, b) => new Date(a) - new Date(b));
        
        // Populate CRM filters
        this.populateSelect(DOM.crmCallingDateFilter, dates, 'All Date');
    }

    static getFilteredCrmData(searchTerm, timestampFilter) {
        let filteredData = AppState.filteredData;
        
        if (timestampFilter) {
            filteredData = filteredData.filter(row => {
                if (!row['Timestamp']) return false;
                const rowDate = new Date(row['Timestamp']).toDateString();
                const filterDate = new Date(timestampFilter).toDateString();
                return rowDate === filterDate;
            });
        }
        
        // Aggregate by SPOC Name (CRM ID)
        const paymentsByCRM = {};
        filteredData.forEach(row => {
            const crmId = row['SPOC Name'];
            if (crmId && (!searchTerm || crmId.toLowerCase().includes(searchTerm))) {
                if (!paymentsByCRM[crmId]) paymentsByCRM[crmId] = { count: 0 };
                paymentsByCRM[crmId].count++;
            }
        });
        
        return Object.keys(paymentsByCRM).map(crmId => ({
            crmId,
            count: paymentsByCRM[crmId].count
        }));
    }

    static getFilteredCampaignData(timestampFilter) {
        let filteredData = AppState.filteredData;
        
        if (timestampFilter) {
            filteredData = filteredData.filter(row => row['Timestamp'] === timestampFilter);
        }
        
        // Aggregate by Source of come (Campaign)
        const paymentsByCampaign = {};
        filteredData.forEach(row => {
            const campaign = row['Source of come'];
            if (!paymentsByCampaign[campaign]) paymentsByCampaign[campaign] = { count: 0 };
            paymentsByCampaign[campaign].count++;
        });
        
        return Object.keys(paymentsByCampaign).map(campaign => ({
            campaign,
            count: paymentsByCampaign[campaign].count
        }));
    }

    static updateTableCount(data) {
        const count = data.length;
        DOM.tableCount.innerHTML = `<span style="color: #059669;">${count} leads</span>`;
    }

    static copyRowData(button) {
        const row = button.closest('tr');
        const cells = row.querySelectorAll('td');
        
        const data = {
            spocName: cells[0].textContent,
            customerName: cells[1].textContent,
            mobile: cells[2].textContent,
            company: cells[3].textContent,
            state: cells[4].textContent,
            source: cells[5].textContent,
            uniqueId: cells[6].textContent,
            amount: cells[7].textContent,
            mode: cells[8].textContent,
            filingType: cells[9].textContent,
            timestamp: cells[10].textContent
        };
        
        const copyText = `SPOC Name - ${data.spocName}
Customer Name - ${data.customerName}
Mobile - ${data.mobile}
Company - ${data.company}
State - ${data.state}
Source - ${data.source}
Unique ID - ${data.uniqueId}
Amount - ${data.amount}
Transaction Mode - ${data.mode}
Filing Type - ${data.filingType}
Timestamp - ${data.timestamp}`;
        
        navigator.clipboard.writeText(copyText).then(() => {
            // Show success feedback
            const icon = button.querySelector('i');
            icon.className = 'fas fa-check';
            button.style.color = '#10b981';
            setTimeout(() => {
                icon.className = 'fas fa-copy';
                button.style.color = '';
            }, 2000);
        }).catch(() => {
            alert('Failed to copy to clipboard');
        });
    }
}