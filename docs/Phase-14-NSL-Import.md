# Phase 14: NSL Import Integration

## Overview

Phase 14 adds the ability to import NSL (Narrative Spittoon Language) files and use the narrative bucket context to enhance AI-generated content. This transforms Spittoon-Draft into a full-fledged NSL-powered narrative tool.

## Features

### Core Functionality
- **NSL File Import**: Upload .nsl files and parse into virtual bucket structure
- **Bucket Context Loading**: Extract all required narrative components
- **Context Toggle**: Enable/disable bucket context inclusion in prompts
- **Bucket View**: Browse, preview, and edit imported bucket files
- **Persistent Storage**: Bucket data survives page refreshes via IndexedDB

### Bucket Structure

NSL files are parsed into virtual bucket files:

```
/bucket/
├── project-instructions.md   (from <ProjectManifest>)
├── narrativespittoon.md      (from <CognitiveFrameworks><NarrativeSpittoon>)
├── ghostwriterstyle.md       (from <CognitiveFrameworks><GhostWritingStyle>)
├── world.md                  (from <Universe><WorldDescription>)
├── characters.md             (compiled from all <Character> elements)
├── speechstyles.md           (extracted from <Character><SpeechStyle>)
├── glossary.md               (optional, from <SupplementaryDocuments>)
├── timeline.md               (optional, from <ChronologicalTimeline>)
└── [other documents]         (from <SupplementaryDocuments>)
```

### Required Files

These files must be present in every imported bucket:
1. `project-instructions.md` - Project manifest and usage guidelines
2. `narrativespittoon.md` - Core narrative framework
3. `ghostwriterstyle.md` - Writing style guide
4. `world.md` - World description and setting
5. `characters.md` - Character profiles
6. `speechstyles.md` - Character speech patterns

### Context Enhancement

When bucket is enabled, the AI receives:
- Full cognitive frameworks (narrative structure + writing style)
- Complete world description
- All character profiles and speech patterns
- Current document text
- Selected text for enhancement
- Original instruction prompt

This provides comprehensive narrative context for all enhancements.

## Architecture

### Services

1. **NSL Parser** (`src/services/nslParser.ts`)
   - Parses NSL XML files
   - Extracts content into virtual bucket files
   - Validates required components
   - Handles both NSL 1.0 and 1.1 formats

2. **Bucket Storage** (`src/services/bucketStorage.ts`)
   - IndexedDB persistence layer
   - Store/retrieve bucket files
   - Clear bucket on new import
   - Survive page refreshes

3. **Context Builder** (`src/services/contextBuilder.ts`)
   - Constructs enhanced prompts
   - Combines bucket context with user instructions
   - Formats context for optimal AI comprehension

### State Management

Store additions (`src/store/editorStore.ts`):
```typescript
bucketFiles: Map<string, BucketFile> | null
isBucketImported: boolean
isBucketEnabled: boolean
nslMetadata: NSLMetadata | null
viewMode: 'split' | 'single' | 'bucket'
```

### UI Components

1. **Import Button** (EditorHeader)
   - File upload for .nsl files
   - Shows import status
   - Clear bucket action

2. **Bucket Toggle** (EditorHeader stats area)
   - Enable/disable context inclusion
   - Shows bucket name when active
   - Disabled when no bucket imported

3. **BucketView Tab** (new view mode)
   - Card grid organized by category
   - File preview and editing
   - Bucket metadata display

4. **File Preview Modal**
   - Full file content display
   - Edit and save functionality
   - Markdown-friendly rendering

## Implementation Steps

### Phase 1: Foundation
- [x] Create documentation
- [ ] Update type definitions
- [ ] Create NSL parser service
- [ ] Create bucket storage service
- [ ] Create context builder service

### Phase 2: Store Integration
- [ ] Add bucket state to store
- [ ] Implement import/clear actions
- [ ] Add bucket toggle action
- [ ] Add file update action
- [ ] Load bucket on app init

