/**
 * EmptyState - Display when no content available
 */

import React from 'react';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📝',
  title,
  description,
  action,
}) => {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">{icon}</div>
      <p className="text-lg font-medium text-foreground">{title}</p>
      {description && <p className="text-sm mt-2 text-muted-foreground">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-4 py-2 gradient-primary text-primary-foreground rounded-md hover:opacity-90 transition-smooth shadow-glow"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
