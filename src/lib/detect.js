import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BMAD_COMPAT } from './manifest.js';

export function detect(projectDir) {
  return {
    nodeVersion: getNodeVersion(),
    isGitRepo: existsSync(join(projectDir, '.git')),
    hasBmad: existsSync(join(projectDir, '_bmad', 'bmm')),
    bmadVersion: readBmadVersion(projectDir),
    hasSprintKit: existsSync(join(projectDir, '.claude', '.sprint-kit-version')),
    sprintKitVersion: readSprintKitVersion(projectDir),
    hasClaude: existsSync(join(projectDir, '.claude')),
    hasSettings: existsSync(join(projectDir, '.claude', 'settings.json')),
    hasMcpConfig: existsSync(join(projectDir, '.mcp.json')),
  };
}

function getNodeVersion() {
  try {
    return process.version.replace(/^v/, '');
  } catch {
    return null;
  }
}

function readBmadVersion(projectDir) {
  // Try reading from _bmad/_config/manifest.yaml
  const manifestPath = join(projectDir, '_bmad', '_config', 'manifest.yaml');
  if (!existsSync(manifestPath)) return null;
  try {
    const content = readFileSync(manifestPath, 'utf-8');
    const match = content.match(/version:\s*['"]?([^'"\n]+)/);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

function readSprintKitVersion(projectDir) {
  const versionPath = join(projectDir, '.claude', '.sprint-kit-version');
  if (!existsSync(versionPath)) return null;
  try {
    return readFileSync(versionPath, 'utf-8').trim();
  } catch {
    return null;
  }
}

// Parse semver-ish version strings including pre-release tags like "6.0.0-Beta.8"
export function parseVersion(version) {
  if (!version) return null;
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null,
    raw: version,
  };
}

// Returns: 'compatible', 'above_verified', 'below_minimum', 'unknown'
export function checkBmadCompat(bmadVersion) {
  if (!bmadVersion) return 'unknown';
  const current = parseVersion(bmadVersion);
  const minimum = parseVersion(BMAD_COMPAT.minimum);
  const verified = parseVersion(BMAD_COMPAT.verified);
  if (!current || !minimum || !verified) return 'unknown';

  if (compareMajorMinor(current, minimum) < 0) return 'below_minimum';
  if (compareMajorMinor(current, verified) > 0) return 'above_verified';
  return 'compatible';
}

function compareMajorMinor(a, b) {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return 0; // Patch differences are ignored per policy
}
