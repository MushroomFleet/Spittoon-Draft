/**
 * NSL Parser Service
 * Parses NSL (Narrative Spittoon Language) XML files into virtual bucket files
 */

import type { BucketFile, NSLMetadata, ValidationResult } from '../types';

/**
 * Parse an NSL file into virtual bucket structure
 */
export const parseNSLToBucket = async (file: File): Promise<BucketFile[]> => {
  try {
    // Read file content
    const text = await file.text();
    
    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error(`XML parsing error: ${parserError.textContent}`);
    }
    
    const bucketFiles: BucketFile[] = [];
    const now = Date.now();
    
    // REQUIRED: Project Instructions (from ProjectManifest)
    const projectManifest = extractProjectManifest(xmlDoc);
    if (projectManifest) {
      bucketFiles.push({
        filename: 'project-instructions.md',
        content: projectManifest,
        category: 'document',
        isRequired: true,
        lastModified: now
      });
    }
    
    // REQUIRED: Narrative Spittoon Framework
    const narrativeSpittoon = extractCDATA(xmlDoc, 'NarrativeSpittoon');
    if (narrativeSpittoon) {
      bucketFiles.push({
        filename: 'narrativespittoon.md',
        content: narrativeSpittoon,
        category: 'framework',
        isRequired: true,
        lastModified: now
      });
    }
    
    // REQUIRED: Ghost Writing Style
    const ghostWritingStyle = extractCDATA(xmlDoc, 'GhostWritingStyle');
    if (ghostWritingStyle) {
      bucketFiles.push({
        filename: 'ghostwriterstyle.md',
        content: ghostWritingStyle,
        category: 'framework',
        isRequired: true,
        lastModified: now
      });
    }
    
    // REQUIRED: World Description
    const worldDescription = extractCDATA(xmlDoc, 'WorldDescription');
    if (worldDescription) {
      bucketFiles.push({
        filename: 'world.md',
        content: worldDescription,
        category: 'world',
        isRequired: true,
        lastModified: now
      });
    }
    
    // REQUIRED: Characters (compile all <Character> elements)
    const characters = compileCharactersToMarkdown(xmlDoc);
    if (characters) {
      bucketFiles.push({
        filename: 'characters.md',
        content: characters,
        category: 'character',
        isRequired: true,
        lastModified: now
      });
    }
    
    // REQUIRED: Speech Styles (extract from characters)
    const speechStyles = extractSpeechStylesToMarkdown(xmlDoc);
    if (speechStyles) {
      bucketFiles.push({
        filename: 'speechstyles.md',
        content: speechStyles,
        category: 'character',
        isRequired: true,
        lastModified: now
      });
    }
    
    // OPTIONAL: Glossary
    const glossary = extractGlossary(xmlDoc);
    if (glossary) {
      bucketFiles.push({
        filename: 'glossary.md',
        content: glossary,
        category: 'document',
        isRequired: false,
        lastModified: now
      });
    }
    
    // OPTIONAL: Timeline
    const timeline = extractTimeline(xmlDoc);
    if (timeline) {
      bucketFiles.push({
        filename: 'timeline.md',
        content: timeline,
        category: 'document',
        isRequired: false,
        lastModified: now
      });
    }
    
    // OPTIONAL: Other supplementary documents
    const otherDocs = extractSupplementaryDocuments(xmlDoc, now);
    bucketFiles.push(...otherDocs);
    
    return bucketFiles;
  } catch (error) {
    console.error('NSL parsing error:', error);
    throw new Error(`Failed to parse NSL file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Extract metadata from NSL file
 */
export const extractMetadata = (xmlDoc: Document): NSLMetadata | null => {
  try {
    const metadata = xmlDoc.querySelector('Metadata');
    if (!metadata) return null;
    
    const title = metadata.querySelector('Title')?.textContent?.trim() || 'Untitled Project';
    const author = metadata.querySelector('Author')?.textContent?.trim();
    const version = xmlDoc.querySelector('NarrativeBucket')?.getAttribute('version') || '1.0';
    
    // Extract series info if present
    const seriesInfo = metadata.querySelector('SeriesInfo');
    let seriesData;
    if (seriesInfo) {
      seriesData = {
        type: seriesInfo.querySelector('Type')?.textContent?.trim() || 'standalone',
        totalVolumes: parseInt(seriesInfo.querySelector('TotalVolumes')?.textContent || '1'),
        currentVolume: seriesInfo.querySelector('CurrentVolume')?.textContent?.trim() || '1'
      };
    }
    
    return {
      title,
      author,
      version,
      importedAt: Date.now(),
      seriesInfo: seriesData
    };
  } catch (error) {
    console.error('Metadata extraction error:', error);
    return null;
  }
};

/**
 * Validate bucket files
 */
export const validateBucket = (files: BucketFile[]): ValidationResult => {
  const requiredFiles = [
    'project-instructions.md',
    'narrativespittoon.md',
    'ghostwriterstyle.md',
    'world.md',
    'characters.md',
    'speechstyles.md'
  ];
  
  const presentFiles = files.map(f => f.filename);
  const missingFiles = requiredFiles.filter(name => !presentFiles.includes(name));
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (missingFiles.length > 0) {
    errors.push(`Missing required files: ${missingFiles.join(', ')}`);
  }
  
  // Check for empty required files
  files.forEach(file => {
    if (file.isRequired && (!file.content || file.content.trim().length === 0)) {
      warnings.push(`Required file "${file.filename}" is empty`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract CDATA content from element
 */
const extractCDATA = (xmlDoc: Document, elementName: string): string => {
  const element = xmlDoc.querySelector(elementName);
  if (!element) return '';
  
  // Try to get Content child first
  const contentElement = element.querySelector('Content');
  if (contentElement) {
    return contentElement.textContent?.trim() || '';
  }
  
  // Fall back to element text content
  return element.textContent?.trim() || '';
};

/**
 * Extract text content from element
 */
const getElementText = (element: Element | null): string => {
  return element?.textContent?.trim() || '';
};

/**
 * Extract ProjectManifest as markdown
 */
const extractProjectManifest = (xmlDoc: Document): string => {
  const manifest = xmlDoc.querySelector('ProjectManifest');
  if (!manifest) return '';
  
  let markdown = '# Project Instructions\n\n';
  
  // Overview
  const overview = manifest.querySelector('Overview');
  if (overview) {
    markdown += '## Overview\n\n';
    markdown += `${getElementText(overview)}\n\n`;
  }
  
  // Component Index
  const componentIndex = manifest.querySelector('ComponentIndex');
  if (componentIndex) {
    markdown += '## Component Index\n\n';
    
    const groups = componentIndex.querySelectorAll('ComponentGroup');
    groups.forEach(group => {
      const groupName = group.getAttribute('name') || 'Components';
      markdown += `### ${groupName}\n\n`;
      
      const components = group.querySelectorAll('Component');
      components.forEach(component => {
        const ref = component.getAttribute('ref') || '';
        const type = component.getAttribute('type') || '';
        const description = component.querySelector('Description');
        const usage = component.querySelector('Usage');
        
        markdown += `- **${ref}** (${type})\n`;
        if (description) {
          markdown += `  - ${getElementText(description)}\n`;
        }
        if (usage) {
          markdown += `  - Usage: ${getElementText(usage)}\n`;
        }
        markdown += '\n';
      });
    });
  }
  
  // Usage Guidelines
  const guidelines = manifest.querySelector('UsageGuidelines');
  if (guidelines) {
    markdown += '## Usage Guidelines\n\n';
    
    const guidelineElements = guidelines.querySelectorAll('Guideline');
    guidelineElements.forEach(guideline => {
      const context = guideline.getAttribute('context') || 'general';
      markdown += `### ${context}\n\n`;
      markdown += `${getElementText(guideline)}\n\n`;
    });
  }
  
  return markdown;
};

