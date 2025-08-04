// Weather API Integration for Tehran, Iran

class WeatherAPI {
    constructor() {
        // OpenWeatherMap API key (free tier - users should replace with their own)
        this.apiKey = 'demo_key'; // Replace with actual API key
        this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
        this.city = 'Tehran';
        this.countryCode = 'IR';
        
        // Fallback weather data for when API is unavailable
        this.fallbackData = {
            main: {
                temp: 22,
                humidity: 45,
                feels_like: 24
            },
            weather: [{
                main: 'Clear',
                description: 'clear sky',
                icon: '01d'
            }],
            wind: {
                speed: 3.2
            },
            visibility: 10000,
            name: 'Tehran'
        };

        // Weather condition translations to Persian
        this.weatherTranslations = {
            'clear sky': 'آسمان صاف',
            'few clouds': 'کمی ابری',
            'scattered clouds': 'ابرهای پراکنده',
            'broken clouds': 'ابری',
            'overcast clouds': 'کاملاً ابری',
            'shower rain': 'رگبار',
            'rain': 'بارانی',
            'thunderstorm': 'رعد و برق',
            'snow': 'برفی',
            'mist': 'مه آلود',
            'fog': 'مه غلیظ',
            'haze': 'غبارآلود',
            'dust': 'گرد و غبار',
            'sand': 'طوفان شن',
            'smoke': 'دودآلود',
            'Clear': 'صاف',
            'Clouds': 'ابری',
            'Rain': 'بارانی',
            'Drizzle': 'نم‌نم باران',
            'Thunderstorm': 'رعد و برق',
            'Snow': 'برفی',
            'Mist': 'مه آلود',
            'Fog': 'مه غلیظ',
            'Haze': 'غبارآلود',
            'Dust': 'گرد و غبار',
            'Sand': 'طوفان شن',
            'Smoke': 'دودآلود'
        };

        // Weather icons mapping
        this.weatherIcons = {
            '01d': 'fas fa-sun', // clear sky day
            '01n': 'fas fa-moon', // clear sky night
            '02d': 'fas fa-cloud-sun', // few clouds day
            '02n': 'fas fa-cloud-moon', // few clouds night
            '03d': 'fas fa-cloud', // scattered clouds
            '03n': 'fas fa-cloud',
            '04d': 'fas fa-cloud', // broken clouds
            '04n': 'fas fa-cloud',
            '09d': 'fas fa-cloud-rain', // shower rain
            '09n': 'fas fa-cloud-rain',
            '10d': 'fas fa-cloud-sun-rain', // rain day
            '10n': 'fas fa-cloud-moon-rain', // rain night
            '11d': 'fas fa-bolt', // thunderstorm
            '11n': 'fas fa-bolt',
            '13d': 'fas fa-snowflake', // snow
            '13n': 'fas fa-snowflake',
            '50d': 'fas fa-smog', // mist
            '50n': 'fas fa-smog'
        };

        this.lastWeatherData = null;
        this.lastUpdateTime = null;
        this.updateInterval = 10 * 60 * 1000; // Update every 10 minutes
    }

    // Get weather data with caching
    async getWeatherData() {
        // Check if we have recent data
        if (this.lastWeatherData && this.lastUpdateTime && 
            (Date.now() - this.lastUpdateTime) < this.updateInterval) {
            return this.lastWeatherData;
        }

        try {
            const data = await this.fetchWeatherFromAPI();
            this.lastWeatherData = data;
            this.lastUpdateTime = Date.now();
            return data;
        } catch (error) {
            console.warn('Weather API failed, using fallback data:', error);
            return this.processFallbackData();
        }
    }

    // Fetch weather from OpenWeatherMap API
    async fetchWeatherFromAPI() {
        const url = `${this.baseUrl}?q=${this.city},${this.countryCode}&appid=${this.apiKey}&units=metric&lang=en`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return this.processWeatherData(data);
    }

    // Process fallback data
    processFallbackData() {
        console.log('Using fallback weather data');
        return this.processWeatherData(this.fallbackData);
    }

    // Process weather data into standardized format
    processWeatherData(rawData) {
        const weather = rawData.weather[0];
        const main = rawData.main;
        const wind = rawData.wind;

        return {
            temperature: Math.round(main.temp),
            feelsLike: Math.round(main.feels_like),
            humidity: main.humidity,
            description: this.translateWeather(weather.description),
            mainCondition: this.translateWeather(weather.main),
            icon: this.getWeatherIcon(weather.icon),
            windSpeed: Math.round(wind.speed * 3.6), // Convert m/s to km/h
            visibility: rawData.visibility ? Math.round(rawData.visibility / 1000) : 10,
            location: rawData.name || 'تهران',
            weatherCode: weather.main.toLowerCase(),
            iconCode: weather.icon,
            timestamp: Date.now()
        };
    }

    // Translate weather condition to Persian
    translateWeather(condition) {
        return this.weatherTranslations[condition] || condition;
    }

