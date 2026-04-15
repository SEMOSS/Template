"""Upload local assets to SEMOSS or sync remote assets to local.

Reads project config from semoss_config/config.json and credentials from
.mcp.json (Claude Code format) or .vscode/mcp.json (Copilot format).

Usage:
    python semoss_asset_sync.py upload portals/index.html
    python semoss_asset_sync.py upload portals/index.html --yes --no-publish
    python semoss_asset_sync.py bulk-upload portals --no-publish
    python semoss_asset_sync.py bulk-upload portals java
    python semoss_asset_sync.py delete portals/assets --yes
    python semoss_asset_sync.py publish
    python semoss_asset_sync.py portals/index.html
    python semoss_asset_sync.py sync-from-remote portals
    python semoss_asset_sync.py sync-from-remote portals --local-dir portals --overwrite
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

try:
    import requests
except ImportError:  # pragma: no cover - fallback when requests is unavailable
    requests = None

from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
CLAUDE_MCP_CONFIG_PATH = WORKSPACE_ROOT / ".mcp.json"
COPILOT_MCP_CONFIG_PATH = WORKSPACE_ROOT / ".vscode" / "mcp.json"
SEMOSS_CONFIG_PATH = WORKSPACE_ROOT / "semoss_config" / "config.json"
DEFAULT_HOST = "https://workshop.cfg.deloitte.com"
DEFAULT_API_MODULE_URL = "/cfg-ai-dev/Monolith"
DEFAULT_WEB_MODULE_URL = "/cfg-ai-dev/SemossWeb"
SERVER_NAME = "Semoss_project_manager"
BACKUP_ROOT = WORKSPACE_ROOT / "temp" / "semoss_backups"

_ENV_VAR_PATTERN = re.compile(r"\$\{env:([^}]+)\}")


def resolve_env_vars(value: str) -> str:
    """Replace ${env:VAR_NAME} references with their environment variable values."""

    def _replacer(match: re.Match) -> str:
        var_name = match.group(1)
        env_value = os.environ.get(var_name)
        if env_value is None:
            raise RuntimeError(
                f"Environment variable '{var_name}' is not set. "
                f"Set it with: export {var_name}=your-value"
            )
        return env_value

    return _ENV_VAR_PATTERN.sub(_replacer, value)


def read_json_config(config_path: Path) -> dict[str, object]:
    if not config_path.exists():
        raise SystemExit(
            f"SEMOSS config was not found at {config_path}. "
            "Create semoss_config/config.json with at least a project_id."
        )

    raw_text = config_path.read_text(encoding="utf-8").strip()
    if not raw_text:
        return {}

    data = json.loads(raw_text)
    if not isinstance(data, dict):
        raise SystemExit(f"SEMOSS config at {config_path} must be a JSON object.")
    return data


def extract_config_value(config: dict[str, object], *keys: str) -> str:
    for key in keys:
        value = config.get(key)
        if value is None:
            continue
        text = str(value).strip()
        if text:
            return text
    return ""


def load_semoss_config(config_path: Path) -> dict[str, str]:
    raw_config = read_json_config(config_path)
    return {
        "project_id": extract_config_value(
            raw_config,
            "project_id",
            "projectId",
            "PROJECT_ID",
            "app_id",
            "appId",
            "APP_ID",
            "Project ID / APP ID",
        ),
        "base_url": extract_config_value(raw_config, "base_url", "baseUrl", "BASE_URL") or DEFAULT_HOST,
        "api_module_url": extract_config_value(
            raw_config,
            "api_module_url",
            "apiModuleUrl",
            "API_MODULE_URL",
            "module",
            "Module",
        )
        or DEFAULT_API_MODULE_URL,
        "web_module_url": extract_config_value(
            raw_config,
            "web_module_url",
            "webModuleUrl",
            "WEB_MODULE_URL",
        )
        or DEFAULT_WEB_MODULE_URL,
        "access_key": extract_config_value(raw_config, "access_key", "accessKey", "ACCESS_KEY"),
        "secret_key": extract_config_value(raw_config, "secret_key", "secretKey", "SECRET_KEY"),
    }


def _extract_bearer_parts_from_server(server: dict) -> tuple[str, str]:
    """Extract access key and secret from a server's args list."""
    args = server.get("args", [])

    header_value = None
    for index, arg in enumerate(args):
        if arg == "--header" and index + 1 < len(args):
            header_value = args[index + 1]

    if not header_value:
        raise RuntimeError(f"No Authorization header found for server '{SERVER_NAME}'.")

    prefix = "Authorization:Bearer"
    if not header_value.startswith(prefix):
        raise RuntimeError("Unexpected Authorization header format in MCP config.")

    bearer_value = header_value[len(prefix):]

    # Resolve ${env:VAR} references (Claude Code MCP syntax)
    if "${env:" in bearer_value:
        bearer_value = resolve_env_vars(bearer_value)

    if "YOUR_ACCESS_KEY" in bearer_value or "<accessKey:secretKey>" in bearer_value:
        raise RuntimeError(
            "Replace the placeholder access key and secret key values in your MCP config "
            f"(.mcp.json or .vscode/mcp.json)."
        )

    access_token, secret = bearer_value.split(":", 1)
    return access_token.strip(), secret.strip()


