/**
 * ProgressBar - Animated progress indicator
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showLabel = false,
}) => {
  // Clamp progress to 0-100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`relative ${className}`}>
      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full gradient-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {showLabel && (
        <div className="absolute -right-12 top-0 text-xs text-muted-foreground font-mono">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
};
