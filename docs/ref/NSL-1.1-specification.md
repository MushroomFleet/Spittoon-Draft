# Narrative Spittoon Language (NSL) 1.1 Specification

## Document Information

- **Version**: 1.1
- **Status**: Production Specification
- **Last Updated**: October 2025
- **Purpose**: Define a unified XML-based file format for Narrative Spittoon framework projects
- **Changes from 1.0**: Multi-volume support, enhanced characters, cross-references, timeline structure

---

## 1. Introduction

### 1.1 Overview

The Narrative Spittoon Language (NSL) is an XML-based file format standard designed to encapsulate all components of a narrative generation project using the Narrative Spittoon Inversion framework. NSL 1.1 provides production-ready support for both single narratives and multi-volume series, with enhanced character schemas, cross-referencing, and timeline tracking.

### 1.2 Design Goals

- **Unified Format**: Single file contains complete narrative bucket
- **Series Support**: First-class support for trilogies and multi-volume projects
- **Semantic Structure**: XML elements clearly describe content type and purpose
- **Multi-format Support**: Embed markdown, JSON, mermaid diagrams, and plain text
- **Cross-References**: Preserve semantic relationships between elements
- **Extensibility**: New elements can be added without breaking compatibility
- **Tooling-friendly**: Enables development of parsers, editors, and generators
- **Human-readable**: Maintainable and reviewable by content creators

### 1.3 Changes from NSL 1.0

**Critical Additions**:
1. `<ProjectManifest>` section for bucket navigation
2. `<StoryContent>` replacing `<StoryPages>` with multi-volume support
3. Enhanced Character schema with Psychology, NarrativeFunction, SeriesProgression
4. Cross-reference system (inline and structured)

**High Priority Additions**:
5. `<ChronologicalTimeline>` section for event logs
6. Structured glossary format option
7. Optional `<WorkflowState>` section
8. Enhanced page workflow metadata

**All additions are backward compatible** - NSL 1.0 files remain valid.

### 1.4 Use Cases

- Single-narrative projects (short stories, novellas, standalone novels)
- Multi-volume series (trilogies, ongoing series, serialized fiction)
- Branching narratives (Choose Your Own Adventure style)
- Version control of narrative assets
- Tool interoperability (editors, generators, analyzers)
- Archival and preservation of narrative frameworks
- Migration between narrative generation systems

---

## 2. File Format Specifications

### 2.1 File Properties

- **File Extension**: `.nsl`
- **MIME Type**: `application/xml` (proposed: `application/vnd.narrative-spittoon+xml`)
- **Character Encoding**: UTF-8
- **Line Endings**: Platform-agnostic (LF or CRLF)
- **XML Version**: 1.0

### 2.2 Naming Conventions

- Filename should describe the narrative project
- Use lowercase with hyphens for multi-word names
- For series, optionally include volume number: `story-name-vol1.nsl` or `story-name-complete.nsl`
- Examples: `westwick-noir.nsl`, `land-of-giants-trilogy.nsl`, `moonbase-story.nsl`

### 2.3 File Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<NarrativeBucket version="1.1" xmlns="http://narrative-spittoon.org/nsl/1.1">
  <Metadata>...</Metadata>
  <ProjectManifest>...</ProjectManifest>          <!-- NEW in 1.1 -->
  <CognitiveFrameworks>...</CognitiveFrameworks>
  <Universe>...</Universe>
  <Characters>...</Characters>
  <TechnicalSpecifications>...</TechnicalSpecifications>
  <VisualizationResources>...</VisualizationResources>
  <SupplementaryDocuments>...</SupplementaryDocuments>
  <StoryContent>...</StoryContent>                <!-- CHANGED in 1.1 -->
  <ChronologicalTimeline>...</ChronologicalTimeline> <!-- NEW in 1.1 -->
  <WorkflowState>...</WorkflowState>               <!-- NEW in 1.1 (optional) -->
</NarrativeBucket>
```

---

## 3. XML Schema Definition

### 3.1 Root Element

#### `<NarrativeBucket>`

The root container for all narrative project data.

**Attributes:**
- `version` (required): NSL specification version (now "1.1")
- `xmlns` (optional): XML namespace (http://narrative-spittoon.org/nsl/1.1)

**Child Elements (in order):**
1. `<Metadata>` (required, singular)
2. `<ProjectManifest>` (required, singular) ← NEW in 1.1
3. `<CognitiveFrameworks>` (required, singular)
4. `<Universe>` (required, singular)
5. `<Characters>` (required, singular)
6. `<TechnicalSpecifications>` (optional, singular)
7. `<VisualizationResources>` (optional, singular)
8. `<SupplementaryDocuments>` (optional, singular)
9. `<StoryContent>` (optional, singular) ← CHANGED in 1.1 (was StoryPages)
10. `<ChronologicalTimeline>` (optional, singular) ← NEW in 1.1
11. `<WorkflowState>` (optional, singular) ← NEW in 1.1

---

### 3.2 Metadata Section (Enhanced)

#### `<Metadata>`

Contains project-level information and configuration.

**Child Elements:**

```xml
<Metadata>
  <Title>String</Title>                      <!-- required -->
  <Author>String</Author>                     <!-- optional -->
  <Created>ISO-8601 Date</Created>            <!-- optional -->
  <Modified>ISO-8601 Date</Modified>          <!-- optional -->
  <Version>String</Version>                   <!-- optional -->
  <Description>String</Description>           <!-- optional -->
  <Genre>String</Genre>                       <!-- optional -->
  <StoryStructure>String</StoryStructure>     <!-- optional -->
  
  <!-- NEW in 1.1: Series information -->
  <SeriesInfo>                                <!-- optional -->
    <Type>trilogy|series|standalone|anthology</Type>
    <TotalVolumes>Integer</TotalVolumes>
    <CurrentVolume>all|Integer</CurrentVolume>
    <VolumeTitles>
      <Volume number="Integer">String</Volume>
    </VolumeTitles>
    <CompletionStatus>in-progress|complete</CompletionStatus>
  </SeriesInfo>
  
  <Tags>                                      <!-- optional -->
    <Tag>String</Tag>
  </Tags>
  <CustomFields>                              <!-- optional -->
    <Field key="String">Value</Field>
  </CustomFields>
