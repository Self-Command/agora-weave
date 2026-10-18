import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import SwaggerParser from '@apidevtools/swagger-parser';
import openapiTS, { astToString } from 'openapi-typescript';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const contracts = resolve(root, 'development/contracts');
const outputs = resolve(root, 'packages/contracts/src/generated');
const lockPath = resolve(contracts, 'contracts.lock.json');
const toolchain = JSON.parse(readFileSync(resolve(root, 'tools/api/toolchain.json'), 'utf8'));
const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
const normalized = text => text.replaceAll('\r\n', '\n');

function sourceDigests(directory = contracts, result = {}) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) sourceDigests(file, result);
    else if (/\.(yaml|yml|json)$/.test(entry.name) && file !== lockPath) {
      result[relative(root, file).replaceAll('\\', '/')] = digest(normalized(readFileSync(file, 'utf8')));
    }
  }
  return Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b, 'en')));
}

function pointer(document, reference) {
  if (!reference.startsWith('#/')) throw new Error('Unbundled schema reference: ' + reference);
  return reference.slice(2).split('/').reduce((value, part) => value[part.replaceAll('~1', '/').replaceAll('~0', '~')], document);
}
const dereference = (document, value) => value?.$ref ? dereference(document, pointer(document, value.$ref)) : value;
const escapePointer = value => value.replaceAll('~', '~0').replaceAll('/', '~1');

export function validateExamples(document, surface) {
  // AJV resolves OpenAPI's internal schema pointers, including recursive registered JSON values.
  const ajv = new Ajv({ strict: false, allErrors: true, validateFormats: true });
  addFormats(ajv);
  const schemaId = `urn:agoraweave:${surface}:contract`;
  ajv.addSchema(document, schemaId);
  let count = 0;
  const check = (schema, value, location) => {
    const validate = ajv.compile(schema);
    if (!validate(value)) throw new Error(`${surface} example ${location}: ${ajv.errorsText(validate.errors)}`);
    count++;
  };
  const visit = (node, path = '') => {
    if (!node || typeof node !== 'object') return;
    if (node.schema && typeof node.schema === 'object') {
      const schema = { $ref: schemaId + '#' + path + '/schema' };
      if (Object.hasOwn(node, 'example')) check(schema, node.example, path);
      for (const [name, example] of Object.entries(node.examples || {})) {
        const value = dereference(document, example);
        if (value && Object.hasOwn(value, 'value')) check(schema, value.value, path + '/examples/' + name);
      }
    }
    if (!Array.isArray(node) && node.type && Object.hasOwn(node, 'example')) {
      check({ $ref: schemaId + '#' + path }, node.example, path + '/example');
    }
    for (const [key, value] of Object.entries(node)) if (key !== 'example' && key !== 'examples') visit(value, path + '/' + escapePointer(key));
  };
  visit(document);
  return count;
}

async function prepare() {
  const prepared = [], operationIds = new Set();
  for (const [surface, config] of Object.entries(toolchain.surfaces)) {
    const file = resolve(contracts, config.input);
    await SwaggerParser.validate(file);
    const document = await SwaggerParser.bundle(file);
    if (document.openapi !== toolchain.openapi) throw new Error('Unexpected OpenAPI version: ' + surface);
    let operations = 0;
    for (const [path, item] of Object.entries(document.paths)) for (const method of methods) {
      const operation = item[method];
      if (!operation) continue;
      if (!operation.operationId || operationIds.has(operation.operationId)) throw new Error('Missing or duplicate operationId: ' + path);
      operationIds.add(operation.operationId);
      if (!['implemented', 'planned'].includes(operation['x-implementation'])) throw new Error('Unclassified implementation: ' + operation.operationId);
      if (operation['x-implementation'] === 'implemented' && (!operation['x-source'] || !existsSync(resolve(root, operation['x-source'])))) {
        throw new Error('Missing implemented source: ' + operation.operationId);
      }
      operations++;
    }
    const examples = validateExamples(document, surface);
    const types = astToString(await openapiTS(pathToFileURL(file), { alphabetize: true }));
    prepared.push({ surface, config, document, types, operations, examples });
  }
  return prepared;
}

async function generate(checkOnly = false) {
  const prepared = await prepare();
  const lock = { version: 1, contracts: sourceDigests(), generated: {} };
  if (!checkOnly) mkdirSync(outputs, { recursive: true });
  for (const item of prepared) {
    const file = resolve(outputs, item.config.output);
    lock.generated[relative(root, file).replaceAll('\\', '/')] = digest(normalized(item.types));
    if (checkOnly) {
      if (!existsSync(file) || normalized(readFileSync(file, 'utf8')) !== normalized(item.types)) throw new Error('Stale generated types; run npm run api:generate: ' + item.surface);
    } else writeFileSync(file, item.types);
  }
  if (checkOnly) {
    if (!existsSync(lockPath) || normalized(readFileSync(lockPath, 'utf8')) !== json(lock)) throw new Error('Contract input/output lock changed; review and run npm run api:generate');
  } else writeFileSync(lockPath, json(lock));
  console.log(json({ state: 'passed', mode: checkOnly ? 'check' : 'generate', surfaces: prepared.map(({ surface, operations, examples }) => ({ surface, operations, examples })) }));
  return prepared;
}

