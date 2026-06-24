interface ActionButtonsProps {
  disabled: boolean;
  onGenerateSchema: () => void;
  onGenerateReport: () => void;
}

const BUTTON_CLASS =
  "px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

export function ActionButtons({
  disabled,
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
        disabled={disabled}
        onClick={onGenerateReport}
      >
        Generate report
      </button>
    </>
  );
}
