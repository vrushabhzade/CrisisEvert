// Mock Shelter Database for CrisisAvert
// 50+ shelters across major Indian cities

const SHELTERS = [
    // Mumbai Region
    { id: 1, name: "Mumbai Central Shelter", lat: 19.0176, lon: 72.8562, capacity: 500, current: 120, petFriendly: true, accessible: true, resources: { water: 1000, food: 800, blankets: 400 } },
    { id: 2, name: "Bandra Community Center", lat: 19.0596, lon: 72.8295, capacity: 300, current: 85, petFriendly: false, accessible: true, resources: { water: 600, food: 500, blankets: 250 } },
    { id: 3, name: "Andheri Sports Complex", lat: 19.1136, lon: 72.8697, capacity: 800, current: 0, petFriendly: true, accessible: true, resources: { water: 1500, food: 1200, blankets: 600 } },

    // Nagpur Region
    { id: 4, name: "Nagpur Emergency Center", lat: 21.1458, lon: 79.0882, capacity: 400, current: 50, petFriendly: true, accessible: true, resources: { water: 800, food: 600, blankets: 350 } },
    { id: 5, name: "Sitabuldi Fort Shelter", lat: 21.1466, lon: 79.0882, capacity: 250, current: 0, petFriendly: false, accessible: false, resources: { water: 500, food: 400, blankets: 200 } },

    // Delhi Region
    { id: 6, name: "Delhi Red Cross Center", lat: 28.6139, lon: 77.2090, capacity: 1000, current: 200, petFriendly: true, accessible: true, resources: { water: 2000, food: 1500, blankets: 800 } },
    { id: 7, name: "Connaught Place Shelter", lat: 28.6315, lon: 77.2167, capacity: 600, current: 150, petFriendly: false, accessible: true, resources: { water: 1200, food: 900, blankets: 500 } },
    { id: 8, name: "Dwarka Community Hall", lat: 28.5921, lon: 77.0460, capacity: 450, current: 0, petFriendly: true, accessible: true, resources: { water: 900, food: 700, blankets: 400 } },

    // Bangalore Region
    { id: 9, name: "Bangalore Tech Park Shelter", lat: 12.9716, lon: 77.5946, capacity: 700, current: 100, petFriendly: true, accessible: true, resources: { water: 1400, food: 1000, blankets: 600 } },
    { id: 10, name: "Whitefield Emergency Center", lat: 12.9698, lon: 77.7499, capacity: 500, current: 0, petFriendly: false, accessible: true, resources: { water: 1000, food: 800, blankets: 450 } },

    // Chennai Region
    { id: 11, name: "Chennai Marina Shelter", lat: 13.0827, lon: 80.2707, capacity: 600, current: 180, petFriendly: true, accessible: true, resources: { water: 1200, food: 900, blankets: 500 } },
    { id: 12, name: "T Nagar Community Center", lat: 13.0418, lon: 80.2341, capacity: 400, current: 50, petFriendly: false, accessible: true, resources: { water: 800, food: 600, blankets: 350 } },

    // Kolkata Region
    { id: 13, name: "Kolkata Central Shelter", lat: 22.5726, lon: 88.3639, capacity: 800, current: 250, petFriendly: true, accessible: true, resources: { water: 1600, food: 1200, blankets: 700 } },
    { id: 14, name: "Salt Lake Stadium Shelter", lat: 22.5645, lon: 88.4114, capacity: 1200, current: 0, petFriendly: true, accessible: true, resources: { water: 2400, food: 1800, blankets: 1000 } },

    // Hyderabad Region
    { id: 15, name: "Hyderabad HITEC City Shelter", lat: 17.4485, lon: 78.3908, capacity: 550, current: 75, petFriendly: true, accessible: true, resources: { water: 1100, food: 850, blankets: 500 } },
    { id: 16, name: "Charminar Emergency Center", lat: 17.3616, lon: 78.4747, capacity: 350, current: 0, petFriendly: false, accessible: false, resources: { water: 700, food: 550, blankets: 300 } },

    // Pune Region
    { id: 17, name: "Pune University Shelter", lat: 18.5204, lon: 73.8567, capacity: 650, current: 120, petFriendly: true, accessible: true, resources: { water: 1300, food: 1000, blankets: 600 } },
    { id: 18, name: "Kothrud Community Hall", lat: 18.5074, lon: 73.8077, capacity: 400, current: 0, petFriendly: false, accessible: true, resources: { water: 800, food: 600, blankets: 400 } },

    // Ahmedabad Region
    { id: 19, name: "Ahmedabad Relief Center", lat: 23.0225, lon: 72.5714, capacity: 500, current: 90, petFriendly: true, accessible: true, resources: { water: 1000, food: 750, blankets: 450 } },
    { id: 20, name: "Sabarmati Shelter", lat: 23.0759, lon: 72.5893, capacity: 350, current: 0, petFriendly: false, accessible: true, resources: { water: 700, food: 550, blankets: 300 } },

    // Jaipur Region
    { id: 21, name: "Jaipur Pink City Shelter", lat: 26.9124, lon: 75.7873, capacity: 450, current: 60, petFriendly: true, accessible: true, resources: { water: 900, food: 700, blankets: 400 } },
    { id: 22, name: "Amer Fort Emergency Center", lat: 26.9855, lon: 75.8513, capacity: 300, current: 0, petFriendly: false, accessible: false, resources: { water: 600, food: 450, blankets: 250 } },

    // Kerala Region (Flood-prone)
    { id: 23, name: "Kochi Waterfront Shelter", lat: 9.9312, lon: 76.2673, capacity: 700, current: 200, petFriendly: true, accessible: true, resources: { water: 1400, food: 1100, blankets: 650 } },
    { id: 24, name: "Alappuzha Backwater Center", lat: 9.4981, lon: 76.3388, capacity: 500, current: 150, petFriendly: true, accessible: true, resources: { water: 1000, food: 800, blankets: 500 } },
    { id: 25, name: "Thiruvananthapuram Relief", lat: 8.5241, lon: 76.9366, capacity: 600, current: 0, petFriendly: false, accessible: true, resources: { water: 1200, food: 900, blankets: 550 } },

    // Uttarakhand (Earthquake/Landslide prone)
    { id: 26, name: "Dehradun Mountain Shelter", lat: 30.3165, lon: 78.0322, capacity: 400, current: 50, petFriendly: true, accessible: false, resources: { water: 800, food: 600, blankets: 400 } },
    { id: 27, name: "Rishikesh Emergency Center", lat: 30.0869, lon: 78.2676, capacity: 350, current: 0, petFriendly: false, accessible: false, resources: { water: 700, food: 550, blankets: 350 } },
    { id: 28, name: "Haridwar Relief Camp", lat: 29.9457, lon: 78.1642, capacity: 500, current: 0, petFriendly: true, accessible: true, resources: { water: 1000, food: 750, blankets: 500 } },

    // Gujarat Coast (Cyclone-prone)
    { id: 29, name: "Surat Coastal Shelter", lat: 21.1702, lon: 72.8311, capacity: 600, current: 100, petFriendly: true, accessible: true, resources: { water: 1200, food: 900, blankets: 600 } },
    { id: 30, name: "Vadodara Emergency Hall", lat: 22.3072, lon: 73.1812, capacity: 450, current: 0, petFriendly: false, accessible: true, resources: { water: 900, food: 700, blankets: 450 } },

    // Odisha Coast (Cyclone-prone)
    { id: 31, name: "Bhubaneswar Cyclone Shelter", lat: 20.2961, lon: 85.8245, capacity: 800, current: 0, petFriendly: true, accessible: true, resources: { water: 1600, food: 1200, blankets: 800 } },
    { id: 32, name: "Puri Beach Shelter", lat: 19.8135, lon: 85.8312, capacity: 550, current: 0, petFriendly: true, accessible: true, resources: { water: 1100, food: 850, blankets: 550 } },

    // Additional Major Cities
    { id: 33, name: "Lucknow Central Shelter", lat: 26.8467, lon: 80.9462, capacity: 500, current: 75, petFriendly: true, accessible: true, resources: { water: 1000, food: 750, blankets: 500 } },
    { id: 34, name: "Kanpur Relief Center", lat: 26.4499, lon: 80.3319, capacity: 400, current: 0, petFriendly: false, accessible: true, resources: { water: 800, food: 600, blankets: 400 } },
    { id: 35, name: "Indore Emergency Hall", lat: 22.7196, lon: 75.8577, capacity: 450, current: 60, petFriendly: true, accessible: true, resources: { water: 900, food: 700, blankets: 450 } },
    { id: 36, name: "Bhopal Community Center", lat: 23.2599, lon: 77.4126, capacity: 500, current: 0, petFriendly: false, accessible: true, resources: { water: 1000, food: 750, blankets: 500 } },
    { id: 37, name: "Chandigarh Sector 17 Shelter", lat: 30.7333, lon: 76.7794, capacity: 550, current: 90, petFriendly: true, accessible: true, resources: { water: 1100, food: 850, blankets: 550 } },
    { id: 38, name: "Patna Emergency Center", lat: 25.5941, lon: 85.1376, capacity: 450, current: 0, petFriendly: false, accessible: true, resources: { water: 900, food: 700, blankets: 450 } },
    { id: 39, name: "Guwahati Flood Shelter", lat: 26.1445, lon: 91.7362, capacity: 600, current: 150, petFriendly: true, accessible: true, resources: { water: 1200, food: 900, blankets: 600 } },
    { id: 40, name: "Visakhapatnam Beach Shelter", lat: 17.6868, lon: 83.2185, capacity: 500, current: 0, petFriendly: true, accessible: true, resources: { water: 1000, food: 750, blankets: 500 } },
];

// Helper function to find shelters near a location
function findNearestShelters(lat, lon, count = 5) {
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    return SHELTERS
        .map(shelter => ({
            ...shelter,
            distance: calculateDistance(lat, lon, shelter.lat, shelter.lon),
            available: shelter.capacity - shelter.current
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, count);
}

// Get shelters in a specific region
function getSheltersInRegion(minLat, maxLat, minLon, maxLon) {
    return SHELTERS.filter(shelter =>
        shelter.lat >= minLat && shelter.lat <= maxLat &&
        shelter.lon >= minLon && shelter.lon <= maxLon
    ).map(shelter => ({
        ...shelter,
        available: shelter.capacity - shelter.current
    }));
}

module.exports = {
    SHELTERS,
    findNearestShelters,
    getSheltersInRegion
};
