import { countGraphemes } from 'unicode-segmenter/grapheme';

export function normalizeText(value: string): string { return value.replace(/\r\n?/g, '\n'); }
export function countVisibleCharacters(value: string): number { return countGraphemes(normalizeText(value)); }
