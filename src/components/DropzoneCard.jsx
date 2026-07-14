import { CheckIcon, DownloadIcon, InfoIcon, SparkIcon } from './Icon';

function StatusPill({ status }) {
  if (status === 'uploading') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
        <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
        Analizando documento con IA...
      </span>
    );
  }

  if (status === 'processed') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
        <CheckIcon className="h-4 w-4" />
        Documento procesado
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
      <SparkIcon className="h-4 w-4" />
      Listo para cargar
    </span>
  );
}

export default function DropzoneCard({ doc, status, onSimulateUpload }) {
  const canDownload = doc.id === 'aviso' || doc.id === 'informe' || doc.id === 'solicitud';

  return (
    <button
      type="button"
      onClick={onSimulateUpload}
      className="focus-ring group relative flex h-full w-full flex-col rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-slate-900 sm:text-[15px]">{doc.label}</h3>
            <span className="relative inline-flex items-center text-slate-400">
              <InfoIcon />
              <span className="pointer-events-none absolute left-1/2 top-7 z-20 hidden w-64 -translate-x-1/2 rounded-2xl bg-slate-900 px-3 py-2 text-left text-xs leading-5 text-white shadow-lg group-hover:block">
                {doc.tooltip}
              </span>
            </span>
          </div>
          <p className="text-xs text-slate-500">{doc.helper}</p>
        </div>
        <StatusPill status={status} />
      </div>

      <div className="mt-4 flex min-h-28 flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 text-center transition group-hover:border-sky-200 group-hover:bg-sky-50/50">
        <div className="space-y-2">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <DownloadIcon className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            {status === 'processed' ? 'Archivo simulado cargado' : 'Haz clic para simular la carga'}
          </p>
          <p className="text-xs text-slate-500">
            {canDownload ? 'Incluye formato institucional descargable' : 'No requiere formato institucional'}
          </p>
        </div>
      </div>
    </button>
  );
}
