const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");
const path = require('path');
const fs = require('fs');

// Path to MCP configuration
const MCP_CONFIG_PATH = path.resolve(__dirname, '../../../.agent/crisisavert/mcp.json');

class MCPClientManager {
    constructor() {
        this.clients = new Map();
        this.config = null;
    }

    async init() {
        try {
            console.log("Initializing MCP Clients...");
            const configFile = fs.readFileSync(MCP_CONFIG_PATH, 'utf8');
            this.config = JSON.parse(configFile);

            for (const [serverName, serverConfig] of Object.entries(this.config.mcpServers)) {
                if (serverConfig.priority === 'critical' || serverConfig.priority === 'high') {
                    await this.connectServer(serverName, serverConfig);
                }
            }
            console.log("MCP Init Complete. Connected servers:", Array.from(this.clients.keys()));
        } catch (error) {
            console.error("Failed to initialize MCP Clients:", error);
        }
    }

    async connectServer(name, config) {
        try {
            console.log(`Connecting to MCP Server: ${name}...`);

            // Parse command and args
            // Note: In a real environment, we'd need to handle env vars and full paths more robustly
            // For this implementation, we assume 'npx' is in PATH.

            const transport = new StdioClientTransport({
                command: config.command,
                args: config.args,
                env: process.env // Inherit allow env vars for keys
            });

            const client = new Client({
                name: "CrisisAvert-Oracle",
                version: "1.0.0",
            }, {
                capabilities: {
                    prompts: {},
                    resources: {},
                    tools: {},
                },
            });

            await client.connect(transport);
            this.clients.set(name, client);
            console.log(`✅ Connected to ${name}`);

        } catch (err) {
            console.error(`❌ Failed to connect to ${name}:`, err.message);
        }
    }

    getClient(name) {
        return this.clients.get(name);
    }

    async callTool(serverName, toolName, args) {
        const client = this.clients.get(serverName);
        if (!client) {
            console.warn(`MCP Server '${serverName}' not connected.`);
            return null;
        }

        try {
            const result = await client.callTool({
                name: toolName,
                arguments: args
            });
            return result;
        } catch (error) {
            console.error(`Error calling tool ${toolName} on ${serverName}:`, error);
            return null;
        }
    }
}

const mcpManager = new MCPClientManager();
// mcpManager.init(); // Init is called by the server

module.exports = mcpManager;
