/**
 * WaveAnimator - Orchestrates character-by-character wave animation
 */

import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AnimatedCharacter } from './AnimatedCharacter';
import {
  getAnimatingIndices,
  calculateCharacterDelay,
  textToCharacterArray,
  calculateWaveProgress,
} from '../../utils/animationHelpers';
import type { WaveState } from '../../types';

export interface WaveAnimatorProps {
  /** Original source text */
  sourceText: string;
  /** Target transformed text */
  targetText: string;
  /** Stream progress (0-100) */
  progress: number;
  /** Whether transformation is complete */
  isComplete: boolean;
  /** Wave state configuration */
  waveState?: WaveState;
  /** Custom class name */
  className?: string;
}

export const WaveAnimator: React.FC<WaveAnimatorProps> = ({
  sourceText,
  targetText,
  progress,
  isComplete,
  waveState,
  className = '',
}) => {
  // Current display text
  const [displayText, setDisplayText] = useState(sourceText);

  // Calculate wave position based on progress
  const wavePosition = useMemo(() => {
    if (isComplete) return targetText.length;
    return calculateWaveProgress(progress, targetText.length);
  }, [progress, targetText.length, isComplete]);

  // Get indices of characters currently animating
  const animatingIndices = useMemo(() => {
    if (isComplete) return new Set<number>();
    return getAnimatingIndices(wavePosition, waveState?.width);
  }, [wavePosition, waveState?.width, isComplete]);

  // Update display text based on progress
  useEffect(() => {
    if (isComplete) {
      setDisplayText(targetText);
      return;
    }

    // Show transformed text up to wave position, original text after
    const newText = targetText.slice(0, wavePosition) + sourceText.slice(wavePosition);

    setDisplayText(newText);
  }, [wavePosition, sourceText, targetText, isComplete]);

  // Convert text to character array
  const characters = useMemo(() => {
    return textToCharacterArray(displayText);
  }, [displayText]);

  return (
    <div
      className={`font-mono text-sm leading-relaxed ${className}`}
      style={{ wordBreak: 'break-word' }}
    >
      <AnimatePresence mode="popLayout">
        {characters.map((char, index) => {
          const isAnimating = animatingIndices.has(index);
          const delay = calculateCharacterDelay(index, wavePosition);

          return (
            <AnimatedCharacter
              key={`${index}-${char}-${isComplete}`}
              char={char}
              index={index}
              isAnimating={isAnimating}
              isComplete={isComplete && index < targetText.length}
              delay={delay}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export default React.memo(WaveAnimator, (prevProps, nextProps) => {
  // Custom comparison for memoization
  return (
    prevProps.sourceText === nextProps.sourceText &&
    prevProps.targetText === nextProps.targetText &&
    prevProps.progress === nextProps.progress &&
    prevProps.isComplete === nextProps.isComplete &&
    prevProps.waveState?.position === nextProps.waveState?.position
  );
});
