// Special Persian Events and Holidays Handler

class SpecialEvents {
    constructor() {
        // Persian holidays and special events
        this.persianEvents = {
            // Nowruz (Persian New Year) - March 20-21
            nowruz: {
                name: 'نوروز مبارک',
                description: 'آغاز سال نو و بهار طبیعت',
                startMonth: 1, // Farvardin
                startDay: 1,
                duration: 13, // 13 days
                theme: 'nowruz',
                greeting: 'سال نو مبارک!',
                poetry: 'بهار آمد و نوروز رسید / دل ما شاد و خرم گردید',
                colors: ['#a8edea', '#fed6e3', '#ff6b9d'],
                music: 'nowruz-ambient.mp3'
            },
            
            // Yalda Night - December 21 (longest night)
            yalda: {
                name: 'شب یلدا',
                description: 'طولانی‌ترین شب سال',
                gregorianMonth: 12, // December
                gregorianDay: 21,
                theme: 'yalda',
                greeting: 'شب یلدا مبارک!',
                poetry: 'شب یلدا شب وصال است / شب عشق و دوستی است',
                colors: ['#8e2de2', '#4a00e0', '#ff6b6b'],
                music: 'yalda-ambient.mp3',
                symbols: ['🍎', '🍇', '🥜', '🕯️']
            },

            // Chaharshanbe Suri (Fire Festival) - Last Wednesday before Nowruz
            chaharshanbeSuri: {
                name: 'چهارشنبه سوری',
                description: 'جشن آتش و پاکی',
                beforeNowruz: 3, // 3 days before Nowruz
                theme: 'fire-festival',
                greeting: 'چهارشنبه سوری مبارک!',
                poetry: 'زردی من از تو، سرخی تو از من',
                colors: ['#ff6b35', '#f7931e', '#ffd23f'],
                music: 'fire-festival.mp3'
            },

            // Sizdah Bedar (Nature Day) - 13th day of Nowruz
            sizdahBedar: {
                name: 'سیزده بدر',
                description: 'روز طبیعت و پیکنیک',
                startMonth: 1, // Farvardin
                startDay: 13,
                theme: 'nature-day',
                greeting: 'سیزده بدر مبارک!',
                poetry: 'سیزده بدر آمد و طبیعت خندید',
                colors: ['#27ae60', '#2ecc71', '#58d68d'],
                music: 'nature-ambient.mp3'
            },

            // Mehregan (Festival of Mehr/Autumn)
            mehregan: {
                name: 'جشن مهرگان',
                description: 'جشن مهر و دوستی',
                startMonth: 7, // Mehr
                startDay: 16,
                theme: 'autumn-festival',
                greeting: 'مهرگان مبارک!',
                poetry: 'مهر آمد و مهربانی در دل نشست',
                colors: ['#e67e22', '#f39c12', '#d35400'],
                music: 'autumn-ambient.mp3'
            },

            // Shabe Qadr (Night of Power) - Variable Islamic date
            shabeQadr: {
                name: 'شب قدر',
                description: 'شب نزول قرآن',
                islamic: true, // Calculated based on Islamic calendar
                theme: 'spiritual-night',
                greeting: 'شب قدر مبارک!',
                poetry: 'شب قدر از هزار ماه بهتر است',
                colors: ['#2c3e50', '#34495e', '#5d6d7e'],
                music: 'spiritual-ambient.mp3'
            }
        };

        this.currentEvent = null;
        this.eventCheckInterval = 60 * 60 * 1000; // Check every hour
    }

    // Check if current date matches any special event
    checkForSpecialEvents(persianCalendar) {
        const iranTime = persianCalendar.getIranTime();
        const persianDate = persianCalendar.gregorianToPersian(iranTime);
        const gregorianDate = {
            month: iranTime.getMonth() + 1,
            day: iranTime.getDate()
        };

        // Check each event
        for (const [eventKey, event] of Object.entries(this.persianEvents)) {
            if (this.isEventActive(event, persianDate, gregorianDate, iranTime)) {
                this.currentEvent = { key: eventKey, ...event };
                return this.currentEvent;
            }
        }

        this.currentEvent = null;
        return null;
    }

    // Check if a specific event is active
    isEventActive(event, persianDate, gregorianDate, currentTime) {
        // Check Gregorian-based events (like Yalda)
        if (event.gregorianMonth && event.gregorianDay) {
            return gregorianDate.month === event.gregorianMonth && 
                   gregorianDate.day === event.gregorianDay;
        }

        // Check Persian calendar events
        if (event.startMonth && event.startDay) {
            if (event.duration) {
                // Multi-day events (like Nowruz)
                const eventStart = event.startDay;
                const eventEnd = event.startDay + event.duration - 1;
                
                return persianDate.month === event.startMonth &&
                       persianDate.day >= eventStart &&
                       persianDate.day <= eventEnd;
            } else {
                // Single day events
                return persianDate.month === event.startMonth &&
                       persianDate.day === event.startDay;
            }
        }

        // Check events relative to Nowruz (like Chaharshanbe Suri)
        if (event.beforeNowruz) {
            // Calculate the date that is X days before Nowruz
            const nowruzDate = new Date(currentTime.getFullYear(), 2, 20); // March 20
            const eventDate = new Date(nowruzDate.getTime() - (event.beforeNowruz * 24 * 60 * 60 * 1000));
            
            return currentTime.getMonth() === eventDate.getMonth() &&
                   currentTime.getDate() === eventDate.getDate();
        }

        return false;
    }

