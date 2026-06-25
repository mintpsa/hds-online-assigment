import type React from "react";

const CLASS =
  "px-4 py-1.5 text-sm font-medium rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors";

interface DangerButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function DangerButton({ onClick, children }: DangerButtonProps) {
  return (
    <button className={CLASS} onClick={onClick}>
      {children}
    </button>
  );
}
