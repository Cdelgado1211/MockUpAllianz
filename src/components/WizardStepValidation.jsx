import WizardFooter from './WizardFooter';
import ValidationProcessingScreen from './ValidationProcessingScreen';
import ValidationResultsPanel from './ValidationResultsPanel';

export default function WizardStepValidation({
  validationPhase,
  validationStageIndex,
  validationProgress,
  summary,
  correctDocuments,
  reviewDocuments,
  alerts,
  onBack,
  onSaveDraft,
  onPrimary,
  onResolveAlert,
  onEditDocument,
  onViewDocument,
  onIgnoreAlert
}) {
  return (
    <section className="space-y-4">
      {validationPhase === 'processing' ? (
        <ValidationProcessingScreen stageIndex={validationStageIndex} progress={validationProgress} />
      ) : (
        <ValidationResultsPanel
          summary={summary}
          correctDocuments={correctDocuments}
          reviewDocuments={reviewDocuments}
          alerts={alerts}
          onResolveAlert={onResolveAlert}
          onEditDocument={onEditDocument}
          onViewDocument={onViewDocument}
          onIgnoreAlert={onIgnoreAlert}
        />
      )}

      <WizardFooter
        onBack={onBack}
        onSaveDraft={onSaveDraft}
        onPrimary={onPrimary}
        primaryLabel="Continuar"
        primaryDisabled={validationPhase === 'processing'}
      />
    </section>
  );
}
