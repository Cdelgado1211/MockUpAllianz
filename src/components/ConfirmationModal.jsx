export default function ConfirmationModal({ open, title, description, onConfirm, onCancel, confirmLabel = 'Sí', cancelLabel = 'No' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/70 bg-white shadow-soft">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-extrabold text-slate-900">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="focus-ring inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="focus-ring inline-flex items-center justify-center rounded-full bg-sky-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-sky-800"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
