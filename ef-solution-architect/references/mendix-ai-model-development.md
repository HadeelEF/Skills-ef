# Architecture for AI-led Mendix delivery

## Design the connected model slice and its handoff

Fahad develops through AI. Supply a precise architecture/design contract for
the implementing agent. Start from the actual app model, version, modules,
security and constraints. Assess delivery-tool capability and review resulting
model evidence; this profile does not edit models, write extensions or build apps.
Never describe a proposed design as an applied model change.

Define one journey with a domain model change, page/action, server flow, access
rules, relevant integration and verification. Provide qualified artifact names
and typed parameters, associations, expressions, activity settings and failure
branches. Reuse existing artifacts and avoid simultaneous broad changes to
domain/security/UI/workflows when a narrow slice answers the task.

## Distinguish the available development surfaces

| Surface | Direction and use |
| --- | --- |
| Maia Make | Studio Pro assistant working with supported model document types |
| Maia MCP Client | Maia calls external tools; does not by itself expose Studio Pro to this assistant |
| Studio Pro MCP Server | An external agent uses exposed Studio Pro/Maia modeling capabilities |
| Runtime MCP Server module | A deployed Mendix app exposes application tools; distinct from editing its model |
| Model/Platform SDK | Programmatic model/platform operations with their own versions, credentials and write limitations |
| Java/JavaScript/widget source | Extension code with build/runtime contracts; not a replacement for model documents |

Inspect actual connected tool descriptions and permissions. Do not assume a
local Studio Pro endpoint exists, expose it publicly, invent a port, or connect
to a service solely because the skill mentions it. A tool's availability does
not grant production changes. Preserve existing tool approval and credential
controls; scoped local edits already authorized do not require repeated approval.

For runtime MCP tools define authentication, per-operation authorization, input
validation, idempotency and permitted side effects. A discoverable tool is not
an authorized business action; preserve the client's approval controls.

## Check capabilities by operation and version

Read [Maia Make](https://docs.mendix.com/refguide/maia-make/),
[Studio Pro MCP Server](https://docs.mendix.com/refguide/studio-pro-mcp-server/)
and [Maia MCP Client](https://docs.mendix.com/refguide/maia-mcp/) before relying
on current behavior. Maintain a task-local matrix: desired operation, installed
version, documented availability/status, exposed tool, known limitation and
fallback. Generation, modification, explanation and deletion are different
capabilities. General "feature parity" wording does not override a documented
release-specific limitation or the tools actually exposed in this session.

For example, the source snapshot reviewed 2026-10-05 says Studio Pro 11.10 MCP
has page-generation limitations, while the broader Maia capability table lists
page generation. It also describes Java actions as read-only in that table.
Do not infer that all model types are writable through every AI route. Recheck
current docs and exact release before applying these dated observations.

Official pages differ on Studio Pro sign-in for BYO agents: the MCP Server page
requires sign-in, while Maia Make/Agent Instructions describe an exception.
Record the ambiguity and verify the selected version/configuration. Do not
promise an offline, account-free or license-free setup from one broad sentence.
Identify where model context, prompts and credentials travel, including external
LLM/MCP providers; local Windows app hosting does not prove local AI processing.

## Specify the developer workflow and review evidence

1. Document the relevant app/version, model baseline, current errors and scope.
2. Define invariants, contracts, dependency order and expected model artifacts.
3. Assign model changes and any extension code to the implementing Mendix agent.
4. Specify the model-diff review: roles, associations, defaults, events and
   unintended changes, not only visible pages.
5. Require evidence appropriate to risk: model consistency, compatible build,
   role-specific runtime behavior and consequential integration/failure checks.
6. Review reported evidence, record design deviations and recommend corrections.
   Separate designed, model-edited, built, runtime-tested and deployed states.

When an operation is unsupported, design a feasible alternative or handoff to
Studio Pro development rather than inventing a modeling capability. Do not
connect to edit the app or modify binary model internals under this profile.

## Specify conventions for the implementing Maia agent

Use [Agent Instructions](https://docs.mendix.com/refguide/maia-agent-instructions/)
for concise project/module-wide conventions and
[Agent Skills](https://docs.mendix.com/refguide/maia-agent-skills/) for conditional
reusable guidance. Check installed-version support and actual model directories.
Current docs place instructions under skillssource/AGENTS.md and module-specific
instructions under skillssource/_modules/<module_name>/AGENTS.md; skills use their
own named directories and SKILL.md. The documentation title uses SKILLS.md, but
the described individual skill file is SKILL.md. Follow the verified format.

Specify proposed instruction content while retaining existing project rules; include relevant EF conventions,
model naming, security invariants, deployment constraints and validation commands.
Do not copy this entire architecture library into every Maia prompt. Ask the implementer to verify
recognition through Studio Pro and applicable refresh/new-session behavior.
This installed ChatGPT skill does not automatically install itself into Maia.
