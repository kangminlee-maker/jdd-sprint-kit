#!/usr/bin/env python3
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import fnmatch
import re
import sys
from typing import Iterable

import yaml


RULES_PATH = Path(".claude/standards/md-standard-rules.yaml")
ROOT = Path(".")
LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")


@dataclass
class Finding:
    severity: str
    path: Path
    line: int
    code: str
    message: str


def iter_non_fence(lines: list[str]) -> Iterable[tuple[int, str]]:
    in_fence = False
    for i, line in enumerate(lines, 1):
        if line.strip().startswith("```"):
            in_fence = not in_fence
            continue
        if not in_fence:
            yield i, line


def match_any(path: str, patterns: list[str]) -> bool:
    return any(fnmatch.fnmatch(path, pat) for pat in patterns)


def read_frontmatter(text: str) -> tuple[dict | None, str | None]:
    if not text.startswith("---\n"):
        return None, None
    end = text.find("\n---\n", 4)
    if end == -1:
        return None, "frontmatter closing delimiter missing"
    raw = text[4:end]
    try:
        data = yaml.safe_load(raw)
    except Exception as exc:
        return None, f"invalid frontmatter yaml: {exc}"
    if not isinstance(data, dict):
        return None, "frontmatter is not a mapping"
    return data, None


def classify(path: str, classes: list[dict]) -> dict | None:
    for c in classes:
        if not match_any(path, c.get("globs", [])):
            continue
        if match_any(path, c.get("exclude_globs", [])):
            continue
        return c
    return None


def get_severity(rules: dict, code: str) -> str:
    return rules.get("severity", {}).get(code, "warn")


def add(findings: list[Finding], rules: dict, code: str, path: Path, line: int, msg: str) -> None:
    findings.append(Finding(get_severity(rules, code), path, line, code, msg))


