// Theme Management System for Dynamic Website

class ThemeManager {
    constructor() {
        this.currentTheme = 'day';
        this.currentWeatherTheme = null;
        this.currentSpecialTheme = null;
        
        // Time-based themes configuration
        this.timeThemes = {
            dawn: {
                name: 'سپیده‌دم',
                description: 'آغاز روز با نور ملایم',
                startHour: 5,
                endHour: 8,
                className: 'theme-dawn'
            },
            day: {
                name: 'روز',
                description: 'آسمان صاف و آفتابی',
                startHour: 8,
                endHour: 17,
                className: 'theme-day'
            },
            sunset: {
                name: 'غروب',
                description: 'رنگ‌های گرم غروب آفتاب',
                startHour: 17,
                endHour: 20,
                className: 'theme-sunset'
            },
            night: {
                name: 'شب',
                description: 'آرامش شب و ستارگان',
                startHour: 20,
                endHour: 24,
                className: 'theme-night'
            },
            midnight: {
                name: 'نیمه‌شب',
                description: 'سکوت عمیق شب',
                startHour: 0,
                endHour: 5,
                className: 'theme-midnight'
            }
        };

        // Weather-based theme modifiers
        this.weatherThemes = {
            rainy: {
                name: 'بارانی',
                description: 'قطرات باران بر شیشه',
                modifier: 'weather-rainy'
            },
            snowy: {
                name: 'برفی',
                description: 'پوشش سفید برف',
                modifier: 'weather-snowy'
            },
            cloudy: {
                name: 'ابری',
                description: 'ابرهای خاکستری آسمان',
                modifier: 'weather-cloudy'
            },
            sunny: {
                name: 'آفتابی',
                description: 'نور طلایی خورشید',
                modifier: 'weather-sunny'
            },
            stormy: {
                name: 'طوفانی',
                description: 'رعد و برق در آسمان',
                modifier: 'weather-stormy'
            },
            misty: {
                name: 'مه آلود',
                description: 'پرده نازک مه',
                modifier: 'weather-misty'
            }
        };

        this.themeTransitionDuration = 1000; // 1 second
    }

    // Get current time-based theme
    getTimeBasedTheme(iranTime) {
        const hour = iranTime.getHours();
        
        for (const [themeKey, theme] of Object.entries(this.timeThemes)) {
            if (theme.startHour < theme.endHour) {
                // Normal range (e.g., 8-17)
                if (hour >= theme.startHour && hour < theme.endHour) {
                    return { key: themeKey, ...theme };
                }
            } else {
                // Overnight range (e.g., 20-24 or 0-5)
                if (hour >= theme.startHour || hour < theme.endHour) {
                    return { key: themeKey, ...theme };
                }
            }
        }
        
        // Default to day theme
        return { key: 'day', ...this.timeThemes.day };
    }

    // Apply time-based theme
    applyTimeTheme(iranTime) {
        const timeTheme = this.getTimeBasedTheme(iranTime);
        
        if (this.currentTheme !== timeTheme.key) {
            this.currentTheme = timeTheme.key;
            
            // Remove all time theme classes
            const body = document.body;
            Object.values(this.timeThemes).forEach(theme => {
                body.classList.remove(theme.className);
            });
            
            // Apply new time theme
            body.classList.add(timeTheme.className);
            
            // Update theme indicator
            this.updateThemeIndicator(timeTheme);
            
            // Dispatch theme change event
            this.dispatchThemeEvent('timeThemeChange', timeTheme);
            
            console.log(`Applied time theme: ${timeTheme.name}`);
        }
        
        return timeTheme;
    }

    // Apply weather-based theme modifier
    applyWeatherTheme(weatherTheme) {
        if (!weatherTheme || this.currentWeatherTheme === weatherTheme) {
            return;
        }
        
        const body = document.body;
        
        // Remove existing weather modifiers
        Object.values(this.weatherThemes).forEach(theme => {
            body.classList.remove(theme.modifier);
        });
        
        // Apply new weather modifier
        if (this.weatherThemes[weatherTheme]) {
            body.classList.add(this.weatherThemes[weatherTheme].modifier);
            this.currentWeatherTheme = weatherTheme;
            
            // Update theme indicator with weather info
            this.updateWeatherIndicator(this.weatherThemes[weatherTheme]);
            
            // Dispatch weather theme event
            this.dispatchThemeEvent('weatherThemeChange', this.weatherThemes[weatherTheme]);
            
            console.log(`Applied weather theme: ${this.weatherThemes[weatherTheme].name}`);
        }
    }

