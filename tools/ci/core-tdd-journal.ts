import { writeFileSync } from 'node:fs';
import { readCoreTddSource } from './core-tdd-source.ts';

const root = 'core-tdd-output';
const source = await readCoreTddSource({ repository: process.env.GITHUB_REPOSITORY!, token: process.env.GH_TOKEN!,
  run_id: process.env.CORE_SOURCE_RUN_ID! }, root);
const observation = { ...source };
delete observation.streams;
delete observation.manifest;
writeFileSync(`${root}/observation.json`, JSON.stringify({ ...observation,
  journal_run_id: process.env.GITHUB_RUN_ID, read_at: new Date().toISOString() }, null, 2) + '\n');
