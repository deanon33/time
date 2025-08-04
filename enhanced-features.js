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
            
        } catch (error) {
            console.error('Enhanced features initialization failed:', error);
        }
    }

    // Fetch real prayer times from Aviny API
    async fetchPrayerTimes() {
        try {
            const today = new Date();
            const cacheKey = today.toDateString();
            
            // Check cache first
            if (this.prayerTimesCache && this.cacheDate === cacheKey) {
                return this.prayerTimesCache;
            }
            
            // Construct API URL for Tehran
            const apiUrl = `https://prayer.aviny.com/PrayerTimes-WebService.aspx?` +
                `lat=${this.tehranCoordinates.latitude}&` +
                `lng=${this.tehranCoordinates.longitude}&` +
                `date=${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}&` +
                `timezone=3.5&` +
                `method=7`; // Method 7 is typically for Iran
            
            console.log('Fetching prayer times from:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Prayer times API response:', data);
            
            // Parse the API response (adjust based on actual API response format)
            const prayerTimes = this.parseAvinyResponse(data);
            
            // Cache the result
            this.prayerTimesCache = prayerTimes;
            this.cacheDate = cacheKey;
            
            return prayerTimes;
            
        } catch (error) {
            console.error('Error fetching prayer times from API:', error);
            
            // Fallback to calculated prayer times
            return this.calculateFallbackPrayerTimes();
        }
    }
    
    // Parse Aviny API response
    parseAvinyResponse(data) {
        try {
            // Adjust this based on the actual API response structure
            if (data && data.PrayerTimes) {
                return {
                    fajr: this.formatTime(data.PrayerTimes.Fajr),
                    sunrise: this.formatTime(data.PrayerTimes.Sunrise),
                    dhuhr: this.formatTime(data.PrayerTimes.Dhuhr),
                    asr: this.formatTime(data.PrayerTimes.Asr),
                    maghrib: this.formatTime(data.PrayerTimes.Maghrib),
                    isha: this.formatTime(data.PrayerTimes.Isha)
                };
            } else if (data && typeof data === 'object') {
                // Try different possible response formats
                const keys = Object.keys(data);
                const prayerData = data[keys[0]] || data;
                
                return {
                    fajr: this.formatTime(prayerData.Fajr || prayerData.fajr || prayerData.اذان_صبح),
                    sunrise: this.formatTime(prayerData.Sunrise || prayerData.sunrise || prayerData.طلوع_آفتاب),
                    dhuhr: this.formatTime(prayerData.Dhuhr || prayerData.dhuhr || prayerData.اذان_ظهر),
                    asr: this.formatTime(prayerData.Asr || prayerData.asr || prayerData.اذان_عصر),
                    maghrib: this.formatTime(prayerData.Maghrib || prayerData.maghrib || prayerData.اذان_مغرب),
                    isha: this.formatTime(prayerData.Isha || prayerData.isha || prayerData.اذان_عشا)
                };
            }
            
            throw new Error('Invalid API response format');
            
        } catch (error) {
            console.error('Error parsing Aviny API response:', error);
            return this.calculateFallbackPrayerTimes();
        }
    }
    
    // Format time from API response
    formatTime(timeString) {
        if (!timeString) return '--:--';
        
        try {
            // Handle different time formats
            if (typeof timeString === 'string') {
                // Remove any extra characters and normalize
                const cleanTime = timeString.replace(/[^\d:]/g, '');
                const timeParts = cleanTime.split(':');
                
                if (timeParts.length >= 2) {
                    const hours = parseInt(timeParts[0]);
                    const minutes = parseInt(timeParts[1]);
                    
                    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                }
            }
            
            return timeString.toString();
            
        } catch (error) {
            console.error('Error formatting time:', error);
            return '--:--';
        }
    }
    
    // Fallback prayer times calculation (improved version)
    calculateFallbackPrayerTimes() {
        try {
            const today = new Date();
            const lat = this.tehranCoordinates.latitude;
            const lng = this.tehranCoordinates.longitude;
            
            // Calculate day of year
            const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
            
            // Solar calculations (more accurate)
            const P = Math.asin(0.39795 * Math.cos(0.98563 * (dayOfYear - 173) * Math.PI / 180));
            const argument = -Math.tan(lat * Math.PI / 180) * Math.tan(P);
            
            // Ensure argument is within valid range for acos
            const clampedArgument = Math.max(-1, Math.min(1, argument));
            const A = 24 - (24 / Math.PI) * Math.acos(clampedArgument);
            
            // Calculate sunrise and sunset
            const sunrise = 12 - A / 2 - lng / 15 + 3.5; // +3.5 for Iran timezone
            const sunset = 12 + A / 2 - lng / 15 + 3.5;
            
            // Calculate prayer times with more accurate methods
            const fajr = sunrise - 1.25; // 1.25 hours before sunrise (18° angle)
            const dhuhr = 12 - lng / 15 + 3.5 + (today.getTimezoneOffset() / 60); // Solar noon
            const asr = dhuhr + this.calculateAsrTime(lat, P); // More accurate Asr calculation
            const maghrib = sunset + 0.05; // Just after sunset
            const isha = maghrib + 1.25; // 1.25 hours after maghrib (17° angle)
            
            return {
                fajr: this.decimalToTime(fajr),
                sunrise: this.decimalToTime(sunrise),
                dhuhr: this.decimalToTime(dhuhr),
                asr: this.decimalToTime(asr),
                maghrib: this.decimalToTime(maghrib),
                isha: this.decimalToTime(isha)
            };
            
        } catch (error) {
            console.error('Error calculating fallback prayer times:', error);
            
            // Return default times if all else fails
            return {
                fajr: '05:30',
                sunrise: '06:45',
                dhuhr: '12:15',
                asr: '15:30',
                maghrib: '18:00',
                isha: '19:30'
            };
        }
    }
    
    // Calculate Asr time more accurately
    calculateAsrTime(lat, solarDeclination) {
        try {
            const latRad = lat * Math.PI / 180;
            const decRad = solarDeclination;
            
            // Hanafi method: shadow length = 2 * object length + noon shadow
            // Shafi method: shadow length = 1 * object length + noon shadow
            // Using Shafi method (more common in Iran)
            const shadowRatio = 1;
            
            const angle = Math.atan(1 / (shadowRatio + Math.tan(Math.abs(latRad - decRad))));
            const asrAngle = Math.acos((Math.sin(angle) - Math.sin(latRad) * Math.sin(decRad)) / 
                                    (Math.cos(latRad) * Math.cos(decRad)));
            
            return (asrAngle * 180 / Math.PI) / 15; // Convert to hours
            
        } catch (error) {
            console.error('Error calculating Asr time:', error);
            return 3.5; // Default 3.5 hours after Dhuhr
        }
    }

    // Convert decimal hours to time format
    decimalToTime(decimal) {
        try {
            const hours = Math.floor(decimal);
            const minutes = Math.floor((decimal - hours) * 60);
            const normalizedHours = hours < 0 ? hours + 24 : hours >= 24 ? hours - 24 : hours;
            
            return `${String(normalizedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            
        } catch (error) {
            console.error('Error converting decimal to time:', error);
            return '--:--';
        }
    }

    // Update daily poetry
    updateDailyPoetry() {
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
        }
    }

    // Update prayer times and highlight current prayer
    async updatePrayerTimes() {
        try {
            const prayerTimes = await this.fetchPrayerTimes();
            
            // Update prayer time displays
            Object.keys(prayerTimes).forEach(prayer => {
                const timeElement = document.getElementById(`${prayer}-time`);
                if (timeElement) {
                    timeElement.textContent = prayerTimes[prayer];
                }
            });
            
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
                const [hours, minutes] = prayerTimes[prayer].split(':').map(Number);
                prayerMinutes[prayer] = hours * 60 + minutes;
            });
            
            // Find current prayer
            let currentPrayer = null;
            const prayerOrder = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
            
            for (let i = 0; i < prayerOrder.length; i++) {
                const prayer = prayerOrder[i];
                const nextPrayer = prayerOrder[i + 1];
                
                if (currentTime >= prayerMinutes[prayer] && 
                    (!nextPrayer || currentTime < prayerMinutes[nextPrayer])) {
                    currentPrayer = prayer;
                    break;
                }
            }
            
            // Handle case where current time is after Isha
            if (!currentPrayer && currentTime >= prayerMinutes.isha) {
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
                const [hours, minutes] = prayerTimes[prayer].split(':').map(Number);
                prayerMinutes[prayer] = hours * 60 + minutes;
            });
            
            // Find next prayer
            const prayerOrder = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
            let nextPrayer = null;
            let timeToNext = 0;
            
            for (const prayer of prayerOrder) {
                if (currentTime < prayerMinutes[prayer]) {
                    nextPrayer = prayer;
                    timeToNext = prayerMinutes[prayer] - currentTime;
                    break;
                }
            }
            
            // If no prayer found for today, next is Fajr tomorrow
            if (!nextPrayer) {
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
            }
            
        } catch (error) {
            console.error('Error updating next prayer indicator:', error);
        }
    }

    // Generate mock weather forecast
    generateWeatherForecast() {
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
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">${title}</div>
                <button class="notification-close">&times;</button>
            </div>
            <div class="notification-body">${message}</div>
        `;

        const container = document.getElementById('notification-container');
        if (container) {
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
        }
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedFeatures;
}