</Metadata>
```

**New Elements in 1.1:**

- **SeriesInfo**: Describes multi-volume projects
  - **Type**: Project type (trilogy, series, standalone, anthology)
  - **TotalVolumes**: Number of books/volumes
  - **CurrentVolume**: "all" for complete series, number for partial
  - **VolumeTitles**: Individual book titles
  - **CompletionStatus**: Series completion state

---

### 3.3 ProjectManifest Section (NEW in 1.1)

#### `<ProjectManifest>`

**Purpose**: Human/AI-readable overview of bucket contents and usage guidance.

**Replaces**: The functionality of project-instructions.md files in folder-based buckets.

```xml
<ProjectManifest>
  <Overview>
    Brief description of narrative project: genre, setting summary,
    distinctive approach, and key themes.
  </Overview>
  
  <ComponentIndex>
    <ComponentGroup name="String">
      <Component ref="element-id" type="framework|world|character|spec|viz|doc">
        <Description>What this component contains</Description>
        <Usage>When and how to use this component</Usage>
      </Component>
    </ComponentGroup>
  </ComponentIndex>
  
  <UsageGuidelines>
    <Guideline context="story-generation|dialogue-writing|quality-assessment|etc">
      Guidance text for this context
    </Guideline>
  </UsageGuidelines>
  
  <KeyConcepts>                               <!-- optional -->
    <Concept id="unique-id">
      <Name>Concept name</Name>
      <Description>Brief description</Description>
      <References>
        <Ref type="..." target="...">Context</Ref>
      </References>
    </Concept>
  </KeyConcepts>
</ProjectManifest>
```

**Benefits**:
- Quick understanding without parsing full XML
- AI can identify available components
- Guides proper usage of bucket contents
- Documents key narrative concepts

---

### 3.4 Cognitive Frameworks Section (Unchanged)

#### `<CognitiveFrameworks>`

Contains the three core instruction sets that guide narrative generation.

```xml
<CognitiveFrameworks>
  <NarrativeSpittoon format="markdown">
    <Content><![CDATA[
      # Narrative framework content
    ]]></Content>
  </NarrativeSpittoon>
  
  <GhostWritingStyle format="markdown">
    <Content><![CDATA[
      # Ghost writing style guide
    ]]></Content>
  </GhostWritingStyle>
  
  <HolographicTutor format="markdown">
    <Content><![CDATA[
      # Evaluation framework
    ]]></Content>
  </HolographicTutor>
</CognitiveFrameworks>
```

*Note: See NSL-improvement-recommendations.md for optional Sections enhancement (deferred to 1.2)*

---

### 3.5 Universe Section (Unchanged from 1.0)

#### `<Universe>`

Contains world-building and setting information.

```xml
<Universe>
  <WorldDescription format="markdown">
    <!-- Complete world description -->
  </WorldDescription>
  
  <Setting>
    <Era>String</Era>
    <Location>String</Location>
    <Environment>String</Environment>
  </Setting>
  
  <History format="markdown">...</History>
  <Geography format="markdown">...</Geography>
  <Architecture format="markdown">...</Architecture>
  
  <Districts>
    <District id="unique-id">
      <Name>String</Name>
      <Description>String</Description>
      <!-- Additional fields as needed -->
    </District>
  </Districts>
  
  <PowerStructures format="markdown">...</PowerStructures>
  <Technology format="markdown">...</Technology>
  <Culture format="markdown">...</Culture>
</Universe>
```

---

### 3.6 Characters Section (ENHANCED in 1.1)

#### `<Characters>`

Defines all characters with comprehensive attributes.

```xml
<Characters>
  <Character id="unique-character-id">
    <!-- CORE IDENTITY -->
    <Name>String</Name>
    <Age>Integer</Age>
    <Heritage>String</Heritage>
    <Description>String</Description>
    <Personality>String</Personality>
    <Role>String</Role>
    
    <!-- PHYSICAL ATTRIBUTES (Enhanced) -->
    <PhysicalAttributes>
      <Build>String</Build>
      <Height>String</Height>
      <Hair>String</Hair>
      <Eyes>String</Eyes>
      <DistinguishingMarks>String</DistinguishingMarks>
      <VocalQuality>String</VocalQuality>  <!-- NEW in 1.1 -->
    </PhysicalAttributes>
    
    <Quirks>
      <Quirk>String</Quirk>
    </Quirks>
    
    <Background format="markdown">
      <!-- Detailed background story -->
    </Background>
    
    <!-- SPEECH STYLE (Enhanced) -->
    <SpeechStyle>
      <VocalQuality>String</VocalQuality>
      <Vocabulary>String</Vocabulary>
      <SentenceStructure>String</SentenceStructure>
      
      <SpeakingPatterns>
        <Pattern>String</Pattern>
      </SpeakingPatterns>
      
      <Catchphrases>
        <Phrase>String</Phrase>
      </Catchphrases>
      
      <!-- NEW in 1.1: Extended dialogue examples -->
      <SampleDialogue><![CDATA[
        Multi-paragraph dialogue example demonstrating character's
        speech patterns, rhythm, vocabulary, verbal tics, and 
        emotional range in context.
      ]]></SampleDialogue>
      
      <EmotionalTells>
        <WhenNervous>String</WhenNervous>
        <WhenExcited>String</WhenExcited>
        <WhenAngry>String</WhenAngry>
        <WhenSad>String</WhenSad>
      </EmotionalTells>
      
      <CulturalInfluences>String</CulturalInfluences>
    </SpeechStyle>
    
    <!-- NEW in 1.1: Psychology (separate from Personality) -->
    <Psychology>
      <PrimaryMotivation>String</PrimaryMotivation>
      <Fears>
        <Fear>String</Fear>
      </Fears>
      <Desires>
        <Desire>String</Desire>
      </Desires>
      <Contradictions>
        <Contradiction>String</Contradiction>
      </Contradictions>
    </Psychology>
    
    <!-- NEW in 1.1: Narrative Function -->
    <NarrativeFunction>
      <Archetype>String</Archetype>           <!-- e.g., "Reluctant Hero", "Mentor", "Betrayer" -->
      <GrowthArc>String</GrowthArc>           <!-- Character development trajectory -->
      <StoryRole>String</StoryRole>           <!-- Function in narrative -->
    </NarrativeFunction>
    
    <!-- NEW in 1.1: Status Trackers for dynamic state -->
    <StatusTrackers>
      <Tracker id="unique-tracker-id" type="numeric|categorical|boolean">
        <Name>String</Name>
        <Description>String</Description>
        <CurrentValue>String</CurrentValue>
        <Range min="number" max="number"/>   <!-- for numeric type -->
        <Unit>String</Unit>                   <!-- optional, e.g., "jovs", "%" -->
      </Tracker>
    </StatusTrackers>
    
    <Relationships>
      <Relationship target="character-id" type="String">
        String
      </Relationship>
    </Relationships>
    
    <!-- NEW in 1.1: Series progression (for multi-volume projects) -->
    <SeriesProgression>                       <!-- optional -->
      <VolumeState volume="Integer" timeline="String">
        <PsychologicalState>String</PsychologicalState>
        <PhysicalStatus>String</PhysicalStatus>
        <Equipment>String</Equipment>
        <Relationships>
          <Relationship target="character-id" status="String"/>
        </Relationships>
        <KeyDevelopment>String</KeyDevelopment>
        <KeyQuotes>
          <Quote>String</Quote>
        </KeyQuotes>
      </VolumeState>
    </SeriesProgression>
    
    <!-- NEW in 1.1: Alternative format links -->
    <AlternativeFormats>                      <!-- optional -->
      <Format type="json|markdown" ref="spec-or-doc-id">
        Description of alternative representation
      </Format>
    </AlternativeFormats>
    
    <!-- NEW in 1.1: Narrative profile (long-form) -->
    <NarrativeProfile format="markdown"><![CDATA[  <!-- optional -->
      Extended character essay with voice, background, 
      relationships, and role in story. Human-readable format.
    ]]></NarrativeProfile>
    
    <!-- NEW in 1.1: Cross-references -->
    <References>                              <!-- optional -->
      <Ref type="location|glossary|specification|etc" 
           target="element-id" 
           context="String">
        Optional description
      </Ref>
    </References>
  </Character>