    // Apply special event theme (overrides other themes)
    applySpecialTheme(specialTheme) {
        if (!specialTheme) {
            this.removeSpecialTheme();
            return;
        }

        if (this.currentSpecialTheme !== specialTheme.theme) {
            const body = document.body;
            
            // Remove existing special themes
            body.classList.remove('theme-nowruz', 'theme-yalda', 'theme-fire-festival', 
                               'theme-nature-day', 'theme-autumn-festival', 'theme-spiritual-night');
            
            // Apply special theme
            body.classList.add(`theme-${specialTheme.theme}`);
            this.currentSpecialTheme = specialTheme.theme;
            
            // Update theme indicator for special event
            this.updateSpecialThemeIndicator(specialTheme);
            
            // Dispatch special theme event
            this.dispatchThemeEvent('specialThemeChange', specialTheme);
            
            console.log(`Applied special theme: ${specialTheme.name}`);
        }
    }

    // Remove special theme
    removeSpecialTheme() {
        if (this.currentSpecialTheme) {
            const body = document.body;
            body.classList.remove('theme-nowruz', 'theme-yalda', 'theme-fire-festival', 
                               'theme-nature-day', 'theme-autumn-festival', 'theme-spiritual-night');
            
            this.currentSpecialTheme = null;
            
            // Restore normal theme indicator
            const currentTimeTheme = this.getCurrentTimeTheme();
            this.updateThemeIndicator(currentTimeTheme);
            
            console.log('Removed special theme');
        }
    }

    // Get current time theme without applying it
    getCurrentTimeTheme() {
        const persianCalendar = new PersianCalendar();
        const iranTime = persianCalendar.getIranTime();
        return this.getTimeBasedTheme(iranTime);
    }

    // Update theme indicator in UI
    updateThemeIndicator(theme) {
        const themeNameElement = document.getElementById('theme-name');
        const themeDescElement = document.getElementById('theme-description');
        
        if (themeNameElement && themeDescElement) {
            themeNameElement.textContent = theme.name;
            themeDescElement.textContent = theme.description;
        }
        
        // Update theme progress
        this.updateThemeProgress(theme);
    }
    
    // Update theme progress bar
    updateThemeProgress(theme) {
        const persianCalendar = new PersianCalendar();
        const iranTime = persianCalendar.getIranTime();
        const currentHour = iranTime.getHours();
        const currentMinute = iranTime.getMinutes();
        
        // Calculate progress within current theme
        let progress = 0;
        let timeRemaining = '';
        
        if (theme.startHour < theme.endHour) {
            // Normal range
            const totalMinutes = (theme.endHour - theme.startHour) * 60;
            const elapsedMinutes = ((currentHour - theme.startHour) * 60) + currentMinute;
            progress = Math.max(0, Math.min(100, (elapsedMinutes / totalMinutes) * 100));
            
            const remainingMinutes = totalMinutes - elapsedMinutes;
            const remainingHours = Math.floor(remainingMinutes / 60);
            const remainingMins = remainingMinutes % 60;
            timeRemaining = `${remainingHours}:${remainingMins.toString().padStart(2, '0')} تا تغییر تم`;
        } else {
            // Overnight range
            if (currentHour >= theme.startHour) {
                // Same day
                const totalMinutes = ((24 - theme.startHour) + theme.endHour) * 60;
                const elapsedMinutes = ((currentHour - theme.startHour) * 60) + currentMinute;
                progress = Math.max(0, Math.min(100, (elapsedMinutes / totalMinutes) * 100));
                
                const remainingMinutes = totalMinutes - elapsedMinutes;
                const remainingHours = Math.floor(remainingMinutes / 60);
                const remainingMins = remainingMinutes % 60;
                timeRemaining = `${remainingHours}:${remainingMins.toString().padStart(2, '0')} تا تغییر تم`;
            } else {
                // Next day
                const totalMinutes = theme.endHour * 60;
                const elapsedMinutes = (currentHour * 60) + currentMinute;
                progress = Math.max(0, Math.min(100, (elapsedMinutes / totalMinutes) * 100));
                
                const remainingMinutes = totalMinutes - elapsedMinutes;
                const remainingHours = Math.floor(remainingMinutes / 60);
                const remainingMins = remainingMinutes % 60;
                timeRemaining = `${remainingHours}:${remainingMins.toString().padStart(2, '0')} تا تغییر تم`;
            }
        }
        
        const progressFill = document.getElementById('theme-progress');
        const progressText = document.getElementById('theme-time-remaining');
        
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        
        if (progressText) {
            progressText.textContent = timeRemaining;
        }
    }

    // Update weather indicator
    updateWeatherIndicator(weatherTheme) {
        const themeDescElement = document.getElementById('theme-description');
        
        if (themeDescElement && weatherTheme) {
            const currentTimeTheme = this.getCurrentTimeTheme();
            themeDescElement.textContent = `${currentTimeTheme.description} - ${weatherTheme.description}`;
        }
    }

