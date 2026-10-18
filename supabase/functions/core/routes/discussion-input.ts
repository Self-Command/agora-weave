const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

export type TextCommentCommand = {
  operation_id: string;
  body: string;
  media_refs: string[];
};

/** First release supports ordinary top-level text comments. */
export function textCommentCommand(input: Record<string, unknown>): TextCommentCommand | null {
  if (Object.keys(input).some(key => !['operation_id', 'body', 'media_refs', 'parent_comment_id', 'reply_to_id'].includes(key)) ||
      typeof input.operation_id !== 'string' || !uuid.test(input.operation_id) ||
      typeof input.body !== 'string' || !input.body.length || input.body.includes('\u0000') ||
      input.parent_comment_id !== undefined || input.reply_to_id !== undefined ||
      input.media_refs !== undefined && (!Array.isArray(input.media_refs) || input.media_refs.length)) return null;
  return { operation_id: input.operation_id.toLowerCase(), body: input.body.replace(/\r\n?/g, '\n'), media_refs: [] };
}

export function likeOperationCommand(input: Record<string, unknown>): { operation_id: string } | null {
  if (Object.keys(input).length !== 1 || typeof input.operation_id !== 'string' || !uuid.test(input.operation_id)) return null;
  return { operation_id: input.operation_id.toLowerCase() };
}
