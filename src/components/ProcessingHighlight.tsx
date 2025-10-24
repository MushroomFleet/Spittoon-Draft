/**
 * ProcessingHighlight - Visual overlay showing processing ranges
 * Uses golden accent color with throbbing animation
 */

import React, { useRef, useEffect, useState } from 'react';

interface HighlightRange {
  promptId: string;
  searchText: string;
  occurrence: number;
}

interface ProcessingHighlightProps {
  /** Text content to measure */
  text: string;
  /** Active processing ranges */
  ranges: HighlightRange[];
  /** CSS class for the textarea being measured */
  textareaClassName?: string;
}

interface HighlightBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const ProcessingHighlight: React.FC<ProcessingHighlightProps> = ({
  text,
  ranges,
  textareaClassName = '',
}) => {
  const measureRef = useRef<HTMLDivElement>(null);
  const [highlights, setHighlights] = useState<Map<string, HighlightBox[]>>(new Map());

  // Helper function to find Nth occurrence
  const findNthOccurrence = (text: string, searchText: string, n: number): number => {
    let occurrence = 0;
    let index = -1;
    
    while (occurrence < n) {
      index = text.indexOf(searchText, index + 1);
      if (index === -1) return -1;  // Not found
      occurrence++;
    }
    
    return index;
  };

  // Calculate highlight positions
  useEffect(() => {
    if (!measureRef.current || ranges.length === 0) {
      setHighlights(new Map());
      return;
    }

    const newHighlights = new Map<string, HighlightBox[]>();
    const measureEl = measureRef.current;
    const computedStyle = window.getComputedStyle(measureEl);
    
    // Get font metrics
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const fontSize = parseFloat(computedStyle.fontSize);
    const paddingLeft = parseFloat(computedStyle.paddingLeft);
    const paddingTop = parseFloat(computedStyle.paddingTop);

    ranges.forEach((range) => {
      const boxes: HighlightBox[] = [];
      
      // Find the Nth occurrence of the search text
      const startIndex = findNthOccurrence(text, range.searchText, range.occurrence);
      
      if (startIndex === -1) {
        // Text not found (may have been replaced already)
        return;
      }
      
      const endIndex = startIndex + range.searchText.length;
      
      // Get text before and in selection
      const beforeText = text.substring(0, startIndex);
      const selectedText = text.substring(startIndex, endIndex);
      
      // Calculate lines for before text
      const beforeLines = beforeText.split('\n');
      const startLine = beforeLines.length - 1;
      const startCol = beforeLines[beforeLines.length - 1].length;
      
      // Calculate character width (approximate using canvas)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.font = `${fontSize}px ${computedStyle.fontFamily}`;
        const charWidth = ctx.measureText('m').width; // Use 'm' as average character
        
        // Split selected text by lines
        const selectedLines = selectedText.split('\n');
        let currentLine = startLine;
        let currentCol = startCol;
        
        selectedLines.forEach((lineText, lineIndex) => {
          const isFirstLine = lineIndex === 0;
          const isLastLine = lineIndex === selectedLines.length - 1;
          
          if (!isFirstLine) {
            currentCol = 0;
            currentLine++;
          }
          
          const lineWidth = ctx.measureText(lineText).width;
          const startX = currentCol * charWidth;
          
          boxes.push({
            top: paddingTop + currentLine * lineHeight,
            left: paddingLeft + startX,
            width: lineWidth,
            height: lineHeight,
          });
          
          if (!isLastLine) {
            currentCol = 0;
          } else {
            currentCol += lineText.length;
          }
        });
      }
      
      newHighlights.set(range.promptId, boxes);
    });

    setHighlights(newHighlights);
  }, [text, ranges]);

  if (ranges.length === 0) {
    return null;
  }

  return (
    <>
      {/* Hidden measurement div with same styling as textarea */}
      <div
        ref={measureRef}
        className={`${textareaClassName} absolute opacity-0 pointer-events-none whitespace-pre-wrap`}
        style={{ top: -9999, left: -9999 }}
        aria-hidden="true"
      >
        {text}
      </div>

      {/* Render highlight boxes */}
      {ranges.map((range) => {
        const boxes = highlights.get(range.promptId) || [];
        return boxes.map((box, index) => (
          <div
            key={`${range.promptId}-${index}`}
            className="absolute pointer-events-none animate-throb-highlight rounded"
            style={{
              top: `${box.top}px`,
              left: `${box.left}px`,
              width: `${box.width}px`,
              height: `${box.height}px`,
              zIndex: 1,
            }}
          />
        ));
      })}
    </>
  );
};
