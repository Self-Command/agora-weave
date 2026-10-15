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
$taskRoot = [System.IO.Path]::GetFullPath($taskRoot.Trim())
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
$taskAllRuns = @()
$taskRunsComplete = $false
$taskRunTotal = $null
for ($taskPage = 1; $taskPage -le 100; $taskPage++) {
    $taskRunsJson = & gh api "repos/$taskRepository/actions/runs?head_sha=$taskHead&per_page=100&page=$taskPage"
    if ($LASTEXITCODE -ne 0) { throw 'Cannot authenticate cloud transition source' }
    $taskRunPage = $taskRunsJson | ConvertFrom-Json
    if ($null -eq $taskRunPage.workflow_runs) { throw 'Incomplete cloud transition run listing' }
    $taskPageRuns = @($taskRunPage.workflow_runs)
    $taskAllRuns += $taskPageRuns
    if ($null -eq $taskRunPage.total_count) {
        if ($taskPage -ne 1 -or $taskPageRuns.Count -ge 100) { throw 'Incomplete cloud transition run listing' }
        $taskRunsComplete = $true
        break
    }
    if ([string]$taskRunPage.total_count -notmatch '^\d+$' -or [long]$taskRunPage.total_count -gt 10000 -or
        ($null -ne $taskRunTotal -and $taskRunTotal -ne $taskRunPage.total_count)) { throw 'Changing cloud transition run listing' }
    $taskRunTotal = $taskRunPage.total_count
    if ($taskAllRuns.Count -eq $taskRunTotal) { $taskRunsComplete = $true; break }
    if ($taskPageRuns.Count -eq 0 -or $taskAllRuns.Count -gt $taskRunTotal) { throw 'Incomplete cloud transition run listing' }
}
if (-not $taskRunsComplete -or @($taskAllRuns.id | Select-Object -Unique).Count -ne $taskAllRuns.Count) { throw 'Incomplete or duplicate cloud transition runs' }
$taskRuns = @($taskAllRuns | Where-Object {
    $_.head_sha -eq $taskHead -and $_.path -eq '.github/workflows/bridge-admission.yml' -and
    $_.head_repository.full_name -eq $taskRepository -and $_.status -eq 'completed' -and $_.conclusion -eq 'success'
})
if ($taskRuns.Count -eq 0) { throw 'A unique current cloud bridge admission result is required' }
$taskDirectory = Join-Path ([System.IO.Path]::GetTempPath()) ("agoraweave-cloud-transition-" + [Guid]::NewGuid())
New-Item -ItemType Directory -Path $taskDirectory | Out-Null
try {
    $taskMatchingReceipts = @()
    $taskCandidateErrors = @()
    foreach ($taskRun in $taskRuns) {
        try {
            if ([string]$taskRun.id -notmatch '^[1-9]\d*$' -or [string]$taskRun.run_attempt -notmatch '^[1-9]\d*$') { throw 'Invalid cloud bridge run identity' }
            $taskArtifactsJson = & gh api "repos/$taskRepository/actions/runs/$($taskRun.id)/artifacts?per_page=100"
            if ($LASTEXITCODE -ne 0) { throw 'Cloud transition artifacts unavailable' }
            $taskArtifactListing = $taskArtifactsJson | ConvertFrom-Json
            if ($null -eq $taskArtifactListing.artifacts -or ($null -ne $taskArtifactListing.total_count -and
                $taskArtifactListing.total_count -ne @($taskArtifactListing.artifacts).Count)) { throw 'Incomplete cloud transition artifact listing' }
            $taskArtifacts = @($taskArtifactListing.artifacts | Where-Object {
                $_.name -eq "bridge-admission-$($taskRun.id)-$($taskRun.run_attempt)" -and $_.expired -eq $false
            })
            if ($taskArtifacts.Count -ne 1) { throw 'Missing unique cloud bridge receipt' }
            $taskArtifact = $taskArtifacts[0]
            if ($taskArtifact.workflow_run.head_sha -ne $taskHead -or [string]$taskArtifact.workflow_run.id -ne [string]$taskRun.id -or
                [string]$taskArtifact.id -notmatch '^[1-9]\d*$' -or $taskArtifact.digest -notmatch '^sha256:[a-f0-9]{64}$' -or
                $taskArtifact.size_in_bytes -lt 1 -or $taskArtifact.size_in_bytes -gt 1048576) { throw 'Invalid cloud bridge archive identity' }
            # GitHub CLI handles the authenticated redirect; each candidate retains its own verified ZIP bytes.
            $taskZipPath = Join-Path $taskDirectory "source-$($taskRun.id).zip"
            $taskDownloadInfo = [System.Diagnostics.ProcessStartInfo]::new('gh')
            foreach ($taskArgument in @('api', "repos/$taskRepository/actions/artifacts/$($taskArtifact.id)/zip")) { $taskDownloadInfo.ArgumentList.Add($taskArgument) }
            $taskDownloadInfo.RedirectStandardOutput = $true
            $taskDownloadInfo.UseShellExecute = $false
            $taskDownload = [System.Diagnostics.Process]::Start($taskDownloadInfo)
            $taskZipFile = [System.IO.File]::Create($taskZipPath)
            try { $taskDownload.StandardOutput.BaseStream.CopyTo($taskZipFile) } finally { $taskZipFile.Dispose() }
            $taskDownload.WaitForExit()
            if ($taskDownload.ExitCode -ne 0 -or (Get-Item -LiteralPath $taskZipPath).Length -ne $taskArtifact.size_in_bytes -or
                ('sha256:' + (Get-FileHash -LiteralPath $taskZipPath -Algorithm SHA256).Hash.ToLowerInvariant()) -ne $taskArtifact.digest) {
                throw 'Cloud bridge ZIP source digest mismatch'
            }
            $taskZip = [System.IO.Compression.ZipFile]::OpenRead($taskZipPath)
            try {
                $taskPossibleEntries = @('bridge-admission.json', "completion-records/$taskHead.json")
                $taskEntryNames = @($taskZip.Entries | ForEach-Object { $_.FullName })
                if ($taskZip.Entries.Count -lt 1 -or $taskZip.Entries.Count -gt 2 -or
                    @($taskEntryNames | Select-Object -Unique).Count -ne $taskEntryNames.Count -or
                    'bridge-admission.json' -notin $taskEntryNames -or @($taskZip.Entries | Where-Object {
                        $_.FullName -notin $taskPossibleEntries -or $_.Length -gt 1048576
                    }).Count -ne 0) { throw 'Unexpected cloud bridge archive content' }
                $taskReader = [System.IO.StreamReader]::new($taskZip.GetEntry('bridge-admission.json').Open())
                try { $taskReceipt = $taskReader.ReadToEnd() | ConvertFrom-Json } finally { $taskReader.Dispose() }
                if ($taskEntryNames.Count -ne 1) { throw 'Unexpected cloud bridge archive content' }
                if ($taskReceipt.transition -eq 'complete' -and
                    ($taskReceipt.private_record.state -ne 'archived_and_readback_verified' -or
                     $taskReceipt.private_record.temporary_key_files_removed -ne $true -or
                     $taskReceipt.private_record.sha256 -notmatch '^[a-f0-9]{64}$' -or
                     $taskReceipt.private_record.path -notmatch '^/archive/ordinary/bridge-admission-[a-f0-9]{40}-[1-9]\d*-[1-9]\d*\.json$')) {
                    throw 'Missing privately preserved complete bridge record'
                }
                if ($null -ne $taskReceipt.completion_record -or $null -ne $taskReceipt.completion_source -or
                    $null -ne $taskReceipt.initialization_source -or $null -ne $taskReceipt.development_source) {
                    throw 'Private source documents cannot appear in the public bridge receipt'
                }
            } finally { $taskZip.Dispose() }
            if ($taskReceipt.target_sha -ne $taskHead -or $taskReceipt.source -ne 'github-actions' -or
                $taskReceipt.runner_environment -ne 'github-hosted' -or [string]$taskReceipt.run_id -ne [string]$taskRun.id -or
                $taskReceipt.attempt -ne $taskRun.run_attempt) { throw 'Cloud receipt source identity mismatch' }
            if ($taskReceipt.actor -ne $Actor -or $taskReceipt.feature -ne $Feature -or $taskReceipt.mode -ne $Mode -or
                $taskReceipt.transition -ne $Transition -or $taskReceipt.state -ne 'passed') { continue }
            $taskBoundFiles = @($taskReceipt.input_digests.PSObject.Properties)
            if ($taskBoundFiles.Count -lt 4) { throw 'Missing frozen transition input digests' }
            foreach ($taskFile in $taskBoundFiles) {
                $taskInputPath = [System.IO.Path]::GetFullPath((Join-Path $taskRoot $taskFile.Name))
                if (-not $taskInputPath.StartsWith($taskRoot + [System.IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid transition input path' }
                if ($taskFile.Value -notmatch '^[a-f0-9]{64}$' -or
                    (Get-FileHash -LiteralPath $taskInputPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $taskFile.Value) { throw 'Transition inputs changed after the cloud check' }
            }
            $taskMatchingReceipts += $taskReceipt
        }
        catch { $taskCandidateErrors += $_.Exception.Message }
    }
    if ($taskMatchingReceipts.Count -eq 0 -and $taskCandidateErrors.Count -gt 0) { throw $taskCandidateErrors[0] }
    if ($taskMatchingReceipts.Count -ne 1) { throw 'A unique current cloud bridge receipt for the exact actor, feature, mode, transition and inputs is required' }
    Write-Output "Authenticated cloud $Transition admitted for $Mode at $taskHead; no feature completion implied."
}
finally {
    if ([System.IO.Path]::GetFullPath($taskDirectory).StartsWith([System.IO.Path]::GetTempPath(), [StringComparison]::OrdinalIgnoreCase)) {
        Remove-Item -LiteralPath $taskDirectory -Recurse -Force
    }
}