def load_bearer_parts(claude_config_path: Path, copilot_config_path: Path) -> tuple[str, str]:
    """Load bearer token parts from .mcp.json (Claude Code) or .vscode/mcp.json (Copilot).

    Tries Claude Code format first ("mcpServers" key), then falls back to
    Copilot format ("servers" key).
    """
    # Try Claude Code .mcp.json first
    if claude_config_path.exists():
        config = json.loads(claude_config_path.read_text(encoding="utf-8"))
        servers = config.get("mcpServers", {})
        if SERVER_NAME in servers:
            return _extract_bearer_parts_from_server(servers[SERVER_NAME])

    # Fall back to Copilot .vscode/mcp.json
    if copilot_config_path.exists():
        config = json.loads(copilot_config_path.read_text(encoding="utf-8"))
        servers = config.get("servers", {})
        if SERVER_NAME in servers:
            return _extract_bearer_parts_from_server(servers[SERVER_NAME])

    raise SystemExit(
        f"Could not find MCP server '{SERVER_NAME}' in .mcp.json or .vscode/mcp.json. "
        "Configure at least one of these files with your SEMOSS credentials."
    )


def build_api_endpoint(semoss_config: dict[str, str]) -> str:
    base_url = semoss_config.get("base_url", DEFAULT_HOST).strip().rstrip("/")
    api_module_url = semoss_config.get("api_module_url", DEFAULT_API_MODULE_URL).strip()

    if api_module_url.startswith("http://") or api_module_url.startswith("https://"):
        return f"{api_module_url.rstrip('/')}/api/"

    normalized_module = "/" + api_module_url.strip("/") if api_module_url else ""
    return f"{base_url}{normalized_module}/api/"


def build_server_connection(endpoint: str, access_token: str, secret: str):
    try:
        from ai_server import ServerClient
    except ImportError as exc:
        raise RuntimeError(
            "Unable to import ServerClient from ai_server. "
            "Make sure the SEMOSS Python SDK is installed in this environment."
        ) from exc

    return ServerClient(base=endpoint, access_key=access_token, secret_key=secret)


def normalize_remote_asset_path(remote_path: str) -> str:
    cleaned = remote_path.strip().replace("\\", "/").strip("/")
    if not cleaned:
        raise ValueError("Remote asset path must not be empty.")
    if cleaned == "version/assets":
        return cleaned
    if cleaned.startswith("version/assets/"):
        return cleaned.rstrip("/")
    return f"version/assets/{cleaned}".rstrip("/")


def infer_remote_directory(local_file: Path) -> str:
    relative_path = local_file.relative_to(WORKSPACE_ROOT)
    parent = relative_path.parent.as_posix()
    if not parent or parent == ".":
        return "version/assets"
    return f"version/assets/{parent}"


def infer_remote_file_path(local_file: Path) -> str:
    relative_path = local_file.relative_to(WORKSPACE_ROOT).as_posix()
    return f"version/assets/{relative_path}"


def default_local_path_for_remote(remote_path: str) -> Path:
    normalized = normalize_remote_asset_path(remote_path)
    relative_path = normalized.removeprefix("version/assets/")
    if not relative_path or relative_path == "version/assets":
        return WORKSPACE_ROOT
    return WORKSPACE_ROOT / Path(relative_path)


def pixel_output(response: dict) -> object:
    pixel_return = response.get("pixelReturn", [])
    if not pixel_return:
        raise RuntimeError("SEMOSS pixel response did not contain any return payload.")
    return pixel_return[0].get("output")


