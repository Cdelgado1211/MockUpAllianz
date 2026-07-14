export default function WizardFooter({
  onBack,
  onSaveDraft,
  onPrimary,
  backLabel = 'Regresar',
  saveLabel = 'Guardar y continuar después',
  primaryLabel = 'Continuar',
  primaryDisabled = false,
  primaryTone = 'sky'
}) {
  const primaryClasses =
    primaryTone === 'green'
      ? 'bg-emerald-600 hover:bg-emerald-700'
      : 'bg-sky-700 hover:bg-sky-800';

  return (
    <div className="sticky bottom-3 z-20 mt-6 rounded-[1.5rem] border border-white/70 bg-white/95 p-2.5 shadow-soft backdrop-blur-sm sm:p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="focus-ring inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            onClick={onBack}
          >
            {backLabel}
          </button>
          <button
            type="button"
            className="focus-ring inline-flex items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-800 transition hover:bg-sky-100"
            onClick={onSaveDraft}
          >
            {saveLabel}
          </button>
        </div>

        <button
          type="button"
          disabled={primaryDisabled}
          className={`focus-ring inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold text-white transition ${primaryClasses} disabled:cursor-not-allowed disabled:bg-slate-300`}
          onClick={onPrimary}
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
