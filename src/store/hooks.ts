/**
 * Custom hooks and selectors for the editor store
 */

import { useMemo } from 'react';
import { useEditorStore } from './editorStore';
import type { Paragraph, ParagraphId } from '../types';
import { ParagraphStatus } from '../types';
import { isParagraphActive } from '../types/guards';

/**
 * Hook to get all paragraphs as an array (sorted by position)
 */
export const useParagraphs = (): Paragraph[] => {
  const paragraphsMap = useEditorStore((state) => state.paragraphs);
  
  return useMemo(() => {
    return Array.from(paragraphsMap.values()).sort(
      (a, b) => a.position.startIndex - b.position.startIndex
    );
  }, [paragraphsMap]);
};

/**
 * Hook to get a specific paragraph by ID
 */
export const useParagraph = (id: ParagraphId | null): Paragraph | null => {
  return useEditorStore((state) => {
    if (!id) return null;
    return state.paragraphs.get(id) || null;
  });
};

/**
 * Hook to get active (processing) paragraphs
 */
export const useActiveParagraphs = (): Paragraph[] => {
  const paragraphsMap = useEditorStore((state) => state.paragraphs);
  
  return useMemo(() => {
    return Array.from(paragraphsMap.values()).filter(isParagraphActive);
  }, [paragraphsMap]);
};

/**
 * Hook to get completed paragraphs
 */
export const useCompletedParagraphs = (): Paragraph[] => {
  const paragraphsMap = useEditorStore((state) => state.paragraphs);
  
  return useMemo(() => {
    return Array.from(paragraphsMap.values()).filter(
      (p) => p.status === ParagraphStatus.COMPLETE
    );
  }, [paragraphsMap]);
};

/**
 * Hook to get paragraphs with errors
 */
export const useErrorParagraphs = (): Paragraph[] => {
  const paragraphsMap = useEditorStore((state) => state.paragraphs);
  
  return useMemo(() => {
    return Array.from(paragraphsMap.values()).filter(
      (p) => p.status === ParagraphStatus.ERROR
    );
  }, [paragraphsMap]);
};

/**
 * Hook to get queue statistics
 */
export const useQueueStats = () => {
  const queue = useEditorStore((state) => state.queue);
  
  return useMemo(() => ({
    queueLength: queue.items.length,
    activeCount: queue.activeCount,
    maxConcurrent: queue.maxConcurrent,
    totalProcessed: queue.totalProcessed,
    totalFailed: queue.totalFailed,
    averageProcessingTime: queue.averageProcessingTime,
  }), [queue]);
};

/**
 * Hook to get session statistics
 */
export const useSessionStats = () => {
  return useEditorStore((state) => state.statistics);
};

/**
 * Hook to get stream configuration
 */
export const useStreamConfig = () => {
  return useEditorStore((state) => state.streamConfig);
};

/**
 * Hook to check if API key is configured
 */
export const useHasApiKey = (): boolean => {
  return useEditorStore((state) => state.streamConfig.apiKey.length > 0);
};

/**
 * Hook to get paragraph count by status
 */
export const useParagraphCountByStatus = () => {
  const paragraphsMap = useEditorStore((state) => state.paragraphs);
  
  return useMemo(() => {
    const paragraphs = Array.from(paragraphsMap.values());
    
    return {
      pending: paragraphs.filter((p) => p.status === ParagraphStatus.PENDING).length,
      queued: paragraphs.filter((p) => p.status === ParagraphStatus.QUEUED).length,
      processing: paragraphs.filter((p) => p.status === ParagraphStatus.PROCESSING).length,
      streaming: paragraphs.filter((p) => p.status === ParagraphStatus.STREAMING).length,
      complete: paragraphs.filter((p) => p.status === ParagraphStatus.COMPLETE).length,
      error: paragraphs.filter((p) => p.status === ParagraphStatus.ERROR).length,
      cancelled: paragraphs.filter((p) => p.status === ParagraphStatus.CANCELLED).length,
    };
  }, [paragraphsMap]);
};

/**
 * Hook to get raw text from store
 */
export const useRawText = (): string => {
  return useEditorStore((state) => state.rawText);
};

/**
 * Hook to get settings open state
 */
export const useIsSettingsOpen = (): boolean => {
  return useEditorStore((state) => state.isSettingsOpen);
};

/**
 * Hook to get selected paragraph ID
 */
export const useSelectedParagraphId = (): ParagraphId | null => {
  return useEditorStore((state) => state.selectedParagraphId);
};