def run_project_pixel(server_connection, pixel: str, insight_id: str | None = None) -> object:
    response = server_connection.run_pixel(pixel, insight_id=insight_id, full_response=True)
    return pixel_output(response)


def browse_remote_directory(server_connection, project_id: str, directory_path: str) -> list[dict[str, object]]:
    pixel = f'BrowseAsset(filePath=["{directory_path}"], space=["{project_id}"]);'
    output = run_project_pixel(server_connection, pixel)
    if isinstance(output, list):
        return [item for item in output if isinstance(item, dict)]
    if isinstance(output, dict):
        return [output]
    return []


def get_remote_asset_entry(server_connection, project_id: str, remote_asset_path: str) -> dict[str, object] | None:
    normalized_path = normalize_remote_asset_path(remote_asset_path)
    if normalized_path == "version/assets":
        return {
            "path": normalized_path,
            "name": "assets",
            "type": "directory",
        }

    parent_path, _, asset_name = normalized_path.rpartition("/")
    for item in browse_remote_directory(server_connection, project_id, parent_path):
        if item.get("name") == asset_name:
            return item
    return None


def remote_asset_exists(server_connection, project_id: str, remote_file_path: str) -> bool:
    remote_directory, _, remote_name = remote_file_path.rpartition("/")
    for item in browse_remote_directory(server_connection, project_id, remote_directory):
        if item.get("name") == remote_name:
            return True
    return False


def delete_remote_asset(server_connection, project_id: str, remote_file_path: str) -> object:
    pixel = f'DeleteAsset(filePath=["{remote_file_path}"], space=["{project_id}"]);'
    return run_project_pixel(server_connection, pixel)


def publish_project(server_connection, project_id: str) -> object:
    pixel = f"PublishProject(project='{project_id}', release=true);"
    return run_project_pixel(server_connection, pixel)


def confirm_remote_delete(remote_file_path: str) -> bool:
    response = input(f"Remote asset {remote_file_path} exists. Delete it before upload? [y/N]: ")
    return response.strip().lower() in {"y", "yes"}


def confirm_local_overwrite(local_path: Path) -> bool:
    response = input(f"Local path {local_path} exists. Overwrite it? [y/N]: ")
    return response.strip().lower() in {"y", "yes"}


def build_backup_path(local_file: Path) -> Path:
    relative_path = local_file.relative_to(WORKSPACE_ROOT)
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_directory = BACKUP_ROOT / relative_path.parent
    backup_directory.mkdir(parents=True, exist_ok=True)
    backup_name = f"{relative_path.stem}-{timestamp}{relative_path.suffix}"
    return backup_directory / backup_name


def build_cookie_header(cookies) -> str:
    if cookies is None:
        return ""

    if hasattr(cookies, "get_dict"):
        values = cookies.get_dict()
    elif isinstance(cookies, dict):
        values = cookies
    else:
        try:
            values = {cookie.name: cookie.value for cookie in cookies}
        except Exception:  # pragma: no cover - fallback for unexpected cookie jars
            return ""

    return "; ".join(f"{key}={value}" for key, value in values.items() if value is not None)


def stream_download(download_url: str, cookies, destination_path: Path) -> None:
    if requests is not None:
        response = requests.get(download_url, cookies=cookies, stream=True, timeout=120)
        response.raise_for_status()
        with destination_path.open("wb") as handle:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    handle.write(chunk)
        return

    headers = {}
    cookie_header = build_cookie_header(cookies)
    if cookie_header:
        headers["Cookie"] = cookie_header

    request = Request(download_url, headers=headers)
    try:
        with urlopen(request, timeout=120) as response, destination_path.open("wb") as handle:
            while True:
                chunk = response.read(8192)
                if not chunk:
                    break
                handle.write(chunk)
    except (HTTPError, URLError) as exc:  # pragma: no cover - network failures bubble up
        raise RuntimeError(f"Failed to download asset from {download_url}") from exc


def download_remote_asset(
    server_connection,
    project_id: str,
    remote_file_path: str,
    insight_id: str,
    destination_path: Path,
) -> Path:
    destination_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        downloaded_file = server_connection.download_file(
            file=remote_file_path,
            project_id=project_id,
            insight_id=insight_id,
            custom_filename=str(destination_path),
        )
        return Path(downloaded_file).resolve()
    except Exception as exc:
        if "{project_id}" not in str(exc):
            raise

    download_key = run_project_pixel(
        server_connection,
        f"DownloadAsset(filePath=['{remote_file_path}'], space=['{project_id}']);",
        insight_id=insight_id,
    )
    download_url = (
        f"{server_connection.main_url}/engine/downloadFile"
        f"?insightId={insight_id}&fileKey={download_key}"
    )
    stream_download(download_url, server_connection.cookies, destination_path)

    return destination_path.resolve()


