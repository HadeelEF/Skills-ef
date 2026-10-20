#!/usr/bin/env python3
"""Read-only, limited Markdown identifier and local-link checks; not semantic QA."""
import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path
from urllib.parse import unquote, urlsplit

DEFAULT_ID = r"[A-Z][A-Z0-9]*-(?:[A-Z0-9]+-)*[0-9]+"
LINK = re.compile(r"\[[^\]\n]*\]\((<[^>\n]+>|[^\s()]+)(?:\s+[\"'][^\n]*?[\"'])?\)")
ANCHOR = re.compile(r"<(?:a|span)\b[^>]*\bid=[\"']([^\"']+)[\"'][^>]*>", re.I)
SKIP_DIRS = {".git", "node_modules", ".venv", "__pycache__"}


def visible_lines(content):
    fence = None
    comment = False
    for number, line in enumerate(content.splitlines(), 1):
        marker = re.match(r"^\s{0,3}(`{3,}|~{3,})", line)
        if marker:
            token = marker.group(1)
            if fence is None:
                fence = token
            elif token[0] == fence[0] and len(token) >= len(fence):
                fence = None
            continue
        if fence:
            continue
        cleaned = ""
        while line:
            if comment:
                end = line.find("-->")
                if end < 0:
                    line = ""
                else:
                    line, comment = line[end + 3:], False
            else:
                start = line.find("<!--")
                if start < 0:
                    cleaned += line
                    line = ""
                else:
                    cleaned += line[:start]
                    line, comment = line[start + 4:], True
        yield number, re.sub(r"`+[^`]*`+", "", cleaned)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="+", help="Markdown files or directories (recursive)")
    parser.add_argument("--id-pattern", default=DEFAULT_ID,
                        help="ID regex for definitions at the start of Markdown headings")
    parser.add_argument("--strict-anchors", action="store_true",
                        help="Require every local fragment to match an explicit a/span HTML id")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable results")
    args = parser.parse_args()
    try:
        identifier = re.compile(r"^\s{0,3}#{1,6}\s+(" + args.id_pattern + r")(?=$|[\s:—–])")
    except re.error as error:
        parser.error(str(error))
    errors, warnings, definitions, files = [], [], defaultdict(list), set()
    for raw in args.paths:
        path = Path(raw).resolve()
        if not path.exists():
            errors.append({"type": "missing_input", "path": str(path)})
            continue
        candidates = path.rglob("*.md") if path.is_dir() else [path]
        for candidate in candidates:
            if candidate.is_file() and not SKIP_DIRS.intersection(candidate.parts):
                files.add(candidate.resolve())
    checked_links = explicit_anchors = external_links = 0
    cache = {}

    def read(path):
        if path not in cache:
            cache[path] = path.read_text(encoding="utf-8")
        return cache[path]

    for path in sorted(files):
        try:
            content = read(path)
        except (OSError, UnicodeError) as error:
            errors.append({"type": "unreadable", "path": str(path), "reason": str(error)})
            continue
        for line_number, line in visible_lines(content):
            location = f"{path}:{line_number}"
            match = identifier.match(line)
            if match:
                definitions[match.group(1)].append(location)
            for link in LINK.finditer(line):
                raw = link.group(1).strip("<>")
                target = urlsplit(raw)
                if target.scheme or target.netloc:
                    external_links += 1
                    continue
                if "{{" in raw or "}}" in raw:
                    warnings.append({"type": "template_link_unchecked", "at": location})
                    continue
                destination = (path.parent / unquote(target.path)).resolve() if target.path else path
                checked_links += 1
                if not destination.exists():
                    errors.append({"type": "broken_local_link", "at": location, "target": raw})
                    continue
                if target.fragment:
                    try:
                        text = "\n".join(line for _, line in visible_lines(read(destination)))
                        anchors = set(ANCHOR.findall(text))
                    except (OSError, UnicodeError):
                        anchors = set()
                    if unquote(target.fragment) in anchors:
                        explicit_anchors += 1
                    else:
                        item = {"type": "fragment_without_explicit_anchor", "at": location,
                                "target": raw, "note": "Generated heading anchors are not checked"}
                        (errors if args.strict_anchors else warnings).append(item)
    for name, locations in sorted(definitions.items()):
        if len(locations) > 1:
            errors.append({"type": "duplicate_definition", "id": name, "locations": locations})
    if not definitions:
        warnings.append({"type": "no_identifier_definitions",
                         "note": "No coverage claim: adapt the pattern or inspect the document format"})
    result = {"files_scanned": len(files), "identifier_definitions": sum(map(len, definitions.values())),
              "local_links_checked": checked_links, "explicit_anchors_checked": explicit_anchors,
              "external_links_skipped": external_links, "errors": errors, "warnings": warnings,
              "limits": "Heading-start definitions and simple inline Markdown links only. "
                        "No external URL, reference-style link, generic HTML link, generated heading "
                        "anchor, requirement coverage, approval, or semantic-quality validation."}
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"Files: {len(files)}; definitions: {result['identifier_definitions']}; "
              f"local links: {checked_links}; errors: {len(errors)}; warnings: {len(warnings)}")
        for kind, items in (("ERROR", errors), ("WARNING", warnings)):
            for item in items:
                print(kind + " " + json.dumps(item, ensure_ascii=False))
        print("LIMITS: " + result["limits"])
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