    // Apply special event theme
    applyEventTheme(event) {
        if (!event) return;

        const body = document.body;
        
        // Remove existing special themes
        body.classList.remove('theme-nowruz', 'theme-yalda', 'theme-fire-festival', 
                             'theme-nature-day', 'theme-autumn-festival', 'theme-spiritual-night');
        
        // Apply new theme
        body.classList.add(`theme-${event.theme}`);

        // Show special events section
        this.displayEventInfo(event);
        
        // Play ambient music if available
        this.playEventMusic(event);
        
        // Add special animations
        this.addEventAnimations(event);
    }

    // Display event information
    displayEventInfo(event) {
        const eventSection = document.getElementById('special-events');
        const eventTitle = document.getElementById('event-title');
        const eventDescription = document.getElementById('event-description');
        const eventCountdown = document.getElementById('event-countdown');

        if (eventSection && eventTitle && eventDescription) {
            eventSection.style.display = 'block';
            eventTitle.textContent = event.name;
            eventDescription.innerHTML = `
                <p>${event.description}</p>
                <p class="event-greeting">${event.greeting}</p>
                <p class="event-poetry"><em>"${event.poetry}"</em></p>
            `;

            // Add countdown for multi-day events
            if (event.duration && event.duration > 1) {
                const remainingDays = this.calculateRemainingDays(event);
                if (remainingDays > 0 && eventCountdown) {
                    eventCountdown.textContent = `${remainingDays} روز باقی مانده`;
                    eventCountdown.style.display = 'block';
                }
            }
        }
    }

    // Calculate remaining days for multi-day events
    calculateRemainingDays(event) {
        // This is a simplified calculation
        // In a real implementation, you'd calculate based on the actual event dates
        return Math.max(0, event.duration - 1);
    }

    // Play event-specific ambient music
    playEventMusic(event) {
        const audio = document.getElementById('ambient-audio');
        const source = document.getElementById('ambient-source');
        
        if (audio && source && event.music) {
            source.src = `audio/${event.music}`;
            audio.load();
            audio.volume = 0.3; // Low volume for ambient
            
            // Try to play (will fail if user hasn't interacted with page yet)
            audio.play().catch(e => {
                console.log('Audio autoplay prevented:', e);
            });
        }
    }

    // Add special animations for events
    addEventAnimations(event) {
        const effectsContainer = document.getElementById('weather-effects');
        
        switch (event.theme) {
            case 'nowruz':
                this.addNowruzAnimations(effectsContainer);
                break;
            case 'yalda':
                this.addYaldaAnimations(effectsContainer);
                break;
            case 'fire-festival':
                this.addFireAnimations(effectsContainer);
                break;
            case 'nature-day':
                this.addNatureAnimations(effectsContainer);
                break;
            case 'autumn-festival':
                this.addAutumnAnimations(effectsContainer);
                break;
            case 'spiritual-night':
                this.addSpiritualAnimations(effectsContainer);
                break;
        }
    }

    // Nowruz animations (flower petals)
    addNowruzAnimations(container) {
        const petalsDiv = document.createElement('div');
        petalsDiv.className = 'nowruz-petals';
        petalsDiv.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        `;

        // Create falling petals
        for (let i = 0; i < 20; i++) {
            const petal = document.createElement('div');
            petal.innerHTML = '🌸';
            petal.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                animation: petal-fall ${Math.random() * 3 + 2}s linear infinite;
                animation-delay: ${Math.random() * 2}s;
                font-size: ${Math.random() * 20 + 15}px;
            `;
            petalsDiv.appendChild(petal);
        }

