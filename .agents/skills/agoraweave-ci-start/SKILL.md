---
name: agoraweave-ci-start
description: Run the mandatory AgoraWeave bridge start hook against an authenticated cloud receipt for the current commit.
---

Read `.specify/memory/constitution.md` and the active handoff. This command is the project's `before_implement` hook.

Use the session's authorized implementation scope. Until cloud ci-ready is verified, only `bootstrap-only` is admitted. Invoke the metadata transition reader from the repository root:

```powershell
& ./tools/ci/bridge-transition.ps1 -Transition start -Mode bootstrap-only -Actor codex
```

For an authorized business increment use `-Mode business-increment`; the exact receipt must authorize that mode. The reader uses Git and the GitHub control plane only. Do not run project checks locally or replace a missing receipt with a declaration. Wait for the command's actual result. A refusal leaves the handoff unchanged and pauses the dependent transition. Bootstrap authoring before the first cloud receipt remains governed by the explicit bootstrap exception in `contracts/cloud-validation.md` §3.
