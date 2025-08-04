// Persian Calendar Conversion and Iran Time Functions

class PersianCalendar {
    constructor() {
        // Persian month names
        this.persianMonths = [
            'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
            'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
        ];

        // Persian day names
        this.persianDays = [
            'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'
        ];

        // English month names for Gregorian display
        this.englishMonths = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    }

    // Get current Iran time
    getIranTime() {
        const now = new Date();
        // Iran is UTC+3:30 (UTC+4:30 during DST)
        const iranOffset = 3.5 * 60; // 3.5 hours in minutes
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const iranTime = new Date(utc + (iranOffset * 60000));
        return iranTime;
    }

    // Convert Gregorian to Persian date
    gregorianToPersian(gregorianDate) {
        const gYear = gregorianDate.getFullYear();
        const gMonth = gregorianDate.getMonth() + 1;
        const gDay = gregorianDate.getDate();

        let pYear, pMonth, pDay;

        if (gYear <= 1600) {
            pYear = 0;
            pMonth = 0;
            pDay = 0;
        } else {
            const gy2 = (gYear > 1600) ? gYear - 1600 : gYear - 621;
            const gm2 = (gYear > 1600) ? gMonth : gMonth;
            const gd2 = (gYear > 1600) ? gDay : gDay;

            const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

            if (gYear > 1600) {
                const jy = (gy2 <= 33) ? gy2 : gy2 % 33;
                let jp = 0;
                for (let i = 0; i < jy; i++) {
                    if (this.isLeapPersian(979 + i)) jp++;
                }
                const jd = 365 * jy + jp + g_d_m[gm2 - 1] + gd2 - 1;
                
                if (gm2 > 2 && this.isLeapGregorian(gYear)) {
                    const jd2 = jd + 1;
                    pYear = 979 + 33 * Math.floor(gy2 / 33) + Math.floor(jd2 / 365.2422);
                    pMonth = Math.floor((jd2 % 365.2422) / 30.44) + 1;
                    pDay = Math.floor((jd2 % 365.2422) % 30.44) + 1;
                } else {
                    pYear = 979 + 33 * Math.floor(gy2 / 33) + Math.floor(jd / 365.2422);
                    pMonth = Math.floor((jd % 365.2422) / 30.44) + 1;
                    pDay = Math.floor((jd % 365.2422) % 30.44) + 1;
                }
            }
        }

        // Simplified conversion for better accuracy
        const baseGregorianYear = 1979;
        const basePersianYear = 1358;
        
        const daysDiff = Math.floor((gregorianDate - new Date(baseGregorianYear, 2, 21)) / (1000 * 60 * 60 * 24));
        const persianYear = basePersianYear + Math.floor(daysDiff / 365.25);
        
        // More accurate calculation
        const startOfPersianYear = this.persianToGregorian(persianYear, 1, 1);
        const dayOfYear = Math.floor((gregorianDate - startOfPersianYear) / (1000 * 60 * 60 * 24)) + 1;
        
        let persianMonth, persianDay;
        if (dayOfYear <= 186) { // First 6 months (31 days each)
            persianMonth = Math.ceil(dayOfYear / 31);
            persianDay = dayOfYear - (persianMonth - 1) * 31;
        } else { // Last 6 months (30 days each, except last month in leap years)
            const remainingDays = dayOfYear - 186;
            persianMonth = 6 + Math.ceil(remainingDays / 30);
            persianDay = remainingDays - (persianMonth - 7) * 30;
        }

        return {
            year: persianYear,
            month: Math.max(1, Math.min(12, persianMonth)),
            day: Math.max(1, Math.min(31, persianDay))
        };
    }

    // Convert Persian to Gregorian date (helper function)
    persianToGregorian(pYear, pMonth, pDay) {
        const baseGregorianYear = 1979;
        const basePersianYear = 1358;
        
        const yearDiff = pYear - basePersianYear;
        const baseDate = new Date(baseGregorianYear, 2, 21); // March 21, 1979
        
        let dayCount = yearDiff * 365 + Math.floor(yearDiff / 4); // Approximate leap years
        
        // Add days for months
        for (let i = 1; i < pMonth; i++) {
            if (i <= 6) {
                dayCount += 31;
            } else {
                dayCount += 30;
            }
        }
        
        dayCount += pDay - 1;
        
        return new Date(baseDate.getTime() + dayCount * 24 * 60 * 60 * 1000);
    }

    // Check if Gregorian year is leap
    isLeapGregorian(year) {
        return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
    }

