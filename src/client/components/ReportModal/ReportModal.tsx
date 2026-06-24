import { useState } from "react";
import type React from "react";
import type { StoredSchema } from "../../types";
import { parseFileContent } from "../../utils/parseFileContent";
import { ajv } from "../../rules";

export interface ReportModalProps {
  leftFile: File;
  leftContent: string;
  rightFile: File;
  rightContent: string;
  rightFileUploaded?: boolean;
  schemas: StoredSchema[];
  onClose: () => void;
}

// ── validation ────────────────────────────────────────────────────────────────

function runValidation(
  content: string,
  fileName: string,
  schema: StoredSchema | null,
): { schemaName: string | null; errors: string[] } {
  if (!schema) return { schemaName: null, errors: [] };
  try {
    const data = parseFileContent(content, fileName);
    const schemaDef = JSON.parse(schema.content) as { $id?: string } & object;
    const schemaId = schema.name;
    if (!ajv.getSchema(schemaId)) {
      ajv.addSchema({ ...schemaDef, $id: schemaId });
    }
    const valid = ajv.validate(schemaId, data);
    if (valid) return { schemaName: schema.name, errors: [] };
    return {
      schemaName: schema.name,
      errors: (ajv.errors ?? []).map((e) => {
        const path = e.instancePath || "(root)";
        return `${path}: ${e.message ?? "unknown error"}`;
      }),
    };
  } catch (e) {
    return {
      schemaName: schema.name,
      errors: [`Parse error: ${(e as Error).message}`],
    };
  }
}

// ── diff ──────────────────────────────────────────────────────────────────────

function flattenObject(
  obj: unknown,
  prefix = "",
  result: Record<string, unknown> = {},
): Record<string, unknown> {
  if (obj === null || typeof obj !== "object") {
    if (prefix) result[prefix] = obj;
    return result;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      flattenObject(item, prefix ? `${prefix}.${i}` : String(i), result);
    });
    return result;
  }
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    flattenObject(value, prefix ? `${prefix}.${key}` : key, result);
  }
  return result;
}

type DiffKind = "added" | "removed" | "changed";

interface DiffEntry {
  kind: DiffKind;
  field: string;
  oldValue?: unknown;
  newValue?: unknown;
}

function computeDiff(
  leftContent: string,
  leftFile: File,
  rightContent: string,
  rightFile: File,
): DiffEntry[] {
  try {
    const left = flattenObject(parseFileContent(leftContent, leftFile.name));
    const right = flattenObject(parseFileContent(rightContent, rightFile.name));
    const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);
    const entries: DiffEntry[] = [];
    for (const key of allKeys) {
      const l = left[key];
      const r = right[key];
      if (!(key in left))
        entries.push({ kind: "added", field: key, newValue: r });
      else if (!(key in right))
        entries.push({ kind: "removed", field: key, oldValue: l });
      else if (JSON.stringify(l) !== JSON.stringify(r))
        entries.push({ kind: "changed", field: key, oldValue: l, newValue: r });
    }
    return entries.sort((a, b) => a.field.localeCompare(b.field));
  } catch {
    return [];
  }
}

// ── sub-components ────────────────────────────────────────────────────────────

const KIND_CLASSES: Record<DiffKind, string> = {
  added: "bg-green-50 border-green-200 text-green-800",
  removed: "bg-red-50 border-red-200 text-red-800",
  changed: "bg-yellow-50 border-yellow-200 text-yellow-800",
};

const KIND_BADGE: Record<DiffKind, string> = {
  added: "bg-green-100 text-green-700",
  removed: "bg-red-100 text-red-700",
  changed: "bg-yellow-100 text-yellow-700",
};

function fmt(v: unknown): string {
  if (v === undefined) return "–";
  return JSON.stringify(v);
}

