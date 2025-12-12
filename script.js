// Loading Screen
window.addEventListener('load', function() {
    setTimeout(function() {
        document.getElementById('loadingScreen').style.opacity = '0';
        setTimeout(function() {
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('mainContainer').style.display = 'block';
            initializePage();
        }, 500);
    }, 2000);
});

function initializePage() {
    // Animated Numbers
    animateNumber('liveTraders', 0, 1247, 2000);
    animateNumber('totalVolume', 0, 124567, 2500);
    animateNumber('winRate', 0, 68, 1500);
    
    // Initialize Chart
    initializeChart();
    
    // Trading Buttons Interaction
    setupTradingButtons();
}

function animateNumber(elementId, start, end, duration) {
    let element = document.getElementById(elementId);
    let startTime = null;
    
    function updateNumber(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = timestamp - startTime;
        let percentage = Math.min(progress / duration, 1);
        
        let current = Math.floor(percentage * (end - start) + start);
        element.textContent = current.toLocaleString();
        
        if (percentage < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function initializeChart() {
    const ctx = document.getElementById('previewChart').getContext('2d');
    
    // Generate random chart data
    let data = [];
    let value = 100;
    
    for (let i = 0; i < 50; i++) {
        value += (Math.random() - 0.5) * 20;
        value = Math.max(80, Math.min(120, value));
        data.push(value);
    }
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(0, 255, 234, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 255, 234, 0.1)');
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 50}, (_, i) => i + 1),
            datasets: [{
                label: 'PRICE',
                data: data,
                borderColor: '#00ffea',
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false,
                    beginAtZero: false
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
            }
        }
    });
    
    // Update chart every 5 seconds
    setInterval(() => {
        let lastValue = chart.data.datasets[0].data[chart.data.datasets[0].data.length - 1];
        let newValue = lastValue + (Math.random() - 0.5) * 10;
        newValue = Math.max(80, Math.min(120, newValue));
        
        chart.data.datasets[0].data.push(newValue);
        chart.data.datasets[0].data.shift();
        
        chart.update('none');
    }, 5000);
}

function setupTradingButtons() {
    // Time buttons
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Amount buttons
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Trade buttons
    document.querySelectorAll('.btn-trade').forEach(btn => {
        btn.addEventListener('click', function() {
            const color = this.classList.contains('red') ? 'RED' : 'GREEN';
            const amount = document.querySelector('.amount-btn.active')?.textContent || 
                          document.querySelector('.custom-amount').value || '5';
            
            // Show trade notification
            showTradeNotification(color, amount);
        });
    });
}

function showTradeNotification(color, amount) {
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'trade-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-bolt"></i>
            <div>
                <h4>TRADE EXECUTED</h4>
                <p>${amount} on ${color}</p>
            </div>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${color === 'RED' ? 'rgba(255,0,0,0.9)' : 'rgba(0,255,0,0.9)'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 1000;
        animation: slideIn 0.5s ease-out;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    `;
    
    // Add keyframes for animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease-out forwards';
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 500);
    }, 3000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add floating particles
    createFloatingParticles();
    
    // Add mouse trail effect
    document.addEventListener('mousemove', function(e) {
        createMouseTrail(e);
    });
});

function createFloatingParticles() {
    const colors = ['#00ffea', '#ff00ff', '#ffff00', '#ff5500'];
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        
        const size = Math.random() * 5 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
            left: ${Math.random() * 100}vw;
            top: ${Math.random() * 100}vh;
            opacity: ${Math.random() * 0.5 + 0.1};
            animation: float-particle ${Math.random() * 10 + 10}s infinite linear;
        `;
        
        const keyframes = `
            @keyframes float-particle {
                0% {
                    transform: translate(0, 0) rotate(0deg);
                    opacity: ${Math.random() * 0.5 + 0.1};
                }
                25% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(90deg);
                }
                50% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(180deg);
                    opacity: ${Math.random() * 0.5 + 0.1};
                }
                75% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(270deg);
                }
                100% {
                    transform: translate(0, 0) rotate(360deg);
                    opacity: ${Math.random() * 0.5 + 0.1};
                }
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = keyframes;
        document.head.appendChild(style);
        
        document.body.appendChild(particle);
    }
}

function createMouseTrail(e) {
    const trail = document.createElement('div');
    trail.className = 'mouse-trail';
    
    trail.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: #00ffea;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        left: ${e.clientX - 4}px;
        top: ${e.clientY - 4}px;
        opacity: 0.7;
    `;
    
    document.body.appendChild(trail);
    
    // Fade out and remove
    setTimeout(() => {
        trail.style.transition = 'opacity 0.5s';
        trail.style.opacity = '0';
        setTimeout(() => trail.remove(), 500);
    }, 100);
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // R for Red trade
    if (e.key === 'r' || e.key === 'R') {
        const redBtn = document.querySelector('.btn-trade.red');
        if (redBtn) redBtn.click();
    }
    
    // G for Green trade
    if (e.key === 'g' || e.key === 'G') {
        const greenBtn = document.querySelector('.btn-trade.green');
        if (greenBtn) greenBtn.click();
    }
    
    // Space for custom amount
    if (e.key === ' ') {
        const customAmount = document.querySelector('.custom-amount');
        if (customAmount) customAmount.focus();
    }
});