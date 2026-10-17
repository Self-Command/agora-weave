import { spawn, execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { pathToFileURL, fileURLToPath } from 'node:url';

export const quotePowerShell = value => "'" + String(value).replaceAll("'", "''") + "'";
export function powershell(script, capture = true) {
  return execFileSync('pwsh', ['-NoLogo', '-NoProfile', '-NonInteractive', '-EncodedCommand',
    Buffer.from("$ErrorActionPreference='Stop'; " + script, 'utf16le').toString('base64')],
  { encoding: 'utf8', windowsHide: true, stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'ignore' })?.trim();
}
export function processInventory() {
  if (process.platform !== 'win32') throw new Error('Managed development processes require Windows PowerShell');
  const result = powershell('ConvertTo-Json -Compress -InputObject @(Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,CreationDate,CommandLine)');
  return JSON.parse(result || '[]');
}
export function ownedProcess(entry, inventory = processInventory()) {
  return entry && inventory.find(item => item.ProcessId === entry.pid && item.CreationDate === entry.creation &&
    item.CommandLine?.includes(entry.config) && item.CommandLine?.includes('local-process.mjs'));
}
export function descendants(pid, inventory) {
  const result = new Set([pid]);
  for (let previous = -1; previous !== result.size;) {
    previous = result.size;
    for (const item of inventory) if (result.has(item.ParentProcessId)) result.add(item.ProcessId);
  }
  return result;
}
export function startProcess(configPath, stdout, stderr) {
  // File paths are arguments to Node; the encoded PowerShell command prevents shell interpolation.
  const args = ['--experimental-strip-types', fileURLToPath(import.meta.url), configPath]
    .map(value => '"' + value.replaceAll('"', '\\"') + '"').join(' ');
  // No inherited capture pipes: a long-lived Windows child can otherwise keep execFileSync waiting after PowerShell exits.
  const pidFile = configPath + '.pid';
  powershell(`$p=Start-Process -FilePath ${quotePowerShell(process.execPath)} -ArgumentList ${quotePowerShell(args)} -WindowStyle Hidden -RedirectStandardOutput ${quotePowerShell(stdout)} -RedirectStandardError ${quotePowerShell(stderr)} -PassThru; $p.Id | Set-Content -LiteralPath ${quotePowerShell(pidFile)}`, false);
  const pid = Number(readFileSync(pidFile, 'utf8').trim());
  const actual = processInventory().find(item => item.ProcessId === pid);
  if (!actual) throw new Error('Development process exited before ownership could be recorded; inspect private logs');
  return { pid, creation: actual.CreationDate, config: configPath, stdout, stderr };
}
export function stopProcess(entry) {
  if (!ownedProcess(entry)) return false;
  // taskkill only receives a verified runner PID and includes its own npm/Next/Expo children.
  execFileSync('taskkill', ['/PID', String(entry.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
  return true;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const file = process.argv[2];
  if (!file || !existsSync(file)) throw new Error('Private development process configuration required');
  const config = JSON.parse(readFileSync(file, 'utf8'));
  const child = spawn(config.executable, config.args, { cwd: config.cwd, env: { ...process.env, ...config.env },
    stdio: 'inherit', windowsHide: true });
  child.on('error', error => { process.stderr.write(error.message + '\n'); process.exitCode = 1; });
  child.on('exit', code => { process.exitCode = code ?? 1; });
}
