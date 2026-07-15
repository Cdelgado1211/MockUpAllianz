import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import ConfirmationModal from './components/ConfirmationModal';
import FilePreviewModal from './components/FilePreviewModal';
import InfoIntroModal from './components/InfoIntroModal';
import InfoModal from './components/InfoModal';
import TramiteSelectionScreen from './components/TramiteSelectionScreen';
import TransitionScreen from './components/TransitionScreen';
import WizardStepper from './components/WizardStepper';
import WizardStepClaim from './components/WizardStepClaim';
import WizardStepDocuments from './components/WizardStepDocuments';
import WizardStepInformation from './components/WizardStepInformation';
import WizardStepReview from './components/WizardStepReview';
import WizardStepValidation from './components/WizardStepValidation';
import { CheckIcon } from './components/Icon';
import { createInitialWizardState, createMockFileMeta, countDocumentsByStatus, getLoadedDocuments, validationStages } from './data/mockReembolso';

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.value };
    case 'SET_STEP':
      return { ...state, currentStep: action.value };
    case 'SET_REVIEW_CONFIRMED':
      return { ...state, reviewConfirmed: action.value };
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.value };
    case 'SET_OBSERVATIONS':
      return { ...state, observations: action.value };
    case 'SET_DOCUMENT_STATUS':
      return {
        ...state,
        documents: state.documents.map((document) =>
          document.id === action.documentId
            ? { ...document, status: action.status, validationNote: action.validationNote ?? document.validationNote }
            : document
        )
      };
    case 'SET_DOCUMENT_FILES':
      return {
        ...state,
        documents: state.documents.map((document) =>
          document.id === action.documentId
            ? {
                ...document,
                files: action.files,
                status: action.status ?? document.status,
                validationNote: action.validationNote ?? document.validationNote
              }
            : document
        )
      };
    case 'REMOVE_DOCUMENT_FILE':
      return {
        ...state,
        documents: state.documents.map((document) => {
          if (document.id !== action.documentId) return document;
          const files = document.files.filter((file) => file.id !== action.fileId);
          return {
            ...document,
            files,
            status: files.length > 0 ? document.status : 'pending',
            validationNote: files.length > 0 ? document.validationNote : 'Pendiente'
          };
        })
      };
    case 'SET_VALIDATION_PHASE':
      return { ...state, validationPhase: action.value };
    case 'SET_VALIDATION_STAGE_INDEX':
      return { ...state, validationStageIndex: action.value };
    case 'RESET_VALIDATION':
      return {
        ...state,
        validationPhase: 'idle',
        validationStageIndex: 0,
        validationCompleted: false
      };
    case 'SET_VALIDATION_COMPLETED':
      return { ...state, validationCompleted: action.value };
    case 'SET_POLICY_FIELD':
      return {
        ...state,
        policy: {
          ...state.policy,
          [action.field]: action.value
        }
      };
    case 'SET_PERSON_FIELD':
      return {
        ...state,
        person: {
          ...state.person,
          [action.field]: action.value,
          ...(action.field === 'firstName' || action.field === 'paternalLastName' || action.field === 'maternalLastName'
            ? {
                fullName: [action.field === 'firstName' ? action.value : state.person.firstName, action.field === 'paternalLastName' ? action.value : state.person.paternalLastName, action.field === 'maternalLastName' ? action.value : state.person.maternalLastName]
                  .map((part) => String(part ?? '').trim())
                  .filter(Boolean)
                  .join(' ')
              }
            : {})
        }
      };
    case 'SET_CONTACT_FIELD':
      return {
        ...state,
        contact: {
          ...state.contact,
          [action.field]: action.value
        }
      };
    case 'SET_CLAIMANT_FIELD':
      return {
        ...state,
        claimant: {
          ...state.claimant,
          [action.field]: action.value
        }
      };
    case 'SET_ALERTS':
      return { ...state, alerts: action.value };
    case 'MARK_ALERT_IGNORED':
      return {
        ...state,
        ignoredAlerts: state.ignoredAlerts.includes(action.alertId)
          ? state.ignoredAlerts
          : [...state.ignoredAlerts, action.alertId],
        acceptedAlerts: state.acceptedAlerts.includes(action.alertId)
          ? state.acceptedAlerts
          : [...state.acceptedAlerts, action.alertId]
      };
    case 'SET_FILE_PREVIEW':
      return state;
    case 'SET_SAVE_TOAST':
      return { ...state, saveToast: action.value };
    case 'SET_FINAL_CONFIRMED':
      return { ...state, finalConfirmed: action.value };
    case 'SET_PROCESSING_HINT':
      return { ...state, processingHint: action.value };
    default:
      return state;
  }
}

function validatePhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.length === 10;
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim());
}

function getContactErrors(contact) {
  return {
    phoneLandline: contact.phoneLandline && !validatePhone(contact.phoneLandline) ? 'El teléfono particular debe tener 10 dígitos.' : '',
    mobilePhone: validatePhone(contact.mobilePhone) ? '' : 'El teléfono celular debe tener 10 dígitos.',
    email: validateEmail(contact.email) ? '' : 'Ingresa un correo electrónico válido.',
    emailConfirmation:
      contact.emailConfirmation && contact.email === contact.emailConfirmation ? '' : 'La confirmación de correo debe coincidir.'
  };
}

function getClaimErrors(claimant) {
  if (claimant.type !== 'Complemento') return '';
  if (claimant.knowsSinisterNumber === 'Sí' && !String(claimant.sinisterNumber ?? '').trim()) {
    return 'El número de siniestro es obligatorio cuando conoces el dato.';
  }
  return '';
}

function getReviewBlockedReason(state) {
  const contactErrors = getContactErrors(state.contact);
  if (contactErrors.mobilePhone || contactErrors.email || contactErrors.emailConfirmation || contactErrors.phoneLandline) return 'contact';
  if (state.person.relationship === 'Otro') {
    if (
      !String(state.person.parentesco ?? '').trim() ||
      !state.person.firstName.trim() ||
      !state.person.paternalLastName.trim() ||
      !state.person.maternalLastName.trim()
    ) {
      return 'person';
    }
  }
  const claimError = getClaimErrors(state.claimant);
  if (claimError) return 'claim';
  return '';
}

function getRelatedStepIndex(alert) {
  const title = `${alert.field} ${alert.sourceDocument} ${alert.comparedDocument}`.toLowerCase();
  if (title.includes('clabe') || title.includes('siniestro')) return 3;
  if (title.includes('póliza') || title.includes('correo') || title.includes('teléfono') || title.includes('nombre') || title.includes('firma')) {
    return 2;
  }
  return 0;
}

function getRelatedDocumentId(alert) {
  const text = `${alert.field} ${alert.sourceDocument} ${alert.comparedDocument}`.toLowerCase();
  if (text.includes('clabe')) return null;
  if (text.includes('aviso') || text.includes('nombre del paciente')) return 'informe';
  if (text.includes('solicitud') || text.includes('firma') || text.includes('póliza')) return 'solicitud';
  if (text.includes('domicilio')) return 'domicilio';
  if (text.includes('factura') || text.includes('gasto')) return 'gastos';
  if (text.includes('identificación')) return 'identificacion';
  return 'aviso';
}

