#!/usr/bin/env python3
"""
JDD Sprint Kit — Parallel Orchestrator (Agents SDK)

Usage:
    python scripts/parallel-orchestrator.py --feature <feature-name> [--base-branch main]

Requires:
    pip install -r scripts/requirements.txt
    OPENAI_API_KEY environment variable

This script provides Mode B (advanced) parallel execution using
OpenAI Agents SDK. For Mode A (sequential), use the $parallel skill directly.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
import re
import subprocess
import sys
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# Agents SDK import
# ---------------------------------------------------------------------------
try:
    from agents import Agent, Runner
except ImportError:
    sys.exit(
        "openai-agents package not found. Install with:\n"
        "  pip install -r scripts/requirements.txt"
    )

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("parallel-orchestrator")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
SPECS_DIR = PROJECT_ROOT / "specs"


def _strip_wrapping_quotes(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        return value[1:-1]
    return value


def load_env_file(path: Path) -> bool:
    """Load simple KEY=VALUE pairs from a .env file into os.environ."""
    if not path.exists():
        return False

    loaded_any = False
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[len("export ") :].strip()
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        if not key:
            continue
        value = _strip_wrapping_quotes(value)
        # Do not override already-set environment variables.
        if key not in os.environ:
            os.environ[key] = value
            loaded_any = True
    return loaded_any


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------
class Entropy(Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass
class Task:
    id: str
    title: str
    description: str = ""
    dependencies: list[str] = field(default_factory=list)
    entropy: Entropy = Entropy.MEDIUM
    files: list[str] = field(default_factory=list)
    worktree_path: Optional[Path] = None
    branch_name: str = ""
    gh_issue_number: Optional[int] = None
    status: str = "pending"  # pending | running | completed | failed
    error: Optional[str] = None


# ---------------------------------------------------------------------------
# Task 1 — Parse tasks.md
# ---------------------------------------------------------------------------
def parse_tasks(feature_name: str) -> list[Task]:
    """Parse specs/{feature}/tasks.md and return a list of Task objects."""
    tasks_path = SPECS_DIR / feature_name / "tasks.md"
    if not tasks_path.exists():
        sys.exit(f"tasks.md not found at {tasks_path}")

    content = tasks_path.read_text(encoding="utf-8")
    tasks: list[Task] = []

    # Split into task blocks.  Each task starts with a heading like:
    #   ## Task <id>: <title>   or   ### Task <id>: <title>
    task_pattern = re.compile(
        r"^#{2,3}\s+Task(?:\s*:\s*|\s+)(\S+)\s*:\s*(.+)$",
        re.MULTILINE,
    )
    matches = list(task_pattern.finditer(content))

    for idx, match in enumerate(matches):
        task_id = match.group(1).strip()
        title = match.group(2).strip()

        # Body is text between this heading and the next (or EOF)
        start = match.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(content)
        body = content[start:end]

        # Remove lightweight markdown markers to simplify field extraction from
        # list items like "- **Dependencies**: T-1".
        normalized_body = re.sub(r"[*`]", "", body)

        # --- dependencies ---
        deps: list[str] = []
        dep_match = re.search(
            r"(?:dependencies|depends on|blockers?)\s*[:=]\s*(.+)",
            normalized_body,
            re.IGNORECASE,
        )
        if dep_match:
            raw = dep_match.group(1)
            # Accept comma / semicolon / "and" separated ids
            deps = [
                d.strip().lstrip("#").strip()
                for d in re.split(r"[,;]|\band\b", raw)
                if d.strip() and d.strip().lower() != "none"
            ]

        # --- entropy ---
        entropy = Entropy.MEDIUM
        ent_match = re.search(
            r"entropy\s*(?:tolerance)?\s*[:=]\s*(high|medium|low)",
            normalized_body,
            re.IGNORECASE,
        )
        if ent_match:
            entropy = Entropy(ent_match.group(1).lower())

        # --- file ownership ---
        files: list[str] = []
        file_match = re.search(
            r"(?:owned\s+files?|files?|ownership)\s*[:=]\s*(.+?)(?:\n\n|\n#|\Z)",
            normalized_body,
            re.IGNORECASE | re.DOTALL,
        )
        if file_match:
            for line in file_match.group(1).strip().splitlines():
                cleaned = line.strip().lstrip("-*").strip().strip("`")
                if cleaned:
                    files.append(cleaned)

        # --- description (first non-empty paragraph) ---
        desc_lines: list[str] = []
        for line in body.strip().splitlines():
            if line.strip().startswith("#"):
                break
            if re.match(
                r"(?:dependencies|depends on|blockers?|entropy|files?|ownership)\s*[:=]",
                line,
                re.IGNORECASE,
            ):
                continue
            desc_lines.append(line)
        description = "\n".join(desc_lines).strip()

        tasks.append(
            Task(
                id=task_id,
                title=title,
                description=description,
                dependencies=deps,
                entropy=entropy,
                files=files,
            )
        )

    if not tasks:
        sys.exit(f"No tasks found in {tasks_path}")

    log.info("Parsed %d tasks from %s", len(tasks), tasks_path)
    return tasks


# ---------------------------------------------------------------------------
# Task 2 — Build DAG and parallelism groups
# ---------------------------------------------------------------------------
def build_dag(tasks: list[Task]) -> list[list[Task]]:
    """Return topologically-sorted layers (parallelism groups).

    Each layer contains tasks whose dependencies are satisfied by
    all previous layers.
    """
    task_map: dict[str, Task] = {t.id: t for t in tasks}

    # Validate deps exist
    for t in tasks:
        for dep_id in t.dependencies:
            if dep_id not in task_map:
                log.warning(
                    "Task %s depends on unknown task %s — ignoring dependency",
                    t.id,
                    dep_id,
                )
                t.dependencies = [d for d in t.dependencies if d in task_map]

    completed: set[str] = set()
    remaining: dict[str, Task] = dict(task_map)
    layers: list[list[Task]] = []

    while remaining:
        # Find tasks whose deps are all completed
        ready = [
            t
            for t in remaining.values()
            if all(d in completed for d in t.dependencies)
        ]
        if not ready:
            unresolved = ", ".join(remaining.keys())
            sys.exit(
                f"Circular dependency detected — cannot schedule: {unresolved}"
            )
        layers.append(ready)
        for t in ready:
            completed.add(t.id)
            del remaining[t.id]

    log.info(
        "DAG built: %d layers — %s",
        len(layers),
        [len(layer) for layer in layers],
    )
    return layers


# ---------------------------------------------------------------------------
# Task 3 — Git worktrees
# ---------------------------------------------------------------------------
def _run(cmd: list[str], **kwargs) -> subprocess.CompletedProcess:
    """Run a subprocess, logging the command."""
    log.debug("$ %s", " ".join(cmd))
    return subprocess.run(cmd, capture_output=True, text=True, cwd=PROJECT_ROOT, **kwargs)


def create_worktrees(tasks: list[Task], base_branch: str) -> None:
    """Create a git worktree + branch for each task."""
    worktrees_dir = PROJECT_ROOT / ".worktrees"
    worktrees_dir.mkdir(exist_ok=True)

    for task in tasks:
        branch = f"task/{task.id}"
        wt_path = worktrees_dir / task.id
        task.branch_name = branch
        task.worktree_path = wt_path

        if wt_path.exists():
            log.info("Worktree already exists for %s, reusing", task.id)
            continue

        result = _run(
            ["git", "worktree", "add", "-b", branch, str(wt_path), base_branch]
        )
        if result.returncode != 0:
            # Branch may already exist — try without -b
            result = _run(
                ["git", "worktree", "add", str(wt_path), branch]
            )
            if result.returncode != 0:
                log.error(
                    "Failed to create worktree for %s: %s",
                    task.id,
                    result.stderr.strip(),
                )
                task.status = "failed"
                task.error = f"worktree creation failed: {result.stderr.strip()}"
                continue

        log.info("Created worktree %s -> %s", task.id, wt_path)


def cleanup_worktrees(tasks: list[Task]) -> None:
    """Remove worktrees and optionally delete branches."""
    for task in tasks:
        if task.worktree_path and task.worktree_path.exists():
            _run(["git", "worktree", "remove", "--force", str(task.worktree_path)])
            log.info("Removed worktree %s", task.worktree_path)

    _run(["git", "worktree", "prune"])


# ---------------------------------------------------------------------------
# Task 4 — GitHub Issues
# ---------------------------------------------------------------------------
def create_gh_issues(tasks: list[Task], feature_name: str) -> None:
    """Create a GitHub issue for each task using gh CLI."""
    for task in tasks:
        if task.status == "failed":
            continue

        label_list = f"sprint,entropy:{task.entropy.value}"
        body = (
            f"**Feature:** {feature_name}\n"
            f"**Task:** {task.id}\n"
            f"**Entropy:** {task.entropy.value}\n"
            f"**Dependencies:** {', '.join(task.dependencies) or 'none'}\n\n"
            f"**Files:**\n"
            + "\n".join(f"- `{f}`" for f in task.files)
            + f"\n\n---\n\n{task.description}"
        )

        result = _run(
            [
                "gh",
                "issue",
                "create",
                "--title",
                f"[{feature_name}] Task {task.id}: {task.title}",
                "--body",
                body,
                "--label",
                label_list,
            ]
        )
        if result.returncode == 0:
            # gh outputs the URL; extract the issue number
            url = result.stdout.strip()
            number_match = re.search(r"/issues/(\d+)", url)
            if number_match:
                task.gh_issue_number = int(number_match.group(1))
            log.info("Created issue for task %s: %s", task.id, url)
        else:
            log.warning(
                "Failed to create issue for %s (non-fatal): %s",
                task.id,
                result.stderr.strip(),
            )


def close_gh_issue(task: Task) -> None:
    """Close the GitHub issue for a completed task."""
    if task.gh_issue_number is None:
        return
    result = _run(
        ["gh", "issue", "close", str(task.gh_issue_number), "--reason", "completed"]
    )
    if result.returncode == 0:
        log.info("Closed issue #%d for task %s", task.gh_issue_number, task.id)
    else:
        log.warning(
            "Failed to close issue #%d: %s",
            task.gh_issue_number,
            result.stderr.strip(),
        )


# ---------------------------------------------------------------------------
# Task 5 — Run parallel agents
# ---------------------------------------------------------------------------
WORKER_SYSTEM_PROMPT = """\
You are a JDD Sprint Kit Worker agent. You implement exactly ONE task in an \
isolated git worktree.