    // Check if Persian year is leap
    isLeapPersian(year) {
        const breaks = [-14, 3, 13, 84, 111, 138, 180, 196, 207, 218, 231, 244, 256, 268, 283, 295, 309, 323, 334, 348, 360, 373, 386, 397, 411, 423, 436, 449, 464, 476, 490, 504, 516, 528, 541, 554, 568, 580, 594, 608, 620, 633, 645, 659, 673, 685, 699, 711, 725, 738, 752, 765, 779, 792, 806, 819, 833, 847, 860, 874, 887, 901, 915, 928, 942, 956, 969, 983, 997, 1010, 1024, 1037, 1051, 1065, 1078, 1092, 1106, 1119, 1133, 1147, 1160, 1174, 1188, 1201, 1215, 1229, 1242, 1256, 1270, 1283, 1297, 1311, 1324, 1338, 1352, 1365, 1379, 1393, 1406, 1420, 1434, 1447, 1461, 1475, 1488, 1502, 1516, 1529, 1543, 1557, 1570, 1584, 1598, 1611, 1625, 1639, 1652, 1666, 1680, 1693, 1707, 1721, 1734, 1748, 1762, 1775, 1789, 1803, 1816, 1830, 1844, 1857, 1871, 1885, 1898, 1912, 1926, 1939, 1953, 1967, 1980, 1994, 2008, 2021, 2035, 2049, 2062, 2076, 2090, 2103, 2117, 2131, 2144, 2158, 2172, 2185, 2199, 2213, 2226, 2240, 2254, 2267, 2281, 2295, 2308, 2322, 2336, 2349, 2363, 2377, 2390, 2404, 2418, 2431, 2445, 2459, 2472, 2486, 2500, 2513, 2527, 2541];
        
        let jp = breaks[0];
        let jump = 0;
        for (let j = 1; j < breaks.length; j++) {
            const jm = breaks[j];
            jump = jm - jp;
            if (year < jm) break;
            jp = jm;
        }
        
        let n = year - jp;
        if (n < jump) {
            if (jump - n < 6) n = n - jump + ((jump + 4) / 6) * 6;
            const leap = ((n + 1) % 33) % 4;
            if (jump === 33 && leap === 1) return true;
            if (leap === 1) return true;
        }
        return false;
    }

    // Get formatted Persian date string
    getFormattedPersianDate(date = null) {
        const iranTime = date || this.getIranTime();
        const persianDate = this.gregorianToPersian(iranTime);
        const dayName = this.persianDays[iranTime.getDay()];
        
        return {
            dayName: dayName,
            day: persianDate.day,
            month: this.persianMonths[persianDate.month - 1],
            year: persianDate.year,
            fullDate: `${dayName}، ${persianDate.day} ${this.persianMonths[persianDate.month - 1]} ${persianDate.year}`
        };
    }

    // Get formatted Gregorian date string
    getFormattedGregorianDate(date = null) {
        const iranTime = date || this.getIranTime();
        return `${iranTime.getDate()} ${this.englishMonths[iranTime.getMonth()]} ${iranTime.getFullYear()}`;
    }

    // Get formatted time string
    getFormattedTime(date = null) {
        const iranTime = date || this.getIranTime();
        const hours = iranTime.getHours().toString().padStart(2, '0');
        const minutes = iranTime.getMinutes().toString().padStart(2, '0');
        const seconds = iranTime.getSeconds().toString().padStart(2, '0');
        
        return {
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            fullTime: `${hours}:${minutes}:${seconds}`
        };
    }

    // Get time period in Persian
    getTimePeriod(date = null) {
        const iranTime = date || this.getIranTime();
        const hour = iranTime.getHours();
        
        if (hour >= 5 && hour < 8) {
            return 'سپیده‌دم';
        } else if (hour >= 8 && hour < 17) {
            return 'روز';
        } else if (hour >= 17 && hour < 20) {
            return 'غروب';
        } else if (hour >= 20 && hour < 24) {
            return 'شب';
        } else {
            return 'نیمه‌شب';
        }
    }

    // Convert Persian numbers to English
    persianToEnglishNumbers(str) {
        const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        
        for (let i = 0; i < persianNumbers.length; i++) {
            str = str.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
        }
        return str;
    }

    // Convert English numbers to Persian
    englishToPersianNumbers(str) {
        const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        
        for (let i = 0; i < englishNumbers.length; i++) {
            str = str.replace(new RegExp(englishNumbers[i], 'g'), persianNumbers[i]);
        }
        return str;
    }
}

// Export for use in other files
window.PersianCalendar = PersianCalendar;