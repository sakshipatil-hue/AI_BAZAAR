// AI Bazaar Dashboard - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all dashboard components
    initDashboard();
    initNavigation();
    initNotifications();
    initProfile();
    initDate();
    initCounterAnimations();
});

// 1. Dashboard Initialization
function initDashboard() {
    // Set current date
    updateCurrentDate();
    
    // Initialize counter animations
    initCounters();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadDashboardData();
}

// 2. Navigation System
function initNavigation() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            this.classList.toggle('active');
        });
    }
    
    // Section navigation
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get target section
            const targetSection = this.getAttribute('data-section');
            
            // Hide all sections
            sections.forEach(section => {
                section.classList.remove('active');
                section.style.display = 'none';
            });
            
            // Show target section
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
                targetElement.style.display = 'block';
                
                // Initialize section-specific features
                initSection(targetSection);
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 1024) {
            sidebar.classList.add('collapsed');
        } else {
            sidebar.classList.remove('collapsed');
        }
    });
    
    // Initialize on mobile
    if (window.innerWidth <= 1024) {
        sidebar.classList.add('collapsed');
    }
}

// 3. Initialize Section-Specific Features
function initSection(sectionId) {
    switch(sectionId) {
        case 'dashboard':
            initCharts();
            break;
        case 'voice-entry':
            initVoiceEntry();
            break;
        case 'register-upload':
            initRegisterUpload();
            break;
        case 'inventory':
            initInventory();
            break;
        case 'billing':
            initBilling();
            break;
        case 'insights':
            initInsightsCharts();
            break;
        case 'profile':
            initProfileTabs();
            break;
    }
}

// 4. Notification System
function initNotifications() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const markAllReadBtn = document.querySelector('.mark-all-read');
    
    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            notificationDropdown.classList.remove('active');
        });
        
        // Prevent dropdown close when clicking inside
        notificationDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        // Mark all as read
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', function() {
                const unreadItems = document.querySelectorAll('.notification-item.unread');
                const notificationCount = document.querySelector('.notification-count');
                
                unreadItems.forEach(item => {
                    item.classList.remove('unread');
                });
                
                if (notificationCount) {
                    notificationCount.textContent = '0';
                }
            });
        }
    }
}

// 5. Profile Dropdown
function initProfile() {
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.querySelector('.logout-btn');
    
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            profileDropdown.classList.remove('active');
        });
        
        // Prevent dropdown close when clicking inside
        profileDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        // Logout functionality
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to logout?')) {
                    // In production: Implement logout logic
                    alert('Logging out... Redirecting to login page.');
                    // window.location.href = 'login.html';
                }
            });
        }
    }
}

// 6. Date and Time
function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('en-IN', options);
    }
}

function initDate() {
    updateCurrentDate();
    // Update date every minute
    setInterval(updateCurrentDate, 60000);
}

// 7. Counter Animations
function initCounterAnimations() {
    const counters = document.querySelectorAll('.value[data-target]');
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 1500;
    const increment = target / (duration / 16);
    let current = 0;
    
    const update = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current).toLocaleString('en-IN');
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString('en-IN');
        }
    };
    
    update();
}

function initCounters() {
    // Initial values for dashboard counters
    const counters = {
        todaySales: 5250,
        monthlyRevenue: 42850,
        lowStockCount: 7,
        pendingTasks: 3
    };
    
    // Set initial values
    Object.keys(counters).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.setAttribute('data-target', counters[key]);
        }
    });
}

// 8. Event Listeners Setup
function setupEventListeners() {
    // Language selector
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            const selectedLanguage = this.value;
            // In production: Implement language change
            console.log('Language changed to:', selectedLanguage);
        });
    }
    
    // Help button
    const helpBtn = document.querySelector('.help-btn');
    if (helpBtn) {
        helpBtn.addEventListener('click', function() {
            alert('Help documentation will open here. In production, this would open a help center.');
        });
    }
    
    // Quick action buttons in voice entry
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleQuickAction(action);
        });
    });
    
    // Chart period buttons
    const chartBtns = document.querySelectorAll('.chart-btn');
    chartBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            chartBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const period = this.getAttribute('data-period');
            updateChartData(period);
        });
    });
}

// 9. Quick Action Handler
function handleQuickAction(action) {
    const messages = {
        sold: "What items did you sell? Speak clearly.",
        purchased: "What stock did you receive?",
        customer: "New customer details?",
        expense: "What was the expense amount?"
    };
    
    if (messages[action]) {
        // Show message in voice conversation
        const conversation = document.getElementById('voiceConversation');
        if (conversation) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ai';
            messageDiv.innerHTML = `
                <div class="avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="bubble">
                    <p>${messages[action]}</p>
                </div>
            `;
            conversation.appendChild(messageDiv);
            conversation.scrollTop = conversation.scrollHeight;
        }
        
        // Auto-start voice recording
        const micBtn = document.getElementById('micButtonLarge');
        if (micBtn) {
            setTimeout(() => {
                micBtn.click();
            }, 500);
        }
    }
}