/**
 * Compile all characters into single markdown file
 */
const compileCharactersToMarkdown = (xmlDoc: Document): string => {
  const characters = xmlDoc.querySelectorAll('Character');
  if (characters.length === 0) return '';
  
  let markdown = '# Characters\n\n';
  
  characters.forEach(char => {
    const id = char.getAttribute('id') || '';
    const name = getElementText(char.querySelector('Name'));
    const age = getElementText(char.querySelector('Age'));
    const description = getElementText(char.querySelector('Description'));
    const personality = getElementText(char.querySelector('Personality'));
    const role = getElementText(char.querySelector('Role'));
    
    markdown += `## ${name}\n\n`;
    markdown += `**ID**: ${id}\n\n`;
    
    if (age) markdown += `**Age**: ${age}\n\n`;
    if (role) markdown += `**Role**: ${role}\n\n`;
    if (description) markdown += `**Description**: ${description}\n\n`;
    if (personality) markdown += `**Personality**: ${personality}\n\n`;
    
    // Physical Attributes
    const physical = char.querySelector('PhysicalAttributes');
    if (physical) {
      markdown += '### Physical Attributes\n\n';
      const build = getElementText(physical.querySelector('Build'));
      const height = getElementText(physical.querySelector('Height'));
      const hair = getElementText(physical.querySelector('Hair'));
      const eyes = getElementText(physical.querySelector('Eyes'));
      
      if (build) markdown += `- **Build**: ${build}\n`;
      if (height) markdown += `- **Height**: ${height}\n`;
      if (hair) markdown += `- **Hair**: ${hair}\n`;
      if (eyes) markdown += `- **Eyes**: ${eyes}\n`;
      markdown += '\n';
    }
    
    // Background
    const background = char.querySelector('Background');
    if (background) {
      markdown += '### Background\n\n';
      markdown += `${getElementText(background)}\n\n`;
    }
    
    // Psychology (NSL 1.1)
    const psychology = char.querySelector('Psychology');
    if (psychology) {
      markdown += '### Psychology\n\n';
      const motivation = getElementText(psychology.querySelector('PrimaryMotivation'));
      if (motivation) markdown += `**Primary Motivation**: ${motivation}\n\n`;
      
      const fears = psychology.querySelectorAll('Fear');
      if (fears.length > 0) {
        markdown += '**Fears**:\n';
        fears.forEach(fear => {
          markdown += `- ${getElementText(fear)}\n`;
        });
        markdown += '\n';
      }
    }
    
    // Narrative Function (NSL 1.1)
    const narrativeFunction = char.querySelector('NarrativeFunction');
    if (narrativeFunction) {
      markdown += '### Narrative Function\n\n';
      const archetype = getElementText(narrativeFunction.querySelector('Archetype'));
      const growthArc = getElementText(narrativeFunction.querySelector('GrowthArc'));
      const storyRole = getElementText(narrativeFunction.querySelector('StoryRole'));
      
      if (archetype) markdown += `**Archetype**: ${archetype}\n\n`;
      if (growthArc) markdown += `**Growth Arc**: ${growthArc}\n\n`;
      if (storyRole) markdown += `**Story Role**: ${storyRole}\n\n`;
    }
    
    // Narrative Profile (NSL 1.1)
    const profile = char.querySelector('NarrativeProfile');
    if (profile) {
      markdown += '### Narrative Profile\n\n';
      markdown += `${getElementText(profile)}\n\n`;
    }
    
    markdown += '---\n\n';
  });
  
  return markdown;
};

