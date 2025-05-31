# Claude CLI Integration Roadmap

## Overview
Replace API-based AI providers with Claude CLI for zero-API-key operation while maintaining full functionality.

## Phase 1: Core CLI Provider (Foundation)
**Goal**: Basic Claude CLI integration working

### 1.1 Create CLI Provider Module
- New separate module: `scripts/modules/claude-cli-provider.js`
- Implement streaming approach with `child_process.spawn()`
- Use `--print --output-format json` for structured responses

### 1.2 Prompt Integration  
- Port existing prompts to CLI (simple template literals)
- Research mode: use existing research enhancement (no modifications needed)
- Variable injection via standard JavaScript templates

### 1.3 Response Parsing
- Parse CLI JSON wrapper: `response.result` contains AI content
- Basic JSON extraction from result content (simple regex/string methods)
- Error handling via `response.is_error` field

## Phase 2: Feature Parity
**Goal**: CLI provider supports all current functionality

### 2.1 All Task Operations
- PRD-to-tasks generation
- Task expansion  
- Task addition
- Complexity analysis

### 2.2 Configuration
- CLI detection on startup (`claude --version`)
- Environment variable: `CLAUDE_CLI_MODE=true` (overrides all API config)
- Simple error handling for CLI failures

## Phase 3: CLI Integration  
**Goal**: CLI commands work with Claude CLI provider

### 3.1 Update Entry Points
- CLI commands (`scripts/` modules) 
- Route to CLI provider when `CLAUDE_CLI_MODE=true`

### 3.2 Validation
- Manual testing with actual Claude CLI
- Verify all task operations work

## Future Enhancements
- MCP server integration
- Enhanced error handling and diagnostics
- Comprehensive test suite
- Performance optimizations

## Key Decisions ✅ ALL RESOLVED

### Architecture Decisions
1. **Model Configuration**: ✅ User manages CLI configuration - no model selection needed
2. **Fallback Strategy**: ✅ CLI-only mode - no API fallbacks
3. **User Responsibility**: ✅ User installs and configures Claude CLI independently
4. **CLI Provider Location**: ✅ Separate module (`claude-cli-provider.js`)
5. **Research Mode**: ✅ Use existing research enhancement unchanged
6. **Integration Scope**: ✅ CLI commands only (MCP server in future)
7. **Configuration**: ✅ Follow existing API config pattern, `CLAUDE_CLI_MODE=true` overrides all
8. **CLI Detection**: ✅ Check `claude --version` on startup
9. **Error Handling**: ✅ Start simple, enhance later
10. **Testing**: ✅ Skip for initial implementation

## Success Criteria
- ✅ Generate tasks from PRD using only Claude CLI
- ✅ Research mode with WebSearch functionality
- ✅ All existing task operations supported
- ✅ Simple error handling for CLI failures
- ✅ CLI commands work with `CLAUDE_CLI_MODE=true`

## Implementation Notes
- **Large files**: Streaming via stdin handles automatically
- **JSON extraction**: CLI wrapper eliminates complex parsing
- **Variable injection**: spawn() arguments handle escaping
- **Research mode**: Existing prompts work with CLI WebSearch tools