</Characters>
```

**New in 1.1**:
- VocalQuality in PhysicalAttributes
- SampleDialogue for extended speech examples
- Psychology subsection for deeper motivations
- NarrativeFunction for story role metadata
- StatusTrackers for dynamic character state
- SeriesProgression for multi-volume character arcs
- AlternativeFormats for dual representation support
- NarrativeProfile for human-readable essays
- References for cross-linking

---

### 3.7 Technical Specifications Section (Unchanged)

```xml
<TechnicalSpecifications>
  <Specification id="unique-spec-id" format="json|yaml|xml" type="String">
    <Title>String</Title>                    <!-- optional -->
    <Description>String</Description>        <!-- optional -->
    <Content><![CDATA[
      <!-- Embedded technical data -->
    ]]></Content>
  </Specification>
</TechnicalSpecifications>
```

---

### 3.8 Visualization Resources Section (Unchanged)

```xml
<VisualizationResources>
  <Visualization id="unique-viz-id" format="mermaid|dot|svg" type="String">
    <Title>String</Title>
    <Description>String</Description>
    <Content><![CDATA[
      <!-- Diagram code -->
    ]]></Content>
  </Visualization>
</VisualizationResources>
```

---

### 3.9 Supplementary Documents Section (ENHANCED in 1.1)

#### `<SupplementaryDocuments>`

Additional supporting materials and reference documents.

```xml
<SupplementaryDocuments>
  <!-- Standard document format -->
  <Document id="unique-doc-id" format="markdown|text" type="String">
    <Title>String</Title>
    <Description>String</Description>
    <Content><![CDATA[
      <!-- Document content -->
    ]]></Content>
  </Document>
  
  <!-- NEW in 1.1: Structured glossary format -->
  <Document id="glossary" format="structured" type="glossary">
    <Title>String</Title>
    <Description>String</Description>
    
    <GlossaryCategories>
      <Category id="category-id">
        <Name>String</Name>
        <Description>String</Description>
        
        <Terms>
          <Term id="term-id">
            <Name>String</Name>
            <AlternateNames>
              <Name>String</Name>
            </AlternateNames>
            <Definition>String</Definition>
            <Usage>String</Usage>
            <Etymology>String</Etymology>      <!-- optional -->
            <RelatedTerms>
              <TermRef category="String" term="String"/>
            </RelatedTerms>
            <References>
              <Ref type="String" target="String"/>
            </References>
          </Term>
        </Terms>
      </Category>
    </GlossaryCategories>
  </Document>
</SupplementaryDocuments>
```

**New in 1.1**: Structured glossary format with:
- Category organization
- Term relationships
- Cross-references to other content
- Etymology and usage examples

---

### 3.10 StoryContent Section (MAJOR CHANGE in 1.1)

#### `<StoryContent>`

**Replaces**: `<StoryPages>` from NSL 1.0

**Purpose**: Support both single narratives and multi-volume series.

**Backward Compatibility**: `<StoryPages>` remains valid, treated as `<StoryContent type="single"><SingleNarrative>`

#### For Single Narratives

```xml
<StoryContent type="single">
  <SingleNarrative structure="6-page-inversion">
    
    <!-- NEW in 1.1: Structure metadata -->
    <StructureMetadata>
      <Methodology>reverse-chronological</Methodology>
      <StartingPage>5</StartingPage>
      <GenerationOrder>5,4,3,2,1,0</GenerationOrder>
      
      <HeroJourneyMapping reversed="true">    <!-- optional -->
        <Stage page="Integer" name="String" description="String"/>
      </HeroJourneyMapping>
    </StructureMetadata>
    
    <Pages>
      <Page number="Integer" status="completed|draft|outline" revision="Integer">
        <Title>String</Title>
        <Content format="markdown"><![CDATA[
          <!-- Page content -->
        ]]></Content>
        
        <!-- NEW in 1.1: Workflow metadata -->
        <WorkflowMetadata>                    <!-- optional -->
          <WrittenAfter pageRef="Integer"/>
          <DependsOn pageRef="Integer">String</DependsOn>
          <HeroJourneyStage>String</HeroJourneyStage>
          
          <GenerationContext>
            <GeneratedBy>String</GeneratedBy>
            <GeneratedOn>ISO-8601 Date</GeneratedOn>
            <FrameworksApplied>
              <Framework>String</Framework>
            </FrameworksApplied>
          </GenerationContext>
          
          <RevisionHistory>
            <Revision number="Integer" date="ISO-8601 Date">
              <Author>String</Author>
              <Changes>String</Changes>
            </Revision>
          </RevisionHistory>
        </WorkflowMetadata>
        
        <Metadata>
          <Created>ISO-8601 Date</Created>
          <Modified>ISO-8601 Date</Modified>
          <WordCount>Integer</WordCount>
          <Notes>String</Notes>
          
          <!-- NEW in 1.1: Quality assessment -->
          <QualityAssessment>             <!-- optional -->
            <Score assessor="String" date="ISO-8601 Date">
              <Value>Integer</Value>
              <MaxValue>Integer</MaxValue>
              <Notes>String</Notes>
            </Score>
          </QualityAssessment>
        </Metadata>
      </Page>
    </Pages>
  </SingleNarrative>
