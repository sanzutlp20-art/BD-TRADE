// Admin Panel JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Admin login
    document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value;
        const securityKey = document.getElementById('securityKey').value.trim();
        
        // Default admin credentials (for demo only)
        // In real application, use secure authentication
        const validCredentials = {
            username: 'admin',
            password: 'admin123',
            securityKey: 'BDTRADE2024'
        };
        
        if (username === validCredentials.username && 
            password === validCredentials.password && 
            securityKey === validCredentials.securityKey) {
            
            // Success - show admin panel
            document.getElementById('adminLogin').style.display = 'none';
            document.getElementById('adminContainer').style.display = 'flex';
            
            // Initialize admin panel
            initializeAdminPanel();
            
            // Save admin session
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminName', 'Super Admin');
            
        } else {
            alert('Invalid admin credentials!');
        }
    });
    
    // Check if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminContainer').style.display = 'flex';
        initializeAdminPanel();
    }
});

function initializeAdminPanel() {
    // Set admin name
    const adminName = localStorage.getItem('adminName') || 'Super Admin';
    document.getElementById('adminName').textContent = adminName;
    document.getElementById('adminName').textContent = adminName;
    
    // Load data
    loadDashboardData();
    loadUsers();
    loadDeposits();
    loadWithdrawals();
    loadReferralData();
    
    // Initialize chart
    initializePlatformChart();
    
    // Initialize activity feed
    updateActivityFeed();
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all menu items
    document.querySelectorAll('.admin-menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId + 'Section').classList.add('active');
    
    // Update active menu item
    document.querySelector(`[onclick="showSection('${sectionId}')"]`).classList.add('active');
    
    // Update section title
    const titles = {
        'dashboard': 'ADMIN DASHBOARD',
        'users': 'USER MANAGEMENT',
        'deposits': 'DEPOSIT REQUESTS',
        'withdrawals': 'WITHDRAWAL REQUESTS',
        'referrals': 'REFERRAL SYSTEM',
        'trades': 'TRADE HISTORY',
        'settings': 'SYSTEM SETTINGS',
        'reports': 'REPORTS'
    };
    
    const subtitles = {
        'dashboard': 'Welcome to BD TRADE Administration Panel',
        'users': 'Manage all registered users',
        'deposits': 'Review and process deposit requests',
        'withdrawals': 'Review and process withdrawal requests',
        'referrals': 'Manage referral system and commissions',
        'trades': 'View all trading history',
        'settings': 'Configure system settings',
        'reports': 'Generate system reports'
    };
    
    document.getElementById('adminSectionTitle').textContent = titles[sectionId];
    document.getElementById('adminSectionSubtitle').textContent = subtitles[sectionId];
}

function loadDashboardData() {
    // Get all users from localStorage
    let totalUsers = 0;
    let totalBalance = 0;
    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let totalTrades = 0;
    let platformProfit = 0;
    let onlineUsers = 0;
    
    // Calculate totals
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key.startsWith('user_')) {
            const user = JSON.parse(localStorage.getItem(key));
            totalUsers++;
            totalBalance += user.balance || 0;
            
            // Get user's trade history
            const tradeHistoryKey = 'tradeHistory_' + user.uid;
            const tradeHistory = JSON.parse(localStorage.getItem(tradeHistoryKey) || '[]');
            totalTrades += tradeHistory.length;
            
            // Calculate platform profit (simplified)
            tradeHistory.forEach(trade => {
                if (trade.result === 'loss') {
                    platformProfit += trade.amount || 0;
                }
            });
            
            // Check if user is online (demo - random)
            if (Math.random() > 0.3) onlineUsers++;
        }
        
        if (key.startsWith('deposit_')) {
            const deposit = JSON.parse(localStorage.getItem(key));
            if (deposit.status === 'approved') {
                totalDeposits += deposit.amount || 0;
            }
        }
        
        if (key.startsWith('withdrawal_')) {
            const withdrawal = JSON.parse(localStorage.getItem(key));
            if (withdrawal.status === 'approved') {
                totalWithdrawals += withdrawal.amount || 0;
            }
        }
    }
    
    // Update UI
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalBalance').textContent = totalBalance.toFixed(0);
    document.getElementById('totalDeposits').textContent = totalDeposits.toFixed(0);
    document.getElementById('totalWithdrawals').textContent = totalWithdrawals.toFixed(0);
    document.getElementById('totalTradesAdmin').textContent = totalTrades;
    document.getElementById('platformProfit').textContent = platformProfit.toFixed(0);
    document.getElementById('totalUsersStat').textContent = totalUsers;
    document.getElementById('onlineUsersStat').textContent = onlineUsers;
    document.getElementById('usersCount').textContent = totalUsers;
    
    // Update pending counts
    updatePendingCounts();
}

