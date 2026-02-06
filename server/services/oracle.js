// Simulates the CrisisAvert "Oracle" Analysis Engine
// Generates data corresponding to the 5 Operational Phases

const { assessSituation, planResponse } = require('./llmService');
const { findNearestShelters, getSheltersInRegion } = require('../data/shelterData');

const PHASES = {
    MONITORING: 'PHASE 1: DETECTION & MONITORING',
    ASSESSMENT: 'PHASE 2: THREAT ASSESSMENT',
    PLANNING: 'PHASE 3: RESPONSE PLANNING',
    EXECUTION: 'PHASE 4: EXECUTION & COORDINATION',
    REVIEW: 'PHASE 5: LEARNING & IMPROVEMENT'
};

const LOCATIONS = [
    { name: 'Nagpur', coords: '21.1458° N, 79.0882° E' },
    { name: 'Mumbai', coords: '19.0760° N, 72.8777° E' },
    { name: 'Dharamshala', coords: '32.2190° N, 76.3234° E' },
    { name: 'Uttarakhand Forest', coords: '30.0668° N, 79.0193° E' }, // Wildfire
    { name: 'Kerala Backwaters', coords: '9.9312° N, 76.2673° E' }  // Flood
];

let currentPhase = PHASES.MONITORING;
let currentThreat = null;
let simulationStep = 0;
let intelFeed = []; // Stores found news items
let reasoningLog = []; // Stores AI thought process
let forcedThreatType = null; // For Threat Injection
let generatedPlan = null; // Store LLM plan
let alertSent = false; // Prevent spamming alerts
let phaseHistory = []; // Store last 10 phases for timeline

// Severity color mapping
const SEVERITY_COLORS = {
    SAFE: '#10b981',      // green-500
    CAUTION: '#eab308',   // yellow-500
    WARNING: '#f97316',   // orange-500
    DANGER: '#ef4444',    // red-500
    EXTREME: '#000000'    // black
};

const mcpManager = require('./mcpClient');
const alertService = require('./alertService');

// PRIVACY MODE: Zero Retention
const ZERO_RETENTION = process.env.ZERO_RETENTION === 'true';

// Mock Data Generators - Still needed for Phase 1 Intel
function mockSearchForThreats() {
    if (forcedThreatType === 'WILDFIRE') {
        return [
            { source: 'Forest Dept', title: 'Large fire spotted in Garhwal range', time: '2 mins ago' },
            { source: 'Satellite (MODIS)', title: 'Thermal anomaly detected', time: '10 mins ago' }
        ];
    }
    if (forcedThreatType === 'FLOOD') {
        return [
            { source: 'Central Water Comm', title: 'River Periyar above danger mark', time: '15 mins ago' },
            { source: 'Local News', title: 'Low lying areas inundated', time: 'Now' }
        ];
    }
    // Default Earthquake
    return [
        { source: 'Global Disaster Alert', title: 'Seismic activity detected in Northern India', time: '10 mins ago' },
        { source: 'Local News', title: 'Tremors felt in Himachal Pradesh', time: '5 mins ago' },
        { source: 'Social Media', title: '#Earthquake trending in Dharamshala', time: 'Just now' }
    ];
}

function generateExecutionLog(threatType) {
    if (threatType === 'WILDFIRE') {
        return {
            status: 'FIREFIGHTING OPS',
            actionsTaken: ['Perimeter established', 'Residents evacuated', 'Water bombing started'],
            priorities: ['Prevent spread to village', 'Monitor wind shift'],
            casualties: 0,
            resources: { deployed: '90%', enRoute: '10%' },
            generatedSitRep: true
        };
    }
    if (threatType === 'EARTHQUAKE') {
        return {
            status: 'SEARCH & RESCUE OPS',
            actionsTaken: ['Deployed 2 Battalions', 'Drone Grid Active', 'Power Grid Shutdown (Safety)'],
            priorities: ['Reach cut-off villages', 'Clear landslides', 'Medical evac'],
            casualties: 142,
            resources: { deployed: '65%', enRoute: '35%' },
            generatedSitRep: true
        };
    }
    return {
        status: 'ACTIVE RESPONSE',
        actionsTaken: ['Deployed 4 NDRF Teams', 'Evacuated 5000 people'],
        priorities: ['restore power to hospital', 'clear highway debris'],
        casualties: 0,
        resources: { deployed: '80%', enRoute: '20%' },
        generatedSitRep: true
    };
}

