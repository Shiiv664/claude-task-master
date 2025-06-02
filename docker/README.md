# Task Master MCP Server - Docker Setup

Run Task Master MCP server in a Docker container for use with MCP clients like Claude Desktop and Cursor.

## Quick Start

### 1. Build and Start Container

```bash
cd docker
docker-compose up -d
```

This creates a container named `task-master-mcp` that stays running and ready for MCP exec commands.

### 2. Configure MCP Client

Add this to your MCP configuration (Claude Desktop, Cursor, etc.):

#### Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "task-master": {
      "command": "docker",
      "args": [
        "exec", "-i", 
        "task-master-mcp", 
        "node", "/workspace/task-master/mcp-server/server.js"
      ]
    }
  }
}
```

#### Cursor (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "task-master": {
      "command": "docker",
      "args": [
        "exec", "-i", 
        "task-master-mcp", 
        "node", "/workspace/task-master/mcp-server/server.js"
      ],
      "env": {
        "CLAUDE_CLI_MODE": "true"
      }
    }
  }
}
```

## Configuration Options

### CLI Mode (Recommended - Zero Cost)
The container defaults to CLI mode. Ensure Claude Code CLI is available in your environment:

```bash
# The container will use CLAUDE_CLI_MODE=true by default
# No API keys needed!
```

### API Mode (Alternative)
If you prefer API mode, create a `.env` file:

```bash
# Copy example file
cp .env.example .env

# Edit with your API keys
CLAUDE_CLI_MODE=false
ANTHROPIC_API_KEY=your_key_here
# ... other keys
```

Then restart the container:
```bash
docker-compose down && docker-compose up -d
```

## Container Management

### View Logs
```bash
docker-compose logs -f task-master-mcp
```

### Access Container Shell
```bash
docker exec -it task-master-mcp /bin/sh
```

### Test MCP Server
```bash
# Test the MCP server directly
docker exec -i task-master-mcp node /workspace/task-master/mcp-server/server.js
```

### Stop Container
```bash
docker-compose down
```

### Rebuild Container
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Data Persistence

Project data is stored in a Docker volume `task-master-data` which persists across container restarts.

To use a host directory instead, uncomment this line in `docker-compose.yml`:
```yaml
# - ./project-data:/workspace/task-master/.taskmaster
```

## Available MCP Tools

Once configured, your MCP client will have access to:

- **parse_prd** - Generate tasks from PRD documents
- **expand_task** - Break tasks into subtasks  
- **add_task** - Create new tasks with AI assistance
- **analyze_complexity** - Analyze and score task complexity
- **update_task** - Update existing tasks
- **update_subtask** - Update subtasks
- **get_tasks** - View project tasks
- **And many more...**

## Zero-Cost Operation

With `CLAUDE_CLI_MODE=true` (default), all operations use Claude CLI instead of API calls:
- ✅ **No API costs** - Uses Claude Code CLI
- ✅ **Full functionality** - Same features as API mode
- ✅ **High quality** - Claude Sonnet model via CLI

## Troubleshooting

### Container Not Starting
```bash
# Check logs
docker-compose logs task-master-mcp

# Rebuild if needed
docker-compose build --no-cache
```

### MCP Connection Issues
```bash
# Verify container is running
docker ps | grep task-master-mcp

# Test MCP server manually
docker exec -i task-master-mcp node /workspace/task-master/mcp-server/server.js
```

### CLI Mode Issues
```bash
# Check if Claude CLI mode is enabled
docker exec task-master-mcp env | grep CLAUDE_CLI_MODE

# Test CLI availability (if mounted from host)
docker exec task-master-mcp which claude
```

## Advanced Usage

### Custom Configuration
Mount custom config files:
```yaml
volumes:
  - ./custom-config.json:/workspace/task-master/.taskmaster/config.json
```

### Development Mode
For development, mount the entire source:
```yaml
volumes:
  - ..:/workspace/task-master
```

### Network Access
If your MCP client needs network access to the container:
```yaml
ports:
  - "3001:3001"  # Expose MCP port if needed
```

## Security Notes

- Container runs as non-root user by default
- Only necessary ports are exposed
- Environment variables can be secured with Docker secrets
- Data volumes use appropriate permissions

## Integration Examples

### With GitHub Codespaces
```bash
# In codespace terminal
cd docker
docker-compose up -d

# Configure Cursor in codespace to use the container
```

### With Development Workflow
```bash
# Start container for development
docker-compose -f docker-compose.dev.yml up -d

# Use with local MCP clients
```

The Docker setup provides a clean, isolated environment for running Task Master MCP server while maintaining full functionality and zero-cost operation through Claude CLI integration.