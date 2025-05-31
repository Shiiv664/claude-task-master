# Claude CLI Prompts Summary

This document outlines all the prompts that will be used with Claude Code CLI for the Task Master integration, based on the current API-based implementation.

## Overview

The Task Master system uses structured prompts to generate development tasks from PRDs. When migrating to Claude CLI, these prompts need to be compatible with the CLI interface while maintaining the same functionality.

## 1. PRD-to-Tasks Generation (Main Prompt)

### System Prompt
```
You are an AI assistant specialized in analyzing Product Requirements Documents (PRDs) and generating a structured, logically ordered, dependency-aware and sequenced list of development tasks in JSON format.

[RESEARCH_ENHANCEMENT - when research mode enabled]

Analyze the provided PRD content and generate approximately {numTasks} top-level development tasks. If the complexity or the level of detail of the PRD is high, generate more tasks relative to the complexity of the PRD

Each task should represent a logical unit of work needed to implement the requirements and focus on the most direct and effective way to implement the requirements without unnecessary complexity or overengineering. Include pseudo-code, implementation details, and test strategy for each task. Find the most up to date information to implement each task.

Assign sequential IDs starting from {nextId}. Infer title, description, details, and test strategy for each task based *only* on the PRD content.

Set status to 'pending', dependencies to an empty array [], and priority to 'medium' initially for all tasks.

Respond ONLY with a valid JSON object containing a single key "tasks", where the value is an array of task objects adhering to the provided schema. Do not include any explanation or markdown formatting.

Each task should follow this JSON structure:
{
  "id": number,
  "title": string,
  "description": string,
  "status": "pending",
  "dependencies": number[] (IDs of tasks this depends on),
  "priority": "high" | "medium" | "low",
  "details": string (implementation details),
  "testStrategy": string (validation approach)
}

Guidelines:
1. Unless complexity warrants otherwise, create exactly {numTasks} tasks, numbered sequentially starting from {nextId}
2. Each task should be atomic and focused on a single responsibility following the most up to date best practices and standards
3. Order tasks logically - consider dependencies and implementation sequence
4. Early tasks should focus on setup, core functionality first, then advanced features
5. Include clear validation/testing approach for each task
6. Set appropriate dependency IDs (a task can only depend on tasks with lower IDs, potentially including existing tasks with IDs less than {nextId} if applicable)
7. Assign priority (high/medium/low) based on criticality and dependency order
8. Include detailed implementation guidance in the "details" field
9. If the PRD contains specific requirements for libraries, database schemas, frameworks, tech stacks, or any other implementation details, STRICTLY ADHERE to these requirements in your task breakdown and do not discard them under any circumstance
10. Focus on filling in any gaps left by the PRD or areas that aren't fully specified, while preserving all explicit requirements
11. Always aim to provide the most direct path to implementation, avoiding over-engineering or roundabout approaches
12. For each task, include specific, actionable guidance based on current industry standards and best practices
```

### Research Mode Enhancement (Conditional)
```
Before breaking down the PRD into tasks, you will:
1. Research and analyze the latest technologies, libraries, frameworks, and best practices that would be appropriate for this project
2. Identify any potential technical challenges, security concerns, or scalability issues not explicitly mentioned in the PRD without discarding any explicit requirements or going overboard with complexity -- always aim to provide the most direct path to implementation, avoiding over-engineering or roundabout approaches
3. Consider current industry standards and evolving trends relevant to this project (this step aims to solve LLM hallucinations and out of date information due to training data cutoff dates)
4. Evaluate alternative implementation approaches and recommend the most efficient path
5. Include specific library versions, helpful APIs, and concrete implementation guidance based on your research
6. Always aim to provide the most direct path to implementation, avoiding over-engineering or roundabout approaches

Your task breakdown should incorporate this research, resulting in more detailed implementation guidance, more accurate dependency mapping, and more precise technology recommendations than would be possible from the PRD text alone, while maintaining all explicit requirements and best practices and all details and nuances of the PRD.
```

### User Prompt
```
{PRD_CONTENT}
```