function updatePendingCounts() {
    let pendingDeposits = 0;
    let pendingWithdrawals = 0;
    
    // Count pending deposits
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key.startsWith('deposit_')) {
            const deposit = JSON.parse(localStorage.getItem(key));
            if (deposit.status === 'pending') {
                pendingDeposits++;
            }
        }
        
        if (key.startsWith('withdrawal_')) {
            const withdrawal = JSON.parse(localStorage.getItem(key));
            if (withdrawal.status === 'pending') {
                pendingWithdrawals++;
            }
        }
    }
    
    document.getElementById('pendingDeposits').textContent = pendingDeposits;
    document.getElementById('pendingWithdrawals').textContent = pendingWithdrawals;
}

function loadUsers(page = 1) {
    const usersTable = document.getElementById('usersTable');
    usersTable.innerHTML = '';
    
    const users = [];
    
    // Get all users
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('user_')) {
            const user = JSON.parse(localStorage.getItem(key));
            users.push(user);
        }
    }
    
    // Sort by registration date (newest first)
    users.sort((a, b) => new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0));
    
    // Pagination
    const perPage = 10;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedUsers = users.slice(start, end);
    
    // Create table rows
    paginatedUsers.forEach(user => {
        const row = document.createElement('tr');
        
        // Calculate last active (demo - random time)
        const lastActive = new Date();
        lastActive.setMinutes(lastActive.getMinutes() - Math.floor(Math.random() * 1440));
        
        row.innerHTML = `
            <td>${user.uid}</td>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.emailOrPhone || 'N/A'}</td>
            <td>$${user.balance?.toFixed(2) || '0.00'}</td>
            <td>
                <span class="status-badge ${user.status || 'status-active'}">
                    ${(user.status || 'active').toUpperCase()}
                </span>
            </td>
            <td>${new Date(user.registeredAt || Date.now()).toLocaleDateString()}</td>
            <td>${lastActive.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action-small btn-edit" onclick="editUser('${user.uid}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action-small btn-delete" onclick="deleteUser('${user.uid}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-action-small btn-view" onclick="viewUser('${user.uid}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        
        usersTable.appendChild(row);
    });
    
    // Create pagination
    createPagination('usersPagination', users.length, perPage, page, loadUsers);
}

function loadDeposits(filter = 'pending') {
    const depositsTable = document.getElementById('depositsTable');
    depositsTable.innerHTML = '';
    
    const deposits = [];
    
    // Get all deposits
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('deposit_')) {
            const deposit = JSON.parse(localStorage.getItem(key));
            if (filter === 'all' || deposit.status === filter) {
                deposits.push(deposit);
            }
        }
    }
    
    // Sort by date (newest first)
    deposits.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Create table rows
    deposits.forEach(deposit => {
        // Get user info
        const userKey = 'user_' + deposit.userId;
        const user = JSON.parse(localStorage.getItem(userKey) || '{}');
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${deposit.id || deposit.transactionId}</td>
            <td>${user.firstName || 'Unknown'} ${user.lastName || ''}</td>
            <td>${deposit.method?.toUpperCase() || 'N/A'}</td>
            <td>$${deposit.amount?.toFixed(2) || '0.00'}</td>
            <td>${new Date(deposit.timestamp).toLocaleString()}</td>
            <td>
                <span class="status-badge status-${deposit.status}">
                    ${deposit.status?.toUpperCase() || 'PENDING'}
                </span>
            </td>
            <td>
                <button class="btn-action-small btn-view" onclick="viewDepositProof('${deposit.id}')">
                    <i class="fas fa-receipt"></i>
                </button>
            </td>
            <td>
                <div class="action-buttons">
                    ${deposit.status === 'pending' ? `
                        <button class="btn-action-small btn-approve" onclick="approveDeposit('${deposit.id}')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-action-small btn-reject" onclick="rejectDeposit('${deposit.id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                    <button class="btn-action-small btn-view" onclick="viewDeposit('${deposit.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        
        depositsTable.appendChild(row);
    });
}

