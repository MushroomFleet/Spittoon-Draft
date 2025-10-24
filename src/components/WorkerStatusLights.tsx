/**
 * WorkerStatusLights - Visual queue worker status indicator
 * Shows 3 lights representing concurrent worker slots
 */

import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { MAX_CONCURRENT_STREAMS } from '../constants';

type WorkerState = 'idle' | 'active' | 'completing';

export const WorkerStatusLights: React.FC = () => {
  const activeCount = useEditorStore((state) => state.queue.activeCount);
  const [workerStates, setWorkerStates] = useState<WorkerState[]>(
    Array(MAX_CONCURRENT_STREAMS).fill('idle')
  );
  const [prevActiveCount, setPrevActiveCount] = useState(activeCount);

  // Update worker states based on activeCount
  useEffect(() => {
    const newStates: WorkerState[] = Array(MAX_CONCURRENT_STREAMS).fill('idle');
    
    // Set active workers
    for (let i = 0; i < activeCount; i++) {
      newStates[i] = 'active';
    }
    
    // Detect workers that just completed (activeCount decreased)
    if (activeCount < prevActiveCount) {
      // Worker(s) just finished - show completion blink
      for (let i = activeCount; i < prevActiveCount; i++) {
        newStates[i] = 'completing';
      }
      
      // Return to idle after brief red blink (300ms)
      setTimeout(() => {
        setWorkerStates(prev => {
          const updated = [...prev];
          for (let i = activeCount; i < prevActiveCount; i++) {
            if (updated[i] === 'completing') {
              updated[i] = 'idle';
            }
          }
          return updated;
        });
      }, 300);
    }
    
    setWorkerStates(newStates);
    setPrevActiveCount(activeCount);
  }, [activeCount, prevActiveCount]);

  const getWorkerColor = (state: WorkerState): string => {
    switch (state) {
      case 'idle':
        return 'bg-success'; // Green
      case 'active':
        return 'bg-accent'; // Amber
      case 'completing':
        return 'bg-destructive animate-pulse'; // Red blink
    }
  };

  const getWorkerLabel = (state: WorkerState): string => {
    switch (state) {
      case 'idle':
        return 'Ready';
      case 'active':
        return 'Processing';
      case 'completing':
        return 'Complete';
    }
  };

  return (
    <div className="flex items-center gap-1.5" title={`Queue Workers: ${activeCount}/${MAX_CONCURRENT_STREAMS} active`}>
      {workerStates.map((state, index) => (
        <div
          key={index}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${getWorkerColor(state)} shadow-sm`}
          title={`Worker ${index + 1}: ${getWorkerLabel(state)}`}
        />
      ))}
    </div>
  );
};
