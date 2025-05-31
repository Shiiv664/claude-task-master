import { spawn } from 'child_process';
import { z } from 'zod';

/**
 * Claude CLI Provider for Task Master
 * Provides AI services using Claude Code CLI instead of API calls
 */

// Validation schemas (imported from existing codebase structure)
const prdSingleTaskSchema = z.object({
	id: z.number().int().positive(),
	title: z.string().min(1),
	description: z.string().min(1),
	details: z.string().optional().default(''),
	testStrategy: z.string().optional().default(''),
	priority: z.enum(['high', 'medium', 'low']).default('medium'),
	dependencies: z.array(z.number().int().positive()).optional().default([]),
	status: z.string().optional().default('pending')
});

const prdResponseSchema = z.object({
	tasks: z.array(prdSingleTaskSchema),
	metadata: z.object({
		projectName: z.string(),
		totalTasks: z.number(),
		sourceFile: z.string(),
		generatedAt: z.string()
	})
});

class ClaudeCliProvider {
	constructor() {
		this.isAvailable = null; // Cache availability check
	}

	/**
	 * Check if Claude CLI is available and working
	 */
	async checkAvailability() {
		if (this.isAvailable !== null) {
			return this.isAvailable;
		}

		try {
			const result = await this.executeCommand(['--version'], '', { timeout: 5000 });
			this.isAvailable = true;
			return true;
		} catch (error) {
			this.isAvailable = false;
			throw new Error(`Claude CLI not available: ${error.message}`);
		}
	}

	/**
	 * Execute Claude CLI command with streaming
	 * @param {string[]} args - Command arguments
	 * @param {string} inputContent - Content to pipe to stdin
	 * @param {Object} options - Execution options
	 */
	async executeCommand(args, inputContent = '', options = {}) {
		const { timeout = 120000 } = options;

		return new Promise((resolve, reject) => {
			const claude = spawn('claude', args, {
				stdio: ['pipe', 'pipe', 'pipe']
			});

			let stdout = '';
			let stderr = '';
			let timeoutId;

			// Set up timeout
			if (timeout > 0) {
				timeoutId = setTimeout(() => {
					claude.kill('SIGTERM');
					reject(new Error(`Claude CLI command timed out after ${timeout}ms`));
				}, timeout);
			}

			// Collect output
			claude.stdout.on('data', (data) => {
				stdout += data.toString();
			});

			claude.stderr.on('data', (data) => {
				stderr += data.toString();
			});

			// Handle completion
			claude.on('close', (code) => {
				if (timeoutId) clearTimeout(timeoutId);

				if (code === 0) {
					resolve(stdout);
				} else {
					reject(new Error(`Claude CLI exited with code ${code}${stderr ? `: ${stderr}` : ''}`));
				}
			});

			claude.on('error', (error) => {
				if (timeoutId) clearTimeout(timeoutId);
				reject(new Error(`Failed to spawn Claude CLI: ${error.message}`));
			});

			// Write input content if provided
			if (inputContent) {
				claude.stdin.write(inputContent, 'utf8');
			}
			claude.stdin.end();
		});
	}

	/**
	 * Parse CLI JSON response and extract AI content
	 * @param {string} rawOutput - Raw CLI output
	 */
	parseCliResponse(rawOutput) {
		try {
			const cliResponse = JSON.parse(rawOutput);

			// Check for CLI-level errors
			if (cliResponse.is_error) {
				throw new Error(`Claude CLI request failed: ${cliResponse.result || 'Unknown error'}`);
			}

			// Extract AI response content
			const aiContent = cliResponse.result;
			if (!aiContent) {
				throw new Error('No result content in Claude CLI response');
			}

			return aiContent;
		} catch (parseError) {
			throw new Error(`Failed to parse CLI response: ${parseError.message}\nRaw output: ${rawOutput.substring(0, 500)}...`);
		}
	}

	/**
	 * Extract JSON from AI response content
	 * @param {string} content - AI response content
	 */
	extractJsonFromContent(content) {
		// Try direct JSON parsing first
		try {
			return JSON.parse(content.trim());
		} catch (error) {
			// Fall back to extracting JSON from code blocks or mixed content
			return this.extractJsonWithFallback(content);
		}
	}

	/**
	 * Fallback JSON extraction with multiple strategies
	 * @param {string} content - Content to extract JSON from
	 */
	extractJsonWithFallback(content) {
		const strategies = [
			// Extract from code blocks
			() => {
				const codeBlockRegex = /```(?:json)?\s*\n([\s\S]*?)\n```/;
				const match = content.match(codeBlockRegex);
				if (match) return JSON.parse(match[1].trim());
				throw new Error('No code block found');
			},
			// Extract between first { and last }
			() => {
				const firstBrace = content.indexOf('{');
				const lastBrace = content.lastIndexOf('}');
				if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
					throw new Error('No valid brace pair found');
				}
				const jsonStr = content.substring(firstBrace, lastBrace + 1);
				return JSON.parse(jsonStr);
			}
		];

		for (const strategy of strategies) {
			try {
				return strategy();
			} catch (error) {
				continue;
			}
		}

