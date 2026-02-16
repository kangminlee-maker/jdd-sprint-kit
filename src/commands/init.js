import * as p from '@clack/prompts';
import { existsSync } from 'node:fs';
import fsExtra from 'fs-extra';
const { ensureDirSync } = fsExtra;
import { join, relative } from 'node:path';
import { detect, checkBmadCompat } from '../lib/detect.js';
import { SPRINT_KIT_VERSION, SPRINT_KIT_FILES, BMAD_COMPAT } from '../lib/manifest.js';
import { copySprintKitFiles } from '../lib/copy.js';
import { mergeSettings, getSprintKitSettings, describeHookChanges } from '../lib/merge.js';
import {
  showIntro, showEnvStatus, promptIdeSelection,
  showBmadRequired, showAlreadyInstalled, showOutro,
  confirmOverwrite, confirmSettingsMerge,
  showVerification,
} from '../lib/prompts.js';
import { convertToCodex } from '../lib/adapters/codex.js';

export async function runInit(options = {}) {
  const { yes = false, ide = 'claude-code', dryRun = false } = options;
  const projectDir = process.cwd();

  // --- Step 1: Intro ---
  if (!yes) {
    showIntro();
  }

  // --- Step 2: Environment detection ---
  const env = detect(projectDir);
  const nodeVersionOk = env.nodeVersion && parseInt(env.nodeVersion.split('.')[0], 10) >= 18;
  const bmadCompat = checkBmadCompat(env.bmadVersion);

  const envInfo = {
    ...env,
    projectDir,
    nodeVersionOk,
    bmadCompat,
  };

  if (!yes) {
    showEnvStatus(envInfo);
  }

  // Node version check
  if (!nodeVersionOk) {
    if (yes) {
      console.error('Error: Node.js >= 18 is required.');
      process.exit(1);
    }
    p.cancel('Node.js 18 이상이 필요합니다. Node.js를 업그레이드해주세요.');
    process.exit(1);
  }

  // Git warning (non-blocking)
  if (!env.isGitRepo && !yes) {
    p.log.warn('Git 레포지토리가 아닙니다. 계속 진행합니다.');
  }

  // --- Step 3/4: BMad check ---
  if (!env.hasBmad) {
    if (yes) {
      console.error('Error: BMad Method is not installed. Run: npx bmad-method install');
      process.exit(1);
    }
    showBmadRequired(null, 'unknown');
    process.exit(1);
  }

  if (bmadCompat === 'below_minimum') {
    if (yes) {
      console.error(`Error: BMad Method ${env.bmadVersion} is below minimum ${BMAD_COMPAT.minimum}`);
      process.exit(1);
    }
    showBmadRequired(env.bmadVersion, bmadCompat);
    process.exit(1);
  }

  if (bmadCompat === 'above_verified' && !yes) {
    p.log.warn(`BMad Method ${env.bmadVersion}은 검증된 버전(${BMAD_COMPAT.verified})보다 높습니다. 계속 진행합니다.`);
  }

  // Already installed notice
  if (env.hasSprintKit && !yes) {
    showAlreadyInstalled(env.sprintKitVersion);
  }

  // --- Step 3: IDE selection ---
  let ideSelection = ide;
  if (!yes) {
    ideSelection = await promptIdeSelection();
  }
  const includeCodex = ideSelection.includes('codex');

  // --- Step 5: Install Sprint Kit files ---
  if (dryRun) {
    const results = copySprintKitFiles(projectDir, { dryRun: true });
    console.log('\n[Dry Run] Files that would be installed:');
    for (const f of [...results.copied, ...results.overwritten]) {
      const rel = relative(projectDir, f);
      console.log(`  ${rel}`);
    }
    if (includeCodex) {
      console.log('\n[Dry Run] Codex files that would be generated:');
      console.log('  AGENTS.md');
      for (const cmd of SPRINT_KIT_FILES.commands) {
        console.log(`  .codex/skills/${cmd.replace('.md', '')}/SKILL.md`);
      }
      for (const rule of SPRINT_KIT_FILES.rules) {
        console.log(`  .codex/rules/${rule}`);
      }
    }
    return;
  }

  // Check for files that will be overwritten
  if (!yes) {
    const willOverwrite = [];
    const dirs = [
      { files: SPRINT_KIT_FILES.agents, dir: join('.claude', 'agents') },
      { files: SPRINT_KIT_FILES.commands, dir: join('.claude', 'commands') },
      { files: SPRINT_KIT_FILES.rules, dir: join('.claude', 'rules') },
      { files: SPRINT_KIT_FILES.hooks, dir: join('.claude', 'hooks') },
      { files: SPRINT_KIT_FILES.docs, dir: join('_bmad', 'docs') },
    ];
    for (const { files, dir } of dirs) {
      for (const file of files) {
        const fullPath = join(projectDir, dir, file);
        if (existsSync(fullPath)) {
          willOverwrite.push(join(dir, file));
        }
      }
    }
    if (willOverwrite.length > 0) {
      const proceed = await confirmOverwrite(willOverwrite);
      if (!proceed) {
        p.cancel('설치가 취소되었습니다.');
        process.exit(0);
      }
    }
  }

  const s = p.spinner();
  if (!yes) s.start('Sprint Kit 파일 설치 중...');

  const copyResults = copySprintKitFiles(projectDir);

  if (!yes) {
    s.stop('Sprint Kit 파일 설치 완료');
    showCopyResults(copyResults);
  }

  // Codex conversion
  if (includeCodex) {
    if (!yes) {
      const cs = p.spinner();
      cs.start('Codex 추가 설치 중...');
      const templateDir = join(projectDir); // Use project files as source after copy
      const codexResults = convertToCodex(projectDir, templateDir);
      cs.stop('Codex 추가 설치 완료');
      p.note(
        codexResults.converted.map(f => `  ${f}  ✓`).join('\n'),
        'Codex 파일'
      );
    } else {
      convertToCodex(projectDir, projectDir);
    }
  }

  // --- Step 6: settings.json hook setup ---
  const settingsPath = join(projectDir, '.claude', 'settings.json');
  const backupPath = join(projectDir, '.claude', 'settings.json.bak');

  if (env.hasSettings && !yes) {
    const proceed = await confirmSettingsMerge();
    if (proceed) {
      const result = mergeSettings(settingsPath, backupPath);
      p.log.success(`settings.json ${result.action === 'merged' ? '머지' : '생성'} 완료`);
    } else {
      p.log.info('settings.json 훅 설정을 건너뛰었습니다. 나중에 설정하려면: npx bmad-sprint-kit init');
    }
  } else {
    mergeSettings(settingsPath, backupPath);
    if (!yes) {
      p.log.success(env.hasSettings ? 'settings.json 머지 완료' : 'settings.json 생성 완료');
    }
  }

  // --- Step 7: Verification + Outro ---
  const checks = verify(projectDir);

  if (!yes) {
    showVerification(checks);
    showOutro(ideSelection);
  } else {
    const failed = checks.filter(c => !c.ok);
    if (failed.length > 0) {
      console.error('Verification failed:');
      for (const c of failed) {
        console.error(`  ✗ ${c.path} — ${c.label}`);
      }
      process.exit(1);
    }
    console.log(`Sprint Kit v${SPRINT_KIT_VERSION} installed successfully.`);
  }
}

