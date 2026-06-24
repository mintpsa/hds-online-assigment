import { useCallback, useRef, useState } from "react";
import type { AcceptedMimeType, DropState, FileDropZoneProps } from "./fileDropZone.types";

const DEFAULT_ACCEPT: AcceptedMimeType[] = [
  "application/json",
  "application/x-yaml",
  "text/yaml",
  "text/x-yaml",
];

function isAccepted(file: File, accept: AcceptedMimeType[]): boolean {
  if (accept.includes(file.type as AcceptedMimeType)) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext === "json" || ext === "yaml" || ext === "yml";
}

function classifyDragItems(
  items: DataTransferItemList,
  accept: AcceptedMimeType[],
): "drag-over" | "drag-reject" {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind !== "file") return "drag-reject";
    // MIME type is often empty during drag (browser security); accept optimistically
    if (item.type && !accept.includes(item.type as AcceptedMimeType)) {
      const isYaml = item.type.includes("yaml");
      const isJson = item.type === "application/json";
      if (!isYaml && !isJson) return "drag-reject";
    }
  }
  return "drag-over";
}

export function useFileDropZone({
  onFile,
  onError,
  accept = DEFAULT_ACCEPT,
}: Pick<FileDropZoneProps, "onFile" | "onError" | "accept">) {
  const [dropState, setDropState] = useState<DropState>("idle");
  const dragCounter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (isAccepted(file, accept)) {
        setDropState("accepted");
        onFile(file);
      } else {
        const msg = `"${file.name}" is not a supported format. Please upload a .json, .yaml, or .yml file.`;
        setDropState("error");
        onError?.(msg);
      }
    },
    [accept, onFile, onError],
  );

  const onDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current += 1;
      if (dragCounter.current === 1) {
        const state = classifyDragItems(e.dataTransfer.items, accept);
        setDropState(state);
      }
    },
    [accept],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setDropState("idle");
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      } else {
        setDropState("idle");
      }
    },
    [handleFile],
  );

  const onClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // reset so the same file can be re-selected
      e.target.value = "";
    },
    [handleFile],
  );

  return {
    dropState,
    inputRef,
    handlers: { onDragEnter, onDragOver, onDragLeave, onDrop, onClick, onKeyDown },
    inputHandlers: { onChange: onInputChange },
  };
}