def print_directory_state(label: str, files: list[dict[str, object]]) -> None:
    print(label)
    print(json.dumps(files, indent=2, default=str))


def sync_remote_folder_to_local(
    server_connection,
    project_id: str,
    remote_folder_path: str,
    local_folder_path: Path,
    overwrite: bool = False,
) -> dict[str, list[str]]:
    normalized_remote_path = normalize_remote_asset_path(remote_folder_path)
    remote_entry = get_remote_asset_entry(server_connection, project_id, normalized_remote_path)
    if remote_entry is None:
        raise FileNotFoundError(f"Remote asset not found: {normalized_remote_path}")
    if remote_entry.get("type") != "directory":
        raise NotADirectoryError(f"Remote asset is not a directory: {normalized_remote_path}")

    local_folder_path.mkdir(parents=True, exist_ok=True)
    insight_id = str(server_connection.make_new_insight())
    downloaded: list[str] = []
    skipped: list[str] = []

    for item in browse_remote_directory(server_connection, project_id, normalized_remote_path):
        remote_item_path = str(item.get("path", ""))
        item_name = str(item.get("name", ""))
        item_type = str(item.get("type", ""))
        if not remote_item_path or not item_name:
            continue

        local_item_path = local_folder_path / item_name
        if item_type == "directory":
            nested = sync_remote_folder_to_local(
                server_connection=server_connection,
                project_id=project_id,
                remote_folder_path=remote_item_path,
                local_folder_path=local_item_path,
                overwrite=overwrite,
            )
            downloaded.extend(nested["downloaded"])
            skipped.extend(nested["skipped"])
            continue

        if local_item_path.exists() and not overwrite and not confirm_local_overwrite(local_item_path):
            skipped.append(str(local_item_path))
            continue

        saved_path = download_remote_asset(
            server_connection=server_connection,
            project_id=project_id,
            remote_file_path=remote_item_path,
            insight_id=insight_id,
            destination_path=local_item_path,
        )
        downloaded.append(str(saved_path))

    return {
        "downloaded": downloaded,
        "skipped": skipped,
    }


def collect_files_from_paths(raw_paths: list[str]) -> list[Path]:
    """Resolve a mix of file/directory paths into a deduped, sorted list of files.

    Directories are walked recursively. Hidden files (leading dot) are included
    only if explicitly named, not when discovered via directory walk — this
    keeps stray editor files (.DS_Store, .swp) out of bulk uploads.
    """
    collected: list[Path] = []
    seen: set[Path] = set()

    def _add_file(file_path: Path) -> None:
        if file_path in seen:
            return
        seen.add(file_path)
        collected.append(file_path)

    for raw in raw_paths:
        path = Path(raw).expanduser().resolve()
        if not path.exists():
            raise SystemExit(f"Path not found: {path}")
        if path.is_file():
            _add_file(path)
            continue
        if path.is_dir():
            for child in sorted(path.rglob("*")):
                if not child.is_file():
                    continue
                if any(part.startswith(".") for part in child.relative_to(path).parts):
                    continue
                _add_file(child.resolve())
            continue
        raise SystemExit(f"Path is neither file nor directory: {path}")

    return collected


def list_existing_remote_filenames(
    server_connection,
    project_id: str,
    remote_directory: str,
) -> set[str]:
    """Return the set of file (non-directory) names that already exist in a remote dir."""
    return {
        str(item.get("name", ""))
        for item in browse_remote_directory(server_connection, project_id, remote_directory)
        if item.get("type") != "directory" and item.get("name")
    }


