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

// Initialize MCP
mcpManager.init();

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
