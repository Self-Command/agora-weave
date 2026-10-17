import { sql,rows } from './runtime.ts';
import { createHash } from 'node:crypto';
const literal=(value:unknown)=>`'${JSON.stringify(value).replaceAll("'","''")}'::jsonb`;
type Layer={scope:string;values:Record<string,unknown>;[key:string]:unknown};
/** Synthetic bundles are created only by isolated test code, never as production policy. */
export function activateConfiguration(environment:string,prefix='foundation-fixture-v2',layers?:Layer[]) {
  if (!['dev','test'].includes(environment) || !/^[a-z0-9.-]+$/.test(prefix)) throw new Error('FIXTURE_ENVIRONMENT');
  const defaults=Object.fromEntries(rows('SELECT key,default_value FROM core.config_definition ORDER BY key').map(entry=>[String(entry.key),entry.default_value]));
  const scopes=structuredClone(layers || [{scope:'global',values:{}}]);
  const global=scopes.find(layer=>layer.scope==='global');
  if(global)global.values={...defaults,...global.values};else scopes.unshift({scope:'global',values:defaults});
  const consumers=['api','mobile','admin','share','sql','media','worker','ai','mcp','plugins'];
  const compat=Object.fromEntries(consumers.map(consumer=>[consumer,['0.0.0','fixture-v1']]));
  const version=prefix+'-'+createHash('sha256').update(JSON.stringify({scopes,compat})).digest('hex');
  sql(`INSERT INTO core.config_bundle(version,scoped_values,schema_version,compat,state,effective_at,preview_digest,consumers_ready)
    VALUES ('${version}',${literal(scopes)},1,${literal(compat)},'active',clock_timestamp(),repeat('f',64),ARRAY[${consumers.map(v=>`'${v}'`).join(',')}]) ON CONFLICT(version) DO NOTHING;
    INSERT INTO core.config_activation(environment,active_ptr) VALUES ('${environment}','${version}') ON CONFLICT(environment) DO UPDATE SET active_ptr=excluded.active_ptr;`);
}
