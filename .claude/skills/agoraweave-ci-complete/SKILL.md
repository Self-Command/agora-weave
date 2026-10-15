---
name: agoraweave-ci-complete
description: Run the mandatory AgoraWeave bridge completion hook after all canonical tasks and current cloud evidence are complete.
---

Read `.specify/memory/constitution.md` and invoke from the repository root:

```powershell
& ./tools/ci/bridge-transition.ps1 -Transition complete -Mode full-release -Actor claude
```

Wait for the actual result before changing the handoff. Refusal preserves the incomplete state. Bootstrap readiness, partial tasks, raw task-done success, and manual status edits do not authorize feature completion. Do not execute project verification locally. Follow `specs/001-agoraweave-v1/contracts/cloud-validation.md` §3 for the authenticated evidence.