function injectThreat(type) {
    console.log(`💉 Injecting Threat: ${type}`);
    if (ZERO_RETENTION) console.log("🔒 ZERO RETENTION: Clearing previous context safely.");

    forcedThreatType = type;
    simulationStep = 0; // Reset cycle
    currentPhase = PHASES.MONITORING; // Restart from monitoring
    currentThreat = null;
    intelFeed = [];
    reasoningLog = [];
    generatedPlan = null;
}

async function generateDataChunk() {
    simulationStep++;

    // Cycle Logic
    if (simulationStep > 35) {
        simulationStep = 0;
        currentPhase = PHASES.MONITORING;
        currentThreat = null;
        intelFeed = [];
        reasoningLog = [];
        generatedPlan = null;
        if (!forcedThreatType) forcedThreatType = 'EARTHQUAKE'; // Default loop
    } else if (simulationStep > 28) {
        currentPhase = PHASES.REVIEW;
    } else if (simulationStep > 18) {
        currentPhase = PHASES.EXECUTION;
    } else if (simulationStep > 12) {
        currentPhase = PHASES.PLANNING;
    } else if (simulationStep > 5) {
        currentPhase = PHASES.ASSESSMENT;
    } else {
        currentPhase = PHASES.MONITORING;
    }

    // Dynamic State Updates
    if (currentPhase === PHASES.MONITORING && simulationStep === 4) {
        // "Find" Intel
        intelFeed = mockSearchForThreats();
    }

    if (currentPhase === PHASES.ASSESSMENT) {
        // Define Threat Object if first step of assessment
        if (!currentThreat) {
            if (forcedThreatType === 'WILDFIRE') {
                currentThreat = {
                    type: 'WILDFIRE',
                    name: 'Uttarakhand Forest Fire',
                    location: LOCATIONS[3],
                    severity: 'HIGH',
                    impactRadius: 15000
                };
            } else if (forcedThreatType === 'FLOOD') {
                currentThreat = {
                    type: 'FLOOD',
                    name: 'Kerala Flash Floods',
                    location: LOCATIONS[4],
                    severity: 'EXTREME',
                    impactRadius: 25000
                };
            } else {
                currentThreat = {
                    type: 'EARTHQUAKE',
                    name: 'Himachal Seismic Event',
                    location: LOCATIONS[2],
                    severity: 'CRITICAL',
                    impactRadius: 50000
                };
            }
        }

        // Call LLM for Reasoning (only do this once or incrementally)
        if (reasoningLog.length === 0) {
            reasoningLog = ['Thinking...']; // Placeholder
            // Async call - will populate in next ticks
            assessSituation(currentThreat, intelFeed).then(thoughts => {
                reasoningLog = thoughts;
            });
        }

        // Trigger Alerts if Critical
        if (!alertSent && (currentThreat.severity === 'CRITICAL' || currentThreat.severity === 'EXTREME' || currentThreat.severity === 'HIGH')) {
            alertSent = true;
            setTimeout(() => {
                if (currentThreat.type === 'FIRE' || currentThreat.type === 'WILDFIRE') {
                    alertService.sendSMS('FOREST_RANGER_HQ', `URGENT: Wildfire detected at ${currentThreat.location.name}. Immediate mobilization required.`);
                    alertService.sendEmail('district_magistrate@gov.in', 'Evacuation Order Request', 'Based on wind trajectory, Sector 4 needs evacuation.');
                } else if (currentThreat.type === 'FLOOD') {
                    alertService.sendRadioAlert('108.5 MHz', 'FLASH FLOOD WARNING. SEEK HIGHER GROUND IMMEDIATELY.');
                    alertService.sendSMS('NDRF_COMMAND', 'Deploy Water Rescue Teams to Kerala Backwaters - Sector 7.');
                } else {
                    alertService.sendSMS('NDRF_COMMAND', `Seismic Event confirmed at ${currentThreat.location.name}. Magnitude Estimate 6.8.`);
                }
            }, 1000); // Slight delay for effect
        }
    }

    // Generate Plan with LLM if entering planning phase
    if (currentPhase === PHASES.PLANNING && !generatedPlan) {
        generatedPlan = { objectives: ['Generating Strategy...'], timeline: [], resources: [] };
        planResponse(currentThreat).then(plan => {
            generatedPlan = plan;
        });
    }

    let payload = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        phase: currentPhase,
        timestamp: new Date().toISOString(),
        content: {}
    };

    // Live Data Fetching Logic (Best Effort)
    let weatherData = { temp: 12, condition: 'Mist', wind: 5 };
    if (forcedThreatType === 'WILDFIRE') weatherData = { temp: 34, condition: 'Smoke', wind: 25 };

    switch (currentPhase) {
        case PHASES.MONITORING:
            payload.content = {
                status: intelFeed.length > 0 ? 'ANALYZING INTEL' : 'WATCHING',
                activeThreats: [],
                weather: weatherData,
                metrics: { seismic: intelFeed.length > 0 ? 'High Activity' : 'Normal', noaa: 'Green' },
                intel: intelFeed
            };
            break;

        case PHASES.ASSESSMENT:
            payload.content = {
                threat: currentThreat,
                severity: currentThreat.severity === 'EXTREME' ? '🚨 EXTREME' : '🔴 CRITICAL',
                confidence: '92%',
                reasoning: reasoningLog, // LIVE LLM DATA
                timeline: {
                    status: 'Active & Expanding',
                    expectedImpact: 'Immediate',
                    peakIntensity: 'Now'
                },
                impactForecast: {
                    zone: 'Visualized on Map',
                    populationAtRisk: 'Calculating...',
                    infrastructure: ['Roads', 'Power Lines']
                }
            };
            break;

        case PHASES.PLANNING:
            payload.content = generatedPlan || { objectives: [], timeline: [], resources: [] };
            break;

        case PHASES.EXECUTION:
            payload.content = generateExecutionLog(currentThreat?.type || 'EARTHQUAKE');
            break;

        case PHASES.REVIEW:
            payload.content = {
                predictionAccuracy: '95%',
                successes: ['Rapid mobilization', 'AI detected early tremors'],
                failures: ['Mountain access blocked'],
                lessons: ['Deploy drones for initial survey']
            };

            // AUTOMATIC SANITIZATION
            if (ZERO_RETENTION && simulationStep > 34) {
                console.log("🔒 ZERO RETENTION: Wiping Sensitive Mission Data.");
                intelFeed = [];
                reasoningLog = [];
                currentThreat = null;
            }
            break;
    }

    // Enhance payload with multi-layer data
    if (currentThreat) {
        const threatLat = parseFloat(currentThreat.location.coords.split('°')[0]);
        const threatLon = parseFloat(currentThreat.location.coords.split(',')[1].split('°')[0]);

        // Add severity color
        payload.severityLevel = getThreatSeverity(currentThreat);
        payload.severityColor = SEVERITY_COLORS[payload.severityLevel];

        // Find nearby shelters
        payload.shelters = findNearestShelters(threatLat, threatLon, 10);

        // Generate evacuation routes
        payload.evacuationRoutes = generateEvacuationRoutes(threatLat, threatLon);
    }

    // Store in phase history for timeline
    storePhaseHistory(payload);

    return payload;
}

