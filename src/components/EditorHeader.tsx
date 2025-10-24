/**
 * EditorHeader - Top navigation bar
 */

import React, { useRef, useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { APP_NAME } from '../constants';

export const EditorHeader: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  const setSettingsOpen = useEditorStore((state) => state.setSettingsOpen);
  const viewMode = useEditorStore((state) => state.viewMode);
  const setViewMode = useEditorStore((state) => state.setViewMode);
  const exportToMarkdown = useEditorStore((state) => state.exportToMarkdown);
  
  // NSL Bucket state
  const isBucketImported = useEditorStore((state) => state.isBucketImported);
  const isBucketEnabled = useEditorStore((state) => state.isBucketEnabled);
  const nslMetadata = useEditorStore((state) => state.nslMetadata);
  const importNSLFile = useEditorStore((state) => state.importNSLFile);
  const toggleBucketEnabled = useEditorStore((state) => state.toggleBucketEnabled);
  
  // Handle NSL file import
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.nsl')) {
      alert('Please select a .nsl file');
      return;
    }
    
    setIsImporting(true);
    try {
      await importNSLFile(file);
      alert(`NSL bucket imported successfully!\n\nProject: ${nslMetadata?.title || 'Unknown'}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Import failed:\n\n${message}`);
    } finally {
      setIsImporting(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <header className="gradient-primary px-6 py-3 shadow-glow">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-primary-foreground">
              ⚡ {APP_NAME}
            </h1>
            <span className="text-xs bg-accent px-2 py-1 rounded font-semibold text-accent-foreground">
              NSL
            </span>
          </div>
          
          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 bg-card/20 rounded-md p-1">
            <button
              onClick={() => setViewMode('split')}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-smooth ${
                viewMode === 'split'
                  ? 'bg-card text-card-foreground shadow-sm'
                  : 'text-primary-foreground/70 hover:text-primary-foreground'
              }`}
            >
              Split-View
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-smooth ${
                viewMode === 'single'
                  ? 'bg-card text-card-foreground shadow-sm'
                  : 'text-primary-foreground/70 hover:text-primary-foreground'
              }`}
            >
              Single-View
            </button>
            <button
              onClick={() => setViewMode('bucket')}
              disabled={!isBucketImported}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-smooth ${
                viewMode === 'bucket'
                  ? 'bg-card text-card-foreground shadow-sm'
                  : isBucketImported
                  ? 'text-primary-foreground/70 hover:text-primary-foreground'
                  : 'text-primary-foreground/30 cursor-not-allowed'
              }`}
              title={!isBucketImported ? 'Import an NSL file first' : 'View bucket contents'}
            >
              Bucket
            </button>
          </div>
          
          {/* Bucket Toggle - show when bucket imported */}
          {isBucketImported && (
            <button
              onClick={toggleBucketEnabled}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-smooth flex items-center gap-2 ${
                isBucketEnabled
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-card/20 text-primary-foreground/70 hover:bg-card/30'
              }`}
              title={`Bucket Context: ${isBucketEnabled ? 'Enabled' : 'Disabled'}\nClick to ${isBucketEnabled ? 'disable' : 'enable'}`}
            >
              <span>📦</span>
              <span className="max-w-[120px] truncate">{nslMetadata?.title || 'Bucket'}</span>
              {isBucketEnabled && <span className="text-xs">✓</span>}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Hidden file input for NSL import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".nsl"
            onChange={handleImport}
            style={{ display: 'none' }}
            aria-label="Import NSL file"
          />
          
          {/* Import Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className={`px-4 py-2 rounded-md transition-smooth text-sm font-medium flex items-center gap-2 border ${
              isImporting
                ? 'bg-muted text-muted-foreground border-border cursor-wait'
                : isBucketImported
                ? 'gradient-primary text-primary-foreground shadow-glow border-transparent'
                : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border'
            }`}
            title={isBucketImported ? 'NSL bucket imported' : 'Import NSL bucket'}
          >
            <span>{isBucketImported ? '📦' : '📥'}</span>
            <span>{isImporting ? 'Importing...' : 'Import'}</span>
          </button>
          
          <button
            onClick={exportToMarkdown}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-smooth text-sm font-medium flex items-center gap-2 border border-border"
            title="Export to Markdown"
          >
            <span>💾</span>
            <span>Export</span>
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="px-4 py-2 bg-card hover:bg-card/80 text-card-foreground rounded-md transition-smooth text-sm font-medium flex items-center gap-2 border border-border"
            title="Open Settings"
          >
            <span>⚙️</span>
            <span>Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