function WizardApp() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialWizardState);
  const [showDocsWarningModal, setShowDocsWarningModal] = useState(false);
  const [docsWarningContext, setDocsWarningContext] = useState('partial');
  const [showAlertContinueModal, setShowAlertContinueModal] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [highlightedDocumentId, setHighlightedDocumentId] = useState(null);
  const [selectedTramite, setSelectedTramite] = useState(null);
  const [hasViewedReimbursementPopup, setHasViewedReimbursementPopup] = useState(false);
  const [showTramiteInfoModal, setShowTramiteInfoModal] = useState(false);
  const [showTramiteDocumentsModal, setShowTramiteDocumentsModal] = useState(false);
  const uploadTimersRef = useRef({});
  const validationTimersRef = useRef([]);
  const toastTimerRef = useRef(null);
  const selectionNextButtonRef = useRef(null);

  useEffect(() => {
    return () => {
      Object.values(uploadTimersRef.current).forEach((timerId) => clearTimeout(timerId));
      validationTimersRef.current.forEach((timerId) => clearTimeout(timerId));
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (state.phase !== 'wizard' || state.currentStep !== 1 || state.validationPhase !== 'processing') return undefined;

    validationTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    validationTimersRef.current = [];

    validationStages.forEach((_, index) => {
      const timerId = window.setTimeout(() => {
        dispatch({ type: 'SET_VALIDATION_STAGE_INDEX', value: index });
      }, 320 * index);
      validationTimersRef.current.push(timerId);
    });

    const completeTimer = window.setTimeout(() => {
      dispatch({ type: 'SET_VALIDATION_STAGE_INDEX', value: validationStages.length - 1 });
      dispatch({ type: 'SET_VALIDATION_PHASE', value: 'results' });
      dispatch({ type: 'SET_VALIDATION_COMPLETED', value: true });
    }, 320 * validationStages.length + 180);

    validationTimersRef.current.push(completeTimer);

    return () => {
      validationTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    };
  }, [state.currentStep, state.phase, state.validationPhase]);

  useEffect(() => {
    if (!state.saveToast) return undefined;
    toastTimerRef.current = window.setTimeout(() => dispatch({ type: 'SET_SAVE_TOAST', value: '' }), 2400);
    return () => clearTimeout(toastTimerRef.current);
  }, [state.saveToast]);

  useEffect(() => {
    if (!highlightedDocumentId) return undefined;
    const timerId = window.setTimeout(() => setHighlightedDocumentId(null), 2400);
    return () => clearTimeout(timerId);
  }, [highlightedDocumentId]);

  useEffect(() => {
    if (state.phase !== 'wizard') return;
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, [state.phase, state.currentStep]);

  const contactErrors = useMemo(() => getContactErrors(state.contact), [state.contact]);
  const claimError = useMemo(() => getClaimErrors(state.claimant), [state.claimant]);
  const reviewBlockedReason = useMemo(() => getReviewBlockedReason(state), [state.contact, state.person, state.claimant]);

  const loadedDocuments = useMemo(() => getLoadedDocuments(state.documents), [state.documents]);
  const processedCount = loadedDocuments.length;
  const validatedCount = countDocumentsByStatus(state.documents, 'validated');
  const reviewCount = countDocumentsByStatus(state.documents, 'requires_review');
  const illegibleCount = countDocumentsByStatus(state.documents, 'illegible');
  const pendingCount = countDocumentsByStatus(state.documents, 'pending');
  const processingCount = countDocumentsByStatus(state.documents, 'processing');
  const activeAlerts = state.alerts.filter((alert) => alert.status === 'active' && !state.ignoredAlerts.includes(alert.id));
  const correctDocuments = state.documents.filter((document) => document.status === 'validated');
  const reviewDocuments = state.documents.filter((document) => document.status === 'requires_review' || document.status === 'illegible');

  const validationSummary = {
    processed: processedCount,
    validated: validatedCount,
    review: reviewCount,
    illegible: illegibleCount,
    pending: pendingCount,
    processing: processingCount,
    alerts: activeAlerts.length
  };

  const validationProgress =
    state.validationPhase === 'processing'
      ? Math.round(((state.validationStageIndex + 1) / validationStages.length) * 100)
      : state.validationPhase === 'results'
        ? 100
        : 0;

  const showToast = (message) => {
    dispatch({ type: 'SET_SAVE_TOAST', value: message });
  };

  const markValidationReset = () => {
    dispatch({ type: 'RESET_VALIDATION' });
    dispatch({ type: 'SET_REVIEW_CONFIRMED', value: false });
  };

  const startValidation = () => {
    dispatch({ type: 'SET_STEP', value: 1 });
    dispatch({ type: 'SET_VALIDATION_STAGE_INDEX', value: 0 });
    dispatch({ type: 'SET_VALIDATION_COMPLETED', value: false });
    dispatch({ type: 'SET_VALIDATION_PHASE', value: 'processing' });
  };

  const handleAssistantHelp = () => {
    showToast('Solicitud enviada al asistente digital simulado.');
  };

  const handleTramiteSelect = (tramiteId) => {
    setSelectedTramite(tramiteId);
    if (tramiteId === 'reembolso') {
      setShowTramiteInfoModal(true);
    }
  };

  const handleSelectionInfoClose = () => {
    setShowTramiteInfoModal(false);
    if (selectedTramite === 'reembolso') setShowTramiteDocumentsModal(true);
  };

  const handleSelectionDocumentsClose = () => {
    setShowTramiteDocumentsModal(false);
    if (selectedTramite === 'reembolso') {
      setHasViewedReimbursementPopup(true);
      window.requestAnimationFrame(() => {
        selectionNextButtonRef.current?.focus();
      });
    }
  };

  const handleSelectionNext = () => {
    if (selectedTramite !== 'reembolso' || showTramiteInfoModal || showTramiteDocumentsModal || !hasViewedReimbursementPopup) {
      return;
    }

    dispatch({ type: 'SET_PHASE', value: 'wizard' });
    dispatch({ type: 'SET_STEP', value: 0 });
  };

  const handleSaveDraft = () => showToast('Borrador guardado localmente.');

  const handleNavigateStep = (stepIndex) => {
    if (stepIndex > state.currentStep) return;
    dispatch({ type: 'SET_STEP', value: stepIndex });
  };

  const handleDocumentsContinue = () => {
    const hasDocuments = state.documents.some((document) => document.files.length > 0);
    const hasObservations = Boolean(state.observations.trim());
    const hasEmptyDocuments = state.documents.some((document) => document.files.length === 0);

    if (!hasDocuments && !hasObservations) {
      return;
    }

    if (!hasDocuments) {
      setDocsWarningContext('no-docs');
      setShowDocsWarningModal(true);
      return;
    }

    if (hasEmptyDocuments) {
      setDocsWarningContext('partial');
      setShowDocsWarningModal(true);
      return;
    }

    startValidation();
  };

  const handleDocsWarningProceed = () => {
    setShowDocsWarningModal(false);
    if (docsWarningContext === 'no-docs') {
      dispatch({ type: 'RESET_VALIDATION' });
      dispatch({ type: 'SET_STEP', value: 2 });
      return;
    }

    startValidation();
  };

  const handleValidationContinue = () => {
    if (activeAlerts.length > 0) {
      setShowAlertContinueModal(true);
      return;
    }
    dispatch({ type: 'SET_STEP', value: 2 });
  };

  const handleInformationContinue = () => {
    if (reviewBlockedReason) return;
    dispatch({ type: 'SET_STEP', value: 3 });
  };

  const handleClaimContinue = () => {
    if (claimError) return;
    dispatch({ type: 'SET_STEP', value: 4 });
  };

  const handleConfirmSend = () => {
    if (state.reviewConfirmed && !reviewBlockedReason) {
      dispatch({ type: 'SET_PHASE', value: 'transition' });
      dispatch({ type: 'SET_FINAL_CONFIRMED', value: true });
    }
  };

  const handleDocumentUpload = (documentId, files) => {
    if (!files.length) return;

    const fileMetas = files.map((file) => createMockFileMeta(file, 'uploaded'));
    const targetDocument = state.documents.find((document) => document.id === documentId);
    if (!targetDocument) return;

    const nextFiles = targetDocument.multiple ? [...targetDocument.files, ...fileMetas] : [fileMetas[0]];

    dispatch({
      type: 'SET_DOCUMENT_FILES',
      documentId,
      files: nextFiles,
      status: 'processing',
      validationNote: 'Procesando documento'
    });
    markValidationReset();

    if (uploadTimersRef.current[documentId]) clearTimeout(uploadTimersRef.current[documentId]);
    uploadTimersRef.current[documentId] = window.setTimeout(() => {
      dispatch({
        type: 'SET_DOCUMENT_STATUS',
        documentId,
        status: documentId === 'informe' ? 'requires_review' : 'validated',
        validationNote:
          documentId === 'informe' ? 'Nombre con diferencia detectada' : 'Documento validado automáticamente'
      });
      delete uploadTimersRef.current[documentId];
    }, 1200);
  };

  const handleRemoveDocumentFile = (documentId, fileId) => {
    dispatch({ type: 'REMOVE_DOCUMENT_FILE', documentId, fileId });
    markValidationReset();
  };

  const handlePreviewFile = (item) => {
    if (!item) return;
    if (item.name) {
      setFilePreview(item);
      return;
    }

    const fallbackFile = item.files?.[0] ?? null;
    setFilePreview(
      fallbackFile ?? {
        name: item.label ?? 'Documento simulado',
        size: item.validationNote ?? 'Vista previa no disponible',
        type: item.status ?? 'Simulado',
        status: item.status ?? 'simulado'
      }
    );
  };
  const handleEditDocument = (document) => {
    setHighlightedDocumentId(document.id);
    dispatch({ type: 'SET_STEP', value: 0 });
    showToast(`Revisa el documento ${document.label}.`);
  };

  const handleAlertResolve = (alert) => {
    dispatch({ type: 'SET_STEP', value: getRelatedStepIndex(alert) });
    const relatedDocumentId = getRelatedDocumentId(alert);
    setHighlightedDocumentId(relatedDocumentId);
    if (relatedDocumentId === 'informe' || relatedDocumentId === 'solicitud' || relatedDocumentId === 'gastos' || relatedDocumentId === 'domicilio') {
      showToast(`Revisa el documento relacionado con: ${alert.field}.`);
    } else {
      showToast(`Revisa el dato relacionado con: ${alert.field}.`);
    }
  };

  const handleAlertIgnore = (alertId) => {
    dispatch({ type: 'MARK_ALERT_IGNORED', alertId });
    showToast('La alerta fue aceptada por el usuario.');
  };

  const handleModalContinueAlerts = () => {
    setShowAlertContinueModal(false);
    dispatch({ type: 'SET_STEP', value: 2 });
  };

  const handleCurrentStepPrimary = () => {
    if (state.currentStep === 0) handleDocumentsContinue();
    if (state.currentStep === 1) handleValidationContinue();
    if (state.currentStep === 2) handleInformationContinue();
    if (state.currentStep === 3) handleClaimContinue();
    if (state.currentStep === 4) handleConfirmSend();
  };

  const renderWizardStep = () => {
    if (state.currentStep === 0) {
      return (
        <WizardStepDocuments
          documents={state.documents}
          observations={state.observations}
          onObservationsChange={(value) => {
            dispatch({ type: 'SET_OBSERVATIONS', value });
            if (value.trim()) markValidationReset();
          }}
          onFilesSelected={handleDocumentUpload}
          onRemoveFile={handleRemoveDocumentFile}
          onBack={() => dispatch({ type: 'SET_PHASE', value: 'entry' })}
          onSaveDraft={handleSaveDraft}
          onPrimary={handleDocumentsContinue}
          highlightedDocumentId={highlightedDocumentId}
        />
      );
    }

    if (state.currentStep === 1) {
      return (
        <WizardStepValidation
          validationPhase={state.validationPhase}
          validationStageIndex={state.validationStageIndex}
          validationProgress={validationProgress}
          summary={validationSummary}
          correctDocuments={correctDocuments}
          reviewDocuments={reviewDocuments}
          alerts={activeAlerts}
          onBack={() => dispatch({ type: 'SET_STEP', value: 0 })}
          onSaveDraft={handleSaveDraft}
          onPrimary={handleValidationContinue}
          onResolveAlert={handleAlertResolve}
          onEditDocument={handleEditDocument}
          onIgnoreAlert={handleAlertIgnore}
        />
      );
    }

    if (state.currentStep === 2) {
      return (
        <WizardStepInformation
          policy={state.policy}
          person={state.person}
          contact={state.contact}
          claimant={state.claimant}
          extracted={state.extracted}
          contactErrors={contactErrors}
          onPolicyChange={(field, value) => {
            dispatch({ type: 'SET_POLICY_FIELD', field, value });
            dispatch({ type: 'SET_REVIEW_CONFIRMED', value: false });
          }}
          onPersonChange={(field, value) => {
            dispatch({ type: 'SET_PERSON_FIELD', field, value });
            dispatch({ type: 'SET_REVIEW_CONFIRMED', value: false });
          }}
          onContactChange={(field, value) => {
            dispatch({ type: 'SET_CONTACT_FIELD', field, value });
            dispatch({ type: 'SET_REVIEW_CONFIRMED', value: false });
          }}
          onClaimantChange={(field, value) => {
            dispatch({ type: 'SET_CLAIMANT_FIELD', field, value });
            dispatch({ type: 'SET_REVIEW_CONFIRMED', value: false });
          }}
          onBack={() => dispatch({ type: 'SET_STEP', value: 1 })}
          onSaveDraft={handleSaveDraft}
          onPrimary={handleInformationContinue}
          primaryDisabled={Boolean(reviewBlockedReason)}
        />
      );
    }

    if (state.currentStep === 3) {
      return (
        <WizardStepClaim
          claimant={state.claimant}
          onClaimantChange={(field, value) => {
            dispatch({ type: 'SET_CLAIMANT_FIELD', field, value });
            dispatch({ type: 'SET_REVIEW_CONFIRMED', value: false });
          }}
          onBack={() => dispatch({ type: 'SET_STEP', value: 2 })}
          onSaveDraft={handleSaveDraft}
          onPrimary={handleClaimContinue}
          primaryDisabled={Boolean(claimError)}
          claimError={claimError}
        />
      );
    }

    return (
      <WizardStepReview
        policy={state.policy}
        person={state.person}
        contact={state.contact}
        claimant={state.claimant}
        documents={state.documents}
        alerts={state.alerts}
        reviewConfirmed={state.reviewConfirmed}
        onReviewConfirmedChange={(value) => dispatch({ type: 'SET_REVIEW_CONFIRMED', value })}
        recaptchaVisual
        onBack={() => dispatch({ type: 'SET_STEP', value: 3 })}
        onSaveDraft={handleSaveDraft}
        onPrimary={handleConfirmSend}
        onEditStep={(stepIndex) => dispatch({ type: 'SET_STEP', value: stepIndex })}
        onConfirmAndSendDisabled={!state.reviewConfirmed || Boolean(reviewBlockedReason)}
        onResolveAlert={handleAlertResolve}
        onIgnoreAlert={handleAlertIgnore}
        acceptedAlerts={state.acceptedAlerts}
      />
    );
  };

  if (state.phase === 'transition') {
    return <TransitionScreen />;
  }

  if (state.phase === 'entry') {
    return (
      <div className="min-h-screen bg-[#F7FAFC]">
        <TramiteSelectionScreen
          selected={selectedTramite}
          onSelect={handleTramiteSelect}
          onNext={handleSelectionNext}
          nextDisabled={selectedTramite !== 'reembolso' || !hasViewedReimbursementPopup || showTramiteInfoModal || showTramiteDocumentsModal}
          nextButtonRef={selectionNextButtonRef}
        />
        <InfoIntroModal open={showTramiteInfoModal} onContinue={handleSelectionInfoClose} />
        <InfoModal open={showTramiteDocumentsModal} onClose={handleSelectionDocumentsClose} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#181C1E]">
      <header className="border-b border-[#E0E6ED] bg-white">
        <div className="mx-auto flex w-full max-w-[1100px] items-center justify-center px-6 py-6 sm:py-8">
          <p className="font-display text-[26px] font-semibold tracking-tight text-[#003781] sm:text-[30px]">Allianz México</p>
        </div>
      </header>

      <main className="mx-auto flex min-h-screen w-full max-w-[1100px] flex-col px-6 py-6 sm:py-8">

        {state.phase === 'wizard' && (
          <div className="mx-auto mt-4 w-full max-w-[980px]">
            <WizardStepper
              currentStep={state.currentStep}
              onStepClick={handleNavigateStep}
              completedSteps={Array.from({ length: state.currentStep }, (_, index) => index)}
            />
          </div>
        )}

        {state.phase === 'wizard' && <section className="mx-auto mt-4 flex-1 w-full max-w-[980px]">{renderWizardStep()}</section>}
      </main>

      <InfoIntroModal open={showTramiteInfoModal} onContinue={handleSelectionInfoClose} />
      <InfoModal open={showTramiteDocumentsModal} onClose={handleSelectionDocumentsClose} />

      <ConfirmationModal
        open={showDocsWarningModal}
        title={docsWarningContext === 'no-docs' ? 'No has adjuntado documentos' : 'Aún tienes documentos vacíos'}
        description={
          docsWarningContext === 'no-docs'
            ? 'Solo tienes observaciones generales. ¿Deseas avanzar sin documentos adjuntos?'
            : 'Si deseas continuar, los documentos faltantes quedarán pendientes para esta solicitud. ¿Quieres avanzar de todas formas?'
        }
        confirmLabel="Sí, continuar"
        cancelLabel="No, regresar a documentos"
        onConfirm={handleDocsWarningProceed}
        onCancel={() => setShowDocsWarningModal(false)}
      />

      <ConfirmationModal
        open={showAlertContinueModal}
        title="Detectamos algunas diferencias en tu información"
        description="¿Deseas continuar de todas formas?"
        confirmLabel="Continuar de todas formas"
        cancelLabel="Revisar diferencias"
        onConfirm={handleModalContinueAlerts}
        onCancel={() => setShowAlertContinueModal(false)}
      />

      <FilePreviewModal file={filePreview} onClose={() => setFilePreview(null)} />

      {state.saveToast && (
        <div className="fixed right-4 top-4 z-50 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 shadow-soft">
          <div className="flex items-center gap-2">
            <CheckIcon className="h-4 w-4" />
            {state.saveToast}
          </div>
        </div>
      )}

    </div>
  );
}

export default WizardApp;
