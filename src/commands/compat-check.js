import * as p from '@clack/prompts';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { detect, checkBmadCompat } from '../lib/detect.js';
import { BMAD_COMPAT, BMAD_INTERFACES, SPRINT_KIT_VERSION } from '../lib/manifest.js';
import { collectFingerprints, compareFingerprints, resolveBmadPath } from '../lib/fingerprint.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function runCompatCheck(options = {}) {
  const { json: jsonOutput = false } = options;
  const projectDir = process.cwd();

  const env = detect(projectDir);
  const results = {
    version: SPRINT_KIT_VERSION,
    bmadVersion: env.bmadVersion,
    bmadCompat: checkBmadCompat(env.bmadVersion),
    stages: [],
    overallVerdict: 'PASS',
  };

  // --- Stage 1: Existence ---
  const stage1 = { name: 'existence', checks: [], verdict: 'PASS' };

  for (const iface of BMAD_INTERFACES) {
    const filePath = resolveBmadPath(projectDir, iface);
    const exists = filePath ? existsSync(filePath) : false;
    stage1.checks.push({
      interface: `${iface.type}:${iface.path}`,
      exists,
      path: filePath,
    });
    if (!exists) stage1.verdict = 'FAIL';
  }

  results.stages.push(stage1);

  // --- Stage 2: Structure ---
  const stage2 = { name: 'structure', checks: [], verdict: 'PASS' };

  // Check config.yaml has required fields
  const configPath = join(projectDir, '_bmad', 'bmm', 'config.yaml');
  if (existsSync(configPath)) {
    const configContent = readFileSync(configPath, 'utf-8');
    const requiredFields = ['project_name', 'planning_artifacts', 'communication_language'];
    for (const field of requiredFields) {
      const has = new RegExp(`^${field}:`, 'm').test(configContent);
      stage2.checks.push({ file: 'config.yaml', field, exists: has });
      if (!has) stage2.verdict = 'WARN';
    }
  }

  // Check agent-manifest.csv has expected columns
  const manifestPath = join(projectDir, '_bmad', '_config', 'agent-manifest.csv');
  if (existsSync(manifestPath)) {
    const manifestContent = readFileSync(manifestPath, 'utf-8');
    const firstLine = manifestContent.split('\n')[0] || '';
    const requiredColumns = ['name', 'role', 'path'];
    for (const col of requiredColumns) {
      const has = firstLine.toLowerCase().includes(col);
      stage2.checks.push({ file: 'agent-manifest.csv', column: col, exists: has });
      if (!has) stage2.verdict = 'WARN';
    }
  }

  results.stages.push(stage2);

  // --- Stage 3: Interface fingerprint ---
  const stage3 = { name: 'fingerprint', changes: [], verdict: 'PASS' };

  const baselinePath = join(__dirname, '..', '..', 'compat', 'baseline.json');
  if (existsSync(baselinePath)) {
    const baseline = JSON.parse(readFileSync(baselinePath, 'utf-8'));
    const currentFingerprints = collectFingerprints(projectDir);

    for (const [key, currentFp] of Object.entries(currentFingerprints)) {
      if (baseline.fingerprints[key]) {
        const diff = compareFingerprints(baseline.fingerprints[key], currentFp);
        if (diff.changes.length > 0) {
          stage3.changes.push({ interface: key, ...diff });
          if (diff.verdict === 'REVIEW_NEEDED') stage3.verdict = 'REVIEW_NEEDED';
          else if (diff.verdict === 'WARN' && stage3.verdict === 'PASS') stage3.verdict = 'WARN';
        }
      }
    }
  } else {
    stage3.verdict = 'SKIP';
    stage3.reason = 'No baseline.json found';
  }

  results.stages.push(stage3);

  // Overall verdict
  if (results.stages.some(s => s.verdict === 'FAIL')) {
    results.overallVerdict = 'FAIL';
  } else if (results.stages.some(s => s.verdict === 'REVIEW_NEEDED')) {
    results.overallVerdict = 'REVIEW_NEEDED';
  } else if (results.stages.some(s => s.verdict === 'WARN')) {
    results.overallVerdict = 'WARN';
  }

  // BMad version compat
  if (results.bmadCompat === 'below_minimum') {
    results.overallVerdict = 'FAIL';
  }

  // Output
  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
    process.exit(results.overallVerdict === 'FAIL' ? 1 : 0);
    return;
  }

  // Pretty output
  p.intro(`BMad Compatibility Check — Sprint Kit v${SPRINT_KIT_VERSION}`);

  // Version info
  const compatLabel = {
    compatible: '✓ compatible',
    above_verified: '⚠ above verified',
    below_minimum: '✗ below minimum',
    unknown: '? unknown',
  }[results.bmadCompat];

  p.note(
    [
      `BMad Method: ${env.bmadVersion || 'not found'} ${compatLabel}`,
      `Verified:    ${BMAD_COMPAT.verified} (${BMAD_COMPAT.verifiedAt})`,
      `Minimum:     ${BMAD_COMPAT.minimum}`,
    ].join('\n'),
    '버전 호환성'
  );

  // Stage 1: Existence
  const existLines = stage1.checks.map(c =>
    `  ${c.exists ? '✓' : '✗'} ${c.interface}`
  );
  p.note(existLines.join('\n'), `Stage 1: 존재 검증 — ${stage1.verdict}`);

  // Stage 2: Structure
  if (stage2.checks.length > 0) {
    const structLines = stage2.checks.map(c =>
      `  ${c.exists ? '✓' : '✗'} ${c.file}: ${c.field || c.column}`
    );
    p.note(structLines.join('\n'), `Stage 2: 구조 검증 — ${stage2.verdict}`);
  }

  // Stage 3: Fingerprint
  if (stage3.verdict === 'SKIP') {
    p.log.info(`Stage 3: Fingerprint — SKIP (${stage3.reason})`);
  } else if (stage3.changes.length === 0) {
    p.log.success('Stage 3: Fingerprint — PASS (변경 없음)');
  } else {
    const fpLines = [];
    for (const change of stage3.changes) {
      fpLines.push(`  ${change.interface}: ${change.verdict}`);
      for (const c of change.changes) {
        fpLines.push(`    ${c.change} ${c.type}: ${c.value}`);
      }
    }
    p.note(fpLines.join('\n'), `Stage 3: Fingerprint — ${stage3.verdict}`);
  }

  // Overall
  const verdictEmoji = {
    PASS: '✓',
    WARN: '⚠',
    REVIEW_NEEDED: '⚠',
    FAIL: '✗',
  }[results.overallVerdict];

  p.outro(`${verdictEmoji} Overall: ${results.overallVerdict}`);

  process.exit(results.overallVerdict === 'FAIL' ? 1 : 0);
}