function loadWithdrawals(filter = 'pending') {
    const withdrawalsTable = document.getElementById('withdrawalsTable');
    withdrawalsTable.innerHTML = '';
    
    const withdrawals = [];
    
    // Get all withdrawals
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('withdrawal_')) {
            const withdrawal = JSON.parse(localStorage.getItem(key));
            if (filter === 'all' || withdrawal.status === filter) {
                withdrawals.push(withdrawal);
            }
        }
    }
    
    // Sort by date (newest first)
    withdrawals.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Create table rows
    withdrawals.forEach(withdrawal => {
        // Get user info
        const userKey = 'user_' + withdrawal.userId;
        const user = JSON.parse(localStorage.getItem(userKey) || '{}');
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${withdrawal.id}</td>
            <td>${user.firstName || 'Unknown'} ${user.lastName || ''}</td>
            <td>${withdrawal.method?.toUpperCase() || 'N/A'}</td>
            <td>${withdrawal.account || 'N/A'}</td>
            <td>$${withdrawal.amount?.toFixed(2) || '0.00'}</td>
            <td>${new Date(withdrawal.timestamp).toLocaleString()}</td>
            <td>
                <span class="status-badge status-${withdrawal.status}">
                    ${withdrawal.status?.toUpperCase() || 'PENDING'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    ${withdrawal.status === 'pending' ? `
                        <button class="btn-action-small btn-approve" onclick="approveWithdrawal('${withdrawal.id}')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-action-small btn-reject" onclick="rejectWithdrawal('${withdrawal.id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                    <button class="btn-action-small btn-view" onclick="viewWithdrawal('${withdrawal.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        
        withdrawalsTable.appendChild(row);
    });
}

function loadReferralData() {
    // Calculate referral statistics
    let totalReferrals = 0;
    let totalCommission = 0;
    let activeReferrers = 0;
    const referrerStats = {};
    
    // Get all users and their referrals
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('user_')) {
            const user = JSON.parse(localStorage.getItem(key));
            
            if (user.referralCode) {
                // This user was referred by someone
                totalReferrals++;
                
                // Find referrer
                for (let j = 0; j < localStorage.length; j++) {
                    const refKey = localStorage.key(j);
                    if (refKey.startsWith('user_')) {
                        const refUser = JSON.parse(localStorage.getItem(refKey));
                        if (refUser.myReferralCode === user.referralCode) {
                            // Add to referrer's stats
                            if (!referrerStats[refUser.uid]) {
                                referrerStats[refUser.uid] = {
                                    name: `${refUser.firstName} ${refUser.lastName}`,
                                    count: 0,
                                    commission: 0
                                };
                            }
                            referrerStats[refUser.uid].count++;
                            
                            // Calculate commission (5% of user's deposits)
                            let userDeposits = 0;
                            for (let k = 0; k < localStorage.length; k++) {
                                const depKey = localStorage.key(k);
                                if (depKey.startsWith('deposit_')) {
                                    const deposit = JSON.parse(localStorage.getItem(depKey));
                                    if (deposit.userId === user.uid && deposit.status === 'approved') {
                                        userDeposits += deposit.amount || 0;
                                    }
                                }
                            }
                            
                            const commission = userDeposits * 0.05;
                            referrerStats[refUser.uid].commission += commission;
                            totalCommission += commission;
                        }
                    }
                }
            }
        }
    }
    
    // Count active referrers (those with at least 1 referral)
    activeReferrers = Object.keys(referrerStats).length;
    
    // Update UI
    document.getElementById('totalReferrals').textContent = totalReferrals;
    document.getElementById('totalCommission').textContent = totalCommission.toFixed(2);
    document.getElementById('activeReferrers').textContent = activeReferrers;
    document.getElementById('avgCommission').textContent = activeReferrers > 0 ? (totalCommission / activeReferrers).toFixed(2) : '0.00';
    
    // Update top referrers
    updateTopReferrers(referrerStats);
    
    // Load referral transactions
    loadReferralTransactions();
}

function updateTopReferrers(referrerStats) {
    const topReferrersContainer = document.getElementById('topReferrers');
    topReferrersContainer.innerHTML = '';
    
    // Convert to array and sort by commission
    const referrersArray = Object.values(referrerStats);
    referrersArray.sort((a, b) => b.commission - a.commission);
    
    // Show top 5 referrers
    const top5 = referrersArray.slice(0, 5);
    
    top5.forEach((referrer, index) => {
        const item = document.createElement('div');
        item.className = 'referrer-item';
        item.innerHTML = `
            <div class="referrer-rank">${index + 1}</div>
            <div class="referrer-info">
                <div class="referrer-name">${referrer.name}</div>
                <div class="referrer-count">${referrer.count} referrals</div>
            </div>
            <div class="referrer-commission">$${referrer.commission.toFixed(2)}</div>
        `;
        topReferrersContainer.appendChild(item);
    });
}

function loadReferralTransactions() {
    const transactionsTable = document.getElementById('referralTransactions');
    transactionsTable.innerHTML = '';
    
    // For demo, create some sample transactions
    const sampleTransactions = [
        {
            date: '2024-03-15',
            referrer: 'John Doe',
            referredUser: 'Jane Smith',
            depositAmount: 100,
            commission: 5,
            status: 'paid'
        },
        {
            date: '2024-03-14',
            referrer: 'Mike Johnson',
            referredUser: 'Sarah Williams',
            depositAmount: 50,
            commission: 2.5,
            status: 'paid'
        },
        {
            date: '2024-03-13',
            referrer: 'Alex Brown',
            referredUser: 'Chris Davis',
            depositAmount: 200,
            commission: 10,
            status: 'pending'
        }
    ];
    
    sampleTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.referrer}</td>
            <td>${transaction.referredUser}</td>
            <td>$${transaction.depositAmount.toFixed(2)}</td>
            <td>$${transaction.commission.toFixed(2)}</td>
            <td>
                <span class="status-badge status-${transaction.status}">
                    ${transaction.status.toUpperCase()}
                </span>
            </td>
        `;
        transactionsTable.appendChild(row);
    });
}

function initializePlatformChart() {
    const ctx = document.getElementById('platformChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Active Users', 'Trading Users', 'Inactive Users', 'New Users'],
            datasets: [{
                data: [65, 25, 5, 5],
                backgroundColor: [
                    '#00ffea',
                    '#ff00ff',
                    '#ff5500',
                    '#ffff00'
                ],
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
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function updateActivityFeed() {
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = '';
    
    // Get recent activities
    const activities = [];
    
    // Add deposit activities
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('deposit_')) {
            const deposit = JSON.parse(localStorage.getItem(key));
            activities.push({
                type: 'deposit',
                title: 'New Deposit',
                description: `$${deposit.amount} via ${deposit.method}`,
                time: new Date(deposit.timestamp),
                user: deposit.userId
            });
        }
        
        if (key.startsWith('withdrawal_')) {
            const withdrawal = JSON.parse(localStorage.getItem(key));
            activities.push({
                type: 'withdraw',
                title: 'Withdrawal Request',
                description: `$${withdrawal.amount} via ${withdrawal.method}`,
                time: new Date(withdrawal.timestamp),
                user: withdrawal.userId
            });
        }
        
        if (key.startsWith('user_')) {
            const user = JSON.parse(localStorage.getItem(key));
            if (user.registeredAt) {
                activities.push({
                    type: 'register',
                    title: 'New User Registration',
                    description: `${user.firstName} ${user.lastName}`,
                    time: new Date(user.registeredAt),
                    user: user.uid
                });
            }
        }
    }
    
    // Sort by time (newest first) and take last 10
    activities.sort((a, b) => b.time - a.time);
    const recentActivities = activities.slice(0, 10);
    
    // Create activity items
    recentActivities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        // Get user name
        let userName = 'Unknown';
        const userKey = 'user_' + activity.user;
        const user = JSON.parse(localStorage.getItem(userKey) || '{}');
        if (user.firstName) {
            userName = `${user.firstName} ${user.lastName}`;
        }
        
        item.innerHTML = `
            <div class="activity-icon ${activity.type}">
                <i class="fas fa-${activity.type === 'deposit' ? 'arrow-down' : 
                                   activity.type === 'withdraw' ? 'arrow-up' : 
                                   activity.type === 'trade' ? 'chart-line' : 'user-plus'}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-desc">${userName} - ${activity.description}</div>
            </div>
            <div class="activity-time">
                ${activity.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
        `;
        
        activityList.appendChild(item);
    });
}

