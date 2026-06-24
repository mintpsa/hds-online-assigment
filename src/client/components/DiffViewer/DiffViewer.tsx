import { DiffEditor } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

interface DiffViewerProps {
  original: string;
  modified: string;
  language?: string;
  className?: string;
  onModifiedChange?: (value: string) => void;
}

export function DiffViewer({
  original,
  modified,
  language = "json",
  className = "",
  onModifiedChange,
}: DiffViewerProps) {
  function handleMount(diffEditor: editor.IStandaloneDiffEditor) {
    if (!onModifiedChange) return;
    diffEditor.getModifiedEditor().onDidChangeModelContent(() => {
      onModifiedChange(diffEditor.getModifiedEditor().getValue());
    });
  }

  return (
    <div className={`h-full w-full ${className}`}>
      <DiffEditor
        original={original}
        modified={modified}
        language={language}
        theme="vs-dark"
        options={{
          readOnly: false,
          renderSideBySide: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          originalEditable: false,
        }}
        onMount={handleMount}
        height="100%"
      />
    </div>
  );
}
