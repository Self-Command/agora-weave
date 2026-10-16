import { verify } from './governance-sync.mjs';
verify(process.argv[2] || process.cwd());
