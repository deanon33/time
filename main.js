// Main application class
class IranLiveApp {
    constructor() {
        // Initialize properties
        this.isInitialized = false;
        this.startTime = Date.now();
        this.updateInterval = 1000; // 1 second
        this.weatherUpdateInterval = 10 * 60 * 1000; // 10 minutes
        this.themeUpdateInterval = 60 * 1000; // 1 minute
        
        // Core components
        this.persianCalendar = null;
        this.weatherAPI = null;
        this.specialEvents = null;
        this.themeManager = null;
        this.enhancedFeatures = null;
        
        // Update intervals
        this.clockInterval = null;
        this.weatherInterval = null;
        this.themeInterval = null;
        
        // Performance counters
        this.updateCounter = 0;
        this.weatherUpdateCounter = 0;
        this.themeChangeCounter = 0;
        this.errorCount = 0;
        
        // Revolutionary UI elements
        this.particleCanvas = null;
        this.weatherCanvas = null;
        this.quantumTooltip = document.getElementById('quantum-tooltip');
        
        console.log('🌟 Iran Live App constructor initialized');
    }

    // Initialize the application
    async init() {
        try {
            console.log('🚀 Initializing Iran Live Website...');
            
            // Show loading with progress
            this.showLoading();
            
            // Initialize components step by step
            await this.initializeComponents();
            this.animateLoadingProgress(40);
            
            // Start real-time updates
            this.startRealTimeUpdates();
            this.animateLoadingProgress(70);
            
            // Start background processes
            this.startBackgroundProcesses();
            this.animateLoadingProgress(90);
            
            // Final setup
            await this.delay(500); // Give time for everything to load
            this.animateLoadingProgress(100);
            
            // Hide loading screen
            this.hideLoading();
            
            this.isInitialized = true;
            console.log('✅ Iran Live Website initialized successfully');
            
            // Log performance
            const loadTime = Date.now() - this.startTime;
            console.log(`📊 Load time: ${loadTime}ms`);
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.handleInitializationError(error);
        }
    }

    // Initialize all core components
    async initializeComponents() {
        try {
            console.log('🔧 Initializing core components...');
            
            // Initialize Persian Calendar
            this.persianCalendar = new PersianCalendar();
            console.log('📅 Persian Calendar initialized');

            // Initialize Weather API
            this.weatherAPI = new WeatherAPI();
            await this.weatherAPI.init();
            console.log('🌤️ Weather API initialized');

            // Initialize Special Events
            this.specialEvents = new SpecialEvents();
            this.specialEvents.init(this.persianCalendar);
            console.log('🎉 Special Events initialized');

            // Initialize Theme Manager
            this.themeManager = new ThemeManager();
            this.themeManager.init(this.persianCalendar, this.weatherAPI, this.specialEvents);
            console.log('🎨 Theme Manager initialized');

            // Initialize Enhanced Features
            this.enhancedFeatures = new EnhancedFeatures();
            console.log('✨ Enhanced Features initialized');
            
            // Initialize interactive features
            this.initializeInteractiveFeatures();
            console.log('🎮 Interactive features initialized');
            
        } catch (error) {
            console.error('❌ Component initialization failed:', error);
            throw error;
        }
    }

    // Start real-time updates
    startRealTimeUpdates() {
        try {
            console.log('⏰ Starting real-time updates...');
            
            // Update clock every second
            this.clockInterval = setInterval(() => {
                this.updateClock();
            }, this.updateInterval);

            // Initial updates
            this.updateClock();
            this.updateDate();
            this.createParticleSystem();
            
            console.log('⏰ Real-time updates started');
            
        } catch (error) {
            console.error('❌ Failed to start real-time updates:', error);
        }
    }

    // Start background processes
    startBackgroundProcesses() {
        try {
            console.log('🔄 Starting background processes...');
            
            // Weather updates every 10 minutes
            this.weatherInterval = setInterval(() => {
                if (this.weatherAPI) {
                    this.weatherAPI.fetchWeatherData();
                    this.weatherUpdateCounter++;
                }
            }, this.weatherUpdateInterval);

            // Theme updates every minute
            this.themeInterval = setInterval(() => {
                if (this.themeManager) {
                    this.themeManager.updateTheme();
                    this.themeChangeCounter++;
                }
            }, this.themeUpdateInterval);
            
            console.log('🔄 Background processes started');
            
        } catch (error) {
            console.error('❌ Failed to start background processes:', error);
        }
    }

