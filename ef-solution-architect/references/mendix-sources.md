# Mendix official evidence and research map

Baseline review: 2026-10-05. This is a curated engineering map, not a copy of all
Mendix documentation, certification, or a promise of continuously updated
knowledge. Reopen relevant official pages when making version-sensitive decisions.
Use the installed major/patch documentation; search engines may return refguide9
or refguide10 when the task concerns another release.

## Version and deployment

- [Release notes](https://docs.mendix.com/releasenotes/): inspect exact release dates, fixes, known issues and migration notes.
- [Support tracks](https://docs.mendix.com/releasenotes/studio-pro/lts-mts/): distinguish released from planned entries and runtime from native support.
- [System requirements](https://docs.mendix.com/refguide/system-requirements/): match development/build/server Java, OS, database and toolchain.
- [Windows deployment](https://docs.mendix.com/developerportal/deploy/deploy-mendix-on-microsoft-windows/): Service Console/runtime/IIS topology.
- [Windows automation](https://docs.mendix.com/developerportal/deploy/automate-mendix-deployment-on-microsoft-windows/): version-specific PowerShell tooling.
- [On-premises security](https://docs.mendix.com/developerportal/deploy/security-checklist-for-your-on-premises-installation/): service identities and management boundary.
- [MxBuild](https://docs.mendix.com/refguide/mxbuild/): confirm commands/targets; treat sample paths as examples.

## Data, security and execution

- [Microflow properties](https://docs.mendix.com/refguide/microflow/): entry roles, entity access and execution settings.
- [Access rules](https://docs.mendix.com/refguide/access-rules/) and [user roles](https://docs.mendix.com/refguide/user-roles/): effective permissions across grant paths.
- [Validation](https://docs.mendix.com/refguide/validation-rules/): integrity and deployment impact of uniqueness rules.
- [Commit objects](https://docs.mendix.com/refguide/committing-objects/) and [error handling](https://docs.mendix.com/refguide/error-handling-in-microflows/): transaction/savepoint and memory semantics.
- [Optimistic locking](https://docs.mendix.com/refguide/optimistic-locking/): support, settings, conflicts and offline exception.
- [Microflows/nanoflows](https://docs.mendix.com/refguide/microflows-and-nanoflows/): client/server execution differences.
- [Task Queue](https://docs.mendix.com/refguide/task-queue/): transaction-bound scheduling, parameters, retries and clustering.
- [Workflow engine](https://docs.mendix.com/refguide/workflow-engine/), [workflow security](https://docs.mendix.com/refguide/workflow-security/) and [versioning](https://docs.mendix.com/refguide/workflow-versioning/): lifecycle, access and active-instance changes.
- [OQL](https://docs.mendix.com/refguide/oql/): versioned syntax and explicit security responsibilities.
- [Development practices](https://docs.mendix.com/refguide/general-best-practices/): model/query maintainability and performance.

## UI, mobile and integration

- [Atlas foundations](https://docs.mendix.com/howto/front-end/get-started/) and [company design system](https://docs.mendix.com/howto/front-end/create-a-company-design-system/): reusable UI conventions.
- [React client](https://docs.mendix.com/refguide/mendix-client/react/) and [component compatibility](https://docs.mendix.com/refguide/mendix-client/marketplace-react-status/): inspect widget/module and API dependencies.
- [Pluggable widgets](https://docs.mendix.com/apidocs-mxsdk/apidocs/pluggable-widgets/): property and runtime binding contracts.
- [Offline sync](https://docs.mendix.com/refguide/mobile/building-efficient-mobile-apps/offlinefirst-data/synchronization/): upload/download, selected objects, files and dependencies.
- [Published REST](https://docs.mendix.com/refguide/published-rest-services/): service authentication and generated contract.
- [External entities](https://docs.mendix.com/refguide/external-entities/) and [OData requirements](https://docs.mendix.com/refguide/consumed-odata-service-requirements/): remote ownership, supported subset and interoperability.
- [SDK introduction](https://docs.mendix.com/apidocs-mxsdk/mxsdk/sdk-intro/) and [metamodel](https://docs.mendix.com/apidocs-mxsdk/mxsdk/mendix-metamodel/): model automation and write caveats.
- [Unit Testing](https://docs.mendix.com/appstore/modules/unit-testing/): compatible test module setup and constraints.

## AI development

- [Maia Make](https://docs.mendix.com/refguide/maia-make/): document/operation capability matrix by release.
- [Studio Pro MCP Server](https://docs.mendix.com/refguide/studio-pro-mcp-server/): external modeling agent integration and limits.
- [Maia MCP Client](https://docs.mendix.com/refguide/maia-mcp/): outbound tool integration and connection configuration.
- [Agent Instructions](https://docs.mendix.com/refguide/maia-agent-instructions/) and [Agent Skills](https://docs.mendix.com/refguide/maia-agent-skills/): project/module guidance and activation.
- [Runtime MCP module](https://docs.mendix.com/agents/agents-kit-1/reference-guide/mcp-modules/mcp-server/): business tools versus Studio Pro authoring; check the current kit/version because paths may retain older names.

## Record unresolved evidence accurately

For material choices capture URL, retrieval date, exact version, relevant limit,
installed evidence and design consequence. Pages can disagree or include upcoming
features; do not use a navigation label as proof of release. Reviewed Maia/Agent
Instructions pages describe a BYO sign-in exception while the MCP Server page
requires sign-in. Verify the target configuration; do not bypass authentication.
Model SDK cautions and Maia limits require operation-specific checks. Record
coverage of artifacts actually inspected; do not claim an entire app or every
official page was audited when only selected areas were reviewed.
