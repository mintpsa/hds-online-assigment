import { useState } from "react";
import { useFileDropZone } from "./useFileDropZone";
import type { DropState, FileDropZoneProps } from "./fileDropZone.types";

const STATE_CLASSES: Record<DropState, string> = {
  idle: "border-gray-300 bg-gray-50 text-gray-500 hover:border-gray-400 hover:bg-gray-100",
  "drag-over": "border-blue-500 bg-blue-50 text-blue-700 scale-[1.02]",
  "drag-reject": "border-red-400 bg-red-50 text-red-600",
  accepted: "border-green-500 bg-green-50 text-green-700",
  error: "border-red-500 bg-red-50 text-red-700",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-10 h-10 mb-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-10 h-10 mb-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-10 h-10 mb-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  );
}

interface ContentProps {
  state: DropState;
  file: File | null;
  errorMessage: string | null;
}

function DropZoneContent({ state, file, errorMessage }: ContentProps) {
  if (state === "accepted" && file) {
    return (
      <>
        <CheckIcon />
        <p className="font-medium text-sm">{file.name}</p>
        <p className="text-xs opacity-75">{formatBytes(file.size)}</p>
      </>
    );
  }

  if (state === "error") {
    return (
      <>
        <ErrorIcon />
        <p className="font-medium text-sm text-center">
          {errorMessage ?? "Unsupported file type"}
        </p>
        <p className="text-xs opacity-75">
          Click or drop again to try another file
        </p>
      </>
    );
  }

  if (state === "drag-reject") {
    return (
      <>
        <ErrorIcon />
        <p className="font-medium text-sm">Wrong file type</p>
        <p className="text-xs opacity-75">
          Only .json, .yaml, and .yml files are accepted
        </p>
      </>
    );
  }

  if (state === "drag-over") {
    return (
      <>
        <UploadIcon />
        <p className="font-medium text-sm">Release to upload</p>
      </>
    );
  }

  return (
    <>
      <UploadIcon />
      <p className="font-medium text-sm">
        Drop a config file here, or click to browse
      </p>
      <p className="text-xs opacity-75">Accepts .json, .yaml, .yml</p>
    </>
  );
}

export function FileDropZone({
  onFile,
  onError,
  accept,
  className = "",
}: FileDropZoneProps) {
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const { dropState, inputRef, handlers, inputHandlers } = useFileDropZone({
    accept,
    onFile: (file) => {
      setLastFile(file);
      setLastError(null);
      onFile(file);
    },
    onError: (msg) => {
      setLastError(msg);
      setLastFile(null);
      onError?.(msg);
    },
  });

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="File upload drop zone"
      className={[
        "border-2 rounded-xl p-10",
        "flex flex-col items-center justify-center gap-2",
        "cursor-pointer transition-all duration-200 select-none",
        "outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        STATE_CLASSES[dropState],
        className,
      ].join(" ")}
      {...handlers}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".json,.yaml,.yml"
        className="hidden"
        {...inputHandlers}
      />
      <DropZoneContent
        state={dropState}
        file={lastFile}
        errorMessage={lastError}
      />
    </div>
  );
}
