// Data Processor - Handles data filtering and aggregation
class DataProcessor {
    static filterData() {
        const startDate = DOM.startDateInput.value ? new Date(DOM.startDateInput.value) : null;
        const endDate = DOM.endDateInput.value ? new Date(DOM.endDateInput.value) : null;

        if (!startDate || !endDate) {
            AppState.filteredData = [...AppState.allData];
            return;
        }

        AppState.filteredData = AppState.allData.filter(row => {
            const timestampStr = row['Timestamp'];
            if (!timestampStr) return false;
            
            const timestamp = new Date(timestampStr);
            const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            const timestampOnly = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());
            
            return timestampOnly >= startDateOnly && timestampOnly <= endDateOnly;
        });
    }

    static aggregateData() {
        const paymentsByPaymentDate = {};
        const paymentsByCallingDate = {};
        const paymentsByMode = {};
        const paymentsByCRM = {};
        const paymentsByCampaign = {};
        
        AppState.filteredData.forEach(row => {
            // Aggregate by Timestamp (as lead date)
            const timestamp = row['Timestamp'];
            if (timestamp) {
                paymentsByPaymentDate[timestamp] = (paymentsByPaymentDate[timestamp] || 0) + 1;
            }

            // Aggregate by Timestamp (as calling date)
            if (timestamp) {
                paymentsByCallingDate[timestamp] = (paymentsByCallingDate[timestamp] || 0) + 1;
            }

            // Aggregate by Transaction Mode
            const mode = row['Transaction Mode'];
            if (!paymentsByMode[mode]) paymentsByMode[mode] = { count: 0 };
            paymentsByMode[mode].count++;

            // Aggregate by SPOC Name (CRM ID)
            const crmId = row['SPOC Name'];
            if (!paymentsByCRM[crmId]) paymentsByCRM[crmId] = { count: 0 };
            paymentsByCRM[crmId].count++;

            // Aggregate by Source of come (Campaign)
            const campaign = row['Source of come'];
            if (!paymentsByCampaign[campaign]) paymentsByCampaign[campaign] = { count: 0 };
            paymentsByCampaign[campaign].count++;
        });

        // Convert to arrays for sorting
        AppState.crmSummaryData = Object.keys(paymentsByCRM).map(crmId => ({
            crmId,
            count: paymentsByCRM[crmId].count
        }));

        AppState.campaignSummaryData = Object.keys(paymentsByCampaign).map(campaign => ({
            campaign,
            count: paymentsByCampaign[campaign].count
        }));

        return { paymentsByPaymentDate, paymentsByCallingDate, paymentsByMode };
    }

    static updateStats() {
        const totalLeads = AppState.filteredData.length;
        const uniqueCRMs = new Set(AppState.filteredData.map(row => row['SPOC Name'])).size;
        
        // Calculate today's leads
        const today = new Date().toDateString();
        const todaysLeads = AppState.allData.filter(row => {
            if (!row['Timestamp']) return false;
            const rowDate = new Date(row['Timestamp']).toDateString();
            return rowDate === today;
        }).length;
        
        // Calculate present agents count
        const allAgents = [...new Set(AppState.allData.map(row => row['SPOC Name']).filter(Boolean))];
        const attendance = App.getAttendance();
        const presentCount = allAgents.filter(agent => {
            const status = attendance[agent] || 'present';
            return status === 'present';
        }).length;

        DOM.totalAmount.textContent = totalLeads.toLocaleString();
        DOM.totalTransactions.textContent = uniqueCRMs.toLocaleString();
        DOM.uniqueCRM.textContent = todaysLeads.toString();
        DOM.activeCampaigns.textContent = presentCount.toString();
    }

    static sortTable(tableData, key, order) {
        const numericKeys = ['count'];
        const dateKeys = ['Timestamp'];
        const stringKeys = ['crmId', 'centre'];
        return tableData.sort((a, b) => {
            let aVal, bVal;
            
            if (key === 'centre') {
                aVal = App.getCentre(a.crmId || a.agent || a);
                bVal = App.getCentre(b.crmId || b.agent || b);
            } else {
                aVal = a[key];
                bVal = b[key];
            }
            
            if (numericKeys.includes(key)) {
                return order === 'asc' ? parseFloat(aVal) - parseFloat(bVal) : parseFloat(bVal) - parseFloat(aVal);
            } else if (dateKeys.includes(key)) {
                const aDate = new Date(aVal);
                const bDate = new Date(bVal);
                return order === 'asc' ? aDate - bDate : bDate - aDate;
            } else {
                return order === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
            }
        });
    }

    static filterAndRender() {
        this.filterData();
        this.updateStats();
        this.aggregateData();
        ChartRenderer.renderDashboard();
        TableRenderer.populateFilters();
        TableRenderer.populateSummaryFilters();
        TableRenderer.renderCrmSummaryTable(AppState.crmSummaryData);
        TableRenderer.renderCampaignSummaryTable(AppState.campaignSummaryData);
        TableRenderer.renderZeroLeadsTable();
        TableRenderer.renderTopMtdTable();
        TableRenderer.renderTopFtdTable();
        // Sort by Timestamp (latest first) by default
        const sortedData = this.sortTable([...AppState.filteredData], 'Timestamp', 'desc');
        TableRenderer.renderTable(sortedData);
        TableRenderer.updateTableCount(AppState.filteredData);
    }
}