</StoryContent>
```

#### For Multi-Volume Series

```xml
<StoryContent type="series">
  <SeriesMetadata>
    <TotalVolumes>Integer</TotalVolumes>
    <VolumeStructure>String</VolumeStructure>
    <Methodology>String</Methodology>
  </SeriesMetadata>
  
  <Volumes>
    <Volume number="Integer" id="unique-volume-id">
      <VolumeMetadata>
        <Title>String</Title>
        <Subtitle>String</Subtitle>          <!-- optional -->
        <Timeline>String</Timeline>
        <Status>completed|draft|outline</Status>
        <WordCount>Integer</WordCount>
        <Created>ISO-8601 Date</Created>
        <Modified>ISO-8601 Date</Modified>
      </VolumeMetadata>
      
      <!-- NEW in 1.1: Volume summary (distinct from pages) -->
      <VolumeSummary format="markdown"><![CDATA[
        # Book [Number]: [Title] - Narrative Summary
        
        ## Overview
        [Plot overview]
        
        ## Character Arcs
        [Character development in this volume]
        
        ## Major Plot Events
        [Key events]
        
        ## Central Themes
        [Themes explored]
        
        ## Connections
        [Links to other volumes]
      ]]></VolumeSummary>
      
      <!-- Story pages for this volume -->
      <Pages structure="6-page-inversion">
        <StructureMetadata>...</StructureMetadata>
        <Page number="Integer">...</Page>
      </Pages>
      
      <!-- NEW in 1.1: Volume conclusion metadata -->
      <VolumeNotes>
        <Themes>
          <Theme>String</Theme>
        </Themes>
        <Cliffhanger>String</Cliffhanger>
        <LeadsInto volume="Integer">String</LeadsInto>
        <CharacterStateChanges>
          <Character ref="character-id">String</Character>
        </CharacterStateChanges>
      </VolumeNotes>
    </Volume>
  </Volumes>
  
  <!-- NEW in 1.1: Series-level arc tracking -->
  <SeriesArc>
    <CharacterDevelopment>
      <Character ref="character-id">
        <VolumeArc volume="Integer">String</VolumeArc>
        <OverallArc>String</OverallArc>
      </Character>
    </CharacterDevelopment>
    
    <ThematicProgression>
      <Volume number="Integer" theme="String"/>
      <SeriesTheme>String</SeriesTheme>
    </ThematicProgression>
  </SeriesArc>
</StoryContent>
```

**New in 1.1**:
- Volume hierarchy for series organization
- VolumeSummary for comprehensive book overviews
- VolumeNotes for inter-book connections
- SeriesArc for tracking development across volumes
- StructureMetadata for methodology documentation
- WorkflowMetadata for generation tracking

---

### 3.11 ChronologicalTimeline Section (NEW in 1.1)

#### `<ChronologicalTimeline>`

**Purpose**: Structured event log parallel to narrative pages. Factual chronology for complex narratives.

```xml
<ChronologicalTimeline format="structured">
  <TimelineMetadata>
    <StartDate>String</StartDate>
    <EndDate>String</EndDate>
    <TotalEntries>Integer</TotalEntries>
    <TimeScale>String</TimeScale>            <!-- e.g., "Mission Days", "Story Days" -->
    <Purpose>String</Purpose>
  </TimelineMetadata>
  
  <Events>
    <Event id="unique-event-id" day="Integer" timestamp="String">
      <Priority>HIGH|MEDIUM|LOW|CRITICAL</Priority>
      <Category>String</Category>
      <Author>String</Author>                <!-- In-universe author if applicable -->
      <Title>String</Title>
      <Content><![CDATA[
        Event description or log entry content
      ]]></Content>
      
      <Metadata>
        <CustomField key="String">Value</CustomField>
      </Metadata>
      
      <!-- NEW in 1.1: Cross-references to narrative -->
      <References>
        <PageRef volume="Integer" number="Integer">
          How this event relates to story page
        </PageRef>
        <CharacterRef>character-id</CharacterRef>
        <LocationRef>location-id</LocationRef>
      </References>
    </Event>
  </Events>
</ChronologicalTimeline>
```

**Use Cases**:
- Mission logs (as in GIANT)
- Historical timelines
- Character life events
- World history chronology
- Plot point verification

---

### 3.12 WorkflowState Section (NEW in 1.1, Optional)

#### `<WorkflowState>`

**Purpose**: Track work-in-progress narrative bucket status.

```xml
<WorkflowState status="active|paused|completed">
  <CurrentPhase>String</CurrentPhase>
  <PhaseProgress>
    <Phase name="String" status="completed|in-progress|pending">
      <CurrentPage>Integer</CurrentPage>     <!-- if applicable -->
      <TotalPages>Integer</TotalPages>
      <CompletionPercentage>Integer</CompletionPercentage>
    </Phase>
  </PhaseProgress>
  
  <LastModified>ISO-8601 Date</LastModified>
  <NextSteps>
    <Step>String</Step>
  </NextSteps>
</WorkflowState>
```

**Usage**: Optional section for active projects. Omit for final/published buckets.

---

## 4. Cross-Reference System (NEW in 1.1)

### 4.1 Reference Types

NSL 1.1 defines standard cross-reference types:

- `character` - References a character element
- `location` - References a place/district
- `glossary` - References a term definition
- `specification` - References technical data
- `visualization` - References a diagram
- `world` - References world-building content
- `framework` - References cognitive framework
- `event` - References timeline event
- `page` - References story page
- `volume` - References book/volume
- `custom` - User-defined reference type

### 4.2 Reference Formats

#### Inline References (Simple)

```xml
<Description>
  Lives in <ref type="location" target="lower-deck">Lower Deck</ref>,
  carries <ref type="glossary" target="jov">78 jovs</ref>.
</Description>
```

#### Structured References (Comprehensive)

```xml
<References>
  <Ref type="location" target="lower-deck" context="residence">
    Primary living location
  </Ref>
  <Ref type="glossary" target="jov" context="status">
    Radiation exposure level
  </Ref>
