---
name: agoraweave-ci-start
description: Use for the mandatory AgoraWeave before_implement start admission.
---

Read `.specify/memory/constitution.md`, the active handoff and authorized task scope. Constitution 4.0.0 and ED-21 govern local feedback and independent Actions acceptance.

For a local target, invoke the existing reader with the fixed Node executable and one active target ID from `tools/ci/validation-manifest.json`:

```powershell
& ./tools/ci/bridge-transition.ps1 -Transition start -Mode local-development -ExecutionSource local -Target <registered-target-id> -NodePath <fixed-node-executable> -Actor codex
```

The reader executes fixed tool/dependency checks, typecheck, nonempty discovery and the target. Service-dependent targets also require `AGORAWEAVE_LOCAL_ENVIRONMENT=dev|test`, prepared official isolated services, actual health, migration and controlled seed. It records `source=local`, exact workspace tree, commands/exits/reports and current contract digests. Never set fake `GITHUB_*` or `RUNNER_*` variables. Refusal leaves handoff unchanged and pauses the dependent transition; it is not business Red. Explicitly authorized T033 migration may repair an unavailable executor without declaring business admission.

Wait for the actual result before transitioning handoff to executing, then read back its real status. Every new behavior needs semantic Red, cause reading, same-oracle/fixture Green and affected regressions. Local start completes no canonical task and certifies no cloud readiness.

Cloud checkpoints retain `-Mode bootstrap-only|business-increment` and default `-ExecutionSource github-actions`; the reader authenticates the exact clean committed receipt. Complete, stage acceptance, merge and release retain every applicable same-final-SHA Actions result. Local evidence cannot authorize complete.
