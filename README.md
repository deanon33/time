# ایران زنده - Iran Live Dynamic Website

A real-time dynamic website that changes its appearance, theme, and experience based on Iran's current time, Persian calendar date, and Tehran's weather conditions.

## 🌟 Features

### ⏰ Real-Time Iran Time & Date
- Live display of Iran Standard Time (IRST/IRDT)
- Persian (Jalali) calendar with accurate date conversion
- Real-time updates without page refresh
- Beautiful Persian typography and RTL layout

### 🎨 Dynamic Time-Based Themes
The website automatically changes themes based on Iran's local time:

| Time Range | Theme | Description |
|------------|--------|-------------|
| 5:00 - 8:00 | سپیده‌دم (Dawn) | Soft blue tones with sunrise glow |
| 8:00 - 17:00 | روز (Day) | Bright themes with sunny effects |
| 17:00 - 20:00 | غروب (Sunset) | Orange/pink gradients with warm colors |
| 20:00 - 24:00 | شب (Night) | Dark themes with starry backgrounds |
| 0:00 - 5:00 | نیمه‌شب (Midnight) | Deep dark, calm atmosphere |

### 🌦️ Weather-Based Visual Effects
Real-time weather integration with Tehran:
- **Rainy**: Animated rain effects with ambient sounds
- **Snowy**: Falling snow animations with winter theme
- **Cloudy**: Moving cloud elements and gray atmosphere
- **Sunny**: Bright glowing effects with golden tones
- **Stormy**: Lightning flashes with rain effects
- **Misty**: Subtle fog overlay effects

### 🎉 Persian Holiday Celebrations
Special themes for important Persian dates:
- **نوروز (Nowruz)**: Spring blossoms, traditional music, New Year greetings
- **شب یلدا (Yalda Night)**: Pomegranate visuals, candle animations, festive poetry
- **چهارشنبه سوری (Chaharshanbe Suri)**: Fire festival effects
- **سیزده بدر (Sizdah Bedar)**: Nature day with green themes
- **مهرگان (Mehregan)**: Autumn festival celebrations

## 🚀 Quick Start

### For Web Hosting
1. Download all files to your web server
2. Upload to your hosting provider
3. Access `index.html` in your browser
4. The website works immediately with fallback data

### For Weather API (Optional)
1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Edit `weather-api.js` and replace `'demo_key'` with your API key:
   ```javascript
   this.apiKey = 'YOUR_API_KEY_HERE';
   ```
3. The website works without an API key using fallback weather data

## 📁 Project Structure

```
iran-live-website/
├── index.html              # Main HTML structure
├── styles.css              # Complete CSS with all themes
├── main.js                 # Application controller
├── persian-calendar.js     # Persian calendar conversion
├── weather-api.js          # Weather integration
├── themes.js               # Theme management system
├── special-events.js       # Persian holidays handler
├── README.md               # Documentation
└── audio/                  # Optional ambient sounds
    ├── nowruz-ambient.mp3
    ├── yalda-ambient.mp3
    └── nature-ambient.mp3
```

## 🛠️ Technical Features

### Performance Optimized
- Efficient real-time updates (1-second intervals for time)
- Smart caching for weather data (10-minute intervals)
- Pause updates when tab is hidden
- Minimal resource usage

### Responsive Design
- Mobile-first approach
- Works on all screen sizes
- Touch-friendly interface
- Optimized for both desktop and mobile

### Error Handling
- Graceful fallbacks for all APIs
- Offline functionality
- Error recovery mechanisms
- User-friendly error messages in Persian

### Accessibility
- RTL (Right-to-Left) layout for Persian text
- High contrast themes
- Keyboard navigation support
- Screen reader friendly

## 🎯 Browser Support

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 📱 Mobile Features

- Responsive design for all screen sizes
- Touch-optimized interface
- Swipe gestures support
- Mobile-specific optimizations

## 🔧 Customization

### Adding New Themes
Edit `themes.js` to add custom time-based themes:

```javascript
newTheme: {
    name: 'نام تم',
    description: 'توضیحات تم',
    startHour: 10,
    endHour: 14,
    className: 'theme-custom'
}
```

### Adding New Holidays
Edit `special-events.js` to add Persian holidays:

```javascript
newHoliday: {
    name: 'نام جشن',
    description: 'توضیحات جشن',
    startMonth: 1,
    startDay: 15,
    theme: 'custom-holiday'
}
```

### Customizing Weather
Edit `weather-api.js` to change location or add weather sources:

```javascript
this.city = 'Isfahan'; // Change city
this.countryCode = 'IR';
```

## 🌐 Deployment

### Static Hosting (Recommended)
- Upload files to any web server
- Works with GitHub Pages, Netlify, Vercel
- No server-side requirements
- Pure client-side application

### CDN Integration
The website uses external CDNs for:
- Google Fonts (Vazir Persian font)
- Font Awesome icons
- All other resources are self-contained

## 🔒 Privacy & Security

- No user data collection
- No cookies or tracking
- Weather data fetched anonymously
- All processing happens client-side

## 🐛 Debugging

### Debug Commands (Press Ctrl/Cmd + Key)
- **Ctrl+I**: Show debug information
- **Ctrl+R**: Refresh weather data
- **Ctrl+T**: Cycle through themes

### Console Functions
```javascript
debugApp()      // Show debug info
refreshApp()    // Refresh data
cycleThemes()   // Test themes
```

## 🤝 Contributing

Feel free to contribute by:
1. Adding new Persian holidays
2. Improving weather effects
3. Adding new themes
4. Translating to other languages
5. Optimizing performance

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Credits

- Persian calendar conversion algorithms
- OpenWeatherMap API for weather data
- Vazir font for beautiful Persian typography
- Font Awesome for icons

## 📞 Support

For questions or issues:
1. Check the browser console for error messages
2. Ensure internet connection for weather data
3. Try refreshing the page
4. Check if JavaScript is enabled

---

**Made with ❤️ for the Persian community**

*This website celebrates Iranian culture and provides a beautiful, dynamic experience that connects users with their homeland's time, weather, and traditions.*