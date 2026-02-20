import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf-8'));

export const SPRINT_KIT_VERSION = pkg.version;

export const BMAD_COMPAT = {
  verified: '6.0.0-Beta.8',
  minimum: '6.0.0-Beta.8',
  verifiedAt: '2026-02-16',
};

export const SPRINT_KIT_FILES = {
  agents: [
    'auto-sprint.md', 'brownfield-scanner.md', 'scope-gate.md',
    'deliverable-generator.md', 'worker.md',
    'judge-quality.md', 'judge-security.md', 'judge-business.md',
  ],
  commands: [
    'sprint.md', 'specs.md', 'preview.md', 'crystallize.md', 'parallel.md',
    'validate.md', 'circuit-breaker.md', 'summarize-prd.md',
  ],
  rules: [
    'bmad-sprint-guide.md', 'bmad-sprint-protocol.md', 'bmad-mcp-search.md',
  ],
  hooks: [
    'sprint-pre-compact.sh', 'sprint-session-recovery.sh',
    'protect-readonly-paths.sh', 'desktop-notify.sh',
  ],
  docs: [
    'sprint-input-format.md', 'brownfield-context-format.md',
    'prd-format-guide.md', 'architecture-to-epics-checklist.md',
    'blueprint-format-guide.md',
  ],
};

export const BMAD_INTERFACES = [
  { type: 'workflow', path: 'create-product-brief' },
  { type: 'workflow', path: 'prd' },
  { type: 'workflow', path: 'create-architecture' },
  { type: 'workflow', path: 'create-epics-and-stories' },
  { type: 'agent',    path: 'analyst' },
  { type: 'agent',    path: 'pm' },
  { type: 'agent',    path: 'architect' },
  { type: 'config',   path: '_bmad/bmm/config.yaml' },
  { type: 'config',   path: '_bmad/_config/agent-manifest.csv' },
  { type: 'engine',   path: '_bmad/core/tasks/workflow.xml' },
];