def bulk_upload_to_semoss(
    local_files: list[Path],
    project_id: str,
    server_connection,
    *,
    publish: bool = True,
    delete_existing: bool = True,
) -> int:
    """Upload many files in one process, reusing one ServerClient and insight.

    Differences from upload_local_file_to_semoss:
      - No backups (build artifacts are reproducible; backups are dead weight)
      - No per-file publish — at most one publish call at the very end
      - One BrowseAsset call per unique remote parent directory, not per file
      - Bails without publishing on any failure (avoids inconsistent project state)
    """
    if not local_files:
        print("No files to upload.")
        return 0

    # Preflight: validate every file before touching the network.
    for local_file in local_files:
        if not local_file.exists() or not local_file.is_file():
            raise SystemExit(f"Local file not found: {local_file}")
        if WORKSPACE_ROOT not in local_file.parents:
            raise SystemExit(
                f"Local file must be inside the current workspace: {local_file}"
            )

    insight_id = f"{server_connection.make_new_insight()}"

    # Group files by their inferred remote parent directory so each unique
    # parent dir is browsed at most once instead of once per file.
    files_by_remote_dir: dict[str, list[Path]] = {}
    for local_file in local_files:
        remote_dir = infer_remote_directory(local_file)
        files_by_remote_dir.setdefault(remote_dir, []).append(local_file)

    existing_per_dir: dict[str, set[str]] = {}
    if delete_existing:
        for remote_dir in files_by_remote_dir:
            existing_per_dir[remote_dir] = list_existing_remote_filenames(
                server_connection, project_id, remote_dir
            )

    uploaded: list[str] = []
    deleted: list[str] = []

    print(
        f"Bulk uploading {len(local_files)} file(s) across "
        f"{len(files_by_remote_dir)} remote directory(ies). Insight: {insight_id}"
    )

    try:
        for remote_dir, files in files_by_remote_dir.items():
            existing = existing_per_dir.get(remote_dir, set())
            for local_file in files:
                remote_file_path = infer_remote_file_path(local_file)
                if delete_existing and local_file.name in existing:
                    delete_remote_asset(server_connection, project_id, remote_file_path)
                    deleted.append(remote_file_path)

                server_connection.upload_files(
                    files=[str(local_file)],
                    project_id=project_id,
                    insight_id=insight_id,
                    path=remote_dir,
                )
                uploaded.append(str(local_file))
                print(f"  uploaded: {local_file.relative_to(WORKSPACE_ROOT)}")
    except Exception as exc:
        # Bail without publishing — leaves the project in a partial state on
        # disk but avoids "publishing" a known-broken release. The next deploy
        # attempt will overwrite the half-uploaded files.
        print(
            f"ERROR: Bulk upload failed after {len(uploaded)} upload(s) "
            f"and {len(deleted)} delete(s): {exc}"
        )
        print("Skipping publish — project not republished.")
        return 1

    print(f"Bulk upload complete: {len(uploaded)} uploaded, {len(deleted)} replaced.")

    if publish:
        print("Publishing project...")
        result = publish_project(server_connection, project_id)
        print(json.dumps(result, indent=2, default=str))
    else:
        print("Skipping publish (--no-publish).")
    return 0


COMMAND_NAMES = frozenset(
    {"upload", "bulk-upload", "delete", "publish", "sync-from-remote"}
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Upload local assets to SEMOSS or sync remote assets to local.")
    subparsers = parser.add_subparsers(dest="command")

    upload_parser = subparsers.add_parser("upload", help="Upload a single local file into the linked SEMOSS project.")
    upload_parser.add_argument("file", help="Path to the local file to upload.")
    upload_parser.add_argument(
        "--yes",
        "-y",
        action="store_true",
        help="Skip the overwrite confirmation prompt (non-interactive use).",
    )
    upload_parser.add_argument(
        "--no-publish",
        action="store_true",
        help="Skip the post-upload PublishProject call (useful when chaining multiple uploads).",
    )

    bulk_parser = subparsers.add_parser(
        "bulk-upload",
        help="Upload many files (or a directory tree) in one process. Reuses one connection and publishes once.",
    )
    bulk_parser.add_argument(
        "paths",
        nargs="+",
        help="Files and/or directories to upload. Directories are walked recursively.",
    )
    bulk_parser.add_argument(
        "--no-publish",
        action="store_true",
        help="Skip the final PublishProject call (use when chaining multiple bulk-upload invocations).",
    )
    bulk_parser.add_argument(
        "--no-delete-existing",
        action="store_true",
        help="Skip the browse-and-delete step. Faster on first deploy when no remote files exist yet.",
    )

    delete_parser = subparsers.add_parser("delete", help="Delete a remote asset from the linked SEMOSS project.")
    delete_parser.add_argument("remote_path", help="Remote path relative to project root (e.g., portals/assets/old-file.js).")
    delete_parser.add_argument("--yes", "-y", action="store_true", help="Skip confirmation prompt.")

    subparsers.add_parser(
        "publish",
        help="Publish the linked SEMOSS project without uploading anything (use after chained bulk-upload --no-publish).",
    )

    sync_parser = subparsers.add_parser("sync-from-remote", help="Download a remote SEMOSS asset folder into the local workspace.")
    sync_parser.add_argument("remote_folder", help="Remote folder path, relative to version/assets or as a full version/assets path.")
    sync_parser.add_argument(
        "--local-dir",
        dest="local_dir",
        help="Local destination directory. Defaults to the workspace-relative folder matching the remote path.",
    )
    sync_parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite existing local files without prompting.",
    )
    return parser


