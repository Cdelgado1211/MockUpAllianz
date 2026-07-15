import DocumentCard from './DocumentCard';
import WizardFooter from './WizardFooter';

export default function WizardStepDocuments({
  documents,
  observations,
  onObservationsChange,
  onFilesSelected,
  onRemoveFile,
  onBack,
  onSaveDraft,
  onPrimary,
  highlightedDocumentId
}) {
  const hasDocuments = documents.some((document) => document.files.length > 0);
  const canContinueWithoutDocuments = Boolean(observations.trim());
  const primaryDisabled = !hasDocuments && !canContinueWithoutDocuments;

  return (
    <section className="space-y-4">
      <div className="space-y-5">
        {documents.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            onFilesSelected={(files) => onFilesSelected(document.id, files)}
            onDropFiles={(files) => onFilesSelected(document.id, files)}
            onRemoveFile={(fileId) => onRemoveFile(document.id, fileId)}
            onReplaceFile={(openPicker) => openPicker()}
            isHighlighted={highlightedDocumentId === document.id}
          />
        ))}
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <label className="block">
          <span className="mb-2 block text-sm font-extrabold text-slate-900">Observaciones generales</span>
          <textarea
            rows="5"
            value={observations}
            onChange={(event) => onObservationsChange(event.target.value)}
            placeholder="Escribe cualquier observación que ayude a contextualizar tu trámite..."
            className="focus-ring w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400"
          />
          <p className="mt-2 text-xs text-slate-500">
            Si no adjuntas documentos, escribe observaciones generales para poder continuar.
          </p>
        </label>
      </div>

      <WizardFooter
        onBack={onBack}
        onSaveDraft={onSaveDraft}
        onPrimary={onPrimary}
        primaryLabel="Continuar"
        primaryDisabled={primaryDisabled}
      />
    </section>
  );
}
