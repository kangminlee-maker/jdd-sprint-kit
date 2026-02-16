import fsExtra from 'fs-extra';
const { copySync, ensureDirSync } = fsExtra;
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPRINT_KIT_FILES, SPRINT_KIT_VERSION } from './manifest.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', '..', 'templates');

// Overwrite policy per category
const OVERWRITE_POLICY = {
  agents:   'overwrite',   // Sprint Kit owned
  commands: 'overwrite',   // Sprint Kit owned
  rules:    'overwrite',   // Sprint Kit owned
  hooks:    'overwrite',   // Sprint Kit owned
  docs:     'overwrite',   // Sprint Kit owned
};

export function copySprintKitFiles(projectDir, options = {}) {
  const { dryRun = false, force = false } = options;
  const results = { copied: [], skipped: [], overwritten: [] };

  // Agents
  for (const file of SPRINT_KIT_FILES.agents) {
    copyFile(
      join(TEMPLATES_DIR, '.claude', 'agents', file),
      join(projectDir, '.claude', 'agents', file),
      results, { dryRun, force }
    );
  }

  // Commands (Sprint Kit only — bmad/ is BMad-owned)
  for (const file of SPRINT_KIT_FILES.commands) {
    copyFile(
      join(TEMPLATES_DIR, '.claude', 'commands', file),
      join(projectDir, '.claude', 'commands', file),
      results, { dryRun, force }
    );
  }

  // Rules
  for (const file of SPRINT_KIT_FILES.rules) {
    copyFile(
      join(TEMPLATES_DIR, '.claude', 'rules', file),
      join(projectDir, '.claude', 'rules', file),
      results, { dryRun, force }
    );
  }

  // Hooks
  for (const file of SPRINT_KIT_FILES.hooks) {
    copyFile(
      join(TEMPLATES_DIR, '.claude', 'hooks', file),
      join(projectDir, '.claude', 'hooks', file),
      results, { dryRun, force }
    );
  }

  // Docs
  for (const file of SPRINT_KIT_FILES.docs) {
    copyFile(
      join(TEMPLATES_DIR, '_bmad', 'docs', file),
      join(projectDir, '_bmad', 'docs', file),
      results, { dryRun, force }
    );
  }

  // Preview template
  const previewSrc = join(TEMPLATES_DIR, 'preview-template');
  const previewDest = join(projectDir, 'preview-template');
  if (existsSync(previewSrc)) {
    if (dryRun) {
      results.copied.push('preview-template/');
    } else {
      ensureDirSync(previewDest);
      copySync(previewSrc, previewDest, { overwrite: true });
      results.overwritten.push('preview-template/');
    }
  }

  // .mcp.json.example
  const mcpSrc = join(TEMPLATES_DIR, '.mcp.json.example');
  const mcpDest = join(projectDir, '.mcp.json.example');
  if (existsSync(mcpSrc)) {
    copyFile(mcpSrc, mcpDest, results, { dryRun, force });
  }

  // Write version marker
  if (!dryRun) {
    const versionPath = join(projectDir, '.claude', '.sprint-kit-version');
    ensureDirSync(dirname(versionPath));
    writeFileSync(versionPath, SPRINT_KIT_VERSION + '\n');
  }

  // Ensure specs/ directory exists
  if (!dryRun) {
    ensureDirSync(join(projectDir, 'specs'));
  }

  return results;
}

function copyFile(src, dest, results, { dryRun, force }) {
  if (!existsSync(src)) {
    results.skipped.push(dest);
    return;
  }

  const destExists = existsSync(dest);

  if (dryRun) {
    results[destExists ? 'overwritten' : 'copied'].push(dest);
    return;
  }

  ensureDirSync(dirname(dest));
  copySync(src, dest, { overwrite: true });

  if (destExists) {
    results.overwritten.push(dest);
  } else {
    results.copied.push(dest);
  }
}

// For update: apply overwrite policy
export function updateSprintKitFiles(projectDir, options = {}) {
  // Same as copy but respects SKIP rules
  return copySprintKitFiles(projectDir, { ...options, force: true });
}
