// Charts Module for AI Bazaar Dashboard

class DashboardCharts {
    constructor() {
        this.chartInstances = {};
        this.chartColors = {
            primary: '#FF6B35',
            secondary: '#2E86AB',
            success: '#4CAF50',
            warning: '#FFB74D',
            danger: '#F44336',
            accent: '#FFD166'
        };
    }
    
    // Initialize all charts
    initAllCharts() {
        this.initSalesChart();
        this.initTopItemsChart();
        this.initTrendChart();
        this.initCategoryChart();
        this.initInventoryChart();
        this.initPerformanceChart();
    }
    
    // Sales Chart (Line Chart)
    initSalesChart() {
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;
        
        const data = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Daily Sales',
                data: [5250, 6200, 4850, 7300, 8900, 11200, 6850],
                borderColor: this.chartColors.primary,
                backgroundColor: this.hexToRgbA(this.chartColors.primary, 0.1),
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: this.chartColors.primary,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        };
        
        this.chartInstances.sales = new Chart(ctx, {
            type: 'line',
            data: data,
            options: this.getLineChartOptions('Sales (₹)')
        });
    }
    
    // Top Items Chart (Horizontal Bar)
    initTopItemsChart() {
        const ctx = document.getElementById('topItemsChart');
        if (!ctx) return;
        
        const data = {
            labels: ['Atta', 'Sugar', 'Tea Powder', 'Cooking Oil', 'Rice', 'Biscuits', 'Soap'],
            datasets: [{
                label: 'Units Sold',
                data: [52, 38, 25, 18, 15, 22, 30],
                backgroundColor: [
                    this.chartColors.primary,
                    this.chartColors.secondary,
                    this.chartColors.success,
                    this.chartColors.warning,
                    this.chartColors.accent,
                    '#9C27B0',
                    '#2196F3'
                ],
                borderWidth: 0,
                borderRadius: 6
            }]
        };
        
        this.chartInstances.topItems = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.parsed.x} units`
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Trend Chart (Area Chart)
    initTrendChart() {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;
        
        const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
        const salesData = [32000, 35000, 38000, 36500, 40000, 42850];
        
        const data = {
            labels: months,
            datasets: [{
                label: 'Monthly Sales',
                data: salesData,
                borderColor: this.chartColors.primary,
                backgroundColor: this.createGradient(ctx, this.chartColors.primary),
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        };
        
        this.chartInstances.trend = new Chart(ctx, {
            type: 'line',
            data: data,
            options: this.getLineChartOptions('Sales (₹)', true)
        });
    }
    
    // Category Distribution (Pie Chart)
    initCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;
        
        const data = {
            labels: ['Grocery', 'Dairy', 'Beverages', 'Snacks', 'Personal Care', 'Others'],
            datasets: [{
                data: [45, 20, 15, 12, 5, 3],
                backgroundColor: [
                    this.chartColors.primary,
                    this.chartColors.secondary,
                    this.chartColors.success,
                    this.chartColors.warning,
                    this.chartColors.accent,
                    '#9C27B0'
                ],
                borderWidth: 0,
                hoverOffset: 15
            }]
        };
        
        this.chartInstances.category = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'right',
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
                            label: (context) => {
                                const label = context.label;
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value}% (${percentage}% of total)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Inventory Status Chart
    initInventoryChart() {
        const ctx = document.getElementById('inventoryChart');
        if (!ctx) return;
        
        const data = {
            labels: ['In Stock', 'Low Stock', 'Out of Stock'],
            datasets: [{
                data: [36, 7, 2],
                backgroundColor: [
                    this.chartColors.success,
                    this.chartColors.warning,
                    this.chartColors.danger
                ],
                borderWidth: 0
            }]
        };
        
        this.chartInstances.inventory = new Chart(ctx, {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Performance Chart (Mixed)
    initPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;
        
        const data = {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
                {
                    label: 'Sales',
                    data: [25000, 28000, 32000, 35000],
                    borderColor: this.chartColors.primary,
                    backgroundColor: this.hexToRgbA(this.chartColors.primary, 0.1),
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Customers',
                    data: [120, 135, 155, 168],
                    borderColor: this.chartColors.secondary,
                    backgroundColor: this.hexToRgbA(this.chartColors.secondary, 0.1),
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        };
        
        this.chartInstances.performance = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                let label = context.dataset.label || '';
                                if (label === 'Sales') {
                                    return `Sales: ₹${context.parsed.y.toLocaleString('en-IN')}`;
                                } else {
                                    return `Customers: ${context.parsed.y}`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Sales (₹)'
                        },
                        ticks: {
                            callback: (value) => '₹' + (value/1000) + 'k'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Customers'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }
    
    // Update chart data dynamically
    updateChart(chartName, newData) {
        if (this.chartInstances[chartName]) {
            this.chartInstances[chartName].data = newData;
            this.chartInstances[chartName].update();
        }
    }
    
    // Update sales chart period
    updateSalesChartPeriod(period) {
        let labels, data;
        
        switch(period) {
            case 'week':
                labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                data = [5250, 6200, 4850, 7300, 8900, 11200, 6850];
                break;
            case 'month':
                labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                data = [28500, 32000, 36500, 42850];
                break;
            case 'year':
                labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                data = [42000, 38000, 45000, 41000, 48000, 52000, 49000, 52000, 55000, 58000, 62000, 65000];
                break;
        }
        
        if (this.chartInstances.sales) {
            this.chartInstances.sales.data.labels = labels;
            this.chartInstances.sales.data.datasets[0].data = data;
            this.chartInstances.sales.update();
        }
    }
    
    // Update trend chart period
    updateTrendChartPeriod(period) {
        let labels, data;
        
        switch(period) {
            case '3m':
                labels = ['Nov', 'Dec', 'Jan'];
                data = [36500, 40000, 42850];
                break;
            case '6m':
                labels = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
                data = [32000, 35000, 38000, 36500, 40000, 42850];
                break;
            case '1y':
                labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                data = [42000, 38000, 45000, 41000, 48000, 52000, 49000, 52000, 55000, 58000, 62000, 65000];
                break;
        }
        
        if (this.chartInstances.trend) {
            this.chartInstances.trend.data.labels = labels;
            this.chartInstances.trend.data.datasets[0].data = data;
            this.chartInstances.trend.update();
        }
    }
    
    // Helper: Create gradient background
    createGradient(ctx, color) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, this.hexToRgbA(color, 0.3));
        gradient.addColorStop(1, this.hexToRgbA(color, 0.1));
        return gradient;
    }
    
    // Helper: Convert hex to rgba
    hexToRgbA(hex, alpha) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    // Helper: Get line chart options
    getLineChartOptions(yAxisLabel, showThousands = false) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: (context) => {
                            let label = context.dataset.label || '';
                            let value = context.parsed.y;
                            
                            if (showThousands) {
                                value = '₹' + (value/1000).toLocaleString('en-IN', {minimumFractionDigits: 1}) + 'k';
                            } else {
                                value = '₹' + value.toLocaleString('en-IN');
                            }
                            
                            return `${label}: ${value}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        borderDash: [5, 5]
                    },
                    ticks: {
                        callback: (value) => {
                            if (showThousands) {
                                return '₹' + (value/1000) + 'k';
                            }
                            return '₹' + value.toLocaleString('en-IN');
                        }
                    },
                    title: {
                        display: true,
                        text: yAxisLabel
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
            },
            elements: {
                point: {
                    radius: 4,
                    hoverRadius: 6
                }
            }
        };
    }
    
    // Destroy all charts
    destroyAllCharts() {
        Object.values(this.chartInstances).forEach(chart => {
            chart.destroy();
        });
        this.chartInstances = {};
    }
    
    // Resize all charts
    resizeAllCharts() {
        Object.values(this.chartInstances).forEach(chart => {
            chart.resize();
        });
    }
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.dashboardCharts = new DashboardCharts();
    
    // Initialize charts for current section
    const currentSection = document.querySelector('.dashboard-section.active');
    if (currentSection) {
        const sectionId = currentSection.id;
        if (sectionId === 'dashboard' || sectionId === 'insights') {
            dashboardCharts.initAllCharts();
        }
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.dashboardCharts) {
            window.dashboardCharts.resizeAllCharts();
        }
    });
    
    // Handle chart period changes
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            const chartType = this.closest('.chart-header').parentElement.id;
            
            if (chartType === 'salesChart' && window.dashboardCharts) {
                window.dashboardCharts.updateSalesChartPeriod(period);
            }
        });
    });
    
    // Handle trend period changes
    const trendPeriodSelect = document.getElementById('trendPeriod');
    if (trendPeriodSelect && window.dashboardCharts) {
        trendPeriodSelect.addEventListener('change', function() {
            const period = this.value;
            window.dashboardCharts.updateTrendChartPeriod(period);
        });
    }
});

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardCharts;
}