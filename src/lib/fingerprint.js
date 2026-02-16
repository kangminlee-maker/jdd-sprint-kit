import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { BMAD_INTERFACES } from './manifest.js';

// BMad workflows are nested under phase directories (e.g., 1-analysis/create-product-brief/workflow.md)
// This function searches recursively for a workflow directory by name
function findWorkflowDir(workflowsDir, workflowName) {
  if (!existsSync(workflowsDir)) return null;
  for (const phase of readdirSync(workflowsDir, { withFileTypes: true })) {
    if (!phase.isDirectory()) continue;
    const candidate = join(workflowsDir, phase.name, workflowName);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

export function resolveBmadPath(projectDir, iface) {
  if (iface.type === 'workflow') {
    const workflowsDir = join(projectDir, '_bmad', 'bmm', 'workflows');
    const dir = findWorkflowDir(workflowsDir, iface.path);
    return dir ? join(dir, 'workflow.md') : null;
  } else if (iface.type === 'agent') {
    // Agents are flat files: _bmad/bmm/agents/analyst.md
    return join(projectDir, '_bmad', 'bmm', 'agents', `${iface.path}.md`);
  } else {
    return join(projectDir, iface.path);
  }
}

export function extractFingerprint(filePath) {
  if (!existsSync(filePath)) return null;
  const content = readFileSync(filePath, 'utf-8');
  return {
    steps: extractStepNames(content),
    inputRefs: extractInputPatterns(content),
    outputRefs: extractOutputPatterns(content),
    sections: extractMarkdownHeadings(content),
  };
}

function extractStepNames(content) {
  const steps = [];
  // Match "Step N:", "## Step N", numbered lists like "1. Step Name"
  const patterns = [
    /(?:^|\n)#+\s*(?:Step\s+\d+[:.]\s*)(.+)/gi,
    /(?:^|\n)\d+\.\s+\*\*(.+?)\*\*/g,
    /(?:^|\n)##\s+(.+)/g,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      steps.push(match[1].trim());
    }
  }
  return [...new Set(steps)];
}

function extractInputPatterns(content) {
  const inputs = [];
  // Match file references, variable references
  const patterns = [
    /\{([a-z_-]+)\}/g,          // {variable_name}
    /`([a-z_/-]+\.(?:md|yaml|json|csv|xml))`/gi, // `file.md`
    /read.*?[`"]([^`"]+)[`"]/gi, // read "file"
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      inputs.push(match[1]);
    }
  }
  return [...new Set(inputs)];
}

function extractOutputPatterns(content) {
  const outputs = [];
  const patterns = [
    /(?:create|generate|write|output).*?[`"]([^`"]+)[`"]/gi,
    /→\s*[`"]?([a-z_/-]+\.(?:md|yaml|json))[`"]?/gi,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      outputs.push(match[1]);
    }
  }
  return [...new Set(outputs)];
}

function extractMarkdownHeadings(content) {
  const headings = [];
  const regex = /^(#{1,4})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    headings.push({ level: match[1].length, text: match[2].trim() });
  }
  return headings;
}

export function compareFingerprints(baseline, current) {
  const results = [];

  // Compare steps
  const baseSteps = new Set(baseline.steps || []);
  const currSteps = new Set(current.steps || []);
  for (const step of currSteps) {
    if (!baseSteps.has(step)) {
      results.push({ type: 'step', change: 'added', value: step, verdict: 'PASS' });
    }
  }
  for (const step of baseSteps) {
    if (!currSteps.has(step)) {
      results.push({ type: 'step', change: 'removed', value: step, verdict: 'WARN' });
    }
  }

  // Compare input patterns
  const baseInputs = new Set(baseline.inputRefs || []);
  const currInputs = new Set(current.inputRefs || []);
  for (const input of baseInputs) {
    if (!currInputs.has(input)) {
      results.push({ type: 'input', change: 'removed', value: input, verdict: 'REVIEW_NEEDED' });
    }
  }

  // Compare sections
  const baseSections = new Set((baseline.sections || []).map(s => s.text));
  const currSections = new Set((current.sections || []).map(s => s.text));
  for (const section of baseSections) {
    if (!currSections.has(section)) {
      results.push({ type: 'section', change: 'removed', value: section, verdict: 'WARN' });
    }
  }

  // Overall verdict
  const hasReviewNeeded = results.some(r => r.verdict === 'REVIEW_NEEDED');
  const hasWarn = results.some(r => r.verdict === 'WARN');
  const overallVerdict = hasReviewNeeded ? 'REVIEW_NEEDED' : hasWarn ? 'WARN' : 'PASS';

  return { changes: results, verdict: overallVerdict };
}

export function collectFingerprints(projectDir) {
  const fingerprints = {};
  for (const iface of BMAD_INTERFACES) {
    const filePath = resolveBmadPath(projectDir, iface);
    if (filePath && existsSync(filePath)) {
      fingerprints[`${iface.type}:${iface.path}`] = extractFingerprint(filePath);
    }
  }
  return fingerprints;
}
