import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const require = createRequire(import.meta.url);
const Ajv2020 = require('ajv/dist/2020').default;
const addFormats = require('ajv-formats');
const ajv = new Ajv2020({ allErrors: true, strict: true, coerceTypes: false, useDefaults: false, removeAdditional: false });
addFormats(ajv);
const schemas = Object.fromEntries(['code', 'visual'].map(kind => {
  const bytes = readFileSync(new URL(`./schemas/ai-${kind}-review.schema.json`, import.meta.url));
  return [kind, { validate: ajv.compile(JSON.parse(bytes.toString())), digest: createHash('sha256').update(bytes).digest('hex') }];
}));

/** The schema result describes record integrity; it never approves a semantic review or changes its payload. */
export function validateReviewSchema(kind: string, record: unknown): Record<string, unknown> {
  if (!['code', 'visual'].includes(kind)) return { state: 'blocked', reason_codes: ['unknown_review_schema_kind'] };
  const schema = schemas[kind];
  const valid = schema.validate(record);
  return { state: valid ? 'passed' : 'blocked', reason_codes: valid ? [] : ['review_schema_violation'],
    schema_digest: schema.digest, schema_validator: 'ajv-2020-12',
    violations: valid ? [] : schema.validate.errors?.map((error: { instancePath: string; keyword: string; schemaPath: string }) =>
      ({ instance_path: error.instancePath, keyword: error.keyword, schema_path: error.schemaPath })) };
}
