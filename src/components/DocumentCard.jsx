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
  const hasIssue = document.status === 'requires_review' || document.status === 'illegible';
  const isValidated = document.status === 'validated';
  const isProcessing = document.status === 'processing';
  const dropzoneLabel = hasIssue ? 'Hay documentos inválidos, revisa la lista inferior.' : 'Arrastra y suelta aquí';
  const dropzoneTone = hasIssue
    ? 'border-[#E74C2C] bg-[#FFF7F5]'
    : isValidated
      ? 'border-emerald-300 bg-emerald-50/35'
      : isProcessing
        ? 'border-amber-300 bg-amber-50/45'
        : 'border-slate-200 bg-white';
  const dropzoneHoverTone = hasIssue
    ? 'hover:border-[#E74C2C] hover:bg-[#FFF4F1]'
    : isValidated
      ? 'hover:border-emerald-300 hover:bg-emerald-50/50'
      : 'hover:border-sky-300 hover:bg-sky-50/30';

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
        isHighlighted ? 'border-sky-300 shadow-glow' : hasIssue ? 'border-[#F6C4B8]' : 'border-slate-200'
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
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[document.status]}`}>
            <StatusDot status={document.status} />
            {statusLabel(document.status)}
          </div>
        </div>
      </div>

      <div
        className={`mt-4 rounded-[1.5rem] border-2 border-dashed px-4 py-6 transition sm:px-6 sm:py-8 ${dropzoneTone} ${dropzoneHoverTone}`}
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
          <div
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold ${
              hasIssue ? 'bg-[#FDE7E2] text-[#E74C2C]' : isValidated ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'
            }`}
          >
            {hasIssue && <AlertIcon className="h-4 w-4" />}
            {isValidated && <CheckIcon className="h-4 w-4" />}
            {isProcessing && <SparkIcon className="h-4 w-4 animate-pulse" />}
            {hasIssue ? 'Hay documentos inválidos' : isValidated ? 'Documento validado' : 'Arrastra y suelta aquí'}
          </div>

          <p className="mt-4 text-base font-extrabold text-sky-800 sm:text-lg">
            {hasIssue ? 'Revisa este documento antes de continuar:' : 'Arrastra y suelta aquí'}
          </p>
          <p className="mt-2 text-sm text-slate-500 sm:text-[15px]">PDF, JPG o PNG</p>
          <button
            type="button"
            className={`focus-ring mt-4 inline-flex items-center justify-center rounded-full border bg-white px-5 py-2.5 text-sm font-extrabold transition ${
              hasIssue
                ? 'border-[#003781] text-[#003781] hover:bg-[#F8FBFF]'
                : 'border-sky-700 text-sky-800 hover:bg-sky-50'
            }`}
            onClick={openPicker}
          >
            Seleccionar archivos
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {displayFiles.length > 0 ? (
          displayFiles.map((file) => (
            <div
              key={file.id}
              className={`rounded-2xl px-4 py-3 ${
                hasIssue ? 'border border-[#E74C2C] bg-[#FFF7F5]' : isValidated ? 'border border-emerald-200 bg-emerald-50/35' : 'border border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold text-slate-900">{file.name}</p>
                    {hasIssue && (
                      <span className="inline-flex items-center rounded-full bg-[#F6C4B8] px-3 py-1 text-xs font-semibold text-[#E74C2C]">
                        Documento inválido
                      </span>
                    )}
                    {isValidated && (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Válido
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {file.size} · {file.type}
                  </p>
                  {hasIssue && (
                    <p className="mt-3 text-sm font-semibold text-[#E74C2C]">
                      Revisa este documento antes de continuar:
                    </p>
                  )}
                  {hasIssue && (
                    <p className="mt-1 text-sm leading-6 text-[#E74C2C]">{document.validationNote}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      hasIssue ? 'bg-white text-[#003781] hover:bg-[#F8FBFF]' : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                    }`}
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
