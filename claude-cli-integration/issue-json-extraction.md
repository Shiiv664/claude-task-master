# Issue: JSON Extraction from CLI Output

## Problem
Need to reliably extract JSON task data from Claude CLI responses, which may include extra text or formatting around the requested JSON.

## Solution: Use CLI's Built-in JSON Format
Claude CLI provides `--output-format json` which wraps all responses in structured JSON format.

**CLI Output Structure:**
```json
{
  "type": "result",
  "subtype": "success",
  "cost_usd": 0.009106,
  "is_error": false,
  "duration_ms": 2115,
  "result": "AI response content here",
  "session_id": "uuid"
}
```

**Implementation:**
```javascript
// 1. Use JSON output format
const claude = spawn('claude', [
  '--print',
  '--output-format', 'json',
  '--model', 'claude-sonnet-4',
  'SYSTEM_PROMPT'
]);

// 2. Parse CLI wrapper (always valid JSON)
const cliResponse = JSON.parse(stdout);

// 3. Check for errors
if (cliResponse.is_error) {
  throw new Error('Claude CLI request failed');
}

// 4. Extract AI response content
const aiContent = cliResponse.result;

// 5. Parse AI response for task JSON (simple extraction needed)
const tasks = extractTasksFromContent(aiContent);
```

## Benefits
- ✅ CLI output is always valid JSON
- ✅ Built-in error detection via `is_error` field
- ✅ Metadata available (cost, duration, session)
- ✅ Only need simple content extraction from `result` field
- ✅ No complex multi-strategy parsing required

## Remaining Challenge
Still need basic extraction from the `result` field content, as AI may wrap JSON in markdown or add explanatory text. Simple regex/string parsing sufficient.