/** Expiring credentials remains independent of journal and business-effect health. */
export async function withOtpCleanup(work:()=>Promise<unknown>,cleanup:()=>Promise<unknown>):Promise<void> {
  const failures:unknown[]=[];
  try {await work();} catch(error) {failures.push(error);}
  try {await cleanup();} catch(error) {failures.push(error);}
  if (failures.length===1) throw failures[0];
  if (failures.length>1) throw new AggregateError(failures,'WORKER_UNAVAILABLE');
}
