// ============================================
// ENHANCED TRADING PLATFORM - FULLY FIXED
// ============================================

// Global state management
const TradingState = {
    data: null,
    chart: null,
    activeBet: null,
    user: null,
    sounds: {},
    isInitialized: false
};

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Trading Platform Loading...');
    
    // Initialize sounds
    initializeSounds();
    
    // Show loading screen
    document.getElementById('loadingScreen').style.opacity = '1';
    
    // Check login status
    setTimeout(() => {
        checkLoginStatus();
    }, 1500);
});

// Initialize audio sounds
function initializeSounds() {
    TradingState.sounds = {
        bet: document.getElementById('betSound'),
        win: document.getElementById('winSound'),
        lose: document.getElementById('loseSound'),
        timer: document.getElementById('timerSound')
    };
    
    // Set volume
    Object.values(TradingState.sounds).forEach(sound => {
        if (sound) sound.volume = 0.5;
    });
}

// Check if user is logged in
function checkLoginStatus() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    loadUserData(currentUser);
}

// Load user data from localStorage
function loadUserData(uid) {
    try {
        const userKey = 'user_' + uid;
        const userData = JSON.parse(localStorage.getItem(userKey));
        
        if (!userData) {
            throw new Error('User data not found');
        }
        
        TradingState.user = userData;
        
        // Update UI with user data
        document.getElementById('userName').textContent = 
            `${userData.firstName} ${userData.lastName}`.toUpperCase();
        document.getElementById('userUID').textContent = `UID: ${userData.uid}`;
        
        // Initialize platform
        initializeTradingPlatform();
        
    } catch (error) {
        console.error('❌ Error loading user data:', error);
        showToast('Session expired. Please login again.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
}

// Main platform initialization
function initializeTradingPlatform() {
    if (TradingState.isInitialized) return;
    
    console.log('🎮 Initializing Trading Platform...');
    
    // Initialize trading data
    TradingState.data = {
        selectedTime: 30,
        selectedAmount: 5,
        selectedColor: null,
        currentRound: 1,
        countdown: 30,
        timerRunning: true,
        canBet: true,
        tradeHistory: [],
        recentResults: [],
        currentCandle: null,
        candles: [],
        candleInterval: null,
        lastWinningColor: null,
        soundEnabled: true,
        isPaused: false
    };
    
    // Update UI
    updateBalance();
    updateRoundNumber();
    updateLivePrice(100.00);
    
    // Initialize all components
    initializeTimer();
    initializeCandleChart();
    initializeBetting();
    initializeRecentResults();
    loadTradeHistory();
    initializeEventListeners();
    initializeHelpModal();
    
    // Start cycles
    startTradingCycle();
    startCandleGeneration();
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('tradingContainer').style.display = 'flex';
            TradingState.isInitialized = true;
            
            // Show welcome message
            showToast(`Welcome back, ${TradingState.user.firstName}!`, 'success');
            console.log('✅ Trading Platform Initialized');
        }, 500);
    }, 1000);
}

// Initialize timer
function initializeTimer() {
    const timerCircle = document.getElementById('timer-circle');
    const countdownElement = document.getElementById('countdown');
    const timerStatus = document.getElementById('timerStatus');
    
    // Set initial timer circle
    updateTimerCircle();
    
    // Time buttons event listeners
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Update UI
            document.querySelectorAll('.time-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            
            // Update time
            const time = parseInt(this.dataset.time);
            TradingState.data.selectedTime = time;
            TradingState.data.countdown = time;
            countdownElement.textContent = time;
            
            // Reset timer
            resetTimer();
            
            showToast(`Time period set to ${time} seconds`, 'info');
        });
    });
    
    // Timer controls
    document.getElementById('pauseTimer').addEventListener('click', toggleTimerPause);
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
    
    // Start timer interval
    setInterval(updateTimerLogic, 1000);
}

// Timer logic
function updateTimerLogic() {
    if (!TradingState.data.timerRunning || TradingState.data.isPaused) return;
    
    TradingState.data.countdown--;
    document.getElementById('countdown').textContent = TradingState.data.countdown;
    
    // Update timer circle
    updateTimerCircle();
    
    // Update status
    updateTimerStatus();
    
    // Play sound effects
    if (TradingState.data.countdown <= 5 && TradingState.data.soundEnabled) {
        playSound('timer');
    }
    
    // Timer ends
    if (TradingState.data.countdown <= 0) {
        endTradingRound();
    }
}

// Update timer circle animation
function updateTimerCircle() {
    const timerCircle = document.getElementById('timer-circle');
    if (!timerCircle) return;
    
    const totalTime = TradingState.data.selectedTime;
    const circumference = 2 * Math.PI * 90;
    const percentage = (TradingState.data.countdown / totalTime) * circumference;
    timerCircle.style.strokeDashoffset = percentage;
}

