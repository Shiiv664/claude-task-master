# Claude CLI Integration Test Plan

## Overview
Comprehensive manual testing plan for all 7 AI operations with Claude CLI mode enabled.

## Prerequisites
1. Claude CLI installed and configured
2. Task Master project setup
3. Environment variable: `CLAUDE_CLI_MODE=true`
4. Optional: `CLAUDE_CLI_PATH=/path/to/claude` (if not in PATH)

## Test Setup

### Environment Configuration
```bash
export CLAUDE_CLI_MODE=true
# Optional: export CLAUDE_CLI_PATH=/path/to/claude
```

### Verify CLI Availability
```bash
claude --version
# Should return Claude CLI version information
```

### Test Project Structure
```
test-project/
├── tasks/
│   └── tasks.json
├── scripts/
└── test-prd.md
```

## Test Suite: All 7 AI Operations

### Test 1: PRD-to-Tasks Generation
**Operation**: Generate tasks from PRD using CLI mode

**Setup**:
```bash
# Create test PRD
cat > test-prd.md << 'EOF'
# Simple Todo App

Build a basic todo application with the following features:
- Add new tasks
- Mark tasks as complete
- Delete tasks
- Filter by status
- Responsive design

Technology stack: React, Node.js, SQLite
EOF
```

**Test Command**:
```bash
cd /path/to/task-master
node scripts/init.js --file=test-prd.md --num-tasks=5
```

**Expected Results**:
- ✅ 5 tasks generated successfully
- ✅ Tasks are saved to tasks/tasks.json
- ✅ Individual task files created in tasks/
- ✅ No API calls made (Claude CLI used)
- ✅ Output shows "Using Claude CLI provider"

**Validation**:
- Check tasks.json contains 5 valid task objects
- Verify task files are created (task_001.txt, etc.)
- Confirm realistic task content for todo app

---

### Test 2: Task Expansion
**Operation**: Expand a task into subtasks using CLI mode

**Test Command**:
```bash
node scripts/expand.js --id=1 --num-subtasks=3
```

**Expected Results**:
- ✅ Task 1 expanded with 3 subtasks
- ✅ Subtasks have sequential IDs (1, 2, 3)
- ✅ Subtasks are relevant to parent task
- ✅ tasks.json updated with subtasks

**Validation**:
- Check task 1 in tasks.json has subtasks array
- Verify subtask structure and content quality
- Confirm subtask dependencies are logical

---

### Test 3: Task Addition
**Operation**: Add a new task using CLI mode

**Test Command**:
```bash
node scripts/add.js --prompt="Add user authentication system with JWT tokens"
```

**Expected Results**:
- ✅ New task created with appropriate ID
- ✅ Task has realistic title, description, details
- ✅ Test strategy is provided
- ✅ Appropriate dependencies suggested

**Validation**:
- Check new task in tasks.json
- Verify AI-generated content quality
- Confirm task structure is complete

---

### Test 4: Complexity Analysis
**Operation**: Analyze task complexity using CLI mode

**Test Command**:
```bash
node scripts/analyze.js --file=tasks/tasks.json
```

**Expected Results**:
- ✅ Complexity scores (1-10) for all tasks
- ✅ Recommended subtask counts
- ✅ Reasoning for each analysis
- ✅ Expansion prompts generated
- ✅ Report saved to scripts/task-complexity-report.json

**Validation**:
- Check complexity report exists and is valid JSON
- Verify scores are reasonable (1-10 range)
- Confirm recommendations make sense

---

### Test 5: Update Subtask
**Operation**: Update a subtask using CLI mode

**Prerequisites**: Ensure task 1 has subtasks from Test 2

**Test Command**:
```bash
node scripts/update-subtask.js --id="1.1" --prompt="Add validation for user input fields"
```

**Expected Results**:
- ✅ Subtask 1.1 updated with new information
- ✅ Timestamp added to details
- ✅ Original content preserved
- ✅ New content appended appropriately

**Validation**:
- Check subtask 1.1 in tasks.json
- Verify timestamped addition
- Confirm content quality and relevance

---

### Test 6: Update Task
**Operation**: Update a single task using CLI mode

