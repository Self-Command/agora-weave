param(
    [switch]$Prepare,
    [switch]$Install,
    [Parameter(ValueFromRemainingArguments = $true)][string[]]$Command
)
$ErrorActionPreference = 'Stop'
$taskSource = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$taskPolicy = Get-Content -LiteralPath (Join-Path $taskSource 'infra/development/policy.json') -Raw | ConvertFrom-Json
$taskRuntime = [IO.Path]::GetFullPath($taskPolicy.runtime_root)
if ($taskRuntime -notmatch '^H:\\Projects\\AgoraWeave\\development\\?$') { throw 'Unexpected project runtime directory' }
foreach ($taskPart in @('tools', 'tmp', 'reports', 'cache/npm', 'cache/expo', 'cache/gradle', 'cache/playwright', 'cache/node-gyp')) {
    New-Item -ItemType Directory -Path (Join-Path $taskRuntime $taskPart) -Force | Out-Null
}
$taskLock = Get-Content -LiteralPath (Join-Path $taskSource 'infra/ci/toolchain-lock.json') -Raw | ConvertFrom-Json
$taskNodeName = 'node-' + $taskLock.node + '-win-x64'
$taskNodeDirectory = Join-Path $taskRuntime ('tools/' + $taskNodeName)
$taskNode = Join-Path $taskNodeDirectory 'node.exe'
if (-not (Test-Path -LiteralPath $taskNode)) {
    throw "Pinned runtime unavailable. Place $taskNodeName in $taskRuntime/tools."
}
$env:PATH = $taskNodeDirectory + [IO.Path]::PathSeparator + $env:PATH
& pwsh -NoLogo -NoProfile -File (Join-Path $taskSource 'tools/dev/sync-governance.ps1') -SourceRoot $taskSource -Verify
if ($LASTEXITCODE -ne 0) { throw 'Governance files are not synchronized across all worktrees and branches' }
$env:TEMP = Join-Path $taskRuntime 'tmp'
$env:TMP = $env:TEMP
$env:NPM_CONFIG_CACHE = Join-Path $taskRuntime 'cache/npm'
$env:EXPO_HOME = Join-Path $taskRuntime 'cache/expo'
$env:GRADLE_USER_HOME = Join-Path $taskRuntime 'cache/gradle'
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $taskRuntime 'cache/playwright'
$env:npm_config_devdir = Join-Path $taskRuntime 'cache/node-gyp'
$env:AGORAWEAVE_EXECUTION_SOURCE = 'local'
if ((& $taskNode --version) -ne $taskLock.node) { throw 'Pinned Node version differs' }
if ((& $taskNode (Join-Path $taskNodeDirectory 'node_modules/npm/bin/npm-cli.js') --version) -ne $taskLock.npm) { throw 'Pinned npm version differs' }
$taskWorkspace = Join-Path $taskRuntime 'workspace'
if ($Prepare -or $Install -or $Command.Count) {
    & $taskNode (Join-Path $taskSource 'tools/dev/sync-runtime.mjs') $taskSource $taskWorkspace
    if ($LASTEXITCODE -ne 0) { throw 'Runtime source sync failed' }
}
if ($Install) {
    Push-Location $taskWorkspace
    try {
        & $taskNode (Join-Path $taskNodeDirectory 'node_modules/npm/bin/npm-cli.js') ci --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed' }
    } finally { Pop-Location }
}
Write-Output "Source: $taskSource"
Write-Output "Runtime: $taskWorkspace"
Write-Output "Temporary files, caches and reports: $taskRuntime"
if ($Command.Count) {
    Push-Location $taskWorkspace
    try {
        & $Command[0] @($Command | Select-Object -Skip 1)
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    } finally { Pop-Location }
}
