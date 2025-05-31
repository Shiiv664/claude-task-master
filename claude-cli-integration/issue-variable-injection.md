# Issue: Variable Injection in Prompts

## Problem
The current Task Master system uses dynamic prompt generation with variable injection (e.g., `{numTasks}`, `{nextId}`, `{subtaskCount}`). Need to ensure these work properly with Claude CLI.

**Variables Used**:
- `{numTasks}` - Number of tasks to generate
- `{nextId}` - Starting ID for new tasks  
- `{subtaskCount}` - Number of subtasks for expansion
- `{research}` - Research mode enhancement text

## Original Concerns
- Shell command escaping issues with special characters
- Complex template string handling
- Dynamic prompt assembly complexity

## Solution: Streaming Eliminates Most Issues
Our streaming approach using `child_process.spawn()` solves variable injection problems:

**Implementation**:
```javascript
async function executeClaudeCommand(prdContent, options) {
  // Simple JavaScript template literals work fine
  const researchEnhancement = options.research ? getResearchEnhancement() : '';
  
  const systemPrompt = `You are an AI assistant specialized in analyzing PRDs...
  
  ${researchEnhancement}
  
  Generate approximately ${options.numTasks} tasks starting from ID ${options.nextId}...`;
  
  const claude = spawn('claude', [
    '--print',
    '--output-format', 'json', 
    '--model', options.model || 'claude-sonnet-4',
    systemPrompt  // Safe as command argument - Node.js handles escaping
  ]);
  
  // PRD content via stdin - no shell escaping needed
  claude.stdin.write(prdContent);
  claude.stdin.end();
}
```

## Why This Works
- **Prompt variables** → Command arguments (Node.js handles escaping automatically)
- **PRD content** → stdin stream (no shell escaping required)
- **Template literals** → Standard JavaScript (no complex template engine needed)

## Benefits
- ✅ No shell escaping issues
- ✅ Simple JavaScript template literals sufficient
- ✅ No complex template engine required
- ✅ Standard variable injection patterns work
- ✅ Research mode conditionals work naturally

## Implementation
Use standard JavaScript template strings with conditional logic. The streaming approach handles all escaping concerns automatically.