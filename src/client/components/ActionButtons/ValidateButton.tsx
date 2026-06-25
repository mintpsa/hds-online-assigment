import type { ReactNode } from "react";

const CLASS =
  "px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

interface ValidateButtonProps {
  onClick: () => void;
  children: ReactNode;
}

export function InfoButton({ onClick, children }: ValidateButtonProps) {
  return (
    <button className={CLASS} onClick={onClick}>
      {children}
    </button>
  );
}
