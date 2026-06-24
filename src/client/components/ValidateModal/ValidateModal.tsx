import { useState } from "react";
import Ajv from "ajv";
import { parse as parseYaml } from "yaml";

interface StoredSchema {
  name: string;
  content: string;
}

interface ValidateModalProps {
  fileContent: string;
  fileName: string;
  schemas: StoredSchema[];
  onClose: () => void;
}

type View = "pick" | "results";

interface ValidationResult {
  schemaName: string;
  errors: string[];
}

const ajv = new Ajv({ allErrors: true });

function parseFileContent(content: string, fileName: string): unknown {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "yaml" || ext === "yml") return parseYaml(content) as unknown;
  return JSON.parse(content) as unknown;
}

function validate(
  fileContent: string,
  fileName: string,
  schemaContent: string,
): string[] {
  const data = parseFileContent(fileContent, fileName);
  const schema = JSON.parse(schemaContent) as object;
  const valid = ajv.validate(schema, data);
  if (valid) return [];
  return (ajv.errors ?? []).map((e) => {
    const path = e.instancePath || "(root)";
    return `${path}: ${e.message ?? "unknown error"}`;
  });
}

export function ValidateModal({
  fileContent,
  fileName,
  schemas,
  onClose,
}: ValidateModalProps) {
  const [view, setView] = useState<View>("pick");
  const [result, setResult] = useState<ValidationResult | null>(null);

  function handlePick(schema: StoredSchema) {
    try {
      const errors = validate(fileContent, fileName, schema.content);
      setResult({ schemaName: schema.name, errors });
      setView("results");
    } catch (e) {
      setResult({
        schemaName: schema.name,
        errors: [`Parse error: ${(e as Error).message}`],
      });
      setView("results");
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden"
        style={{ maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          {view === "pick" ? (
            <h2 className="text-base font-semibold text-gray-800">
              Pick a schema to validate against
            </h2>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("pick")}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Back"
              >
                ←
              </button>
              <h2 className="text-base font-semibold text-gray-800 truncate">
                {fileName}
              </h2>
              <span className="text-xs text-gray-400">vs</span>
              <span className="text-xs text-gray-500 truncate">
                {result?.schemaName}
              </span>
            </div>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none ml-4 shrink-0"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {view === "pick" &&
            (schemas.length === 0 ? (
              <p className="text-sm text-gray-500">
                No schemas stored yet. Use{" "}
                <span className="font-medium">Generate schema</span> to create
                one.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {schemas.map((schema) => (
                  <li key={schema.name}>
                    <button
                      className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-sm font-medium text-gray-700 transition-colors"
                      onClick={() => handlePick(schema)}
                    >
                      {schema.name}
                    </button>
                  </li>
                ))}
              </ul>
            ))}

          {view === "results" &&
            result &&
            (result.errors.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-green-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                <p className="text-base font-semibold">
                  Valid — no errors found
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-red-600">
                  {result.errors.length} error
                  {result.errors.length !== 1 ? "s" : ""} found
                </p>
                <ul className="flex flex-col gap-2">
                  {result.errors.map((err, i) => (
                    <li
                      key={i}
                      className="flex gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700"
                    >
                      <span className="font-mono shrink-0 text-red-400">
                        {i + 1}.
                      </span>
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
