# Issue: Research Mode Implementation for CLI

## Problem
The current system uses Perplexity API for research-enhanced task generation. Need to replicate this functionality using Claude CLI.

## Solution: Use Claude CLI's Built-in Web Search
Claude CLI has WebSearch and WebFetch tools available, enabling real-time web research capabilities.

**Research Mode Implementation:**
```javascript
// Use existing research enhancement but instruct Claude to use WebSearch
const researchEnhancement = `
Before breaking down the PRD into tasks, you will:
1. Use WebSearch to research and analyze the latest technologies, libraries, frameworks, and best practices that would be appropriate for this project
2. Use WebSearch to identify any potential technical challenges, security concerns, or scalability issues not explicitly mentioned in the PRD
3. Use WebSearch to consider current industry standards and evolving trends relevant to this project
4. Use WebSearch to evaluate alternative implementation approaches and recommend the most efficient path
5. Include specific library versions, helpful APIs, and concrete implementation guidance based on your research
6. Always aim to provide the most direct path to implementation, avoiding over-engineering or roundabout approaches

Your task breakdown should incorporate this research, resulting in more detailed implementation guidance, more accurate dependency mapping, and more precise technology recommendations than would be possible from the PRD text alone, while maintaining all explicit requirements and best practices and all details and nuances of the PRD.
`;

// Combine with existing system prompt structure
const systemPrompt = `${baseSystemPrompt}

${researchEnhancement}

${restOfSystemPrompt}`;
```

**Command Structure:**
```bash
echo "PRD_CONTENT" | claude --print --output-format json --model claude-sonnet-4 "RESEARCH_ENHANCED_PROMPT"
```

## Benefits
- ✅ Real-time web search just like Perplexity integration
- ✅ Current technology recommendations
- ✅ Latest security and best practices
- ✅ No complex local knowledge base needed
- ✅ Direct integration with Claude CLI tools

## Implementation
Simply enhance prompts to instruct Claude to use its WebSearch capabilities before generating tasks. No additional tooling or fallback mechanisms required.