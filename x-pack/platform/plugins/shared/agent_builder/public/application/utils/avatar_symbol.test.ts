/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { isValidAvatarSymbol, truncateAvatarSymbol } from './avatar_symbol';

describe('isValidAvatarSymbol', () => {
  it('allows empty string', () => {
    expect(isValidAvatarSymbol('')).toBe(true);
  });

  it('allows single letter', () => {
    expect(isValidAvatarSymbol('A')).toBe(true);
    expect(isValidAvatarSymbol('z')).toBe(true);
  });

  it('allows two letters', () => {
    expect(isValidAvatarSymbol('AB')).toBe(true);
    expect(isValidAvatarSymbol('xy')).toBe(true);
  });

  it('allows single emoji', () => {
    expect(isValidAvatarSymbol('😀')).toBe(true);
    expect(isValidAvatarSymbol('🎉')).toBe(true);
  });

  it('allows single flag emoji (multi-codepoint)', () => {
    expect(isValidAvatarSymbol('🇫🇷')).toBe(true);
    expect(isValidAvatarSymbol('🇺🇸')).toBe(true);
  });

  it('allows single complex emoji sequence', () => {
    expect(isValidAvatarSymbol('👨‍👩‍👧')).toBe(true);
    expect(isValidAvatarSymbol('🕵🏻‍♂️')).toBe(true);
  });

  it('rejects two emojis', () => {
    expect(isValidAvatarSymbol('😀😀')).toBe(false);
    expect(isValidAvatarSymbol('🇫🇷🇺🇸')).toBe(false);
  });

  it('rejects emoji followed by letter', () => {
    expect(isValidAvatarSymbol('😀A')).toBe(false);
    expect(isValidAvatarSymbol('🇫🇷x')).toBe(false);
  });

  it('rejects three or more letters', () => {
    expect(isValidAvatarSymbol('ABC')).toBe(false);
    expect(isValidAvatarSymbol('test')).toBe(false);
  });
});

describe('truncateAvatarSymbol', () => {
  it('returns empty string unchanged', () => {
    expect(truncateAvatarSymbol('')).toBe('');
  });

  it('returns single letter unchanged', () => {
    expect(truncateAvatarSymbol('A')).toBe('A');
  });

  it('returns two letters unchanged', () => {
    expect(truncateAvatarSymbol('AB')).toBe('AB');
  });

  it('truncates three letters to two', () => {
    expect(truncateAvatarSymbol('ABC')).toBe('AB');
    expect(truncateAvatarSymbol('test')).toBe('te');
  });

  it('returns single emoji unchanged', () => {
    expect(truncateAvatarSymbol('😀')).toBe('😀');
    expect(truncateAvatarSymbol('🇫🇷')).toBe('🇫🇷');
    expect(truncateAvatarSymbol('👨‍👩‍👧')).toBe('👨‍👩‍👧');
  });

  it('truncates two emojis to one', () => {
    expect(truncateAvatarSymbol('😀😀')).toBe('😀');
    expect(truncateAvatarSymbol('🇫🇷🇺🇸')).toBe('🇫🇷');
  });

  it('truncates emoji followed by letter to just emoji', () => {
    expect(truncateAvatarSymbol('😀A')).toBe('😀');
    expect(truncateAvatarSymbol('🇫🇷x')).toBe('🇫🇷');
  });

  it('allows letter followed by emoji (truncates to 2 graphemes)', () => {
    expect(truncateAvatarSymbol('A😀')).toBe('A😀');
  });
});
