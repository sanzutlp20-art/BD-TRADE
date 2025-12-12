// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Loading screen
    setTimeout(function() {
        document.getElementById('loadingScreen').style.opacity = '0';
        setTimeout(function() {
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('dashboardContainer').style.display = 'flex';
            initializeDashboard();
        }, 500);
    }, 2000);
    
    // Check if user is logged in
    checkLoginStatus();
});

function checkLoginStatus() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load user data
    loadUserData(currentUser);
}

function loadUserData(uid) {
    const userKey = 'user_' + uid;
    const userData = JSON.parse(localStorage.getItem(userKey));
    
    if (userData) {
        // Update UI with user data
        document.getElementById('userName').textContent = 
            userData.firstName + ' ' + userData.lastName;
        document.getElementById('userUID').textContent = 'UID: ' + userData.uid;
        document.getElementById('welcomeName').textContent = userData.firstName;
        document.getElementById('mainBalance').textContent = userData.balance.toFixed(2);
        document.getElementById('sidebarBalance').textContent = userData.balance.toFixed(2);
        
        // Save user data globally
        window.currentUser = userData;
    } else {
        // User not found, redirect to login
        window.location.href = 'login.html';
    }
}

function initializeDashboard() {
    // Sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(event.target) && 
                !sidebarToggle.contains(event.target) && 
                sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        }
    });
    
    // Initialize stats
    updateStats();
    
    // Initialize modals
    initializeModals();
}

function updateBalance() {
    // Simulate balance update
    const balanceElement = document.getElementById('mainBalance');
    const sidebarBalance = document.getElementById('sidebarBalance');
    const currentBalance = parseFloat(balanceElement.textContent);
    
    // Small random fluctuation for demo
    const change = (Math.random() - 0.5) * 10;
    const newBalance = Math.max(0, currentBalance + change);
    
    balanceElement.textContent = newBalance.toFixed(2);
    sidebarBalance.textContent = newBalance.toFixed(2);
    
    // Update user data in localStorage
    if (window.currentUser) {
        window.currentUser.balance = newBalance;
        localStorage.setItem('user_' + window.currentUser.uid, JSON.stringify(window.currentUser));
    }
    
    // Show notification
    showNotification('Balance updated successfully!', 'success');
}

function updateStats() {
    // Update trading stats
    const stats = {
        totalTrades: Math.floor(Math.random() * 100),
        winRate: Math.floor(Math.random() * 30) + 50, // 50-80%
        profitLoss: (Math.random() - 0.3) * 100,
        bestTrade: Math.random() * 50
    };
    
    document.getElementById('totalTrades').textContent = stats.totalTrades;
    document.getElementById('winRate').textContent = stats.winRate + '%';
    
    const profitLossElement = document.getElementById('profitLoss');
    profitLossElement.textContent = (stats.profitLoss >= 0 ? '+' : '') + '$' + stats.profitLoss.toFixed(2);
    profitLossElement.className = stats.profitLoss >= 0 ? 'stat-value profit' : 'stat-value loss';
    
    document.getElementById('bestTrade').textContent = '$' + stats.bestTrade.toFixed(2);
}

function showHistory(type) {
    const depositHistory = document.getElementById('depositHistory');
    const withdrawHistory = document.getElementById('withdrawHistory');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    if (type === 'deposit') {
        depositHistory.style.display = 'block';
        withdrawHistory.style.display = 'none';
        tabButtons[0].classList.add('active');
        tabButtons[1].classList.remove('active');
    } else {
        depositHistory.style.display = 'none';
        withdrawHistory.style.display = 'block';
        tabButtons[0].classList.remove('active');
        tabButtons[1].classList.add('active');
    }
}

function initializeModals() {
    // Close modals when clicking outside
    window.onclick = function(event) {
        const depositModal = document.getElementById('depositModal');
        const withdrawModal = document.getElementById('withdrawModal');
        
        if (event.target === depositModal) {
            closeDepositModal();
        }
        if (event.target === withdrawModal) {
            closeWithdrawModal();
        }
    };
    
    // Escape key to close modals
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeDepositModal();
            closeWithdrawModal();
        }
    });
}

