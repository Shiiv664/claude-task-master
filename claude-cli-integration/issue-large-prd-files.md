# Issue: Large PRD Files

## Problem
Claude CLI only accepts input via stdin piping. Large PRD files may hit shell command line limits when using basic piping approaches like `cat file.md | claude "prompt"`.

## Solution: Streaming Process Communication
Use Node.js `child_process.spawn()` to create Claude CLI process and stream content directly to stdin. This bypasses shell command line limits while preserving full PRD context.

**Command Structure:**
```bash
echo "PRD_CONTENT" | claude --print --model claude-sonnet-4 "SYSTEM_PROMPT"
```

**Implementation Approach:**
- Use `spawn('claude', ['--print', '--model', 'model-name', 'prompt'])`
- Stream PRD content to `process.stdin`
- Capture output from `process.stdout`
- Handle errors from `process.stderr`

## Benefits
- No shell command line length restrictions
- Streaming handles large files efficiently
- Preserves full PRD context for better task generation
- Works with actual Claude CLI interface
- Better process control and error handling

## Compatibility
✅ Verified compatible with Claude CLI `--print` flag and stdin piping