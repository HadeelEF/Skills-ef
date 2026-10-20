#!/usr/bin/env python3
"""Read-only structural checks; does not score architecture or execute fixtures."""

import json
import re
import sys
from pathlib import Path


def check_cases(scenarios, review):
    errors = []
    cases = scenarios.get("cases", [])
    criteria = review.get("cases", [])
    ids = [c.get("id") for c in cases]
    review_ids = [c.get("id") for c in criteria]
    if not cases or None in ids or len(ids) != len(set(ids)):
        errors.append("Scenario IDs must be present, unique and nonempty.")
    if set(ids) != set(review_ids) or len(review_ids) != len(set(review_ids)):
        errors.append("Reviewer criteria must match scenario IDs exactly.")
    for case in cases:
        if not all(case.get(k) for k in ("id", "title", "domains", "prompt")):
            errors.append(f"Incomplete scenario: {case.get('id')}")
    for case in criteria:
        if not case.get("criteria") or not all(isinstance(c, str) and c.strip() for c in case["criteria"]):
            errors.append(f"Missing reviewer criteria: {case.get('id')}")
    if not review.get("critical_failures") or not review.get("passing_rule"):
        errors.append("Review requires critical failures and a passing rule.")
    return errors


def inspect(root):
    errors, links = [], 0
    main = root / "SKILL.md"
    if not main.is_file():
        return ["SKILL.md is absent."], {}
    content = main.read_text(encoding="utf-8")
    if not re.search(r"(?m)^name: ef-solution-architect$", content):
        errors.append("Skill identity does not match ef-solution-architect.")
    if len(content.splitlines()) >= 500:
        errors.append("SKILL.md must stay below 500 lines.")
    for file in sorted(root.rglob("*.md")):
        text = file.read_text(encoding="utf-8")
        if file.parent.name == "references" and len(text.splitlines()) > 100 and "\n## Contents\n" not in text:
            errors.append(f"Long reference lacks Contents: {file.relative_to(root)}")
        for target in re.findall(r"\]\(([^)]+)\)", text):
            if target.startswith(("https://", "http://", "#", "mailto:")):
                continue
            links += 1
            local = target.split("#", 1)[0]
            if not (file.parent / local).exists():
                errors.append(f"Broken local link: {file.relative_to(root)} -> {target}")
    for file in sorted((root / "references").glob("worked-*.md")):
        if "ILLUSTRATIVE EXAMPLE" not in file.read_text(encoding="utf-8"):
            errors.append(f"Example lacks explicit fictional status: {file.name}")
    for file in (root / "references").glob("*.md"):
        if f"references/{file.name}" not in content:
            errors.append(f"Reference not routed from SKILL.md: {file.name}")
    for file in (root / "assets/templates").glob("*.md"):
        if f"assets/templates/{file.name}" not in content:
            errors.append(f"Template not routed from SKILL.md: {file.name}")
    try:
        scenarios = json.loads((root / "assets/evaluation/scenarios.json").read_text(encoding="utf-8"))
        review = json.loads((root / "assets/evaluation/reviewer-criteria.json").read_text(encoding="utf-8"))
        errors.extend(check_cases(scenarios, review))
        count = len(scenarios["cases"])
    except (OSError, ValueError, KeyError, TypeError) as exc:
        errors.append(f"Cannot validate evaluation fixtures: {exc}")
        count = 0
    metadata = root / "agents/openai.yaml"
    if not metadata.is_file() or "$ef-solution-architect" not in metadata.read_text(encoding="utf-8"):
        errors.append("Agent metadata/default prompt is absent or mismatched.")
    return errors, {"main_lines": len(content.splitlines()), "local_links": links,
                    "references": len(list((root / "references").glob("*.md"))),
                    "templates": len(list((root / "assets/templates").glob("*.md"))),
                    "evaluation_cases": count}


def main():
    root = Path(__file__).resolve().parents[1]
    errors, stats = inspect(root)
    print(json.dumps({"ok": not errors, **stats, "errors": errors}, ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