**Test Command**:
```bash
node scripts/update-task.js --id=2 --prompt="Change to use PostgreSQL instead of SQLite for better performance"
```

**Expected Results**:
- ✅ Task 2 updated with new database requirement
- ✅ Title unchanged (important!)
- ✅ Description/details reflect PostgreSQL
- ✅ Completed subtasks preserved
- ✅ Test strategy updated appropriately

**Validation**:
- Check task 2 in tasks.json
- Verify title remains same
- Confirm PostgreSQL mentioned in details
- Ensure completed subtasks untouched

---

### Test 7: Update Tasks (Bulk)
**Operation**: Update multiple tasks using CLI mode

**Test Command**:
```bash
node scripts/update-tasks.js --from=1 --prompt="Add accessibility (WCAG 2.1) requirements to all features"
```

**Expected Results**:
- ✅ All tasks from ID 1 onward updated
- ✅ Accessibility requirements added
- ✅ Task IDs and titles preserved
- ✅ Completed subtasks preserved
- ✅ Bulk update applied consistently

**Validation**:
- Check multiple tasks in tasks.json
- Verify accessibility mentioned across tasks
- Confirm structural integrity maintained

---

## Research Mode Testing

### Test 8: Research Mode Verification
**Operation**: Test research mode across operations

**Setup**:
```bash
export CLAUDE_CLI_MODE=true
```

**Test Commands**:
```bash
# PRD with research
node scripts/init.js --file=test-prd.md --num-tasks=3 --research

# Task expansion with research  
node scripts/expand.js --id=1 --num-subtasks=2 --research

# Task addition with research
node scripts/add.js --prompt="Implement real-time notifications" --research

# Complexity analysis with research
node scripts/analyze.js --file=tasks/tasks.json --research
```

**Expected Results**:
- ✅ All operations work with --research flag
- ✅ Claude CLI WebSearch tools utilized
- ✅ More detailed/researched content generated
- ✅ No errors or fallback to API mode

---

## Error Handling Tests

### Test 9: CLI Availability Check
**Test**: CLI not available

**Setup**:
```bash
export CLAUDE_CLI_MODE=true
export CLAUDE_CLI_PATH=/nonexistent/path
```

**Expected Results**:
- ✅ Clear error message about CLI not available
- ✅ Graceful failure (no crashes)
- ✅ Helpful instructions provided

### Test 10: Invalid CLI Response
**Test**: CLI returns malformed response

**Note**: This requires modifying CLI provider temporarily to simulate malformed responses

**Expected Results**:
- ✅ JSON validation catches errors
- ✅ Clear error messages
- ✅ No data corruption

---

## Performance Tests

### Test 11: Large PRD Processing
**Operation**: Test with large PRD file

**Setup**: Create 2000+ word PRD file

**Test Command**:
```bash
node scripts/init.js --file=large-prd.md --num-tasks=10
```

**Expected Results**:
- ✅ Large content handled via stdin
- ✅ No command line length limits hit
- ✅ Processing completes successfully
- ✅ Quality maintained with large input

---

## Success Criteria

### ✅ All Operations Pass
- [ ] Test 1: PRD-to-Tasks Generation
- [ ] Test 2: Task Expansion  
- [ ] Test 3: Task Addition
- [ ] Test 4: Complexity Analysis
- [ ] Test 5: Update Subtask
- [ ] Test 6: Update Task
- [ ] Test 7: Update Tasks (Bulk)

### ✅ Research Mode Works
- [ ] Test 8: Research Mode Verification

### ✅ Error Handling
- [ ] Test 9: CLI Availability Check
- [ ] Test 10: Invalid CLI Response

### ✅ Performance
- [ ] Test 11: Large PRD Processing

### ✅ Overall Validation
- [ ] No API calls made (CLI only)
- [ ] All generated content is high quality
- [ ] JSON structures are valid
- [ ] File operations work correctly
- [ ] Error messages are helpful
- [ ] Performance is acceptable

## Next Steps
After successful testing:
1. Document any issues found
2. Create usage examples
3. Update documentation
4. Prepare for production use

## Testing Notes
- Record any errors or unexpected behavior
- Note performance differences vs API mode
- Document quality differences in generated content
- Test with various PRD sizes and complexity levels