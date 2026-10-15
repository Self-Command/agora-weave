---
name: agoraweave-ci-start
description: Run the mandatory AgoraWeave bridge start hook against an authenticated cloud receipt for the current commit.
---

Read `.specify/memory/constitution.md` and the active handoff. This command is the project's `before_implement` hook.

Use the session's authorized implementation scope and constitution v3.1.0. Before an authenticated development-ready foundation exists, only `bootstrap-only` is admitted. Development-ready binds actual Actions installation/build, nonempty tests and required isolated service reports to source SHA/run/attempt, ancestry and unchanged foundation digests. It permits dependent business TDD without declaring T027 ci-ready or any task complete. Invoke the metadata transition reader from the repository root:

```powershell
& ./tools/ci/bridge-transition.ps1 -Transition start -Mode bootstrap-only -Actor codex
```

For an authorized business increment use `-Mode business-increment`; the exact receipt must authorize that mode using a verified development source or full initialization evidence. Incomplete unrelated full-CI evidence may be repaired in parallel; unhealthy foundations, unauthenticated target results or unknown security boundaries pause dependent work. The reader uses Git and the GitHub control plane only. Do not run project checks locally or replace a missing receipt with a declaration. Wait for the command's actual result. A refusal leaves the handoff unchanged and pauses the dependent transition. Bootstrap authoring before the first cloud receipt remains governed by the explicit bootstrap exception in `contracts/cloud-validation.md` §3. Every new behavior still needs cloud Red, cause reading, implementation and same-oracle Green with affected tests and necessary regressions. Merge, stage acceptance and release retain all applicable same-final-SHA evidence.
