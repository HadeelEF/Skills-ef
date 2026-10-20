#!/usr/bin/env python3
"""Read-only checks for an explicitly exported requirements/backlog JSON index.
Checks structure and declared links; never proves semantic coverage or approval.
"""
import argparse
import json
from graphlib import CycleError, TopologicalSorter
from pathlib import Path

COLLECTIONS = ("sources", "requirements", "acceptance", "backlog", "external_dependencies")
LIMITS = ("Only records explicitly supplied in this JSON index are checked. "
          "No source-document parsing, semantic completeness, authority verification, "
          "live-tool verification, performance measurement, or executed-test claim.")


def audit(document):
    errors, warnings = [], []

    def issue(bucket, code, at, **extra):
        bucket.append({"type": code, "at": at, **extra})

    def nonblank(value):
        return isinstance(value, str) and bool(value.strip())

    if not isinstance(document, dict):
        return {"errors": [{"type": "invalid_root", "at": "$"}], "warnings": [],
                "counts": {}, "limits": LIMITS}
    if type(document.get("schema_version")) is not int or document["schema_version"] != 1:
        issue(errors, "unsupported_schema_version", "$.schema_version")
    if not nonblank(document.get("scope_note")):
        issue(warnings, "scope_not_described", "$.scope_note")
    if "scope_key" in document and not nonblank(document["scope_key"]):
        issue(errors, "invalid_scope_key", "$.scope_key")
    if "scope_complete" in document and not isinstance(document["scope_complete"], bool):
        issue(errors, "invalid_scope_complete", "$.scope_complete")
    if document.get("scope_complete") is not True:
        issue(warnings, "scope_not_declared_complete", "$.scope_complete")

    groups = {}
    for collection in COLLECTIONS:
        rows = document.get(collection, [])
        groups[collection] = {}
        if not isinstance(rows, list):
            issue(errors, "invalid_collection", "$." + collection)
            continue
        for index, row in enumerate(rows):
            at = f"$.{collection}[{index}]"
            if not isinstance(row, dict):
                issue(errors, "invalid_record", at)
                continue
            if not nonblank(row.get("id")):
                issue(errors, "missing_id", at)
                continue
            key = row["id"]
            if key in groups[collection]:
                issue(errors, "duplicate_id", at, id=key, collection=collection)
                continue
            groups[collection][key] = row

    def links(row, field, targets, at):
        values = row.get(field, [])
        if not isinstance(values, list):
            issue(errors, "invalid_link_list", at + "." + field)
            return []
        valid = []
        seen = set()
        for value in values:
            if not nonblank(value):
                issue(errors, "invalid_link_id", at + "." + field)
                continue
            if value in seen:
                issue(warnings, "repeated_link", at + "." + field, target=value)
                continue
            seen.add(value)
            if value not in targets:
                issue(errors, "unknown_reference", at + "." + field, target=value)
                continue
            valid.append(value)
        return valid

    sources = groups["sources"]
    requirements = groups["requirements"]
    acceptance = groups["acceptance"]
    backlog = groups["backlog"]
    external = groups["external_dependencies"]
    for key in set(external) & set(backlog):
        issue(errors, "ambiguous_dependency_id", "$.external_dependencies", id=key)

    for key, row in sources.items():
        if not nonblank(row.get("location")):
            issue(warnings, "source_location_missing", f"sources/{key}")
    for key, row in external.items():
        if not nonblank(row.get("reason")):
            issue(warnings, "external_dependency_reason_missing", f"external_dependencies/{key}")

    req_with_acceptance = set()
    req_with_backlog = set()
    acceptance_used = set()
    ac_targets = {}
    graph = {}
    for key, row in requirements.items():
        at = f"requirements/{key}"
        if not nonblank(row.get("text")):
            issue(errors, "requirement_text_missing", at)
        if not links(row, "source_ids", sources, at):
            issue(warnings, "requirement_source_missing", at)
        status = row.get("approval_status", "draft")
        if status not in ("draft", "in_review", "approved", "withdrawn"):
            issue(warnings, "unknown_approval_status", at)
        if status == "approved" and not nonblank(row.get("approval_evidence")):
            issue(errors, "approval_evidence_missing", at)

    for key, row in acceptance.items():
        at = f"acceptance/{key}"
        if not nonblank(row.get("text")):
            issue(errors, "acceptance_text_missing", at)
        targets = links(row, "requirement_ids", requirements, at)
        ac_targets[key] = set(targets)
        req_with_acceptance.update(targets)
        if not targets:
            issue(warnings, "acceptance_without_requirement", at)

    for key, row in backlog.items():
        at = f"backlog/{key}"
        if not nonblank(row.get("title")):
            issue(errors, "backlog_title_missing", at)
        kind = row.get("type")
        if kind not in ("Story", "Bug", "Enabler", "Spike"):
            issue(warnings, "unknown_backlog_type", at)
        reqs = links(row, "requirement_ids", requirements, at)
        acs = links(row, "acceptance_ids", acceptance, at)
        dependencies = links(row, "blocked_by", set(backlog) | set(external), at)
        graph[key] = [dep for dep in dependencies if dep in backlog]
        req_with_backlog.update(reqs)
        acceptance_used.update(acs)
        if not reqs and not nonblank(row.get("rationale")):
            issue(warnings, "backlog_without_requirement_or_rationale", at)
        if key in dependencies:
            issue(errors, "self_dependency", at)
        for ac in acs:
            extra = ac_targets.get(ac, set()) - set(reqs)
            if extra:
                issue(warnings, "acceptance_outside_declared_requirements", at,
                      acceptance=ac, requirements=sorted(extra))
        readiness = row.get("readiness", "draft")
        if readiness not in ("draft", "needs_refinement", "ready", "blocked"):
            issue(warnings, "unknown_readiness", at)
        if readiness == "ready":
            if not acs and not (kind in ("Spike", "Enabler") and nonblank(row.get("completion"))):
                issue(errors, "ready_item_without_acceptance_or_completion", at)
            if row.get("unresolved_blockers"):
                issue(errors, "ready_item_with_unresolved_blockers", at)

    try:
        TopologicalSorter(graph).prepare()
    except CycleError as error:
        issue(errors, "dependency_cycle", "$.backlog", cycle=error.args[1])

    active = {key for key, row in requirements.items()
              if row.get("approval_status") != "withdrawn"}
    for key in sorted(active):
        if "backlog" in document and key not in req_with_backlog:
            issue(warnings, "requirement_without_backlog", f"requirements/{key}")
        if "acceptance" in document and key not in req_with_acceptance:
            issue(warnings, "requirement_without_acceptance", f"requirements/{key}")
    if "backlog" in document:
        for key in sorted(set(acceptance) - acceptance_used):
            issue(warnings, "acceptance_unused_by_backlog", f"acceptance/{key}")
    if not requirements and not backlog:
        issue(warnings, "no_requirements_or_backlog", "$")
    return {
        "scope_note": document.get("scope_note", ""),
        "scope_declared_complete": document.get("scope_complete") is True,
        "counts": {name: len(rows) for name, rows in groups.items()},
        "declared_link_counts": {
            "active_requirements": len(active),
            "active_requirements_with_backlog": len(active & req_with_backlog),
            "active_requirements_with_acceptance": len(active & req_with_acceptance)
        },
        "errors": errors, "warnings": warnings, "limits": LIMITS
    }


