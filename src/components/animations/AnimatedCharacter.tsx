/**
 * AnimatedCharacter - Single character with transition animation
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  COLOR_PENDING,
  COLOR_ANIMATING,
  COLOR_COMPLETE,
  ANIMATION_DURATION,
} from '../../constants';

export interface AnimatedCharacterProps {
  /** The character to display */
  char: string;
  /** Character index in the text */
  index: number;
  /** Whether this character is currently animating */
  isAnimating: boolean;
  /** Whether the transformation is complete */
  isComplete: boolean;
  /** Animation delay based on position */
  delay: number;
}

export const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({
  char,
  index,
  isAnimating,
  isComplete,
  delay,
}) => {
  // Determine the color based on state
  const getColor = () => {
    if (isComplete) return COLOR_COMPLETE;
    if (isAnimating) return COLOR_ANIMATING;
    return COLOR_PENDING;
  };

  // Handle spaces - use non-breaking space for proper layout
  const displayChar = char === ' ' ? '\u00A0' : char;

  return (
    <motion.span
      key={`char-${index}`}
      className="inline-block"
      initial={false}
      animate={{
        color: getColor(),
        y: isAnimating ? [-8, 0] : 0,
        scale: isAnimating ? [1, 1.1, 1] : 1,
      }}
      transition={{
        duration: ANIMATION_DURATION,
        delay: delay,
        ease: 'easeOut',
      }}
      style={{
        display: 'inline-block',
        whiteSpace: 'pre',
      }}
    >
      {displayChar}
    </motion.span>
  );
};
