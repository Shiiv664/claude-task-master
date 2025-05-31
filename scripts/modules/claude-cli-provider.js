import { spawn } from 'child_process';
import { z } from 'zod';
import { generatePrdPrompts } from './task-manager/parse-prd.js';
import { generateExpandTaskPrompts, subtaskWrapperSchema } from './task-manager/expand-task.js';
import { generateAddTaskPrompts, AiTaskDataSchema } from './task-manager/add-task.js';
import { generateComplexityAnalysisPrompts } from './task-manager/analyze-task-complexity.js';
import { generateUpdateSubtaskPrompts } from './task-manager/update-subtask-by-id.js';

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

const complexityAnalysisItemSchema = z.object({
	taskId: z.number(),
	taskTitle: z.string(),
	complexityScore: z.number().min(1).max(10),
	recommendedSubtasks: z.number(),
	expansionPrompt: z.string(),
	reasoning: z.string()
});

const complexityAnalysisSchema = z.array(complexityAnalysisItemSchema);

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

		// Use shared prompt generation logic
		const { systemPrompt, userPrompt } = generatePrdPrompts({
			numTasks,
			nextId,
			research,
			prdContent,
			prdPath
		});

		// For CLI, use system prompt as command argument and user prompt as stdin
		const args = [
			'--print',
			'--output-format', 'json',
			systemPrompt
		];

		const rawOutput = await this.executeCommand(args, userPrompt, { timeout });
		const aiContent = this.parseCliResponse(rawOutput);
		const jsonResponse = this.extractJsonFromContent(aiContent);

		// Validate response with Zod schema
		try {
			const validatedResponse = prdResponseSchema.parse(jsonResponse);
			
			// Return in same structure as generateObjectService
			return {
				mainResult: validatedResponse,
				success: true
			};
		} catch (validationError) {
			throw new Error(`Generated tasks failed validation: ${validationError.message}`);
		}
	}

	/**
	 * Expand a task into subtasks using Claude CLI
	 * @param {Object} params - Expansion parameters
	 */
	async expandTask(params) {
		const {
			task,
			subtaskCount = 3,
			additionalContext = '',
			nextSubtaskId = 1,
			useResearch = false,
			timeout = 120000
		} = params;

		// Check CLI availability
		await this.checkAvailability();

		// Use shared prompt generation logic
		const { systemPrompt, userPrompt } = generateExpandTaskPrompts({
			task,
			subtaskCount,
			additionalContext,
			nextSubtaskId,
			useResearch
		});

		// For CLI, use system prompt as command argument and user prompt as stdin
		const args = [
			'--print',
			'--output-format', 'json',
			systemPrompt
		];

		const rawOutput = await this.executeCommand(args, userPrompt, { timeout });
		const aiContent = this.parseCliResponse(rawOutput);
		const jsonResponse = this.extractJsonFromContent(aiContent);

		// Validate response with Zod schema
		try {
			const validatedResponse = subtaskWrapperSchema.parse(jsonResponse);
			
			// Return in same structure as generateTextService
			return {
				mainResult: validatedResponse.subtasks,
				success: true
			};
		} catch (validationError) {
			throw new Error(`Generated subtasks failed validation: ${validationError.message}`);
		}
	}

	/**
	 * Add a new task using Claude CLI
	 * @param {Object} params - Task addition parameters
	 */
	async addTask(params) {
		const {
			newTaskId,
			prompt,
			contextTasks,
			manualTaskData = null,
			useResearch = false,
			timeout = 120000
		} = params;

		// Check CLI availability
		await this.checkAvailability();

		// Use shared prompt generation logic
		const { systemPrompt, userPrompt } = generateAddTaskPrompts({
			newTaskId,
			prompt,
			contextTasks,
			manualTaskData
		});

		// For CLI, use system prompt as command argument and user prompt as stdin
		const args = [
			'--print',
			'--output-format', 'json',
			systemPrompt
		];

		const rawOutput = await this.executeCommand(args, userPrompt, { timeout });
		const aiContent = this.parseCliResponse(rawOutput);
		const jsonResponse = this.extractJsonFromContent(aiContent);

		// Validate response with Zod schema
		try {
			const validatedResponse = AiTaskDataSchema.parse(jsonResponse);
			
			// Return in same structure as generateObjectService
			return {
				mainResult: validatedResponse,
				success: true
			};
		} catch (validationError) {
			throw new Error(`Generated task failed validation: ${validationError.message}`);
		}
	}

	/**
	 * Analyze task complexity using Claude CLI
	 * @param {Object} params - Analysis parameters
	 */
	async analyzeComplexity(params) {
		const {
			tasksData,
			useResearch = false,
			timeout = 120000
		} = params;

		// Check CLI availability
		await this.checkAvailability();

		// Use shared prompt generation logic
		const { systemPrompt, userPrompt } = generateComplexityAnalysisPrompts({
			tasksData
		});

		// For CLI, use system prompt as command argument and user prompt as stdin
		const args = [
			'--print',
			'--output-format', 'json',
			systemPrompt
		];

		const rawOutput = await this.executeCommand(args, userPrompt, { timeout });
		const aiContent = this.parseCliResponse(rawOutput);
		const jsonResponse = this.extractJsonFromContent(aiContent);

		// Validate response with Zod schema
		try {
			const validatedResponse = complexityAnalysisSchema.parse(jsonResponse);
			
			// Return in same structure as generateTextService
			return {
				mainResult: validatedResponse,
				success: true
			};
		} catch (validationError) {
			throw new Error(`Generated complexity analysis failed validation: ${validationError.message}`);
		}
	}

	/**
	 * Update a subtask using Claude CLI
	 * @param {Object} params - Update parameters
	 */
	async updateSubtask(params) {
		const {
			parentContext,
			prevSubtask,
			nextSubtask,
			subtask,
			prompt,
			useResearch = false,
			timeout = 120000
		} = params;

		// Check CLI availability
		await this.checkAvailability();

		// Use shared prompt generation logic
		const { systemPrompt, userPrompt } = generateUpdateSubtaskPrompts({
			parentContext,
			prevSubtask,
			nextSubtask,
			subtask,
			prompt
		});

		// For CLI, use system prompt as command argument and user prompt as stdin
		const args = [
			'--print',
			'--output-format', 'json',
			systemPrompt
		];

		const rawOutput = await this.executeCommand(args, userPrompt, { timeout });
		const aiContent = this.parseCliResponse(rawOutput);
		
		// For subtask updates, the response is a plain string, not JSON
		// So we return the AI content directly
		return {
			mainResult: aiContent,
			success: true
		};
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

/**
 * Expand task into subtasks using Claude CLI
 * Interface compatible with existing generateTextService calls
 */
export async function expandTaskWithCli(params) {
	return await claudeCliProvider.expandTask(params);
}

/**
 * Add new task using Claude CLI
 * Interface compatible with existing generateObjectService calls
 */
export async function addTaskWithCli(params) {
	return await claudeCliProvider.addTask(params);
}

/**
 * Analyze task complexity using Claude CLI
 * Interface compatible with existing generateTextService calls
 */
export async function analyzeComplexityWithCli(params) {
	return await claudeCliProvider.analyzeComplexity(params);
}

/**
 * Update subtask using Claude CLI
 * Interface compatible with existing generateTextService calls
 */
export async function updateSubtaskWithCli(params) {
	return await claudeCliProvider.updateSubtask(params);
}

export default claudeCliProvider;