/**
 * BucketView - Display imported NSL bucket contents
 */

import React, { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { EmptyState } from './EmptyState';
import type { BucketFile } from '../types';

export const BucketView: React.FC = () => {
  const bucketFiles = useEditorStore((state) => state.bucketFiles);
  const nslMetadata = useEditorStore((state) => state.nslMetadata);
  const clearNSLImport = useEditorStore((state) => state.clearNSLImport);
  const updateBucketFile = useEditorStore((state) => state.updateBucketFile);
  
  const [selectedFile, setSelectedFile] = useState<BucketFile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  
  if (!bucketFiles || bucketFiles.size === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-card">
        <EmptyState
          icon="📦"
          title="No NSL Bucket Imported"
          description="Click the Import button to load an NSL file"
        />
      </div>
    );
  }
  
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
  
  const handleClearBucket = async () => {
    if (window.confirm('Clear bucket? This will remove all imported NSL data.')) {
      try {
        await clearNSLImport();
      } catch (error) {
        alert('Failed to clear bucket');
      }
    }
  };
  
  const handleFileClick = (file: BucketFile) => {
    setSelectedFile(file);
    setEditContent(file.content);
    setIsEditing(false);
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleSave = async () => {
    if (!selectedFile) return;
    
    try {
      await updateBucketFile(selectedFile.filename, editContent);
      setIsEditing(false);
      // Refresh selected file
      const updated = bucketFiles.get(selectedFile.filename);
      if (updated) setSelectedFile(updated);
      alert('File saved successfully!');
    } catch (error) {
      alert('Failed to save file');
    }
  };
  
  const handleCancel = () => {
    setSelectedFile(null);
    setIsEditing(false);
  };
  
  return (
    <div className="flex-1 flex flex-col bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-secondary px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-secondary-foreground flex items-center gap-2">
              <span>📦</span>
              <span>{nslMetadata?.title || 'NSL Bucket'}</span>
            </h2>
            {nslMetadata?.author && (
              <p className="text-sm text-muted-foreground mt-1">
                by {nslMetadata.author}
              </p>
            )}
            {nslMetadata?.seriesInfo && (
              <p className="text-xs text-muted-foreground mt-1">
                {nslMetadata.seriesInfo.type} • {nslMetadata.seriesInfo.totalVolumes} volume(s)
              </p>
            )}
          </div>
          <button
            onClick={handleClearBucket}
            className="px-4 py-2 bg-destructive hover:bg-destructive/80 text-destructive-foreground rounded-md text-sm font-medium transition-smooth"
          >
            Clear Bucket
          </button>
        </div>
      </div>
      
      {/* File Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-8 max-w-7xl mx-auto">
          {Object.entries(categories).map(([category, files]) => (
            files.length > 0 && (
              <div key={category}>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-2xl">
                    {category === 'framework' && '⚙️'}
                    {category === 'world' && '🌍'}
                    {category === 'character' && '👥'}
                    {category === 'document' && '📄'}
                  </span>
                  <span className="capitalize">{category} Files</span>
                  <span className="text-sm text-muted-foreground font-normal">
                    ({files.length})
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map(file => (
                    <BucketFileCard
                      key={file.filename}
                      file={file}
                      onClick={() => handleFileClick(file)}
                    />
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
      
      {/* File Preview Modal */}
      {selectedFile && (
        <FilePreviewModal
          file={selectedFile}
          isEditing={isEditing}
          editContent={editContent}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          onContentChange={setEditContent}
        />
      )}
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

interface BucketFileCardProps {
  file: BucketFile;
  onClick: () => void;
}

const BucketFileCard: React.FC<BucketFileCardProps> = ({ file, onClick }) => {
  const wordCount = file.content.split(/\s+/).filter(w => w.length > 0).length;
  const charCount = file.content.length;
  
  // Get preview text (first 150 chars)
  const preview = file.content.substring(0, 150).replace(/\n/g, ' ').trim();
  
  return (
    <button
      onClick={onClick}
      className="p-4 bg-muted hover:bg-muted/80 border border-border rounded-lg transition-smooth text-left group relative overflow-hidden"
    >
      {/* Required badge */}
      {file.isRequired && (
        <div className="absolute top-2 right-2">
          <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded font-medium">
            Required
          </span>
        </div>
      )}
      
      {/* Filename */}
      <h4 className="font-semibold text-foreground mb-2 pr-16 group-hover:text-primary transition-smooth">
        {file.filename}
      </h4>
      
      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
        <span>{wordCount.toLocaleString()} words</span>
        <span>•</span>
        <span>{charCount.toLocaleString()} chars</span>
      </div>
      
      {/* Preview */}
      <div className="text-sm text-muted-foreground line-clamp-2">
        {preview}...
      </div>
      
      {/* Hover indicator */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-smooth">
        <span className="text-primary text-sm">→</span>
      </div>
    </button>
  );
};

interface FilePreviewModalProps {
  file: BucketFile;
  isEditing: boolean;
  editContent: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onContentChange: (content: string) => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  isEditing,
  editContent,
  onEdit,
  onSave,
  onCancel,
  onContentChange,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary rounded-t-lg">
          <div>
            <h3 className="text-lg font-bold text-secondary-foreground">{file.filename}</h3>
            <p className="text-sm text-muted-foreground capitalize">{file.category} file</p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={onEdit}
                  className="px-4 py-2 bg-primary hover:bg-primary/80 text-primary-foreground rounded-md text-sm font-medium transition-smooth"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md text-sm font-medium transition-smooth"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onSave}
                  className="px-4 py-2 bg-success hover:bg-success/80 text-success-foreground rounded-md text-sm font-medium transition-smooth"
                >
                  💾 Save
                </button>
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md text-sm font-medium transition-smooth"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-card">
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => onContentChange(e.target.value)}
              className="w-full h-full min-h-[500px] p-4 bg-muted border border-border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              spellCheck={false}
            />
          ) : (
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md overflow-x-auto">
                {file.content}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
