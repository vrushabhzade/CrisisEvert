// OpenWeatherMap API Integration
// Fetches real-time weather data and detects severe weather threats

const axios = require('axios');

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Locations to monitor across India
const MONITORED_LOCATIONS = [
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
    { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
    { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
    { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
    { name: 'Kerala Backwaters', lat: 9.9312, lon: 76.2673 },
    { name: 'Uttarakhand', lat: 30.0668, lon: 79.0193 },
    { name: 'Nagpur', lat: 21.1458, lon: 79.0882 }
];

// Severity thresholds
const THRESHOLDS = {
    WIND_SPEED_HIGH: 15,      // m/s (~54 km/h)
    WIND_SPEED_EXTREME: 25,   // m/s (~90 km/h)
    RAIN_HEAVY: 50,           // mm/3h
    RAIN_EXTREME: 100,        // mm/3h
    PRESSURE_DROP: 990,       // hPa (low pressure system)
    TEMP_EXTREME_HIGH: 45,    // °C
    TEMP_EXTREME_LOW: 0       // °C
};

async function fetchWeatherData(location) {
    try {
        const response = await axios.get(`${BASE_URL}/weather`, {
            params: {
                lat: location.lat,
                lon: location.lon,
                appid: API_KEY,
                units: 'metric'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`❌ Weather API Error for ${location.name}:`, error.message);
        return null;
    }
}

async function fetchForecastData(location) {
    try {
        const response = await axios.get(`${BASE_URL}/forecast`, {
            params: {
                lat: location.lat,
                lon: location.lon,
                appid: API_KEY,
                units: 'metric',
                cnt: 8 // Next 24 hours (3-hour intervals)
            }
        });
        return response.data;
    } catch (error) {
        console.error(`❌ Forecast API Error for ${location.name}:`, error.message);
        return null;
    }
}

function detectWeatherThreat(weatherData, location) {
    if (!weatherData) return null;

    const { main, wind, rain, weather } = weatherData;
    let threat = null;

    // Heavy Rain / Flood Risk
    if (rain && rain['3h'] >= THRESHOLDS.RAIN_HEAVY) {
        const severity = rain['3h'] >= THRESHOLDS.RAIN_EXTREME ? 'EXTREME' : 'HIGH';
        threat = {
            type: 'FLOOD',
            name: `Heavy Rainfall - ${location.name}`,
            location: location,
            severity: severity,
            impactRadius: rain['3h'] >= THRESHOLDS.RAIN_EXTREME ? 25000 : 15000,
            details: {
                rainfall: rain['3h'],
                description: weather[0]?.description || 'Heavy rain',
                windSpeed: wind.speed,
                pressure: main.pressure
            }
        };
    }

    // Cyclone / High Wind
    else if (wind.speed >= THRESHOLDS.WIND_SPEED_HIGH) {
        const severity = wind.speed >= THRESHOLDS.WIND_SPEED_EXTREME ? 'EXTREME' : 'HIGH';
        threat = {
            type: 'CYCLONE',
            name: `High Wind Event - ${location.name}`,
            location: location,
            severity: severity,
            impactRadius: wind.speed >= THRESHOLDS.WIND_SPEED_EXTREME ? 30000 : 20000,
            details: {
                windSpeed: wind.speed,
                windGust: wind.gust || wind.speed,
                pressure: main.pressure,
                description: weather[0]?.description || 'Strong winds'
            }
        };
    }

    // Extreme Temperature
    else if (main.temp >= THRESHOLDS.TEMP_EXTREME_HIGH) {
        threat = {
            type: 'HEATWAVE',
            name: `Extreme Heat - ${location.name}`,
            location: location,
            severity: 'HIGH',
            impactRadius: 10000,
            details: {
                temperature: main.temp,
                feelsLike: main.feels_like,
                humidity: main.humidity,
                description: weather[0]?.description || 'Extreme heat'
            }
        };
    }

    return threat;
}

async function scanAllLocations() {
    const threats = [];

    for (const location of MONITORED_LOCATIONS) {
        const weatherData = await fetchWeatherData(location);
        const threat = detectWeatherThreat(weatherData, location);

        if (threat) {
            console.log(`⚠️ Weather Threat Detected: ${threat.name} (${threat.severity})`);
            threats.push(threat);
        }
    }

    return threats;
}

async function getWeatherForLocation(lat, lon) {
    const location = { name: 'Custom Location', lat, lon };
    const weatherData = await fetchWeatherData(location);
    return weatherData;
}

module.exports = {
    scanAllLocations,
    getWeatherForLocation,
    fetchForecastData,
    MONITORED_LOCATIONS
};
