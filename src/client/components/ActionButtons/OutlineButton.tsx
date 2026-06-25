import type React from "react";

const CLASS =
  "px-4 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors";

interface OutlineButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function OutlineButton({ onClick, children }: OutlineButtonProps) {
  return (
    <button className={CLASS} onClick={onClick}>
      {children}
    </button>
  );
}