</References>
```

#### Hybrid Approach (Recommended)

Use inline `<ref>` tags within narrative text AND structured `<References>` sections for explicit relationships.

### 4.3 Reference Attributes

- `type` (required): Reference type from standard list
- `target` (required): ID of referenced element
- `context` (optional): Relationship context
- Text content: Optional description

---

## 5. Data Types and Constraints

### 5.1 String Types

- **String**: Unicode text, no length restriction unless specified
- **ID**: Lowercase alphanumeric with hyphens, must be unique within scope
- **ISO-8601 Date**: Standard date/time format (YYYY-MM-DDTHH:MM:SSZ)

### 5.2 Numeric Types

- **Integer**: Whole number (e.g., age, word count, volume number)

### 5.3 Enumerated Types

**Format Types:**
- `markdown` - Markdown formatted text
- `text` - Plain text
- `json` - JSON data structure
- `yaml` - YAML data structure
- `xml` - XML data structure
- `structured` - NSL-defined structure (e.g., glossaries)
- `html` - HTML formatted text
- `mermaid` - Mermaid diagram syntax
- `dot` - GraphViz DOT syntax
- `svg` - Scalable Vector Graphics

**SeriesInfo Types:**
- `trilogy` - Three-volume series
- `series` - Ongoing multi-volume
- `standalone` - Single narrative
- `anthology` - Collection of related stories

**Priority Levels:**
- `CRITICAL` - Highest priority
- `HIGH` - Important
- `MEDIUM` - Normal
- `LOW` - Informational

---

## 6. Validation Rules

### 6.1 Required Elements

The following elements are required in every NSL 1.1 file:
- `<NarrativeBucket>` with version="1.1" attribute
- `<Metadata>` with `<Title>`
- `<ProjectManifest>` with at least `<Overview>`
- `<CognitiveFrameworks>` with all three frameworks
- `<Universe>` with at least `<WorldDescription>`
- `<Characters>` with at least one `<Character>`

### 6.2 ID Uniqueness

All `id` attributes must be unique within their scope:
- Character IDs unique within `<Characters>`
- District IDs unique within `<Districts>`
- Specification IDs unique within `<TechnicalSpecifications>`
- Visualization IDs unique within `<VisualizationResources>`
- Document IDs unique within `<SupplementaryDocuments>`
- Event IDs unique within `<ChronologicalTimeline>`
- Volume IDs unique within `<StoryContent>`

### 6.3 Reference Integrity

- All `target` attributes in `<Ref>` elements must reference valid IDs
- `<PageRef>` volume attributes must reference existing volumes
- Character relationship `target` attributes must reference valid character IDs
- Term `<TermRef>` elements must reference valid terms

### 6.4 Content Encoding

- Use CDATA sections for content containing special XML characters
- Ensure UTF-8 encoding throughout
- Escape XML entities when not using CDATA: `&amp;` `&lt;` `&gt;` `&quot;` `&apos;`

### 6.5 Series Validation

For multi-volume projects (`<StoryContent type="series">`):
- `<Metadata><SeriesInfo>` must be present
- TotalVolumes must match actual Volume count
- Volume numbers must be sequential starting from 1
- Volume IDs must be unique

---

## 7. Usage Examples

### 7.1 Minimal NSL 1.1 File

```xml
<?xml version="1.0" encoding="UTF-8"?>
<NarrativeBucket version="1.1">
  <Metadata>
    <Title>My Story Project</Title>
    <Created>2025-10-18T08:00:00Z</Created>
    <StoryStructure>6-page-inversion</StoryStructure>
  </Metadata>
  
  <ProjectManifest>
    <Overview>
      A short mystery story set in a noir city using the 
      Narrative Spittoon Inversion framework.
    </Overview>
    
    <ComponentIndex>
      <ComponentGroup name="Cognitive Frameworks">
        <Component ref="narrative-spittoon" type="framework">
          <Description>Implicit causality framework</Description>
          <Usage>Apply when generating story content</Usage>
        </Component>
        <Component ref="ghost-writing-style" type="framework">
          <Description>Style guide for prose</Description>
          <Usage>Reference for dialogue and pacing</Usage>
        </Component>
        <Component ref="holographic-tutor" type="framework">
          <Description>Quality evaluation system</Description>
          <Usage>Assess completed pages</Usage>
        </Component>
      </ComponentGroup>
    </ComponentIndex>
    
    <UsageGuidelines>
      <Guideline context="story-generation">
        Load world and character profiles before writing
      </Guideline>
    </UsageGuidelines>
  </ProjectManifest>
  
  <CognitiveFrameworks>
    <NarrativeSpittoon format="markdown"><![CDATA[
# Narrative Spittoon Framework
[Framework content]
    ]]></NarrativeSpittoon>
    
    <GhostWritingStyle format="markdown"><![CDATA[
# Ghost Writing Style
[Style guide content]
    ]]></GhostWritingStyle>
    
    <HolographicTutor format="markdown"><![CDATA[
# Holographic Tutor
[Evaluation framework]
    ]]></HolographicTutor>
  </CognitiveFrameworks>
  
  <Universe>
    <WorldDescription format="markdown"><![CDATA[
# World Setting
A mysterious noir city where...
    ]]></WorldDescription>
  </Universe>
  
  <Characters>
    <Character id="protagonist">
      <Name>Jane Doe</Name>
      <Age>32</Age>
      <Description>A determined investigator</Description>
      <Role>Protagonist</Role>
      
      <SpeechStyle>
        <Vocabulary>Professional but accessible</Vocabulary>
        <SampleDialogue><![CDATA[
"Look, I've been doing this for ten years. Trust me when I 
say something's not right about this case."
        ]]></SampleDialogue>
      </SpeechStyle>
      
      <Psychology>
        <PrimaryMotivation>Justice for victims</PrimaryMotivation>
        <Fears>
          <Fear>Failing to solve case</Fear>
        </Fears>
      </Psychology>
      
      <NarrativeFunction>
        <Archetype>Determined Detective</Archetype>
        <GrowthArc>From cynicism to renewed hope</GrowthArc>
        <StoryRole>Protagonist and POV character</StoryRole>
      </NarrativeFunction>
    </Character>
  </Characters>
