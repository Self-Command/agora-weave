param(
    [switch]$Prepare,
    [switch]$Install,
    [switch]$Up,
    [switch]$Status,
    [switch]$Logs,
    [switch]$Stop,
    [ValidateSet('dev', 'test')][string]$Environment = 'dev',
    [string[]]$Services = @('supabase', 'admin'),
    [switch]$Migrate,
    [ValidateRange(1, 600)][int]$TimeoutSeconds = 180,
    [ValidateRange(1, 1000)][int]$Tail = 40,
    [ValidateRange(1024, 65535)][int]$AdminPort = 3000,
    [ValidateRange(1024, 65535)][int]$MetroPort = 8081,
    [ValidateRange(1024, 65535)][int]$ApiPort = 4821,
    [Parameter(ValueFromRemainingArguments = $true)][string[]]$Command
)
$ErrorActionPreference = 'Stop'
$Services = @($Services | ForEach-Object { $_.Split(',') } | ForEach-Object { $_.Trim() } | Select-Object -Unique)
if (-not $Services.Count -or @($Services | Where-Object { $_ -notin @('supabase', 'api', 'admin', 'metro') }).Count) { throw 'Services must contain supabase, api, admin or metro (comma separated)' }
if (($Status -or $Logs -or $Stop) -and -not $PSBoundParameters.ContainsKey('Services')) { $Services = @('supabase', 'api', 'admin', 'metro') }
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
$env:AGORAWEAVE_LOCAL_ENVIRONMENT = $Environment
if ((& $taskNode --version) -ne $taskLock.node) { throw 'Pinned Node version differs' }
if ((& $taskNode (Join-Path $taskNodeDirectory 'node_modules/npm/bin/npm-cli.js') --version) -ne $taskLock.npm) { throw 'Pinned npm version differs' }
$taskWorkspace = Join-Path $taskRuntime 'workspace'
$taskActions = @(@(@{Name='up'; Value=$Up}, @{Name='status'; Value=$Status}, @{Name='logs'; Value=$Logs}, @{Name='stop'; Value=$Stop}) | Where-Object Value)
if (@($taskActions).Count -gt 1) { throw 'Choose one of -Up, -Status, -Logs, -Stop' }
if ($Migrate -and -not $Up) { throw '-Migrate requires -Up and explicitly selected supabase services' }
if ($taskActions.Count -and $Command.Count) { throw 'Use a service action or -Command in one invocation' }
# One shared runtime, including source sync and both dev/test process registries.
$taskOperationLock = $null
try {
try { $taskOperationLock = [IO.File]::Open((Join-Path $taskRuntime 'development-operation.lock'), 'OpenOrCreate', 'ReadWrite', 'None') }
catch { throw 'Another local development operation is using the shared runtime; retry after it finishes' }
if ($Prepare -or $Install -or $Up -or $Command.Count) {
    & $taskNode (Join-Path $taskSource 'tools/dev/sync-runtime.mjs') $taskSource $taskWorkspace
    if ($LASTEXITCODE -ne 0) { throw 'Runtime source sync failed' }
}
if (($Status -or $Logs -or $Stop) -and -not (Test-Path -LiteralPath $taskWorkspace)) { throw 'Runtime not prepared; run -Prepare first' }
if ($Install) {
    $taskDependencyCheck = "import {processInventory,ownedProcess} from './tools/dev/local-process.mjs'; import {existsSync,readFileSync} from 'node:fs'; for(const e of ['dev','test']) {const f='.agoraweave/local/'+e+'/development/state.json';if(existsSync(f)&&Object.values(JSON.parse(readFileSync(f)).processes||{}).some(p=>ownedProcess(p,processInventory())))throw new Error('Stop managed Node services before explicit dependency installation');}"
    Push-Location $taskWorkspace
    try {
        & $taskNode --input-type=module -e $taskDependencyCheck
        if ($LASTEXITCODE -ne 0) { throw 'Active development services prevent dependency replacement' }
        & $taskNode (Join-Path $taskNodeDirectory 'node_modules/npm/bin/npm-cli.js') ci --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed' }
        New-Item -ItemType Directory -Path (Join-Path $taskWorkspace '.agoraweave') -Force | Out-Null
        @{ lock = (Get-FileHash -LiteralPath (Join-Path $taskWorkspace 'package-lock.json') -Algorithm SHA256).Hash.ToLowerInvariant() } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $taskWorkspace '.agoraweave/dependencies.json')
    } finally { Pop-Location }
}
Write-Output "Source: $taskSource"
Write-Output "Runtime: $taskWorkspace"
Write-Output "Temporary files, caches and reports: $taskRuntime"
if ($taskActions.Count) {
    $taskServiceOptions = @{ action = $taskActions[0].Name; source = $taskSource; workspace = $taskWorkspace; environment = $Environment; services = @($Services); timeout = $TimeoutSeconds; lines = $Tail; migrate = [bool]$Migrate; adminPort = $AdminPort; metroPort = $MetroPort; apiPort = $ApiPort } | ConvertTo-Json -Compress
    & $taskNode --experimental-strip-types (Join-Path $taskSource 'tools/dev/local-services.mjs') $taskServiceOptions
    if ($LASTEXITCODE -ne 0) { throw 'Local development service operation failed; see the precise error above' }
}
if ($Command.Count) {
    Push-Location $taskWorkspace
    try {
        & $Command[0] @($Command | Select-Object -Skip 1)
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    } finally { Pop-Location }
}
} finally { if ($taskOperationLock) { $taskOperationLock.Dispose() } }
