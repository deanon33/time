// Enhanced Features for Iran Live Website

class EnhancedFeatures {
    constructor() {
        // Tehran coordinates for prayer times
        this.tehranCoordinates = {
            latitude: 35.6892,
            longitude: 51.3890
        };
        
        // Cache for prayer times
        this.prayerTimesCache = null;
        this.cacheDate = null;
        
        // Persian poetry collection
        this.persianPoetry = [
            {
                poet: "حافظ شیرازی",
                lines: [
                    "دوش از مسجد سوی میخانه آمد پیر ما",
                    "کیست این عاشق که از معشوق آگاه آمد"
                ]
            },
            {
                poet: "مولانا جلال‌الدین رومی",
                lines: [
                    "عاشقان مردند و زنده شدند",
                    "در دل خود شاه را دیده شدند"
                ]
            },
            {
                poet: "سعدی شیرازی",
                lines: [
                    "بنی آدم اعضای یک پیکرند",
                    "که در آفرینش ز یک گوهرند"
                ]
            },
            {
                poet: "فردوسی",
                lines: [
                    "به نام خداوند جان و خرد",
                    "کزین برتر اندیشه برنگذرد"
                ]
            },
            {
                poet: "عمر خیام",
                lines: [
                    "گر دست در کار عشق توان کرد",
                    "جان را فدای نگار توان کرد"
                ]
            }
        ];
        
        this.init();
    }

    // Initialize enhanced features
    init() {
        try {
            this.generateWeatherForecast();
            this.updatePrayerTimes();
            this.updateDailyPoetry();
            
            // Update prayer times every hour
            setInterval(() => {
                this.updatePrayerTimes();
            }, 60 * 60 * 1000);
            
            // Update poetry daily
            setInterval(() => {
                this.updateDailyPoetry();
            }, 24 * 60 * 60 * 1000);
            
            console.log('✨ Enhanced features initialized successfully');
            
        } catch (error) {
            console.error('Enhanced features initialization failed:', error);
        }
    }

    // Fetch prayer times using multiple APIs with fallback
    async fetchPrayerTimes() {
        try {
            const today = new Date();
            const cacheKey = today.toDateString();
            
            // Check cache first
            if (this.prayerTimesCache && this.cacheDate === cacheKey) {
                console.log('Using cached prayer times');
                return this.prayerTimesCache;
            }
            
            console.log('Fetching fresh prayer times...');
            
            // Try multiple APIs in order of preference
            let prayerTimes = null;
            
            // Method 1: Try Aladhan API (more reliable)
            try {
                prayerTimes = await this.fetchFromAladhanAPI();
                if (prayerTimes) {
                    console.log('✅ Prayer times fetched from Aladhan API');
                }
            } catch (error) {
                console.warn('Aladhan API failed:', error);
            }
            
            // Method 2: Try Islamic Network API as backup
            if (!prayerTimes) {
                try {
                    prayerTimes = await this.fetchFromIslamicNetworkAPI();
                    if (prayerTimes) {
                        console.log('✅ Prayer times fetched from Islamic Network API');
                    }
                } catch (error) {
                    console.warn('Islamic Network API failed:', error);
                }
            }
            
            // Method 3: Use accurate calculation as final fallback
            if (!prayerTimes) {
                console.log('⚠️ All APIs failed, using calculation fallback');
                prayerTimes = this.calculateAccuratePrayerTimes();
            }
            
            // Cache the result
            this.prayerTimesCache = prayerTimes;
            this.cacheDate = cacheKey;
            
            return prayerTimes;
            
        } catch (error) {
            console.error('Error in fetchPrayerTimes:', error);
            return this.calculateAccuratePrayerTimes();
        }
    }
    
    // Fetch from Aladhan API (most reliable)
    async fetchFromAladhanAPI() {
        const today = new Date();
        const dateString = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
        
        const apiUrl = `https://api.aladhan.com/v1/timings/${dateString}?` +
            `latitude=${this.tehranCoordinates.latitude}&` +
            `longitude=${this.tehranCoordinates.longitude}&` +
            `method=7&` + // Institute of Geophysics, University of Tehran
            `timezone=Asia/Tehran`;
        
        console.log('Trying Aladhan API:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Aladhan API response:', data);
        
        if (data.code === 200 && data.data && data.data.timings) {
            const timings = data.data.timings;
            return {
                fajr: this.formatTime(timings.Fajr),
                sunrise: this.formatTime(timings.Sunrise),
                dhuhr: this.formatTime(timings.Dhuhr),
                asr: this.formatTime(timings.Asr),
                maghrib: this.formatTime(timings.Maghrib),
                isha: this.formatTime(timings.Isha)
            };
        }
        
        throw new Error('Invalid Aladhan API response');
    }
    
