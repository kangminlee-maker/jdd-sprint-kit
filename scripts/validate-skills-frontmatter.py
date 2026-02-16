#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path


SKILLS_DIR = Path(".agents/skills")


def validate_skill(path: Path) -> None:
    lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
    if len(lines) < 4:
        raise AssertionError(f"{path}: too short")
    if lines[0].strip() != "---":
        raise AssertionError(f"{path}: missing frontmatter start")
    if not any(line.startswith("name: ") for line in lines[1:8]):
        raise AssertionError(f"{path}: missing name field")
    if not any(line.startswith("description: ") for line in lines[1:10]):
        raise AssertionError(f"{path}: missing description field")


def main() -> None:
    skills = sorted(SKILLS_DIR.glob("*/SKILL.md"))
    if not skills:
        raise AssertionError(f"{SKILLS_DIR}: no skills found")
    for skill in skills:
        validate_skill(skill)
    print("ok")


if __name__ == "__main__":
    main()
