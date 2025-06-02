# Task Master with Claude CLI Integration 🚀

[![Original Repo](https://img.shields.io/badge/Original%20Repo-eyaltoledano/claude--task--master-blue)](https://github.com/eyaltoledano/claude-task-master) [![Fork Stars](https://img.shields.io/github/stars/Shiiv664/claude-task-master?style=social)](https://github.com/Shiiv664/claude-task-master/stargazers) [![License: MIT with Commons Clause](https://img.shields.io/badge/license-MIT%20with%20Commons%20Clause-blue.svg)](LICENSE)

> **🎯 This is a fork of the original [Task Master](https://github.com/eyaltoledano/claude-task-master) by [@eyaltoledano](https://x.com/eyaltoledano) & [@RalphEcom](https://x.com/RalphEcom), enhanced with complete Claude CLI integration for zero-API-key operation.**

## ✨ Fork Enhancements

### **🆓 Zero-API-Key Operation**
- **Complete Claude CLI integration** - Use Claude Code CLI instead of API calls
- **No usage costs** - Eliminate API charges while maintaining full functionality
- **Same high-quality results** - Claude Sonnet model through CLI interface

### **🔧 Easy Setup**
```bash
# Enable CLI mode
export CLAUDE_CLI_MODE=true

# Use all existing commands - no changes needed!
node scripts/dev.js parse-prd project.md -n 10 -f --research
```

### **📋 Full Feature Parity**
All Task Master functionality works identically in CLI mode:
- ✅ PRD-to-tasks generation with research mode
- ✅ Task expansion into detailed subtasks  
- ✅ AI-powered task addition and complexity analysis
- ✅ Task and subtask updates with bulk operations
- ✅ MCP server integration for Claude Desktop/Cursor

### **📚 Comprehensive Documentation**
- **[CLI Setup Guide](docs/claude-cli-setup.md)** - Complete configuration instructions
- **[Usage Examples](docs/claude-cli-examples.md)** - Real-world workflows and scenarios
- **[Validation Tools](claude-cli-integration/)** - Automated setup verification

---

## 🙏 Original Project

**Task Master** is an exceptional AI-driven task management system created by [@eyaltoledano](https://x.com/eyaltoledano) & [@RalphEcom](https://x.com/RalphEcom), designed to work seamlessly with Cursor AI.

**Original Repository:** https://github.com/eyaltoledano/claude-task-master

## Requirements

### **Option 1: Claude CLI Mode (Recommended - Zero Cost)**
For zero-API-key operation using Claude CLI:
- **Claude Code CLI** installed and configured ([Download here](https://claude.ai/code))
- Set `CLAUDE_CLI_MODE=true` environment variable
- **No API keys required** - Uses Claude CLI for all operations

### **Option 2: API Mode (Original)**
Task Master utilizes AI across several commands, and those require a separate API key. You can use a variety of models from different AI providers provided you add your API keys. For example, if you want to use Claude 3.7, you'll need an Anthropic API key.

You can define 3 types of models to be used: the main model, the research model, and the fallback model (in case either the main or research fail). Whatever model you use, its provider API key must be present in either mcp.json or .env.

At least one (1) of the following is required:

- Anthropic API key (Claude API)
- OpenAI API key
- Google Gemini API key
- Perplexity API key (for research model)
- xAI API Key (for research or main model)
- OpenRouter API Key (for research or main model)

Using the research model is optional but highly recommended. You will need at least ONE API key. Adding all API keys enables you to seamlessly switch between model providers at will.

## Quick Start

### **Option 1: Claude CLI Mode (Zero Cost)**

```bash
# 1. Install Claude Code CLI (if not already installed)
# Visit: https://claude.ai/code

# 2. Enable CLI mode
export CLAUDE_CLI_MODE=true

# 3. Verify setup
node claude-cli-integration/validate-cli-integration.js

# 4. Start using Task Master with zero API costs!
node scripts/dev.js parse-prd my-project.md -n 10 -f --research
```

**See the [complete CLI setup guide](docs/claude-cli-setup.md) for detailed instructions.**

### Option 2: MCP (API Mode)

MCP (Model Control Protocol) lets you run Task Master directly from your editor.

#### 1. Add your MCP config at the following path depending on your editor

| Editor       | Scope   | Linux/macOS Path                      | Windows Path                                      | Key          |
| ------------ | ------- | ------------------------------------- | ------------------------------------------------- | ------------ |
| **Cursor**   | Global  | `~/.cursor/mcp.json`                  | `%USERPROFILE%\.cursor\mcp.json`                  | `mcpServers` |
|              | Project | `<project_folder>/.cursor/mcp.json`   | `<project_folder>\.cursor\mcp.json`               | `mcpServers` |
| **Windsurf** | Global  | `~/.codeium/windsurf/mcp_config.json` | `%USERPROFILE%\.codeium\windsurf\mcp_config.json` | `mcpServers` |
| **VS Code**  | Project | `<project_folder>/.vscode/mcp.json`   | `<project_folder>\.vscode\mcp.json`               | `servers`    |

##### Cursor & Windsurf (`mcpServers`)

```jsonc
{
	"mcpServers": {
		"taskmaster-ai": {
			"command": "npx",
			"args": ["-y", "--package=task-master-ai", "task-master-ai"],
			"env": {
				"ANTHROPIC_API_KEY": "YOUR_ANTHROPIC_API_KEY_HERE",
				"PERPLEXITY_API_KEY": "YOUR_PERPLEXITY_API_KEY_HERE",
				"OPENAI_API_KEY": "YOUR_OPENAI_KEY_HERE",
				"GOOGLE_API_KEY": "YOUR_GOOGLE_KEY_HERE",
				"MISTRAL_API_KEY": "YOUR_MISTRAL_KEY_HERE",
				"OPENROUTER_API_KEY": "YOUR_OPENROUTER_KEY_HERE",
				"XAI_API_KEY": "YOUR_XAI_KEY_HERE",
				"AZURE_OPENAI_API_KEY": "YOUR_AZURE_KEY_HERE",
				"OLLAMA_API_KEY": "YOUR_OLLAMA_API_KEY_HERE"
			}
		}
	}
}
```

> 🔑 Replace `YOUR_…_KEY_HERE` with your real API keys. You can remove keys you don't use.

##### VS Code (`servers` + `type`)

```jsonc
{
	"servers": {
		"taskmaster-ai": {
			"command": "npx",
			"args": ["-y", "--package=task-master-ai", "task-master-ai"],
			"env": {
				"ANTHROPIC_API_KEY": "YOUR_ANTHROPIC_API_KEY_HERE",
				"PERPLEXITY_API_KEY": "YOUR_PERPLEXITY_API_KEY_HERE",
				"OPENAI_API_KEY": "YOUR_OPENAI_KEY_HERE",
				"GOOGLE_API_KEY": "YOUR_GOOGLE_KEY_HERE",
				"MISTRAL_API_KEY": "YOUR_MISTRAL_KEY_HERE",
				"OPENROUTER_API_KEY": "YOUR_OPENROUTER_KEY_HERE",
				"XAI_API_KEY": "YOUR_XAI_KEY_HERE",
				"AZURE_OPENAI_API_KEY": "YOUR_AZURE_KEY_HERE"
			},
			"type": "stdio"
		}
	}
}
```

> 🔑 Replace `YOUR_…_KEY_HERE` with your real API keys. You can remove keys you don't use.

#### 2. (Cursor-only) Enable Taskmaster MCP

Open Cursor Settings (Ctrl+Shift+J) ➡ Click on MCP tab on the left ➡ Enable task-master-ai with the toggle

#### 3. (Optional) Configure the models you want to use

In your editor’s AI chat pane, say:

```txt
Change the main, research and fallback models to <model_name>, <model_name> and <model_name> respectively.
```

[Table of available models](docs/models.md)

#### 4. Initialize Task Master

In your editor’s AI chat pane, say:

```txt
Initialize taskmaster-ai in my project
```

#### 5. Make sure you have a PRD in `<project_folder>/scripts/prd.txt`

An example of a PRD is located into `<project_folder>/scripts/example_prd.txt`.

**Always start with a detailed PRD.**

The more detailed your PRD, the better the generated tasks will be.

#### 6. Common Commands

Use your AI assistant to:

- Parse requirements: `Can you parse my PRD at scripts/prd.txt?`
- Plan next step: `What’s the next task I should work on?`
- Implement a task: `Can you help me implement task 3?`
- Expand a task: `Can you help me expand task 4?`

[More examples on how to use Task Master in chat](docs/examples.md)

### Option 2: Using Command Line

#### Installation

```bash
# Install globally
npm install -g task-master-ai

# OR install locally within your project
npm install task-master-ai
```

#### Initialize a new project

```bash
# If installed globally
task-master init

# If installed locally
npx task-master init
```

This will prompt you for project details and set up a new project with the necessary files and structure.

#### Common Commands

```bash
# Initialize a new project
task-master init

# Parse a PRD and generate tasks
task-master parse-prd your-prd.txt

# List all tasks
task-master list

# Show the next task to work on
task-master next

# Generate task files
task-master generate
```

## Documentation

For more detailed information, check out the documentation in the `docs` directory:

- [Configuration Guide](docs/configuration.md) - Set up environment variables and customize Task Master
- [Tutorial](docs/tutorial.md) - Step-by-step guide to getting started with Task Master
- [Command Reference](docs/command-reference.md) - Complete list of all available commands
- [Task Structure](docs/task-structure.md) - Understanding the task format and features
- [Example Interactions](docs/examples.md) - Common Cursor AI interaction examples

## Troubleshooting

### If `task-master init` doesn't respond:

Try running it with Node directly:

```bash
node node_modules/claude-task-master/scripts/init.js
```

Or clone the repository and run:

```bash
git clone https://github.com/eyaltoledano/claude-task-master.git
cd claude-task-master
node scripts/init.js
```

## Contributors

<a href="https://github.com/eyaltoledano/claude-task-master/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=eyaltoledano/claude-task-master" alt="Task Master project contributors" />
</a>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=eyaltoledano/claude-task-master&type=Timeline)](https://www.star-history.com/#eyaltoledano/claude-task-master&Timeline)

## Licensing

Task Master is licensed under the MIT License with Commons Clause. This means you can:

✅ **Allowed**:

- Use Task Master for any purpose (personal, commercial, academic)
- Modify the code
- Distribute copies
- Create and sell products built using Task Master

❌ **Not Allowed**:

- Sell Task Master itself
- Offer Task Master as a hosted service
- Create competing products based on Task Master

See the [LICENSE](LICENSE) file for the complete license text and [licensing details](docs/licensing.md) for more information.
