// Enhanced Features for Iran Live Website

class EnhancedFeatures {
    constructor() {
        // Persian poetry collection
        this.persianPoetry = [
            {
                lines: ["دوش از مسجد سوی میخانه آمد پیر ما", "کیست این عاشق که از معشوق آگاه آمد"],
                poet: "حافظ شیرازی"
            },
            {
                lines: ["بیا که قصر امل بر باد می‌دهند", "نقش هر آنچه که بر آب می‌دهند"],
                poet: "حافظ شیرازی"
            },
            {
                lines: ["عاشقان مستغرق در بحر جمالند", "اهل دل در عین وصل و در وصالند"],
                poet: "مولانا جلال‌الدین رومی"
            },
            {
                lines: ["هر که در کوی تو منزل گزیند", "جز کرم و لطف تو منزل نبیند"],
                poet: "سعدی شیرازی"
            },
            {
                lines: ["گر چه بر من می‌گذارد روزگار آنچه خواهد", "عشق تو در دل من پاینده خواهد بود"],
                poet: "فردوسی"
            },
            {
                lines: ["دل به دریا زن اگر غواص مرواری", "هر صدف کز بحر عشق آری پر از گوهر است"],
                poet: "نظامی گنجوی"
            }
        ];



        // Prayer times will be calculated dynamically
        this.prayerTimes = {};
        this.tehranCoordinates = {
            latitude: 35.6892,
            longitude: 51.3890
        };

        this.weatherForecast = [];
    }

    // Initialize all enhanced features
    init() {
        this.calculatePrayerTimes();
        this.updateDailyPoetry();
        this.updatePrayerTimes();
        this.generateWeatherForecast();
        
        // Set up intervals
        setInterval(() => this.updateDailyPoetry(), 24 * 60 * 60 * 1000); // Daily
        setInterval(() => this.updatePrayerTimes(), 60 * 1000); // Every minute
        setInterval(() => this.calculatePrayerTimes(), 24 * 60 * 60 * 1000); // Daily recalculation
        
        console.log('✨ Enhanced features initialized');
    }

    // Calculate accurate prayer times for Tehran
    calculatePrayerTimes() {
        const today = new Date();
        const lat = this.tehranCoordinates.latitude;
        const lng = this.tehranCoordinates.longitude;
        
        // Calculate day of year
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        
        // Solar calculations
        const P = Math.asin(0.39795 * Math.cos(0.98563 * (dayOfYear - 173) * Math.PI / 180));
        const argument = -Math.tan(lat * Math.PI / 180) * Math.tan(P);
        
        // Ensure argument is within valid range for acos
        const clampedArgument = Math.max(-1, Math.min(1, argument));
        const A = 24 - (24 / Math.PI) * Math.acos(clampedArgument);
        
        // Calculate sunrise and sunset
        const sunrise = 12 - A / 2 - lng / 15 + 3.5; // +3.5 for Iran timezone
        const sunset = 12 + A / 2 - lng / 15 + 3.5;
        
        // Calculate prayer times
        const fajr = sunrise - 1.5; // 1.5 hours before sunrise
        const dhuhr = 12 - lng / 15 + 3.5 + (today.getTimezoneOffset() / 60); // Solar noon
        const asr = dhuhr + 4; // Approximate Asr time
        const maghrib = sunset + 0.1; // Just after sunset
        const isha = maghrib + 1.5; // 1.5 hours after maghrib
        
        // Convert to hours and minutes
        this.prayerTimes = {
            fajr: this.decimalToTime(fajr),
            sunrise: this.decimalToTime(sunrise),
            dhuhr: this.decimalToTime(dhuhr),
            asr: this.decimalToTime(asr),
            maghrib: this.decimalToTime(maghrib),
            isha: this.decimalToTime(isha)
        };
    }
    
