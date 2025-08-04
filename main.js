// Main Application Controller for Iran Live Website

class IranLiveApp {
    constructor() {
        this.persianCalendar = null;
        this.weatherAPI = null;
        this.specialEvents = null;
        this.themeManager = null;
        
        this.isInitialized = false;
        this.updateInterval = 1000; // Update every second
        this.clockInterval = null;
        
        // Performance monitoring
        this.startTime = Date.now();
        this.loadingElement = document.getElementById('loading');
        
        // Error handling
        this.errorCount = 0;
        this.maxErrors = 5;
    }

    // Initialize all application components
    async init() {
        try {
            console.log('🚀 Initializing Iran Live Website...');
            
            // Show loading screen
            this.showLoading();
            
            // Initialize core components
            await this.initializeComponents();
            
            // Start real-time updates
            this.startRealTimeUpdates();
            
            // Set up event listeners
            this.setupEventListeners();
            
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
    }

    // Start real-time updates
    startRealTimeUpdates() {
        // Update clock every second
        this.clockInterval = setInterval(() => {
            this.updateClock();
        }, this.updateInterval);

        // Initial updates
        this.updateClock();
        this.updateDate();
        
        console.log('⏰ Real-time updates started');
    }

    // Update the clock display
    updateClock() {
        try {
            const iranTime = this.persianCalendar.getIranTime();
            const timeData = this.persianCalendar.getFormattedTime(iranTime);
            const timePeriod = this.persianCalendar.getTimePeriod(iranTime);

            // Update time display
            this.updateTimeDisplay(timeData);
            
            // Update time period
            this.updateTimePeriod(timePeriod);
            
            // Update date (less frequently)
            if (iranTime.getSeconds() === 0) {
                this.updateDate();
            }
            
        } catch (error) {
            this.handleError('Clock update failed', error);
        }
    }

    // Update time display elements
    updateTimeDisplay(timeData) {
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');

        if (hoursElement) hoursElement.textContent = timeData.hours;
        if (minutesElement) minutesElement.textContent = timeData.minutes;
        if (secondsElement) secondsElement.textContent = timeData.seconds;
    }

    // Update time period display
    updateTimePeriod(timePeriod) {
        const timePeriodElement = document.getElementById('time-period');
        if (timePeriodElement) {
            timePeriodElement.textContent = timePeriod;
        }
    }

    // Update date display
    updateDate() {
        try {
            const iranTime = this.persianCalendar.getIranTime();
            const persianDate = this.persianCalendar.getFormattedPersianDate(iranTime);
            const gregorianDate = this.persianCalendar.getFormattedGregorianDate(iranTime);

            // Update Persian date
            this.updatePersianDate(persianDate);
            
            // Update Gregorian date
            this.updateGregorianDate(gregorianDate);
            
        } catch (error) {
            this.handleError('Date update failed', error);
        }
    }

    // Update Persian date display
    updatePersianDate(persianDate) {
        const dayNameElement = document.getElementById('day-name');
        const dayElement = document.getElementById('day');
        const monthElement = document.getElementById('month');
        const yearElement = document.getElementById('year');

        if (dayNameElement) dayNameElement.textContent = persianDate.dayName;
        if (dayElement) dayElement.textContent = persianDate.day;
        if (monthElement) monthElement.textContent = persianDate.month;
        if (yearElement) yearElement.textContent = persianDate.year;
    }

    // Update Gregorian date display
    updateGregorianDate(gregorianDate) {
        const gregorianElement = document.getElementById('gregorian-date');
        if (gregorianElement) {
            gregorianElement.textContent = gregorianDate;
        }
    }

    // Set up event listeners
    setupEventListeners() {
        // Window events
        window.addEventListener('load', () => {
            console.log('🌐 Window loaded');
        });

        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // Visibility change (pause updates when tab is hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseUpdates();
            } else {
                this.resumeUpdates();
            }
        });

        // Online/offline events
        window.addEventListener('online', () => {
            console.log('🌐 Connection restored');
            this.weatherAPI.updateWeather();
        });

        window.addEventListener('offline', () => {
            console.log('📡 Connection lost - using cached data');
        });

        // Custom events
        document.addEventListener('weatherUpdate', (event) => {
            console.log('🌦️ Weather updated:', event.detail.weatherData.description);
        });

        document.addEventListener('timeThemeChange', (event) => {
            console.log('🎨 Time theme changed:', event.detail.name);
        });

        document.addEventListener('specialEventUpdate', (event) => {
            console.log('🎉 Special event detected:', event.detail.name);
        });

        // Error handling
        window.addEventListener('error', (event) => {
            this.handleError('JavaScript Error', event.error);
        });

        // Keyboard shortcuts (for debugging)
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'i':
                        event.preventDefault();
                        this.showDebugInfo();
                        break;
                    case 'r':
                        event.preventDefault();
                        this.refreshData();
                        break;
                    case 't':
                        event.preventDefault();
                        this.cycleThemes();
                        break;
                }
            }
        });

        console.log('👂 Event listeners set up');
    }

    // Show loading screen
    showLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'flex';
        }
    }

    // Hide loading screen
    hideLoading() {
        if (this.loadingElement) {
            setTimeout(() => {
                this.loadingElement.style.opacity = '0';
                setTimeout(() => {
                    this.loadingElement.style.display = 'none';
                }, 500);
            }, 1000); // Show loading for at least 1 second
        }
    }

    // Pause updates when tab is hidden
    pauseUpdates() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
            this.clockInterval = null;
            console.log('⏸️ Updates paused');
        }
    }

    // Resume updates when tab becomes visible
    resumeUpdates() {
        if (!this.clockInterval && this.isInitialized) {
            this.startRealTimeUpdates();
            console.log('▶️ Updates resumed');
        }
    }

    // Handle errors gracefully
    handleError(message, error) {
        this.errorCount++;
        console.error(`❌ ${message}:`, error);

        if (this.errorCount >= this.maxErrors) {
            console.error('🚨 Too many errors, stopping application');
            this.cleanup();
            this.showErrorMessage('خطای سیستمی رخ داده است. لطفاً صفحه را تازه‌سازی کنید.');
        }
    }

    // Handle initialization errors
    handleInitializationError(error) {
        this.hideLoading();
        this.showErrorMessage('خطا در بارگذاری وب‌سایت. لطفاً اتصال اینترنت خود را بررسی کنید.');
        
        // Try to initialize with minimal functionality
        setTimeout(() => {
            this.initializeMinimal();
        }, 3000);
    }

    // Initialize with minimal functionality
    initializeMinimal() {
        try {
            console.log('🔧 Initializing minimal functionality...');
            
            this.persianCalendar = new PersianCalendar();
            this.startRealTimeUpdates();
            
            console.log('✅ Minimal functionality initialized');
        } catch (error) {
            console.error('❌ Failed to initialize minimal functionality:', error);
        }
    }

    // Show error message to user
    showErrorMessage(message) {
        // Create error overlay
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 10000;
            font-family: 'Vazir', Arial, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    // Debug functions
    showDebugInfo() {
        const info = {
            initialized: this.isInitialized,
            errorCount: this.errorCount,
            uptime: Date.now() - this.startTime,
            currentTheme: this.themeManager?.currentTheme,
            weatherTheme: this.themeManager?.currentWeatherTheme,
            specialTheme: this.themeManager?.currentSpecialTheme
        };
        
        console.table(info);
        alert('Debug info logged to console (F12)');
    }

    // Refresh all data
    async refreshData() {
        try {
            console.log('🔄 Refreshing data...');
            await this.weatherAPI.updateWeather();
            this.specialEvents.checkAndApplyEvents(this.persianCalendar);
            console.log('✅ Data refreshed');
        } catch (error) {
            this.handleError('Data refresh failed', error);
        }
    }

    // Cycle through themes (for testing)
    cycleThemes() {
        const themes = ['dawn', 'day', 'sunset', 'night', 'midnight'];
        const currentIndex = themes.indexOf(this.themeManager.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        
        this.themeManager.overrideTheme(nextTheme);
        console.log(`🎨 Cycled to theme: ${nextTheme}`);
    }

    // Cleanup resources
    cleanup() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
            this.clockInterval = null;
        }
        
        console.log('🧹 Application cleaned up');
    }

    // Get application status
    getStatus() {
        return {
            initialized: this.isInitialized,
            uptime: Date.now() - this.startTime,
            errorCount: this.errorCount,
            components: {
                persianCalendar: !!this.persianCalendar,
                weatherAPI: !!this.weatherAPI,
                specialEvents: !!this.specialEvents,
                themeManager: !!this.themeManager
            }
        };
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM loaded, starting Iran Live Website...');
    
    // Create and initialize the application
    window.iranLiveApp = new IranLiveApp();
    window.iranLiveApp.init();
    
    // Make components globally accessible for debugging
    window.debugApp = () => window.iranLiveApp.showDebugInfo();
    window.refreshApp = () => window.iranLiveApp.refreshData();
    window.cycleThemes = () => window.iranLiveApp.cycleThemes();
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