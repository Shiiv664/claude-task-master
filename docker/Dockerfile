# Task Master MCP Server Docker Image
FROM node:20-alpine

# Set working directory to match expected path
WORKDIR /workspace/task-master

# Install system dependencies
RUN apk add --no-cache \
    git \
    bash \
    curl

# Copy package files first for better caching
COPY package*.json ./

# Copy application code first (needed for prepare script)
COPY . .

# Install dependencies (skip prepare script initially)
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Make files executable (manually run prepare script commands)
RUN chmod +x bin/task-master.js mcp-server/server.js || true

# Create necessary directories with proper permissions
RUN mkdir -p .taskmaster/tasks .taskmaster/docs .taskmaster/reports

# Keep container running for docker exec commands
CMD ["tail", "-f", "/dev/null"]