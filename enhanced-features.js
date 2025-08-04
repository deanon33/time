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

        // Iranian cities data
        this.iranianCities = {
            Tehran: { name: "تهران", offset: 0 },
            Isfahan: { name: "اصفهان", offset: 0 },
            Shiraz: { name: "شیراز", offset: 0 },
            Mashhad: { name: "مشهد", offset: 0 }
        };

        // Prayer times (approximate for Tehran)
        this.prayerTimes = {
            fajr: { hour: 5, minute: 30 },
            sunrise: { hour: 6, minute: 45 },
            dhuhr: { hour: 12, minute: 15 },
            maghrib: { hour: 18, minute: 30 },
            isha: { hour: 19, minute: 45 }
        };

        this.weatherForecast = [];
    }

    // Initialize all enhanced features
    init() {
        this.updateWorldClock();
        this.updateDailyPoetry();
        this.updatePrayerTimes();
        this.generateWeatherForecast();
        
        // Set up intervals
        setInterval(() => this.updateWorldClock(), 1000);
        setInterval(() => this.updateDailyPoetry(), 24 * 60 * 60 * 1000); // Daily
        setInterval(() => this.updatePrayerTimes(), 60 * 1000); // Every minute
        
        console.log('✨ Enhanced features initialized');
    }

    // Update world clock for Iranian cities
    updateWorldClock() {
        const persianCalendar = new PersianCalendar();
        const iranTime = persianCalendar.getIranTime();

        Object.keys(this.iranianCities).forEach(cityKey => {
            const cityElement = document.querySelector(`[data-city="${cityKey}"] .city-clock`);
            if (cityElement) {
                const hours = iranTime.getHours().toString().padStart(2, '0');
                const minutes = iranTime.getMinutes().toString().padStart(2, '0');
                const seconds = iranTime.getSeconds().toString().padStart(2, '0');
                cityElement.textContent = `${hours}:${minutes}:${seconds}`;
            }
        });
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

    // Add voice announcement feature
    speakTime() {
        if ('speechSynthesis' in window) {
            const persianCalendar = new PersianCalendar();
            const iranTime = persianCalendar.getIranTime();
            const timeData = persianCalendar.getFormattedTime(iranTime);
            
            const timeText = `ساعت ${timeData.hours} و ${timeData.minutes} دقیقه`;
            
            const utterance = new SpeechSynthesisUtterance(timeText);
            utterance.lang = 'fa-IR';
            utterance.rate = 0.8;
            utterance.pitch = 1;
            
            speechSynthesis.speak(utterance);
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