        container.appendChild(petalsDiv);
    }

    // Yalda animations (candle flames)
    addYaldaAnimations(container) {
        const candlesDiv = document.createElement('div');
        candlesDiv.className = 'yalda-candles';
        candlesDiv.style.cssText = `
            position: absolute;
            bottom: 10%;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 20px;
        `;

        // Create candle flames
        for (let i = 0; i < 3; i++) {
            const candle = document.createElement('div');
            candle.innerHTML = '🕯️';
            candle.style.cssText = `
                font-size: 30px;
                animation: candle-flicker 2s ease-in-out infinite;
                animation-delay: ${i * 0.5}s;
            `;
            candlesDiv.appendChild(candle);
        }

        container.appendChild(candlesDiv);
    }

    // Fire festival animations
    addFireAnimations(container) {
        const fireDiv = document.createElement('div');
        fireDiv.className = 'fire-effect';
        fireDiv.innerHTML = '🔥';
        fireDiv.style.cssText = `
            position: absolute;
            bottom: 20%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 50px;
            animation: fire-dance 1s ease-in-out infinite;
        `;
        container.appendChild(fireDiv);
    }

    // Nature day animations (leaves)
    addNatureAnimations(container) {
        const leavesDiv = document.createElement('div');
        leavesDiv.className = 'nature-leaves';
        
        const leaves = ['🍃', '🌿', '🍀', '🌱'];
        for (let i = 0; i < 15; i++) {
            const leaf = document.createElement('div');
            leaf.innerHTML = leaves[Math.floor(Math.random() * leaves.length)];
            leaf.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                animation: leaf-sway ${Math.random() * 4 + 3}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
                font-size: ${Math.random() * 15 + 20}px;
            `;
            leavesDiv.appendChild(leaf);
        }
        
        container.appendChild(leavesDiv);
    }

    // Autumn festival animations
    addAutumnAnimations(container) {
        const autumnDiv = document.createElement('div');
        autumnDiv.className = 'autumn-leaves';
        
        const autumnLeaves = ['🍂', '🍁', '🍄'];
        for (let i = 0; i < 12; i++) {
            const leaf = document.createElement('div');
            leaf.innerHTML = autumnLeaves[Math.floor(Math.random() * autumnLeaves.length)];
            leaf.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                animation: autumn-fall ${Math.random() * 5 + 3}s linear infinite;
                animation-delay: ${Math.random() * 3}s;
                font-size: ${Math.random() * 10 + 20}px;
            `;
            autumnDiv.appendChild(leaf);
        }
        
        container.appendChild(autumnDiv);
    }

    // Spiritual night animations (stars)
    addSpiritualAnimations(container) {
        const starsDiv = document.createElement('div');
        starsDiv.className = 'spiritual-stars';
        
        for (let i = 0; i < 25; i++) {
            const star = document.createElement('div');
            star.innerHTML = '✨';
            star.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: star-twinkle ${Math.random() * 3 + 2}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
                font-size: ${Math.random() * 10 + 15}px;
            `;
            starsDiv.appendChild(star);
        }
        
        container.appendChild(starsDiv);
    }

    // Remove event theme
    removeEventTheme() {
        const body = document.body;
        const eventSection = document.getElementById('special-events');
        const audio = document.getElementById('ambient-audio');
        const effectsContainer = document.getElementById('weather-effects');

        // Remove theme classes
        body.classList.remove('theme-nowruz', 'theme-yalda', 'theme-fire-festival', 
                             'theme-nature-day', 'theme-autumn-festival', 'theme-spiritual-night');
        
        // Hide event section
        if (eventSection) {
            eventSection.style.display = 'none';
        }

        // Stop music
        if (audio) {
            audio.pause();
        }

        // Clear event animations
        const eventAnimations = effectsContainer.querySelectorAll('.nowruz-petals, .yalda-candles, .fire-effect, .nature-leaves, .autumn-leaves, .spiritual-stars');
        eventAnimations.forEach(element => element.remove());

        this.currentEvent = null;
    }

    // Initialize special events checking
    init(persianCalendar) {
        // Initial check
        this.checkAndApplyEvents(persianCalendar);
        
        // Set up periodic checking
        setInterval(() => {
            this.checkAndApplyEvents(persianCalendar);
        }, this.eventCheckInterval);
    }

    // Check and apply events
    checkAndApplyEvents(persianCalendar) {
        const event = this.checkForSpecialEvents(persianCalendar);
        
        if (event && (!this.currentEvent || this.currentEvent.key !== event.key)) {
            this.applyEventTheme(event);
        } else if (!event && this.currentEvent) {
            this.removeEventTheme();
        }
    }
}

// Add required CSS animations
const eventAnimationsCSS = `
@keyframes petal-fall {
    0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
}

@keyframes candle-flicker {
    0%, 100% { transform: scale(1) rotate(-1deg); }
    50% { transform: scale(1.1) rotate(1deg); }
}

@keyframes fire-dance {
    0%, 100% { transform: translateX(-50%) scale(1) rotate(-2deg); }
    50% { transform: translateX(-50%) scale(1.2) rotate(2deg); }
}

@keyframes leaf-sway {
    0%, 100% { transform: translateX(0px) rotate(0deg); }
    50% { transform: translateX(20px) rotate(10deg); }
}

@keyframes autumn-fall {
    0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}

@keyframes star-twinkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
}

@keyframes lightning {
    0%, 90%, 100% { opacity: 0; }
    5%, 10% { opacity: 1; }
}

.event-greeting {
    font-size: 1.5rem;
    color: #e74c3c;
    font-weight: 600;
    margin: 1rem 0;
}

.event-poetry {
    font-style: italic;
    opacity: 0.8;
    font-size: 1.1rem;
    margin: 1rem 0;
}
`;

// Inject animations CSS
const style = document.createElement('style');
style.textContent = eventAnimationsCSS;
document.head.appendChild(style);

// Export for use in other files
window.SpecialEvents = SpecialEvents;