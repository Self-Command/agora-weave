---
name: agoraweave-ci-complete
description: Run the mandatory AgoraWeave bridge completion hook after all canonical tasks and current cloud evidence are complete.
---

Read `.specify/memory/constitution.md` and the active handoff. This command is the project's `after_implement` hook. Invoke the authenticated metadata reader from the repository root:

```powershell
& ./tools/ci/bridge-transition.ps1 -Transition complete -Mode full-release -Actor codex
```

Wait for its actual result before a handoff transition. A refusal leaves the feature incomplete. Bootstrap readiness and partial task progress cannot authorize feature completion. Do not run project verification locally or treat hand-edited status, task-done exit zero, or a green workflow icon as the receipt. The completion evidence protocol is `specs/001-agoraweave-v1/contracts/cloud-validation.md` §3.