    // Update the clock display
    updateClock() {
        try {
            if (!this.persianCalendar) return;
            
            const iranTime = this.persianCalendar.getIranTime();
            
            // Update time display
            this.updateTimeDisplay(iranTime);
            
            // Update time period
            this.updateTimePeriod(iranTime);
            
            this.updateCounter++;
            
        } catch (error) {
            console.error('❌ Clock update failed:', error);
            this.errorCount++;
        }
    }

    // Update time display elements
    updateTimeDisplay(time) {
        try {
            const hours = String(time.getHours()).padStart(2, '0');
            const minutes = String(time.getMinutes()).padStart(2, '0');
            const seconds = String(time.getSeconds()).padStart(2, '0');

            // Update digital display
            const hoursElement = document.querySelector('.digital-time .hours');
            const minutesElement = document.querySelector('.digital-time .minutes');
            const secondsElement = document.querySelector('.digital-time .seconds');

            if (hoursElement) hoursElement.textContent = hours;
            if (minutesElement) minutesElement.textContent = minutes;
            if (secondsElement) secondsElement.textContent = seconds;

            // Update analog hands
            this.updateAnalogHands(time);
            
        } catch (error) {
            console.error('❌ Time display update failed:', error);
        }
    }

    // Update analog clock hands
    updateAnalogHands(time) {
        try {
            const hourHand = document.getElementById('hour-hand');
            const minuteHand = document.getElementById('minute-hand');
            const secondHand = document.getElementById('second-hand');
            
            if (hourHand && minuteHand && secondHand) {
                // Calculate angles
                const hours = time.getHours() % 12;
                const minutes = time.getMinutes();
                const seconds = time.getSeconds();
                
                const hourAngle = (hours * 30) + (minutes * 0.5); // 30 degrees per hour + minute adjustment
                const minuteAngle = minutes * 6; // 6 degrees per minute
                const secondAngle = seconds * 6; // 6 degrees per second
                
                // Apply rotations
                hourHand.style.transform = `rotate(${hourAngle}deg)`;
                minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
                secondHand.style.transform = `rotate(${secondAngle}deg)`;
            }
            
            // Generate hour dots if not exists
            this.generateHourDots();
            
        } catch (error) {
            console.error('❌ Analog hands update failed:', error);
        }
    }

    // Generate hour dots on clock face
    generateHourDots() {
        try {
            const hourDotsContainer = document.querySelector('.hour-dots');
            if (hourDotsContainer && hourDotsContainer.children.length === 0) {
                for (let i = 0; i < 12; i++) {
                    const dot = document.createElement('div');
                    dot.className = 'hour-dot';
                    const angle = i * 30; // 30 degrees per hour
                    dot.style.transform = `rotate(${angle}deg) translateY(-130px)`;
                    hourDotsContainer.appendChild(dot);
                }
            }
        } catch (error) {
            console.error('❌ Hour dots generation failed:', error);
        }
    }

    // Update time period indicator
    updateTimePeriod(time) {
        try {
            const hour = time.getHours();
            let period = '';
            let icon = 'fas fa-sun';
            
            if (hour >= 5 && hour < 8) {
                period = 'سپیده‌دم';
                icon = 'fas fa-cloud-sun';
            } else if (hour >= 8 && hour < 17) {
                period = 'روز';
                icon = 'fas fa-sun';
            } else if (hour >= 17 && hour < 20) {
                period = 'غروب';
                icon = 'fas fa-sun-o';
            } else if (hour >= 20 || hour < 1) {
                period = 'شب';
                icon = 'fas fa-moon';
            } else {
                period = 'نیمه‌شب';
                icon = 'fas fa-moon';
            }

            const periodElement = document.querySelector('.time-period-elegant .period-text');
            const iconElement = document.querySelector('.period-icon i');
            
            if (periodElement) {
                periodElement.textContent = period;
            }
            
            if (iconElement) {
                iconElement.className = icon;
            }
            
        } catch (error) {
            console.error('❌ Time period update failed:', error);
        }
    }

    // Update Persian date display
    updateDate() {
        try {
            if (!this.persianCalendar) return;
            
            const persianDate = this.persianCalendar.getCurrentPersianDate();
            
            // Update day name
            const dayNameElement = document.querySelector('.persian-date .day-name');
            if (dayNameElement) {
                dayNameElement.textContent = persianDate.dayName;
            }

            // Update date numbers
            const dateNumbersElement = document.querySelector('.persian-date .date-numbers');
            if (dateNumbersElement) {
                dateNumbersElement.textContent = `${persianDate.day} ${persianDate.monthName} ${persianDate.year}`;
            }
            
        } catch (error) {
            console.error('❌ Date update failed:', error);
        }
    }

