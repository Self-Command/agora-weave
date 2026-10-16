import Ajv from 'ajv';

type Fields = Record<string, unknown>;
const object = (value: unknown): value is Fields => value !== null && typeof value === 'object' && !Array.isArray(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string');
const nonempty = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 2048;
const blocked = () => ({ state: 'blocked', code: 'CONFIG_UNAVAILABLE' });
const ajv = new Ajv({ strict: true, allErrors: false, coerceTypes: false, useDefaults: false, removeAdditional: false });

/** Resolve one complete immutable bundle; no invalid branch returns partial values. */
export function resolveConfiguration(input: unknown): Record<string, unknown> {
  if (!object(input) || !['dev','test','production'].includes(String(input.environment)) || !nonempty(input.owner) ||
      !nonempty(input.consumer) || !nonempty(input.client_release) || !strings(input.permissions) || !strings(input.groups) ||
      !Array.isArray(input.definitions) || !input.definitions.length || !object(input.bundle)) return blocked();
  const bundle = input.bundle;
  if (!nonempty(bundle.version) || bundle.schema_version !== 1 || bundle.state !== 'active' || !object(bundle.compat_matrix) ||
      !strings(bundle.compat_matrix[input.consumer]) || !bundle.compat_matrix[input.consumer].includes(input.client_release) ||
      !Array.isArray(bundle.scope_values) || !strings(bundle.consumers_ready)) return blocked();
  try {
    const definitions = new Map<string, Fields>();
    const selected = new Map<string, unknown>();
    const validators = new Map<string, ReturnType<typeof ajv.compile>>();
    const required = ['key','owner','description','schema','default_value','status','scopes','dependencies','conflicts',
      'read_permission','write_permission','sensitive','effect_mode','consumer_ids','existing_object_policy','validation_refs'];
    for (const definition of input.definitions) {
      if (!object(definition) || required.some(key => !Object.hasOwn(definition,key)) || !nonempty(definition.key) ||
          !/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(definition.key) || definitions.has(definition.key) ||
          !nonempty(definition.owner) || !nonempty(definition.description) || !object(definition.schema) ||
          !['confirmed','engineering','provisional'].includes(String(definition.status)) || !strings(definition.scopes) ||
          !definition.scopes.length || definition.scopes.some(scope => !['global','environment','module','plugin','user_group'].includes(scope)) ||
          !strings(definition.dependencies) || !strings(definition.conflicts) || !nonempty(definition.read_permission) ||
          !nonempty(definition.write_permission) || typeof definition.sensitive !== 'boolean' ||
          !['immediate','reload'].includes(String(definition.effect_mode)) || !strings(definition.consumer_ids) ||
          !definition.consumer_ids.length || !nonempty(definition.existing_object_policy) || !strings(definition.validation_refs) ||
          !definition.validation_refs.length) return blocked();
      const validate = ajv.compile(definition.schema);
      if (!validate(definition.default_value)) return blocked();
      if (definition.effect_mode === 'reload' && definition.consumer_ids.some(consumer => !bundle.consumers_ready.includes(consumer))) return blocked();
      definitions.set(definition.key,definition); validators.set(definition.key,validate);
      selected.set(definition.key,definition.default_value);
    }
    const ranks = { global: 0, environment: 1, module: 2, plugin: 2, user_group: 3 };
    const layers = new Map<string, { rank: number; priority: number; value: unknown }>();
    for (const layer of bundle.scope_values) {
      if (!object(layer) || typeof layer.scope !== 'string' || !Object.hasOwn(ranks,layer.scope) || !object(layer.values)) return blocked();
      const rank = ranks[layer.scope as keyof typeof ranks];
      if (rank > 0 && !nonempty(layer.environment) || rank > 1 && !nonempty(layer.owner) ||
          rank === 3 && (!nonempty(layer.group) || !Number.isSafeInteger(layer.priority))) return blocked();
      const applicable = (rank === 0 || layer.environment === input.environment) &&
        (rank < 2 || layer.owner === input.owner) && (rank < 3 || input.groups.includes(layer.group as string));
      for (const [key,value] of Object.entries(layer.values)) {
        const definition = definitions.get(key);
        if (!definition || !(definition.scopes as string[]).includes(layer.scope) || !validators.get(key)!(value)) return blocked();
        if (!applicable) continue;
        const priority = rank === 3 ? Number(layer.priority) : 0;
        const previous = layers.get(key);
        if (previous?.rank === rank && previous.priority === priority && JSON.stringify(previous.value) !== JSON.stringify(value)) return blocked();
        if (!previous || rank > previous.rank || rank === previous.rank && priority > previous.priority) {
          layers.set(key,{ rank,priority,value }); selected.set(key,value);
        }
      }
    }
    const values: Fields = {};
    for (const [key,definition] of definitions) {
      if ((definition.dependencies as string[]).some(dependency => !definitions.has(dependency)) ||
          (definition.conflicts as string[]).some(conflict => layers.has(conflict) && layers.has(key))) return blocked();
      if (definition.sensitive || !(definition.consumer_ids as string[]).includes(input.consumer) ||
          !input.permissions.includes(definition.read_permission as string)) continue;
      values[key] = structuredClone(selected.get(key));
    }
    return { state: 'resolved', version: bundle.version, values };
  } catch { return blocked(); }
}
