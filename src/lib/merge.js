import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import fsExtra from 'fs-extra';
const { copySync } = fsExtra;
import { join } from 'node:path';

const SPRINT_KIT_HOOK_MARKERS = [
  'sprint-pre-compact',
  'sprint-session-recovery',
  'protect-readonly-paths',
  'desktop-notify',
];

export function getSprintKitSettings() {
  return {
    hooks: {
      PreCompact: [
        {
          hooks: [
            {
              type: 'command',
              command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/sprint-pre-compact.sh',
              timeout: 10,
            },
          ],
        },
      ],
      SessionStart: [
        {
          matcher: 'compact',
          hooks: [
            {
              type: 'command',
              command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/sprint-session-recovery.sh',
              timeout: 10,
            },
          ],
        },
      ],
      PreToolUse: [
        {
          matcher: 'Write|Edit',
          hooks: [
            {
              type: 'command',
              command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/protect-readonly-paths.sh',
              timeout: 5,
            },
          ],
        },
      ],
      Notification: [
        {
          hooks: [
            {
              type: 'command',
              command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/desktop-notify.sh',
              timeout: 5,
            },
          ],
        },
      ],
    },
  };
}

export function mergeSettings(existingPath, backupPath) {
  const sprintKit = getSprintKitSettings();

  if (!existsSync(existingPath)) {
    writeFileSync(existingPath, JSON.stringify(sprintKit, null, 2) + '\n');
    return { action: 'created', backup: false };
  }

  // Create backup
  copySync(existingPath, backupPath);

  const existing = JSON.parse(readFileSync(existingPath, 'utf-8'));

  if (!existing.hooks) existing.hooks = {};

  for (const [event, entries] of Object.entries(sprintKit.hooks)) {
    if (!existing.hooks[event]) {
      existing.hooks[event] = entries;
    } else {
      // Remove existing Sprint Kit hooks, then add new ones
      const filtered = existing.hooks[event].filter(entry => !isSprintKitHook(entry));
      existing.hooks[event] = [...filtered, ...entries];
    }
  }

  writeFileSync(existingPath, JSON.stringify(existing, null, 2) + '\n');
  return { action: 'merged', backup: true };
}

export function isSprintKitHook(entry) {
  const commands = (entry.hooks || []).map(h => h.command || '');
  return commands.some(cmd =>
    SPRINT_KIT_HOOK_MARKERS.some(marker => cmd.includes(marker))
  );
}

export function describeHookChanges() {
  return [
    { event: 'PreCompact', script: 'sprint-pre-compact.sh', description: 'Sprint 세션 자동 저장' },
    { event: 'SessionStart', script: 'sprint-session-recovery.sh', description: 'Sprint 세션 자동 복구' },
    { event: 'PreToolUse', script: 'protect-readonly-paths.sh', description: 'Sprint Kit 읽기 전용 파일 보호' },
    { event: 'Notification', script: 'desktop-notify.sh', description: '데스크탑 알림' },
  ];
}