// Helper: Get severity level based on threat type
function getThreatSeverity(threat) {
    if (!threat) return 'SAFE';

    if (threat.severity === 'EXTREME' || threat.severity === 'CRITICAL') return 'EXTREME';
    if (threat.severity === 'HIGH') return 'DANGER';
    if (threat.severity === 'MODERATE') return 'WARNING';
    if (threat.severity === 'LOW') return 'CAUTION';
    return 'SAFE';
}

// Helper: Generate evacuation routes based on threat location
function generateEvacuationRoutes(threatLat, threatLon) {
    // Simple mock routes - in production, use routing API
    const routes = [];
    const directions = [
        { name: 'North Route', angle: 0 },
        { name: 'East Route', angle: 90 },
        { name: 'South Route', angle: 180 },
        { name: 'West Route', angle: 270 }
    ];

    directions.forEach(dir => {
        const distance = 0.5; // ~50km
        const radians = (dir.angle * Math.PI) / 180;
        const endLat = threatLat + (distance * Math.cos(radians));
        const endLon = threatLon + (distance * Math.sin(radians));

        routes.push({
            name: dir.name,
            coordinates: [
                { lat: threatLat, lon: threatLon },
                { lat: endLat, lon: endLon }
            ],
            status: 'open', // 'open', 'congested', 'closed'
            distance_km: distance * 111 // rough conversion
        });
    });

    return routes;
}

// Store phase history for timeline
function storePhaseHistory(payload) {
    phaseHistory.push({
        ...payload,
        timestamp: new Date().toISOString()
    });

    // Keep only last 10 phases
    if (phaseHistory.length > 10) {
        phaseHistory.shift();
    }
}

// Get phase history
function getPhaseHistory() {
    return phaseHistory;
}

module.exports = { generateDataChunk, injectThreat, getPhaseHistory };