    // Fetch from Islamic Network API as backup
    async fetchFromIslamicNetworkAPI() {
        const today = new Date();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        
        const apiUrl = `https://api.islamicnetwork.com/v1/calendar/${year}/${month}?` +
            `latitude=${this.tehranCoordinates.latitude}&` +
            `longitude=${this.tehranCoordinates.longitude}&` +
            `method=7&` +
            `timezone=Asia/Tehran`;
        
        console.log('Trying Islamic Network API:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Islamic Network API response sample:', data);
        
        if (data.code === 200 && data.data && Array.isArray(data.data)) {
            const todayData = data.data.find(day => {
                const dayDate = new Date(day.date.gregorian.date);
                return dayDate.getDate() === today.getDate();
            });
            
            if (todayData && todayData.timings) {
                const timings = todayData.timings;
                return {
                    fajr: this.formatTime(timings.Fajr),
                    sunrise: this.formatTime(timings.Sunrise),
                    dhuhr: this.formatTime(timings.Dhuhr),
                    asr: this.formatTime(timings.Asr),
                    maghrib: this.formatTime(timings.Maghrib),
                    isha: this.formatTime(timings.Isha)
                };
            }
        }
        
        throw new Error('Invalid Islamic Network API response');
    }
    
    // Format time from API response
    formatTime(timeString) {
        if (!timeString) return '--:--';
        
        try {
            // Remove timezone info and extra characters
            let cleanTime = timeString.replace(/\s*\([^)]*\)/g, '').trim();
            cleanTime = cleanTime.replace(/[^\d:]/g, '');
            
            const timeParts = cleanTime.split(':');
            
            if (timeParts.length >= 2) {
                const hours = parseInt(timeParts[0]);
                const minutes = parseInt(timeParts[1]);
                
                if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                }
            }
            