// 10. Load Dashboard Data
function loadDashboardData() {
    // Simulate API call for dashboard data
    setTimeout(() => {
        // Update counters
        const todaySales = document.getElementById('todaySales');
        const monthlyRevenue = document.getElementById('monthlyRevenue');
        
        if (todaySales) {
            todaySales.textContent = '5,250';
            todaySales.classList.add('counter-animate');
        }
        
        if (monthlyRevenue) {
            monthlyRevenue.textContent = '42,850';
            monthlyRevenue.classList.add('counter-animate');
        }
        
        // Initialize charts after data load
        initCharts();
    }, 1000);
}

// 11. Update Chart Data
function updateChartData(period) {
    // In production: Fetch new chart data based on period
    console.log('Updating chart data for period:', period);
    
    // For demo purposes, just reinitialize charts
    initCharts();
}

// 12. Initialize all charts
function initCharts() {
    // Sales chart
    initSalesChart();
    
    // Top items chart
    initTopItemsChart();
    
    // Trends chart
    initTrendChart();
    
    // Category chart
    initCategoryChart();
}

// 13. Initialize specific chart functions
function initSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (window.salesChartInstance) {
        window.salesChartInstance.destroy();
    }
    
    const data = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Sales (₹)',
            data: [2500, 3200, 2800, 4000, 5200, 6800, 4500],
            borderColor: '#FF6B35',
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    };
    
    window.salesChartInstance = new Chart(ctx, {
        type: 'line',
        data: data,
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
                            return `Sales: ₹${context.parsed.y.toLocaleString('en-IN')}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        }
                    }
                }
            }
        }
    });
}

function initTopItemsChart() {
    const ctx = document.getElementById('topItemsChart');
    if (!ctx) return;
    
    if (window.topItemsChartInstance) {
        window.topItemsChartInstance.destroy();
    }
    
    const data = {
        labels: ['Atta', 'Sugar', 'Tea', 'Oil', 'Rice'],
        datasets: [{
            data: [52, 38, 25, 18, 15],
            backgroundColor: [
                '#FF6B35',
                '#2E86AB',
                '#4CAF50',
                '#FFD166',
                '#9C27B0'
            ],
            borderWidth: 0
        }]
    };
    
    window.topItemsChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function initTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    if (window.trendChartInstance) {
        window.trendChartInstance.destroy();
    }
    
    const data = {
        labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
        datasets: [{
            label: 'Sales Trend',
            data: [32000, 35000, 38000, 36500, 40000, 42850],
            borderColor: '#FF6B35',
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
        }]
    };
    
    window.trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: data,
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
                            return `Sales: ₹${context.parsed.y.toLocaleString('en-IN')}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return '₹' + (value/1000) + 'k';
                        }
                    }
                }
            }
        }
    });
}

function initCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    if (window.categoryChartInstance) {
        window.categoryChartInstance.destroy();
    }
    
    const data = {
        labels: ['Grocery', 'Dairy', 'Beverages', 'Snacks', 'Others'],
        datasets: [{
            label: 'Revenue by Category',
            data: [45, 20, 15, 12, 8],
            backgroundColor: [
                '#FF6B35',
                '#2E86AB',
                '#4CAF50',
                '#FFD166',
                '#9C27B0'
            ],
            borderWidth: 0
        }]
    };
    
    window.categoryChartInstance = new Chart(ctx, {
        type: 'bar',
        data: data,
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
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// 14. Initialize insights charts
function initInsightsCharts() {
    initTrendChart();
    initCategoryChart();
}

// 15. Export to global scope for other scripts
window.initDashboardSection = initSection;
window.handleQuickAction = handleQuickAction;

// 16. Error handling
window.addEventListener('error', function(e) {
    console.error('Dashboard error:', e.error);
    
    // Show user-friendly error message
    if (document.getElementById('errorToast')) {
        const errorToast = document.getElementById('errorToast');
        errorToast.textContent = 'Something went wrong. Please try again.';
        errorToast.style.display = 'block';
        
        setTimeout(() => {
            errorToast.style.display = 'none';
        }, 5000);
    }
});

// 17. Performance monitoring
if ('performance' in window) {
    const perfObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.duration > 1000) {
                console.warn('Slow operation detected:', entry);
            }
        }
    });
    
    perfObserver.observe({ entryTypes: ['longtask'] });
}