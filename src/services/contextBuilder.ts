/**
 * Context Builder Service
 * Constructs enhanced prompts with NSL bucket context
 */

import type { BucketFile } from '../types';

/**
 * Build enhanced prompt with full bucket context
 */
export const buildEnhancedPrompt = (
  basePrompt: string,
  bucketFiles: Map<string, BucketFile>,
  documentText: string,
  selectionText: string
): string => {
  // Required files that must be loaded
  const requiredFiles = [
    'project-instructions.md',
    'narrativespittoon.md',
    'ghostwriterstyle.md',
    'world.md',
    'characters.md',
    'speechstyles.md'
  ];
  
  let context = '# NARRATIVE BUCKET CONTEXT\n\n';
  context += 'The following context provides complete information about the narrative universe. ';
  context += 'Use this to ensure all generated content is consistent with the established world, ';
  context += 'characters, and writing style.\n\n';
  context += '---\n\n';
  
  // Add each required file
  requiredFiles.forEach(filename => {
    const file = bucketFiles.get(filename);
    if (file) {
      context += `## ${formatFileName(filename)}\n\n`;
      context += `${file.content}\n\n`;
      context += '---\n\n';
    }
  });
  
  // Add optional glossary if exists
  const glossary = bucketFiles.get('glossary.md');
  if (glossary) {
    context += `## ${formatFileName('glossary.md')}\n\n`;
    context += `${glossary.content}\n\n`;
    context += '---\n\n';
  }
  
  // Add current document context
  if (documentText && documentText.trim().length > 0) {
    context += '# CURRENT DOCUMENT\n\n';
    context += 'This is the full document being worked on. Use it for additional context.\n\n';
    context += `${documentText}\n\n`;
    context += '---\n\n';
  }
  
  // Add selected text for enhancement
  context += '# SELECTED TEXT FOR ENHANCEMENT\n\n';
  context += 'This is the specific text to enhance/transform:\n\n';
  context += `${selectionText}\n\n`;
  context += '---\n\n';
  
  // Add instruction
  context += '# INSTRUCTION\n\n';
  context += `${basePrompt}\n\n`;
  context += '**Important**: Ensure your output is consistent with all the narrative context provided above, ';
  context += 'especially character voices, world details, and writing style guidelines.';
  
  return context;
};

/**
 * Build compact context (only essential files)
 */
export const buildCompactContext = (
  basePrompt: string,
  bucketFiles: Map<string, BucketFile>,
  selectionText: string
): string => {
  // Only include the most critical files for compact context
  const essentialFiles = [
    'narrativespittoon.md',
    'ghostwriterstyle.md',
    'characters.md'
  ];
  
  let context = '# NARRATIVE CONTEXT\n\n';
  
  essentialFiles.forEach(filename => {
    const file = bucketFiles.get(filename);
    if (file) {
      context += `## ${formatFileName(filename)}\n\n`;
      // Truncate if too long (keep first 2000 chars)
      const content = file.content.length > 2000 
        ? file.content.substring(0, 2000) + '\n\n[Content truncated for brevity...]'
        : file.content;
      context += `${content}\n\n`;
      context += '---\n\n';
    }
  });
  
  context += '# TEXT TO ENHANCE\n\n';
  context += `${selectionText}\n\n`;
  context += '---\n\n';
  context += '# INSTRUCTION\n\n';
  context += basePrompt;
  
  return context;
};

/**
 * Format context for bucket files as markdown
 */
export const formatBucketContext = (bucketFiles: Map<string, BucketFile>): string => {
  let markdown = '# Narrative Bucket Contents\n\n';
  
  // Group files by category
  const categories = {
    framework: [] as BucketFile[],
    world: [] as BucketFile[],
    character: [] as BucketFile[],
    document: [] as BucketFile[]
  };
  
  bucketFiles.forEach(file => {
    categories[file.category].push(file);
  });
  
  // Add each category
  Object.entries(categories).forEach(([category, files]) => {
    if (files.length === 0) return;
    
    markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Files\n\n`;
    
    files.forEach(file => {
      markdown += `### ${file.filename}\n\n`;
      markdown += `${file.content}\n\n`;
      markdown += '---\n\n';
    });
  });
  
  return markdown;
};

