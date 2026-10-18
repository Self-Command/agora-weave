/** Bounded JPEG/PNG structural sniffing of fetched bytes. */
export function imageMime(bytes: Uint8Array): 'image/png' | 'image/jpeg' | null {
  if (bytes.length >= 45 && [137,80,78,71,13,10,26,10].every((value,index)=>bytes[index]===value)) {
    const view = new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
    let offset=8, ihdr=false, idat=false, end=false;
    while (offset+12<=bytes.length) {
      const length=view.getUint32(offset), finish=offset+12+length;
      if (length>10_000_000 || finish>bytes.length) return null;
      const name=String.fromCharCode(...bytes.slice(offset+4,offset+8));
      let crc=0xffffffff;
      for (let index=offset+4;index<offset+8+length;index++) {
        crc^=bytes[index];
        for (let bit=0;bit<8;bit++) crc=(crc>>>1)^((crc&1)?0xedb88320:0);
      }
      if ((crc^0xffffffff)>>>0 !== view.getUint32(offset+8+length)) return null;
      if (!ihdr && (name!=='IHDR' || length!==13)) return null;
      if (name==='IHDR') {
        if (ihdr || view.getUint32(offset+8)<1 || view.getUint32(offset+8)>8192 ||
            view.getUint32(offset+12)<1 || view.getUint32(offset+12)>8192 ||
            ![0,2,3,4,6].includes(bytes[offset+17]) || bytes[offset+18]!==0 || bytes[offset+19]!==0 || bytes[offset+20]>1)
          return null;
        ihdr=true;
      } else if (name==='IDAT') idat=true;
      else if (name==='IEND') { if (length!==0 || finish!==bytes.length || !idat) return null; end=true; }
      else if (name[0]===name[0].toUpperCase() && name!=='PLTE') return null;
      offset=finish;
      if (end) break;
    }
    return ihdr && idat && end ? 'image/png' : null;
  }
  if (bytes.length>=16 && bytes[0]===0xff && bytes[1]===0xd8) {
    let offset=2, frame=false, scan=false, entropy=false;
    while (offset<bytes.length) {
      if (entropy) {
        if (bytes[offset++]!==0xff) continue;
        while (bytes[offset]===0xff) offset++;
        const marker=bytes[offset];
        if (marker===0x00 || marker>=0xd0 && marker<=0xd7) { offset++; continue; }
        offset--;
        entropy=false;
        continue;
      }
      if (bytes[offset++]!==0xff) return null;
      while (bytes[offset]===0xff) offset++;
      const marker=bytes[offset++];
      if (marker===0xd9) return frame && scan && offset===bytes.length ? 'image/jpeg' : null;
      if (marker===0xd8 || marker===0x00 || marker>=0xd0 && marker<=0xd7 || offset+2>bytes.length) return null;
      const length=bytes[offset]*256+bytes[offset+1];
      if (length<2 || offset+length>bytes.length) return null;
      if ([0xc0,0xc1,0xc2].includes(marker)) {
        if (length<8) return null;
        const height=bytes[offset+3]*256+bytes[offset+4], width=bytes[offset+5]*256+bytes[offset+6];
        if (!height || !width || height>8192 || width>8192) return null;
        frame=true;
      }
      if (marker===0xda) {
        if (!frame || length<6) return null;
        scan=true; entropy=true;
      }
      offset+=length;
    }
  }
  return null;
}
