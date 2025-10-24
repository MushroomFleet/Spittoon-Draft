import { useEffect } from 'react';
import { TextEditor } from './components/TextEditor';
import { Toast } from './components/Toast';
import { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp';
import { DonateButton } from './components/DonateButton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useEditorStore } from './store/editorStore';

function App() {
  const loadConfigFromStorage = useEditorStore((state) => state.loadConfigFromStorage);
  const loadBucketFromStorage = useEditorStore((state) => state.loadBucketFromStorage);

  // Load configuration and bucket from storage on mount
  useEffect(() => {
    loadConfigFromStorage();
    loadBucketFromStorage();
  }, [loadConfigFromStorage, loadBucketFromStorage]);

  return (
    <ErrorBoundary>
      <div className="h-screen overflow-hidden">
        <TextEditor />
        <Toast />
        <KeyboardShortcutsHelp />
        <DonateButton />
      </div>
    </ErrorBoundary>
  );
}

export default App;
