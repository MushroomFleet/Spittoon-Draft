/**
 * Paragraph detection utilities
 */

import type {
  Paragraph,
  ParagraphId,
} from '../types';
import { ParagraphStatus } from '../types';
import {
  createParagraph,
  generateParagraphId,
  createTextPosition,
} from '../types/factories';
import {
  validateParagraphText,
  sanitizeText,
} from './validation';
import {
  PARAGRAPH_SEPARATOR,
  MIN_PARAGRAPH_LENGTH,
} from '../constants';

/**
 * Detected paragraph info before full object creation
 */
interface DetectedParagraph {
  text: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Detect paragraphs from raw text
 */
export const detectParagraphsFromText = (
  text: string,
  existingParagraphs: Map<ParagraphId, Paragraph>
): Paragraph[] => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Split by double newline
  const sections = text.split(PARAGRAPH_SEPARATOR);
  const detected: DetectedParagraph[] = [];
  let currentIndex = 0;

  // Build detected paragraphs with positions
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const trimmed = sanitizeText(section);
    
    if (trimmed.length >= MIN_PARAGRAPH_LENGTH) {
      detected.push({
        text: trimmed,
        startIndex: currentIndex,
        endIndex: currentIndex + section.length,
      });
    }
    
    // Move index forward (including separator)
    currentIndex += section.length;
    if (i < sections.length - 1) {
      currentIndex += 2; // Add 2 for \n\n
    }
  }

  // Filter out paragraphs that already exist
  const newParagraphs: Paragraph[] = [];
  
  for (const det of detected) {
    // Check if this exact text already exists in a non-terminal state
    const exists = Array.from(existingParagraphs.values()).some(
      (p) =>
        p.originalText === det.text &&
        (p.status === ParagraphStatus.PENDING ||
         p.status === ParagraphStatus.QUEUED ||
         p.status === ParagraphStatus.PROCESSING ||
         p.status === ParagraphStatus.STREAMING)
    );

    if (!exists) {
      // Validate before creating
      const validation = validateParagraphText(det.text);
      if (validation.isValid) {
        const position = createTextPosition(
          det.startIndex,
          det.endIndex,
          text
        );

        const paragraph = createParagraph({
          id: generateParagraphId(),
          originalText: det.text,
          position,
        });

        newParagraphs.push(paragraph);
      }
    }
  }

  return newParagraphs;
};

/**
 * Check if text contains completed paragraphs
 */
export const hasCompletedParagraphs = (text: string): boolean => {
  return PARAGRAPH_SEPARATOR.test(text);
};

/**
 * Get paragraph count from text
 */
export const getParagraphCount = (text: string): number => {
  if (!text || text.trim().length === 0) return 0;
  
  const sections = text.split(PARAGRAPH_SEPARATOR);
  return sections.filter(
    (s) => sanitizeText(s).length >= MIN_PARAGRAPH_LENGTH
  ).length;
};