		throw new Error(`Could not extract valid JSON from content: ${content.substring(0, 200)}...`);
	}

	/**
	 * Generate tasks from PRD using Claude CLI
	 * @param {Object} params - Generation parameters
	 */
	async generateTasksFromPrd(params) {
		const {
			prdContent,
			numTasks = 10,
			nextId = 1,
			research = false,
			prdPath = 'Unknown',
			timeout = 120000
		} = params;

		// Check CLI availability
		await this.checkAvailability();

		// Build research enhancement (identical to original)
		const researchPromptAddition = research
			? `\nBefore breaking down the PRD into tasks, you will:
1. Research and analyze the latest technologies, libraries, frameworks, and best practices that would be appropriate for this project
2. Identify any potential technical challenges, security concerns, or scalability issues not explicitly mentioned in the PRD without discarding any explicit requirements or going overboard with complexity -- always aim to provide the most direct path to implementation, avoiding over-engineering or roundabout approaches
3. Consider current industry standards and evolving trends relevant to this project (this step aims to solve LLM hallucinations and out of date information due to training data cutoff dates)
4. Evaluate alternative implementation approaches and recommend the most efficient path
5. Include specific library versions, helpful APIs, and concrete implementation guidance based on your research
6. Always aim to provide the most direct path to implementation, avoiding over-engineering or roundabout approaches

Your task breakdown should incorporate this research, resulting in more detailed implementation guidance, more accurate dependency mapping, and more precise technology recommendations than would be possible from the PRD text alone, while maintaining all explicit requirements and best practices and all details and nuances of the PRD.`
			: '';

		// Build system prompt (identical to original)
		const systemPrompt = `You are an AI assistant specialized in analyzing Product Requirements Documents (PRDs) and generating a structured, logically ordered, dependency-aware and sequenced list of development tasks in JSON format.${researchPromptAddition}

Analyze the provided PRD content and generate approximately ${numTasks} top-level development tasks. If the complexity or the level of detail of the PRD is high, generate more tasks relative to the complexity of the PRD
Each task should represent a logical unit of work needed to implement the requirements and focus on the most direct and effective way to implement the requirements without unnecessary complexity or overengineering. Include pseudo-code, implementation details, and test strategy for each task. Find the most up to date information to implement each task.
Assign sequential IDs starting from ${nextId}. Infer title, description, details, and test strategy for each task based *only* on the PRD content.
Set status to 'pending', dependencies to an empty array [], and priority to 'medium' initially for all tasks.
Respond ONLY with a valid JSON object containing a single key "tasks", where the value is an array of task objects adhering to the provided Zod schema. Do not include any explanation or markdown formatting.

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
1. Unless complexity warrants otherwise, create exactly ${numTasks} tasks, numbered sequentially starting from ${nextId}
2. Each task should be atomic and focused on a single responsibility following the most up to date best practices and standards
3. Order tasks logically - consider dependencies and implementation sequence
4. Early tasks should focus on setup, core functionality first, then advanced features
5. Include clear validation/testing approach for each task
6. Set appropriate dependency IDs (a task can only depend on tasks with lower IDs, potentially including existing tasks with IDs less than ${nextId} if applicable)
7. Assign priority (high/medium/low) based on criticality and dependency order
8. Include detailed implementation guidance in the "details" field${research ? ', with specific libraries and version recommendations based on your research' : ''}
9. If the PRD contains specific requirements for libraries, database schemas, frameworks, tech stacks, or any other implementation details, STRICTLY ADHERE to these requirements in your task breakdown and do not discard them under any circumstance
10. Focus on filling in any gaps left by the PRD or areas that aren't fully specified, while preserving all explicit requirements
11. Always aim to provide the most direct path to implementation, avoiding over-engineering or roundabout approaches${research ? '\n12. For each task, include specific, actionable guidance based on current industry standards and best practices discovered through research' : ''}

Here's the Product Requirements Document (PRD) to break down into approximately ${numTasks} tasks, starting IDs from ${nextId}:${research ? '\n\nRemember to thoroughly research current best practices and technologies before task breakdown to provide specific, actionable implementation details.' : ''}

Return your response in this format:
{
    "tasks": [
        {
            "id": 1,
            "title": "Setup Project Repository",
            "description": "...",
            ...
        },
        ...
    ],
    "metadata": {
        "projectName": "PRD Implementation",
        "totalTasks": ${numTasks},
        "sourceFile": "${prdPath}",
        "generatedAt": "YYYY-MM-DD"
    }
}`;

		// Execute Claude CLI command
		const args = [
			'--print',
			'--output-format', 'json',
			systemPrompt
		];

		const rawOutput = await this.executeCommand(args, prdContent, { timeout });
		const aiContent = this.parseCliResponse(rawOutput);
		const jsonResponse = this.extractJsonFromContent(aiContent);

		// Validate response with Zod schema
		try {
			const validatedResponse = prdResponseSchema.parse(jsonResponse);
			return validatedResponse;
		} catch (validationError) {
			throw new Error(`Generated tasks failed validation: ${validationError.message}`);
		}
	}
}

// Export singleton instance
export const claudeCliProvider = new ClaudeCliProvider();

/**
 * Generate tasks from PRD using Claude CLI
 * Interface compatible with existing generateObjectService calls
 */
export async function generateTasksWithCli(params) {
	return await claudeCliProvider.generateTasksFromPrd(params);
}

export default claudeCliProvider;