// Update timer status
function updateTimerStatus() {
    const timerStatus = document.getElementById('timerStatus');
    const placeBetBtn = document.getElementById('placeBetBtn');
    
    if (TradingState.data.countdown <= 5) {
        timerStatus.textContent = 'BETTING CLOSED';
        timerStatus.style.color = '#ff0000';
        TradingState.data.canBet = false;
        placeBetBtn.disabled = true;
    } else if (TradingState.data.countdown <= 10) {
        timerStatus.textContent = 'LAST CHANCE TO BET!';
        timerStatus.style.color = '#ffff00';
    } else {
        timerStatus.textContent = 'PLACE YOUR BET';
        timerStatus.style.color = '#00ffea';
        TradingState.data.canBet = true;
    }
}

// Toggle timer pause
function toggleTimerPause() {
    TradingState.data.isPaused = !TradingState.data.isPaused;
    const pauseBtn = document.getElementById('pauseTimer');
    
    if (TradingState.data.isPaused) {
        pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        pauseBtn.setAttribute('aria-label', 'Resume timer');
        showToast('Timer paused', 'warning');
    } else {
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        pauseBtn.setAttribute('aria-label', 'Pause timer');
        showToast('Timer resumed', 'success');
    }
}

// Toggle sound
function toggleSound() {
    TradingState.data.soundEnabled = !TradingState.data.soundEnabled;
    const soundBtn = document.getElementById('soundToggle');
    
    if (TradingState.data.soundEnabled) {
        soundBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        soundBtn.setAttribute('aria-label', 'Mute sound');
        showToast('Sound enabled', 'success');
    } else {
        soundBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        soundBtn.setAttribute('aria-label', 'Enable sound');
        showToast('Sound muted', 'warning');
    }
}

// Reset timer
function resetTimer() {
    TradingState.data.countdown = TradingState.data.selectedTime;
    TradingState.data.canBet = true;
    TradingState.data.timerRunning = true;
    
    const placeBetBtn = document.getElementById('placeBetBtn');
    placeBetBtn.disabled = false;
    
    document.getElementById('timerStatus').textContent = 'PLACE YOUR BET';
    document.getElementById('timerStatus').style.color = '#00ffea';
    
    // Reset circle
    updateTimerCircle();
}

// End trading round
function endTradingRound() {
    TradingState.data.timerRunning = false;
    TradingState.data.canBet = false;
    
    // Complete current candle
    completeCurrentCandle();
    
    // Determine winning color
    const winningColor = determineWinningColor();
    TradingState.data.lastWinningColor = winningColor;
    
    // Process active bets
    processBets(winningColor);
    
    // Add to recent results
    addRecentResult(winningColor);
    
    // Update statistics
    updateStatistics();
    
    // AI prediction for next round
    generateAIPrediction();
    
    // Start next round after delay
    setTimeout(() => {
        TradingState.data.currentRound++;
        updateRoundNumber();
        resetTimer();
        startNewCandle();
        
        showToast(`Round ${TradingState.data.currentRound} starting...`, 'info');
    }, 3000);
}

// Determine winning color
function determineWinningColor() {
    if (!TradingState.data.candles || TradingState.data.candles.length === 0) {
        // Random if no candles
        return Math.random() > 0.5 ? 'red' : 'green';
    }
    
    const lastCandle = TradingState.data.candles[TradingState.data.candles.length - 1];
    return lastCandle.close > lastCandle.open ? 'green' : 'red';
}

