# Claude CLI Mode - Usage Examples

This document provides practical examples of using Task Master in Claude CLI mode for common workflows and use cases.

## Setup

First, enable CLI mode:

```bash
export CLAUDE_CLI_MODE=true
# Verify setup
node claude-cli-integration/validate-cli-integration.js
```

## Example 1: Complete Project Workflow

### Scenario: Building a Todo Application

**Step 1: Create PRD**
```bash
cat > my-project.md << 'EOF'
# Todo Application

Build a modern todo application with:
- User authentication
- Task management (CRUD operations)
- Priority levels and due dates
- Search and filtering
- Mobile-responsive design

Tech stack: React, Node.js, PostgreSQL
EOF
```

**Step 2: Generate Initial Tasks**
```bash
# Generate 8 tasks from PRD
node scripts/dev.js parse-prd my-project.md -n 8 -f

# View generated tasks
node scripts/dev.js list
```

**Step 3: Analyze Complexity**
```bash
# Analyze all tasks for complexity
node scripts/dev.js analyze-complexity

# View the complexity report
node scripts/dev.js complexity-report
```

**Step 4: Expand Complex Tasks**
```bash
# Expand the backend API task (assuming it's task #2)
node scripts/dev.js expand --id=2 --num=6

# Expand frontend task with research mode
node scripts/dev.js expand --id=3 --num=5 --research
```

**Step 5: Add Additional Tasks**
```bash
# Add deployment task
node scripts/dev.js add-task --prompt="Deploy application to AWS with CI/CD pipeline" --priority=medium

# Add testing task with research
node scripts/dev.js add-task --prompt="Implement comprehensive testing strategy" --research
```

## Example 2: Research-Enhanced Workflow

### Scenario: E-commerce Platform with Latest Technologies

**Enhanced PRD Generation**
```bash
cat > ecommerce-prd.md << 'EOF'
# Modern E-commerce Platform

Build a next-generation e-commerce platform with:
- Microservices architecture
- Real-time inventory management
- AI-powered recommendations
- Multi-payment gateway support
- Advanced analytics dashboard

Focus on scalability, performance, and modern development practices.
EOF

# Generate tasks with research for latest best practices
node scripts/dev.js parse-prd ecommerce-prd.md -n 12 -f --research
```

**Research-Enhanced Task Expansion**
```bash
# Expand microservices task with current technology research
node scripts/dev.js expand --id=1 --num=8 --research

# Add AI recommendations with research on latest ML approaches
node scripts/dev.js add-task --prompt="Implement AI-powered product recommendations using latest ML techniques" --research
```

## Example 3: Iterative Development Process

### Scenario: Agile Development with Changing Requirements

**Initial Setup**
```bash
# Start with basic requirements
echo "# MVP Chat App
Basic real-time chat application with rooms and user management." > mvp-chat.md

node scripts/dev.js parse-prd mvp-chat.md -n 5 -f
```

**Sprint 1: Core Features**
```bash
# Expand core chat functionality
node scripts/dev.js expand --id=2 --num=4

# Update tasks based on technical decisions
node scripts/dev.js update-task --id=1 --prompt="Use Socket.io instead of WebRTC for real-time communication"
```

**Sprint 2: Additional Requirements**
```bash
# Add new features mid-development
node scripts/dev.js add-task --prompt="Add file sharing capability with drag-and-drop interface"

# Bulk update for security requirements
node scripts/dev.js update --from=1 --prompt="Add OWASP security best practices"
```

**Sprint 3: Optimization**
```bash
# Add performance optimization tasks
node scripts/dev.js add-task --prompt="Implement message pagination and lazy loading" --priority=high

# Update existing tasks for scalability
node scripts/dev.js update --from=3 --prompt="Design for 10,000+ concurrent users"
```

## Example 4: Legacy System Modernization

### Scenario: Migrating Monolith to Microservices

