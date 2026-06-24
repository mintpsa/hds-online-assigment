const OUTLINE_BUTTON_CLASS =
  "px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

interface ValidateButtonProps {
  onClick: () => void;
}

export function ValidateButton({ onClick }: ValidateButtonProps) {
  return (
    <button className={OUTLINE_BUTTON_CLASS} onClick={onClick}>
      Validate
    </button>
  );
}

interface ActionButtonsProps {
  disabled: boolean;
  reportDisabled: boolean;
  onGenerateSchema: () => void;
  onGenerateReport: () => void;
}

const BUTTON_CLASS =
  "px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

export function ActionButtons({
  disabled,
  reportDisabled,
  onGenerateSchema,
  onGenerateReport,
}: ActionButtonsProps) {
  return (
    <>
      <button
        className={BUTTON_CLASS}
        disabled={disabled}
        onClick={onGenerateSchema}
      >
        Generate schema
      </button>
      <button
        className={BUTTON_CLASS}
        disabled={reportDisabled}
        onClick={onGenerateReport}
      >
        Generate report
      </button>
    </>
  );
}