def validate_file(path: Path, rules: dict) -> list[Finding]:
    findings: list[Finding] = []
    rel = str(path)
    cls = classify(rel, rules.get("classes", []))
    if cls is None:
        return findings

    text = path.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()
    fm, fm_err = read_frontmatter(text)

    # frontmatter
    req_fm = cls.get("required_frontmatter", [])
    rec_fm = cls.get("recommended_frontmatter", [])
    if req_fm and fm is None:
        add(findings, rules, "missing_required_frontmatter", path, 1, "required frontmatter missing")
    if fm_err:
        add(findings, rules, "missing_required_frontmatter", path, 1, fm_err)
    if fm is not None:
        for k in req_fm:
            if k not in fm:
                add(findings, rules, "missing_required_frontmatter", path, 1, f"frontmatter missing `{k}`")
        for k in rec_fm:
            if k not in fm:
                add(findings, rules, "missing_recommended_frontmatter", path, 1, f"recommended frontmatter missing `{k}`")

    # headings (fence-aware)
    h1 = []
    h2 = []
    for ln, line in iter_non_fence(lines):
        if line.startswith("# "):
            h1.append((ln, line[2:].strip()))
        elif line.startswith("## "):
            h2.append((ln, line[3:].strip()))

    if cls.get("required_h1") and not h1:
        add(findings, rules, "missing_required_h1", path, 1, "missing H1")

    if h1 and cls.get("h1_should_start_with"):
        prefixes = cls["h1_should_start_with"]
        if not any(h1[0][1].startswith(p) for p in prefixes):
            add(
                findings,
                rules,
                "bad_h1_prefix",
                path,
                h1[0][0],
                f"H1 should start with one of: {prefixes}",
            )

    if cls.get("required_h2"):
        h2_titles = {t for _, t in h2}
        for req in cls["required_h2"]:
            if req not in h2_titles:
                add(findings, rules, "missing_required_h2", path, 1, f"missing H2 `{req}`")

    if cls.get("required_h2_any_of"):
        if rel in set(rules.get("legacy", {}).get("top_command_exemptions", [])):
            pass
        else:
            h2_titles = {t for _, t in h2}
            for group in cls["required_h2_any_of"]:
                if not any(name in h2_titles for name in group):
                    add(
                        findings,
                        rules,
                        "missing_required_h2_any_of",
                        path,
                        1,
                        f"missing one of H2 group: {group}",
                    )

    if cls.get("recommended_h2"):
        h2_titles = {t for _, t in h2}
        for rec in cls["recommended_h2"]:
            if rec not in h2_titles:
                add(findings, rules, "missing_recommended_h2", path, 1, f"recommended H2 `{rec}` missing")

    if cls.get("dispatch_target_required"):
        if "Dispatch Target" not in text:
            add(findings, rules, "dispatch_target_missing", path, 1, "Dispatch Target not found in body")

    min_h2 = cls.get("required_min_h2")
    if min_h2 is not None and len(h2) < int(min_h2):
        add(findings, rules, "missing_required_h2", path, 1, f"requires >= {min_h2} H2 sections")

    patterns = cls.get("body_should_contain_any", [])
    if patterns and not any(p in text for p in patterns):
        add(
            findings,
            rules,
            "missing_body_pattern",
            path,
            1,
            f"body should contain one of: {patterns}",
        )

    max_lines = cls.get("max_lines_warning")
    if max_lines and len(lines) > int(max_lines):
        add(
            findings,
            rules,
            "file_too_long",
            path,
            1,
            f"file has {len(lines)} lines (recommended <= {max_lines})",
        )

    # global checks
    g = rules.get("global", {})
    for pat in g.get("deprecated_body_patterns", []):
        if pat in text:
            add(
                findings,
                rules,
                "deprecated_pattern",
                path,
                1,
                f"deprecated pattern found: `{pat}`",
            )
    if g.get("require_balanced_fences"):
        toggles = sum(1 for l in lines if l.strip().startswith("```"))
        if toggles % 2 != 0:
            add(findings, rules, "unbalanced_fences", path, 1, "unbalanced fenced code blocks")

    line_warn = int(g.get("line_length_warning", 0) or 0)
    for ln, line in iter_non_fence(lines):
        if g.get("no_tabs") and "\t" in line:
            add(findings, rules, "no_tabs", path, ln, "tab character detected")
        if g.get("no_trailing_whitespace") and line.rstrip() != line:
            add(findings, rules, "trailing_whitespace", path, ln, "trailing whitespace")
        if line_warn and len(line) > line_warn:
            add(findings, rules, "long_line", path, ln, f"line too long ({len(line)} > {line_warn})")

    if g.get("validate_relative_links"):
        for ln, line in iter_non_fence(lines):
            for _label, target in LINK_RE.findall(line):
                t = target.strip()
                if t.startswith(("http://", "https://", "mailto:", "#")):
                    continue
                t = t.split("#", 1)[0]
                if not t:
                    continue
                candidate = (path.parent / t).resolve()
                if not candidate.exists():
                    add(
                        findings,
                        rules,
                        "broken_relative_link",
                        path,
                        ln,
                        f"relative link target not found: {target}",
                    )

    return findings


def main() -> int:
    if not RULES_PATH.exists():
        print(f"rules file not found: {RULES_PATH}", file=sys.stderr)
        return 2

    rules = yaml.safe_load(RULES_PATH.read_text(encoding="utf-8"))
    files = sorted(Path(".claude").rglob("*.md"))

    findings: list[Finding] = []
    for path in files:
        findings.extend(validate_file(path, rules))

    counts = {"error": 0, "warn": 0, "info": 0}
    for f in findings:
        counts[f.severity] = counts.get(f.severity, 0) + 1

    print(f"files={len(files)}")
    print(f"errors={counts['error']} warns={counts['warn']} infos={counts['info']}")
    for sev in ("error", "warn", "info"):
        for f in findings:
            if f.severity != sev:
                continue
            print(f"{sev.upper()} {f.path}:{f.line} [{f.code}] {f.message}")

    return 1 if counts["error"] > 0 else 0


if __name__ == "__main__":
    raise SystemExit(main())