function run(command, args, options = {}) {
  return new Promise((accept, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: 'inherit', windowsHide: true, ...options });
    child.once('error', reject);
    child.once('exit', (code, signal) => code === 0 ? accept() : reject(new Error(`${command} exited ${code ?? signal}`)));
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => child.kill(signal));
  });
}

async function verify(values) {
  if (!values.surface || !values['base-url']) throw new Error('verify requires --surface and --base-url');
  if (!['dev', 'test'].includes(values.environment)) throw new Error('Only dev/test providers are supported');
  const base = new URL(values['base-url']);
  const localHost = /^(localhost|127\.0\.0\.1|\[::1\]|host\.docker\.internal|api-gw|functions)$/.test(base.hostname);
  if (!localHost || !['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new Error('Use an isolated local provider URL without credentials/query/fragment');
  const item = (await generate(true)).find(item => item.surface === values.surface);
  const selected = values.operations ? new Set(values.operations.split(',').filter(Boolean)) : null;
  const document = structuredClone(item.document);
  document.paths = {};
  const operations = [];
  for (const [path, original] of Object.entries(item.document.paths)) for (const method of methods) {
    const operation = original[method];
    if (!operation || operation['x-implementation'] !== 'implemented' || selected && !selected.has(operation.operationId)) continue;
    const readOnly = ['get', 'head'].includes(method) && operation['x-verification'] === 'read-only';
    const jsonSuccess = Object.entries(operation.responses).some(([status, response]) => /^2\d\d$/.test(status) && dereference(item.document, response)?.content?.['application/json']);
    if (!values['allow-mutations'] && (!readOnly || !jsonSuccess)) {
      if (selected) throw new Error('Explicitly selected non-read-only JSON operation requires --allow-mutations with --environment test: ' + operation.operationId);
      continue;
    }
    if (values['allow-mutations'] && (values.environment !== 'test' || !selected)) throw new Error('Mutation checks require --environment test and explicit --operations with isolated fixtures');
    document.paths[path] ??= Object.fromEntries(Object.entries(original).filter(([key]) => !methods.includes(key)));
    document.paths[path][method] = operation;
    operations.push(operation.operationId);
  }
  if (!operations.length || selected && [...selected].some(id => !operations.includes(id))) throw new Error('No matching implemented operations; planned endpoints are never live-tested');
  const reportRoot = process.platform === 'win32'
    ? resolve(JSON.parse(readFileSync(resolve(root, 'infra/development/policy.json'), 'utf8')).runtime_root, 'reports/api-contracts')
    : resolve(root, 'check-output/api');
  const directory = resolve(values.output || reportRoot, values.surface + '-' + Date.now());
  mkdirSync(directory, { recursive: true });
  // Bundle all references: this is a generated selection of the same contract, not a second specification.
  writeFileSync(resolve(directory, 'provider.json'), json(document));
  writeFileSync(resolve(directory, 'specmatic.json'), json({ version: 2, disableTelemetry: true }));
  const args = ['run', '--rm', ...(values.network ? ['--network', values.network] : []),
    '--mount', `type=bind,source=${directory},target=/contracts`, '-w', '/contracts',
    toolchain.specmatic.image, 'test', '/contracts/provider.json', '--config=/contracts/specmatic.json',
    '--testBaseURL=' + base.toString().replace(/\/$/, ''), '--timeout=10', '--junitReportDir=/contracts/junit',
    ...(values.filter ? ['--filter=' + values.filter] : [])];
  const report = { provider: values.provider, environment: values.environment, surface: values.surface,
    contract_version: item.document.info.version, contract_digest: digest(json(item.document)), operations,
    filter: values.filter || null, tool: toolchain.specmatic, state: 'running' };
  writeFileSync(resolve(directory, 'result.json'), json(report));
  try { await run('docker', args); report.state = 'passed'; }
  catch (error) { report.state = 'failed'; throw error; }
  finally { writeFileSync(resolve(directory, 'result.json'), json(report)); console.log('Contract result: ' + directory); }
}

async function main() {
  const { positionals, values } = parseArgs({ allowPositionals: true, options: {
    surface: { type: 'string' }, 'base-url': { type: 'string' }, operations: { type: 'string' },
    environment: { type: 'string', default: 'dev' }, provider: { type: 'string', default: 'real' },
    network: { type: 'string' }, filter: { type: 'string' }, output: { type: 'string' },
    'allow-mutations': { type: 'boolean', default: false }, port: { type: 'string' }
  } });
  const command = positionals[0];
  if (values.surface && !toolchain.surfaces[values.surface]) throw new Error('Unknown API surface');
  if (!['real', 'mock'].includes(values.provider)) throw new Error('provider must be real or mock');
  if (command === 'generate' || command === 'check') return generate(command === 'check');
  if (command === 'verify') return verify(values);
  if (command === 'mock') {
    const config = toolchain.surfaces[values.surface];
    if (!config) throw new Error('mock requires --surface app|admin|core-admin');
    const port = Number(values.port || config.port);
    if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid mock port');
    const require = createRequire(import.meta.url);
    const binary = require.resolve('@stoplight/prism-cli/dist/index.js');
    console.log(`Prism ${values.surface}: local mock on 127.0.0.1:${port}; no database or business integration claim`);
    return run(process.execPath, [binary, 'mock', resolve(contracts, config.input), '--host', '127.0.0.1', '--port', String(port)]);
  }
  throw new Error('Use generate, check, mock or verify');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