/**
 * Get relevant character context based on mentioned names
 */
export const getRelevantCharacterContext = (
  bucketFiles: Map<string, BucketFile>,
  text: string
): string => {
  const charactersFile = bucketFiles.get('characters.md');
  const speechStylesFile = bucketFiles.get('speechstyles.md');
  
  if (!charactersFile) return '';
  
  // Extract character sections that are mentioned in the text
  const characterSections = charactersFile.content.split(/^## /m).slice(1);
  const relevantSections: string[] = [];
  
  characterSections.forEach(section => {
    const lines = section.split('\n');
    const characterName = lines[0].trim();
    
    // Check if this character is mentioned in the text
    if (text.toLowerCase().includes(characterName.toLowerCase())) {
      relevantSections.push('## ' + section);
    }
  });
  
  if (relevantSections.length === 0) {
    // No specific characters mentioned, return all
    return charactersFile.content;
  }
  
  // Build relevant character context
  let context = '# Relevant Characters\n\n';
  context += relevantSections.join('\n\n');
  
  // Add speech styles for relevant characters if available
  if (speechStylesFile) {
    const speechSections = speechStylesFile.content.split(/^## /m).slice(1);
    const relevantSpech: string[] = [];
    
    speechSections.forEach(section => {
      const lines = section.split('\n');
      const characterName = lines[0].trim();
      
      if (text.toLowerCase().includes(characterName.toLowerCase())) {
        relevantSpech.push('## ' + section);
      }
    });
    
    if (relevantSpech.length > 0) {
      context += '\n\n# Character Speech Styles\n\n';
      context += relevantSpech.join('\n\n');
    }
  }
  
  return context;
};

/**
 * Estimate token count for context (rough approximation)
 */
export const estimateTokenCount = (text: string): number => {
  // Rough estimation: ~4 characters per token on average
  return Math.ceil(text.length / 4);
};

/**
 * Check if context size is reasonable
 */
export const isContextSizeReasonable = (context: string, maxTokens: number = 100000): boolean => {
  const estimatedTokens = estimateTokenCount(context);
  return estimatedTokens <= maxTokens;
};

/**
 * Truncate context if too large
 */
export const truncateContext = (
  context: string,
  maxTokens: number = 100000
): { context: string; wasTruncated: boolean } => {
  const estimatedTokens = estimateTokenCount(context);
  
  if (estimatedTokens <= maxTokens) {
    return { context, wasTruncated: false };
  }
  
  // Calculate how much to keep (leave some buffer)
  const targetChars = Math.floor(maxTokens * 3.5); // More conservative
  const truncated = context.substring(0, targetChars);
  
  return {
    context: truncated + '\n\n[Context truncated due to size constraints]',
    wasTruncated: true
  };
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format filename to readable title
 */
const formatFileName = (filename: string): string => {
  // Remove .md extension
  const nameWithoutExt = filename.replace(/\.md$/, '');
  
  // Convert hyphens/underscores to spaces and title case
  return nameWithoutExt
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Extract summary from markdown content (first paragraph or heading)
 */
const extractSummary = (content: string, maxLength: number = 200): string => {
  // Remove markdown headers
  const text = content
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .trim();
  
  // Get first paragraph
  const paragraphs = text.split(/\n\n+/);
  const firstParagraph = paragraphs[0] || '';
  
  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }
  
  // Truncate to maxLength at word boundary
  const truncated = firstParagraph.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substring(0, lastSpace) + '...';
};

/**
 * Get bucket statistics for logging
 */
export const getBucketContextStats = (bucketFiles: Map<string, BucketFile>): {
  fileCount: number;
  totalChars: number;
  estimatedTokens: number;
  categories: Record<string, number>;
} => {
  const stats = {
    fileCount: bucketFiles.size,
    totalChars: 0,
    estimatedTokens: 0,
    categories: {
      framework: 0,
      world: 0,
      character: 0,
      document: 0
    }
  };
  
  bucketFiles.forEach(file => {
    stats.totalChars += file.content.length;
    stats.categories[file.category]++;
  });
  
  stats.estimatedTokens = estimateTokenCount(stats.totalChars.toString());
  
  return stats;
};
