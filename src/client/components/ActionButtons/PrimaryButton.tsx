import type React from "react";

const CLASS =
  "px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

interface PrimaryButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function PrimaryButton({
  onClick,
  disabled = false,
  children,
}: PrimaryButtonProps) {
  return (
    <button className={CLASS} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
