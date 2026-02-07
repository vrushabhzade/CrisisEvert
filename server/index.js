const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for dev
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ status: 'online', service: 'CrisisAvert Oracle Engine' });
});

// Socket.io connection - The "Neural Link"
const { generateDataChunk, injectThreat } = require('./services/oracle');
const mcpManager = require('./services/mcpClient');
const alertService = require('./services/alertService');
const authService = require('./services/authService');
const userService = require('./services/userService');

// Initialize MCP
mcpManager.init();

// --- AUTHENTICATION ROUTES ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const result = await authService.registerUser(req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        res.json(result);
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

// --- USER SAFETY ROUTES ---
app.post('/api/user/status', authService.authenticateToken, (req, res) => {
    try {
        const { status, location } = req.body;
        const updatedUser = userService.updateUserStatus(req.user.id, status, location);
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/user/risk', authService.authenticateToken, async (req, res) => {
    try {
        const { location } = req.body;
        // In a real app, we'd fetch active threats from a shared state or DB
        // For now, we'll ask the Oracle for the latest threat if available
        // This is a simplified integration point
        const activeThreats = []; // This would need to be connected to the Oracle's current state
        const risk = userService.calculateUserRisk(location, activeThreats);
        res.json(risk);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

io.on('connection', (socket) => {
    console.log('Oracle Interface Connected:', socket.id);
    alertService.registerSocket(socket);

    // Simulation Control: Threat Injection
    socket.on('inject-threat', (threatType) => {
        console.log(`Command received: Inject ${threatType}`);
        injectThreat(threatType);
    });

    // Simulation: Send heartbeat
    const heartbeat = setInterval(() => {
        socket.emit('heartbeat', { timestamp: new Date(), status: 'monitoring' });
    }, 5000);

    // Simulation: Stream Data Chunks (Oracle Analysis)
    const dataStream = setInterval(async () => {
        const chunk = await generateDataChunk();
        socket.emit('oracle-stream', chunk);
    }, 3000); // New data every 3 seconds

    socket.on('disconnect', () => {
        console.log('Oracle Interface Disconnected:', socket.id);
        clearInterval(heartbeat);
        clearInterval(dataStream);
    });
});

// API endpoint for phase history (timeline)
const { getPhaseHistory } = require('./services/oracle');
app.get('/api/phase-history', (req, res) => {
    res.json(getPhaseHistory());
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`CrisisAvert Oracle Engine active on port ${PORT}`);
});
