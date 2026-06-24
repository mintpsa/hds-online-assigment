export type DropState =
  | "idle"
  | "drag-over"
  | "drag-reject"
  | "accepted"
  | "error";

export type AcceptedMimeType =
  | "application/json"
  | "application/x-yaml"
  | "text/yaml"
  | "text/x-yaml";

export interface FileDropZoneProps {
  onFile: (file: File) => void;
  onError?: (message: string) => void;
  accept?: AcceptedMimeType[];
  className?: string;
}
