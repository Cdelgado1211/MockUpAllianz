import { CheckIcon, SparkIcon } from './Icon';
import DocumentCard from './DocumentCard';
import ValidationProcessingScreen from './ValidationProcessingScreen';
import ValidationResultsPanel from './ValidationResultsPanel';
import WizardFooter from './WizardFooter';

function LoadSummary({ documents }) {
  const loaded = documents.filter((document) => document.files.length > 0).length;
  const requiredPending = documents.filter((document) => document.required && document.files.length === 0).length;
  const formatErrors = documents.filter((document) => ['invalid_format', 'format_error'].includes(document.status)).length;
  const ready = documents.filter((document) => document.files.length > 0 && document.status !== 'processing').length;

  const items = [
    ['Documentos cargados', loaded, 'text-[#003781]'],
    ['Requeridos pendientes', requiredPending, requiredPending ? 'text-[#A15C00]' : 'text-[#137333]'],
    ['Errores de formato', formatErrors, formatErrors ? 'text-[#D93025]' : 'text-[#137333]'],
    ['Listos para validar', ready, 'text-[#006494]']
  ];

  return (
    <section className="rounded-[20px] border border-[#D9E1EA] bg-[#F7FAFC] p-4 sm:p-5" aria-label="Resumen de carga documental">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#006494]">Resumen de carga</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([label, value, color]) => (
          <div key={label} className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold leading-5 text-[#586273]">{label}</p>
            <p className={`mt-1 text-2xl font-extrabold ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function WizardStepDocuments({
  documents,
  selectedTramite,
  observations,
  onObservationsChange,
  onFilesSelected,
  onRemoveFile,
  onBack,
  onSaveDraft,
  onPrimary,
  onValidate,
  validationPhase,
  validationStageIndex,
  validationProgress,
  validationCompleted,
  summary,
  correctDocuments,
  reviewDocuments,
  alerts,
  onResolveAlert,
  onEditDocument,
  onIgnoreAlert,
  highlightedDocumentId
}) {
  const excludedDocumentIds = selectedTramite === 'cirugia_programada' ? new Set(['solicitud', 'identificacion', 'historia']) : new Set();
  const visibleDocuments = documents.filter((document) => !excludedDocumentIds.has(document.id));
  const hasDocuments = visibleDocuments.some((document) => document.files.length > 0);
  const isProcessing = validationPhase === 'processing';
  const canValidate = hasDocuments && !isProcessing && !visibleDocuments.some((document) => document.status === 'processing');
  const statusMessage =
    validationPhase === 'outdated'
      ? 'Actualizaste un documento. Vuelve a validar para obtener resultados actualizados.'
      : validationPhase === 'results'
        ? 'Terminamos la revisión. Consulta los resultados a continuación.'
        : 'Cuando termines de adjuntar tus documentos, inicia la validación.';

  return (
    <section className="space-y-5">
      <header className="rounded-[20px] border border-[#C7D8F1] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#006494]">Paso 1</p>
        <h1 className="mt-1 text-[25px] font-semibold leading-8 text-[#181C1E] sm:text-[30px]">Documentos y validación</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#434751]">
          Adjunta los documentos necesarios y, cuando estén listos, inicia la revisión.
        </p>
      </header>

      <div className="space-y-5">
        {visibleDocuments.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            disabled={isProcessing}
            onFilesSelected={(files) => onFilesSelected(document.id, files)}
            onDropFiles={(files) => onFilesSelected(document.id, files)}
            onRemoveFile={(fileId) => onRemoveFile(document.id, fileId)}
            onReplaceFile={(openPicker) => openPicker()}
            isHighlighted={highlightedDocumentId === document.id}
          />
        ))}
      </div>

      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <label className="block">
          <span className="mb-2 block text-sm font-extrabold text-slate-900">Observaciones generales</span>
          <textarea
            rows="4"
            value={observations}
            disabled={isProcessing}
            onChange={(event) => onObservationsChange(event.target.value)}
            placeholder="Escribe cualquier observación que ayude a contextualizar tu trámite..."
            className="focus-ring w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>
      </div>

      <LoadSummary documents={visibleDocuments} />

      <div className="flex flex-col gap-3 rounded-[20px] border border-[#C7D8F1] bg-[#F8FBFF] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="text-sm font-bold text-[#181C1E]">¿Ya terminaste de adjuntar tus documentos?</p>
          <p className="mt-1 text-sm leading-6 text-[#586273]">{statusMessage}</p>
        </div>
        <button
          type="button"
          disabled={!canValidate}
          onClick={onValidate}
          className="focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#003781] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#002B65] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isProcessing ? <SparkIcon className="h-4 w-4 animate-pulse" /> : <CheckIcon className="h-4 w-4" />}
          {validationPhase === 'outdated' ? 'Volver a validar' : 'Validar documentos'}
        </button>
      </div>

      {isProcessing ? (
        <div id="validation-processing" className="scroll-mt-6">
          <ValidationProcessingScreen stageIndex={validationStageIndex} progress={validationProgress} />
        </div>
      ) : null}

      {validationPhase === 'results' && validationCompleted ? (
        <section id="validation-results" aria-labelledby="validation-results-title" className="scroll-mt-6 space-y-4 border-t border-[#D9E1EA] pt-6">
          <div tabIndex="-1" id="validation-results-title" className="rounded-[20px] bg-[#F7FAFC] px-5 py-4 outline-none sm:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#006494]">Resultados</p>
            <h2 className="mt-1 text-[22px] font-semibold leading-7 text-[#181C1E]">Terminamos la revisión</h2>
            <p className="mt-2 text-sm leading-6 text-[#434751]">Consulta los resultados y corrige los documentos que lo necesiten.</p>
          </div>
          <ValidationResultsPanel
            summary={summary}
            correctDocuments={correctDocuments}
            reviewDocuments={reviewDocuments}
            alerts={alerts}
            onResolveAlert={onResolveAlert}
            onEditDocument={onEditDocument}
            onIgnoreAlert={onIgnoreAlert}
          />
        </section>
      ) : null}

      <WizardFooter
        onBack={onBack}
        onSaveDraft={onSaveDraft}
        onPrimary={onPrimary}
        primaryLabel="Siguiente"
        primaryDisabled={!validationCompleted || validationPhase !== 'results' || isProcessing}
      />
    </section>
  );
}
