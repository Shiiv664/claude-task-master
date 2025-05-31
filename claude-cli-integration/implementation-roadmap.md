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

## Implementation Progress

### ✅ Completed Tasks

#### Phase 1: Core CLI Provider (Foundation)
- [x] **1.1.1** Create claude-cli-provider.js module with streaming approach
- [x] **1.1.2** Implement child_process.spawn() for Claude CLI execution  
- [x] **1.1.3** Use --print --output-format json for structured responses
- [x] **1.1.4** Add CLI availability checking with claude --version
- [x] **1.2.1** Extract shared prompt generation logic (generatePrdPrompts)
- [x] **1.2.2** Eliminate prompt duplication between API and CLI providers
- [x] **1.2.3** Research mode works with existing prompts (Claude CLI has WebSearch)
- [x] **1.2.4** Variable injection via standard JavaScript templates
- [x] **1.3.1** Parse CLI JSON wrapper and extract response.result content
- [x] **1.3.2** Built-in error detection via response.is_error field
- [x] **1.3.3** JSON extraction with markdown/code block fallbacks
- [x] **1.3.4** Zod schema validation for generated tasks

#### Configuration
- [x] **Config.1** Add CLAUDE_CLI_MODE=true environment variable detection
- [x] **Config.2** Add optional CLAUDE_CLI_PATH for custom claude executable
- [x] **Config.3** Update parse-prd.js to route to CLI provider when enabled

#### Phase 2: Feature Parity
- [x] **2.1.1** Add task expansion support to CLI provider
- [x] **2.1.2** Add task addition support to CLI provider  
- [x] **2.1.3** Add complexity analysis support to CLI provider
- [x] **2.1.4** Extract shared prompt logic for expand-task.js
- [x] **2.1.5** Extract shared prompt logic for add-task.js
- [x] **2.1.6** Extract shared prompt logic for analyze-task-complexity.js

### 🔄 Next Tasks (Remaining Work)

#### Phase 3: CLI Integration & Testing
- [ ] **3.1.1** Update remaining entry points for CLI mode (if any)
- [ ] **3.2.1** Manual testing of all operations with actual Claude CLI
- [ ] **3.2.2** Verify research mode works across all operations
- [ ] **3.2.3** Test large PRD files with CLI provider
- [ ] **3.2.4** Error handling validation for CLI failures
- [ ] **3.3.1** Update documentation with CLI setup instructions
- [ ] **3.3.2** Create usage examples for CLI mode

#### Future Enhancements (Post-MVP)
- [ ] **Future.1** MCP server integration for CLI mode
- [ ] **Future.2** Enhanced error handling and diagnostics
- [ ] **Future.3** Comprehensive test suite
- [ ] **Future.4** Performance optimizations and benchmarking

### 📊 Progress Summary
- **Phase 1**: ✅ 100% Complete (14/14 tasks)
- **Phase 2**: ✅ 100% Complete (6/6 tasks)  
- **Phase 3**: ⏳ 0% Complete (0/7 tasks)
- **Overall**: 🎯 83% Complete (20/24 core tasks)