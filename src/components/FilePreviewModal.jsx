import ModalShell from './ModalShell';

export default function FilePreviewModal({ file, onClose }) {
  if (!file) return null;

  return (
    <ModalShell title="Vista previa simulada" subtitle="Esta es una representación de la visualización del archivo cargado.">
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Nombre del archivo</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{file.name}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Tamaño</p>
              <p className="mt-1 text-sm text-slate-700">{file.size}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Tipo</p>
              <p className="mt-1 text-sm text-slate-700">{file.type}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Estado</p>
              <p className="mt-1 text-sm text-slate-700">{file.status}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
          Previsualización de demostración para el mockup
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          className="focus-ring inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </ModalShell>
  );
}