### CLI Command Example
```bash
cat prd-file.md | claude --model claude-3-7-sonnet-20250219 --temperature 0.2 --max-tokens 64000 --prompt "SYSTEM_PROMPT_HERE"
```

## 2. Task Expansion Prompts

### System Prompt
```
You are an AI assistant helping with task breakdown for software development.
You need to break down a high-level task into {subtaskCount} specific subtasks that can be implemented one by one.

Subtasks should:
1. Be specific and actionable implementation steps
2. Follow a logical sequence
3. Each handle a distinct part of the parent task
4. Include clear guidance on implementation approach
5. Have appropriate dependency chains between subtasks (using the new sequential IDs)
6. Collectively cover all aspects of the parent task

For each subtask, provide:
- id: Sequential integer starting from the provided nextSubtaskId
- title: Clear, specific title
- description: Detailed description
- dependencies: Array of prerequisite subtask IDs (use the new sequential IDs)
- details: Implementation details
- testStrategy: Optional testing approach

Respond ONLY with a valid JSON object containing a single key "subtasks" whose value is an array matching the structure described. Do not include any explanatory text, markdown formatting, or code block markers.
```

### User Prompt
```
Break down this task into exactly {subtaskCount} specific subtasks:

Task ID: {task.id}
Title: {task.title}
Description: {task.description}
Current details: {task.details || 'None'}

[Additional context: {additionalContext}]

Return ONLY the JSON object containing the "subtasks" array, matching this structure:
{
  "subtasks": [
    {
      "id": {nextSubtaskId},
      "title": "Specific subtask title",
      "description": "Detailed description",
      "dependencies": [],
      "details": "Implementation guidance",
      "testStrategy": "Optional testing approach"
    }
  ]
}
```

## 3. Task Addition Prompts

### System Prompt
```
You are a helpful assistant that creates well-structured tasks for a software development project. Generate a single new task based on the user's description, adhering strictly to the provided JSON schema. Pay special attention to dependencies between tasks, ensuring the new task correctly references any tasks it depends on.

When determining dependencies for a new task, follow these principles:
1. Select dependencies based on logical requirements - what must be completed before this task can begin.
2. Prioritize task dependencies that are semantically related to the functionality being built.
3. Consider both direct dependencies (immediately prerequisite) and indirect dependencies.
4. Avoid adding unnecessary dependencies - only include tasks that are genuinely prerequisite.
5. Consider the current status of tasks - prefer completed tasks as dependencies when possible.
6. Pay special attention to foundation tasks (1-5) but don't automatically include them without reason.
7. Recent tasks (higher ID numbers) may be more relevant for newer functionality.

The dependencies array should contain task IDs (numbers) of prerequisite tasks.
```

### User Prompt
```
Create a new task based on this description: {taskDescription}

Context - Existing tasks:
{existingTasksContext}

Next available task ID: {nextTaskId}

Return ONLY a JSON object with the new task following this structure:
{
  "id": {nextTaskId},
  "title": "Task title",
  "description": "Task description",
  "status": "pending",
  "dependencies": [],
  "priority": "medium",
  "details": "Implementation details",
  "testStrategy": "Testing approach"
}
```

## 4. Complexity Analysis Prompts

### System Prompt
```
Analyze the following tasks to determine their complexity (1-10 scale) and recommend the number of subtasks for expansion. Provide a brief reasoning and an initial expansion prompt for each.

Respond ONLY with a valid JSON array matching the schema:
[
  {
    "taskId": <number>,
    "taskTitle": "<string>",
    "complexityScore": <number 1-10>,
    "recommendedSubtasks": <number>,
    "expansionPrompt": "<string>",
    "reasoning": "<string>"
  }
]

Do not include any explanatory text, markdown formatting, or code block markers before or after the JSON array.
```

### User Prompt
```
Tasks:
{tasksData}
```

## 5. CLI Integration Considerations

