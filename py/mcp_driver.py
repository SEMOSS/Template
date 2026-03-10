import json
import os
import re
import traceback
from datetime import datetime
from html import escape
from pathlib import Path
from typing import Dict, List, Tuple

try:
    from smssutil import mcp_metadata
except Exception:
    def mcp_metadata(_metadata):
        def decorator(func):
            return func

        return decorator


def _extract_key_values(lines: List[str]) -> Tuple[Dict[str, str], List[str]]:
    key_values: Dict[str, str] = {}
    remaining: List[str] = []

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue

        if ":" in line:
            key, value = line.split(":", 1)
            normalized_key = key.strip().lower()
            normalized_value = value.strip()
            if normalized_key and normalized_value:
                key_values[normalized_key] = normalized_value
                continue

        remaining.append(line)

    return key_values, remaining


def _split_sentences(text: str) -> List[str]:
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    return [sentence.strip() for sentence in sentences if sentence.strip()]


def _build_infographic_html(event_details: str) -> str:
    raw_lines = event_details.splitlines()
    key_values, non_key_lines = _extract_key_values(raw_lines)

    combined_text = " ".join(non_key_lines).strip()
    sentence_pool = _split_sentences(combined_text)

    title = (
        key_values.get("event")
        or key_values.get("title")
        or key_values.get("name")
        or (sentence_pool[0][:90] if sentence_pool else "Special Event")
    )

    date_text = key_values.get("date") or key_values.get("when") or "To be announced"
    location_text = (
        key_values.get("location") or key_values.get("where") or "Location pending"
    )
    audience_text = (
        key_values.get("audience") or key_values.get("for") or "General audience"
    )

    highlights_seed = []
    for key in ["highlights", "agenda", "details", "activities", "summary"]:
        if key in key_values:
            highlights_seed.extend(re.split(r"[;|•\-]\s*", key_values[key]))

    highlights = [item.strip() for item in highlights_seed if item.strip()]
    if not highlights:
        highlights = sentence_pool[1:5] if len(sentence_pool) > 1 else non_key_lines[:4]
    if not highlights:
        highlights = ["Event details will be finalized soon."]

    timeline = sentence_pool[:4] if sentence_pool else non_key_lines[:4]
    if not timeline:
        timeline = ["Kickoff", "Main activities", "Closing and next steps"]

    escaped_title = escape(title)
    escaped_date = escape(date_text)
    escaped_location = escape(location_text)
    escaped_audience = escape(audience_text)

    highlights_html = "".join(
        f"<li><span>{escape(item)}</span></li>" for item in highlights[:6]
    )
    timeline_html = "".join(
        f"<li><div class='dot'></div><p>{escape(item)}</p></li>" for item in timeline[:6]
    )

    return f"""<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <title>{escaped_title} - Infographic</title>
  <style>
    :root {{
      --bg: #0f172a;
      --card: #111827;
      --text: #e5e7eb;
      --muted: #93a3b8;
      --accent: #38bdf8;
      --accent-2: #a78bfa;
      --border: #1f2937;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      font-family: Inter, Segoe UI, Arial, sans-serif;
      background: radial-gradient(circle at top right, #1d4ed8 0%, #0f172a 40%, #020617 100%);
      color: var(--text);
      min-height: 100vh;
      padding: 32px;
    }}
    .container {{
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      gap: 20px;
    }}
    .hero {{
      border: 1px solid rgba(148, 163, 184, 0.25);
      background: linear-gradient(120deg, rgba(56, 189, 248, 0.14), rgba(167, 139, 250, 0.18));
      border-radius: 20px;
      padding: 28px;
      backdrop-filter: blur(4px);
    }}
    h1 {{ margin: 0 0 12px 0; font-size: clamp(28px, 4vw, 44px); line-height: 1.1; }}
    .meta {{ display: flex; flex-wrap: wrap; gap: 12px; margin-top: 10px; }}
    .chip {{
      border: 1px solid rgba(148, 163, 184, 0.35);
      background: rgba(2, 6, 23, 0.4);
      border-radius: 999px;
      padding: 8px 12px;
      font-size: 13px;
      color: #dbeafe;
    }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }}
    .card {{
      background: rgba(2, 6, 23, 0.75);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
    }}
    .card h2 {{ margin: 0 0 14px 0; font-size: 20px; color: #c4b5fd; }}
    ul {{ margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; }}
    .highlights li {{
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(56, 189, 248, 0.22);
      border-radius: 12px;
      padding: 10px 12px;
    }}
    .timeline li {{ display: flex; gap: 10px; align-items: flex-start; }}
    .dot {{
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-top: 7px;
      background: linear-gradient(120deg, var(--accent), var(--accent-2));
      box-shadow: 0 0 14px rgba(56, 189, 248, 0.8);
      flex: 0 0 auto;
    }}
    .timeline p {{ margin: 0; color: #d1d5db; line-height: 1.45; }}
    .footer {{ color: var(--muted); font-size: 12px; text-align: right; }}
  </style>
</head>
<body>
  <main class=\"container\">
    <section class=\"hero\">
      <h1>{escaped_title}</h1>
      <div class=\"meta\">
        <div class=\"chip\">Date: {escaped_date}</div>
        <div class=\"chip\">Location: {escaped_location}</div>
        <div class=\"chip\">Audience: {escaped_audience}</div>
      </div>
    </section>

    <section class=\"grid\">
      <article class=\"card\">
        <h2>Event Highlights</h2>
        <ul class=\"highlights\">{highlights_html}</ul>
      </article>

      <article class=\"card\">
        <h2>Experience Flow</h2>
        <ul class=\"timeline\">{timeline_html}</ul>
      </article>
    </section>

    <p class=\"footer\">Generated on {escape(datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC'))}</p>
  </main>
</body>
</html>
"""


@mcp_metadata(
    {
        "loadingMessage": "Generating your event infographic...",
        "resourceURI": "/#/",
        "execution": "ask",
        "displayLocation": "inline",
    }
)
def generate_event_infographic(event_details: str) -> str:
    """
    Generate a styled HTML infographic from a special event description.

    Args:
        event_details: Free-form text describing the event and its details.

    Returns:
        JSON string with generation status, saved file info, and generated HTML.
    """
    try:
        safe_root = Path(globals().get("ROOT", os.getcwd()))
        safe_root.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        file_name = f"event_infographic_{timestamp}.html"
        file_path = safe_root / file_name

        html_content = _build_infographic_html(event_details)

        with open(file_path, "w", encoding="utf-8") as output_file:
            output_file.write(html_content)

        return json.dumps(
            {
                "success": True,
                "message": "Infographic generated and saved successfully.",
                "input": event_details,
                "fileName": file_name,
                "filePath": str(file_path),
                "html": html_content,
            }
        )
    except Exception as exception:
        return json.dumps(
            {
                "success": False,
                "error": str(exception),
                "traceback": traceback.format_exc(),
            }
        )
