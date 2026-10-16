param([string]$SourceRoot = '', [switch]$AllBranches, [switch]$Verify, [switch]$Publish)
$ErrorActionPreference = 'Stop'
$taskSource = if ($SourceRoot) { [IO.Path]::GetFullPath($SourceRoot) } else { (& git rev-parse --show-toplevel).Trim() }
$taskPolicy = Get-Content -LiteralPath (Join-Path $taskSource 'infra/development/policy.json') -Raw | ConvertFrom-Json
$taskNode = Join-Path $taskPolicy.runtime_root 'tools/node-v22.23.3-win-x64/node.exe'
if (-not (Test-Path -LiteralPath $taskNode)) { $taskNode = 'node' }
$taskArguments = @((Join-Path $taskSource 'tools/dev/governance-sync.mjs'), $taskSource)
if ($Verify) { $taskArguments += '--verify' }
elseif ($AllBranches) { $taskArguments += '--sync' }
else { throw 'Select -Verify or -AllBranches' }
if ($Publish) { $taskArguments += '--publish' }
& $taskNode @taskArguments
exit $LASTEXITCODE