/**
 * Extract speech styles into markdown
 */
const extractSpeechStylesToMarkdown = (xmlDoc: Document): string => {
  const characters = xmlDoc.querySelectorAll('Character');
  if (characters.length === 0) return '';
  
  let markdown = '# Character Speech Styles\n\n';
  
  characters.forEach(char => {
    const name = getElementText(char.querySelector('Name'));
    const speechStyle = char.querySelector('SpeechStyle');
    
    if (!speechStyle) return;
    
    markdown += `## ${name}\n\n`;
    
    const vocabulary = getElementText(speechStyle.querySelector('Vocabulary'));
    const sentenceStructure = getElementText(speechStyle.querySelector('SentenceStructure'));
    
    if (vocabulary) markdown += `**Vocabulary**: ${vocabulary}\n\n`;
    if (sentenceStructure) markdown += `**Sentence Structure**: ${sentenceStructure}\n\n`;
    
    // Sample Dialogue (NSL 1.1)
    const sampleDialogue = getElementText(speechStyle.querySelector('SampleDialogue'));
    if (sampleDialogue) {
      markdown += '### Sample Dialogue\n\n';
      markdown += `${sampleDialogue}\n\n`;
    }
    
    // Speaking Patterns
    const patterns = speechStyle.querySelectorAll('SpeakingPatterns Pattern');
    if (patterns.length > 0) {
      markdown += '### Speaking Patterns\n\n';
      patterns.forEach(pattern => {
        markdown += `- ${getElementText(pattern)}\n`;
      });
      markdown += '\n';
    }
    
    // Catchphrases
    const phrases = speechStyle.querySelectorAll('Catchphrases Phrase');
    if (phrases.length > 0) {
      markdown += '### Catchphrases\n\n';
      phrases.forEach(phrase => {
        markdown += `- "${getElementText(phrase)}"\n`;
      });
      markdown += '\n';
    }
    
    markdown += '---\n\n';
  });
  
  return markdown;
};