### Phase 3: UI Components
- [ ] Add Import button to EditorHeader
- [ ] Add bucket toggle to stats area
- [ ] Create BucketView component
- [ ] Create BucketFileCard component
- [ ] Create FilePreviewModal component

### Phase 4: Integration
- [ ] Update stream processor for context
- [ ] Connect bucket to enhancement flow
- [ ] Add bucket view routing
- [ ] Test end-to-end workflow

### Phase 5: Polish
- [ ] Error handling and validation
- [ ] Loading states and feedback
- [ ] Edge case handling
- [ ] Documentation updates

## Usage Flow

1. **Import NSL**: Click Import button, select .nsl file
2. **Validation**: System validates required components
3. **Storage**: Bucket files saved to IndexedDB
4. **Enable**: Bucket automatically enabled on import
5. **Browse**: Switch to Bucket view to explore files
6. **Edit**: Click file cards to preview/edit content
7. **Enhance**: Use enhance features with full narrative context
8. **Toggle**: Disable bucket if temporary context-free enhancement needed

## Technical Details

### NSL Parsing

Parser extracts CDATA sections and converts structured XML into markdown:

```typescript
// Character compilation example
const compileCharactersToMarkdown = (xmlDoc: Document): string => {
  const characters = xmlDoc.querySelectorAll('Character');
  let markdown = '# Characters\n\n';
  
  characters.forEach(char => {
    const name = char.querySelector('Name')?.textContent;
    const description = char.querySelector('Description')?.textContent;
    const personality = char.querySelector('Personality')?.textContent;
    // ... extract all character fields
    
    markdown += `## ${name}\n\n`;
    markdown += `${description}\n\n`;
    markdown += `**Personality**: ${personality}\n\n`;
    // ... format all fields
  });
  
  return markdown;
};
```

### Context Construction

Context builder assembles comprehensive prompt:

```
# NARRATIVE BUCKET CONTEXT

## project-instructions.md
[Project overview and component guide]

## narrativespittoon.md
[Narrative framework content]

## ghostwriterstyle.md
[Writing style guide]

## world.md
[World description]

## characters.md
[All character profiles]

## speechstyles.md
[Speech patterns for all characters]

## glossary.md (if available)
[Terminology definitions]

---
# CURRENT DOCUMENT
[Full document text for context]

---
# SELECTED TEXT FOR ENHANCEMENT
[User's selection]

---
# INSTRUCTION
[Original system prompt]
```

### IndexedDB Schema

```typescript
Database: "cascade-edit-nsl-bucket"
  ObjectStore: "files"
    key: filename (string)
    value: {
      filename: string
      content: string
      category: 'framework' | 'world' | 'character' | 'document'
      isRequired: boolean
      lastModified: number
    }
  
  ObjectStore: "metadata"
    key: "current"
    value: {
      title: string
      author?: string
      version: string
      importedAt: number
      seriesInfo?: object
    }
```

## Benefits

1. **Rich Context**: AI has full narrative universe awareness
2. **Consistency**: Character voices and world details maintained
3. **Efficiency**: No manual context copying needed
4. **Flexibility**: Toggle context on/off as needed
5. **Portability**: Standard NSL format for interoperability
6. **Persistence**: Bucket survives app restarts
7. **Editability**: Update bucket files without re-importing

## Future Enhancements

- **Smart Context Selection**: Only include relevant characters/locations
- **Multi-bucket Support**: Switch between different narrative universes
- **Bucket Creation**: Generate NSL files from app content
- **Conflict Resolution**: Handle NSL updates intelligently
- **Export with Bucket**: Include bucket metadata in exports

## Related Documentation

- NSL 1.1 Specification: `docs/ref/NSL-1.1-specification.md`
- Phase 12 (Single View): `docs/Phase-12-Single-View.md`
- UNO Prompt: `docs/ref/01-UNO-prompt.md`
