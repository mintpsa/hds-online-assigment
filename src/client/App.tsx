import { useRef, useState } from "react";
import { FileDropZone } from "./components/FileDropZone";
import {
  PrimaryButton,
  OutlineButton,
  DangerButton,
} from "./components/ActionButtons";
import { DiffViewer } from "./components/DiffViewer";
import { ValidateModal } from "./components/ValidateModal";
import { ReportModal } from "./components/ReportModal";
import { readFileText } from "./utils/readFileText";
import { generateJsonSchemaFromObject } from "./utils/generateJsonSchema";
import { parseFileContent } from "./utils/parseFileContent";
import { downloadFile } from "./utils/downloadFile";
import type { StoredSchema } from "./types";
import "./index.css";
import { Editor, DiffEditor } from "@monaco-editor/react";
import { InfoButton } from "./components/ActionButtons/ValidateButton";

type Tab = "differ" | "schemas";

const TABS: { id: Tab; label: string }[] = [
  { id: "differ", label: "Differ" },
  { id: "schemas", label: "Schemas" },
];

const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>("differ");

  // Differ state
  const [leftFile, setLeftFile] = useState<File | null>(null);
  const [leftContent, setLeftContent] = useState<string>("");
  const [rightContent, setRightContent] = useState<string>("");

  // Schema state
  const [schemas, setSchemas] = useState<StoredSchema[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<StoredSchema | null>(
    null,
  );
  const [editorDraft, setEditorDraft] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [validateTarget, setValidateTarget] = useState<
    "original" | "edited" | null
  >(null);

  const [showReport, setShowReport] = useState(false);

  const schemaUploadRef = useRef<HTMLInputElement>(null);

  const showEditor = !!leftFile;
  const language = leftFile?.name.endsWith(".json") ? "json" : "yaml";

  async function handleLeftFile(file: File) {
    setLeftFile(file);
    setLeftContent(await readFileText(file));
  }

  function handleGenerateSchema() {
    if (!leftFile || !leftContent) return;
    try {
      const name = leftFile.name.replace(/\.[^.]+$/, "") + ".schema.json";
      const parsed = parseFileContent(leftContent, leftFile.name);
      const content = generateJsonSchemaFromObject(parsed, name);
      const schema: StoredSchema = { name, content };
      setSchemas((prev) => {
        const filtered = prev.filter((s) => s.name !== name);
        return [schema, ...filtered];
      });
      selectSchema(schema);
      setActiveTab("schemas");
    } catch {
      console.error("Failed to generate schema — is the left file valid JSON?");
    }
  }

  function selectSchema(schema: StoredSchema) {
    setSelectedSchema(schema);
    setEditorDraft(schema.content);
    setIsDirty(false);
    setIsEditing(false);
  }

  function handleSaveSchema() {
    if (!selectedSchema) return;
    let content = editorDraft;
    try {
      content = JSON.stringify(JSON.parse(editorDraft), null, 2);
    } catch {
      // not valid JSON — save as-is
    }
    let name = selectedSchema.name;
    try {
      const parsed = JSON.parse(content) as { title?: string };
      const newName = parsed.title?.trim();
      if (newName) name = newName;
    } catch {
      // ignore
    }
    const updated = { name, content };
    setSchemas((prev) =>
      prev.map((s) => (s.name === selectedSchema.name ? updated : s)),
    );
    setSelectedSchema(updated);
    setEditorDraft(content);
    setIsDirty(false);
    setIsEditing(false);
  }

  function handleNewSchema() {
    const name = `schema-${schemas.length + 1}.schema.json`;
    const content = JSON.stringify(
      {
        $schema: "http://json-schema.org/draft-07/schema#",
        title: name,
        type: "object",
        properties: {},
      },
      null,
      2,
    );
    const schema: StoredSchema = { name, content };
    setSchemas((prev) => [schema, ...prev]);
    selectSchema(schema);
  }

  async function handleUploadSchema(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await readFileText(file);
    const schema: StoredSchema = { name: file.name, content };
    setSchemas((prev) => {
      const filtered = prev.filter((s) => s.name !== file.name);
      return [schema, ...filtered];
    });
    selectSchema(schema);
    e.target.value = "";
  }

  function handleClear() {
    setLeftFile(null);
    setLeftContent("");
    setRightContent("");
  }

  function handleDeleteSchema() {
    if (!selectedSchema) return;
    setSchemas((prev) => prev.filter((s) => s.name !== selectedSchema.name));
    setSelectedSchema(null);
    setEditorDraft("");
    setIsDirty(false);
    setIsEditing(false);
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <header className="px-6 bg-white border-b border-gray-200 shrink-0 flex items-end gap-6">
        <h1 className="text-lg font-semibold text-gray-800 py-3 mr-4">
          Slot Config Validator
        </h1>
        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {activeTab === "differ" && (
        <>
          <div className="shrink-0 border-b border-gray-200 bg-white p-4">
            <FileDropZone onFile={handleLeftFile} />
          </div>

          <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-gray-200 shrink-0">
            <PrimaryButton disabled={!leftFile} onClick={handleGenerateSchema}>
              Generate schema
            </PrimaryButton>
            <PrimaryButton
              disabled={!leftFile}
              onClick={() => setShowReport(true)}
            >
              Generate report
            </PrimaryButton>
            {leftFile && (
              <>
                <OutlineButton
                  onClick={() => {
                    const ext = leftFile.name.split(".").pop() ?? "json";
                    const stem = leftFile.name.replace(/\.[^.]+$/, "");
                    downloadFile(
                      rightContent || leftContent,
                      `${stem}.edited.${ext}`,
                    );
                  }}
                >
                  Export config
                </OutlineButton>
                <DangerButton onClick={handleClear}>Clear</DangerButton>
              </>
            )}
          </div>

          {leftFile && (
            <div className="flex shrink-0 border-b border-gray-200 bg-white">
              <div className="flex-1 flex justify-center py-2 border-r border-gray-200">
                <InfoButton onClick={() => setValidateTarget("original")}>
                  Validate original
                </InfoButton>
              </div>
              <div className="flex-1 flex justify-center py-2">
                <InfoButton onClick={() => setValidateTarget("edited")}>
                  Validate edited
                </InfoButton>
              </div>
            </div>
          )}

          {showEditor && (
            <div className="flex-1 overflow-hidden">
              <DiffViewer
                original={leftContent}
                modified={rightContent || leftContent}
                language={language}
                onModifiedChange={setRightContent}
              />
            </div>
          )}
        </>
      )}

      {activeTab === "schemas" && (
        <div className="flex-1 flex overflow-hidden">
          <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Stored schemas
              </p>
              <div className="flex gap-1">
                <button
                  onClick={handleNewSchema}
                  title="New schema"
                  className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => schemaUploadRef.current?.click()}
                  title="Upload schema"
                  className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                </button>
                <input
                  ref={schemaUploadRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleUploadSchema}
                />
              </div>
            </div>
            {schemas.length === 0 ? (
              <p className="px-4 text-sm text-gray-400">None yet.</p>
            ) : (
              <ul>
                {schemas.map((s) => (
                  <li key={s.name}>
                    <button
                      onClick={() => selectSchema(s)}
                      className={[
                        "w-full text-left px-4 py-2.5 text-sm truncate transition-colors",
                        selectedSchema?.name === s.name
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      {s.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedSchema ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200 shrink-0">
                  <span className="text-sm text-gray-500 truncate flex-1">
                    {selectedSchema.name}
                  </span>
                  {isEditing ? (
                    <>
                      <OutlineButton
                        onClick={() => {
                          setEditorDraft(selectedSchema.content);
                          setIsDirty(false);
                          setIsEditing(false);
                        }}
                      >
                        Cancel
                      </OutlineButton>
                      <PrimaryButton
                        onClick={handleSaveSchema}
                        disabled={!isDirty}
                      >
                        Save
                      </PrimaryButton>
                    </>
                  ) : (
                    <>
                      <DangerButton onClick={handleDeleteSchema}>
                        Delete
                      </DangerButton>
                      <OutlineButton
                        onClick={() =>
                          downloadFile(
                            selectedSchema.content,
                            selectedSchema.name,
                          )
                        }
                      >
                        Export
                      </OutlineButton>
                      <OutlineButton onClick={() => setIsEditing(true)}>
                        Edit
                      </OutlineButton>
                    </>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  {isEditing ? (
                    <DiffEditor
                      original={selectedSchema.content}
                      modified={editorDraft}
                      language="json"
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 13,
                        renderSideBySide: true,
                        originalEditable: false,
                      }}
                      onMount={(diffEditor) => {
                        diffEditor
                          .getModifiedEditor()
                          .onDidChangeModelContent(() => {
                            const val = diffEditor
                              .getModifiedEditor()
                              .getValue();
                            setEditorDraft(val);
                            setIsDirty(val !== selectedSchema.content);
                          });
                      }}
                      height="100%"
                    />
                  ) : (
                    <Editor
                      value={selectedSchema.content}
                      language="json"
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 13,
                      }}
                      height="100%"
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Select a schema to view it
              </div>
            )}
          </div>
        </div>
      )}

      {showReport && leftFile && (
        <ReportModal
          leftFile={leftFile}
          leftContent={leftContent}
          rightContent={rightContent}
          schemas={schemas}
          onClose={() => setShowReport(false)}
        />
      )}

      {validateTarget !== null && leftFile && (
        <ValidateModal
          fileContent={
            validateTarget === "original"
              ? leftContent
              : rightContent || leftContent
          }
          fileName={
            validateTarget === "original"
              ? leftFile.name
              : `${leftFile.name} (edited)`
          }
          schemas={schemas}
          onClose={() => setValidateTarget(null)}
        />
      )}
    </div>
  );
};

export default App;
