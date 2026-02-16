import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import fsExtra from 'fs-extra';
const { ensureDirSync } = fsExtra;
import { join, basename } from 'node:path';
import { SPRINT_KIT_FILES } from '../manifest.js';

export function convertToCodex(projectDir, templateDir) {
  const results = { converted: [], skipped: [] };

  convertAgentsToCodex(projectDir, templateDir, results);
  convertCommandsToSkills(projectDir, templateDir, results);
  convertRulesToCodex(projectDir, templateDir, results);
  // Hooks are not supported in Codex — skip

  return results;
}

function convertAgentsToCodex(projectDir, templateDir, results) {
  // .claude/agents/*.md → AGENTS.md (concatenated)
  const agentsDir = join(templateDir, '.claude', 'agents');
  const lines = ['# Sprint Kit Agents\n'];

  for (const file of SPRINT_KIT_FILES.agents) {
    const src = join(agentsDir, file);
    if (!existsSync(src)) continue;
    const content = readFileSync(src, 'utf-8');
    const name = basename(file, '.md');
    lines.push(`## ${name}\n`);
    lines.push(content);
    lines.push('\n---\n');
  }

  const dest = join(projectDir, 'AGENTS.md');
  writeFileSync(dest, lines.join('\n'));
  results.converted.push('AGENTS.md');
}

function convertCommandsToSkills(projectDir, templateDir, results) {
  // .claude/commands/*.md → .codex/skills/{name}/SKILL.md
  const skillsDir = join(projectDir, '.codex', 'skills');
  ensureDirSync(skillsDir);

  for (const file of SPRINT_KIT_FILES.commands) {
    const src = join(templateDir, '.claude', 'commands', file);
    if (!existsSync(src)) continue;
    const name = basename(file, '.md');
    const skillDir = join(skillsDir, name);
    ensureDirSync(skillDir);
    const content = readFileSync(src, 'utf-8');
    writeFileSync(join(skillDir, 'SKILL.md'), content);
    results.converted.push(`.codex/skills/${name}/SKILL.md`);
  }
}

function convertRulesToCodex(projectDir, templateDir, results) {
  // .claude/rules/*.md → .codex/rules/*.md
  const rulesDir = join(projectDir, '.codex', 'rules');
  ensureDirSync(rulesDir);

  for (const file of SPRINT_KIT_FILES.rules) {
    const src = join(templateDir, '.claude', 'rules', file);
    if (!existsSync(src)) continue;
    const content = readFileSync(src, 'utf-8');
    const dest = join(rulesDir, file);
    writeFileSync(dest, content);
    results.converted.push(`.codex/rules/${file}`);
  }
}