// Initialize candlestick chart
function initializeCandleChart() {
    const ctx = document.getElementById('tradingChart');
    if (!ctx) {
        console.error('Chart canvas not found');
        return;
    }
    
    // Generate initial candles
    TradingState.data.candles = generateInitialCandles(15);
    
    try {
        TradingState.chart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: TradingState.data.candles.map((_, i) => i + 1),
                datasets: [{
                    label: 'Price',
                    data: TradingState.data.candles.map(c => c.close),
                    borderColor: '#00ffea',
                    backgroundColor: 'rgba(0, 255, 234, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#00ffea',
                        bodyColor: '#ffffff',
                        borderColor: '#00ffea',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const candle = TradingState.data.candles[context.dataIndex];
                                if (!candle) return '';
                                
                                return [
                                    `Price: $${candle.close.toFixed(2)}`,
                                    `Open: $${candle.open.toFixed(2)}`,
                                    `High: $${candle.high.toFixed(2)}`,
                                    `Low: $${candle.low.toFixed(2)}`,
                                    `Change: ${candle.close >= candle.open ? '+' : ''}${((candle.close - candle.open) / candle.open * 100).toFixed(2)}%`
                                ];
                            }
                        }
                    },
                    zoom: {
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'x',
                        },
                        pan: {
                            enabled: true,
                            mode: 'x',
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            color: 'rgba(0, 255, 234, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#00ffea',
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        display: true,
                        position: 'right',
                        grid: {
                            color: 'rgba(0, 255, 234, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#00ffea',
                            font: {
                                size: 10
                            },
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
        
        // Chart controls
        document.getElementById('zoomIn').addEventListener('click', () => {
            if (TradingState.chart) {
                TradingState.chart.zoom(1.1);
                TradingState.chart.update();
            }
        });
        
        document.getElementById('zoomOut').addEventListener('click', () => {
            if (TradingState.chart) {
                TradingState.chart.zoom(0.9);
                TradingState.chart.update();
            }
        });
        
        document.getElementById('resetChart').addEventListener('click', () => {
            if (TradingState.chart) {
                TradingState.chart.resetZoom();
                TradingState.chart.update();
            }
        });
        
        document.getElementById('fullscreenChart').addEventListener('click', toggleChartFullscreen);
        
    } catch (error) {
        console.error('Error initializing chart:', error);
        showToast('Chart initialization failed', 'error');
    }
    
    // Start new candle
    startNewCandle();
}

// Toggle chart fullscreen
function toggleChartFullscreen() {
    const chartContainer = document.querySelector('.chart-wrapper');
    if (!document.fullscreenElement) {
        chartContainer.requestFullscreen().catch(err => {
            console.error('Error attempting to enable fullscreen:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// Generate initial candles
function generateInitialCandles(count) {
    const candles = [];
    let price = 100.00;
    
    for (let i = 0; i < count; i++) {
        const change = (Math.random() - 0.5) * 8;
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * 3;
        const low = Math.min(open, close) - Math.random() * 3;
        
        candles.push({
            index: i,
            open: open,
            high: high,
            low: low,
            close: close,
            color: close >= open ? 'green' : 'red',
            timestamp: new Date(Date.now() - (count - i) * 2000)
        });
        
        price = close;
    }
    
    return candles;
}

// Start new candle
function startNewCandle() {
    let lastClose = 100.00;
    if (TradingState.data.candles.length > 0) {
        lastClose = TradingState.data.candles[TradingState.data.candles.length - 1].close;
    }
    
    TradingState.data.currentCandle = {
        index: TradingState.data.candles.length,
        open: lastClose,
        high: lastClose,
        low: lastClose,
        close: lastClose,
        color: 'green',
        isActive: true,
        startTime: Date.now()
    };
}

// Update current candle
function updateCurrentCandle() {
    if (!TradingState.data.currentCandle || !TradingState.data.currentCandle.isActive) return;
    
    // Generate realistic price movement
    const volatility = 0.5;
    const movement = (Math.random() - 0.5) * volatility * 2;
    const newPrice = TradingState.data.currentCandle.close * (1 + movement / 100);
    
    // Update candle
    TradingState.data.currentCandle.close = newPrice;
    TradingState.data.currentCandle.high = Math.max(TradingState.data.currentCandle.high, newPrice);
    TradingState.data.currentCandle.low = Math.min(TradingState.data.currentCandle.low, newPrice);
    TradingState.data.currentCandle.color = newPrice >= TradingState.data.currentCandle.open ? 'green' : 'red';
    
    // Update live price display
    updateLivePrice(newPrice);
    
    // Update chart
    updateChartWithCurrentCandle();
}

// Complete current candle
function completeCurrentCandle() {
    if (!TradingState.data.currentCandle || !TradingState.data.currentCandle.isActive) return;
    
    TradingState.data.currentCandle.isActive = false;
    TradingState.data.currentCandle.endTime = Date.now();
    
    // Add to candles array
    TradingState.data.candles.push({...TradingState.data.currentCandle});
    
    // Keep only last 50 candles
    if (TradingState.data.candles.length > 50) {
        TradingState.data.candles.shift();
    }
    
    // Update chart
    updateChartWithCurrentCandle();
}

// Update chart with current candle
function updateChartWithCurrentCandle() {
    if (!TradingState.chart) return;
    
    // Prepare data
    const labels = TradingState.data.candles.map((_, i) => i + 1);
    const data = TradingState.data.candles.map(c => c.close);
    
    // Add current active candle if exists
    if (TradingState.data.currentCandle && TradingState.data.currentCandle.isActive) {
        labels.push(TradingState.data.candles.length + 1);
        data.push(TradingState.data.currentCandle.close);
    }
    
    // Update chart
    TradingState.chart.data.labels = labels;
    TradingState.chart.data.datasets[0].data = data;
    TradingState.chart.update('none');
}

// Start candle generation
function startCandleGeneration() {
    // Clear any existing interval
    if (TradingState.data.candleInterval) {
        clearInterval(TradingState.data.candleInterval);
    }
    
    // Update candle every 500ms for smooth animation
    TradingState.data.candleInterval = setInterval(() => {
        if (TradingState.data.currentCandle && TradingState.data.currentCandle.isActive) {
            updateCurrentCandle();
        }
    }, 500);
}

// Update live price display
function updateLivePrice(price) {
    const livePriceElement = document.getElementById('livePrice');
    if (livePriceElement) {
        livePriceElement.textContent = `$${price.toFixed(2)}`;
        
        // Add color effect
        if (TradingState.data.currentCandle) {
            const isUp = price >= TradingState.data.currentCandle.open;
            livePriceElement.style.color = isUp ? '#00ff00' : '#ff0000';
            livePriceElement.style.borderColor = isUp ? '#00ff00' : '#ff0000';
        }
    }
}

// Initialize betting system
function initializeBetting() {
    console.log('💰 Initializing betting system...');
    
    // Amount buttons
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Update UI
            document.querySelectorAll('.amount-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            
            // Update amount
            TradingState.data.selectedAmount = parseInt(this.dataset.amount);
            
            // Update summary
            updateBetSummary();
            
            console.log(`Amount selected: $${TradingState.data.selectedAmount}`);
        });
    });
    
    // Color buttons
    document.getElementById('redBtn').addEventListener('click', function(e) {
        e.preventDefault();
        selectColor('red');
    });
    
    document.getElementById('greenBtn').addEventListener('click', function(e) {
        e.preventDefault();
        selectColor('green');
    });
    
    // Place bet button
    document.getElementById('placeBetBtn').addEventListener('click', function(e) {
        e.preventDefault();
        placeBet();
    });
    
    // Cancel bet button
    document.getElementById('cancelBetBtn').addEventListener('click', function(e) {
        e.preventDefault();
        cancelBet();
    });
    
    // Custom bet input
    document.getElementById('customBet').addEventListener('input', function(e) {
        const value = parseInt(e.target.value);
        if (value && value > 0) {
            TradingState.data.selectedAmount = Math.min(value, 10000);
            updateBetSummary();
        }
    });
    
    // Enter key for custom bet
    document.getElementById('customBet').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            setCustomBet();
        }
    });
    
    // Auto select first amount
    const firstAmountBtn = document.querySelector('.amount-btn');
    if (firstAmountBtn) {
        firstAmountBtn.click();
    }
    
    console.log('✅ Betting system initialized');
}

