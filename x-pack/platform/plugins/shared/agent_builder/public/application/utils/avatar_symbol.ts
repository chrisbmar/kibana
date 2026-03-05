/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

const isEmoji = (str: string): boolean =>
  /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(str);

const getGraphemes = (str: string): string[] => {
  if (typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return [...segmenter.segment(str)].map((s) => s.segment);
  }
  return str.split('');
};

/**
 * Validates an avatar symbol value.
 * Allows: 1 emoji, 1 letter, or 2 letters.
 * Disallows: 2+ emojis, emoji + letter combinations, 3+ characters.
 */
export const isValidAvatarSymbol = (value: string): boolean => {
  const graphemes = getGraphemes(value);
  if (graphemes.length === 0) return true;
  if (graphemes.length === 1) return true;
  if (graphemes.length === 2) return !isEmoji(graphemes[0]);
  return false;
};

/**
 * Truncates an avatar symbol value to valid length.
 * If first character is emoji, keeps only that emoji.
 * Otherwise, keeps up to 2 characters.
 */
export const truncateAvatarSymbol = (value: string): string => {
  const graphemes = getGraphemes(value);
  if (graphemes.length <= 1) return value;
  if (isEmoji(graphemes[0])) return graphemes[0];
  return graphemes.slice(0, 2).join('');
};