    // Get appropriate Font Awesome icon for weather condition
    getWeatherIcon(iconCode) {
        return this.weatherIcons[iconCode] || 'fas fa-question';
    }

    // Get weather-based theme
    getWeatherTheme(weatherData) {
        const condition = weatherData.weatherCode;
        const iconCode = weatherData.iconCode;

        if (condition.includes('rain') || condition.includes('drizzle')) {
            return 'rainy';
        } else if (condition.includes('snow')) {
            return 'snowy';
        } else if (condition.includes('cloud')) {
            return 'cloudy';
        } else if (condition.includes('clear')) {
            return iconCode.includes('n') ? 'clear-night' : 'sunny';
        } else if (condition.includes('thunderstorm')) {
            return 'stormy';
        } else if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze')) {
            return 'misty';
        } else {
            return 'default';
        }
    }

    // Create weather effects based on current weather
    createWeatherEffects(weatherTheme) {
        const effectsContainer = document.getElementById('weather-effects');
        effectsContainer.innerHTML = ''; // Clear existing effects

        switch (weatherTheme) {
            case 'rainy':
                this.createRainEffect(effectsContainer);
                break;
            case 'snowy':
                this.createSnowEffect(effectsContainer);
                break;
            case 'cloudy':
                this.createCloudEffect(effectsContainer);
                break;
            case 'stormy':
                this.createStormEffect(effectsContainer);
                break;
            default:
                break;
        }
    }

    // Create rain effect
    createRainEffect(container) {
        const rainDiv = document.createElement('div');
        rainDiv.className = 'rain-effect';
        container.appendChild(rainDiv);
    }

    // Create snow effect
    createSnowEffect(container) {
        const snowDiv = document.createElement('div');
        snowDiv.className = 'snow-effect';
        
        // Create multiple snowflakes
        for (let i = 0; i < 50; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            snowflake.innerHTML = '❄';
            snowflake.style.left = Math.random() * 100 + '%';
            snowflake.style.animationDuration = (Math.random() * 3 + 2) + 's';
            snowflake.style.animationDelay = Math.random() * 2 + 's';
            snowDiv.appendChild(snowflake);
        }
        
        container.appendChild(snowDiv);
    }

    // Create cloud effect
    createCloudEffect(container) {
        const cloudDiv = document.createElement('div');
        cloudDiv.className = 'cloud-effect';
        container.appendChild(cloudDiv);
    }

    // Create storm effect
    createStormEffect(container) {
        this.createRainEffect(container);
        // Add lightning flashes
        const stormDiv = document.createElement('div');
        stormDiv.className = 'storm-effect';
        stormDiv.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.1);
            animation: lightning 4s infinite;
        `;
        container.appendChild(stormDiv);
    }

    // Update weather display in the UI
    updateWeatherDisplay(weatherData) {
        // Update temperature
        const tempElement = document.getElementById('temperature');
        if (tempElement) {
            tempElement.textContent = `${weatherData.temperature}°C`;
        }

        // Update description
        const descElement = document.getElementById('weather-description');
        if (descElement) {
            descElement.textContent = weatherData.description;
        }

        // Update icon
        const iconElement = document.getElementById('weather-icon');
        if (iconElement) {
            iconElement.innerHTML = `<i class="${weatherData.icon}"></i>`;
        }

        // Update humidity
        const humidityElement = document.getElementById('humidity');
        if (humidityElement) {
            humidityElement.textContent = `${weatherData.humidity}%`;
        }

        // Update wind speed
        const windElement = document.getElementById('wind-speed');
        if (windElement) {
            windElement.textContent = `${weatherData.windSpeed} کیلومتر/ساعت`;
        }

        // Update visibility
        const visibilityElement = document.getElementById('visibility');
        if (visibilityElement) {
            visibilityElement.textContent = `${weatherData.visibility} کیلومتر`;
        }

        // Update location
        const locationElement = document.getElementById('location');
        if (locationElement) {
            locationElement.textContent = `${weatherData.location}، ایران`;
        }
    }

    // Initialize weather updates
    init() {
        // Initial weather fetch
        this.updateWeather();
        
        // Set up periodic updates
        setInterval(() => {
            this.updateWeather();
        }, this.updateInterval);
    }

    // Update weather data and display
    async updateWeather() {
        try {
            const weatherData = await this.getWeatherData();
            this.updateWeatherDisplay(weatherData);
            
            const weatherTheme = this.getWeatherTheme(weatherData);
            this.createWeatherEffects(weatherTheme);
            
            // Dispatch custom event for theme changes
            const event = new CustomEvent('weatherUpdate', {
                detail: { weatherData, weatherTheme }
            });
            document.dispatchEvent(event);
            
        } catch (error) {
            console.error('Failed to update weather:', error);
        }
    }
}

// Export for use in other files
window.WeatherAPI = WeatherAPI;