### Command Structure for Each Prompt Type
```bash
# PRD-to-Tasks Generation
cat prd-file.md | claude --model claude-3-7-sonnet --temperature 0.2 --max-tokens 64000 --prompt "SYSTEM_PROMPT"

# Task Expansion
echo "TASK_DATA" | claude --model claude-3-7-sonnet --temperature 0.2 --max-tokens 32000 --prompt "EXPANSION_SYSTEM_PROMPT"

# Task Addition
echo "TASK_DESCRIPTION" | claude --model claude-3-7-sonnet --temperature 0.2 --max-tokens 16000 --prompt "ADDITION_SYSTEM_PROMPT"

# Complexity Analysis
echo "TASKS_JSON" | claude --model claude-3-7-sonnet --temperature 0.1 --max-tokens 16000 --prompt "COMPLEXITY_SYSTEM_PROMPT"
```

## 6. JSON Schema Requirements

All prompts must return valid JSON matching these schemas:

### Task Schema
```json
{
  "id": "number (positive integer)",
  "title": "string (min 1 char)",
  "description": "string (min 1 char)",
  "details": "string (optional, default empty)",
  "testStrategy": "string (optional, default empty)",
  "priority": "enum: high|medium|low (default medium)",
  "dependencies": "array of positive integers (default empty)",
  "status": "string (default pending)"
}
```

### Subtask Schema
```json
{
  "id": "number (positive integer)",
  "title": "string (min 5 chars)",
  "description": "string (min 10 chars)",
  "dependencies": "array of integers",
  "details": "string (min 20 chars)",
  "status": "string (default pending)",
  "testStrategy": "string (optional)"
}
```

## 7. CLI-Specific Challenges & Solutions

### Challenge 1: Large PRD Files
**Problem**: Command line length limits for very large PRDs
**Solution**: Use file input instead of piping for large content
```bash
claude --input prd-file.md --prompt "SYSTEM_PROMPT" --model claude-3-7-sonnet --temperature 0.2
```

### Challenge 2: JSON Parsing
**Problem**: CLI output may include extra text or formatting
**Solution**: 
- Emphasize "ONLY JSON" in all prompts
- Implement robust JSON extraction from stdout
- Parse between first `{` and last `}`

### Challenge 3: Error Handling
**Problem**: CLI command failures need clear error messages
**Solution**:
- Check stderr for Claude CLI errors
- Validate JSON structure before processing
- Provide helpful error messages for common issues

### Challenge 4: Dynamic Prompt Injection
**Problem**: Need to inject variables into prompts
**Solution**:
- Use template string replacement for variables like `{numTasks}`, `{nextId}`
- Escape special characters in PRD content
- Handle multiline content properly

## 8. Implementation Parameters

### Default AI Parameters
```javascript
{
  main: {
    model: 'claude-3-7-sonnet-20250219',
    maxTokens: 64000,
    temperature: 0.2
  },
  research: {
    model: 'claude-3-7-sonnet-20250219', // Note: CLI doesn't have Perplexity
    maxTokens: 64000,
    temperature: 0.1
  },
  fallback: {
    model: 'claude-3-5-sonnet',
    maxTokens: 64000,
    temperature: 0.2
  }
}
```

### Environment Variables for CLI
```bash
CLAUDE_CLI_PATH=/usr/local/bin/claude
CLI_TIMEOUT=60000
CLI_ONLY_MODE=true
```

## 9. Quality Assurance

### Prompt Validation Checklist
- ✅ All prompts emphasize JSON-only responses
- ✅ Variable injection points clearly marked
- ✅ Schema requirements explicitly stated
- ✅ Error handling guidance included
- ✅ CLI-specific considerations addressed
- ✅ Temperature and token limits appropriate
- ✅ Cross-platform command compatibility

### Testing Strategy
1. **Unit Test Each Prompt**: Verify JSON output for various inputs
2. **Integration Test CLI Commands**: End-to-end command execution
3. **Error Scenario Testing**: Invalid inputs, timeouts, malformed responses
4. **Large File Testing**: Performance with substantial PRDs
5. **Cross-Platform Testing**: Windows, macOS, Linux compatibility