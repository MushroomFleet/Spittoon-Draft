/**
 * EditorStats - Display processing statistics
 */

import React from 'react';
import {
  useQueueStats,
  useParagraphCountByStatus,
} from '../store/hooks';

export const EditorStats: React.FC = () => {
  const queueStats = useQueueStats();
  const statusCounts = useParagraphCountByStatus();

  return (
    <div className="flex items-center gap-4 text-xs">
      {/* Active Processing */}
      <div className="flex items-center gap-1">
        <span className="font-mono font-semibold text-primary-foreground">
          {queueStats.activeCount}/{queueStats.maxConcurrent}
        </span>
        <span className="text-primary-foreground/70">active</span>
      </div>

      {/* Queue Length */}
      {queueStats.queueLength > 0 && (
        <div className="flex items-center gap-1">
          <span className="font-mono font-semibold text-primary-foreground">{queueStats.queueLength}</span>
          <span className="text-primary-foreground/70">queued</span>
        </div>
      )}

      {/* Completed */}
      <div className="flex items-center gap-1">
        <span className="text-success">✓</span>
        <span className="font-mono font-semibold text-primary-foreground">{statusCounts.complete}</span>
      </div>

      {/* Errors */}
      {statusCounts.error > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-destructive">✗</span>
          <span className="font-mono font-semibold text-primary-foreground">{statusCounts.error}</span>
        </div>
      )}
    </div>
  );
};
