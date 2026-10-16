"""Rename this template into a specific app. Run once, right after creating the app.

Usage:
    python3 scripts/init_app.py "Inventory Tracker"

Rewrites the places that carry the template's generic name:
  - pom.xml                           groupId / artifactId  -> InventoryTracker
  - client/src/app.config.ts          APP_NAME              -> Inventory Tracker (top bar)
  - client/src/index.html             <title>               -> Inventory Tracker (browser tab)
  - client/src/hooks/useLocalStorageState.ts  storage prefix -> inventory-tracker-storage-
  - sql/compose.yaml, sql/README.md   database name `app`   -> inventory_tracker

It does not touch the docs (AGENTS.md, README.md); update those for the app by hand. Safe to
rerun with the same name.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_in(path: str, pattern: str, replacement: str, *, count: int = 1) -> None:
    """Apply one substitution. Returns silently on a no-op so the summary stays per-file."""
    file_path = ROOT / path
    if not file_path.exists():
        missing.add(path)
        return
    text = file_path.read_text(encoding="utf-8")
    new_text, n = re.subn(pattern, replacement, text, count=count)
    if n == 0:
        return
    file_path.write_text(new_text, encoding="utf-8")
    updated.add(path)


updated: set[str] = set()
missing: set[str] = set()


def main() -> int:
    if len(sys.argv) != 2 or not sys.argv[1].strip():
        print('Usage: python3 scripts/init_app.py "App Name"')
        return 2

    name = " ".join(sys.argv[1].split())
    words = re.findall(r"[A-Za-z0-9]+", name)
    if not words:
        print("The app name needs at least one letter or digit.")
        return 2
    pascal = "".join(word[:1].upper() + word[1:] for word in words)
    kebab = "-".join(word.lower() for word in words)
    snake = "_".join(word.lower() for word in words)
    if pascal[0].isdigit():
        print("The app name can't start with a digit (it becomes a Maven artifact id).")
        return 2

    print(f"Renaming the template to '{name}' ({pascal}, {kebab}, {snake}):")
    replace_in("pom.xml", r"<groupId>[^<]*</groupId>", f"<groupId>{pascal}</groupId>")
    replace_in("pom.xml", r"<artifactId>[^<]*</artifactId>", f"<artifactId>{pascal}</artifactId>")
    replace_in("client/src/app.config.ts", r'APP_NAME = "[^"]*"', f'APP_NAME = "{name}"')
    replace_in("client/src/index.html", r"<title>[^<]*</title>", f"<title>{name}</title>")
    replace_in(
        "client/src/hooks/useLocalStorageState.ts",
        r'STORAGE_PREFIX = "[^"]*"',
        f'STORAGE_PREFIX = "{kebab}-storage-"',
    )
    replace_in("sql/compose.yaml", r"POSTGRES_DB: \S+", f"POSTGRES_DB: {snake}")
    replace_in("sql/README.md", r"(Database `)app(`)", rf"\g<1>{snake}\g<2>")
    replace_in("sql/README.md", r"catalog name `app`", f"catalog name `{snake}`")
    replace_in("sql/README.md", r"-d app -f", f"-d {snake} -f")
    for path in sorted(updated):
        print(f"  updated: {path}")
    for path in sorted(missing - updated):
        print(f"  skipped (missing): {path}")
    if not updated:
        print("  nothing changed (already renamed?)")
    print(
        "\nNext: create the app on the platform and put its id in semoss_config/environments.json\n"
        "(see the semoss-deploy skill), then update AGENTS.md and README.md for this app."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