    // Update special theme indicator
    updateSpecialThemeIndicator(specialTheme) {
        const themeNameElement = document.getElementById('theme-name');
        const themeDescElement = document.getElementById('theme-description');
        
        if (themeNameElement && themeDescElement) {
            themeNameElement.textContent = specialTheme.name;
            themeDescElement.textContent = specialTheme.description;
        }
    }

    // Dispatch theme change events
    dispatchThemeEvent(eventType, themeData) {
        const event = new CustomEvent(eventType, {
            detail: themeData
        });
        document.dispatchEvent(event);
    }

    // Add smooth transition effects
    addThemeTransition() {
        const body = document.body;
        body.style.transition = `all ${this.themeTransitionDuration}ms ease-in-out`;
        
        // Remove transition after it completes to avoid affecting other animations
        setTimeout(() => {
            body.style.transition = '';
        }, this.themeTransitionDuration);
    }

    // Initialize theme system
    init(persianCalendar, weatherAPI, specialEvents) {
        // Apply initial theme
        const iranTime = persianCalendar.getIranTime();
        this.applyTimeTheme(iranTime);
        
        // Set up periodic theme updates (every minute)
        setInterval(() => {
            const currentTime = persianCalendar.getIranTime();
            this.applyTimeTheme(currentTime);
        }, 60 * 1000);

        // Listen for weather updates
        document.addEventListener('weatherUpdate', (event) => {
            const { weatherTheme } = event.detail;
            this.applyWeatherTheme(weatherTheme);
        });

        // Listen for special event updates
        document.addEventListener('specialEventUpdate', (event) => {
            const specialTheme = event.detail;
            this.applySpecialTheme(specialTheme);
        });

        // Add click handler for theme indicator (for debugging/manual control)
        const themeIndicator = document.getElementById('theme-indicator');
        if (themeIndicator) {
            themeIndicator.addEventListener('click', () => {
                this.showThemeInfo();
            });
        }

        console.log('Theme system initialized');
    }

    // Show current theme information (for debugging)
    showThemeInfo() {
        const info = {
            currentTheme: this.currentTheme,
            currentWeatherTheme: this.currentWeatherTheme,
            currentSpecialTheme: this.currentSpecialTheme,
            bodyClasses: Array.from(document.body.classList)
        };
        
        console.log('Current Theme Info:', info);
        
        // Optional: Show in UI
        if (confirm('نمایش اطلاعات تم در کنسول؟')) {
            console.table(info);
        }
    }

    // Manual theme override (for testing)
    overrideTheme(themeKey) {
        if (this.timeThemes[themeKey]) {
            const theme = { key: themeKey, ...this.timeThemes[themeKey] };
            this.currentTheme = themeKey;
            
            const body = document.body;
            Object.values(this.timeThemes).forEach(t => {
                body.classList.remove(t.className);
            });
            
            body.classList.add(theme.className);
            this.updateThemeIndicator(theme);
            
            console.log(`Manual theme override: ${theme.name}`);
        }
    }

    // Get theme statistics
    getThemeStats() {
        const persianCalendar = new PersianCalendar();
        const iranTime = persianCalendar.getIranTime();
        const currentHour = iranTime.getHours();
        
        const stats = {
            currentHour: currentHour,
            currentTheme: this.currentTheme,
            timeUntilNextTheme: this.getTimeUntilNextTheme(currentHour),
            availableThemes: Object.keys(this.timeThemes),
            weatherModifiers: Object.keys(this.weatherThemes)
        };
        
        return stats;
    }

    // Calculate time until next theme change
    getTimeUntilNextTheme(currentHour) {
        const sortedThemes = Object.entries(this.timeThemes)
            .map(([key, theme]) => ({ key, ...theme }))
            .sort((a, b) => a.startHour - b.startHour);
        
        for (const theme of sortedThemes) {
            if (currentHour < theme.startHour) {
                return (theme.startHour - currentHour) * 60; // minutes
            }
        }
        
        // Next theme is tomorrow's first theme
        const firstTheme = sortedThemes[0];
        return ((24 - currentHour) + firstTheme.startHour) * 60;
    }

    // Preload theme assets (if any)
    preloadThemeAssets() {
        // This could be used to preload background images, sounds, etc.
        console.log('Preloading theme assets...');
        
        // Example: Preload background images
        const themeImages = [
            'images/dawn-bg.jpg',
            'images/day-bg.jpg',
            'images/sunset-bg.jpg',
            'images/night-bg.jpg',
            'images/midnight-bg.jpg'
        ];
        
        themeImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
}

// Export for use in other files
window.ThemeManager = ThemeManager;