## Rules
1. Read the specs files in `specs/{feature}/` to understand the full context.
2. Read `specs/{feature}/brownfield-context.md` to understand existing system patterns.
3. Implement ONLY the files listed in your file ownership. Do NOT modify files \
   outside your ownership.
4. Follow the project conventions described in AGENTS.md (or CLAUDE.md).
5. Write clean, well-tested code. Include unit tests when applicable.
6. After implementation, run any available linters and type-checks.
7. Commit your changes with a clear message referencing the task ID.

## Your Task
- **Task ID:** {task_id}
- **Title:** {title}
- **Description:** {description}
- **Entropy:** {entropy}
- **Owned Files:** {files}
- **Working Directory:** {worktree_path}
- **Feature:** {feature}
"""


async def run_worker(task: Task, feature_name: str) -> Task:
    """Execute a single worker agent for the given task."""
    if task.status == "failed":
        return task

    log.info("Starting worker for task %s: %s", task.id, task.title)
    task.status = "running"

    system_prompt = WORKER_SYSTEM_PROMPT.format(
        task_id=task.id,
        title=task.title,
        description=task.description,
        entropy=task.entropy.value,
        files=", ".join(task.files) or "(see tasks.md)",
        worktree_path=task.worktree_path,
        feature=feature_name,
    )

    agent = Agent(
        name=f"worker-{task.id}",
        instructions=system_prompt,
    )

    user_message = (
        f"Implement Task {task.id}: {task.title}\n\n"
        f"Work in directory: {task.worktree_path}\n"
        f"Feature specs are in: specs/{feature_name}/\n\n"
        f"{task.description}"
    )

    try:
        result = await Runner.run(agent, user_message)
        task.status = "completed"
        log.info("Task %s completed successfully", task.id)
    except Exception as exc:
        task.status = "failed"
        task.error = str(exc)
        log.error("Task %s failed: %s", task.id, exc)

    return task


async def run_parallel(
    layers: list[list[Task]], feature_name: str
) -> list[Task]:
    """Execute tasks layer-by-layer; tasks within a layer run in parallel."""
    all_tasks: list[Task] = []

    for layer_idx, layer in enumerate(layers):
        log.info(
            "=== Layer %d/%d — %d tasks ===",
            layer_idx + 1,
            len(layers),
            len(layer),
        )

        # Skip tasks whose dependencies failed
        runnable: list[Task] = []
        failed_deps_map: dict[str, set[str]] = {}
        completed_ids = {t.id for t in all_tasks if t.status == "completed"}

        for task in layer:
            failed_deps = {
                d
                for d in task.dependencies
                if d not in completed_ids
            }
            if failed_deps:
                task.status = "failed"
                task.error = f"Skipped — dependencies failed: {', '.join(failed_deps)}"
                log.warning("Skipping task %s: %s", task.id, task.error)
            else:
                runnable.append(task)

        # Run all tasks in this layer concurrently
        results = await asyncio.gather(
            *(run_worker(t, feature_name) for t in runnable),
            return_exceptions=True,
        )

        for i, result in enumerate(results):
            if isinstance(result, Exception):
                runnable[i].status = "failed"
                runnable[i].error = str(result)
                log.error("Task %s raised exception: %s", runnable[i].id, result)

        all_tasks.extend(layer)

    return all_tasks


# ---------------------------------------------------------------------------
# Task 6 — Merge results
# ---------------------------------------------------------------------------
def merge_results(tasks: list[Task], base_branch: str) -> None:
    """Merge completed task branches back into base_branch."""
    # Checkout base branch
    _run(["git", "checkout", base_branch])

    for task in tasks:
        if task.status != "completed":
            log.info("Skipping merge for %s (status: %s)", task.id, task.status)
            continue

        log.info("Merging branch %s for task %s", task.branch_name, task.id)
        result = _run(
            [
                "git",
                "merge",
                task.branch_name,
                "--no-ff",
                "-m",
                f"Merge task {task.id}: {task.title}",
            ]
        )
        if result.returncode != 0:
            log.error(
                "Merge conflict for task %s: %s", task.id, result.stderr.strip()
            )
            # Abort the merge so we can continue with others
            _run(["git", "merge", "--abort"])
            task.status = "failed"
            task.error = f"merge conflict: {result.stderr.strip()}"
        else:
            log.info("Merged task %s successfully", task.id)
            close_gh_issue(task)


# ---------------------------------------------------------------------------
# Dry-run report
# ---------------------------------------------------------------------------
def print_dry_run(tasks: list[Task], layers: list[list[Task]], feature_name: str) -> None:
    """Print the execution plan without running anything."""
    print("\n" + "=" * 60)
    print(f"  DRY RUN — Feature: {feature_name}")
    print("=" * 60)

    print(f"\nTotal tasks: {len(tasks)}")
    print(f"Parallelism layers: {len(layers)}\n")

    for layer_idx, layer in enumerate(layers):
        print(f"--- Layer {layer_idx + 1} ({len(layer)} tasks, run in parallel) ---")
        for task in layer:
            deps = ", ".join(task.dependencies) if task.dependencies else "none"
            print(f"  [{task.id}] {task.title}")
            print(f"         Entropy: {task.entropy.value}")
            print(f"         Dependencies: {deps}")
            print(f"         Files: {', '.join(task.files) or '(see tasks.md)'}")
        print()

    print("=" * 60)
    print("  End of dry-run plan")
    print("=" * 60 + "\n")


# ---------------------------------------------------------------------------
# Summary report
# ---------------------------------------------------------------------------
def print_summary(tasks: list[Task]) -> None:
    """Print execution summary."""
    completed = [t for t in tasks if t.status == "completed"]
    failed = [t for t in tasks if t.status == "failed"]

    print("\n" + "=" * 60)
    print("  EXECUTION SUMMARY")
    print("=" * 60)
    print(f"  Completed: {len(completed)}/{len(tasks)}")
    print(f"  Failed:    {len(failed)}/{len(tasks)}")

    if failed:
        print("\n  Failed tasks:")
        for t in failed:
            print(f"    [{t.id}] {t.title}: {t.error}")

    print("=" * 60 + "\n")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
async def async_main(feature_name: str, base_branch: str, dry_run: bool) -> int:
    """Orchestrate the full parallel execution pipeline."""
    # 1. Parse
    tasks = parse_tasks(feature_name)

    # 2. Build DAG
    layers = build_dag(tasks)

    # 3. Dry-run?
    if dry_run:
        print_dry_run(tasks, layers, feature_name)
        return 0

    # 4. Create worktrees
    create_worktrees(tasks, base_branch)

    # 5. Create GitHub issues
    create_gh_issues(tasks, feature_name)

    # 6. Run parallel agents
    all_tasks = await run_parallel(layers, feature_name)

    # 7. Merge results
    merge_results(all_tasks, base_branch)

    # 8. Cleanup
    cleanup_worktrees(all_tasks)

    # 9. Summary
    print_summary(all_tasks)

    failed_count = sum(1 for t in all_tasks if t.status == "failed")
    return 1 if failed_count > 0 else 0


def main() -> None:
    parser = argparse.ArgumentParser(
        description="JDD Sprint Kit — Parallel Orchestrator (Agents SDK)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--feature",
        required=True,
        help="Feature name (directory under specs/)",
    )
    parser.add_argument(
        "--base-branch",
        default="main",
        help="Base branch to create worktrees from (default: main)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show execution plan without running agents",
    )
    args = parser.parse_args()

    # Fallback for non-interactive shells where ~/.zshrc is not sourced.
    # This allows users to store API keys in project .env.
    load_env_file(PROJECT_ROOT / ".env")

    # Validate environment
    if not args.dry_run and not os.environ.get("OPENAI_API_KEY"):
        sys.exit(
            "OPENAI_API_KEY is required. Set it in environment or add "
            "OPENAI_API_KEY=... to project .env (or use --dry-run)."
        )

    exit_code = asyncio.run(
        async_main(args.feature, args.base_branch, args.dry_run)
    )
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
