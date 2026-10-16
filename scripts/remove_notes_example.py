"""Remove the bundled Notes example from an app copy without touching database data."""

from __future__ import annotations

import argparse
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

EXAMPLE_FILES = (
    "client/src/components/NotesPage/NoteForm.tsx",
    "client/src/components/NotesPage/NotesTable.tsx",
    "client/src/hooks/useSaveNote.ts",
    "client/src/pages/AddNotePage.tsx",
    "client/src/pages/NoteDetailPage.tsx",
    "client/src/pages/NotesPage.tsx",
    "client/src/types/note.types.ts",
    "java/src/database/notes/NoteRepository.java",
    "java/src/reactors/notes/AddNoteReactor.java",
    "java/src/reactors/notes/DeleteNoteReactor.java",
    "java/src/reactors/notes/GetNoteReactor.java",
    "java/src/reactors/notes/GetNotesReactor.java",
    "java/src/reactors/notes/UpdateNoteReactor.java",
    "java/src/service/notes/NoteService.java",
    "sql/init.sql",
)


def replace_once(text: str, old: str, new: str, path: str) -> str:
    if text.count(old) != 1:
        raise ValueError(f"Expected exactly one template section in {path}: {old[:70]!r}")
    return text.replace(old, new, 1)


def remove_section(text: str, start: str, end: str, path: str, keep_end: bool = False) -> str:
    if text.count(start) != 1 or end not in text.split(start, 1)[1]:
        raise ValueError(f"Expected one marked section in {path}")
    before, rest = text.split(start, 1)
    _, after = rest.split(end, 1)
    return before + (end if keep_end else "") + after


