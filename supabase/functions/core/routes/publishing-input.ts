const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const allowedFields = new Set(['operation_id', 'type', 'body', 'tags', 'mentions', 'media_refs',
  'poll', 'source_id', 'visibility', 'reply_scope', 'indexing_mode']);

export type TextPostCommand = {
  operation_id: string;
  type: 'text';
  body: string;
  tags: string[];
  mentions: string[];
  media_refs: string[];
  visibility: 'public' | 'followers' | 'self';
  reply_scope: 'all_readers';
  indexing_mode: 'inherit';
};
export type ImagePostCommand = Omit<TextPostCommand,'type'> & { type: 'images' };

/** Static images are individual validated media IDs, never raw client URLs. */
export function imagePostCommand(input: Record<string, unknown>): ImagePostCommand | null {
  if (Object.keys(input).some(key => !allowedFields.has(key)) ||
      typeof input.operation_id !== 'string' || !uuid.test(input.operation_id) ||
      input.type !== 'images' || typeof input.body !== 'string' || input.body.includes('\u0000') ||
      typeof input.visibility !== 'string' || !['public','followers','self'].includes(input.visibility) ||
      input.reply_scope !== 'all_readers' ||
      input.indexing_mode !== undefined && input.indexing_mode !== 'inherit' ||
      input.source_id !== undefined || input.poll !== undefined ||
      input.tags !== undefined && (!Array.isArray(input.tags) || input.tags.length>0) ||
      input.mentions !== undefined && (!Array.isArray(input.mentions) || input.mentions.length>0)) return null;
  const refs=input.media_refs;
  if (!Array.isArray(refs) || refs.length<1 || refs.length>9 ||
      refs.some(ref=>typeof ref!=='string' || !uuid.test(ref)) ||
      new Set(refs.map(ref=>(ref as string).toLowerCase())).size!==refs.length) return null;
  return { operation_id:input.operation_id.toLowerCase(),type:'images',body:input.body.replace(/\r\n?/g,'\n'),
    tags:[],mentions:[],media_refs:refs.map(ref=>(ref as string).toLowerCase()),
    visibility:input.visibility as ImagePostCommand['visibility'],reply_scope:'all_readers',indexing_mode:'inherit' };
}

/** Narrow first slice; future policy backed fields must not silently publish. */
export function textPostCommand(input: Record<string, unknown>): TextPostCommand | null {
  if (Object.keys(input).some(key => !allowedFields.has(key)) ||
      typeof input.operation_id !== 'string' || !uuid.test(input.operation_id) ||
      input.type !== 'text' || typeof input.body !== 'string' ||
      input.body.length === 0 || input.body.includes('\u0000') ||
      typeof input.visibility !== 'string' || !['public', 'followers', 'self'].includes(input.visibility) ||
      input.reply_scope !== 'all_readers' ||
      input.indexing_mode !== undefined && input.indexing_mode !== 'inherit' ||
      input.source_id !== undefined || input.poll !== undefined) return null;

  const tags = input.tags === undefined ? [] : input.tags;
  const mentions = input.mentions === undefined ? [] : input.mentions;
  const media = input.media_refs === undefined ? [] : input.media_refs;
  if (!Array.isArray(tags) || tags.length || !Array.isArray(mentions) || mentions.length ||
      !Array.isArray(media) || media.length) return null;

  const body = input.body.replace(/\r\n?/g, '\n');
  return { operation_id: input.operation_id.toLowerCase(), type: 'text', body,
    tags: [], mentions: [], media_refs: [], visibility: input.visibility as TextPostCommand['visibility'],
    reply_scope: 'all_readers', indexing_mode: 'inherit' };
}
