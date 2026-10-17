import assert from 'node:assert/strict';
import { test } from 'node:test';
import { withOtpCleanup } from '../../../services/core-worker/src/otp-cleanup.ts';
test('PC01: failed journal or effects still run credential expiry, while cleanup failure cannot suppress the work attempt',async()=>{
  for (const [workFails,cleanupFails] of [[false,false],[true,false],[false,true],[true,true]]) {
    const calls:string[]=[],workError=new Error('JOURNAL_GAP'),cleanupError=new Error('CLEANUP_UNAVAILABLE');
    const run=()=>withOtpCleanup(async()=>{calls.push('work');if(workFails)throw workError;},
      async()=>{calls.push('cleanup');if(cleanupFails)throw cleanupError;});
    if(workFails&&cleanupFails) await assert.rejects(run,(error:unknown)=>error instanceof AggregateError&&
      error.errors[0]===workError&&error.errors[1]===cleanupError);
    else if(workFails||cleanupFails) await assert.rejects(run,error=>error===(workFails?workError:cleanupError));
    else await run();
    assert.deepEqual(calls,['work','cleanup']);
  }
});
