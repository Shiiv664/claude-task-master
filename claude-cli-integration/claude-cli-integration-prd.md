# Claude CLI Integration PRD

<context>
# Overview
Integrate Claude Code CLI as an alternative AI provider for Task Master, eliminating the need for API keys and leveraging users' existing Claude Code installations for PRD-to-tasks generation.

# Core Features
**Why**: Many users have Claude Code installed but may not have API access or prefer using their existing CLI setup. This reduces friction and configuration complexity, enabling Task Master to work with zero API key requirements.

**How**: Create a standalone Claude CLI provider that executes Claude Code CLI commands via Node.js child processes, pipes PRD content through stdin, and parses JSON responses from stdout. This provider should work independently without requiring API fallbacks.

# User Experience
**Target Users**: 
- Developers with Claude Code CLI installed
- Users who prefer avoiding API key management
- Teams wanting simplified setup processes
- Users without API access who want full Task Master functionality

**User Flow**:
1. User runs task generation command
2. System detects Claude CLI availability 
3. PRD content is piped to `claude` command with structured prompt
4. Generated tasks are parsed and validated same as API responses
5. System works completely with CLI-only setup (no API fallback required)

# Benefits
- Eliminates API key configuration requirements completely
- Uses existing Claude Code installation
- Potentially faster response times
- Simplified deployment and setup
- Enables full Task Master functionality with CLI-only setup
- No dependency on external API services or internet connectivity for AI providers
</context>

<PRD>
# Technical Architecture

## Provider Integration
- Extend existing `ai-services-unified.js` provider architecture
- Add `claude-cli` provider as a primary provider option
- Maintain consistent interface for task generation
- Support CLI-only operation mode without API provider dependencies
- Optional fallback to API providers when both CLI and API are configured

## Command Execution Strategy
- Use Node.js `child_process.spawn()` for Claude CLI execution
- Implement streaming for large PRD files via stdin
- Capture structured JSON output from stdout
- Handle stderr for error detection and logging

## Data Flow
```
PRD Content → Claude CLI Command → stdout JSON → Zod Validation → Task Objects
```

## Configuration Options
- CLI path detection and configuration
- Custom prompt templates for CLI usage
- Timeout settings for command execution
- CLI-only mode configuration (no API providers required)
- Optional fallback provider configuration when API providers are available

# Development Roadmap

## MVP Requirements
1. **CLI Provider Implementation**
   - Create `claude-cli.js` provider module
   - Implement command execution with proper error handling
   - Support structured prompt injection
   - Parse and validate JSON responses

2. **Configuration Integration**
   - Add CLI provider to unified AI service
   - Environment variable for Claude CLI path
   - Provider selection logic supporting CLI-only mode
   - CLI-first provider priority with optional API fallback
   - Support for zero-API-key operation

3. **Error Handling & Validation**
   - Command execution error detection
   - JSON parsing error recovery
   - Timeout handling for long-running commands
   - Consistent error reporting with existing providers

## Future Enhancements
- Support for other AI CLI tools (if available)
- Parallel execution with API providers for comparison
- CLI response caching for repeated PRD processing
- Interactive CLI mode detection and handling

# Logical Dependency Chain

## Foundation (Must Complete First)
1. **CLI Detection**: Implement Claude CLI availability checking
2. **Command Wrapper**: Create secure command execution utility
3. **JSON Parser**: Robust stdout parsing with error recovery

## Core Implementation 
4. **Provider Module**: claude-cli.js with unified interface
5. **Integration Layer**: Add to ai-services-unified.js
6. **Configuration**: Environment variables and fallback logic

## Testing & Validation
7. **Unit Tests**: Command execution and parsing logic
8. **Integration Tests**: End-to-end PRD processing
9. **Error Scenarios**: Timeout, invalid JSON, CLI not found

## Documentation & Polish
10. **Documentation**: Update README with CLI setup instructions
11. **Examples**: Sample CLI usage and configuration
12. **Error Messages**: User-friendly CLI-specific error guidance

# Risks and Mitigations

## Technical Challenges
**Risk**: Claude CLI output format changes
**Mitigation**: Version detection and format adaptation, robust JSON parsing

**Risk**: Large PRD files causing command line limits
**Mitigation**: File-based input instead of stdin for large content, chunk processing

**Risk**: Platform-specific CLI behavior differences
**Mitigation**: Cross-platform testing, OS-specific command handling

## Resource Constraints
**Risk**: CLI execution slower than API calls
**Mitigation**: Parallel execution options, timeout configuration

**Risk**: Users without Claude CLI installed
**Mitigation**: Clear error messages, installation guidance, API fallback

# Implementation Specifications

## Provider Interface
```javascript
class ClaudeCliProvider {
  async generateTasks(prdContent, options) {
    // Execute claude CLI command
    // Parse JSON response
    // Return validated task structure
  }
  
  async isAvailable() {
    // Check CLI installation and version
  }
}
```

## Command Structure
```bash
echo "PRD_CONTENT" | claude --prompt "STRUCTURED_PROMPT" --format json
```

## Configuration Variables
- `CLAUDE_CLI_PATH`: Custom path to claude executable
- `USE_CLAUDE_CLI`: Enable/disable CLI provider
- `CLI_ONLY_MODE`: Force CLI-only operation (no API providers)
- `CLI_TIMEOUT`: Command execution timeout (default: 60s)
- `CLI_FALLBACK_ENABLED`: Auto-fallback to API on CLI failure (only when APIs configured)

## Error Handling Categories
1. **CLI Not Found**: Installation guidance and clear setup instructions
2. **Execution Timeout**: Retry logic, fallback to API only if available and configured
3. **Invalid JSON**: Parse error recovery with helpful error messages
4. **Command Failed**: stderr analysis and reporting with actionable guidance
5. **CLI-Only Mode Failures**: Clear error messages without API fallback suggestions

# Success Criteria

## Functional Requirements
- ✅ Generate tasks from PRD using Claude CLI without any API dependencies
- ✅ Maintain existing task structure and validation
- ✅ Support CLI-only operation mode for users without API access
- ✅ Optional graceful fallback to API providers when available
- ✅ Cross-platform compatibility (Windows, macOS, Linux)

## Performance Requirements
- ✅ CLI execution completes within 60 seconds for typical PRDs
- ✅ No degradation of existing API provider performance
- ✅ Memory efficient command execution

## User Experience Requirements
- ✅ Zero additional configuration for users with Claude CLI (no API keys needed)
- ✅ Clear error messages for CLI-related issues
- ✅ Seamless integration with existing commands
- ✅ Documentation covers CLI-only setup and usage
- ✅ Works out-of-the-box for users with only Claude Code installed

# Appendix

## Research Notes
- Claude Code CLI supports structured prompts and JSON output
- Command execution security considerations for user input
- Cross-platform path resolution for executable detection
- Stdin streaming best practices for large content

## Alternative Approaches Considered
1. **File-based communication**: Write PRD to temp file, read response file
2. **Interactive mode**: Use expect/spawn for interactive CLI sessions  
3. **Docker wrapper**: Containerized CLI execution for consistency

Selected approach prioritizes simplicity and direct integration with existing provider pattern.