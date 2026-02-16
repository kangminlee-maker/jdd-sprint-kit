#!/usr/bin/env node

/**
 * prepublishOnly script: copies Sprint Kit files from repo root into templates/
 * so they can be distributed via npm.
 */

import fsExtra from 'fs-extra';
const { copySync, ensureDirSync, removeSync } = fsExtra;
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPRINT_KIT_FILES } from '../src/lib/manifest.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TEMPLATES = join(ROOT, 'templates');

console.log('Building templates/ for npm publish...');

// Clean
if (existsSync(TEMPLATES)) {
  removeSync(TEMPLATES);
}

// Agents
for (const file of SPRINT_KIT_FILES.agents) {
  copyIfExists(
    join(ROOT, '.claude', 'agents', file),
    join(TEMPLATES, '.claude', 'agents', file)
  );
}

// Commands (Sprint Kit only, not bmad/)
for (const file of SPRINT_KIT_FILES.commands) {
  copyIfExists(
    join(ROOT, '.claude', 'commands', file),
    join(TEMPLATES, '.claude', 'commands', file)
  );
}

// Rules
for (const file of SPRINT_KIT_FILES.rules) {
  copyIfExists(
    join(ROOT, '.claude', 'rules', file),
    join(TEMPLATES, '.claude', 'rules', file)
  );
}

// Hooks
for (const file of SPRINT_KIT_FILES.hooks) {
  copyIfExists(
    join(ROOT, '.claude', 'hooks', file),
    join(TEMPLATES, '.claude', 'hooks', file)
  );
}

// Docs
for (const file of SPRINT_KIT_FILES.docs) {
  copyIfExists(
    join(ROOT, '_bmad', 'docs', file),
    join(TEMPLATES, '_bmad', 'docs', file)
  );
}

// settings.json (template copy)
copyIfExists(
  join(ROOT, '.claude', 'settings.json'),
  join(TEMPLATES, '.claude', 'settings.json')
);

// Preview template
const previewSrc = join(ROOT, 'preview-template');
if (existsSync(previewSrc)) {
  ensureDirSync(join(TEMPLATES, 'preview-template'));
  copySync(previewSrc, join(TEMPLATES, 'preview-template'));
  console.log('  preview-template/ ✓');
}

// .mcp.json.example
copyIfExists(
  join(ROOT, '.mcp.json.example'),
  join(TEMPLATES, '.mcp.json.example')
);

console.log('Templates build complete.');

function copyIfExists(src, dest) {
  if (existsSync(src)) {
    ensureDirSync(dirname(dest));
    copySync(src, dest);
    const rel = dest.replace(TEMPLATES + '/', '');
    console.log(`  ${rel} ✓`);
  } else {
    const rel = src.replace(ROOT + '/', '');
    console.warn(`  ⚠ ${rel} not found, skipped`);
  }
}