// Deposit Modal Functions
function showDepositModal() {
    document.getElementById('depositModal').style.display = 'flex';
}

function closeDepositModal() {
    document.getElementById('depositModal').style.display = 'none';
    // Reset form
    document.getElementById('depositForm').style.display = 'none';
}

function selectDepositMethod(method) {
    const form = document.getElementById('depositForm');
    const title = document.getElementById('methodTitle');
    const number = document.getElementById('paymentNumber');
    
    let methodName = '';
    let paymentNumber = '';
    
    switch(method) {
        case 'bkash':
            methodName = 'Bkash';
            paymentNumber = '+88 01767668270';
            break;
        case 'nagad':
            methodName = 'Nagad';
            paymentNumber = '+88 01767668271';
            break;
        case 'usdt':
            methodName = 'USDT';
            paymentNumber = '0x742d35Cc6634C0532925a3b844Bc9eE6a5';
            break;
    }
    
    title.textContent = 'DEPOSIT VIA ' + methodName;
    number.textContent = paymentNumber;
    
    form.style.display = 'block';
    window.selectedDepositMethod = method;
}

function copyPaymentNumber() {
    const number = document.getElementById('paymentNumber').textContent;
    navigator.clipboard.writeText(number).then(() => {
        showNotification('Payment number copied to clipboard!', 'success');
    });
}

function setAmount(amount) {
    document.getElementById('depositAmount').value = amount;
}

function submitDeposit() {
    const amount = parseFloat(document.getElementById('depositAmount').value);
    const transactionId = document.getElementById('transactionId').value.trim();
    
    // Validation
    if (!amount || amount < 100) {
        showNotification('Minimum deposit amount is $100', 'error');
        return;
    }
    
    if (!transactionId || transactionId.length !== 10) {
        showNotification('Transaction ID must be exactly 10 digits', 'error');
        return;
    }
    
    if (!/^\d{10}$/.test(transactionId)) {
        showNotification('Transaction ID must contain only numbers', 'error');
        return;
    }
    
    // Simulate deposit submission
    showNotification('Deposit request submitted! Funds will be added within 5 minutes.', 'success');
    
    // Add to history (demo)
    const historyList = document.getElementById('depositHistory');
    const newItem = document.createElement('div');
    newItem.className = 'history-item';
    newItem.innerHTML = `
        <div class="history-type deposit">
            <i class="fas fa-arrow-down"></i>
            <span>${window.selectedDepositMethod.toUpperCase()} Deposit</span>
        </div>
        <div class="history-date">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
        <div class="history-amount">+$${amount.toFixed(2)}</div>
        <div class="history-status pending">Pending</div>
    `;
    historyList.insertBefore(newItem, historyList.firstChild);
    
    // Close modal
    closeDepositModal();
}

// Withdraw Modal Functions
function showWithdrawModal() {
    document.getElementById('withdrawModal').style.display = 'flex';
}

function closeWithdrawModal() {
    document.getElementById('withdrawModal').style.display = 'none';
    // Reset form
    document.getElementById('withdrawForm').style.display = 'none';
}

function selectWithdrawMethod(method) {
    const form = document.getElementById('withdrawForm');
    const title = document.getElementById('withdrawMethodTitle');
    
    let methodName = '';
    let minAmount = 300;
    
    switch(method) {
        case 'bkash':
            methodName = 'Bkash';
            break;
        case 'nagad':
            methodName = 'Nagad';
            break;
        case 'usdt':
            methodName = 'USDT';
            minAmount = 100;
            break;
    }
    
    title.textContent = 'WITHDRAW TO ' + methodName;
    document.getElementById('withdrawAmount').min = minAmount;
    document.getElementById('withdrawAmount').placeholder = `Min: $${minAmount}`;
    
    form.style.display = 'block';
    window.selectedWithdrawMethod = method;
}