def compare_indexes(before, after):
    """Compare two already-audited indexes; report literal differences, not meaning."""
    notes = []
    old_scope, new_scope = before.get("scope_key"), after.get("scope_key")
    if old_scope and new_scope and old_scope != new_scope:
        return {"status": "not_compared_scope_mismatch"}, [
            {"type": "baseline_scope_mismatch", "at": "$.scope_key"}]
    if not old_scope or not new_scope:
        notes.append({"type": "baseline_scope_unconfirmed", "at": "$.scope_key"})
    if before.get("scope_complete") is not True or after.get("scope_complete") is not True:
        notes.append({"type": "baseline_comparison_has_partial_scope", "at": "$"})

    old = {name: {row["id"]: row for row in before.get(name, [])} for name in COLLECTIONS}
    new = {name: {row["id"]: row for row in after.get(name, [])} for name in COLLECTIONS}
    reference_fields = {"requirements": {"source_ids"}, "acceptance": {"requirement_ids"},
                        "backlog": {"requirement_ids", "acceptance_ids", "blocked_by"}}

    def comparable(collection, field, value):
        if field in reference_fields.get(collection, set()) and isinstance(value, list):
            value = sorted(set(value))
        return json.dumps(value, ensure_ascii=False, sort_keys=True)

    changes, changed_ids = {}, {}
    for name in COLLECTIONS:
        added = sorted(set(new[name]) - set(old[name]))
        absent = sorted(set(old[name]) - set(new[name]))
        changed = []
        for key in sorted(set(old[name]) & set(new[name])):
            previous, current = old[name][key], new[name][key]
            fields = [field for field in sorted(set(previous) | set(current))
                      if field not in previous or field not in current
                      or comparable(name, field, previous[field]) != comparable(name, field, current[field])]
            if fields:
                changed.append({"id": key, "fields": fields})
        changes[name] = {"added": added, "absent_from_current_index": absent, "changed": changed}
        changed_ids[name] = {row["id"] for row in changed}
        for key in absent:
            notes.append({"type": "baseline_id_absent_from_current_index",
                          "at": f"{name}/{key}"})

    changed_sources = changed_ids["sources"] | set(changes["sources"]["absent_from_current_index"])
    affected_requirements = changed_ids["requirements"] | set(changes["requirements"]["absent_from_current_index"])
    for collection in (old, new):
        affected_requirements.update(key for key, row in collection["requirements"].items()
                                     if set(row.get("source_ids", [])) & changed_sources)
    affected_acceptance = changed_ids["acceptance"] | set(changes["acceptance"]["absent_from_current_index"])
    affected_acceptance.update(key for key, row in new["acceptance"].items()
                               if set(row.get("requirement_ids", [])) & affected_requirements)
    affected_backlog = {key for key, row in new["backlog"].items()
                       if set(row.get("requirement_ids", [])) & affected_requirements
                       or set(row.get("acceptance_ids", [])) & affected_acceptance}
    for name, affected in (("acceptance", affected_acceptance), ("backlog", affected_backlog)):
        for key in sorted((affected & set(old[name]) & set(new[name])) - changed_ids[name]):
            notes.append({"type": "linked_record_unchanged_after_upstream_change",
                          "at": f"{name}/{key}"})
    for key in sorted(affected_requirements & set(old["requirements"]) & set(new["requirements"])):
        previous, current = old["requirements"][key], new["requirements"][key]
        if (previous.get("approval_status") == current.get("approval_status") == "approved"
                and previous.get("approval_evidence") == current.get("approval_evidence")):
            notes.append({"type": "changed_requirement_retains_approval_evidence",
                          "at": f"requirements/{key}"})
    return {
        "status": "compared_declared_indexes",
        "changes": changes,
        "linked_records_for_review": {
            "requirements": sorted(affected_requirements),
            "acceptance": sorted(affected_acceptance),
            "backlog": sorted(affected_backlog)
        },
        "limits": "Literal record differences and declared references only. Absence is not proof "
                  "of deletion; changes are not proof of authorization, meaning, adequate review, "
                  "or a need to alter every linked record. Review source authority and scope."
    }, notes


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", type=Path, help="JSON index; see references/validation-and-quality.md")
    parser.add_argument("--strict", action="store_true", help="Return nonzero for warnings as well")
    parser.add_argument("--baseline", type=Path, help="Compare with a previous JSON index of the same scope")
    args = parser.parse_args()
    try:
        document = json.loads(args.path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        print(json.dumps({"errors": [{"type": "unreadable_input", "reason": str(error)}],
                          "warnings": [], "limits": LIMITS}, ensure_ascii=False, indent=2))
        return 1
    result = audit(document)
    if args.baseline:
        try:
            baseline = json.loads(args.baseline.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError) as error:
            result["errors"].append({"type": "unreadable_baseline", "at": "$",
                                     "reason": str(error)})
            result["change_review"] = {"status": "not_compared_unreadable_baseline"}
        else:
            baseline_result = audit(baseline)
            result["baseline_counts"] = baseline_result.get("counts", {})
            for level in ("errors", "warnings"):
                result[level].extend({**row, "input": "baseline"} for row in baseline_result[level])
            if not result["errors"]:
                result["change_review"], notes = compare_indexes(baseline, document)
                result["warnings"].extend(notes)
            else:
                result["change_review"] = {"status": "not_compared_invalid_index"}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return int(bool(result["errors"] or (args.strict and result["warnings"])))


if __name__ == "__main__":
    raise SystemExit(main())