    // Helper function to convert decimal hours to time object
    decimalToTime(decimal) {
        const hours = Math.floor(decimal);
        const minutes = Math.floor((decimal - hours) * 60);
        return {
            hour: hours < 0 ? hours + 24 : hours >= 24 ? hours - 24 : hours,
            minute: minutes
        };
    }

    // Update daily poetry
    updateDailyPoetry() {
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const poemIndex = dayOfYear % this.persianPoetry.length;
        const selectedPoem = this.persianPoetry[poemIndex];

        const poemTextElement = document.querySelector('.poem-text');
        const poetNameElement = document.querySelector('.poet-name');

        if (poemTextElement && poetNameElement) {
            poemTextElement.innerHTML = selectedPoem.lines
                .map(line => `<p class="poem-line">${line}</p>`)
                .join('');
            poetNameElement.textContent = selectedPoem.poet;
        }
    }

    // Update prayer times and highlight current prayer
    updatePrayerTimes() {
        const persianCalendar = new PersianCalendar();
        const iranTime = persianCalendar.getIranTime();
        const currentHour = iranTime.getHours();
        const currentMinute = iranTime.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        // Update prayer times display
        Object.keys(this.prayerTimes).forEach(prayer => {
            const element = document.getElementById(`${prayer}-time`);
            if (element) {
                const time = this.prayerTimes[prayer];
                element.textContent = `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
            }
        });

        // Highlight current prayer time
        const prayerElements = document.querySelectorAll('.prayer-time');
        prayerElements.forEach(el => el.classList.remove('active'));

        // Find current prayer
        let currentPrayer = null;
        const prayerTimesArray = Object.entries(this.prayerTimes).map(([name, time]) => ({
            name,
            minutes: time.hour * 60 + time.minute
        })).sort((a, b) => a.minutes - b.minutes);

        for (let i = 0; i < prayerTimesArray.length; i++) {
            const prayer = prayerTimesArray[i];
            const nextPrayer = prayerTimesArray[i + 1];
            
            if (currentTimeInMinutes >= prayer.minutes && 
                (!nextPrayer || currentTimeInMinutes < nextPrayer.minutes)) {
                currentPrayer = prayer.name;
                break;
            }
        }

        if (currentPrayer) {
            const currentElement = document.querySelector(`#${currentPrayer}-time`).closest('.prayer-time');
            if (currentElement) {
                currentElement.classList.add('active');
            }
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

        const forecastContainer = document.getElementById('weather-forecast');
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
                <i class="fas fa-bell"></i>
                <span>${title}</span>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-body">${message}</div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);

        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    // Add prayer time notifications
    checkPrayerNotifications() {
        const persianCalendar = new PersianCalendar();
        const iranTime = persianCalendar.getIranTime();
        const currentHour = iranTime.getHours();
        const currentMinute = iranTime.getMinutes();

        Object.entries(this.prayerTimes).forEach(([prayer, time]) => {
            if (currentHour === time.hour && currentMinute === time.minute) {
                const prayerNames = {
                    fajr: 'اذان صبح',
                    sunrise: 'طلوع آفتاب',
                    dhuhr: 'اذان ظهر',
                    maghrib: 'اذان مغرب',
                    isha: 'اذان عشا'
                };
                
                this.showNotification(
                    'اوقات شرعی',
                    `وقت ${prayerNames[prayer]} فرا رسیده است`,
                    'prayer'
                );
            }
        });
    }

    // Add currency exchange rates (mock data)
    updateCurrencyRates() {
        const currencies = {
            USD: { name: 'دلار آمریکا', rate: 42000 + Math.floor(Math.random() * 1000) },
            EUR: { name: 'یورو', rate: 45000 + Math.floor(Math.random() * 1000) },
            GBP: { name: 'پound انگلیس', rate: 52000 + Math.floor(Math.random() * 1000) }
        };

        return currencies;
    }
}

// Export for use in main application
window.EnhancedFeatures = EnhancedFeatures;