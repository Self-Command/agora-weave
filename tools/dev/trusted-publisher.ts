import { compose,coreEnvironmentFile } from '../ci/core-database.ts';
import { readFileSync } from 'node:fs';

// Local runtime validation checks the existing dev Compose identity and private
// configuration digests. No credentials are emitted or copied into this script.
if (process.env.AGORAWEAVE_EXECUTION_SOURCE!=='local' || process.env.AGORAWEAVE_LOCAL_ENVIRONMENT!=='dev')
  throw new Error('Trusted publishing can only be provisioned in the existing local dev runtime');
const mode=process.argv[2];
if (!['--grant','--revoke'].includes(mode)) throw new Error('Select --grant or --revoke');
const configuration=readFileSync(coreEnvironmentFile(),'utf8');
const actor=configuration.match(/^CORE_DEV_TEST_ACCOUNT_ID=([a-f0-9-]{36})$/m)?.[1];
if (!actor || !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(actor) ||
    !/^CORE_DEV_TEST_LOGIN_ENABLED=true$/m.test(configuration)) throw new Error('Existing ordinary dev test account is not configured');
compose(['exec','-T','db','psql','-X','-qAt','-U','supabase_admin','-d','postgres','-v','ON_ERROR_STOP=1'],`BEGIN;
  SELECT pg_advisory_xact_lock(17013,1);
  DO $grant$ BEGIN
    IF NOT EXISTS(SELECT 1 FROM core.account a JOIN core.admission d ON d.account_id=a.id
      WHERE a.id='${actor}' AND a.status='active') OR EXISTS(SELECT 1 FROM core.admin_grant g
      WHERE g.account_id='${actor}' AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>clock_timestamp()))
      THEN RAISE EXCEPTION 'Configured account must be admitted and ordinary'; END IF;
  END $grant$;
  ${mode==='--grant'?`ALTER ROLE core_runtime IN DATABASE postgres SET agoraweave.local_dev_publishing='on';
  INSERT INTO core.dev_trusted_publisher(account_id,environment,reason,expires_at)
    VALUES('${actor}','dev','User-authorized local App development testing',clock_timestamp()+interval '30 days')
    ON CONFLICT(account_id,environment) DO UPDATE SET revoked_at=NULL,
      reason=EXCLUDED.reason,expires_at=EXCLUDED.expires_at;`:
    `UPDATE core.dev_trusted_publisher SET revoked_at=clock_timestamp() WHERE account_id='${actor}' AND environment='dev';`}
  INSERT INTO core.audit_event(actor,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES('${actor}','dev.trusted_publisher.${mode==='--grant'?'grant':'revoke'}','${actor}','dev','core',
      'User-authorized local App development testing','succeeded',gen_random_uuid());
  COMMIT;`);
console.log(JSON.stringify({state:'passed',environment:'local-dev',trusted_publisher:mode==='--grant'?'granted':'revoked'}));
