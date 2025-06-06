#!/usr/bin/env node

import TaskMasterMCPServer from './src/index.js';
import dotenv from 'dotenv';
import logger from './src/logger.js';

// Load environment variables
dotenv.config();

// Set MCP server mode to suppress stdout logging that could contaminate JSON protocol
process.env.MCP_SERVER_MODE = 'true';

/**
 * Start the MCP server
 */
async function startServer() {
	const server = new TaskMasterMCPServer();

	// Handle graceful shutdown
	process.on('SIGINT', async () => {
		await server.stop();
		process.exit(0);
	});

	process.on('SIGTERM', async () => {
		await server.stop();
		process.exit(0);
	});

	try {
		await server.start();
	} catch (error) {
		logger.error(`Failed to start MCP server: ${error.message}`);
		process.exit(1);
	}
}

// Start the server
startServer();