function ValidationSection({
  fileName,
  result,
}: {
  fileName: string;
  result: { schemaName: string | null; errors: string[] };
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {fileName}
      </p>
      {result.schemaName === null ? (
        <p className="text-sm text-gray-400 italic">No schema selected</p>
      ) : result.errors.length === 0 ? (
        <p className="text-sm text-green-700 font-medium">
          ✓ Valid against{" "}
          <span className="font-semibold">{result.schemaName}</span>
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-sm text-red-600 font-medium">
            {result.errors.length} error{result.errors.length !== 1 ? "s" : ""}{" "}
            against <span className="font-semibold">{result.schemaName}</span>
          </p>
          <ul className="flex flex-col gap-1">
            {result.errors.map((err, i) => (
              <li
                key={i}
                className="flex gap-2 px-3 py-2 rounded bg-red-50 border border-red-100 text-xs text-red-700"
              >
                <span className="font-mono shrink-0 text-red-400">
                  {i + 1}.
                </span>
                <span>{err}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DiffSummary({ entries }: { entries: DiffEntry[] }) {
  const added = entries.filter((e) => e.kind === "added");
  const removed = entries.filter((e) => e.kind === "removed");
  const changed = entries.filter((e) => e.kind === "changed");

  if (entries.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">No differences found.</p>
    );
  }

  return (
    <div className="flex flex-col gap-1 text-sm text-gray-700">
      {added.length > 0 && (
        <p>
          <span className="font-medium text-green-700">
            Added {added.length}:
          </span>{" "}
          {added.map((e) => e.field).join(", ")}
        </p>
      )}
      {removed.length > 0 && (
        <p>
          <span className="font-medium text-red-700">
            Removed {removed.length}:
          </span>{" "}
          {removed.map((e) => e.field).join(", ")}
        </p>
      )}
      {changed.length > 0 && (
        <p>
          <span className="font-medium text-yellow-700">
            Changed {changed.length}:
          </span>{" "}
          {changed.map((e) => e.field).join(", ")}
        </p>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function ReportModal({
  leftFile,
  leftContent,
  rightFile,
  rightContent,
  rightFileUploaded = true,
  schemas,
  onClose,
}: ReportModalProps) {
  const [schema, setSchema] = useState<StoredSchema | null>(null);

  const leftResult = runValidation(leftContent, leftFile.name, schema);
  const rightResult = runValidation(rightContent, rightFile.name, schema);
  const diffEntries = computeDiff(
    leftContent,
    leftFile,
    rightContent,
    rightFile,
  );

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-800">Report</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-6">
          {/* File names */}
          <div className="flex gap-4">
            <div className="flex-1 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 truncate">
              {leftFile.name}
            </div>
            <div className="flex-1 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 truncate">
              {rightFileUploaded ? (
                rightFile.name
              ) : (
                <span>
                  {rightFile.name}{" "}
                  <span className="text-gray-400 font-normal">(edited)</span>
                </span>
              )}
            </div>
          </div>

          {/* Validation */}
          <Section title="Validation">
            <SchemaSelector
              label="Schema"
              schemas={schemas}
              selected={schema}
              onSelect={setSchema}
            />
            <div className="flex gap-6 mt-1">
              <div className="flex-1">
                <ValidationSection
                  fileName={leftFile.name}
                  result={leftResult}
                />
              </div>
              <div className="w-px bg-gray-100 shrink-0" />
              <div className="flex-1">
                <ValidationSection
                  fileName={
                    rightFileUploaded
                      ? rightFile.name
                      : `${rightFile.name} (edited)`
                  }
                  result={rightResult}
                />
              </div>
            </div>
          </Section>

          {/* Summary */}
          <Section title="Diff summary">
            <DiffSummary entries={diffEntries} />
          </Section>

          {/* Full diff */}
          {diffEntries.length > 0 && (
            <Section title={`Changes (${diffEntries.length})`}>
              <ul className="flex flex-col gap-2">
                {diffEntries.map((entry) => (
                  <li
                    key={entry.field}
                    className={`flex flex-col gap-1 px-3 py-2 rounded border text-xs ${KIND_CLASSES[entry.kind]}`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${KIND_BADGE[entry.kind]}`}
                      >
                        {entry.kind}
                      </span>
                      <span className="font-mono font-medium">
                        {entry.field}
                      </span>
                    </div>
                    {entry.kind === "changed" && (
                      <div className="flex flex-col gap-0.5 font-mono text-[11px] mt-0.5 break-all">
                        <span className="text-red-600 line-through whitespace-pre-wrap">
                          {fmt(entry.oldValue)}
                        </span>
                        <span className="text-gray-400 text-[10px]">↓</span>
                        <span className="text-green-700 whitespace-pre-wrap">
                          {fmt(entry.newValue)}
                        </span>
                      </div>
                    )}
                    {entry.kind === "added" && (
                      <span className="font-mono text-[11px] text-green-700 break-all whitespace-pre-wrap">
                        {fmt(entry.newValue)}
                      </span>
                    )}
                    {entry.kind === "removed" && (
                      <span className="font-mono text-[11px] text-red-600 line-through break-all whitespace-pre-wrap">
                        {fmt(entry.oldValue)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-1">
        {title}
      </p>
      {children}
    </div>
  );
}

function SchemaSelector({
  label,
  schemas,
  selected,
  onSelect,
}: {
  label: string;
  schemas: StoredSchema[];
  selected: StoredSchema | null;
  onSelect: (s: StoredSchema | null) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      <select
        className="text-xs border border-gray-200 rounded px-2 py-1.5 text-gray-700 bg-white"
        value={selected?.name ?? ""}
        onChange={(e) => {
          const found = schemas.find((s) => s.name === e.target.value) ?? null;
          onSelect(found);
        }}
      >
        <option value="">— none —</option>
        {schemas.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