</NarrativeBucket>
```

### 7.2 Complete Single-Narrative Example

*See NSL 1.0 specification examples - all remain valid in 1.1 with enhanced features available*

### 7.3 Trilogy Series Example (GIANT-Based)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<NarrativeBucket version="1.1">
  <Metadata>
    <Title>Land of the Giants</Title>
    <Author>Creative Team</Author>
    <Created>2025-08-01T10:00:00Z</Created>
    <Modified>2025-10-15T14:00:00Z</Modified>
    <Version>1.0</Version>
    <Description>
      Four scientists complete humanity's first hyperspace jump, only to 
      crash on an impossible world where Milwaukee exists at giant scale.
    </Description>
    <Genre>Science Fiction, Survival Horror, Philosophical</Genre>
    <StoryStructure>trilogy-6-page-inversion</StoryStructure>
    
    <SeriesInfo>
      <Type>trilogy</Type>
      <TotalVolumes>3</TotalVolumes>
      <CurrentVolume>all</CurrentVolume>
      <VolumeTitles>
        <Volume number="1">The Jump</Volume>
        <Volume number="2">The Aftermath</Volume>
        <Volume number="3">Operations and Acceptance</Volume>
      </VolumeTitles>
      <CompletionStatus>complete</CompletionStatus>
    </SeriesInfo>
    
    <Tags>
      <Tag>hard-sci-fi</Tag>
      <Tag>trilogy</Tag>
      <Tag>existential-horror</Tag>
    </Tags>
  </Metadata>
  
  <ProjectManifest>
    <Overview>
      Trilogy following four Milwaukee scientists who complete humanity's 
      first hyperspace jump. They crash on an alien world 5 light-years from 
      Earth - except the world is Milwaukee at giant scale, and the giants 
      are genetically human. Mouse-sized and stranded, they must survive 
      while grappling with impossible reality.
    </Overview>
    
    <ComponentIndex>
      <ComponentGroup name="Cognitive Frameworks">
        <Component ref="narrative-spittoon" type="framework">
          <Description>Implicit causality narrative framework</Description>
          <Usage>Apply during all story generation</Usage>
        </Component>
        <Component ref="ghost-writing-style" type="framework">
          <Description>Thompson-Sanderson-Ritchie synthesis style guide</Description>
          <Usage>Reference for voice, pacing, dialogue techniques</Usage>
        </Component>
        <Component ref="holographic-tutor" type="framework">
          <Description>Quality evaluation with Score/Review/Critic/Weakness functions</Description>
          <Usage>Assess completed pages and volumes</Usage>
        </Component>
      </ComponentGroup>
      
      <ComponentGroup name="Characters">
        <Component ref="thomas" type="character">
          <Description>Mission Commander (Logos archetype) - physicist</Description>
          <Usage>POV for analytical/command perspective</Usage>
        </Component>
        <Component ref="john" type="character">
          <Description>Medical Officer (Ethos archetype) - bioethicist</Description>
          <Usage>Moral authority and team conscience</Usage>
        </Component>
        <Component ref="peter" type="character">
          <Description>Communications Officer (Pathos archetype) - psychologist</Description>
          <Usage>Emotional perspective and team dynamics</Usage>
        </Component>
        <Component ref="judas" type="character">
          <Description>Systems Engineer (Dark Triad archetype)</Description>
          <Usage>Technical expertise and internal conflict source</Usage>
        </Component>
      </ComponentGroup>
      
      <ComponentGroup name="World Building">
        <Component ref="world-description" type="world">
          <Description>Milwaukee at giant scale, scale physics, mission context</Description>
          <Usage>Load for setting and environmental context</Usage>
        </Component>
        <Component ref="giant-glossary" type="doc">
          <Description>100+ universe-specific terms across 14 categories</Description>
          <Usage>Reference for authentic dialogue and descriptions</Usage>
        </Component>
      </ComponentGroup>
      
      <ComponentGroup name="Technical Specifications">
        <Component ref="base-infrastructure" type="spec">
          <Description>Base Alpha underground sanctuary specifications</Description>
          <Usage>Reference for base scenes and equipment</Usage>
        </Component>
        <Component ref="mission-log" type="timeline">
          <Description>22 chronological entries Day 0-90+</Description>
          <Usage>Timeline consistency checking</Usage>
        </Component>
      </ComponentGroup>
    </ComponentIndex>
    
    <UsageGuidelines>
      <Guideline context="story-generation">
        Load world description and all character profiles. Reference 
        mission log for timeline consistency. Apply both NarrativeSpittoon 
        and ghost-writing-style frameworks.
      </Guideline>
      <Guideline context="dialogue-writing">
        Reference character speech styles and sample dialogue. Use 
        glossary terms for authentic universe vocabulary.
      </Guideline>
      <Guideline context="quality-assessment">
        Use HolographicTutor Score function for initial assessment,
        followed by Review for detailed feedback.
      </Guideline>
    </UsageGuidelines>
    
    <KeyConcepts>
      <Concept id="apostle-archetypes">
        <Name>Four Apostle Archetypes</Name>
        <Description>
          Characters named after biblical apostles representing philosophical
          positions: Logos (Thomas), Ethos (John), Pathos (Peter), Dark Triad (Judas)
        </Description>
        <References>
          <Ref type="character" target="thomas">Logos - Logic and reason</Ref>
          <Ref type="character" target="john">Ethos - Ethics and morality</Ref>
          <Ref type="character" target="peter">Pathos - Emotion and empathy</Ref>
          <Ref type="character" target="judas">Dark Triad - Self-interest</Ref>
          <Ref type="visualization" target="character-archetypes">Visual diagram</Ref>
        </References>
      </Concept>
      
      <Concept id="impossible-milwaukee">
        <Name>The Impossible Paradox</Name>
        <Description>
          Star charts confirm 5 light-year travel. All evidence confirms 
          Milwaukee. Both verified. Both impossible. Central mystery.
        </Description>
        <References>
          <Ref type="world" target="world-description">Setting details</Ref>
          <Ref type="event" target="LOG_070">Star chart confirmation</Ref>
          <Ref type="glossary" target="impossible-familiarity">Glossary term</Ref>
        </References>
      </Concept>
    </KeyConcepts>
  </ProjectManifest>
  
  <!-- Frameworks, Universe, Characters would follow here -->
  
  <StoryContent type="series">
    <SeriesMetadata>
      <TotalVolumes>3</TotalVolumes>
      <VolumeStructure>6-page-inversion per volume</VolumeStructure>
      <Methodology>reverse-chronological within each volume</Methodology>
    </SeriesMetadata>
    
    <Volumes>
      <Volume number="1" id="book-one">
        <VolumeMetadata>
          <Title>The Jump</Title>
          <Subtitle>Humanity's first leap into the stars</Subtitle>
          <Timeline>Recruitment through Day 0 (crash)</Timeline>
          <Status>completed</Status>
          <WordCount>42000</WordCount>
        </VolumeMetadata>
        
        <VolumeSummary format="markdown"><![CDATA[
# Book One: The Jump - Narrative Summary

## Overview
Book One chronicles humanity's first hyperspace jump mission, from 
recruitment through catastrophic crash landing...

[8000+ word comprehensive summary]
        ]]></VolumeSummary>
        
        <Pages structure="6-page-inversion">
          <!-- 6 pages -->
        </Pages>
        
        <VolumeNotes>
          <Themes>
            <Theme>Theory vs Reality</Theme>
            <Theme>Perfect Data, Imperfect Truth</Theme>
          </Themes>
          <Cliffhanger>
            Swimming toward alien shore, certainty shattered
          </Cliffhanger>
          <LeadsInto volume="2">
            Shore landing and scale discovery
          </LeadsInto>
        </VolumeNotes>
      </Volume>
      
      <Volume number="2" id="book-two">
        <!-- Book Two structure -->
      </Volume>
      
      <Volume number="3" id="book-three">
        <!-- Book Three structure -->
      </Volume>
    </Volumes>
    
    <SeriesArc>
      <CharacterDevelopment>
        <Character ref="thomas">
          <VolumeArc volume="1">Certainty to crash</VolumeArc>
          <VolumeArc volume="2">Acceptance of impossibility</VolumeArc>
          <VolumeArc volume="3">Philosophical surrender</VolumeArc>
          <OverallArc>Faith in mathematics to journey over destination</OverallArc>
        </Character>
      </CharacterDevelopment>
      
      <ThematicProgression>
        <Volume number="1" theme="Can we do this?"/>
        <Volume number="2" theme="Where are we?"/>
        <Volume number="3" theme="Can we accept not knowing?"/>
        <SeriesTheme>The journey matters more than the destination</SeriesTheme>
      </ThematicProgression>
    </SeriesArc>
  </StoryContent>
  
  <ChronologicalTimeline format="structured">
    <TimelineMetadata>
      <StartDate>Mission Day 0</StartDate>
      <EndDate>Mission Day 90+</EndDate>
      <TotalEntries>22</TotalEntries>
      <TimeScale>Mission Days</TimeScale>
    </TimelineMetadata>
    
    <Events>
      <Event id="LOG_000" day="0" timestamp="Launch Minus 60 Minutes">
        <Priority>HIGH</Priority>
        <Category>PRE-LAUNCH</Category>
        <Author>Thomas</Author>
        <Title>Final Systems Check</Title>
        <Content><![CDATA[
All systems nominal. Hyperspace drive at full charge...
        ]]></Content>
        <Metadata>
          <CustomField key="crew_status">ALL_OPERATIONAL</CustomField>
        </Metadata>
        <References>
          <PageRef volume="1" number="4">Launch sequence narrative</PageRef>
        </References>
      </Event>
      <!-- More events -->
    </Events>
  </ChronologicalTimeline>
</NarrativeBucket>
```