**Assessment Phase**
```bash
cat > modernization-prd.md << 'EOF'
# Legacy System Modernization

Migrate existing monolithic Java application to microservices:
- Current: Single Spring Boot application
- Target: Docker containers, Kubernetes, API Gateway
- Features: User management, inventory, orders, payments
- Requirements: Zero downtime migration, data consistency
EOF

# Research-enhanced planning
node scripts/dev.js parse-prd modernization-prd.md -n 10 -f --research
```

**Migration Strategy**
```bash
# Expand migration strategy with research on latest patterns
node scripts/dev.js expand --id=1 --num=6 --research

# Add data migration tasks
node scripts/dev.js add-task --prompt="Design zero-downtime database migration strategy" --research

# Analyze complexity for risk assessment
node scripts/dev.js analyze-complexity --research
```

**Implementation Phases**
```bash
# Update tasks for phased approach
node scripts/dev.js update-task --id=2 --prompt="Implement strangler fig pattern for gradual migration"

# Add monitoring and rollback capabilities
node scripts/dev.js add-task --prompt="Implement comprehensive monitoring and rollback procedures"
```

## Example 5: Multi-Platform Mobile App

### Scenario: Cross-Platform Mobile Development

**Initial Planning**
```bash
cat > mobile-app-prd.md << 'EOF'
# Fitness Tracking Mobile App

Cross-platform mobile app with:
- Activity tracking (steps, calories, workouts)
- Social features (friends, challenges, leaderboards)
- Wearable device integration
- Offline-first architecture
- Real-time sync

Platforms: iOS, Android using React Native
EOF

node scripts/dev.js parse-prd mobile-app-prd.md -n 15 -f --research
```

**Platform-Specific Tasks**
```bash
# Expand mobile-specific concerns
node scripts/dev.js expand --id=3 --num=8 --research

# Add platform optimization tasks
node scripts/dev.js add-task --prompt="Optimize for iOS App Store and Google Play Store requirements" --research

# Update for offline capabilities
node scripts/dev.js update --from=5 --prompt="Implement robust offline-first data synchronization"
```

## Example 6: API-First Development

### Scenario: Building a SaaS Platform API

**API Design Phase**
```bash
echo "# SaaS Analytics Platform API
REST API for analytics platform with authentication, data ingestion, reporting, and webhook integrations." > api-prd.md

# Generate API-focused tasks
node scripts/dev.js parse-prd api-prd.md -n 8 -f --research
```

**API Development Workflow**
```bash
# Expand API design task
node scripts/dev.js expand --id=1 --num=6

# Add API documentation task
node scripts/dev.js add-task --prompt="Create comprehensive API documentation with OpenAPI/Swagger"

# Update for API versioning
node scripts/dev.js update-task --id=2 --prompt="Implement API versioning strategy with backward compatibility"
```

**Testing and Security**
```bash
# Add comprehensive API testing
node scripts/dev.js add-task --prompt="Implement API testing with contract testing and load testing" --research

# Bulk update for security
node scripts/dev.js update --from=1 --prompt="Add comprehensive API security measures (OAuth2, rate limiting, input validation)"
```

## Example 7: DevOps and Infrastructure

### Scenario: Complete CI/CD Pipeline Setup

**Infrastructure as Code**
```bash
cat > devops-prd.md << 'EOF'
# Complete DevOps Pipeline

Set up production-ready infrastructure:
- Kubernetes cluster on AWS/GCP
- CI/CD with GitHub Actions
- Monitoring, logging, alerting
- Security scanning and compliance
- Auto-scaling and disaster recovery
EOF

node scripts/dev.js parse-prd devops-prd.md -n 12 -f --research
```

**Pipeline Development**
```bash
# Expand CI/CD pipeline task
node scripts/dev.js expand --id=2 --num=8 --research

# Add security scanning
node scripts/dev.js add-task --prompt="Implement automated security scanning in CI/CD pipeline" --research

# Update for compliance
node scripts/dev.js update --from=5 --prompt="Add SOC2 compliance requirements and audit trails"
```

## Example 8: Performance Optimization Project

### Scenario: Optimizing Slow Application