// User Management Functions
function addNewUser() {
    const modal = document.getElementById('userModal');
    const modalBody = modal.querySelector('.modal-body');
    const modalTitle = document.getElementById('modalTitle');
    
    modalTitle.textContent = 'ADD NEW USER';
    
    modalBody.innerHTML = `
        <div class="user-form">
            <div class="form-row">
                <div class="form-group">
                    <label>First Name</label>
                    <input type="text" id="addFirstName" placeholder="Enter first name">
                </div>
                <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" id="addLastName" placeholder="Enter last name">
                </div>
            </div>
            
            <div class="form-group">
                <label>Email / Phone</label>
                <input type="text" id="addEmailPhone" placeholder="Enter email or phone">
            </div>
            
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="addPassword" placeholder="Enter password">
            </div>
            
            <div class="form-group">
                <label>Initial Balance ($)</label>
                <input type="number" id="addBalance" value="0" min="0">
            </div>
            
            <div class="form-group">
                <label>Referral Code (Optional)</label>
                <input type="text" id="addReferralCode" placeholder="Enter referral code">
            </div>
            
            <div class="form-actions">
                <button class="btn-action" onclick="saveNewUser()">
                    <i class="fas fa-save"></i> SAVE USER
                </button>
                <button class="btn-action" onclick="closeModal()" style="background: #ff0000;">
                    <i class="fas fa-times"></i> CANCEL
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function saveNewUser() {
    const firstName = document.getElementById('addFirstName').value.trim();
    const lastName = document.getElementById('addLastName').value.trim();
    const emailPhone = document.getElementById('addEmailPhone').value.trim();
    const password = document.getElementById('addPassword').value;
    const balance = parseFloat(document.getElementById('addBalance').value) || 0;
    const referralCode = document.getElementById('addReferralCode').value.trim();
    
    if (!firstName || !lastName || !emailPhone || !password) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Generate UID
    const uid = generateUID();
    
    // Create user object
    const user = {
        uid: uid,
        firstName: firstName,
        lastName: lastName,
        emailOrPhone: emailPhone,
        password: password,
        balance: balance,
        referralCode: referralCode,
        registeredAt: new Date().toISOString(),
        status: 'active',
        myReferralCode: generateReferralCode()
    };
    
    // Save to localStorage
    localStorage.setItem('user_' + uid, JSON.stringify(user));
    
    // Close modal and refresh
    closeModal();
    loadUsers();
    loadDashboardData();
    
    // Add activity
    addActivity('New user added by admin: ' + firstName + ' ' + lastName, 'register');
    
    alert('User added successfully! UID: ' + uid);
}

function editUser(uid) {
    const user = JSON.parse(localStorage.getItem('user_' + uid));
    if (!user) {
        alert('User not found!');
        return;
    }
    
    const modal = document.getElementById('userModal');
    const modalBody = modal.querySelector('.modal-body');
    const modalTitle = document.getElementById('modalTitle');
    
    modalTitle.textContent = 'EDIT USER';
    
    modalBody.innerHTML = `
        <div class="user-form">
            <div class="form-group">
                <label>User UID</label>
                <input type="text" value="${user.uid}" disabled>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>First Name</label>
                    <input type="text" id="editFirstName" value="${user.firstName || ''}">
                </div>
                <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" id="editLastName" value="${user.lastName || ''}">
                </div>
            </div>
            
            <div class="form-group">
                <label>Email / Phone</label>
                <input type="text" id="editEmailPhone" value="${user.emailOrPhone || ''}">
            </div>
            
            <div class="form-group">
                <label>Balance ($)</label>
                <input type="number" id="editBalance" value="${user.balance || 0}" min="0">
            </div>
            
            <div class="form-group">
                <label>Status</label>
                <select id="editStatus">
                    <option value="active" ${user.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    <option value="banned" ${user.status === 'banned' ? 'selected' : ''}>Banned</option>
                </select>
            </div>
            
            <div class="form-actions">
                <button class="btn-action" onclick="saveUserChanges('${uid}')">
                    <i class="fas fa-save"></i> SAVE CHANGES
                </button>
                <button class="btn-action" onclick="closeModal()" style="background: #ff0000;">
                    <i class="fas fa-times"></i> CANCEL
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function saveUserChanges(uid) {
    const user = JSON.parse(localStorage.getItem('user_' + uid));
    if (!user) return;
    
    user.firstName = document.getElementById('editFirstName').value.trim();
    user.lastName = document.getElementById('editLastName').value.trim();
    user.emailOrPhone = document.getElementById('editEmailPhone').value.trim();
    user.balance = parseFloat(document.getElementById('editBalance').value) || 0;
    user.status = document.getElementById('editStatus').value;
    
    localStorage.setItem('user_' + uid, JSON.stringify(user));
    
    closeModal();
    loadUsers();
    loadDashboardData();
    
    addActivity('User updated: ' + user.firstName + ' ' + user.lastName, 'user');
}

function deleteUser(uid) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        const user = JSON.parse(localStorage.getItem('user_' + uid));
        
        // Delete user
        localStorage.removeItem('user_' + uid);
        
        // Also delete user's trade history
        localStorage.removeItem('tradeHistory_' + uid);
        
        loadUsers();
        loadDashboardData();
        
        addActivity('User deleted: ' + (user?.firstName || 'Unknown'), 'user');
        
        alert('User deleted successfully!');
    }
}

