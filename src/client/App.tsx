import { useState } from "react";
import { FileDropZone } from "./components/FileDropZone";
import { ActionButtons } from "./components/ActionButtons";
import { DiffViewer } from "./components/DiffViewer";
import { ValidateModal } from "./components/ValidateModal";
import { readFileText } from "./utils/readFileText";
import { generateJsonSchema } from "./utils/generateJsonSchema";
import "./index.css";
import { Editor } from "@monaco-editor/react";

type Tab = "differ" | "schemas";

const TABS: { id: Tab; label: string }[] = [
  { id: "differ", label: "Differ" },
  { id: "schemas", label: "Schemas" },
];

interface StoredSchema {
  name: string;
  content: string;
}

type ValidateTarget = "left" | "right";

const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>("differ");

  // Differ state
  const [leftFile, setLeftFile] = useState<File | null>(null);
  const [leftContent, setLeftContent] = useState<string>("");
  const [rightFile, setRightFile] = useState<File | null>(null);
  const [rightContent, setRightContent] = useState<string>("");

  // Schema state
  const [schemas, setSchemas] = useState<StoredSchema[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<StoredSchema | null>(
    null,
  );
  const [editorDraft, setEditorDraft] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);

  // Validate modal state
  const [validateTarget, setValidateTarget] = useState<ValidateTarget | null>(
    null,
  );

  const showEditor = !!(leftFile || rightFile);
  const language = leftFile?.name.endsWith(".json") ? "json" : "yaml";

  async function handleLeftFile(file: File) {
    setLeftFile(file);
    setLeftContent(await readFileText(file));
  }

  async function handleRightFile(file: File) {
    setRightFile(file);
    setRightContent(await readFileText(file));
  }

  function handleGenerateSchema() {
    if (!leftFile || !leftContent) return;
    try {
      const name = leftFile.name.replace(/\.[^.]+$/, "") + ".schema.json";
      const content = generateJsonSchema(leftContent, name);
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
  }

  function handleSaveSchema() {
    if (!selectedSchema) return;
    const updated = { ...selectedSchema, content: editorDraft };
    setSchemas((prev) =>
      prev.map((s) => (s.name === selectedSchema.name ? updated : s)),
    );
    setSelectedSchema(updated);
    setIsDirty(false);
  }

  function handleValidateClick(target: ValidateTarget) {
    setValidateTarget(target);
  }

  const VALIDATE_BTN =
    "px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

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
          <div className="flex shrink-0 border-b border-gray-200 bg-white">
            <div className="flex-1 p-4 flex flex-col gap-2">
              <FileDropZone onFile={handleLeftFile} />
              {leftFile && (
                <div className="flex justify-end">
                  <button
                    className={VALIDATE_BTN}
                    onClick={() => handleValidateClick("left")}
                  >
                    Validate
                  </button>
                </div>
              )}
            </div>
            <div className="w-px bg-gray-200 shrink-0" />
            <div className="flex-1 p-4 flex flex-col gap-2">
              <FileDropZone onFile={handleRightFile} />
              {rightFile && (
                <div className="flex justify-end">
                  <button
                    className={VALIDATE_BTN}
                    onClick={() => handleValidateClick("right")}
                  >
                    Validate
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-gray-200 shrink-0">
            <ActionButtons
              disabled={!leftFile}
              onGenerateSchema={handleGenerateSchema}
              onGenerateReport={() =>
                console.log("generate report", leftFile?.name)
              }
            />
          </div>

          {showEditor && (
            <div className="flex-1 overflow-hidden">
              <DiffViewer
                original={leftContent}
                modified={rightContent || leftContent}
                language={language}
              />
            </div>
          )}
        </>
      )}

      {activeTab === "schemas" && (
        <div className="flex-1 flex overflow-hidden">
          <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
            <p className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Stored schemas
            </p>
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
                  <button
                    onClick={handleSaveSchema}
                    disabled={!isDirty}
                    className="px-4 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Save
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Editor
                    value={editorDraft}
                    language="json"
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 13,
                    }}
                    onChange={(val) => {
                      setEditorDraft(val ?? "");
                      setIsDirty((val ?? "") !== selectedSchema.content);
                    }}
                    height="100%"
                  />
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

      {validateTarget !== null && (
        <ValidateModal
          fileContent={validateTarget === "left" ? leftContent : rightContent}
          fileName={
            validateTarget === "left"
              ? (leftFile?.name ?? "")
              : (rightFile?.name ?? "")
          }
          schemas={schemas}
          onClose={() => setValidateTarget(null)}
        />
      )}
    </div>
  );
};

export default App;