// Select color
function selectColor(color) {
    if (!TradingState.data.canBet) {
        showToast('Betting is closed for this round', 'error');
        return;
    }
    
    TradingState.data.selectedColor = color;
    
    // Update UI
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    
    const selectedBtn = color === 'red' ? document.getElementById('redBtn') : document.getElementById('greenBtn');
    selectedBtn.classList.add('active');
    selectedBtn.setAttribute('aria-pressed', 'true');
    
    // Update summary
    document.getElementById('selectedColor').textContent = color.toUpperCase();
    document.getElementById('selectedColor').style.color = color === 'red' ? '#ff0000' : '#00ff00';
    
    // Enable place bet button
    const placeBetBtn = document.getElementById('placeBetBtn');
    placeBetBtn.disabled = false;
    placeBetBtn.setAttribute('aria-label', `Place bet on ${color}`);
    
    // Update summary
    updateBetSummary();
    
    // Play sound
    if (TradingState.data.soundEnabled) {
        playSound('bet');
    }
    
    showToast(`${color.toUpperCase()} selected`, 'info');
}

// Update bet summary
function updateBetSummary() {
    if (!TradingState.data.selectedAmount) return;
    
    const amount = TradingState.data.selectedAmount;
    const potentialWin = amount * 1.9;
    const potentialLoss = amount;
    
    // Update display
    document.getElementById('betAmount').textContent = amount.toFixed(2);
    document.getElementById('potentialWin').textContent = potentialWin.toFixed(2);
    document.getElementById('potentialLoss').textContent = potentialLoss.toFixed(2);
    
    // Update risk level
    const riskLevel = amount > TradingState.user.balance * 0.5 ? 'HIGH' : 
                     amount > TradingState.user.balance * 0.2 ? 'MEDIUM' : 'LOW';
    document.getElementById('riskLevel').textContent = riskLevel;
    document.getElementById('riskLevel').style.color = 
        riskLevel === 'HIGH' ? '#ff0000' : 
        riskLevel === 'MEDIUM' ? '#ffff00' : '#00ff00';
}

// Set custom bet amount
function setCustomBet() {
    const input = document.getElementById('customBet');
    const amount = parseInt(input.value) || 5;
    
    // Validation
    if (amount < 1) {
        showToast('Minimum bet is $1', 'error');
        input.value = '1';
        return;
    }
    
    if (amount > 10000) {
        showToast('Maximum bet is $10,000', 'error');
        input.value = '10000';
        return;
    }
    
    if (amount > TradingState.user.balance) {
        showToast('Insufficient balance', 'error');
        return;
    }
    
    TradingState.data.selectedAmount = amount;
    
    // Update amount buttons UI
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    
    // Update summary
    updateBetSummary();
    
    showToast(`Custom bet set to $${amount}`, 'success');
}

// Quick bet actions
function quickBet(action) {
    if (!TradingState.user || !TradingState.user.balance) return;
    
    let amount = TradingState.data.selectedAmount;
    
    switch(action) {
        case 'half':
            amount = Math.floor(TradingState.user.balance / 2);
            break;
        case 'double':
            amount = Math.min(TradingState.data.selectedAmount * 2, TradingState.user.balance);
            break;
        case 'max':
            amount = TradingState.user.balance;
            break;
    }
    
    // Update input
    document.getElementById('customBet').value = amount;
    setCustomBet();
}

