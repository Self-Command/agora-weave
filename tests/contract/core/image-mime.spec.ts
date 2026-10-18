import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { imageMime } from '../../../supabase/functions/core/routes/image-mime.ts';

const crc = (bytes: Buffer) => {
  let value=0xffffffff;
  for (const byte of bytes) {
    value^=byte;
    for (let index=0;index<8;index++) value=(value>>>1)^((value&1)?0xedb88320:0);
  }
  return (value^0xffffffff)>>>0;
};
const pngChunk=(name:string,data:Buffer) => {
  const type=Buffer.from(name),length=Buffer.alloc(4),sum=Buffer.alloc(4);
  length.writeUInt32BE(data.length);sum.writeUInt32BE(crc(Buffer.concat([type,data])));
  return Buffer.concat([length,type,data,sum]);
};
const png=() => {
  const header=Buffer.from('89504e470d0a1a0a','hex');
  const ihdr=Buffer.from('00000001000000010806000000','hex');
  return Buffer.concat([header,pngChunk('IHDR',ihdr),pngChunk('IDAT',Buffer.from([1,2,3])),pngChunk('IEND',Buffer.alloc(0))]);
};

test('image signatures are checked against complete structure and not claimed MIME', () => {
  const valid=png();
  assert.equal(imageMime(valid),'image/png');
  assert.equal(imageMime(valid.subarray(0,valid.length-1)),null);
  const changed=Buffer.from(valid);changed[changed.length-10]^=1;
  assert.equal(imageMime(changed),null);
  assert.equal(imageMime(Buffer.from('474946383961','hex')),null);
  assert.equal(imageMime(Buffer.from('ffd8ffe000021122ffd9','hex')),null);
  assert.equal(createHash('sha256').update(valid).digest('hex').length,64);
});
