---
name: agoraweave-ci-start
description: Run the mandatory AgoraWeave bridge start hook against an authenticated cloud receipt for the current commit.
---

Read `.specify/memory/constitution.md` and the active handoff. Use the authorized scope; until ci-ready is verified, only bootstrap authoring is admitted. Invoke from the repository root:

```powershell
& ./tools/ci/bridge-transition.ps1 -Transition start -Mode bootstrap-only -Actor claude
```

For an authorized business increment use `-Mode business-increment` with its exact receipt. This reader uses Git and GitHub control-plane operations only; do not execute project checks locally. Wait for the actual result. A refusal pauses the dependent transition without changing the handoff. The explicit first-receipt bootstrap authoring exception is `specs/001-agoraweave-v1/contracts/cloud-validation.md` §3.