function viewUser(uid) {
    const user = JSON.parse(localStorage.getItem('user_' + uid));
    if (!user) {
        alert('User not found!');
        return;
    }
    
    const modal = document.getElementById('userModal');
    const modalBody = modal.querySelector('.modal-body');
    const modalTitle = document.getElementById('modalTitle');
    
    modalTitle.textContent = 'USER DETAILS';
    
    // Get user's trade history
    const tradeHistory = JSON.parse(localStorage.getItem('tradeHistory_' + uid) || '[]');
    const totalTrades = tradeHistory.length;
    const winTrades = tradeHistory.filter(t => t.result === 'win').length;
    const lossTrades = tradeHistory.filter(t => t.result === 'loss').length;
    const winRate = totalTrades > 0 ? ((winTrades / totalTrades) * 100).toFixed(2) : 0;
    
    modalBody.innerHTML = `
        <div class="user-details">
            <div class="detail-row">
                <span class="detail-label">UID:</span>
                <span class="detail-value">${user.uid}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${user.firstName} ${user.lastName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email/Phone:</span>
                <span class="detail-value">${user.emailOrPhone || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Balance:</span>
                <span class="detail-value">$${user.balance?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                    <span class="status-badge ${user.status || 'status-active'}">
                        ${(user.status || 'active').toUpperCase()}
                    </span>
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Registered:</span>
                <span class="detail-value">${new Date(user.registeredAt || Date.now()).toLocaleString()}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Referral Code:</span>
                <span class="detail-value">${user.myReferralCode || 'N/A'}</span>
            </div>
            
            <hr style="margin: 20px 0; border-color: #00ffea; opacity: 0.2;">
            
            <h4 style="color: #00ffea; margin-bottom: 15px;">Trading Statistics</h4>
            
            <div class="detail-row">
                <span class="detail-label">Total Trades:</span>
                <span class="detail-value">${totalTrades}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Win Rate:</span>
                <span class="detail-value">${winRate}%</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Wins/Losses:</span>
                <span class="detail-value">${winTrades} / ${lossTrades}</span>
            </div>
            
            <div class="form-actions" style="margin-top: 30px;">
                <button class="btn-action" onclick="editUser('${uid}')">
                    <i class="fas fa-edit"></i> EDIT USER
                </button>
                <button class="btn-action" onclick="closeModal()" style="background: #ff0000;">
                    <i class="fas fa-times"></i> CLOSE
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Deposit Management Functions
function approveDeposit(depositId) {
    const deposit = JSON.parse(localStorage.getItem('deposit_' + depositId));
    if (!deposit) {
        alert('Deposit not found!');
        return;
    }
    
    // Update deposit status
    deposit.status = 'approved';
    deposit.approvedAt = new Date().toISOString();
    deposit.approvedBy = localStorage.getItem('adminName') || 'Admin';
    
    localStorage.setItem('deposit_' + depositId, JSON.stringify(deposit));
    
    // Update user balance
    const user = JSON.parse(localStorage.getItem('user_' + deposit.userId));
    if (user) {
        user.balance = (user.balance || 0) + deposit.amount;
        localStorage.setItem('user_' + deposit.userId, JSON.stringify(user));
    }
    
    loadDeposits();
    loadDashboardData();
    updateActivityFeed();
    
    addActivity(`Deposit approved: $${deposit.amount} for user ${deposit.userId}`, 'deposit');
    
    alert('Deposit approved successfully!');
}

function rejectDeposit(depositId) {
    const deposit = JSON.parse(localStorage.getItem('deposit_' + depositId));
    if (!deposit) {
        alert('Deposit not found!');
        return;
    }
    
    if (confirm('Are you sure you want to reject this deposit?')) {
        deposit.status = 'rejected';
        deposit.rejectedAt = new Date().toISOString();
        deposit.rejectedBy = localStorage.getItem('adminName') || 'Admin';
        
        localStorage.setItem('deposit_' + depositId, JSON.stringify(deposit));
        
        loadDeposits();
        updateActivityFeed();
        
        addActivity(`Deposit rejected: $${deposit.amount} for user ${deposit.userId}`, 'deposit');
        
        alert('Deposit rejected!');
    }
}

function viewDepositProof(depositId) {
    alert('In a real application, this would show the payment proof/screenshot.');
}

// Withdrawal Management Functions
function approveWithdrawal(withdrawalId) {
    const withdrawal = JSON.parse(localStorage.getItem('withdrawal_' + withdrawalId));
    if (!withdrawal) {
        alert('Withdrawal not found!');
        return;
    }
    
    // Update withdrawal status
    withdrawal.status = 'approved';
    withdrawal.approvedAt = new Date().toISOString();
    withdrawal.approvedBy = localStorage.getItem('adminName') || 'Admin';
    
    localStorage.setItem('withdrawal_' + withdrawalId, JSON.stringify(withdrawal));
    
    loadWithdrawals();
    loadDashboardData();
    updateActivityFeed();
    
    addActivity(`Withdrawal approved: $${withdrawal.amount} for user ${withdrawal.userId}`, 'withdraw');
    
    alert('Withdrawal approved successfully!');
}

function rejectWithdrawal(withdrawalId) {
    const withdrawal = JSON.parse(localStorage.getItem('withdrawal_' + withdrawalId));
    if (!withdrawal) {
        alert('Withdrawal not found!');
        return;
    }
    
    if (confirm('Are you sure you want to reject this withdrawal?')) {
        // Return money to user balance
        const user = JSON.parse(localStorage.getItem('user_' + withdrawal.userId));
        if (user) {
            user.balance = (user.balance || 0) + withdrawal.amount;
            localStorage.setItem('user_' + withdrawal.userId, JSON.stringify(user));
        }
        
        withdrawal.status = 'rejected';
        withdrawal.rejectedAt = new Date().toISOString();
        withdrawal.rejectedBy = localStorage.getItem('adminName') || 'Admin';
        
        localStorage.setItem('withdrawal_' + withdrawalId, JSON.stringify(withdrawal));
        
        loadWithdrawals();
        loadDashboardData();
        updateActivityFeed();
        
        addActivity(`Withdrawal rejected: $${withdrawal.amount} for user ${withdrawal.userId}`, 'withdraw');
        
        alert('Withdrawal rejected! Money returned to user balance.');
    }
}

// Referral System Functions
function updateReferralSettings() {
    // This would normally load current settings from database
    // For demo, we'll just show a message
    alert('Referral settings loaded. In real application, this would populate the form with current settings.');
}

function saveReferralSettings() {
    const commission = document.getElementById('refCommission').value;
    const signupBonus = document.getElementById('signupBonus').value;
    const minDeposit = document.getElementById('minDepositCommission').value;
    const maxReferrals = document.getElementById('maxReferrals').value;
    
    // Save to localStorage
    const settings = {
        commission: parseFloat(commission),
        signupBonus: parseFloat(signupBonus),
        minDeposit: parseFloat(minDeposit),
        maxReferrals: parseInt(maxReferrals),
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('referralSettings', JSON.stringify(settings));
    
    addActivity('Referral settings updated', 'settings');
    
    alert('Referral settings saved successfully!');
}

// Utility Functions
function generateUID() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let uid = '';
    for (let i = 0; i < 10; i++) {
        uid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return uid;
}

function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function addActivity(description, type) {
    // In real application, save to database
    console.log('Activity:', type, '-', description);
}

function filterDeposits(filter) {
    document.querySelectorAll('#depositsSection .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    loadDeposits(filter);
}

function filterWithdrawals(filter) {
    document.querySelectorAll('#withdrawalsSection .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    loadWithdrawals(filter);
}

function createPagination(containerId, totalItems, perPage, currentPage, callback) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    const totalPages = Math.ceil(totalItems / perPage);
    
    // Previous button
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.onclick = () => callback(currentPage - 1);
        container.appendChild(prevBtn);
    }
    
    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'page-btn';
        pageBtn.textContent = i;
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.onclick = () => callback(i);
        container.appendChild(pageBtn);
    }
    
    // Next button
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.onclick = () => callback(currentPage + 1);
        container.appendChild(nextBtn);
    }
}

function closeModal() {
    document.querySelectorAll('.admin-modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function refreshData() {
    loadDashboardData();
    loadUsers();
    loadDeposits();
    loadWithdrawals();
    loadReferralData();
    updateActivityFeed();
    
    addActivity('Data refreshed by admin', 'system');
    
    alert('Data refreshed successfully!');
}

function exportData() {
    alert('In real application, this would export data to CSV/Excel format.');
}

function exportUsers() {
    alert('Exporting users to CSV...');
}

function exportReferrals() {
    alert('Exporting referral data to CSV...');
}

function sendBroadcast() {
    const message = prompt('Enter broadcast message:');
    if (message) {
        addActivity('Broadcast sent: ' + message, 'system');
        alert('Broadcast sent to all users!');
    }
}

function backupDatabase() {
    addActivity('Database backup created', 'system');
    alert('Database backup created successfully!');
}

function logoutAdmin() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminName');
        location.reload();
    }
}

// Add deposit and withdrawal sample data for demo
function initializeDemoData() {
    // Check if demo data already exists
    if (!localStorage.getItem('demoDataInitialized')) {
        // Create some sample deposits
        for (let i = 1; i <= 5; i++) {
            const deposit = {
                id: 'DEP' + Date.now() + i,
                userId: 'DEMOUSER1',
                method: ['bkash', 'nagad', 'usdt'][Math.floor(Math.random() * 3)],
                amount: [100, 50, 200, 500, 1000][Math.floor(Math.random() * 5)],
                status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
                timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                transactionId: 'TRX' + Math.random().toString(36).substr(2, 10).toUpperCase()
            };
            localStorage.setItem('deposit_' + deposit.id, JSON.stringify(deposit));
        }
        
        // Create some sample withdrawals
        for (let i = 1; i <= 5; i++) {
            const withdrawal = {
                id: 'WTH' + Date.now() + i,
                userId: 'DEMOUSER1',
                method: ['bkash', 'nagad', 'usdt'][Math.floor(Math.random() * 3)],
                account: '01' + Math.floor(Math.random() * 1000000000),
                amount: [300, 500, 1000, 2000, 5000][Math.floor(Math.random() * 5)],
                status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
                timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
            };
            localStorage.setItem('withdrawal_' + withdrawal.id, JSON.stringify(withdrawal));
        }
        
        localStorage.setItem('demoDataInitialized', 'true');
    }
}

// Initialize demo data on page load
initializeDemoData();