// Place bet
function placeBet() {
    if (!TradingState.data.canBet) {
        showToast('Betting is closed for this round', 'error');
        return;
    }
    
    if (!TradingState.data.selectedColor) {
        showToast('Please select a color first', 'error');
        return;
    }
    
    const amount = TradingState.data.selectedAmount;
    
    // Check balance
    if (amount > TradingState.user.balance) {
        showToast('Insufficient balance', 'error');
        return;
    }
    
    // Check minimum bet
    if (amount < 1) {
        showToast('Minimum bet is $1', 'error');
        return;
    }
    
    // Deduct amount from balance
    TradingState.user.balance -= amount;
    localStorage.setItem('user_' + TradingState.user.uid, JSON.stringify(TradingState.user));
    updateBalance();
    
    // Create active bet
    TradingState.activeBet = {
        color: TradingState.data.selectedColor,
        amount: amount,
        round: TradingState.data.currentRound,
        timestamp: new Date(),
        candleIndex: TradingState.data.currentCandle ? TradingState.data.currentCandle.index : 0,
        status: 'pending'
    };
    
    // Update UI
    document.getElementById('placeBetBtn').style.display = 'none';
    document.getElementById('cancelBetBtn').style.display = 'block';
    document.getElementById('activeBets').textContent = '1';
    
    // Play sound
    if (TradingState.data.soundEnabled) {
        playSound('bet');
    }
    
    showToast(`Bet placed: $${amount} on ${TradingState.data.selectedColor.toUpperCase()}`, 'success');
    
    console.log(`Bet placed: $${amount} on ${TradingState.data.selectedColor}`);
}

// Cancel bet
function cancelBet() {
    if (!TradingState.activeBet) {
        showToast('No active bet to cancel', 'error');
        return;
    }
    
    // Return money
    TradingState.user.balance += TradingState.activeBet.amount;
    localStorage.setItem('user_' + TradingState.user.uid, JSON.stringify(TradingState.user));
    updateBalance();
    
    // Reset UI
    document.getElementById('placeBetBtn').style.display = 'block';
    document.getElementById('cancelBetBtn').style.display = 'none';
    document.getElementById('activeBets').textContent = '0';
    
    // Clear active bet
    TradingState.activeBet = null;
    
    showToast('Bet canceled successfully', 'success');
}

// Process bets at round end
function processBets(winningColor) {
    if (!TradingState.activeBet) return;
    
    const bet = TradingState.activeBet;
    let result = '';
    let profit = 0;
    
    if (bet.color === winningColor) {
        // WIN
        profit = bet.amount * 1.9;
        TradingState.user.balance += profit;
        result = 'win';
        
        // Show win modal
        showResultModal(true, profit, winningColor);
        
        // Play win sound
        if (TradingState.data.soundEnabled) {
            playSound('win');
        }
    } else {
        // LOSS
        profit = -bet.amount;
        result = 'loss';
        
        // Show loss modal
        showResultModal(false, bet.amount, winningColor);
        
        // Play lose sound
        if (TradingState.data.soundEnabled) {
            playSound('lose');
        }
    }
    
    // Update balance
    localStorage.setItem('user_' + TradingState.user.uid, JSON.stringify(TradingState.user));
    updateBalance();
    
    // Add to history
    addTradeHistory({
        time: bet.timestamp,
        round: bet.round,
        color: bet.color,
        amount: bet.amount,
        result: result,
        profit: profit,
        winningColor: winningColor,
        candleIndex: bet.candleIndex,
        status: 'completed'
    });
    
    // Clear active bet
    TradingState.activeBet = null;
    document.getElementById('placeBetBtn').style.display = 'block';
    document.getElementById('cancelBetBtn').style.display = 'none';
    document.getElementById('activeBets').textContent = '0';
}

// Update balance display
function updateBalance() {
    if (!TradingState.user) return;
    
    const balance = TradingState.user.balance.toFixed(2);
    document.getElementById('mainBalance').textContent = balance;
    document.getElementById('sidebarBalance').textContent = balance;
}

// Update round number
function updateRoundNumber() {
    document.getElementById('roundNumber').textContent = `#${TradingState.data.currentRound}`;
}

// Initialize recent results
function initializeRecentResults() {
    // Generate initial results
    for (let i = 0; i < 20; i++) {
        const color = Math.random() > 0.5 ? 'red' : 'green';
        TradingState.data.recentResults.push(color);
    }
    
    updateRecentResultsUI();
    updateStatistics();
}

// Add recent result
function addRecentResult(color) {
    TradingState.data.recentResults.push(color);
    
    // Keep only last 50 results
    if (TradingState.data.recentResults.length > 50) {
        TradingState.data.recentResults.shift();
    }
    
    updateRecentResultsUI();
    updateStatistics();
}

