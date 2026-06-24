import { DiffEditor } from "@monaco-editor/react";

interface DiffViewerProps {
  original: string;
  modified: string;
  language?: string;
  className?: string;
}

export function DiffViewer({
  original,
  modified,
  language = "json",
  className = "",
}: DiffViewerProps) {
  return (
    <div className={`h-full w-full ${className}`}>
      <DiffEditor
        original={original}
        modified={modified}
        language={language}
        theme="vs-dark"
        options={{
          readOnly: true,
          renderSideBySide: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
        }}
        height="100%"
      />
    </div>
  );
}
