param(
    [ValidateSet('start', 'complete')][string]$Transition = 'start',
    [ValidateSet('bootstrap-only', 'business-increment', 'full-release')][string]$Mode = 'bootstrap-only',
    [string]$Actor = 'codex',
    [string]$Feature = 'specs/001-agoraweave-v1'
)
$ErrorActionPreference = 'Stop'
$taskRepository = 'Self-Command/agora-weave'
$taskRoot = (& git rev-parse --show-toplevel 2>$null)
if ($LASTEXITCODE -ne 0 -or -not $taskRoot) { throw 'Cloud transition requires an identified Git checkout' }
$taskRoot = $taskRoot.Trim()
$taskHead = (& git rev-parse HEAD 2>$null)
if ($LASTEXITCODE -ne 0 -or $taskHead -notmatch '^[a-f0-9]{40}$') { throw 'Missing current committed target; raw status is ineffective' }
$taskHead = $taskHead.Trim()
if ((& git status --porcelain --untracked-files=all)) { throw 'Uncommitted inputs invalidate the cloud transition' }
if ($Transition -eq 'complete') {
    if ($Mode -ne 'full-release') { throw 'Raw feature complete requires full-release evidence; bootstrap readiness never completes the feature' }
    $taskTasks = Join-Path $taskRoot (Join-Path $Feature 'tasks.md')
    if (-not (Test-Path -LiteralPath $taskTasks) -or (Select-String -LiteralPath $taskTasks -Pattern '^- \[ \] T\d+' -Quiet)) {
        throw 'Canonical tasks remain incomplete; direct legacy complete is refused'
    }
}
$taskRunsJson = & gh api "repos/$taskRepository/actions/runs?head_sha=$taskHead&per_page=100"
if ($LASTEXITCODE -ne 0) { throw 'Cannot authenticate cloud transition source' }
$taskRuns = ($taskRunsJson | ConvertFrom-Json).workflow_runs | Where-Object {
    $_.head_sha -eq $taskHead -and $_.path -eq '.github/workflows/bridge-admission.yml' -and
    $_.head_repository.full_name -eq $taskRepository -and $_.status -eq 'completed' -and $_.conclusion -eq 'success'
}
if (@($taskRuns).Count -ne 1) { throw 'A unique current cloud bridge admission result is required' }
$taskRun = @($taskRuns)[0]
$taskArtifactsJson = & gh api "repos/$taskRepository/actions/runs/$($taskRun.id)/artifacts?per_page=100"
if ($LASTEXITCODE -ne 0) { throw 'Cloud transition artifacts unavailable' }
$taskArtifact = ($taskArtifactsJson | ConvertFrom-Json).artifacts | Where-Object {
    $_.name -eq "bridge-admission-$($taskRun.id)-$($taskRun.run_attempt)" -and -not $_.expired
}
if (@($taskArtifact).Count -ne 1) { throw 'Missing unique cloud bridge receipt' }
$taskArtifact = @($taskArtifact)[0]
if ($taskArtifact.workflow_run.head_sha -ne $taskHead -or [string]$taskArtifact.workflow_run.id -ne [string]$taskRun.id -or
    $taskArtifact.digest -notmatch '^sha256:[a-f0-9]{64}$' -or $taskArtifact.size_in_bytes -gt 1048576) { throw 'Invalid cloud bridge archive identity' }
$taskDirectory = Join-Path ([System.IO.Path]::GetTempPath()) ("agoraweave-cloud-transition-" + [Guid]::NewGuid())
New-Item -ItemType Directory -Path $taskDirectory | Out-Null
try {
    # GitHub CLI handles the authenticated REST redirect; preserve exact ZIP bytes for digest verification.
    $taskZipPath = Join-Path $taskDirectory 'source.zip'
    $taskDownloadInfo = [System.Diagnostics.ProcessStartInfo]::new('gh')
    foreach ($taskArgument in @('api', "repos/$taskRepository/actions/artifacts/$($taskArtifact.id)/zip")) { $taskDownloadInfo.ArgumentList.Add($taskArgument) }
    $taskDownloadInfo.RedirectStandardOutput = $true
    $taskDownloadInfo.UseShellExecute = $false
    $taskDownload = [System.Diagnostics.Process]::Start($taskDownloadInfo)
    $taskZipFile = [System.IO.File]::Create($taskZipPath)
    try { $taskDownload.StandardOutput.BaseStream.CopyTo($taskZipFile) } finally { $taskZipFile.Dispose() }
    $taskDownload.WaitForExit()
    if ($taskDownload.ExitCode -ne 0 -or ('sha256:' + (Get-FileHash -LiteralPath $taskZipPath -Algorithm SHA256).Hash.ToLowerInvariant()) -ne $taskArtifact.digest) {
        throw 'Cloud bridge ZIP source digest mismatch'
    }
    $taskZip = [System.IO.Compression.ZipFile]::OpenRead($taskZipPath)
    try {
        if ($taskZip.Entries.Count -ne 1 -or $taskZip.Entries[0].FullName -ne 'bridge-admission.json' -or $taskZip.Entries[0].Length -gt 1048576) { throw 'Unexpected cloud bridge archive content' }
        $taskReader = [System.IO.StreamReader]::new($taskZip.Entries[0].Open())
        try { $taskReceipt = $taskReader.ReadToEnd() | ConvertFrom-Json } finally { $taskReader.Dispose() }
    } finally { $taskZip.Dispose() }
    if ($taskReceipt.target_sha -ne $taskHead -or $taskReceipt.actor -ne $Actor -or $taskReceipt.feature -ne $Feature -or
        $taskReceipt.mode -ne $Mode -or $taskReceipt.transition -ne $Transition -or $taskReceipt.state -ne 'passed' -or
        $taskReceipt.source -ne 'github-actions' -or $taskReceipt.runner_environment -ne 'github-hosted' -or
        [string]$taskReceipt.run_id -ne [string]$taskRun.id -or $taskReceipt.attempt -ne $taskRun.run_attempt) {
        throw 'Cloud receipt does not authorize this exact transition'
    }
    $taskBoundFiles = @($taskReceipt.input_digests.PSObject.Properties)
    if ($taskBoundFiles.Count -lt 4) { throw 'Missing frozen transition input digests' }
    foreach ($taskFile in $taskBoundFiles) {
        $taskInputPath = [System.IO.Path]::GetFullPath((Join-Path $taskRoot $taskFile.Name))
        if (-not $taskInputPath.StartsWith($taskRoot + [System.IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid transition input path' }
        if ((Get-FileHash -LiteralPath $taskInputPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $taskFile.Value) { throw 'Transition inputs changed after the cloud check' }
    }
    Write-Output "Authenticated cloud $Transition admitted for $Mode at $taskHead; no feature completion implied."
}
finally {
    if ([System.IO.Path]::GetFullPath($taskDirectory).StartsWith([System.IO.Path]::GetTempPath(), [StringComparison]::OrdinalIgnoreCase)) {
        Remove-Item -LiteralPath $taskDirectory -Recurse -Force
    }
}