            return '--:--';
            
        } catch (error) {
            console.error('Error formatting time:', timeString, error);
            return '--:--';
        }
    }
    
    // Accurate prayer times calculation for Tehran
    calculateAccuratePrayerTimes() {
        try {
            console.log('🕌 Calculating accurate prayer times for Tehran...');
            
            const today = new Date();
            const lat = this.tehranCoordinates.latitude * Math.PI / 180; // Convert to radians
            const lng = this.tehranCoordinates.longitude;
            
            // Calculate day of year
            const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
            
            // Solar declination
            const P = 23.45 * Math.sin((360/365) * (dayOfYear - 81) * Math.PI / 180) * Math.PI / 180;
            
            // Equation of time (in minutes)
            const B = (360/365) * (dayOfYear - 81) * Math.PI / 180;
            const E = 4 * (lng - 52.5) + 4 * (9.87 * Math.sin(2*B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B));
            
            // Solar noon
            const solarNoon = 12 - E/60;
            
            // Hour angles for different prayers
            const angles = {
                fajr: -18 * Math.PI / 180,    // 18 degrees below horizon
                sunrise: -0.833 * Math.PI / 180, // 50 arcminutes below horizon
                asr: Math.atan(1 + Math.tan(Math.abs(lat - P))), // Shafi method
                maghrib: -0.833 * Math.PI / 180, // Same as sunrise
                isha: -17 * Math.PI / 180     // 17 degrees below horizon
            };
            
            // Calculate hour angles
            const calculateHourAngle = (angle) => {
                const cosH = (Math.sin(angle) - Math.sin(lat) * Math.sin(P)) / (Math.cos(lat) * Math.cos(P));
                if (cosH < -1 || cosH > 1) return null;
                return Math.acos(cosH) * 180 / Math.PI / 15; // Convert to hours
            };
            
            // Calculate prayer times
            const fajrHA = calculateHourAngle(angles.fajr);
            const sunriseHA = calculateHourAngle(angles.sunrise);
            const maghribHA = calculateHourAngle(angles.maghrib);
            const ishaHA = calculateHourAngle(angles.isha);
            
            // Asr calculation (more complex)
            const asrAngle = Math.atan(1 / (1 + Math.tan(Math.abs(lat - P))));
            const asrHA = Math.acos((Math.sin(asrAngle) - Math.sin(lat) * Math.sin(P)) / (Math.cos(lat) * Math.cos(P))) * 180 / Math.PI / 15;
            
            const prayerTimes = {
                fajr: this.decimalToTime(solarNoon - (fajrHA || 1.5)),
                sunrise: this.decimalToTime(solarNoon - (sunriseHA || 1.2)),
                dhuhr: this.decimalToTime(solarNoon + 0.05), // Just after solar noon
                asr: this.decimalToTime(solarNoon + (asrHA || 3.5)),
                maghrib: this.decimalToTime(solarNoon + (maghribHA || 1.2)),
                isha: this.decimalToTime(solarNoon + (ishaHA || 1.8))
            };
            
            console.log('📊 Calculated prayer times:', prayerTimes);
            return prayerTimes;
            
        } catch (error) {
            console.error('Error in prayer calculation:', error);
            
            // Final fallback with reasonable times for Tehran
            return {
                fajr: '05:15',
                sunrise: '06:30',
                dhuhr: '12:05',
                asr: '15:20',
                maghrib: '17:45',
                isha: '19:15'
            };
        }
    }

    // Convert decimal hours to time format
    decimalToTime(decimal) {
        try {
            let hours = Math.floor(decimal);
            const minutes = Math.floor((decimal - hours) * 60);
            
            // Handle negative hours and hours > 24
            while (hours < 0) hours += 24;
            while (hours >= 24) hours -= 24;
            
            return `${String(hours).padStart(2, '0')}:${String(Math.max(0, Math.min(59, minutes))).padStart(2, '0')}`;
            
        } catch (error) {
            console.error('Error converting decimal to time:', error);
            return '--:--';
        }
    }

    // Update daily poetry
    updateDailyPoetry() {
        try {
            const today = new Date();
            const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
            const poemIndex = dayOfYear % this.persianPoetry.length;
            const selectedPoem = this.persianPoetry[poemIndex];

            const poemVersesElement = document.querySelector('.poem-verses-3d');
            const poetNameElement = document.getElementById('poet-name');

            if (poemVersesElement && poetNameElement) {
                poemVersesElement.innerHTML = selectedPoem.lines
                    .map((line, index) => `<div class="verse-3d" id="verse-${index + 1}">${line}</div>`)
                    .join('');
                poetNameElement.textContent = selectedPoem.poet;
                
                console.log('📝 Daily poetry updated:', selectedPoem.poet);
            }
        } catch (error) {
            console.error('Error updating daily poetry:', error);
        }
    }

    // Update prayer times and highlight current prayer
    async updatePrayerTimes() {
        try {
            console.log('🕌 Updating prayer times...');
            const prayerTimes = await this.fetchPrayerTimes();
            
            // Update prayer time displays
            const updated = [];
            Object.keys(prayerTimes).forEach(prayer => {
                const timeElement = document.getElementById(`${prayer}-time`);
                if (timeElement) {
                    timeElement.textContent = prayerTimes[prayer];
                    updated.push(`${prayer}: ${prayerTimes[prayer]}`);
                } else {
                    console.warn(`Prayer time element not found: ${prayer}-time`);
                }
            });
            
            console.log('✅ Prayer times updated:', updated.join(', '));
            
            // Highlight current prayer
            this.highlightCurrentPrayer(prayerTimes);
            
            // Update next prayer indicator
            this.updateNextPrayerIndicator(prayerTimes);
            
        } catch (error) {
            console.error('Error updating prayer times:', error);
        }
    }
    
    // Highlight current prayer
    highlightCurrentPrayer(prayerTimes) {
        try {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            
            // Convert prayer times to minutes
            const prayerMinutes = {};
            Object.keys(prayerTimes).forEach(prayer => {
                if (prayerTimes[prayer] !== '--:--') {
                    const [hours, minutes] = prayerTimes[prayer].split(':').map(Number);
                    prayerMinutes[prayer] = hours * 60 + minutes;
                }
            });
            
            // Find current prayer
            let currentPrayer = null;
            const prayerOrder = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
            
            for (let i = 0; i < prayerOrder.length; i++) {
                const prayer = prayerOrder[i];
                const nextPrayer = prayerOrder[i + 1];
                
                if (prayerMinutes[prayer] && currentTime >= prayerMinutes[prayer] && 
                    (!nextPrayer || !prayerMinutes[nextPrayer] || currentTime < prayerMinutes[nextPrayer])) {
                    currentPrayer = prayer;
                    break;
                }
            }
            
            // Handle case where current time is after Isha
            if (!currentPrayer && prayerMinutes.isha && currentTime >= prayerMinutes.isha) {
                currentPrayer = 'isha';
            }
            
            // Update UI
            const prayerNodes = document.querySelectorAll('.prayer-node');
            prayerNodes.forEach(node => {
                node.classList.remove('active');
                if (node.dataset.prayer === currentPrayer) {
                    node.classList.add('active');
                }
            });
            
            if (currentPrayer) {
                console.log(`🔥 Current prayer: ${currentPrayer}`);
            }
            
        } catch (error) {
            console.error('Error highlighting current prayer:', error);
        }
    }
    
    // Update next prayer indicator
    updateNextPrayerIndicator(prayerTimes) {
        try {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            
            // Convert prayer times to minutes
            const prayerMinutes = {};
            Object.keys(prayerTimes).forEach(prayer => {
                if (prayerTimes[prayer] !== '--:--') {
                    const [hours, minutes] = prayerTimes[prayer].split(':').map(Number);
                    prayerMinutes[prayer] = hours * 60 + minutes;
                }
            });
            
            // Find next prayer
            const prayerOrder = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
            let nextPrayer = null;
            let timeToNext = 0;
            
            for (const prayer of prayerOrder) {
                if (prayerMinutes[prayer] && currentTime < prayerMinutes[prayer]) {
                    nextPrayer = prayer;
                    timeToNext = prayerMinutes[prayer] - currentTime;
                    break;
                }
            }
            
            // If no prayer found for today, next is Fajr tomorrow
            if (!nextPrayer && prayerMinutes.fajr) {
                nextPrayer = 'fajr';
                timeToNext = (24 * 60) - currentTime + prayerMinutes.fajr;
            }
            
            // Update next prayer indicator
            const nextPrayerElement = document.getElementById('next-prayer');
            if (nextPrayerElement && nextPrayer) {
                const hours = Math.floor(timeToNext / 60);
                const minutes = timeToNext % 60;
                
                const prayerNames = {
                    fajr: 'اذان صبح',
                    sunrise: 'طلوع آفتاب',
                    dhuhr: 'اذان ظهر',
                    asr: 'اذان عصر',
                    maghrib: 'اذان مغرب',
                    isha: 'اذان عشا'
                };
                
                if (hours > 0) {
                    nextPrayerElement.textContent = `تا ${prayerNames[nextPrayer]} ${hours} ساعت و ${minutes} دقیقه`;
                } else {
                    nextPrayerElement.textContent = `تا ${prayerNames[nextPrayer]} ${minutes} دقیقه`;
                }
                
                console.log(`⏰ Next prayer: ${prayerNames[nextPrayer]} in ${hours}h ${minutes}m`);
            }
            
        } catch (error) {
            console.error('Error updating next prayer indicator:', error);
        }
    }

    // Generate mock weather forecast
    generateWeatherForecast() {
        try {
            const days = ['امروز', 'فردا', 'پس‌فردا', '4 روز بعد', '5 روز بعد'];
            const conditions = [
                { icon: 'fas fa-sun', desc: 'آفتابی', temp: [25, 35] },
                { icon: 'fas fa-cloud-sun', desc: 'نیمه ابری', temp: [20, 30] },
                { icon: 'fas fa-cloud', desc: 'ابری', temp: [18, 28] },
                { icon: 'fas fa-cloud-rain', desc: 'بارانی', temp: [15, 25] },
                { icon: 'fas fa-cloud-sun', desc: 'نیمه ابری', temp: [22, 32] }
            ];

            const forecastContainer = document.getElementById('forecast-timeline');
            if (forecastContainer) {
                forecastContainer.innerHTML = '';
                
                days.forEach((day, index) => {
                    const condition = conditions[index];
                    const minTemp = condition.temp[0] + Math.floor(Math.random() * 5);
                    const maxTemp = condition.temp[1] + Math.floor(Math.random() * 5);
                    
                    const forecastItem = document.createElement('div');
                    forecastItem.className = 'forecast-item';
                    forecastItem.innerHTML = `
                        <div class="forecast-day">${day}</div>
                        <div class="forecast-icon">
                            <i class="${condition.icon}"></i>
                        </div>
                        <div class="forecast-temp">${maxTemp}° / ${minTemp}°</div>
                        <div class="forecast-desc">${condition.desc}</div>
                    `;
                    forecastContainer.appendChild(forecastItem);
                });
                
                console.log('🌤️ Weather forecast generated');
            }
        } catch (error) {
            console.error('Error generating weather forecast:', error);
        }
    }

    // Get historical events for today (mock data)
    getTodayInHistory() {
        const historicalEvents = [
            "1320 - تولد حافظ شیرازی، شاعر بزرگ ایرانی",
            "1207 - تولد مولانا جلال‌الدین رومی در بلخ",
            "1389 - پیروزی ایران در جام ملت‌های آسیا",
            "1357 - پیروزی انقلاب اسلامی ایران",
            "1979 - بازگشت امام خمینی به ایران"
        ];

        const today = new Date();
        const eventIndex = today.getDate() % historicalEvents.length;
        return historicalEvents[eventIndex];
    }

    // Create notification system
    showNotification(title, message, type = 'info') {
        try {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-header">
                    <div class="notification-title">${title}</div>
                    <button class="notification-close">&times;</button>
                </div>
                <div class="notification-body">${message}</div>
            `;

            const container = document.getElementById('notification-container') || document.body;
            container.appendChild(notification);

            // Auto remove after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);

            // Add close button functionality
            const closeBtn = notification.querySelector('.notification-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                });
            }
            
            console.log(`📢 Notification: ${title} - ${message}`);
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedFeatures;
}