def parse_args() -> argparse.Namespace:
    parser = build_parser()
    raw_args = sys.argv[1:]
    if raw_args and raw_args[0] not in COMMAND_NAMES and raw_args[0] not in {"-h", "--help"}:
        raw_args = ["upload", *raw_args]
    if not raw_args:
        parser.print_help()
        raise SystemExit(2)
    return parser.parse_args(raw_args)


def build_semoss_context() -> tuple[dict[str, str], str, object]:
    semoss_config = load_semoss_config(SEMOSS_CONFIG_PATH)

    # Use credentials from config.json if present; otherwise fall back to MCP config files.
    access_token = semoss_config.get("access_key", "")
    secret = semoss_config.get("secret_key", "")
    if not access_token or not secret:
        access_token, secret = load_bearer_parts(CLAUDE_MCP_CONFIG_PATH, COPILOT_MCP_CONFIG_PATH)

    project_id = semoss_config.get("project_id")
    if not project_id:
        raise SystemExit("project_id was not found in semoss_config/config.json.")

    server_connection = build_server_connection(
        endpoint=build_api_endpoint(semoss_config),
        access_token=access_token,
        secret=secret,
    )
    return semoss_config, project_id, server_connection


def upload_local_file_to_semoss(
    local_file: Path,
    project_id: str,
    server_connection,
    *,
    assume_yes: bool = False,
    publish: bool = True,
) -> int:
    if not local_file.exists() or not local_file.is_file():
        raise SystemExit(f"Local file not found: {local_file}")
    if WORKSPACE_ROOT not in local_file.parents and local_file != WORKSPACE_ROOT:
        raise SystemExit("Local file must be inside the current workspace.")

    remote_directory = infer_remote_directory(local_file)
    remote_file_path = infer_remote_file_path(local_file)
    insight_id = server_connection.make_new_insight()

    remote_exists = remote_asset_exists(server_connection, project_id, remote_file_path)
    if remote_exists:
        if not assume_yes and not confirm_remote_delete(remote_file_path):
            raise SystemExit("Upload cancelled because the existing remote asset was not approved for deletion.")

        backup_path = download_remote_asset(
            server_connection=server_connection,
            project_id=project_id,
            remote_file_path=remote_file_path,
            insight_id=f"{insight_id}",
            destination_path=build_backup_path(local_file),
        )
        print(f"Backed up remote asset to {backup_path}")

        delete_result = delete_remote_asset(server_connection, project_id, remote_file_path)
        print(f"Deleted remote asset: {remote_file_path}")
        print(json.dumps(delete_result, indent=2, default=str))

        if publish:
            delete_publish_result = publish_project(server_connection, project_id)
            print("Published project after deletion")
            print(json.dumps(delete_publish_result, indent=2, default=str))

            post_delete_listing = browse_remote_directory(server_connection, project_id, remote_directory)
            print_directory_state("Remote directory after deletion:", post_delete_listing)

    upload_result = server_connection.upload_files(
        files=[str(local_file)],
        project_id=project_id,
        insight_id=f"{insight_id}",
        path=remote_directory,
    )

    print(f"Uploaded {local_file}")
    print(f"Project: {project_id}")
    print(f"Insight: {insight_id}")
    print(f"Remote directory: {remote_directory}")
    print(f"Remote asset: {remote_file_path}")
    print(json.dumps(upload_result, indent=2, default=str))

    if publish:
        publish_result = publish_project(server_connection, project_id)
        final_listing = browse_remote_directory(server_connection, project_id, remote_directory)
        print("Published project after upload")
        print(json.dumps(publish_result, indent=2, default=str))
        print_directory_state("Remote directory after upload:", final_listing)
    else:
        print("Skipping publish (--no-publish).")
    return 0


