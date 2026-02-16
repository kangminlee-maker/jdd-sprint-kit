#!/usr/bin/env python3
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import re
import sys
from typing import Iterable

import yaml


ROOT = Path(".claude")
LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
HEADING_RE = re.compile(r"^(#{1,6})\s+")


@dataclass
class Issue:
    severity: str  # error | warn | info
    path: Path
    line: int
    message: str


def iter_non_fence_lines(lines: list[str]) -> Iterable[tuple[int, str]]:
    in_fence = False
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith("```"):
            in_fence = not in_fence
            continue
        if not in_fence:
            yield i, line


def has_valid_frontmatter(text: str) -> tuple[bool, dict | None, str | None]:
    if not text.startswith("---\n"):
        return False, None, None
    end = text.find("\n---\n", 4)
    if end == -1:
        return True, None, "frontmatter closing delimiter missing"
    raw = text[4:end]
    try:
        data = yaml.safe_load(raw)
    except Exception as exc:  # pragma: no cover - parser detail
        return True, None, f"invalid frontmatter YAML: {exc}"
    if not isinstance(data, dict):
        return True, None, "frontmatter is not a mapping"
    return True, data, None


def expected_frontmatter(path: Path) -> bool:
    # By convention in this repo:
    # - agent and bmad command wrappers include frontmatter
    # - top-level command docs and rules may not.
    s = str(path)
    return (
        s.startswith(".claude/agents/")
        or s.startswith(".claude/commands/bmad/")
    )


def validate_file(path: Path) -> list[Issue]:
    text = path.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()
    issues: list[Issue] = []

    has_fm, fm, fm_err = has_valid_frontmatter(text)
    if expected_frontmatter(path) and not has_fm:
        issues.append(Issue("error", path, 1, "expected frontmatter is missing"))
    if fm_err:
        issues.append(Issue("error", path, 1, fm_err))
    if has_fm and fm is not None:
        if expected_frontmatter(path):
            if "name" not in fm:
                issues.append(Issue("warn", path, 1, "frontmatter missing `name`"))
            if "description" not in fm:
                issues.append(Issue("warn", path, 1, "frontmatter missing `description`"))
        else:
            if "description" not in fm:
                issues.append(Issue("info", path, 1, "frontmatter missing `description`"))

    fence_toggles = sum(1 for l in lines if l.strip().startswith("```"))
    if fence_toggles % 2 != 0:
        issues.append(Issue("error", path, 1, "unbalanced fenced code blocks"))

    headings: list[tuple[int, int]] = []
    for ln, line in iter_non_fence_lines(lines):
        m = HEADING_RE.match(line)
        if m:
            headings.append((ln, len(m.group(1))))

    # Heading level jumps (e.g. # -> ###) can hurt chunk retrieval.
    prev = 0
    for ln, level in headings:
        if prev and level > prev + 1:
            issues.append(
                Issue(
                    "warn",
                    path,
                    ln,
                    f"heading level jump: H{prev} -> H{level}",
                )
            )
        prev = level

    # Soft readability signal for retrieval quality.
    for ln, line in iter_non_fence_lines(lines):
        if len(line) > 180:
            issues.append(
                Issue(
                    "info",
                    path,
                    ln,
                    f"long line ({len(line)} chars) outside code fence",
                )
            )

    # Validate relative Markdown links.
    for ln, line in iter_non_fence_lines(lines):
        for _label, target in LINK_RE.findall(line):
            t = target.strip()
            if t.startswith(("http://", "https://", "mailto:", "#")):
                continue
            t = t.split("#", 1)[0]
            if not t:
                continue
            candidate = (path.parent / t).resolve()
            if not candidate.exists():
                issues.append(
                    Issue(
                        "warn",
                        path,
                        ln,
                        f"relative markdown link target not found: {target}",
                    )
                )

    return issues


def main() -> int:
    if not ROOT.exists():
        print(f"{ROOT} not found", file=sys.stderr)
        return 2

    files = sorted(ROOT.rglob("*.md"))
    all_issues: list[Issue] = []
    for path in files:
        all_issues.extend(validate_file(path))

    counts = {"error": 0, "warn": 0, "info": 0}
    for issue in all_issues:
        counts[issue.severity] += 1

    print(f"files={len(files)}")
    print(f"errors={counts['error']} warns={counts['warn']} infos={counts['info']}")
    for severity in ("error", "warn", "info"):
        for issue in all_issues:
            if issue.severity != severity:
                continue
            print(f"{severity.upper()} {issue.path}:{issue.line} {issue.message}")

    return 1 if counts["error"] > 0 else 0


if __name__ == "__main__":
    raise SystemExit(main())
