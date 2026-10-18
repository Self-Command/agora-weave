const MAX_QR_BYTES = 768 * 1024;

/** Accept official inert geometry as a local image, never as executable markup. */
export function totpQrSource(value: string): string | null {
  if (typeof value !== 'string' || value.length > MAX_QR_BYTES * 3 + 64) return null;
  try {
    let raw = value;
    if (raw.startsWith('data:image/svg+xml;base64,')) raw = atob(raw.slice('data:image/svg+xml;base64,'.length));
    else if (raw.startsWith('data:image/svg+xml,')) raw = decodeURIComponent(raw.slice('data:image/svg+xml,'.length));
    if (new TextEncoder().encode(raw).byteLength > MAX_QR_BYTES) return null;
    const svg = raw.replace(/^\s*<\?xml\s+version="1\.0"(?:\s+encoding="UTF-8")?\s*\?>/, '')
      .replace(/<!--[\s\S]*?-->/g, '').trim();
    if (!/^<svg\s[^>]*>[\s\S]*<\/svg>$/.test(svg) || /[&]|<!|<\?/.test(svg) || svg.includes(String.fromCharCode(0))) return null;
    let geometry = false;
    for (const tag of svg.matchAll(/<([^>]+)>/g)) {
      const match = /^(\/?)(svg|rect|path|g)([\s\S]*?)(\/?)$/.exec(tag[1]);
      if (!match || match[1] && match[3].trim()) return null;
      if (match[2] === 'rect' || match[2] === 'path') geometry = true;
      let rest = match[3];
      for (const attribute of match[3].matchAll(/\s+([A-Za-z_:][\w:.-]*)="([^"]*)"/g)) {
        const [, name, content] = attribute;
        if (/url\s*\(/i.test(content)) return null;
        if (!['xmlns', 'xmlns:xlink', 'width', 'height', 'viewBox', 'x', 'y', 'fill', 'stroke', 'style', 'd', 'transform'].includes(name)) return null;
        if (name === 'xmlns' && content !== 'http://www.w3.org/2000/svg' || name === 'xmlns:xlink' && content !== 'http://www.w3.org/1999/xlink') return null;
        if (name === 'style' && !/^fill:(?:black|white);stroke:none$/.test(content)) return null;
        if (!name.startsWith('xmlns') && name !== 'style' && !/^[A-Za-z0-9#.,()\s+-]*$/.test(content)) return null;
        rest = rest.replace(attribute[0], '');
      }
      if (rest.trim()) return null;
    }
    if (!geometry || svg.replace(/<[^>]+>/g, '').trim()) return null;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  } catch { return null; }
}
