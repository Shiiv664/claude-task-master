#!/usr/bin/env node

/**
 * Claude CLI Integration Validation Script
 * 
 * This script validates that the Claude CLI integration is properly configured
 * and can perform basic operations without requiring manual testing.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// ANSI color codes for output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
    header: (msg) => console.log(`\n${colors.bold}${colors.blue}${msg}${colors.reset}`)
};

class CLIValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.testResults = {};
    }

    // Check if Claude CLI is available
    async checkCLIAvailability() {
        log.header('🔍 Checking Claude CLI Availability');
        
        const cliPath = process.env.CLAUDE_CLI_PATH || 'claude';
        
        try {
            const result = await this.executeCommand(cliPath, ['--version'], '', { timeout: 5000 });
            log.success(`Claude CLI found: ${cliPath}`);
            log.info(`Version info: ${result.trim()}`);
            return true;
        } catch (error) {
            log.error(`Claude CLI not available at: ${cliPath}`);
            log.error(`Error: ${error.message}`);
            this.errors.push(`Claude CLI not available: ${error.message}`);
            return false;
        }
    }

    // Check environment configuration
    checkEnvironmentConfig() {
        log.header('⚙️ Checking Environment Configuration');

        const cliMode = process.env.CLAUDE_CLI_MODE;
        if (cliMode === 'true') {
            log.success('CLAUDE_CLI_MODE=true is set');
        } else {
            log.warning(`CLAUDE_CLI_MODE=${cliMode || 'undefined'} - should be 'true' for CLI mode`);
            this.warnings.push('CLAUDE_CLI_MODE not set to true');
        }

        const cliPath = process.env.CLAUDE_CLI_PATH;
        if (cliPath) {
            log.info(`CLAUDE_CLI_PATH=${cliPath}`);
        } else {
            log.info('CLAUDE_CLI_PATH not set (using default: claude)');
        }

        return true;
    }

    // Check if CLI provider module exists and imports correctly
    async checkCLIProviderModule() {
        log.header('📦 Checking CLI Provider Module');

        const providerPath = path.resolve('scripts/modules/claude-cli-provider.js');
        
        if (!fs.existsSync(providerPath)) {
            log.error(`CLI provider module not found: ${providerPath}`);
            this.errors.push('CLI provider module missing');
            return false;
        }

        log.success('CLI provider module found');

        try {
            // Dynamic import to check if module loads correctly
            const module = await import(providerPath);
            
            const expectedExports = [
                'claudeCliProvider',
                'generateTasksWithCli',
                'expandTaskWithCli',
                'addTaskWithCli',
                'analyzeComplexityWithCli',
                'updateSubtaskWithCli',
                'updateTaskWithCli',
                'updateTasksWithCli'
            ];

            for (const exportName of expectedExports) {
                if (module[exportName]) {
                    log.success(`✓ ${exportName} exported`);
                } else {
                    log.error(`✗ ${exportName} missing`);
                    this.errors.push(`Missing export: ${exportName}`);
                }
            }

            return this.errors.length === 0;
        } catch (error) {
            log.error(`Failed to import CLI provider: ${error.message}`);
            this.errors.push(`CLI provider import failed: ${error.message}`);
            return false;
        }
    }

    // Check configuration manager has CLI mode functions
    async checkConfigManager() {
        log.header('🔧 Checking Configuration Manager');

        const configPath = path.resolve('scripts/modules/config-manager.js');
        
        try {
            const module = await import(configPath);
            
            if (module.isClaudeCliModeEnabled) {
                log.success('✓ isClaudeCliModeEnabled function exists');
                
                // Test the function
                const result = module.isClaudeCliModeEnabled();
                log.info(`CLI mode enabled: ${result}`);
                
                if (process.env.CLAUDE_CLI_MODE === 'true' && !result) {
                    log.warning('Environment variable set but function returns false');
                    this.warnings.push('CLI mode function inconsistency');
                }
            } else {
                log.error('✗ isClaudeCliModeEnabled function missing');
                this.errors.push('Missing CLI mode function');
            }

            if (module.getClaudeCliPath) {
                log.success('✓ getClaudeCliPath function exists');
            } else {
                log.warning('✗ getClaudeCliPath function missing (optional)');
                this.warnings.push('Missing getClaudeCliPath function');
            }

            return true;
        } catch (error) {
            log.error(`Failed to check config manager: ${error.message}`);
            this.errors.push(`Config manager check failed: ${error.message}`);
            return false;
        }
    }

    // Test basic CLI provider functionality
    async testCLIProviderBasics() {
        log.header('🧪 Testing CLI Provider Basics');

        if (!process.env.CLAUDE_CLI_MODE === 'true') {
            log.warning('CLI mode not enabled, skipping provider tests');
            return true;
        }

        try {
            const { claudeCliProvider } = await import(path.resolve('scripts/modules/claude-cli-provider.js'));
            
            // Test availability check
            log.info('Testing CLI availability check...');
            const isAvailable = await claudeCliProvider.checkAvailability();
            
            if (isAvailable) {
                log.success('CLI provider availability check passed');
            } else {
                log.error('CLI provider availability check failed');
                this.errors.push('CLI provider availability check failed');
            }

            return isAvailable;
        } catch (error) {
            log.error(`CLI provider test failed: ${error.message}`);
            this.errors.push(`CLI provider test failed: ${error.message}`);
            return false;
        }
    }

    // Utility method to execute commands
    executeCommand(command, args, input = '', options = {}) {
        const { timeout = 30000 } = options;

        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';
            let timeoutId;

            if (timeout > 0) {
                timeoutId = setTimeout(() => {
                    child.kill('SIGTERM');
                    reject(new Error(`Command timed out after ${timeout}ms`));
                }, timeout);
            }

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (timeoutId) clearTimeout(timeoutId);
                
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(new Error(`Command exited with code ${code}${stderr ? `: ${stderr}` : ''}`));
                }
            });

            child.on('error', (error) => {
                if (timeoutId) clearTimeout(timeoutId);
                reject(new Error(`Failed to spawn command: ${error.message}`));
            });

            if (input) {
                child.stdin.write(input, 'utf8');
            }
            child.stdin.end();
        });
    }

    // Run all validation tests
    async runAllTests() {
        log.header('🚀 Starting Claude CLI Integration Validation');
        
        const tests = [
            { name: 'CLI Availability', test: () => this.checkCLIAvailability() },
            { name: 'Environment Config', test: () => this.checkEnvironmentConfig() },
            { name: 'CLI Provider Module', test: () => this.checkCLIProviderModule() },
            { name: 'Configuration Manager', test: () => this.checkConfigManager() },
            { name: 'CLI Provider Basics', test: () => this.testCLIProviderBasics() }
        ];

        let passed = 0;
        let failed = 0;

        for (const test of tests) {
            try {
                const result = await test.test();
                this.testResults[test.name] = result;
                
                if (result) {
                    passed++;
                } else {
                    failed++;
                }
            } catch (error) {
                log.error(`Test "${test.name}" threw an error: ${error.message}`);
                this.testResults[test.name] = false;
                this.errors.push(`Test "${test.name}" error: ${error.message}`);
                failed++;
            }
        }

        // Summary
        log.header('📊 Validation Summary');
        log.info(`Tests passed: ${colors.green}${passed}${colors.reset}`);
        log.info(`Tests failed: ${colors.red}${failed}${colors.reset}`);
        log.info(`Warnings: ${colors.yellow}${this.warnings.length}${colors.reset}`);
        log.info(`Errors: ${colors.red}${this.errors.length}${colors.reset}`);

        if (this.errors.length > 0) {
            log.header('❌ Errors Found');
            this.errors.forEach(error => log.error(error));
        }

        if (this.warnings.length > 0) {
            log.header('⚠️ Warnings');
            this.warnings.forEach(warning => log.warning(warning));
        }

        if (failed === 0 && this.errors.length === 0) {
            log.header('🎉 All Tests Passed!');
            log.success('Claude CLI integration is properly configured and ready for use.');
            
            if (process.env.CLAUDE_CLI_MODE === 'true') {
                log.info('You can now run Task Master operations with CLI mode enabled.');
            } else {
                log.info('Set CLAUDE_CLI_MODE=true to enable CLI mode.');
            }
            
            return true;
        } else {
            log.header('❌ Validation Failed');
            log.error('Please fix the errors above before using Claude CLI integration.');
            return false;
        }
    }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const validator = new CLIValidator();
    validator.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        log.error(`Validation script error: ${error.message}`);
        process.exit(1);
    });
}

export default CLIValidator;