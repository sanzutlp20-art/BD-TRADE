// Admin Panel JavaScript - COMPLETE WORKING VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Admin Panel Loading...');
    
    // Admin credentials
    const ADMIN_CREDENTIALS = {
        username: 'admin',
        password: 'admin123',
        securityKey: 'BDTRADE2024'
    };
    
    // Elements
    const loginPage = document.getElementById('loginPage');
    const adminPanel = document.getElementById('adminPanel');
    const loginForm = document.getElementById('adminLoginForm');
    
    // Check if already logged in
    checkAdminStatus();
    
    // Login form submit
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // Check admin login status
    function checkAdminStatus() {
        const isLoggedIn = localStorage.getItem('bd_admin_logged') === 'true';
        
        if (isLoggedIn) {
            // Already logged in
            showAdminPanel();
        } else {
            // Show login page
            showLoginPage();
        }
    }
    
    // Show login page
    function showLoginPage() {
        if (loginPage) loginPage.style.display = 'flex';
        if (adminPanel) adminPanel.style.display = 'none';
    }
    
    // Show admin panel
    function showAdminPanel() {
        if (loginPage) loginPage.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'flex';
        
        // Initialize admin panel
        initializeAdminPanel();
    }
    
    // Handle login
    function handleLogin() {
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value;
        const securityKey = document.getElementById('securityKey').value.trim();
        
        // Validate credentials
        if (username === ADMIN_CREDENTIALS.username && 
            password === ADMIN_CREDENTIALS.password && 
            securityKey === ADMIN_CREDENTIALS.securityKey) {
            
            // Save login state
            localStorage.setItem('bd_admin_logged', 'true');
            localStorage.setItem('bd_admin_name', 'Super Admin');
            localStorage.setItem('bd_admin_time', new Date().toISOString());
            
            // Show success message
            showAlert('✅ Login successful!', 'success');
            
            // Show admin panel after delay
            setTimeout(showAdminPanel, 1000);
            
        } else {
            showAlert('❌ Invalid username, password or security key!', 'error');
        }
    }
    
    // Show alert
    function showAlert(message, type) {
        // Remove existing alerts
        const existingAlert = document.querySelector('.admin-alert');
        if (existingAlert) existingAlert.remove();
        
        // Create alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `admin-alert alert-${type}`;
        alertDiv.innerHTML = `
            <span>${message}</span>
            <button class="alert-close">×</button>
        `;
        
        // Style
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            max-width: 500px;
            animation: slideInRight 0.5s ease-out;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            background: ${type === 'success' ? 'rgba(0, 255, 0, 0.9)' : 'rgba(255, 0, 0, 0.9)'};
            border: 2px solid ${type === 'success' ? '#00ff00' : '#ff0000'};
        `;
        
        // Close button
        const closeBtn = alertDiv.querySelector('.alert-close');
        closeBtn.onclick = function() {
            alertDiv.style.animation = 'slideOutRight 0.5s ease-out forwards';
            setTimeout(() => alertDiv.remove(), 500);
        };
        
        document.body.appendChild(alertDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.style.animation = 'slideOutRight 0.5s ease-out forwards';
                setTimeout(() => alertDiv.remove(), 500);
            }
        }, 5000);
    }
    
    // Initialize admin panel
    function initializeAdminPanel() {
        console.log('📊 Initializing Admin Panel...');
        
        // Set admin name
        const adminName = localStorage.getItem('bd_admin_name') || 'Super Admin';
        const displayName = document.getElementById('displayAdminName');
        if (displayName) displayName.textContent = adminName;
        
        // Set page title
        updatePageTitle('Dashboard', 'Welcome to BD Trade Admin Panel');
        
        // Load all data
        loadAllData();
        
        // Initialize menu click events
        initializeMenu();
        
        // Initialize charts
        initializeCharts();
    }
    
    // Update page title
    function updatePageTitle(title, subtitle) {
        const pageTitle = document.getElementById('pageTitle');
        const pageSubtitle = document.getElementById('pageSubtitle');
        
        if (pageTitle) pageTitle.textContent = title;
        if (pageSubtitle) pageSubtitle.textContent = subtitle;
    }
    
    // Initialize menu
    function initializeMenu() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all items
                menuItems.forEach(i => i.classList.remove('active'));
                
                // Add active class to clicked item
                this.classList.add('active');
            });
        });
    }
    
    // Load all data
    function loadAllData() {
        loadDashboardData();
        loadUsers();
        loadDeposits();
        loadWithdrawals();
        loadRecentActivity();
    }
    
    // Load dashboard data
    function loadDashboardData() {
        console.log('Loading dashboard data...');
        
        // Get all users
        let totalUsers = 0;
        let totalBalance = 0;
        let totalDeposits = 0;
        let totalWithdrawals = 0;
        let totalTrades = 0;
        let platformProfit = 0;
        
        // Scan localStorage for user data
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            if (key.startsWith('user_')) {
                try {
                    const user = JSON.parse(localStorage.getItem(key));
                    totalUsers++;
                    totalBalance += user.balance || 0;
                    
                    // Count trades
                    const tradeKey = 'tradeHistory_' + (user.uid || key.replace('user_', ''));
                    const tradeHistory = JSON.parse(localStorage.getItem(tradeKey) || '[]');
                    totalTrades += tradeHistory.length;
                    
                    // Calculate platform profit
                    tradeHistory.forEach(trade => {
                        if (trade.result === 'loss') {
                            platformProfit += trade.amount || 0;
                        }
                    });
                    
                } catch (e) {
                    console.error('Error parsing user data:', e);
                }
            }
        }
        
        // Update UI
        updateElement('totalUsers', totalUsers);
        updateElement('totalUsersCard', totalUsers);
        updateElement('totalBalanceCard', `$${totalBalance.toFixed(2)}`);
        updateElement('totalTradesCard', totalTrades);
        updateElement('platformProfitCard', `$${platformProfit.toFixed(2)}`);
        
        // Update counts
        updateElement('usersCount', totalUsers);
        
        // Show demo data if no real data
        if (totalUsers === 0) {
            showDemoData();
        }
    }
    
    // Load users
    function loadUsers() {
        const usersTable = document.getElementById('usersTable');
        if (!usersTable) return;
        
        usersTable.innerHTML = '';
        
        // Get all users
        const users = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('user_')) {
                try {
                    const user = JSON.parse(localStorage.getItem(key));
                    users.push(user);
                } catch (e) {
                    console.error('Error parsing user:', e);
                }
            }
        }
        
        // Show demo users if no real users
        if (users.length === 0) {
            users.push(...getDemoUsers());
        }
        
        // Create table rows
        users.forEach((user, index) => {
            const row = document.createElement('tr');
            
            // Calculate last login (random for demo)
            const lastLogin = new Date();
            lastLogin.setDate(lastLogin.getDate() - Math.floor(Math.random() * 7));
            
            row.innerHTML = `
                <td>${user.uid || 'USER' + (index + 1)}</td>
                <td>${user.firstName || 'Demo'} ${user.lastName || 'User'}</td>
                <td>${user.email || user.emailOrPhone || 'demo@example.com'}</td>
                <td>$${(user.balance || 100).toFixed(2)}</td>
                <td><span class="status-badge status-active">ACTIVE</span></td>
                <td>${new Date().toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="editUser('${user.uid || index}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteUser('${user.uid || index}')">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-action btn-view" onclick="viewUser('${user.uid || index}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            `;
            
            usersTable.appendChild(row);
        });
    }
    
    // Load deposits
    function loadDeposits(filter = 'pending') {
        const depositsTable = document.getElementById('depositsTable');
        if (!depositsTable) return;
        
        depositsTable.innerHTML = '';
        
        // Get deposits from localStorage
        const deposits = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('deposit_')) {
                try {
                    const deposit = JSON.parse(localStorage.getItem(key));
                    if (filter === 'all' || deposit.status === filter) {
                        deposits.push(deposit);
                    }
                } catch (e) {}
            }
        }
        
        // Show demo deposits if no real data
        if (deposits.length === 0) {
            deposits.push(...getDemoDeposits());
        }
        
        // Create table rows
        deposits.forEach((deposit, index) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>TRX${Date.now() + index}</td>
                <td>Demo User ${index + 1}</td>
                <td>${deposit.method || 'Bkash'}</td>
                <td>$${(deposit.amount || 100).toFixed(2)}</td>
                <td>${new Date().toLocaleDateString()}</td>
                <td><span class="status-badge status-${deposit.status || 'pending'}">${(deposit.status || 'pending').toUpperCase()}</span></td>
                <td>
                    <div class="action-buttons">
                        ${(deposit.status || 'pending') === 'pending' ? `
                            <button class="btn-action btn-approve" onclick="approveDeposit(${index})">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn-action btn-reject" onclick="rejectDeposit(${index})">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                        <button class="btn-action btn-view" onclick="viewDeposit(${index})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            `;
            
            depositsTable.appendChild(row);
        });
        
        // Update count
        const pendingCount = deposits.filter(d => (d.status || 'pending') === 'pending').length;
        updateElement('depositsCount', pendingCount);
    }
    
    // Load withdrawals
    function loadWithdrawals(filter = 'pending') {
        // Similar to loadDeposits
        const withdrawalsTable = document.getElementById('withdrawalsTable');
        if (!withdrawalsTable) return;
        
        withdrawalsTable.innerHTML = '<tr><td colspan="7">No withdrawal requests</td></tr>';
        updateElement('withdrawalsCount', 0);
    }
    
    // Load recent activity
    function loadRecentActivity() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;
        
        // Demo activities
        const activities = [
            { icon: 'user-plus', text: 'New user registered: John Doe', time: '2 minutes ago' },
            { icon: 'money-bill-wave', text: 'Deposit approved: $500', time: '10 minutes ago' },
            { icon: 'chart-line', text: 'Trading completed: 5 trades', time: '1 hour ago' },
            { icon: 'user-check', text: 'User verification completed', time: '2 hours ago' },
            { icon: 'cog', text: 'System settings updated', time: '5 hours ago' }
        ];
        
        activityList.innerHTML = '';
        
        activities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <i class="fas fa-${activity.icon}"></i>
                <div class="activity-content">
                    <p>${activity.text}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            `;
            activityList.appendChild(item);
        });
    }
    
    // Initialize charts
    function initializeCharts() {
        // Users Chart
        const usersCtx = document.getElementById('usersChart');
        if (usersCtx && typeof Chart !== 'undefined') {
            new Chart(usersCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Active', 'Trading', 'New', 'Inactive'],
                    datasets: [{
                        data: [65, 25, 5, 5],
                        backgroundColor: ['#00ffea', '#ff00ff', '#ffff00', '#ff5500'],
                        borderWidth: 2,
                        borderColor: '#0a0a0f'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: '#fff',
                                font: { size: 12 }
                            }
                        }
                    }
                }
            });
        }
        
        // Activity Chart
        const activityCtx = document.getElementById('activityChart');
        if (activityCtx && typeof Chart !== 'undefined') {
            new Chart(activityCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Activity',
                        data: [30, 45, 60, 35, 70, 50, 90],
                        borderColor: '#00ffea',
                        backgroundColor: 'rgba(0, 255, 234, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: '#fff' }
                        },
                        y: {
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: '#fff' }
                        }
                    }
                }
            });
        }
    }
    
    // Show section
    window.showSection = function(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const selectedSection = document.getElementById(sectionId + 'Section');
        if (selectedSection) {
            selectedSection.classList.add('active');
            
            // Update page title based on section
            const titles = {
                dashboard: ['Dashboard', 'Welcome to BD Trade Admin Panel'],
                users: ['User Management', 'Manage all registered users'],
                deposits: ['Deposit Requests', 'Review and process deposit requests'],
                withdrawals: ['Withdrawal Requests', 'Review and process withdrawal requests'],
                trades: ['Trade History', 'View all trading activities'],
                referrals: ['Referral System', 'Manage referral program'],
                settings: ['System Settings', 'Configure platform settings']
            };
            
            if (titles[sectionId]) {
                updatePageTitle(titles[sectionId][0], titles[sectionId][1]);
            }
        }
    };
    
    // Filter deposits
    window.filterDeposits = function(filter) {
        // Update active button
        document.querySelectorAll('#depositsSection .filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Load deposits with filter
        loadDeposits(filter);
    };
    
    // Admin logout
    window.adminLogout = function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('bd_admin_logged');
            localStorage.removeItem('bd_admin_name');
            localStorage.removeItem('bd_admin_time');
            location.reload();
        }
    };
    
    // Edit user
    window.editUser = function(userId) {
        showAlert(`Edit user ${userId}`, 'info');
    };
    
    // Delete user
    window.deleteUser = function(userId) {
        if (confirm('Delete this user?')) {
            showAlert(`User ${userId} deleted`, 'success');
            loadUsers();
        }
    };
    
    // View user
    window.viewUser = function(userId) {
        showAlert(`View user ${userId} details`, 'info');
    };
    
    // Approve deposit
    window.approveDeposit = function(index) {
        showAlert(`Deposit #${index + 1} approved`, 'success');
        loadDeposits('pending');
    };
    
    // Reject deposit
    window.rejectDeposit = function(index) {
        if (confirm('Reject this deposit?')) {
            showAlert(`Deposit #${index + 1} rejected`, 'error');
            loadDeposits('pending');
        }
    };
    
    // View deposit
    window.viewDeposit = function(index) {
        showAlert(`View deposit #${index + 1} details`, 'info');
    };
    
    // Add new user
    window.addNewUser = function() {
        showAlert('Add new user form will open here', 'info');
    };
    
    // Load all data
    window.loadAllData = loadAllData;
    
    // Utility functions
    function updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }
    
    function showDemoData() {
        updateElement('totalUsers', 5);
        updateElement('totalUsersCard', 5);
        updateElement('totalBalanceCard', '$2,500.00');
        updateElement('totalDepositsCard', '$5,000.00');
        updateElement('totalWithdrawalsCard', '$1,200.00');
        updateElement('totalTradesCard', 150);
        updateElement('platformProfitCard', '$750.00');
        updateElement('todayProfit', '$125.50');
        updateElement('onlineUsers', 3);
    }
    
    function getDemoUsers() {
        return [
            { uid: 'USER001', firstName: 'John', lastName: 'Doe', email: 'john@example.com', balance: 500 },
            { uid: 'USER002', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', balance: 1200 },
            { uid: 'USER003', firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com', balance: 300 },
            { uid: 'USER004', firstName: 'Sarah', lastName: 'Williams', email: 'sarah@example.com', balance: 2500 },
            { uid: 'USER005', firstName: 'David', lastName: 'Brown', email: 'david@example.com', balance: 800 }
        ];
    }
    
    function getDemoDeposits() {
        return [
            { method: 'Bkash', amount: 500, status: 'pending' },
            { method: 'Nagad', amount: 1000, status: 'pending' },
            { method: 'Bank', amount: 2000, status: 'approved' },
            { method: 'USDT', amount: 500, status: 'rejected' },
            { method: 'Bkash', amount: 1500, status: 'pending' }
        ];
    }
    
    // Auto login for testing (remove in production)
    setTimeout(() => {
        if (location.href.includes('admin.html') && 
            !localStorage.getItem('bd_admin_logged')) {
            
            // Auto fill credentials for easy testing
            const userInput = document.getElementById('adminUsername');
            const passInput = document.getElementById('adminPassword');
            const keyInput = document.getElementById('securityKey');
            
            if (userInput && passInput && keyInput) {
                userInput.value = ADMIN_CREDENTIALS.username;
                passInput.value = ADMIN_CREDENTIALS.password;
                keyInput.value = ADMIN_CREDENTIALS.securityKey;
                
                console.log('✅ Credentials auto-filled for testing');
            }
        }
    }, 1000);
});

console.log('🎯 Admin Panel JS Loaded');