---

## 8. Migration Guide

### 8.1 NSL 1.0 to 1.1 Migration

**Compatibility**: All NSL 1.0 files are valid NSL 1.1 files.

**Optional Enhancements**: Add new 1.1 features as desired.

#### Step 1: Update Version Attribute

```xml
<!-- Change -->
<NarrativeBucket version="1.0">
<!-- To -->
<NarrativeBucket version="1.1">
```

#### Step 2: Add ProjectManifest

Create after Metadata, before CognitiveFrameworks:

```xml
<ProjectManifest>
  <Overview>[Project description]</Overview>
  <ComponentIndex>
    <!-- Map existing content to components -->
  </ComponentIndex>
  <UsageGuidelines>
    <!-- Add usage guidance -->
  </UsageGuidelines>
</ProjectManifest>
```

#### Step 3: Enhance Characters (Optional)

Add new subsections to existing characters:

```xml
<Character id="existing-character">
  <!-- Existing elements unchanged -->
  
  <!-- Add new 1.1 elements -->
  <Psychology>...</Psychology>
  <NarrativeFunction>...</NarrativeFunction>
  <StatusTrackers>...</StatusTrackers>
  <!-- etc -->
</Character>
```

#### Step 4: Convert StoryPages to StoryContent (Optional)

```xml
<!-- NSL 1.0 -->
<StoryPages structure="6-page">
  <Page number="0">...</Page>
</StoryPages>

<!-- NSL 1.1 equivalent -->
<StoryContent type="single">
  <SingleNarrative structure="6-page">
    <Pages>
      <Page number="0">...</Page>
    </Pages>
  </SingleNarrative>
</StoryContent>
```

**Note**: `<StoryPages>` remains valid, automatically treated as single narrative.

#### Step 5: Add Series Support (If Applicable)

For multi-volume projects, restructure:

```xml
<Metadata>
  <SeriesInfo>
    <Type>trilogy</Type>
    <TotalVolumes>3</TotalVolumes>
    <!-- etc -->
  </SeriesInfo>
</Metadata>

<StoryContent type="series">
  <Volumes>
    <Volume number="1">...</Volume>
    <Volume number="2">...</Volume>
    <Volume number="3">...</Volume>
  </Volumes>
  <SeriesArc>...</SeriesArc>
</StoryContent>
```

### 8.2 Folder Structure to NSL 1.1

#### From Single-Narrative Bucket (Moonbase Pattern)

1. Read all files in bucket folder
2. Map to NSL 1.1 structure:
   - Core frameworks → CognitiveFrameworks
   - World files → Universe
   - Character files → Characters (use enhanced schema)
   - JSON specs → TechnicalSpecifications
   - Mermaid diagrams → VisualizationResources
   - Glossaries → SupplementaryDocuments (use structured format)
   - project-instructions → ProjectManifest
3. Add cross-references where relationships exist
4. Generate NSL file

#### From Multi-Volume Bucket (GIANT Pattern)

1. Identify volume structure (book1/, book2/, book3/ folders)
2. Create SeriesInfo in Metadata
3. Map each book folder to Volume element:
   - book1/page0-5 → Volume 1 Pages
   - BOOK_ONE_SUMMARY.md → Volume 1 VolumeSummary
4. Map mission_log.json → ChronologicalTimeline
5. Map character volume states → SeriesProgression in Characters
6. Create SeriesArc from trilogy-structure-plan.md
7. Generate NSL file

---

## 9. Best Practices

### 9.1 Content Organization

1. **Use ProjectManifest effectively** - Provide clear overview and component descriptions
2. **Maintain ID consistency** - Use kebab-case, descriptive IDs
3. **Leverage cross-references** - Document relationships explicitly
4. **Include comprehensive metadata** - Aid tool development and querying
5. **Use CDATA sections** for multi-line content with special characters

### 9.2 Series Projects

