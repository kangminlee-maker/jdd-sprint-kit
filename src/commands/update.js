import * as p from '@clack/prompts';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { detect, checkBmadCompat } from '../lib/detect.js';
import { SPRINT_KIT_VERSION, SPRINT_KIT_FILES } from '../lib/manifest.js';
import { updateSprintKitFiles } from '../lib/copy.js';
import { mergeSettings } from '../lib/merge.js';

export async function runUpdate(options = {}) {
  const { yes = false, dryRun = false } = options;
  const projectDir = process.cwd();

  if (!yes) {
    p.intro(`JDD Sprint Kit Update v${SPRINT_KIT_VERSION}`);
  }

  // Environment check
  const env = detect(projectDir);

  if (!env.hasSprintKit) {
    if (yes) {
      console.error('Error: Sprint Kit is not installed. Run: npx jdd-sprint-kit init');
      process.exit(1);
    }
    p.cancel('Sprint Kit이 설치되어 있지 않습니다. 먼저 init을 실행해주세요: npx jdd-sprint-kit init');
    process.exit(1);
  }

  if (!env.hasBmad) {
    if (yes) {
      console.error('Error: BMad Method is not installed.');
      process.exit(1);
    }
    p.cancel('BMad Method가 설치되어 있지 않습니다.');
    process.exit(1);
  }

  const bmadCompat = checkBmadCompat(env.bmadVersion);
  if (bmadCompat === 'below_minimum') {
    if (yes) {
      console.error(`Error: BMad Method ${env.bmadVersion} is below minimum.`);
      process.exit(1);
    }
    p.cancel(`BMad Method ${env.bmadVersion}은 최소 버전 미만입니다.`);
    process.exit(1);
  }

  // Version comparison
  if (!yes) {
    p.note(
      [
        `현재 설치: v${env.sprintKitVersion}`,
        `업데이트:  v${SPRINT_KIT_VERSION}`,
      ].join('\n'),
      '버전 정보'
    );
  }

  if (dryRun) {
    const results = updateSprintKitFiles(projectDir, { dryRun: true });
    console.log('\n[Dry Run] Files that would be updated:');
    for (const f of [...results.copied, ...results.overwritten]) {
      const rel = relative(projectDir, f);
      console.log(`  ${rel}`);
    }
    return;
  }

  // Show overwrite policy summary
  if (!yes) {
    p.note(
      [
        '덮어쓰기 대상 (Sprint Kit 소유):',
        '  .claude/agents/*.md',
        '  .claude/commands/{sprint,...}.md',
        '  .claude/rules/bmad-*.md',
        '  .claude/hooks/*.sh',
        '  _bmad/docs/*.md',
        '  preview-template/',
        '  .mcp.json.example',
        '',
        '머지 대상:',
        '  .claude/settings.json (사용자 훅 보존)',
        '',
        '스킵 대상 (사용자/BMad 소유):',
        '  .claude/commands/bmad/',
        '  _bmad/bmm/, _bmad/core/',
        '  .mcp.json, CLAUDE.md, specs/',
      ].join('\n'),
      '업데이트 정책'
    );

    const proceed = await p.confirm({
      message: '업데이트를 진행하시겠습니까?',
    });
    if (p.isCancel(proceed) || !proceed) {
      p.cancel('업데이트가 취소되었습니다.');
      process.exit(0);
    }
  }

  // Execute update
  const s = yes ? null : p.spinner();
  if (s) s.start('Sprint Kit 파일 업데이트 중...');

  const results = updateSprintKitFiles(projectDir);

  if (s) s.stop('Sprint Kit 파일 업데이트 완료');

  // Merge settings.json
  const settingsPath = join(projectDir, '.claude', 'settings.json');
  const backupPath = join(projectDir, '.claude', 'settings.json.bak');
  mergeSettings(settingsPath, backupPath);

  // Summary
  const newCount = results.copied.length;
  const updatedCount = results.overwritten.length;

  if (!yes) {
    p.note(
      [
        `새로 추가: ${newCount} files`,
        `업데이트:  ${updatedCount} files`,
        `settings.json: 머지 완료`,
      ].join('\n'),
      '업데이트 결과'
    );
    p.outro(`Sprint Kit v${SPRINT_KIT_VERSION} 업데이트 완료!`);
  } else {
    console.log(`Sprint Kit v${SPRINT_KIT_VERSION} updated. (${newCount} new, ${updatedCount} updated)`);
  }
}
