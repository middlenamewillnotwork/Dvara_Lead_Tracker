// Configuration and Constants
const CONFIG = {
    DATA_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT9cVCq2EcIhTvxYyqOeWRXd-SQvYCSapULOU2OEmLDxaw1z2pX2EhiZXJvC9WQa6AmjWAj_kGMFRlx/pub?gid=0&single=true&output=csv",
    REFRESH_INTERVAL: 10 * 60 * 1000, // 10 minutes
    CHART_COLORS: {
        primary: '#3b82f6',
        secondary: '#1e40af',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        purple: '#8b5cf6',
        orange: '#f97316'
    },
    PIE_COLORS: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(249, 115, 22, 0.8)'
    ]
};

// Global State
const AppState = {
    allData: [],
    filteredData: [],
    crmSummaryData: [],
    campaignSummaryData: [],
    charts: {},
    currentView: 'dashboard'
};

// DOM Elements Cache
const DOM = {
    loadingOverlay: null,
    messageBox: null,
    messageText: null,
    dashboardViewBtn: null,
    tableViewBtn: null,
    dashboardView: null,
    tableView: null,
    refreshBtn: null,
    startDateInput: null,
    endDateInput: null,
    tableSearchInput: null,
    campaignFilter: null,
    crmFilter: null,
    paymentModeFilter: null,
    callingDateFilter: null,
    crmCampaignFilter: null,
    crmCallingDateFilter: null,
    // campaignCallingDateFilter: null, // Removed for FTD table
    slider: null,
    liveDataStatus: null,
    internetStatus: null,
    // Stats elements
    totalAmount: null,
    totalTransactions: null,
    uniqueCRM: null,
    activeCampaigns: null,
    // Table bodies
    crmSummaryTableBody: null,
    campaignSummaryTableBody: null,
    dataTableBody: null,
    // Table totals
    crmTotalCount: null,
    campaignTotalCount: null,
    tableCount: null,
    zeroLeadsTableBody: null,
    topMtdTableBody: null,
    topFtdTableBody: null,
    zeroLeadsTitle: null,
    crmSearchInput: null,
    ftdSearchInput: null,
    attendanceBtn: null,
    attendancePopup: null,
    closeAttendance: null,
    attendanceList: null
};

// Initialize DOM elements
const initializeDOM = () => {
    DOM.loadingOverlay = document.getElementById('loadingOverlay');
    DOM.messageBox = document.getElementById('messageBox');
    DOM.messageText = document.getElementById('messageText');
    DOM.dashboardViewBtn = document.getElementById('dashboardViewBtn');
    DOM.tableViewBtn = document.getElementById('tableViewBtn');
    DOM.dashboardView = document.getElementById('dashboardView');
    DOM.tableView = document.getElementById('tableView');
    DOM.refreshBtn = document.getElementById('refreshBtn');
    DOM.startDateInput = document.getElementById('startDate');
    DOM.endDateInput = document.getElementById('endDate');
    DOM.tableSearchInput = document.getElementById('tableSearch');
    DOM.campaignFilter = document.getElementById('campaignFilter');
    DOM.crmFilter = document.getElementById('crmFilter');
    DOM.paymentModeFilter = document.getElementById('paymentModeFilter');
    DOM.callingDateFilter = document.getElementById('callingDateFilter');
    DOM.crmCampaignFilter = document.getElementById('crmCampaignFilter');
    DOM.crmCallingDateFilter = document.getElementById('crmCallingDateFilter');
    // DOM.campaignCallingDateFilter removed for FTD table
    DOM.slider = document.getElementById('slider');
    DOM.liveDataStatus = document.getElementById('liveDataStatus');
    DOM.internetStatus = document.getElementById('internetStatus');
    DOM.totalAmount = document.getElementById('totalAmount');
    DOM.totalTransactions = document.getElementById('totalTransactions');
    DOM.uniqueCRM = document.getElementById('uniqueCRM');
    DOM.activeCampaigns = document.getElementById('activeCampaigns');
    DOM.crmSummaryTableBody = document.getElementById('crmSummaryTableBody');
    DOM.campaignSummaryTableBody = document.getElementById('campaignSummaryTableBody');
    DOM.dataTableBody = document.getElementById('dataTableBody');
    DOM.crmTotalCount = document.getElementById('crmTotalCount');
    DOM.campaignTotalCount = document.getElementById('campaignTotalCount');
    DOM.tableCount = document.getElementById('tableCount');
    DOM.zeroLeadsTableBody = document.getElementById('zeroLeadsTableBody');
    DOM.topMtdTableBody = document.getElementById('topMtdTableBody');
    DOM.topFtdTableBody = document.getElementById('topFtdTableBody');
    DOM.zeroLeadsTitle = document.getElementById('zeroLeadsTitle');
    DOM.crmSearchInput = document.getElementById('crmSearchInput');
    DOM.ftdSearchInput = document.getElementById('ftdSearchInput');
    DOM.attendanceBtn = document.getElementById('attendanceBtn');
    DOM.attendancePopup = document.getElementById('attendancePopup');
    DOM.closeAttendance = document.getElementById('closeAttendance');
    DOM.attendanceList = document.getElementById('attendanceList');
};