function showCopyResults(results) {
  const lines = [];
  const categoryCounts = {};

  const categories = [
    { key: 'agents', label: '에이전트', desc: 'Sprint의 각 단계를 자동 실행합니다', dir: '.claude/agents/' },
    { key: 'commands', label: '커맨드', desc: '/sprint 등 슬래시 커맨드', dir: '.claude/commands/' },
    { key: 'rules', label: '규칙', desc: 'Sprint 프로토콜과 검색 가이드', dir: '.claude/rules/' },
    { key: 'hooks', label: '훅', desc: '세션 자동 저장/복구', dir: '.claude/hooks/' },
    { key: 'docs', label: '문서', desc: 'Sprint Input/PRD 포맷 가이드', dir: '_bmad/docs/' },
  ];

  for (const cat of categories) {
    const count = SPRINT_KIT_FILES[cat.key].length;
    categoryCounts[cat.key] = count;
    lines.push(`${cat.label} — ${cat.desc}:`);
    lines.push(`  ${cat.dir}  ${count} files  ✓`);
    lines.push('');
  }

  lines.push('프로토타입 스캐폴드:');
  lines.push('  preview-template/  copied  ✓');
  lines.push('');
  lines.push('MCP 설정 템플릿:');
  lines.push('  .mcp.json.example  copied  ✓');

  p.note(lines.join('\n'), 'Sprint Kit 파일 설치 완료');
}

function verify(projectDir) {
  return [
    {
      path: '_bmad/bmm/',
      label: 'BMad core',
      ok: existsSync(join(projectDir, '_bmad', 'bmm')),
    },
    {
      path: `.claude/agents/ (${SPRINT_KIT_FILES.agents.length})`,
      label: 'Sprint agents',
      ok: SPRINT_KIT_FILES.agents.every(f =>
        existsSync(join(projectDir, '.claude', 'agents', f))
      ),
    },
    {
      path: `.claude/commands/ (${SPRINT_KIT_FILES.commands.length})`,
      label: 'Sprint commands',
      ok: SPRINT_KIT_FILES.commands.every(f =>
        existsSync(join(projectDir, '.claude', 'commands', f))
      ),
    },
    {
      path: '.claude/settings.json',
      label: 'hooks registered',
      ok: existsSync(join(projectDir, '.claude', 'settings.json')),
    },
    {
      path: 'preview-template/',
      label: 'prototype scaffold',
      ok: existsSync(join(projectDir, 'preview-template')),
    },
  ];
}
