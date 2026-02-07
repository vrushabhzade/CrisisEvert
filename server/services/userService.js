// User Service
// Handles user safety status, location updates, and alerts

const { getUsers, saveUsers } = require('./authService');
const alertService = require('./alertService'); // Reuse existing alert service

// Update User Status (Mark as Safe / Danger)
function updateUserStatus(userId, status, location) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        throw new Error('User not found');
    }

    users[userIndex].status = status;
    users[userIndex].lastCheckIn = new Date().toISOString();

    if (location) {
        users[userIndex].location = location;
    }

    saveUsers(users);

    // Simulate Alert if marked SAFE after being in DANGER
    if (status === 'SAFE') {
        console.log(`✅ User ${users[userIndex].name} marked themselves SAFE.`);
        alertService.sendSMS(users[userIndex].phone || 'FAMILY', `CRISISAVERT: ${users[userIndex].name} has marked themselves as SAFE at ${new Date().toLocaleTimeString()}.`);
    }

    return users[userIndex];
}

// Calculate Risk Level based on User Location vs Threats
function calculateUserRisk(userLocation, activeThreats) {
    if (!activeThreats || activeThreats.length === 0) return 'SAFE';
    if (!userLocation || !userLocation.lat || !userLocation.lon) return 'UNKNOWN';

    let maxRisk = 'SAFE';
    let closestThreat = null;
    let minDistance = Infinity;

    for (const threat of activeThreats) {
        // Parse threat coordinates
        let threatLat, threatLon;
        if (typeof threat.location.coords === 'string') {
            threatLat = parseFloat(threat.location.coords.split('°')[0]);
            threatLon = parseFloat(threat.location.coords.split(',')[1].split('°')[0]);
        } else if (threat.location.coords) {
            threatLat = threat.location.coords.lat;
            threatLon = threat.location.coords.lon;
        } else {
            continue;
        }

        const distance = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lon, threatLat, threatLon);
        const impactRadiusKm = (threat.impactRadius || 10000) / 1000;

        if (distance < minDistance) {
            minDistance = distance;
            closestThreat = threat;
        }

        if (distance <= impactRadiusKm) {
            return { status: 'DANGER', threat: threat, distance: distance };
        } else if (distance <= impactRadiusKm * 2) {
            maxRisk = 'CAUTION';
        }
    }

    return { status: maxRisk, threat: closestThreat, distance: minDistance };
}

// Helper: Haversine Distance
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

module.exports = {
    updateUserStatus,
    calculateUserRisk
};
