/**
 * StatusBadge - Display paragraph status with icon
 */

import React from 'react';
import { ParagraphStatus } from '../types';

export interface StatusBadgeProps {
  status: ParagraphStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case ParagraphStatus.PENDING:
        return {
          label: 'Pending',
          icon: '○',
          className: 'bg-muted text-muted-foreground',
        };
      case ParagraphStatus.QUEUED:
        return {
          label: 'Queued',
          icon: '⋯',
          className: 'bg-primary/20 text-primary border border-primary/30',
        };
      case ParagraphStatus.PROCESSING:
        return {
          label: 'Processing',
          icon: '◐',
          className: 'bg-primary/30 text-primary-glow animate-pulse border border-primary/40',
        };
      case ParagraphStatus.STREAMING:
        return {
          label: 'Streaming',
          icon: '▶',
          className: 'gradient-primary text-primary-foreground shadow-glow',
        };
      case ParagraphStatus.COMPLETE:
        return {
          label: 'Complete',
          icon: '✓',
          className: 'bg-success/30 text-success border border-success/40',
        };
      case ParagraphStatus.ERROR:
        return {
          label: 'Error',
          icon: '✗',
          className: 'bg-destructive/30 text-destructive border border-destructive/40',
        };
      case ParagraphStatus.CANCELLED:
        return {
          label: 'Cancelled',
          icon: '⊘',
          className: 'bg-muted text-muted-foreground border border-border',
        };
      default:
        return {
          label: 'Unknown',
          icon: '?',
          className: 'bg-muted text-muted-foreground',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold uppercase ${config.className}`}
    >
      <span className="text-sm">{config.icon}</span>
      {config.label}
    </span>
  );
};
