param([ValidateSet('checkout','commit')][string]$Event)
$taskCurrent = (& git rev-parse --show-toplevel).Trim()
$taskCanonical = (& git config --get agoraweave.governanceSourceRoot).Trim()
if (-not $taskCanonical) { exit 0 }
$taskRunner = Join-Path $taskCanonical 'tools/dev/sync-governance.ps1'
if ($Event -eq 'commit') {
    $taskManifest = Get-Content -LiteralPath (Join-Path $taskCurrent 'tools/dev/governance-sync-manifest.json') -Raw | ConvertFrom-Json
    $taskChanged = @(& git diff-tree --no-commit-id --name-only -r HEAD)
    $taskRelevant = @($taskChanged | Where-Object {
        $taskPath = $_
        ($taskManifest.files -contains $taskPath) -or
        @($taskManifest.directories | Where-Object { $taskPath.StartsWith($_ + '/') }).Count -gt 0
    })
    if (-not $taskRelevant.Count) { exit 0 }
    $taskCanonical = $taskCurrent
    $taskRunner = Join-Path $taskCanonical 'tools/dev/sync-governance.ps1'
}
& pwsh -NoLogo -NoProfile -File $taskRunner -SourceRoot $taskCanonical -AllBranches
exit $LASTEXITCODE
