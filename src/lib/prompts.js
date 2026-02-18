import * as p from '@clack/prompts';
import { SPRINT_KIT_VERSION } from './manifest.js';
import { detect, checkBmadCompat } from './detect.js';
import { describeHookChanges } from './merge.js';

export function showIntro() {
  p.intro(`JDD Sprint Kit Installer v${SPRINT_KIT_VERSION}`);
  p.note(
    [
      'AI가 만들고, 사람이 판단한다.',
      'Brief 하나로 Full-stack 설계를 자동 생성하고,',
      '프로덕트 전문가가 JP1/JP2에서 방향을 결정합니다.',
      '/sprint "만들고 싶은 기능" 한 줄이면 시작됩니다.',
    ].join('\n'),
    'JDD Sprint Kit'
  );
}

export function showEnvStatus(env) {
  const lines = [];
  lines.push(`📁 Project: ${env.projectDir}`);
  lines.push(`📦 Node.js: v${env.nodeVersion || 'not found'} ${env.nodeVersionOk ? '✓' : '✗'}`);
  lines.push(`📦 Git: ${env.isGitRepo ? 'initialized ✓' : 'not initialized ⚠'}`);

  if (env.hasBmad) {
    const compatLabel = {
      compatible: '✓ (verified compatible)',
      above_verified: '⚠ (above verified — proceed with caution)',
      below_minimum: '✗ (below minimum)',
      unknown: '? (version unknown)',
    }[env.bmadCompat];
    lines.push(`🔍 BMad Method: ${env.bmadVersion || 'unknown'} ${compatLabel}`);
  } else {
    lines.push('🔍 BMad Method: not installed');
  }

  if (env.hasSprintKit) {
    lines.push(`🔍 Sprint Kit: v${env.sprintKitVersion} (installed)`);
  } else {
    lines.push('🔍 Sprint Kit: not installed');
  }

  p.note(lines.join('\n'), '환경 감지');
}

export async function promptIdeSelection() {
  const result = await p.select({
    message: '어떤 AI 코딩 도구를 사용하시나요?',
    options: [
      { value: 'claude-code', label: 'Claude Code', hint: 'Sprint Kit 전체 기능' },
      { value: 'claude-code,codex', label: 'Claude Code + Codex', hint: 'Codex에도 에이전트/규칙 설치' },
    ],
  });
  if (p.isCancel(result)) {
    p.cancel('설치가 취소되었습니다.');
    process.exit(0);
  }
  return result;
}

export async function confirmOverwrite(files) {
  p.note(
    files.map(f => `  ${f}`).join('\n'),
    '다음 파일이 덮어쓰여집니다'
  );
  const result = await p.confirm({
    message: '계속 진행하시겠습니까?',
  });
  if (p.isCancel(result)) {
    p.cancel('설치가 취소되었습니다.');
    process.exit(0);
  }
  return result;
}

export async function confirmSettingsMerge() {
  const hooks = describeHookChanges();
  p.note(
    [
      '기존 settings.json에 Sprint Kit 훅을 추가합니다.',
      '',
      '추가될 훅:',
      ...hooks.map(h => `  + ${h.event}: ${h.script}`),
      '',
      '백업: .claude/settings.json.bak',
    ].join('\n'),
    'settings.json 훅 설정'
  );

  const result = await p.confirm({
    message: '머지 진행하시겠습니까?',
  });
  if (p.isCancel(result)) {
    p.cancel('설치가 취소되었습니다.');
    process.exit(0);
  }
  return result;
}

export function showBmadRequired(bmadVersion, bmadCompat) {
  if (bmadCompat === 'below_minimum') {
    p.note(
      [
        `⚠️ BMad Method ${bmadVersion}가 설치되어 있습니다.`,
        `   Sprint Kit v${SPRINT_KIT_VERSION}은 BMad Method v6.0.0 이상이 필요합니다.`,
        '',
        '업그레이드 후 다시 실행:',
        '  npx bmad-method install',
        '  npx jdd-sprint-kit init',
      ].join('\n'),
      'BMad Method 업그레이드 필요'
    );
  } else {
    p.note(
      [
        'Sprint Kit은 BMad Method가 필요합니다.',
        '',
        '설치:',
        '  npx bmad-method install',
        '',
        '설치 후 다시 실행:',
        '  npx jdd-sprint-kit init',
      ].join('\n'),
      'BMad Method 필요'
    );
  }
}

export function showInstallProgress(results) {
  const s = p.spinner();

  const categories = [
    { key: 'agents', label: '에이전트', desc: 'Sprint의 각 단계를 자동 실행합니다', dir: '.claude/agents/' },
    { key: 'commands', label: '커맨드', desc: '/sprint 등 슬래시 커맨드', dir: '.claude/commands/' },
    { key: 'rules', label: '규칙', desc: 'Sprint 프로토콜과 검색 가이드', dir: '.claude/rules/' },
    { key: 'hooks', label: '훅', desc: '세션 자동 저장/복구', dir: '.claude/hooks/' },
    { key: 'docs', label: '문서', desc: 'Sprint Input/PRD 포맷 가이드', dir: '_bmad/docs/' },
  ];

  const lines = [];
  for (const cat of categories) {
    const count = results.categoryCounts?.[cat.key] || 0;
    lines.push(`${cat.label} — ${cat.desc}:`);
    lines.push(`  ${cat.dir}  ${count} files  ✓`);
    lines.push('');
  }

  if (results.previewCopied) {
    lines.push('프로토타입 스캐폴드:');
    lines.push('  preview-template/  copied  ✓');
    lines.push('');
  }

  if (results.mcpExampleCopied) {
    lines.push('MCP 설정 템플릿:');
    lines.push('  .mcp.json.example  copied  ✓');
  }

  p.note(lines.join('\n'), 'Sprint Kit 파일 설치 완료');
}

export function showAlreadyInstalled(version) {
  p.note(
    [
      `Sprint Kit v${version}이 이미 설치되어 있습니다.`,
      '',
      '업데이트:  npx jdd-sprint-kit update',
      '보완:     npx jdd-sprint-kit init  (빠진 설정만 진행)',
    ].join('\n'),
    '이미 설치됨'
  );
}

export function showVerification(checks) {
  const lines = checks.map(c =>
    `  ${c.path.padEnd(25)} ${c.ok ? '✓' : '✗'}  ${c.label}`
  );
  p.note(lines.join('\n'), '설치 검증');
}

export function showOutro(ideSelection) {
  const lines = [
    `Sprint Kit v${SPRINT_KIT_VERSION} 설치 완료!`,
    '',
    '다음 단계:',
    '  1. claude 실행',
    '  2. /sprint "만들고 싶은 기능 설명"',
    '',
    'MCP 설정 (기존 서비스 연동):',
    '  .mcp.json.example 참고하여 .mcp.json 생성',
    '',
    '팀원 추가 설치:',
    '  git commit 후 팀원은 git pull로 자동 적용',
  ];
  p.outro(lines.join('\n'));
}
