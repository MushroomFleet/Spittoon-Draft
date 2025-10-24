/**
 * Animation calculation utilities
 */

import { WAVE_WIDTH, CHARACTER_DELAY } from '../constants';

/**
 * Calculate which characters should be animating based on wave position
 */
export const getAnimatingIndices = (
  wavePosition: number,
  waveWidth: number = WAVE_WIDTH
): Set<number> => {
  const indices = new Set<number>();

  const startIndex = Math.max(0, wavePosition - waveWidth);
  const endIndex = wavePosition;

  for (let i = startIndex; i < endIndex; i++) {
    indices.add(i);
  }

  return indices;
};

/**
 * Calculate delay for a character based on its position in the wave
 */
export const calculateCharacterDelay = (
  characterIndex: number,
  wavePosition: number
): number => {
  const distanceFromWave = wavePosition - characterIndex;

  if (distanceFromWave <= 0) {
    return 0;
  }

  return Math.max(0, (WAVE_WIDTH - distanceFromWave) * CHARACTER_DELAY);
};

/**
 * Determine if a character should be visible based on progress
 */
export const shouldCharacterBeVisible = (
  index: number,
  progress: number,
  totalLength: number
): boolean => {
  const progressIndex = Math.floor((progress / 100) * totalLength);
  return index < progressIndex;
};

/**
 * Calculate wave progress based on text length and stream progress
 */
export const calculateWaveProgress = (
  streamProgress: number,
  textLength: number
): number => {
  return Math.floor((streamProgress / 100) * textLength);
};

/**
 * Create character array from text with proper handling
 */
export const textToCharacterArray = (text: string): string[] => {
  // Handle special characters and emojis properly
  return Array.from(text);
};

/**
 * Interpolate between source and target text
 */
export const interpolateText = (
  sourceText: string,
  targetText: string,
  progress: number
): string => {
  const charactersToShow = Math.floor((progress / 100) * targetText.length);
  return targetText.slice(0, charactersToShow) + sourceText.slice(charactersToShow);
};