    // Create particle system
    createParticleSystem() {
        try {
            const particleField = document.getElementById('particle-field');
            if (!particleField) return;

            // Clear existing particles
            particleField.innerHTML = '';

            // Create particles
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 10 + 's';
                particle.style.animationDuration = (Math.random() * 20 + 10) + 's';
                particleField.appendChild(particle);
            }
            
        } catch (error) {
            console.error('❌ Particle system creation failed:', error);
        }
    }

    // Show loading screen with animation
    showLoading() {
        try {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'flex';
                loadingScreen.classList.add('active');
            }
            
        } catch (error) {
            console.error('❌ Show loading failed:', error);
        }
    }

    // Hide loading screen with animation
    hideLoading() {
        try {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('fade-out');
                
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    loadingScreen.classList.remove('active', 'fade-out');
                }, 1000);
            }
            
        } catch (error) {
            console.error('❌ Hide loading failed:', error);
        }
    }

    // Animate loading progress
    animateLoadingProgress(percentage) {
        try {
            const progressBar = document.getElementById('loading-progress');
            const loadingText = document.querySelector('.loading-text');
            
            if (progressBar) {
                progressBar.style.width = percentage + '%';
            }
            
            // Update status text
            let statusText = 'در حال بارگذاری...';
            if (percentage >= 40) statusText = 'بارگذاری اجزا...';
            if (percentage >= 70) statusText = 'راه‌اندازی سیستم‌ها...';
            if (percentage >= 90) statusText = 'نهایی‌سازی...';
            if (percentage >= 100) statusText = 'آماده!';
            
            if (loadingText) {
                loadingText.textContent = statusText;
            }
            
        } catch (error) {
            console.error('❌ Loading progress animation failed:', error);
        }
    }

    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Performance monitoring
    getPerformanceMetrics() {
        try {
            const now = Date.now();
            const uptime = now - this.startTime;
            
            return {
                uptime: uptime,
                updateCounter: this.updateCounter,
                weatherUpdateCounter: this.weatherUpdateCounter,
                themeChangeCounter: this.themeChangeCounter,
                errorCount: this.errorCount,
                updatesPerSecond: this.updateCounter / (uptime / 1000),
                memoryUsage: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                } : null
            };
            
        } catch (error) {
            console.error('❌ Performance metrics failed:', error);
            return null;
        }
    }

    // Debug information
    showDebugInfo() {
        try {
            const metrics = this.getPerformanceMetrics();
            const status = this.getStatus();
            
            console.group('🔍 Iran Live Debug Info');
            console.log('📊 Performance:', metrics);
            console.log('⚡ Status:', status);
            console.log('🧩 Components:', {
                persianCalendar: !!this.persianCalendar,
                weatherAPI: !!this.weatherAPI,
                specialEvents: !!this.specialEvents,
                themeManager: !!this.themeManager,
                enhancedFeatures: !!this.enhancedFeatures
            });
            console.groupEnd();
            
            // Show notification if enhanced features available
            if (this.enhancedFeatures) {
                this.enhancedFeatures.showNotification(
                    'Debug Info',
                    `Uptime: ${Math.round(metrics.uptime / 1000)}s, Updates: ${metrics.updateCounter}, Errors: ${metrics.errorCount}`,
                    'info'
                );
            }
            
        } catch (error) {
            console.error('❌ Debug info failed:', error);
        }
    }

    // Refresh all data
    refreshData() {
        try {
            console.log('🔄 Refreshing all data...');
            
            // Update time and date
            this.updateClock();
            this.updateDate();
            
            // Update weather
            if (this.weatherAPI) {
                this.weatherAPI.fetchWeatherData();
            }
            
            // Update prayer times
            if (this.enhancedFeatures) {
                this.enhancedFeatures.updatePrayerTimes();
            }
            
            // Update themes
            if (this.themeManager) {
                this.themeManager.updateTheme();
            }
            
            // Show notification
            if (this.enhancedFeatures) {
                this.enhancedFeatures.showNotification(
                    'بروزرسانی',
                    'تمام اطلاعات با موفقیت بروزرسانی شد',
                    'success'
                );
            }
            
            console.log('✅ Data refresh completed');
            
        } catch (error) {
            console.error('❌ Data refresh failed:', error);
        }
    }

    // Cycle through themes for testing
    cycleThemes() {
        try {
            if (this.themeManager) {
                this.themeManager.cycleThemes();
                console.log('🎨 Theme cycled');
            }
            
        } catch (error) {
            console.error('❌ Theme cycling failed:', error);
        }
    }

    // Handle errors gracefully
    handleError(error, context = '') {
        try {
            this.errorCount++;
            console.error(`❌ Error in ${context}:`, error);
            
            // Show user-friendly error notification
            if (this.enhancedFeatures) {
                this.enhancedFeatures.showNotification(
                    'خطا',
                    'مشکلی در سیستم رخ داده است. در حال تلاش برای حل...',
                    'error'
                );
            }
            
        } catch (err) {
            console.error('❌ Error handler failed:', err);
        }
    }

    // Cleanup resources
    cleanup() {
        try {
            console.log('🧹 Cleaning up resources...');
            
            // Clear intervals
            if (this.clockInterval) clearInterval(this.clockInterval);
            if (this.weatherInterval) clearInterval(this.weatherInterval);
            if (this.themeInterval) clearInterval(this.themeInterval);
            
            // Reset state
            this.isInitialized = false;
            
            console.log('✅ Cleanup completed');
            
        } catch (error) {
            console.error('❌ Cleanup failed:', error);
        }
    }

    // Get application status
    getStatus() {
        return {
            initialized: this.isInitialized,
            uptime: Date.now() - this.startTime,
            errorCount: this.errorCount,
            updateCounter: this.updateCounter,
            weatherUpdateCounter: this.weatherUpdateCounter,
            themeChangeCounter: this.themeChangeCounter,
            components: {
                persianCalendar: !!this.persianCalendar,
                weatherAPI: !!this.weatherAPI,
                specialEvents: !!this.specialEvents,
                themeManager: !!this.themeManager,
                enhancedFeatures: !!this.enhancedFeatures
            }
        };
    }
    
    // Initialize interactive features
    initializeInteractiveFeatures() {
        try {
            // Initialize tooltips
            this.initializeTooltips();
            
            // Initialize settings panel
            this.initializeSettingsPanel();
            
            // Initialize navigation controls
            this.initializeNavigationControls();
            
            // Initialize refresh buttons
            this.initializeRefreshButtons();
            
        } catch (error) {
            console.error('Error initializing interactive features:', error);
        }
    }
    
    // Initialize tooltip system
    initializeTooltips() {
        const tooltip = document.getElementById('quantum-tooltip');
        if (!tooltip) return;
        
        const tooltipContent = tooltip.querySelector('.tooltip-content');
        
        // Add tooltips to elements with data-tooltip attribute
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const text = e.target.getAttribute('data-tooltip');
                if (text && tooltipContent) {
                    tooltipContent.textContent = text;
                    tooltip.classList.add('show');
                    
                    // Position tooltip
                    const rect = e.target.getBoundingClientRect();
                    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
                }
            });
            
            element.addEventListener('mouseleave', () => {
                tooltip.classList.remove('show');
            });
        });
    }
    
    // Initialize settings panel
    initializeSettingsPanel() {
        const settingsBtn = document.getElementById('settings-btn');
        const settingsPanel = document.getElementById('settings-panel');
        const closeBtn = document.getElementById('close-settings');
        
        if (settingsBtn && settingsPanel) {
            settingsBtn.addEventListener('click', () => {
                settingsPanel.classList.add('active');
            });
        }
        
        if (closeBtn && settingsPanel) {
            closeBtn.addEventListener('click', () => {
                settingsPanel.classList.remove('active');
            });
        }
        
        // Close on backdrop click
        if (settingsPanel) {
            settingsPanel.addEventListener('click', (e) => {
                if (e.target === settingsPanel || e.target.classList.contains('dimension-backdrop')) {
                    settingsPanel.classList.remove('active');
                }
            });
        }
        
        // Initialize toggle switches
        document.querySelectorAll('.quantum-switch input').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const setting = e.target.id;
                const enabled = e.target.checked;
                this.handleSettingChange(setting, enabled);
            });
        });
    }
    
    // Initialize navigation controls
    initializeNavigationControls() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshAllData();
            });
        }
        
        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
    }
    
    // Initialize refresh buttons
    initializeRefreshButtons() {
        const weatherRefresh = document.getElementById('weather-refresh');
        if (weatherRefresh) {
            weatherRefresh.addEventListener('click', () => {
                if (this.weatherAPI) {
                    this.weatherAPI.fetchWeatherData();
                }
                if (this.enhancedFeatures) {
                    this.enhancedFeatures.generateWeatherForecast();
                }
            });
        }
    }
    
    // Handle setting changes
    handleSettingChange(setting, enabled) {
        console.log(`Setting ${setting} changed to:`, enabled);
        
        switch (setting) {
            case 'animations-toggle':
                document.body.classList.toggle('reduced-motion', !enabled);
                break;
            case 'particles-toggle':
                if (enabled) {
                    this.createParticleSystem();
                } else {
                    this.removeParticleSystem();
                }
                break;
            case '3d-effects-toggle':
                document.body.classList.toggle('no-3d', !enabled);
                break;
            case 'weather-effects-toggle':
                document.body.classList.toggle('no-weather-effects', !enabled);
                break;
            case 'dynamic-environment-toggle':
                document.body.classList.toggle('static-environment', !enabled);
                break;
            case 'sounds-toggle':
                // Handle ambient sounds if implemented
                break;
        }
    }
    
    // Refresh all data
    refreshAllData() {
        try {
            // Update time and date
            this.updateClock();
            this.updateDate();
            
            // Update weather
            if (this.weatherAPI) {
                this.weatherAPI.fetchWeatherData();
            }
            
            // Update prayer times
            if (this.enhancedFeatures) {
                this.enhancedFeatures.updatePrayerTimes();
            }
            
            // Update themes
            if (this.themeManager) {
                this.themeManager.updateTheme();
            }
            
            // Show notification
            if (this.enhancedFeatures) {
                this.enhancedFeatures.showNotification(
                    'بروزرسانی',
                    'تمام اطلاعات با موفقیت بروزرسانی شد',
                    'success'
                );
            }
            
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }
    
    // Toggle fullscreen
    toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        } catch (error) {
            console.error('Error toggling fullscreen:', error);
        }
    }
    
    // Remove particle system
    removeParticleSystem() {
        const particleField = document.getElementById('particle-field');
        if (particleField) {
            particleField.innerHTML = '';
        }
    }

    // Handle initialization errors
    handleInitializationError(error) {
        console.error('Initialization failed:', error);
        
        // Show error message to user
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.1);
            border: 1px solid rgba(255, 0, 0, 0.3);
            border-radius: 12px;
            padding: 2rem;
            color: white;
            text-align: center;
            z-index: 10000;
            backdrop-filter: blur(20px);
        `;
        errorMessage.innerHTML = `
            <h2>خطا در بارگذاری</h2>
            <p>متأسفانه خطایی در بارگذاری وب‌سایت رخ داده است.</p>
            <p>لطفاً صفحه را مجدداً بارگذاری کنید.</p>
            <button onclick="location.reload()" style="
                background: var(--quantum-primary);
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                color: white;
                cursor: pointer;
                margin-top: 1rem;
            ">بارگذاری مجدد</button>
        `;
        
        document.body.appendChild(errorMessage);
        
        // Hide loading screen
        this.hideLoading();
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM loaded, starting Iran Live Website...');
    
    try {
        // Create and initialize the application
        window.iranLiveApp = new IranLiveApp();
        window.iranLiveApp.init();
        
        // Make components globally accessible for debugging
        window.debugApp = () => window.iranLiveApp.showDebugInfo();
        window.refreshApp = () => window.iranLiveApp.refreshData();
        window.cycleThemes = () => window.iranLiveApp.cycleThemes();
        
    } catch (error) {
        console.error('❌ Failed to start application:', error);
        
        // Show basic error message
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 0, 0, 0.1);
                border: 1px solid rgba(255, 0, 0, 0.3);
                border-radius: 12px;
                padding: 2rem;
                color: white;
                text-align: center;
                backdrop-filter: blur(20px);
            ">
                <h2>خطای بحرانی</h2>
                <p>وب‌سایت قادر به بارگذاری نیست.</p>
                <button onclick="location.reload()" style="
                    background: #ff4444;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    margin-top: 1rem;
                ">تلاش مجدد</button>
            </div>
        `;
    }
});

// Service Worker registration (for offline functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('✅ Service Worker registered:', registration);
            })
            .catch((error) => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

// Handle uncaught errors
window.addEventListener('error', (event) => {
    console.error('❌ Uncaught error:', event.error);
    
    if (window.iranLiveApp) {
        window.iranLiveApp.handleError(event.error, 'Global Error Handler');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
    
    if (window.iranLiveApp) {
        window.iranLiveApp.handleError(event.reason, 'Promise Rejection');
    }
});

// Performance monitoring
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.iranLiveApp) {
            const metrics = window.iranLiveApp.getPerformanceMetrics();
            console.log('📊 Performance Metrics:', metrics);
        }
    }, 2000);
});