**Performance Analysis**
```bash
echo "# Performance Optimization Project
Optimize slow web application: reduce load times from 8s to <2s, handle 10x traffic, improve user experience." > perf-prd.md

node scripts/dev.js parse-prd perf-prd.md -n 10 -f --research
```

**Optimization Strategy**
```bash
# Expand performance analysis task
node scripts/dev.js expand --id=1 --num=6 --research

# Add specific optimization tasks
node scripts/dev.js add-task --prompt="Implement advanced caching strategy with Redis and CDN" --research

# Update for monitoring
node scripts/dev.js update --from=3 --prompt="Add comprehensive performance monitoring and alerting"
```

## Common Command Patterns

### Task Generation
```bash
# Basic task generation
node scripts/dev.js parse-prd file.md -n 8 -f

# With research enhancement
node scripts/dev.js parse-prd file.md -n 8 -f --research

# Append to existing tasks
node scripts/dev.js parse-prd file.md -n 5 --append
```

### Task Expansion
```bash
# Basic expansion
node scripts/dev.js expand --id=1 --num=5

# With research and context
node scripts/dev.js expand --id=1 --num=5 --research --prompt="Focus on security aspects"

# Force expansion (replace existing subtasks)
node scripts/dev.js expand --id=1 --num=5 --force
```

### Task Updates
```bash
# Single task update
node scripts/dev.js update-task --id=2 --prompt="Add Docker containerization"

# Subtask update
node scripts/dev.js update-subtask --id="1.2" --prompt="Use TypeScript instead of JavaScript"

# Bulk updates
node scripts/dev.js update --from=5 --prompt="Add comprehensive error handling"
```

### Task Management
```bash
# View all tasks
node scripts/dev.js list

# View specific task details
node scripts/dev.js show --id=3

# Analyze complexity
node scripts/dev.js analyze-complexity --research

# Generate task files
node scripts/dev.js generate --all
```

## Best Practices for CLI Mode

### 1. Batch Operations
For large projects, process in smaller batches:
```bash
# Instead of updating 20 tasks at once
node scripts/dev.js update --from=1 --prompt="Add logging"

# Break into smaller batches
node scripts/dev.js update --from=1 --to=5 --prompt="Add logging"
node scripts/dev.js update --from=6 --to=10 --prompt="Add logging"
```

### 2. Research Mode Usage
Use research mode for:
- Latest technology recommendations
- Best practices and patterns
- Security considerations
- Performance optimization strategies
- Industry standards compliance

### 3. Iterative Development
```bash
# Start simple
node scripts/dev.js parse-prd basic-requirements.md -n 5 -f

# Iterate and enhance
node scripts/dev.js expand --id=1 --num=4
node scripts/dev.js add-task --prompt="Additional feature based on user feedback"
node scripts/dev.js update --from=1 --prompt="Updated requirements"
```

### 4. Project Documentation
Keep track of your workflow:
```bash
# Document your commands
echo "node scripts/dev.js parse-prd project.md -n 10 -f" > setup-commands.sh
echo "node scripts/dev.js expand --id=1 --num=5 --research" >> setup-commands.sh
chmod +x setup-commands.sh
```

## Troubleshooting Examples

### Issue: Timeout on Large Operations
```bash
# Problem: Bulk update times out
node scripts/dev.js update --from=1 --prompt="Long detailed requirements..."

# Solution: Use smaller batches
node scripts/dev.js update --from=1 --to=3 --prompt="Long detailed requirements..."
node scripts/dev.js update --from=4 --to=6 --prompt="Long detailed requirements..."
```

### Issue: Research Mode Not Working
```bash
# Check CLI functionality
echo "test" | claude --print --output-format json "return {\"test\": true}"

# Verify research capabilities
node scripts/dev.js add-task --prompt="Use latest React patterns" --research
```

### Issue: Invalid JSON Response
```bash
# Run validation script
node claude-cli-integration/validate-cli-integration.js

# Check Claude CLI version
claude --version
```

This comprehensive set of examples demonstrates the full capabilities of Task Master in Claude CLI mode, from simple project setup to complex enterprise workflows.