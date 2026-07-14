import { useMemo, useRef } from 'react';
import { AlertIcon, CheckIcon, DownloadIcon, SparkIcon } from './Icon';

const statusStyles = {
  pending: 'bg-slate-100 text-slate-700 ring-slate-200',
  uploaded: 'bg-sky-50 text-sky-800 ring-sky-200',
  processing: 'bg-amber-50 text-amber-900 ring-amber-200',
  validated: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  requires_review: 'bg-orange-50 text-orange-800 ring-orange-200',
  illegible: 'bg-rose-50 text-rose-800 ring-rose-200'
};

function statusLabel(status) {
  switch (status) {
    case 'uploaded':
      return 'Cargado';
    case 'processing':
      return 'Procesando';
    case 'validated':
      return 'Validado';
    case 'requires_review':
      return 'Requiere revisión';
    case 'illegible':
      return 'Ilegible';
    default:
      return 'Pendiente';
  }
}

function StatusDot({ status }) {
  if (status === 'validated') return <CheckIcon className="h-4 w-4" />;
  if (status === 'requires_review' || status === 'illegible') return <AlertIcon className="h-4 w-4" />;
  if (status === 'processing') return <SparkIcon className="h-4 w-4 animate-pulse" />;
  return <DownloadIcon className="h-4 w-4" />;
}

export default function DocumentCard({
  document,
  onFilesSelected,
  onRemoveFile,
  onReplaceFile,
  onSelectFiles,
  onDropFiles,
  isHighlighted = false
}) {
  const inputRef = useRef(null);
  const multiple = document.multiple;
  const displayFiles = useMemo(() => document.files ?? [], [document.files]);

  const openPicker = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const handleInputChange = (event) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length) onFilesSelected(files);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files ?? []);
    if (files.length) onDropFiles(files);
  };

  const handleDragOver = (event) => event.preventDefault();

  return (
    <article
      className={`rounded-[1.75rem] border bg-white p-4 shadow-sm transition sm:p-5 ${
        isHighlighted ? 'border-sky-300 shadow-glow' : 'border-slate-200'
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-xl font-extrabold leading-tight text-slate-900 sm:text-[1.35rem]">
            {document.label}
          </h3>
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-600">{document.description}</p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          {document.required ? (
            <span className="text-sm font-bold text-slate-500">Requerido</span>
          ) : (
            <span className="text-sm font-bold text-slate-500">Opcional</span>
          )}
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[document.status]}`}>
            <StatusDot status={document.status} />
            {statusLabel(document.status)}
          </div>
        </div>
      </div>

      <div
        className="mt-4 rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-white px-4 py-6 transition hover:border-sky-300 hover:bg-sky-50/30 sm:px-6 sm:py-8"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip,.xml"
          multiple={multiple}
          className="hidden"
          onChange={handleInputChange}
        />

        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <DownloadIcon className="h-5 w-5" />
          </div>
          <p className="mt-4 text-base font-extrabold text-sky-800 sm:text-lg">Arrastra y suelta aquí</p>
          <p className="mt-2 text-sm text-slate-500 sm:text-[15px]">PDF, JPG o PNG</p>
          <button
            type="button"
            className="focus-ring mt-4 inline-flex items-center justify-center rounded-full border border-sky-700 bg-white px-5 py-2.5 text-sm font-extrabold text-sky-800 transition hover:bg-sky-50"
            onClick={openPicker}
          >
            Seleccionar archivos
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {displayFiles.length > 0 ? (
          displayFiles.map((file) => (
            <div key={file.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{file.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {file.size} · {file.type}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-800 transition hover:bg-sky-100"
                    onClick={() => onReplaceFile(openPicker)}
                  >
                    Reemplazar
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                    onClick={() => onRemoveFile(file.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="px-1 text-sm text-slate-500">Aún no hay archivos cargados.</p>
        )}
      </div>
    </article>
  );
}
