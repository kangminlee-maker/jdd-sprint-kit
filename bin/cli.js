#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

const program = new Command();

program
  .name('jdd-sprint-kit')
  .description('Judgment-Driven Development toolkit for BMad Method')
  .version(pkg.version);

program
  .command('init')
  .description('Install Sprint Kit into the current project')
  .option('-y, --yes', 'Non-interactive mode (accept all defaults)')
  .option('--ide <tools>', 'IDE tools (comma-separated: claude-code,codex)', 'claude-code')
  .option('--dry-run', 'Show what would be installed without making changes')
  .action(async (options) => {
    const { runInit } = await import('../src/commands/init.js');
    await runInit(options);
  });

program
  .command('update')
  .description('Update Sprint Kit files to the latest version')
  .option('-y, --yes', 'Non-interactive mode (accept all defaults)')
  .option('--dry-run', 'Show what would be updated without making changes')
  .action(async (options) => {
    const { runUpdate } = await import('../src/commands/update.js');
    await runUpdate(options);
  });

program
  .command('compat-check')
  .description('Verify BMad Method compatibility')
  .option('--json', 'Output results as JSON')
  .action(async (options) => {
    const { runCompatCheck } = await import('../src/commands/compat-check.js');
    await runCompatCheck(options);
  });

program.parse();
