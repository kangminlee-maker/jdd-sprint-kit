export const SOURCE_PURPOSES = [
  { value: 'code', label: '코드 (Code)', hint: 'AI가 구조를 분석합니다' },
  { value: 'ontology', label: '도메인 지식 (Knowledge)', hint: '용어, 엔티티 관계, 비즈니스 규칙' },
  { value: 'design-system', label: '디자인 규범 (Design)', hint: '토큰, 컴포넌트 스펙' },
];

export function isGitHubUrl(value) {
  return value.startsWith('https://github.com/');
}

export function buildSourceEntry(role, location, notes) {
  const entry = isGitHubUrl(location)
    ? { url: location, role }
    : { path: location, role };
  if (notes) {
    entry.notes = notes;
  }
  return entry;
}

function escapeYamlString(value) {
  return value.replace(/"/g, '\\"');
}

function renderSourceLine(source) {
  const lines = [];
  if (source.url) {
    lines.push(`  - url: "${escapeYamlString(source.url)}"`);
  } else {
    lines.push(`  - path: "${escapeYamlString(source.path)}"`);
  }
  lines.push(`    role: ${source.role}`);
  if (source.notes) {
    lines.push(`    notes: "${escapeYamlString(source.notes)}"`);
  }
  return lines.join('\n');
}

export function buildBriefTemplateContent(config) {
  const { sources = [], policyDocs = [] } = config;

  const yamlLines = [
    '---',
    '# ── Brownfield Source Declaration ────────────────────────',
    '# Project-wide defaults. /sprint copies this frontmatter when creating brief.md.',
    '# Write your feature description in the body section below ---.',
    '#',
    '# role: code | backend | client | ontology | design-system',
    '# url: GitHub repo (tarball download)',
    '# path: local directory (--add-dir alternative)',
    '',
    'sources:',
  ];

  if (sources.length > 0) {
    for (const source of sources) {
      yamlLines.push(renderSourceLine(source));
    }
  } else {
    yamlLines.push('  # No sources configured. Add manually or re-run: npx jdd-sprint-kit init');
  }

  yamlLines.push('');
  yamlLines.push('policy_docs:');

  if (policyDocs.length > 0) {
    for (const doc of policyDocs) {
      yamlLines.push(`  - "${escapeYamlString(doc)}"`);
    }
  } else {
    yamlLines.push('  # No policy documents configured');
  }

  yamlLines.push('---');
  yamlLines.push('');
  yamlLines.push('# {feature_name}');
  yamlLines.push('');
  yamlLines.push('## Background');
  yamlLines.push('(Why this feature is needed)');
  yamlLines.push('');
  yamlLines.push('## Feature Description');
  yamlLines.push('(Describe the specific feature to build)');
  yamlLines.push('');

  return yamlLines.join('\n');
}