1. **Always include SeriesInfo** in Metadata for multi-volume projects
2. **Provide VolumeSummary** for each book - essential for navigation
3. **Track character progression** with SeriesProgression
4. **Document SeriesArc** - thematic and character development across volumes
5. **Use ChronologicalTimeline** for complex chronologies spanning books

### 9.3 Character Development

1. **Use Psychology** to separate deep motivations from surface personality
2. **Include SampleDialogue** - extended examples better than just catchphrases
3. **Track dynamic state** with StatusTrackers for changing conditions
4. **Document NarrativeFunction** - helps AI understand story role
5. **For series: Use SeriesProgression** to track volume-specific states

### 9.4 Glossaries

1. **Use structured format** for glossaries over 30 terms
2. **Organize by category** for easier navigation
3. **Include cross-references** between related terms
4. **Provide usage examples** - show terms in context
5. **Link to other content** - connect glossary to specifications, characters

### 9.5 Version Control

1. **Store NSL files** in Git or other VCS
2. **Use meaningful commits** when updating narrative elements
3. **Tag releases** with semantic versioning
4. **For series: Consider per-volume commits** during active writing
5. **Include WorkflowState** for WIP projects, remove for releases

---

## 10. Appendix

### 10.1 Complete Schema Summary

```
NarrativeBucket (version="1.1")
├── Metadata (required)
│   ├── Title (required)
│   ├── Author, Created, Modified, Version, Description, Genre
│   ├── StoryStructure
│   ├── SeriesInfo (NEW in 1.1, optional)
│   │   ├── Type, TotalVolumes, CurrentVolume
│   │   ├── VolumeTitles
│   │   └── CompletionStatus
│   ├── Tags
│   └── CustomFields
│
├── ProjectManifest (NEW in 1.1, required)
│   ├── Overview
│   ├── ComponentIndex
│   │   └── ComponentGroup
│   │       └── Component (repeatable)
│   ├── UsageGuidelines
│   │   └── Guideline (repeatable)
│   └── KeyConcepts (optional)
│       └── Concept (repeatable)
│
├── CognitiveFrameworks (required)
│   ├── NarrativeSpittoon
│   ├── GhostWritingStyle
│   └── HolographicTutor
│
├── Universe (required)
│   ├── WorldDescription
│   ├── Setting, History, Geography, Architecture
│   ├── Districts
│   ├── PowerStructures, Technology, Culture
│
├── Characters (required)
│   └── Character (repeatable)
│       ├── Name, Age, Heritage, Description, Personality, Role
│       ├── PhysicalAttributes (VocalQuality NEW in 1.1)
│       ├── Quirks, Background
│       ├── SpeechStyle (SampleDialogue NEW in 1.1)
│       ├── Psychology (NEW in 1.1)
│       ├── NarrativeFunction (NEW in 1.1)
│       ├── StatusTrackers (NEW in 1.1)
│       ├── Relationships
│       ├── SeriesProgression (NEW in 1.1, optional for series)
│       ├── AlternativeFormats (NEW in 1.1, optional)
│       ├── NarrativeProfile (NEW in 1.1, optional)
│       └── References (NEW in 1.1, optional)
│
├── TechnicalSpecifications (optional)
│   └── Specification (repeatable)
│
├── VisualizationResources (optional)
│   └── Visualization (repeatable)
│
├── SupplementaryDocuments (optional)
│   └── Document (repeatable)
│       └── GlossaryCategories (NEW in 1.1 for structured glossaries)
│
├── StoryContent (CHANGED in 1.1, optional)
│   ├── SingleNarrative (for single narratives)
│   │   ├── StructureMetadata (NEW in 1.1)
│   │   └── Pages
│   │       └── Page (with WorkflowMetadata NEW in 1.1)
│   └── Series (NEW in 1.1, for multi-volume)
│       ├── SeriesMetadata
│       ├── Volumes
│       │   └── Volume (repeatable)
│       │       ├── VolumeMetadata
│       │       ├── VolumeSummary
│       │       ├── Pages
│       │       └── VolumeNotes
│       └── SeriesArc
│
├── ChronologicalTimeline (NEW in 1.1, optional)
│   ├── TimelineMetadata
│   └── Events
│       └── Event (repeatable, with References)
│
└── WorkflowState (NEW in 1.1, optional)
    ├── CurrentPhase, PhaseProgress
    ├── LastModified
    └── NextSteps
```

### 10.2 Glossary

- **Narrative Bucket**: Complete collection of narrative project artifacts
- **Cognitive Framework**: Instructional module guiding narrative generation
- **NSL**: Narrative Spittoon Language
- **CDATA**: Character Data section for preserving special characters in XML
- **Volume**: Individual book in a multi-volume series
- **Series Arc**: Character/thematic development across multiple volumes
- **Cross-Reference**: Link between related elements in the bucket
- **Timeline Event**: Entry in chronological event log
- **StatusTracker**: Dynamic character state (health, resources, progression)

### 10.3 Version Comparison

| Feature | NSL 1.0 | NSL 1.1 |
|---------|---------|---------|
| ProjectManifest | ❌ No | ✅ Yes (required) |
| Multi-volume support | ❌ No | ✅ Yes (full) |
| Volume summaries | ❌ No | ✅ Yes |
| Character Psychology | ❌ No | ✅ Yes |
| Character NarrativeFunction | ❌ No | ✅ Yes |
| Character StatusTrackers | ❌ No | ✅ Yes |
| Character SeriesProgression | ❌ No | ✅ Yes |
| Character SampleDialogue | ❌ No | ✅ Yes |
| Cross-reference system | ❌ No | ✅ Yes |
| ChronologicalTimeline | ❌ No | ✅ Yes (optional) |
| Structured glossary | ❌ No | ✅ Yes (optional) |
| WorkflowState tracking | ❌ No | ✅ Yes (optional) |
| Workflow metadata | ❌ No | ✅ Yes (optional) |
| Backward compatible | N/A | ✅ Yes (1.0 files valid) |

### 10.4 References

- XML 1.0 Specification: https://www.w3.org/TR/xml/
- ISO-8601 Date Format: https://www.iso.org/iso-8601-date-and-time-format.html
- UTF-8 Encoding: https://www.unicode.org/
- NSL 1.0 Specification: NSL-specification.md
- Analysis Documents: NSL-workflow-alignment-analysis.md, NSL-moonbase-gap-analysis.md, NSL-GIANT-series-analysis.md

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-18 | Initial specification release |
| 1.1 | 2025-10-18 | Production enhancements: ProjectManifest, multi-volume support, enhanced characters, cross-references, timeline structure |

---

**End of NSL 1.1 Specification**
