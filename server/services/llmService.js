const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
// NOTE: Requires GEMINI_API_KEY in .env
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
let model = null;

if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
} else {
    console.warn("⚠️ GEMINI_API_KEY not found. LLM features will run in MOCK mode.");
}

async function assessSituation(threat, intel) {
    if (!model) return mockAssessment(threat);

    const prompt = `
    You are an AI Incident Commander.
    Analyze the following Threat and Intelligence Feed.
    
    THREAT: ${JSON.stringify(threat)}
    INTEL FEED: ${JSON.stringify(intel)}
    
    Output a JSON array of strings representing your sequential thought process (Reasoning Log).
    Limit to 5 steps.
    Example: ["Received distress signal..", "Analyzing wind vectors...", "Decision: Evacuate"]
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return JSON.parse(cleanJson(text));
    } catch (e) {
        console.error("LLM Assessment Failed", e);
        return mockAssessment(threat);
    }
}

async function planResponse(threat) {
    if (!model) return mockPlan(threat);

    const prompt = `
    Generate a Crisis Response Plan for: ${threat.type} at ${threat.location.name}.
    Severity: ${threat.severity}.
    
    Output JSON format:
    {
      "objectives": ["obj1", "obj2"],
      "timeline": [{"time": "T+0", "action": "...", "status": "COMPLETED"}],
      "resources": [{"item": "...", "quantity": 0, "location": "..."}]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return JSON.parse(cleanJson(text));
    } catch (e) {
        console.error("LLM Planning Failed", e);
        return mockPlan(threat);
    }
}

// Helpers
function cleanJson(text) {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

function mockAssessment(threat) {
    return [
        `[MOCK] Analyzing ${threat.type} data pattern...`,
        "[MOCK] Correlating with historical records...",
        "[MOCK] Assessing impact on critical infrastructure...",
        "[MOCK] Calculation complete: Severity High."
    ];
}

function mockPlan(threat) {
    return {
        objectives: ['[MOCK] Secure Perimeter', '[MOCK] Assess Damage'],
        timeline: [
            { time: 'T+0', action: 'Deploy Initial Team', status: 'COMPLETED' }
        ],
        resources: [
            { item: 'Generic Responders', quantity: 10, location: 'Local HQ' }
        ]
    };
}

module.exports = { assessSituation, planResponse };