/**
 * Extract glossary
 */
const extractGlossary = (xmlDoc: Document): string => {
  // Look for structured glossary first (NSL 1.1)
  const structuredGlossary = xmlDoc.querySelector('Document[type="glossary"][format="structured"]');
  if (structuredGlossary) {
    return extractStructuredGlossary(structuredGlossary);
  }
  
  // Fall back to regular glossary document
  const glossaryDoc = Array.from(xmlDoc.querySelectorAll('Document')).find(doc => {
    const title = doc.querySelector('Title')?.textContent?.toLowerCase();
    return title?.includes('glossary');
  });
  
  if (glossaryDoc) {
    const contentElement = glossaryDoc.querySelector('Content');
    return contentElement?.textContent?.trim() || '';
  }
  
  return '';
};

/**
 * Extract structured glossary (NSL 1.1)
 */
const extractStructuredGlossary = (glossaryDoc: Element): string => {
  let markdown = '# Glossary\n\n';
  
  const categories = glossaryDoc.querySelectorAll('GlossaryCategories Category');
  categories.forEach(category => {
    const categoryName = getElementText(category.querySelector('Name'));
    markdown += `## ${categoryName}\n\n`;
    
    const terms = category.querySelectorAll('Term');
    terms.forEach(term => {
      const name = getElementText(term.querySelector('Name'));
      const definition = getElementText(term.querySelector('Definition'));
      const usage = getElementText(term.querySelector('Usage'));
      
      markdown += `### ${name}\n\n`;
      if (definition) markdown += `${definition}\n\n`;
      if (usage) markdown += `**Usage**: ${usage}\n\n`;
    });
  });
  
  return markdown;
};

/**
 * Extract chronological timeline
 */
const extractTimeline = (xmlDoc: Document): string => {
  const timeline = xmlDoc.querySelector('ChronologicalTimeline');
  if (!timeline) return '';
  
  let markdown = '# Timeline\n\n';
  
  const events = timeline.querySelectorAll('Event');
  events.forEach(event => {
    const day = event.getAttribute('day') || '';
    const timestamp = event.getAttribute('timestamp') || '';
    const priority = getElementText(event.querySelector('Priority'));
    const category = getElementText(event.querySelector('Category'));
    const title = getElementText(event.querySelector('Title'));
    const content = getElementText(event.querySelector('Content'));
    
    markdown += `## Day ${day}: ${title}\n\n`;
    if (timestamp) markdown += `**Time**: ${timestamp}\n\n`;
    if (category) markdown += `**Category**: ${category}\n\n`;
    if (priority) markdown += `**Priority**: ${priority}\n\n`;
    if (content) markdown += `${content}\n\n`;
    markdown += '---\n\n';
  });
  
  return markdown;
};

/**
 * Extract other supplementary documents
 */
const extractSupplementaryDocuments = (xmlDoc: Document, timestamp: number): BucketFile[] => {
  const docs: BucketFile[] = [];
  const documents = xmlDoc.querySelectorAll('SupplementaryDocuments > Document');
  
  documents.forEach(doc => {
    const type = doc.getAttribute('type') || 'document';
    const format = doc.getAttribute('format') || 'markdown';
    
    // Skip glossary (handled separately)
    if (type === 'glossary') return;
    
    const title = getElementText(doc.querySelector('Title'));
    const content = getElementText(doc.querySelector('Content'));
    
    if (title && content) {
      // Generate filename from title
      const filename = title.toLowerCase().replace(/\s+/g, '-') + '.md';
      
      docs.push({
        filename,
        content,
        category: 'document',
        isRequired: false,
        lastModified: timestamp
      });
    }
  });
  
  return docs;
};
