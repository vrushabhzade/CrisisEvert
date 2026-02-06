// USGS Earthquake API Integration
// Fetches real-time earthquake data and detects significant seismic events

const axios = require('axios');

// USGS GeoJSON Feed URLs
const FEEDS = {
    HOUR: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
    DAY: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
    WEEK: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
};

// India and surrounding region bounds
const INDIA_BOUNDS = {
    minLat: 6.0,
    maxLat: 38.0,
    minLon: 68.0,
    maxLon: 98.0
};

// Magnitude thresholds
const MAGNITUDE_THRESHOLDS = {
    MINOR: 3.0,
    MODERATE: 4.5,
    STRONG: 6.0,
    MAJOR: 7.0
};

async function fetchEarthquakeData(feedType = 'DAY') {
    try {
        const response = await axios.get(FEEDS[feedType]);
        return response.data;
    } catch (error) {
        console.error('❌ Earthquake API Error:', error.message);
        return null;
    }
}

function isInIndiaRegion(lon, lat) {
    return lat >= INDIA_BOUNDS.minLat &&
        lat <= INDIA_BOUNDS.maxLat &&
        lon >= INDIA_BOUNDS.minLon &&
        lon <= INDIA_BOUNDS.maxLon;
}

function getSeverityFromMagnitude(magnitude) {
    if (magnitude >= MAGNITUDE_THRESHOLDS.MAJOR) return 'EXTREME';
    if (magnitude >= MAGNITUDE_THRESHOLDS.STRONG) return 'CRITICAL';
    if (magnitude >= MAGNITUDE_THRESHOLDS.MODERATE) return 'HIGH';
    return 'MODERATE';
}

function getImpactRadius(magnitude) {
    // Rough estimate: radius in meters
    // Mag 4.0 = 10km, Mag 5.0 = 30km, Mag 6.0 = 100km, Mag 7.0 = 300km
    return Math.pow(10, magnitude - 3) * 1000;
}

function parseEarthquakeFeature(feature) {
    const { geometry, properties } = feature;
    const [lon, lat, depth] = geometry.coordinates;
    const magnitude = properties.mag;
    const place = properties.place;
    const time = new Date(properties.time);

    return {
        type: 'EARTHQUAKE',
        name: `Earthquake - ${place}`,
        location: {
            name: place,
            coords: `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`
        },
        severity: getSeverityFromMagnitude(magnitude),
        impactRadius: getImpactRadius(magnitude),
        details: {
            magnitude: magnitude,
            depth: depth,
            time: time.toISOString(),
            place: place,
            coordinates: { lat, lon }
        }
    };
}

async function scanForEarthquakes(minMagnitude = 4.0) {
    const data = await fetchEarthquakeData('DAY');
    if (!data || !data.features) return [];

    const threats = [];

    for (const feature of data.features) {
        const [lon, lat] = feature.geometry.coordinates;
        const magnitude = feature.properties.mag;

        // Filter by magnitude and region
        if (magnitude >= minMagnitude && isInIndiaRegion(lon, lat)) {
            const threat = parseEarthquakeFeature(feature);
            console.log(`🌍 Earthquake Detected: Mag ${magnitude} at ${threat.location.name}`);
            threats.push(threat);
        }
    }

    return threats;
}

async function getRecentEarthquakes(hours = 24) {
    const data = await fetchEarthquakeData('DAY');
    if (!data || !data.features) return [];

    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);

    return data.features
        .filter(f => f.properties.time >= cutoffTime)
        .map(f => ({
            magnitude: f.properties.mag,
            place: f.properties.place,
            time: new Date(f.properties.time).toISOString(),
            coordinates: {
                lat: f.geometry.coordinates[1],
                lon: f.geometry.coordinates[0]
            }
        }));
}

// Calculate aftershock probability using Båth's Law
function predictAftershocks(mainshockMagnitude) {
    // Båth's Law: Largest aftershock is typically ~1.2 magnitude less
    const expectedMaxAftershock = mainshockMagnitude - 1.2;

    // Omori's Law: Aftershock rate decays with time
    // Probability decreases exponentially
    const probability24h = Math.min(0.95, Math.exp(-0.1 * (mainshockMagnitude - 5)));
    const probability7d = Math.min(0.7, Math.exp(-0.05 * (mainshockMagnitude - 5)));

    return {
        expectedMaxMagnitude: expectedMaxAftershock,
        probability24h: probability24h,
        probability7d: probability7d,
        riskLevel: mainshockMagnitude >= 6.0 ? 'HIGH' : 'MODERATE'
    };
}

module.exports = {
    scanForEarthquakes,
    getRecentEarthquakes,
    predictAftershocks,
    fetchEarthquakeData
};