def sync_semoss_folder_to_local(remote_folder: str, local_dir: str | None, overwrite: bool) -> int:
    _, project_id, server_connection = build_semoss_context()
    normalized_remote_path = normalize_remote_asset_path(remote_folder)
    target_local_dir = Path(local_dir).expanduser().resolve() if local_dir else default_local_path_for_remote(normalized_remote_path)

    result = sync_remote_folder_to_local(
        server_connection=server_connection,
        project_id=project_id,
        remote_folder_path=normalized_remote_path,
        local_folder_path=target_local_dir,
        overwrite=overwrite,
    )

    print(f"Synchronized remote folder: {normalized_remote_path}")
    print(f"Local destination: {target_local_dir}")
    print(json.dumps(result, indent=2))
    return 0


def delete_remote_assets(remote_path: str, skip_confirm: bool) -> int:
    _, project_id, server_connection = build_semoss_context()
    normalized = normalize_remote_asset_path(remote_path)

    entry = get_remote_asset_entry(server_connection, project_id, normalized)
    if entry is None:
        print(f"Remote path not found: {normalized}")
        return 1

    is_directory = entry.get("type") == "directory"

    if is_directory:
        items = browse_remote_directory(server_connection, project_id, normalized)
        files_to_delete = []
        for item in items:
            if item.get("type") == "directory":
                sub_items = browse_remote_directory(server_connection, project_id, item["path"])
                files_to_delete.extend(sub_item["path"] for sub_item in sub_items if sub_item.get("type") != "directory")
            else:
                files_to_delete.append(item["path"])

        if not files_to_delete:
            print(f"No files found in {normalized}")
            return 0

        print(f"Files to delete ({len(files_to_delete)}):")
        for f in files_to_delete:
            print(f"  {f}")

        if not skip_confirm:
            response = input(f"\nDelete all {len(files_to_delete)} files? [y/N]: ")
            if response.strip().lower() not in {"y", "yes"}:
                print("Cancelled.")
                return 0
    else:
        files_to_delete = [normalized]
        if not skip_confirm:
            response = input(f"Delete remote asset {normalized}? [y/N]: ")
            if response.strip().lower() not in {"y", "yes"}:
                print("Cancelled.")
                return 0

    for f in files_to_delete:
        try:
            result = delete_remote_asset(server_connection, project_id, f)
            print(f"Deleted: {f} -> {result}")
        except Exception as e:
            print(f"Failed to delete {f}: {e}")

    publish_result = publish_project(server_connection, project_id)
    print(f"\nPublished project after deletion")
    print(json.dumps(publish_result, indent=2, default=str))

    parent_path = normalized.rpartition("/")[0] or "version/assets"
    final_listing = browse_remote_directory(server_connection, project_id, parent_path)
    print_directory_state("Remote directory after deletion:", final_listing)
    return 0


def bulk_upload_command(
    raw_paths: list[str],
    *,
    no_publish: bool,
    no_delete_existing: bool,
) -> int:
    files = collect_files_from_paths(raw_paths)
    if not files:
        print("No files matched the provided paths.")
        return 0

    _, project_id, server_connection = build_semoss_context()
    return bulk_upload_to_semoss(
        local_files=files,
        project_id=project_id,
        server_connection=server_connection,
        publish=not no_publish,
        delete_existing=not no_delete_existing,
    )


def publish_command() -> int:
    _, project_id, server_connection = build_semoss_context()
    print(f"Publishing project {project_id}...")
    result = publish_project(server_connection, project_id)
    print(json.dumps(result, indent=2, default=str))
    return 0


def main() -> int:
    args = parse_args()

    if args.command == "sync-from-remote":
        return sync_semoss_folder_to_local(args.remote_folder, args.local_dir, args.overwrite)

    if args.command == "delete":
        return delete_remote_assets(args.remote_path, args.yes)

    if args.command == "bulk-upload":
        return bulk_upload_command(
            args.paths,
            no_publish=args.no_publish,
            no_delete_existing=args.no_delete_existing,
        )

    if args.command == "publish":
        return publish_command()

    _, project_id, server_connection = build_semoss_context()
    local_file = Path(args.file).expanduser().resolve()
    return upload_local_file_to_semoss(
        local_file,
        project_id,
        server_connection,
        assume_yes=args.yes,
        publish=not args.no_publish,
    )


if __name__ == "__main__":
    raise SystemExit(main())