// Update recent results UI
function updateRecentResultsUI() {
    const container = document.getElementById('resultsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Show last 20 results
    const lastResults = TradingState.data.recentResults.slice(-20);
    
    lastResults.forEach((color, index) => {
        const chip = document.createElement('div');
        chip.className = `result-chip ${color}`;
        chip.textContent = color === 'red' ? 'R' : 'G';
        chip.title = `${color.toUpperCase()} - #${index + 1}`;
        chip.setAttribute('aria-label', `${color} result`);
        
        chip.addEventListener('click', function() {
            selectColor(color);
        });
        
        container.appendChild(chip);
    });
}

// Update statistics
function updateStatistics() {
    const totalResults = TradingState.data.recentResults.length;
    if (totalResults === 0) return;
    
    const redWins = TradingState.data.recentResults.filter(c => c === 'red').length;
    const greenWins = TradingState.data.recentResults.filter(c => c === 'green').length;
    const winRate = Math.max(redWins, greenWins) / totalResults * 100;
    
    // Update display
    document.getElementById('redWins').textContent = redWins;
    document.getElementById('greenWins').textContent = greenWins;
    document.getElementById('winRate').textContent = `${winRate.toFixed(1)}%`;
    
    // Update color trends
    updateColorTrends();
}

// Update color trends
function updateColorTrends() {
    const lastResults = TradingState.data.recentResults.slice(-5);
    const redCount = lastResults.filter(c => c === 'red').length;
    const greenCount = lastResults.filter(c => c === 'green').length;
    
    document.getElementById('redCount').textContent = redCount;
    document.getElementById('greenCount').textContent = greenCount;
    
    // Update trend arrows
    const redTrend = document.getElementById('redTrend');
    const greenTrend = document.getElementById('greenTrend');
    
    if (redCount > greenCount) {
        redTrend.className = 'fas fa-arrow-up';
        redTrend.style.color = '#00ff00';
        greenTrend.className = 'fas fa-arrow-down';
        greenTrend.style.color = '#ff0000';
    } else if (greenCount > redCount) {
        greenTrend.className = 'fas fa-arrow-up';
        greenTrend.style.color = '#00ff00';
        redTrend.className = 'fas fa-arrow-down';
        redTrend.style.color = '#ff0000';
    } else {
        redTrend.className = 'fas fa-minus';
        redTrend.style.color = '#888888';
        greenTrend.className = 'fas fa-minus';
        greenTrend.style.color = '#888888';
    }
}

// Clear recent results
function clearResults() {
    if (confirm('Are you sure you want to clear all recent results?')) {
        TradingState.data.recentResults = [];
        updateRecentResultsUI();
        updateStatistics();
        showToast('Recent results cleared', 'success');
    }
}

// Generate AI prediction
function generateAIPrediction() {
    const predictions = ['RED', 'GREEN', 'ANALYZING...', 'TREND: UP', 'TREND: DOWN'];
    const randomPrediction = predictions[Math.floor(Math.random() * predictions.length)];
    
    document.getElementById('aiPrediction').textContent = randomPrediction;
    document.getElementById('aiPrediction').style.color = 
        randomPrediction === 'RED' ? '#ff0000' : 
        randomPrediction === 'GREEN' ? '#00ff00' : '#00ffea';
}

// Load trade history
function loadTradeHistory() {
    try {
        const storedHistory = localStorage.getItem('tradeHistory_' + TradingState.user.uid);
        
        if (storedHistory) {
            TradingState.data.tradeHistory = JSON.parse(storedHistory);
        } else {
            // Generate demo history for new users
            TradingState.data.tradeHistory = generateDemoHistory();
            localStorage.setItem('tradeHistory_' + TradingState.user.uid, 
                JSON.stringify(TradingState.data.tradeHistory));
        }
        
        updateHistoryTable();
        
    } catch (error) {
        console.error('Error loading trade history:', error);
        TradingState.data.tradeHistory = [];
    }
}

// Generate demo history
function generateDemoHistory() {
    const history = [];
    const colors = ['red', 'green'];
    
    for (let i = 0; i < 8; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const winningColor = colors[Math.floor(Math.random() * colors.length)];
        const result = color === winningColor ? 'win' : 'loss';
        const amount = [5, 10, 50, 100, 500][Math.floor(Math.random() * 5)];
        const profit = result === 'win' ? amount * 1.9 : -amount;
        
        const date = new Date();
        date.setMinutes(date.getMinutes() - Math.random() * 120);
        
        history.push({
            time: date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            round: 1000 + i,
            color: color,
            amount: amount,
            result: result,
            profit: profit,
            winningColor: winningColor,
            status: 'completed'
        });
    }
    
    return history;
}

// Add trade to history
function addTradeHistory(trade) {
    const historyItem = {
        time: trade.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        round: trade.round,
        color: trade.color,
        amount: trade.amount,
        result: trade.result,
        profit: trade.profit,
        winningColor: trade.winningColor,
        candleIndex: trade.candleIndex,
        status: trade.status
    };
    
    TradingState.data.tradeHistory.unshift(historyItem);
    
    // Keep only last 100 trades
    if (TradingState.data.tradeHistory.length > 100) {
        TradingState.data.tradeHistory.pop();
    }
    
    // Save to localStorage
    localStorage.setItem('tradeHistory_' + TradingState.user.uid, 
        JSON.stringify(TradingState.data.tradeHistory));
    
    updateHistoryTable();
}

// Update history table
function updateHistoryTable() {
    const tbody = document.getElementById('historyBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!TradingState.data.tradeHistory || TradingState.data.tradeHistory.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">
                    <i class="fas fa-history"></i> No trading history yet
                </td>
            </tr>
        `;
        return;
    }
    
    TradingState.data.tradeHistory.forEach((trade, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${trade.time}</td>
            <td>#${trade.round}</td>
            <td>
                <span class="color-indicator ${trade.color}" aria-label="${trade.color}"></span>
                ${trade.color.toUpperCase()}
            </td>
            <td>$${trade.amount.toFixed(2)}</td>
            <td class="${trade.result === 'win' ? 'result-win' : 'result-loss'}">
                ${trade.result.toUpperCase()}
            </td>
            <td class="${trade.profit >= 0 ? 'result-win' : 'result-loss'}">
                ${trade.profit >= 0 ? '+' : ''}$${trade.profit.toFixed(2)}
            </td>
            <td>
                <span class="status-badge status-${trade.result === 'win' ? 'won' : 'lost'}">
                    ${trade.result.toUpperCase()}
                </span>
            </td>
            <td>
                <button class="btn-action" onclick="viewTradeDetails(${index})" aria-label="View details">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Filter history
function filterHistory(filter) {
    const rows = document.querySelectorAll('#historyBody tr');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Update active button
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    
    event.target.classList.add('active');
    event.target.setAttribute('aria-pressed', 'true');
    
    // Filter rows
    let visibleCount = 0;
    rows.forEach(row => {
        if (row.classList.contains('no-data')) {
            row.style.display = 'none';
            return;
        }
        
        const resultClass = row.querySelector('.status-badge').className;
        
        switch(filter) {
            case 'all':
                row.style.display = '';
                visibleCount++;
                break;
            case 'win':
                row.style.display = resultClass.includes('status-won') ? '' : 'none';
                if (resultClass.includes('status-won')) visibleCount++;
                break;
            case 'loss':
                row.style.display = resultClass.includes('status-lost') ? '' : 'none';
                if (resultClass.includes('status-lost')) visibleCount++;
                break;
            case 'pending':
                row.style.display = resultClass.includes('status-pending') ? '' : 'none';
                if (resultClass.includes('status-pending')) visibleCount++;
                break;
        }
    });
    
    // Show message if no results
    if (visibleCount === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">
                    <i class="fas fa-filter"></i> No ${filter} trades found
                </td>
            </tr>
        `;
    }
}

// Search history
function searchHistory() {
    const searchTerm = document.getElementById('historySearch').value.toLowerCase();
    const rows = document.querySelectorAll('#historyBody tr');
    
    let foundCount = 0;
    
    rows.forEach(row => {
        if (row.classList.contains('no-data')) {
            row.style.display = 'none';
            return;
        }
        
        const rowText = row.textContent.toLowerCase();
        if (rowText.includes(searchTerm)) {
            row.style.display = '';
            foundCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    if (foundCount === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">
                    <i class="fas fa-search"></i> No results found for "${searchTerm}"
                </td>
            </tr>
        `;
    }
}

// Export history
function exportHistory() {
    if (!TradingState.data.tradeHistory.length) {
        showToast('No history to export', 'warning');
        return;
    }
    
    const csv = convertToCSV(TradingState.data.tradeHistory);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `trading_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast('History exported successfully', 'success');
}

// Convert to CSV
function convertToCSV(data) {
    const headers = ['Time', 'Round', 'Color', 'Amount', 'Result', 'Profit/Loss', 'Status'];
    const rows = data.map(item => [
        item.time,
        item.round,
        item.color.toUpperCase(),
        `$${item.amount.toFixed(2)}`,
        item.result.toUpperCase(),
        `${item.profit >= 0 ? '+' : ''}$${item.profit.toFixed(2)}`,
        item.status.toUpperCase()
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// View trade details
function viewTradeDetails(index) {
    const trade = TradingState.data.tradeHistory[index];
    if (!trade) return;
    
    const details = `
        <strong>Trade Details:</strong><br>
        Time: ${trade.time}<br>
        Round: #${trade.round}<br>
        Color: ${trade.color.toUpperCase()}<br>
        Amount: $${trade.amount.toFixed(2)}<br>
        Result: ${trade.result.toUpperCase()}<br>
        P/L: ${trade.profit >= 0 ? '+' : ''}$${trade.profit.toFixed(2)}<br>
        Winning Color: ${trade.winningColor.toUpperCase()}
    `;
    
    showToast(details, 'info', 5000);
}

// Pagination functions
function prevPage() {
    // Implementation for pagination
    console.log('Previous page');
}

function nextPage() {
    // Implementation for pagination
    console.log('Next page');
}

// Show result modal
function showResultModal(isWin, amount, winningColor) {
    const modal = document.getElementById('resultModal');
    const content = document.getElementById('resultContent');
    
    if (isWin) {
        content.className = 'result-content win-result';
        content.innerHTML = `
            <div class="result-icon">
                <i class="fas fa-trophy"></i>
            </div>
            <div class="result-title" style="color: #00ff00">VICTORY!</div>
            <div class="result-message">Correct prediction! ${winningColor.toUpperCase()} won!</div>
            <div class="result-amount win-amount">+$${amount.toFixed(2)}</div>
            <div style="color: #888; font-size: 14px; margin-bottom: 20px;">
                Round #${TradingState.data.currentRound} • Winning Color: 
                <span style="color: ${winningColor === 'red' ? '#ff0000' : '#00ff00'}; font-weight: bold;">
                    ${winningColor.toUpperCase()}
                </span>
            </div>
            <button class="btn-continue" onclick="closeResultModal()" aria-label="Continue trading">
                CONTINUE TRADING <i class="fas fa-arrow-right"></i>
            </button>
        `;
    } else {
        content.className = 'result-content loss-result';
        content.innerHTML = `
            <div class="result-icon">
                <i class="fas fa-times-circle"></i>
            </div>
            <div class="result-title" style="color: #ff0000">BETTER LUCK NEXT TIME!</div>
            <div class="result-message">Winning color was ${winningColor.toUpperCase()}</div>
            <div class="result-amount loss-amount">-$${amount.toFixed(2)}</div>
            <div style="color: #888; font-size: 14px; margin-bottom: 20px;">
                Round #${TradingState.data.currentRound} • Try predicting 
                <span style="color: ${winningColor === 'red' ? '#ff0000' : '#00ff00'}; font-weight: bold;">
                    ${winningColor.toUpperCase()}
                </span> next time!
            </div>
            <button class="btn-continue" onclick="closeResultModal()" aria-label="Try again">
                TRY AGAIN <i class="fas fa-redo"></i>
            </button>
        `;
    }
    
    modal.style.display = 'flex';
    
    // Auto close after 5 seconds
    setTimeout(closeResultModal, 5000);
}

// Close result modal
function closeResultModal() {
    document.getElementById('resultModal').style.display = 'none';
}

// Initialize help modal
function initializeHelpModal() {
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    
    helpBtn.addEventListener('click', function() {
        helpModal.style.display = 'flex';
    });
    
    // Close on background click
    helpModal.addEventListener('click', function(e) {
        if (e.target === helpModal) {
            closeHelpModal();
        }
    });
    
    // Close on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && helpModal.style.display === 'flex') {
            closeHelpModal();
        }
    });
}

// Close help modal
function closeHelpModal() {
    document.getElementById('helpModal').style.display = 'none';
}

// Start trading cycle
function startTradingCycle() {
    // Initial update
    updateLiveTraders();
    
    // Update live traders count every 10 seconds
    setInterval(updateLiveTraders, 10000);
}

// Update live traders count
function updateLiveTraders() {
    const current = parseInt(document.getElementById('liveTradersCount').textContent) || 1247;
    const change = Math.floor((Math.random() - 0.3) * 30); // More positive bias
    const newCount = Math.max(1000, current + change);
    
    document.getElementById('liveTradersCount').textContent = newCount;
}

// Play sound
function playSound(type) {
    if (!TradingState.data.soundEnabled) return;
    
    const sound = TradingState.sounds[type];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Sound play failed:', e));
    }
}

// Show toast notification
function showToast(message, type = 'info', duration = 3000) {
    Toastify({
        text: message,
        duration: duration,
        gravity: "top",
        position: "right",
        backgroundColor: type === 'error' ? "#ff0000" : 
                       type === 'success' ? "#00ff00" : 
                       type === 'warning' ? "#ffff00" : "#00ffea",
        className: "toast",
        stopOnFocus: true
    }).showToast();
}

// Initialize event listeners
function initializeEventListeners() {
    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Prevent form submission
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', e => e.preventDefault());
    });
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('.trading-main');
    const toggleBtn = document.getElementById('sidebarToggle');
    
    if (sidebar.style.transform === 'translateX(-100%)') {
        sidebar.style.transform = 'translateX(0)';
        main.style.marginLeft = '250px';
        toggleBtn.innerHTML = '<i class="fas fa-times"></i>';
        toggleBtn.setAttribute('aria-label', 'Close sidebar');
    } else {
        sidebar.style.transform = 'translateX(-100%)';
        main.style.marginLeft = '0';
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        toggleBtn.setAttribute('aria-label', 'Open sidebar');
    }
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Don't trigger if user is typing
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key.toLowerCase()) {
        case '1':
            document.querySelector('.amount-btn[data-amount="5"]')?.click();
            break;
        case '2':
            document.querySelector('.amount-btn[data-amount="10"]')?.click();
            break;
        case '3':
            document.querySelector('.amount-btn[data-amount="50"]')?.click();
            break;
        case 'r':
            document.getElementById('redBtn')?.click();
            break;
        case 'g':
            document.getElementById('greenBtn')?.click();
            break;
        case 'enter':
            if (!document.getElementById('placeBetBtn').disabled) {
                document.getElementById('placeBetBtn')?.click();
            }
            break;
        case 'escape':
            if (document.getElementById('cancelBetBtn').style.display !== 'none') {
                document.getElementById('cancelBetBtn')?.click();
            }
            break;
        case 'h':
            document.getElementById('helpBtn')?.click();
            break;
        case 'p':
            document.getElementById('pauseTimer')?.click();
            break;
    }
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Unhandled error:', e.error);
    showToast('An error occurred. Please refresh the page.', 'error');
});

// Log initialization
console.log('🎯 Enhanced Trading Platform Loaded Successfully');
console.log('📊 Features:');
console.log('• Real-time candlestick chart');
console.log('• Live betting with sound effects');
console.log('• Complete trade history');
console.log('• Statistics and AI predictions');
console.log('• Keyboard shortcuts');
console.log('• Responsive design');