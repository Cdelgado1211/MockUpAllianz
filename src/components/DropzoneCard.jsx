import { AlertIcon, CheckIcon, DownloadIcon, InfoIcon, SparkIcon } from './Icon';

const cardStyles = {
  pending: 'border-slate-200 bg-white',
  uploaded: 'border-sky-200 bg-sky-50/20',
  processing: 'border-amber-300 bg-amber-50/40',
  validated: 'border-emerald-300 bg-emerald-50/35',
  requires_review: 'border-rose-300 bg-rose-50/45',
  illegible: 'border-rose-300 bg-rose-50/45'
};

const dropzoneStyles = {
  pending: 'border-slate-200 bg-white',
  uploaded: 'border-sky-200 bg-sky-50/30',
  processing: 'border-amber-300 bg-amber-50/45',
  validated: 'border-emerald-300 bg-emerald-50/35',
  requires_review: 'border-rose-300 bg-rose-50/45',
  illegible: 'border-rose-300 bg-rose-50/45'
};

const dropzonePillStyles = {
  pending: 'bg-slate-100 text-slate-700 ring-slate-200',
  uploaded: 'bg-sky-50 text-sky-800 ring-sky-200',
  processing: 'bg-amber-100 text-amber-900 ring-amber-200',
  validated: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  requires_review: 'bg-rose-100 text-rose-700 ring-rose-200',
  illegible: 'bg-rose-100 text-rose-700 ring-rose-200'
};

const dropzoneMessages = {
  pending: 'Listo para cargar',
  uploaded: 'Documento cargado',
  processing: 'Analizando documento con IA...',
  validated: 'Documento validado',
  requires_review: 'Hay documentos inválidos, revisa la lista inferior.',
  illegible: 'Hay documentos inválidos, revisa la lista inferior.'
};

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
  const isValidated = status === 'validated';
  const hasIssue = status === 'requires_review' || status === 'illegible';
  const isProcessing = status === 'processing';

  return (
    <button
      type="button"
      onClick={onSimulateUpload}
      className={`focus-ring group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft ${
        cardStyles[status] ?? cardStyles.pending
      } ${isValidated ? 'shadow-[0_0_0_1px_rgba(16,185,129,0.08)]' : ''}`}
    >
      <div className={`absolute left-0 top-0 h-1.5 w-full ${isValidated ? 'bg-emerald-500' : hasIssue ? 'bg-rose-500' : isProcessing ? 'bg-amber-500' : 'bg-sky-500'}`} />
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

      <div
        className={`mt-4 flex min-h-28 flex-1 items-center justify-center rounded-2xl border-2 border-dashed px-4 text-center transition ${
          dropzoneStyles[status] ?? dropzoneStyles.pending
        } ${isValidated ? 'group-hover:border-emerald-300 group-hover:bg-emerald-50/60' : hasIssue ? 'group-hover:border-rose-300 group-hover:bg-rose-50/60' : 'group-hover:border-sky-200 group-hover:bg-sky-50/50'}`}
      >
        <div className="space-y-2">
          <span
            className={`mx-auto inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
              dropzonePillStyles[status] ?? dropzonePillStyles.pending
            }`}
          >
            {hasIssue && <AlertIcon className="h-4 w-4" />}
            {isValidated && <CheckIcon className="h-4 w-4" />}
            {isProcessing && <SparkIcon className="h-4 w-4 animate-pulse" />}
            {dropzoneMessages[status] ?? dropzoneMessages.pending}
          </span>
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