function submitWithdraw() {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const number = document.getElementById('withdrawNumber').value.trim();
    const password = document.getElementById('withdrawPassword').value;
    
    // Get minimum amount based on method
    let minAmount = 300;
    if (window.selectedWithdrawMethod === 'usdt') minAmount = 100;
    
    // Validation
    if (!amount || amount < minAmount) {
        showNotification(`Minimum withdrawal amount is $${minAmount}`, 'error');
        return;
    }
    
    if (!number) {
        showNotification('Please enter your payment number', 'error');
        return;
    }
    
    if (!password) {
        showNotification('Please enter your password', 'error');
        return;
    }
    
    // Check password (demo - in real app, verify with server)
    if (window.currentUser && password !== window.currentUser.password) {
        showNotification('Incorrect password', 'error');
        return;
    }
    
    // Check balance
    if (amount > window.currentUser.balance) {
        showNotification('Insufficient balance', 'error');
        return;
    }
    
    // Simulate withdrawal request
    showNotification('Withdrawal request submitted! Processing within 2 hours.', 'success');
    
    // Add to history (demo)
    const historyList = document.getElementById('withdrawHistory');
    const newItem = document.createElement('div');
    newItem.className = 'history-item';
    newItem.innerHTML = `
        <div class="history-type withdraw">
            <i class="fas fa-arrow-up"></i>
            <span>${window.selectedWithdrawMethod.toUpperCase()} Withdraw</span>
        </div>
        <div class="history-date">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
        <div class="history-amount">-$${amount.toFixed(2)}</div>
        <div class="history-status pending">Pending</div>
    `;
    historyList.insertBefore(newItem, historyList.firstChild);
    
    // Update balance
    window.currentUser.balance -= amount;
    localStorage.setItem('user_' + window.currentUser.uid, JSON.stringify(window.currentUser));
    updateBalance();
    
    // Close modal
    closeWithdrawModal();
}

// Quick Trade Functions
function placeQuickTrade(color) {
    const amountInput = document.querySelector('.amount-input');
    const amount = parseFloat(amountInput.value) || 5;
    
    if (amount > window.currentUser.balance) {
        showNotification('Insufficient balance', 'error');
        return;
    }
    
    // Simulate trade
    const win = Math.random() > 0.45; // 55% win rate for demo
    const profit = win ? amount * 1.9 : -amount;
    
    // Update balance
    window.currentUser.balance += profit;
    localStorage.setItem('user_' + window.currentUser.uid, JSON.stringify(window.currentUser));
    updateBalance();
    
    // Show result
    if (win) {
        showNotification(`Congratulations! You won $${(amount * 1.9).toFixed(2)}`, 'success');
    } else {
        showNotification(`Trade lost. You lost $${amount.toFixed(2)}`, 'error');
    }
    
    // Add to trade history
    const tradesList = document.querySelector('.trades-list');
    const newTrade = document.createElement('div');
    newTrade.className = `trade-item ${win ? 'win' : 'loss'}`;
    newTrade.innerHTML = `
        <div class="trade-color ${color}"></div>
        <div class="trade-details">
            <div class="trade-type">${color.toUpperCase()}</div>
            <div class="trade-time">Just now</div>
        </div>
        <div class="trade-amount">${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}</div>
    `;
    tradesList.insertBefore(newTrade, tradesList.firstChild);
    
    // Update stats
    updateStats();
}

function executeQuickTrade() {
    // For demo, randomly select color
    const color = Math.random() > 0.5 ? 'red' : 'green';
    placeQuickTrade(color);
}

// Notification System
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(0, 255, 0, 0.9)' : 'rgba(255, 0, 0, 0.9)'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        animation: slideInRight 0.5s ease-out;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        min-width: 300px;
        max-width: 400px;
    `;
    
    // Add close button style
    notification.querySelector('.notification-close').style.cssText = `
        background: transparent;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: auto;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.5s ease-out forwards';
            setTimeout(() => notification.remove(), 500);
        }
    }, 5000);
    
    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}