def plan_edits(root: Path) -> dict[Path, str]:
    edits: dict[Path, str] = {}

    def edit(path: str, transform) -> None:
        file = root / path
        original = file.read_text()
        try:
            updated = transform(original)
        except ValueError:
            # A user may restore only the Notes source from Git after previously
            # removing the example. The shared guidance is already streamlined.
            if path in {
                "AGENTS.md", "ONBOARDING.md", "README.md", "java/README.md",
                "sql/README.md", "java/src/reactors/base/AbstractProjectReactor.java",
                ".agents/skills/semoss-add-reactor/SKILL.md",
                ".agents/skills/semoss-add-page/SKILL.md",
                ".agents/skills/semoss-app-users/SKILL.md",
            }:
                return
            raise
        if updated == original:
            raise ValueError(f"No example content found in {path}")
        edits[file] = updated

    def home(text: str) -> str:
        path = "client/src/pages/HomePage.tsx"
        for old in (
            'import { Link } from "react-router-dom";\n',
            'import { Button } from "@/components/ui/button";\n',
            'import { ROUTE_PATH_NOTES } from "@/routes.constants";\n',
            '\t\t<Button asChild variant="outline" size="sm">\n\t\t\t<Link to={`/${ROUTE_PATH_NOTES}`}>See the notes example</Link>\n\t\t</Button>\n',
        ):
            text = replace_once(text, old, "", path)
        return replace_once(
            text,
            "This is the starting point for your app. Replace this page, then\n\t\t\t\tdelete the notes example once you no longer need it.",
            "This is the starting point for your app. Replace this page with your own content.",
            path,
        )

    edit("client/src/pages/HomePage.tsx", home)

    def nav(text: str) -> str:
        path = "client/src/components/base/nav-items.ts"
        text = replace_once(text, 'import { House, StickyNote } from "lucide-react";', 'import { House } from "lucide-react";', path)
        text = replace_once(text, 'import { ROUTE_PATH_NOTES } from "@/routes.constants";\n', "", path)
        return replace_once(
            text,
            '\t{\n\t\tlabel: "Examples",\n\t\titems: [\n\t\t\t{\n\t\t\t\ttitle: "Notes",\n\t\t\t\tpath: `/${ROUTE_PATH_NOTES}`,\n\t\t\t\ticon: StickyNote,\n\t\t\t},\n\t\t],\n\t},\n',
            "",
            path,
        )

    edit("client/src/components/base/nav-items.ts", nav)

    def router(text: str) -> str:
        path = "client/src/pages/Router.tsx"
        start = "\t\t\t\t\t\t\t// NOTES_EXAMPLE_START\n"
        end = "\t\t\t\t\t\t\t// NOTES_EXAMPLE_END\n"
        if text.count(start) != 1 or text.count(end) != 1:
            raise ValueError("Notes route markers changed; review Router.tsx manually")
        block = text.split(start, 1)[1].split(end, 1)[0]
        if hashlib.sha256(block.encode()).hexdigest() != "b103ca705b4d640a964119fafcb6c5b4dbc764503590c7565c4410d47537e6de":
            raise ValueError("Notes route group has changed; review it before removal")
        text = replace_once(
            text,
            'import {\n\tROUTE_PATH_ADD_NOTE,\n\tROUTE_PATH_LOGIN_PAGE,\n\tROUTE_PATH_NOTES,\n} from "@/routes.constants";',
            'import { ROUTE_PATH_LOGIN_PAGE } from "@/routes.constants";',
            path,
        )
        for name in ("AddNotePage", "NoteDetailPage", "NotesPage"):
            text = replace_once(text, f'import {{ {name} }} from "./{name}";\n', "", path)
        return remove_section(text, start, end, path)

    edit("client/src/pages/Router.tsx", router)

    def routes(text: str) -> str:
        path = "client/src/routes.constants.ts"
        return replace_once(text, 'export const ROUTE_PATH_NOTES = "notes";\nexport const ROUTE_PATH_ADD_NOTE = "add";\n', "", path)

    edit("client/src/routes.constants.ts", routes)
    edit("client/src/hooks/index.ts", lambda text: replace_once(text, 'export * from "./useSaveNote";\n', "", "client/src/hooks/index.ts"))
    edit(
        "java/src/reactors/base/AbstractProjectReactor.java",
        lambda text: replace_once(text, "// See reactors/notes/GetNotesReactor.java for a working example.\n", "", "java/src/reactors/base/AbstractProjectReactor.java"),
    )

    def agents(text: str) -> str:
        path = "AGENTS.md"
        if "> **It is a template, so it ships with a worked example.**" not in text:
            return remove_section(
                text, "## First app-building conversation\n",
                "## What this is — and who you're talking to\n", path, True,
            )
        text = remove_section(text, "> **It is a template, so it ships with a worked example.**", "---\n\n", path, True)
        text = remove_section(text, "## First app-building conversation\n", "## What this is — and who you're talking to\n", path, True)
        text = replace_once(text, "The frontend sends one as a string, e.g. `` `GetNote(noteId=${JSON.stringify(id)});` ``.", "The frontend sends one as a string, using `JSON.stringify` for values.", path)
        text = replace_once(text, "The Java class `GetNoteReactor` is\n  invoked by the Pixel `GetNote(...)`.", "A Java class ending in `Reactor` is invoked by its Pixel name.", path)
        lines = text.splitlines(keepends=True)
        lines = [line for line in lines if not (line.startswith("| A paged, sortable") or line.startswith("| A read-one") or line.startswith("| A create/edit") or line.startswith("| Delete action") or line.startswith("| A detail/add") or line.startswith("| A one-shot read"))]
        text = "".join(lines)
        text = replace_once(text, "| `sql/` | Optional example: `init.sql` (schema + seed data) and `compose.yaml` (local Postgres). Keep, change, or delete it; the app only needs a database engine on the platform. |", "| `sql/` | Optional local Postgres Compose file; manage your own schema as needed. |", path)
        text = replace_once(text, "The example keeps schema and seed data in `sql/init.sql` (running it\n**drops and recreates every table**).", "Create and register the schema your app needs.", path)
        text = replace_once(text, "an `errorMessage` prop for form submits (`useSaveNote`);", "an `errorMessage` prop for form submits;", path)
        text = remove_section(text, "## Deleting the example\n", "## Skills\n", path, True)
        return text

    edit("AGENTS.md", agents)

    def onboarding(text: str) -> str:
        path = "ONBOARDING.md"
        text = replace_once(text, "Before setup, ask whether they want to keep the Notes example as a reference or remove it. If they choose remove, run `pnpm remove:notes-example` from the app root and continue with the streamlined instructions it leaves behind. Do not ask again if they have already answered.\n\n", "", path)
        return remove_section(text, "## 5. Set up a database (skip if the app has none)\n", "## 6. Deploy for the first time\n", path, True).replace(
            "## 6. Deploy for the first time\n",
            "## 5. Connect a database if your app needs one\n\nConnect the user's database in SEMOSS and put its ID in `semoss_config/environments.json`. Create and register only the schema the app needs. An app with no database can leave `database_id` empty.\n\n## 6. Deploy for the first time\n",
            1,
        )

    edit("ONBOARDING.md", onboarding)

    def readme(text: str) -> str:
        path = "README.md"
        text = replace_once(text, "| `sql/` | `init.sql` (schema + seed) and `compose.yaml` (local Postgres) |", "| `sql/` | Optional `compose.yaml` for local Postgres |", path)
        return replace_once(text, "The *notes* feature is a worked example of every pattern; copy it, then delete it (see\n[AGENTS.md](AGENTS.md#deleting-the-example)) with `pnpm remove:notes-example`.\n\n", "", path)

    edit("README.md", readme)

    def java_readme(text: str) -> str:
        path = "java/README.md"
        return remove_section(text, "The layering is `reactor → service → repository`. The notes feature is the worked example:\n", "you no longer need it.\n", path) + "The layering is `reactor → service → repository`. Add feature-specific classes under the matching folders.\n"

    edit("java/README.md", java_readme)

    def sql_readme(text: str) -> str:
        path = "sql/README.md"
        if "In this example, `init.sql`" not in text:
            raise ValueError("Expected example schema instructions in sql/README.md")
        return "# Database\n\nThis folder contains an optional local Postgres Compose file. Connect a database to SEMOSS and set its ID in `semoss_config/environments.json` if your app needs one. Create and register your own schema before querying it.\n\nRun `docker compose -f sql/compose.yaml up -d` for a local Postgres instance. No database or table is dropped by the example removal command.\n"

    edit("sql/README.md", sql_readme)

    def add_reactor_skill(text: str) -> str:
        path = ".agents/skills/semoss-add-reactor/SKILL.md"
        text = replace_once(text, "dates, schema changes in sql/init.sql, and compiling", "dates, schema changes, and compiling", path)
        text = remove_section(text, "**Copy the closest existing feature first**", "## Steps\n", path, True)
        text = replace_once(text, "Change it however your project manages its database; in the example\n   that's `sql/init.sql` (it drops and recreates every table, so\n   rerunning wipes data; tell the user).", "Apply the schema change using the app's database workflow.", path)
        text = replace_once(text, "The Pixel is the reactor name without `Reactor`: `GetNote(noteId=${JSON.stringify(id)});`.", "The Pixel is the reactor name without `Reactor`; encode string arguments with `JSON.stringify`.", path)
        text = replace_once(text, 'the reactor isn\'t found ("Cannot find reactor for keyword = GetNotes"):\n   `SetContext("<app id>");` then `GetNotes(limit=10, offset=0);`.', 'the reactor is not found: call `SetContext("<app id>");` before its Pixel command.', path)
        return replace_once(text, 'send `{id: "noteId", value: [noteId]}`.', 'send a list value for the ID field.', path)

    edit(".agents/skills/semoss-add-reactor/SKILL.md", add_reactor_skill)

    def add_page_skill(text: str) -> str:
        path = ".agents/skills/semoss-add-page/SKILL.md"
        text = remove_section(text, "**Copy the closest existing page first**", "## Steps\n", path, True)
        return replace_once(text, "(`useAddNote` pattern)", "(the form's save hook)", path)

    edit(".agents/skills/semoss-add-page/SKILL.md", add_page_skill)

    def app_users_skill(text: str) -> str:
        path = ".agents/skills/semoss-app-users/SKILL.md"
        text = replace_once(text, "| `app_user.sql` | `sql/init.sql` (then rerun it and **Update schema**) |", "| `app_user.sql` | Your app's schema script (then **Update schema**) |", path)
        text = replace_once(text, "Rerun `init.sql`, then", "Apply the schema change, then", path)
        text = replace_once(text, "copy the notes list/add pattern for an `app_user` management page", "build an `app_user` management page", path)
        return replace_once(text, "Seed data in `init.sql` is committed", "Seed data in committed SQL files is committed", path)

    edit(".agents/skills/semoss-app-users/SKILL.md", app_users_skill)

    return edits


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="Show planned source changes without applying them")
    parser.add_argument("--root", type=Path, default=ROOT, help=argparse.SUPPRESS)
    args = parser.parse_args()
    root = args.root.resolve()

    if not (root / EXAMPLE_FILES[0]).exists():
        print("Notes example is already removed; nothing to do.")
        return

    missing = [path for path in EXAMPLE_FILES if not (root / path).is_file()]
    if missing:
        raise SystemExit("Expected example files are missing; review manually:\n" + "\n".join(missing))
    for directory in ("client/src/components/NotesPage", "java/src/database/notes", "java/src/reactors/notes", "java/src/service/notes"):
        extra = [p for p in (root / directory).iterdir() if p.is_file() and str(p.relative_to(root)) not in EXAMPLE_FILES]
        if extra:
            raise SystemExit("Example directory has additional files; review manually:\n" + "\n".join(map(str, extra)))

    try:
        edits = plan_edits(root)
    except (OSError, ValueError) as error:
        raise SystemExit(f"No files changed. {error}") from error

    print(f"Remove {len(EXAMPLE_FILES)} example files and update {len(edits)} shared files.")
    if args.dry_run:
        for path in EXAMPLE_FILES:
            print("DELETE", path)
        for path in edits:
            print("UPDATE", path.relative_to(root))
        return

    for path, content in edits.items():
        path.write_text(content)
    for relative in EXAMPLE_FILES:
        (root / relative).unlink()
    for directory in ("client/src/components/NotesPage", "java/src/database/notes", "java/src/reactors/notes", "java/src/service/notes"):
        (root / directory).rmdir()
    print("Notes source removed. Database tables and data were not changed. Build and publish the app to update the live UI.")


if __name__ == "__main__":
    main()
