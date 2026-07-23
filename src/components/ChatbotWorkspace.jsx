import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import ChatComposer from './ChatComposer';
import ChatContextPanel from './ChatContextPanel';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatSidebar from './ChatSidebar';
import FormDocumentSelector from './FormDocumentSelector';
import FormGeneratedDocumentMessage from './FormGeneratedDocumentMessage';
import FormSummaryMessage from './FormSummaryMessage';
import ClaimSummaryMessage from './ClaimSummaryMessage';
import InformationSummaryMessage from './InformationSummaryMessage';
import ConfirmationModal from './ConfirmationModal';
import DocumentCard from './DocumentCard';
import ValidationProcessingScreen from './ValidationProcessingScreen';
import ValidationResultsPanel from './ValidationResultsPanel';
import ValidationSummary from './ValidationSummary';
import ValidationDocumentCard from './ValidationDocumentCard';
import FormField from './FormField';
import { AlertIcon, ArrowRightIcon, CheckIcon, DownloadIcon, PaperclipIcon, SparkIcon } from './Icon';
import {
  buildChatbotAlerts,
  buildChatbotDocuments,
  chatbotFlowGuides,
  chatbotFormats,
  chatbotQuickActions,
  chatbotHistoryItems,
  createChatbotPreset,
  getChatbotFlowDocuments,
  getChatbotProgressIndex
} from '../data/mockChatbot';
import { createMockFileMeta, formatBytes } from '../data/mockReembolso';
import { generateMockPdf } from '../utils/generateMockPdf';
import {
  createFormDraft,
  buildGeneratedDocumentMeta,
  createFormSnapshot,
  findFormFieldByText,
  formComposerInterruptions,
  formDocumentSelectionOptions,
  formReviewOptions,
  getDocumentDefinition,
  getFormFieldById,
  getFormFieldLabel,
  getFormFieldPrompt,
  getNextFormField,
  getPreviousFormField,
  validateFormField
} from '../data/chatbotDocumentCompletion';
import {
  applyInformationCorrection,
  buildInformationSnapshot,
  getInformationFieldLabel,
  getInformationFieldPrompt,
  informationQuickReplies,
  parseInformationInput,
  validateInformationValue
} from '../data/chatbotInformation';
import {
  applyClaimCorrection,
  buildClaimSnapshot,
  getClaimFieldLabel,
  getClaimFieldPrompt,
  getClaimQuickReplies,
  getNextRequiredClaimField,
  parseClaimInput,
  validateClaimValue
} from '../data/chatbotClaim';

const flowLabels = {
  reembolso: 'Reembolso',
  cirugia_programada: 'Cirugía Programada'
};

// Escenario demostrativo: permite enseñar resultados mixtos sin depender de OCR real.
// Los demás documentos cargados se validan correctamente para que el contraste sea visible.
const documentValidationMocks = {
  reembolso: {
    informe: {
      status: 'requires_review',
      validationNote: 'El nombre identificado presenta una diferencia frente al Aviso de Accidente.'
    },
    domicilio: {
      status: 'illegible',
      validationNote: 'No fue posible leer con claridad la fecha de emisión del comprobante.'
    }
  },
  cirugia_programada: {
    informe: {
      status: 'requires_review',
      validationNote: 'La firma del médico tratante requiere una revisión adicional.'
    },
    estudios: {
      status: 'illegible',
      validationNote: 'La interpretación de estudios no se pudo leer con claridad.'
    }
  }
};

function getDocumentValidationResult(flow, documentId, scenario) {
  if (scenario === 'mixed') {
    return documentValidationMocks[flow]?.[documentId] ?? {
      status: 'validated',
      validationNote: 'Documento validado automáticamente.'
    };
  }

  if (scenario === 'review' && flow === 'reembolso' && documentId === 'informe') {
    return {
      status: 'requires_review',
      validationNote: 'Nombre con diferencia detectada.'
    };
  }

  return {
    status: 'validated',
    validationNote: 'Documento validado automáticamente.'
  };
}

const guideActions = {
  info: [
    { id: 'start-now', label: 'Sí, iniciar' },
    { id: 'info-only', label: 'No, solo necesitaba información' },
    { id: 'another-tramite', label: 'Consultar otro trámite' }
  ],
  start: [
    { id: 'download-formats', label: 'Descargar formatos' },
    { id: 'documents-ready', label: 'Ya tengo los documentos' },
    { id: 'continue-without-download', label: 'Continuar sin descargar' }
  ]
};

function getCurrentTimeLabel() {
  return new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit' }).format(new Date());
}

function createAssistantMessage(text) {
  return { id: `assistant-${Date.now()}-${Math.random().toString(16).slice(2)}`, role: 'assistant', text, timeLabel: getCurrentTimeLabel() };
}

function createUserMessage(text) {
  return { id: `user-${Date.now()}-${Math.random().toString(16).slice(2)}`, role: 'user', text, timeLabel: getCurrentTimeLabel() };
}

function createAttachmentMessage(documentLabel, files) {
  return {
    id: `attachment-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role: 'user',
    type: 'document-attachment',
    documentLabel,
    files: files.map((file) => ({ ...file })),
    timeLabel: getCurrentTimeLabel()
  };
}

function createInformationSummaryMessage(source, text = 'Revisa la información que tengo hasta ahora:') {
  return {
    id: `information-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role: 'assistant',
    type: 'information-summary',
    text,
    snapshot: buildInformationSnapshot(source.policy, source.person, source.contact),
    timeLabel: getCurrentTimeLabel()
  };
}

function createClaimSummaryMessage(source, text = 'Revisa los datos de la reclamación que tengo hasta ahora:') {
  return {
    id: `claim-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role: 'assistant',
    type: 'claim-summary',
    text,
    snapshot: buildClaimSnapshot(source.claimant, source.flow),
    timeLabel: getCurrentTimeLabel()
  };
}

function createFormSelectorMessage() {
  return {
    id: `form-selector-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role: 'assistant',
    type: 'form-selector',
    text: 'Claro. Puedo ayudarte a completar uno de los formularios necesarios para tu trámite. ¿Cuál deseas preparar?',
    supportText: 'Selecciona una opción o escríbela en el chat.',
    options: formDocumentSelectionOptions.map((option) => ({ ...option })),
    timeLabel: getCurrentTimeLabel()
  };
}

function createFormConversationSummaryMessage(documentDraft, text = 'Ya tengo la información necesaria. Revísala antes de continuar:') {
  return {
    id: `form-summary-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role: 'assistant',
    type: 'form-summary',
    text,
    snapshot: createFormSnapshot(documentDraft),
    timeLabel: getCurrentTimeLabel()
  };
}

function createFormGeneratedDocumentMessage(documentDraft, generatedDocument, text = 'Tu documento mock ya está listo para descargar:') {
  return {
    id: `form-generated-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role: 'assistant',
    type: 'form-generated-document',
    text,
    snapshot: createFormSnapshot(documentDraft),
    fileName: generatedDocument.fileName,
    downloadUrl: generatedDocument.url,
    timeLabel: getCurrentTimeLabel()
  };
}

function createInitialDocumentDraft(status = 'idle') {
  return createFormDraft(status);
}

function buildGeneratedDocumentSections(snapshot) {
  return [
    {
      title: snapshot.title,
      fields: snapshot.fields.map((fieldItem) => ({ label: fieldItem.label, value: fieldItem.value }))
    }
  ];
}

function createStartingData() {
  const base = createChatbotPreset('welcome');
  return {
    policy: { ...base.policy },
    person: { ...base.person },
    contact: { ...base.contact },
    claimant: { ...base.claimant },
    documents: [],
    alerts: [],
    ignoredAlerts: [],
    acceptedAlerts: [],
    validationPhase: 'idle',
    validationStageIndex: 0,
    validationCompleted: false,
    reviewConfirmed: false,
    sidebarCollapsed: true,
    contextCollapsed: true,
    folio: `FOLIO-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
    processingHint: '',
    activeDocumentId: null,
    informationCorrectionField: null,
    informationConfirmed: false,
    claimCorrectionField: null,
    claimConfirmed: false,
    documentDraft: createInitialDocumentDraft()
  };
}

function hydratePreset(presetId = 'welcome') {
  const preset = createChatbotPreset(presetId);
  const base = createStartingData();
  return {
    presetId: preset.presetId,
    stage: preset.stage,
    entryMode: preset.stage === 'info' ? 'info' : preset.stage === 'out-of-scope' ? 'out' : preset.flow ? 'start' : 'welcome',
    flow: preset.flow,
    scenario: preset.scenario,
    messages: preset.messages.map((message) => ({ ...message })),
    draft: '',
    sidebarCollapsed: true,
    contextCollapsed: true,
    policy: { ...preset.policy },
    person: { ...preset.person },
    contact: { ...preset.contact },
    claimant: { ...preset.claimant },
    documents: preset.documents.length ? preset.documents.map((doc) => ({ ...doc, files: doc.files.map((file) => ({ ...file })) })) : base.documents,
    alerts: preset.alerts.length ? preset.alerts.map((alert) => ({ ...alert })) : base.alerts,
    ignoredAlerts: [...preset.ignoredAlerts],
    acceptedAlerts: [...preset.acceptedAlerts],
    validationPhase: preset.validationPhase,
    validationStageIndex: preset.validationStageIndex,
    validationCompleted: preset.validationCompleted,
    reviewConfirmed: preset.reviewConfirmed,
    folio: preset.stage === 'success' ? `FOLIO-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}` : base.folio,
    processingHint: '',
    activeDocumentId: null,
    downloadedFormats: [],
    showResetPrompt: false,
    informationCorrectionField: null,
    informationConfirmed: false,
    claimCorrectionField: null,
    claimConfirmed: false,
    documentDraft: createInitialDocumentDraft()
  };
}

function getContactErrors(contact) {
  const digitsOnly = (value) => String(value ?? '').replace(/\D/g, '');
  const isTenDigits = (value) => digitsOnly(value).length === 10;
  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim());

  return {
    phoneLandline: contact.phoneLandline && !isTenDigits(contact.phoneLandline) ? 'El teléfono particular debe tener 10 dígitos.' : '',
    mobilePhone: isTenDigits(contact.mobilePhone) ? '' : 'El teléfono celular debe tener 10 dígitos.',
    email: isValidEmail(contact.email) ? '' : 'Ingresa un correo electrónico válido.',
    emailConfirmation: contact.emailConfirmation && contact.email === contact.emailConfirmation ? '' : 'La confirmación de correo debe coincidir.'
  };
}

function getClaimErrors(claimant, flow) {
  const errors = {
    sinisterNumber: '',
    attentionPlace: '',
    tramiteType: '',
    observations: ''
  };

  if (claimant.type === 'Complemento' && claimant.knowsSinisterNumber === 'Sí' && !String(claimant.sinisterNumber ?? '').trim()) {
    errors.sinisterNumber = 'El número de siniestro es obligatorio cuando conoces el dato.';
  }

  if (flow === 'cirugia_programada' && !String(claimant.attentionPlace ?? '').trim()) {
    errors.attentionPlace = 'Selecciona el lugar de atención para continuar.';
  }

  if (flow === 'cirugia_programada' && !String(claimant.tramiteType ?? '').trim()) {
    errors.tramiteType = 'Selecciona el tipo de trámite para continuar.';
  }

  if (flow === 'cirugia_programada' && claimant.tramiteType === 'Otros' && !String(claimant.observations ?? '').trim()) {
    errors.observations = 'Las observaciones son obligatorias cuando el tipo de trámite es Otros.';
  }

  return errors;
}

function buildDynamicAlerts(flow, documents, scenario) {
  if (scenario === 'review' && flow === 'reembolso') {
    return buildChatbotAlerts(flow, scenario).map((alert) => ({ ...alert, status: alert.status ?? 'active' }));
  }

  if (flow === 'cirugia_programada' && scenario === 'flow') {
    return buildChatbotAlerts(flow, scenario).map((alert) => ({ ...alert, status: alert.status ?? 'active' }));
  }

  const alerts = [];

  documents.forEach((document) => {
    if (document.status === 'requires_review') {
      alerts.push({
        id: `${document.id}-review`,
        title: `${document.label} requiere revisión`,
        field: document.label,
        sourceDocument: document.label,
        comparedDocument: 'Validación documental',
        reason: document.validationNote || 'El sistema detectó una observación en este documento.',
        recommendation: 'Reemplaza el archivo o corrige el dato indicado antes de continuar.',
        severity: 'warning',
        defaultAction: 'Reemplazar documento',
        status: 'active'
      });
    }

    if (document.status === 'illegible') {
      alerts.push({
        id: `${document.id}-illegible`,
        title: `${document.label} no se pudo leer`,
        field: document.label,
        sourceDocument: document.label,
        comparedDocument: 'OCR documental',
        reason: document.validationNote || 'El documento presenta baja legibilidad.',
        recommendation: 'Carga una versión más clara del archivo.',
        severity: 'critical',
        defaultAction: 'Reemplazar documento',
        status: 'active'
      });
    }
  });

  return alerts;
}

function buildSummary(documents, alerts) {
  const processed = documents.filter((document) => document.files.length > 0).length;
  const validated = documents.filter((document) => document.status === 'validated').length;
  const review = documents.filter((document) => document.status === 'requires_review').length;
  const pending = documents.filter((document) => document.status === 'pending').length;
  const illegible = documents.filter((document) => document.status === 'illegible').length;

  return {
    processed,
    validated,
    review,
    pending,
    alerts: alerts.length,
    illegible,
    processing: documents.filter((document) => document.status === 'processing').length
  };
}

function getReviewDocuments(documents) {
  return documents.filter((document) => document.status === 'requires_review' || document.status === 'illegible');
}

function getValidatedDocuments(documents) {
  return documents.filter((document) => document.status === 'validated');
}

function getProgressIndex(stage) {
  const map = {
    welcome: -1,
    'flow-intro': 0,
    documents: 0,
    'validation-processing': 1,
    'validation-results': 1,
    'information-policy': 2,
    'information-requester': 2,
    'information-contact': 2,
    claim: 3,
    review: 4,
    submitting: 4,
    success: 4,
    info: 0,
    'out-of-scope': -1
  };
  return map[stage] ?? -1;
}

function isInformationStage(stage) {
  return stage === 'information-policy' || stage === 'information-requester' || stage === 'information-contact';
}

function getStageCopy(stage, entryMode, flow) {
  const flowLabel = flow ? flowLabels[flow] : 'el trámite';

  if (stage === 'welcome') {
    return {
      title: 'Hola, soy tu asistente de Siniestros GMM de Allianz México.',
      description: 'Puedo ayudarte a revisar requisitos o a iniciar tu trámite paso a paso.'
    };
  }

  if (stage === 'flow-intro') {
    if (flow === 'reembolso') {
      return {
        title: 'Claro, te ayudo con tu trámite de reembolso.',
        description: 'Estos son los documentos principales que necesitarás. Revisa la lista y elige cómo quieres continuar.'
      };
    }

    return entryMode === 'info'
      ? {
          title: `Te comparto lo necesario sobre ${flowLabel}.`,
          description: 'Te mostraré solo lo esencial y tú me dices por dónde quieres seguir.'
        }
      : {
          title: `Perfecto, te acompaño con ${flowLabel}.`,
          description: 'Vamos paso a paso para que no tengas que pensar en todo al mismo tiempo.'
        };
  }

  if (stage === 'documents') {
    return {
      title: `Empecemos con los documentos de ${flowLabel}.`,
      description: 'Te iré pidiendo cada archivo de forma clara para que avancemos sin prisas.'
    };
  }

  if (stage === 'validation-processing') {
    return {
      title: 'Estoy revisando tus documentos',
      description: 'Dame un momento mientras verifico lo cargado y preparo el siguiente paso.'
    };
  }

  if (stage === 'validation-results') {
    return {
      title: 'Ya terminé la revisión',
      description: 'Te muestro lo más importante para que decidas si quieres corregir algo.'
    };
  }

  if (stage === 'information-policy' || stage === 'information-requester' || stage === 'information-contact') {
    return {
      title: 'Vamos con tus datos',
      description: 'Si algo no coincide, lo puedes corregir aquí mismo antes de avanzar.'
    };
  }

  if (stage === 'claim') {
    return {
      title: 'Revisemos la reclamación',
      description: 'Te haré una pregunta a la vez para dejar esta parte lista sin complicaciones.'
    };
  }

  if (stage === 'review') {
    return {
      title: 'Ya casi terminamos',
      description: 'Revisemos juntos el resumen antes de enviar tu trámite.'
    };
  }

  if (stage === 'submitting') {
    return {
      title: 'Enviando trámite',
      description: 'Estoy preparando tu solicitud para mostrarte la confirmación final.'
    };
  }

  if (stage === 'success') {
    return {
      title: 'Tu solicitud fue recibida correctamente',
      description: 'Si quieres, puedes descargar el resumen o iniciar otra conversación.'
    };
  }

  if (stage === 'out-of-scope') {
    return {
      title: 'Esta consulta requiere atención adicional',
      description: 'Puedo orientarte con los canales disponibles o ayudarte a empezar otra vez.'
    };
  }

  return {
    title: 'Asistente de Siniestros GMM',
    description: 'Selecciona una ruta para comenzar.'
  };
}

function ChoiceButton({ label, onClick, tone = 'blue', supportText = '', fullWidth = false }) {
  const styles = {
    blue: 'border-[#C7D8F1] bg-white text-[#003781] hover:bg-[#F4F8FF]',
    dark: 'border-[#003781] bg-[#003781] text-white hover:bg-[#002356]',
    light: 'border-[#DDE5EF] bg-white text-[#434751] hover:bg-[#F7FAFC]',
    reply: 'border-[#D8E3F1] bg-[#F8FBFF] text-[#003781] shadow-sm hover:border-[#BFD2EC] hover:bg-white'
  };

  return (
    <button
      type="button"
      className={`focus-ring ${fullWidth ? 'flex w-full items-start justify-between gap-3 text-left' : 'inline-flex items-center justify-center gap-2'} rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 ${styles[tone]}`}
      onClick={onClick}
    >
      <span className="min-w-0">
        <span className="block">{label}</span>
        {supportText ? <span className={`mt-1 block text-xs font-normal leading-5 ${tone === 'dark' ? 'text-white/80' : 'text-[#6B7280]'}`}>{supportText}</span> : null}
      </span>
      {tone === 'reply' ? <ArrowRightIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#8BA4CB]" /> : null}
    </button>
  );
}

function AssistantCue({ text }) {
  return <ChatMessage role="assistant" text={text} />;
}

function FormatLibraryCard({ flow, onDownload, onDownloadAll }) {
  const guide = flow ? chatbotFlowGuides[flow] : null;
  const flowDocs = flow ? getChatbotFlowDocuments(flow) : [];

  return (
    <section className="rounded-[24px] border border-[#E0E6ED] bg-white p-5 shadow-sm sm:p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#006494]">Formatos</p>
      <h3 className="mt-2 text-[20px] font-semibold leading-7 text-[#181C1E]">Descarga lo que necesites</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#434751]">
        {guide?.recommendation || 'Descarga los formatos institucionales que correspondan al trámite seleccionado.'}
      </p>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {flowDocs.map((document) => (
          <div key={document.id} className="rounded-[18px] border border-[#E0E6ED] bg-[#F7FAFC] p-4">
            <p className="text-sm font-semibold text-[#181C1E]">{document.label}</p>
            <p className="mt-1 text-xs leading-5 text-[#6B7280]">{document.description}</p>
            <button
              type="button"
              className="focus-ring mt-4 inline-flex items-center gap-2 rounded-full border border-[#DDE5EF] bg-white px-3.5 py-2 text-xs font-semibold text-[#003781] transition hover:bg-[#F4F8FF]"
              onClick={() => onDownload(document)}
            >
              <DownloadIcon className="h-4 w-4" />
              Descargar
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="focus-ring inline-flex items-center justify-center rounded-full border border-[#DDE5EF] bg-white px-4 py-2 text-sm font-semibold text-[#434751] transition hover:bg-[#F7FAFC]"
          onClick={onDownloadAll}
        >
          Descargar todos
        </button>
        <button
          type="button"
          className="focus-ring inline-flex items-center justify-center rounded-full bg-[#003781] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#002356]"
          onClick={onDownloadAll}
        >
          Continuar
        </button>
      </div>
    </section>
  );
}

function FlowGuideCard({ flow, entryMode, onFlowSelect, onContinue, onInfoOnly, onOtherFlow, onFormats }) {
  const guide = flow ? chatbotFlowGuides[flow] : null;
  const isReimbursement = flow === 'reembolso';
  const requirements = guide?.requirements ?? [];
  const titleCopy = getStageCopy('flow-intro', entryMode, flow);
  const flowChoices = [
    {
      id: 'reembolso',
      label: 'Reembolso',
      supportText: 'Solicita el pago de gastos médicos.'
    },
    {
      id: 'cirugia_programada',
      label: 'Cirugía Programada',
      supportText: 'Programa la autorización de un procedimiento quirúrgico.'
    }
  ];
  const followUpCopy =
    entryMode === 'info'
      ? 'Cuando estés listo, puedo ayudarte a iniciar el trámite y revisar cada requisito contigo.'
      : 'Si ya tienes estos documentos, podemos continuar. También puedo ayudarte a descargar los formatos que te falten.';

  return (
    <section className="space-y-3">
      <ChatMessage role="assistant" text={titleCopy.title} />
      <ChatMessage role="assistant" text={titleCopy.description} />

      {!flow ? (
        <div className="flex flex-wrap gap-2">
          {flowChoices.map((choice) => (
            <ChoiceButton
              key={choice.id}
              label={choice.label}
              supportText=""
              tone="reply"
              onClick={() => onFlowSelect(choice.id)}
            />
          ))}
        </div>
      ) : (
        <>
          <div className="rounded-[22px] border border-[#E0E6ED] bg-[#FBFDFF] px-4 py-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#006494]">Lo esencial</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {requirements.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full border border-[#DDE5EF] bg-white px-3 py-1.5 text-xs font-medium leading-5 text-[#434751]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {isReimbursement ? (
            <p className="px-1 text-sm leading-6 text-[#5F6B7A]">¿Te falta algún formato? Puedo ayudarte a descargarlo.</p>
          ) : (
            <ChatMessage role="assistant" text={followUpCopy} />
          )}

          <div className="flex flex-wrap gap-2">
            {guideActions[entryMode]?.map((action) => (
              <ChoiceButton
                key={action.id}
                label={action.label}
                tone={action.id === 'start-now' || action.id === 'documents-ready' ? 'dark' : 'blue'}
                onClick={
                  action.id === 'start-now'
                    ? onContinue
                    : action.id === 'info-only'
                      ? onInfoOnly
                      : action.id === 'another-tramite'
                        ? onOtherFlow
                        : action.id === 'documents-ready'
                          ? onContinue
                          : action.id === 'continue-without-download'
                            ? onContinue
                            : onFormats
                }
              />
            ))}
          </div>

          {guide?.contactPhone ? (
            <p className="px-1 text-xs leading-5 text-[#6B7280]">
              ¿Necesitas apoyo adicional? <span className="font-semibold text-[#003781]">{guide.contactPhone}</span>
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}

function InfoSectionCard({ title, description, children, icon = null }) {
  return (
    <section className="rounded-[24px] border border-[#E0E6ED] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#003781]" aria-hidden="true">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#006494]">{title}</p>
          <p className="mt-1 text-[22px] font-semibold leading-7 text-[#181C1E]">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ToggleChoice({ value, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`focus-ring inline-flex min-h-12 items-center justify-center rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
        selected
          ? 'border-[#003781] bg-[#003781] text-white shadow-[0_10px_18px_rgba(0,55,129,0.16)]'
          : 'border-[#DDE5EF] bg-white text-[#181C1E] hover:bg-[#F7FAFC]'
      }`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      {value}
    </button>
  );
}

function InlineFormGrid({ children, columns = 'lg:grid-cols-2' }) {
  return <div className={`grid gap-4 ${columns}`}>{children}</div>;
}

function ReviewSummaryCard({
  flow,
  policy,
  person,
  contact,
  claimant,
  documents,
  alerts,
  onEditSection
}) {
  const displayName =
    person.relationship === 'Otro'
      ? [person.firstName, person.paternalLastName, person.maternalLastName].filter(Boolean).join(' ')
      : person.fullName;

  return (
    <section className="rounded-[24px] border border-[#E0E6ED] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#006494]">Resumen final</p>
          <h3 className="mt-2 text-[22px] font-semibold leading-7 text-[#181C1E]">Revisemos antes de enviar</h3>
          <p className="mt-2 text-sm leading-6 text-[#434751]">
            Verifica que la información sea correcta y usa las acciones para modificar lo necesario.
          </p>
        </div>
        <div className="rounded-full bg-[#EFF6FF] px-4 py-2 text-sm font-semibold text-[#003781]">
          {documents.filter((doc) => doc.files.length > 0).length} documentos cargados
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[22px] border border-[#E0E6ED] bg-[#F7FAFC] p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-[#181C1E]">Información de póliza</h4>
            <button type="button" className="text-sm font-semibold text-[#003781]" onClick={() => onEditSection('information-policy')}>
              Editar
            </button>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#434751]">
            <span className="font-semibold text-[#181C1E]">Tipo:</span> {policy.productType || 'Pendiente'}
          </p>
          <p className="text-sm leading-6 text-[#434751]">
            <span className="font-semibold text-[#181C1E]">Póliza:</span> {policy.policyNumber || 'Pendiente'}
          </p>
        </div>

        <div className="rounded-[22px] border border-[#E0E6ED] bg-[#F7FAFC] p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-[#181C1E]">Persona solicitante</h4>
            <button type="button" className="text-sm font-semibold text-[#003781]" onClick={() => onEditSection('information-requester')}>
              Editar
            </button>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#434751]">
            <span className="font-semibold text-[#181C1E]">Relación:</span> {person.relationship || 'Pendiente'}
          </p>
          <p className="text-sm leading-6 text-[#434751]">
            <span className="font-semibold text-[#181C1E]">Nombre:</span> {displayName || 'Pendiente'}
          </p>
        </div>

        <div className="rounded-[22px] border border-[#E0E6ED] bg-[#F7FAFC] p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-[#181C1E]">Datos de contacto</h4>
            <button type="button" className="text-sm font-semibold text-[#003781]" onClick={() => onEditSection('information-contact')}>
              Editar
            </button>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#434751]">
            <span className="font-semibold text-[#181C1E]">Celular:</span> {contact.mobilePhone || 'Pendiente'}
          </p>
          <p className="text-sm leading-6 text-[#434751]">
            <span className="font-semibold text-[#181C1E]">Correo:</span> {contact.email || 'Pendiente'}
          </p>
        </div>

        <div className="rounded-[22px] border border-[#E0E6ED] bg-[#F7FAFC] p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-[#181C1E]">Reclamación</h4>
            <button type="button" className="text-sm font-semibold text-[#003781]" onClick={() => onEditSection('claim')}>
              Editar
            </button>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#434751]">
            <span className="font-semibold text-[#181C1E]">Tipo:</span> {claimant.type || 'Pendiente'}
          </p>
          {flow === 'cirugia_programada' ? (
            <>
              <p className="text-sm leading-6 text-[#434751]">
                <span className="font-semibold text-[#181C1E]">Lugar de atención:</span> {claimant.attentionPlace || 'Pendiente'}
              </p>
              <p className="text-sm leading-6 text-[#434751]">
                <span className="font-semibold text-[#181C1E]">Tipo de trámite:</span> {claimant.tramiteType || 'Pendiente'}
              </p>
              {claimant.tramiteType === 'Otros' ? (
                <p className="text-sm leading-6 text-[#434751]">
                  <span className="font-semibold text-[#181C1E]">Observaciones:</span> {claimant.observations || 'Pendiente'}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-sm leading-6 text-[#434751]">
                <span className="font-semibold text-[#181C1E]">Moneda:</span> {claimant.currency || 'Pendiente'}
              </p>
              <p className="text-sm leading-6 text-[#434751]">
                <span className="font-semibold text-[#181C1E]">Monto:</span> {claimant.claimedAmount || 'Pendiente'}
              </p>
              <p className="text-sm leading-6 text-[#434751]">
                <span className="font-semibold text-[#181C1E]">Recibos:</span> {claimant.receiptsCount || 'Pendiente'}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[22px] border border-[#E0E6ED] bg-[#F7FAFC] p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-[#181C1E]">Documentos</h4>
            <button type="button" className="text-sm font-semibold text-[#003781]" onClick={() => onEditSection('documents')}>
              Editar
            </button>
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[#434751]">
            {documents.slice(0, 5).map((document) => (
              <li key={document.id} className="rounded-2xl border border-[#E0E6ED] bg-white px-3 py-2">
                <span className="font-semibold text-[#181C1E]">{document.label}:</span> {document.files.length > 0 ? document.files[0].name : 'Sin archivo'}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[22px] border border-[#E0E6ED] bg-[#F7FAFC] p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-[#181C1E]">Alertas</h4>
            <button type="button" className="text-sm font-semibold text-[#003781]" onClick={() => onEditSection('validation-results')}>
              Revisar
            </button>
          </div>
          {alerts.length > 0 ? (
            <div className="mt-3 space-y-2">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="rounded-2xl border border-[#E0E6ED] bg-white px-3 py-2">
                  <p className="text-sm font-semibold text-[#181C1E]">{alert.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#6B7280]">{alert.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[#434751]">No se detectaron alertas activas.</p>
          )}
        </div>
      </div>

    </section>
  );
}

function SupportCard({ flow, onStartNew }) {
  const guide = flow ? chatbotFlowGuides[flow] : null;
  return (
    <section className="rounded-[24px] border border-[#C7D8F1] bg-[#EFF6FF] p-5 shadow-sm sm:p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#006494]">Ayuda</p>
      <h3 className="mt-2 text-[22px] font-semibold leading-7 text-[#181C1E]">¿Necesitas apoyo externo?</h3>
      <p className="mt-2 text-sm leading-6 text-[#434751]">
        Esta consulta puede requerir atención especializada. Puedo mostrarte los canales disponibles o volver al inicio.
      </p>
      <div className="mt-4 rounded-[20px] border border-[#DDE5EF] bg-white p-4">
        <p className="text-sm font-semibold text-[#181C1E]">Canal de contacto</p>
        <p className="mt-1 text-sm leading-6 text-[#434751]">
          {guide?.contactPhone ? `Teléfono de apoyo: ${guide.contactPhone}` : 'Canal por confirmar en una fase posterior.'}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="focus-ring inline-flex items-center justify-center rounded-full bg-[#003781] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#002356]"
          onClick={onStartNew}
        >
          Nueva conversación
        </button>
      </div>
    </section>
  );
}

function SuccessCard({ flow, folio, onNewConversation }) {
  return (
    <section className="rounded-[24px] border border-[#CFE8D5] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6F4EA] text-[#137333]" aria-hidden="true">
          <CheckIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#006494]">Confirmación final</p>
          <h3 className="mt-1 text-[22px] font-semibold leading-7 text-[#181C1E]">Tu solicitud fue recibida correctamente</h3>
        </div>
      </div>

      <div className="mt-4 rounded-[22px] border border-[#DDE5EF] bg-[#F7FAFC] p-4">
        <p className="text-sm leading-6 text-[#434751]">
          <span className="font-semibold text-[#181C1E]">Trámite:</span> {flowLabels[flow] || 'Trámite'}
        </p>
        <p className="text-sm leading-6 text-[#434751]">
          <span className="font-semibold text-[#181C1E]">Folio:</span> {folio}
        </p>
        <p className="text-sm leading-6 text-[#434751]">
          <span className="font-semibold text-[#181C1E]">Fecha:</span> {new Intl.DateTimeFormat('es-MX').format(new Date())}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="focus-ring inline-flex items-center justify-center rounded-full border border-[#DDE5EF] bg-white px-4 py-2 text-sm font-semibold text-[#434751] transition hover:bg-[#F7FAFC]"
          onClick={onNewConversation}
        >
          Iniciar otra consulta
        </button>
        <button
          type="button"
          className="focus-ring inline-flex items-center justify-center rounded-full bg-[#003781] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#002356]"
          onClick={() => window.alert('Descarga simulada del resumen.')}
        >
          Descargar resumen
        </button>
      </div>
    </section>
  );
}

function chatbotReducer(state, action) {
  switch (action.type) {
    case 'RESET_PRESET':
      return hydratePreset(action.presetId);
    case 'SET_STAGE':
      return { ...state, stage: action.value };
    case 'SET_ENTRY_MODE':
      return { ...state, entryMode: action.value };
    case 'SET_FLOW':
      return {
        ...state,
        flow: action.flow,
        scenario: action.scenario ?? 'mixed',
        documents: action.documents ?? buildChatbotDocuments(action.flow, action.scenario ?? 'mixed'),
        alerts: action.alerts ?? [],
        ignoredAlerts: [],
        acceptedAlerts: [],
        validationPhase: 'idle',
        validationStageIndex: 0,
        validationCompleted: false,
        preloadedDocumentTraceAdded: false,
        reviewConfirmed: false,
        activeDocumentId: null,
        informationCorrectionField: null,
        informationConfirmed: false,
        claimCorrectionField: null,
        claimConfirmed: false
      };
    case 'SET_MESSAGES':
      return { ...state, messages: action.value };
    case 'SET_PRELOADED_DOCUMENT_TRACE_ADDED':
      return { ...state, preloadedDocumentTraceAdded: action.value };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };
    case 'SET_DRAFT':
      return { ...state, draft: action.value };
    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state, sidebarCollapsed: action.value };
    case 'SET_CONTEXT_COLLAPSED':
      return { ...state, contextCollapsed: action.value };
    case 'SET_POLICY_FIELD':
      return { ...state, policy: { ...state.policy, [action.field]: action.value } };
    case 'SET_PERSON_FIELD': {
      const nextPerson = {
        ...state.person,
        [action.field]: action.value
      };
      if (action.field === 'firstName' || action.field === 'paternalLastName' || action.field === 'maternalLastName') {
        nextPerson.fullName = [action.field === 'firstName' ? action.value : state.person.firstName, action.field === 'paternalLastName' ? action.value : state.person.paternalLastName, action.field === 'maternalLastName' ? action.value : state.person.maternalLastName]
          .map((part) => String(part ?? '').trim())
          .filter(Boolean)
          .join(' ');
      }
      return { ...state, person: nextPerson };
    }
    case 'SET_CONTACT_FIELD':
      return { ...state, contact: { ...state.contact, [action.field]: action.value } };
    case 'APPLY_INFORMATION_CORRECTION':
      return {
        ...state,
        policy: action.value.policy,
        person: action.value.person,
        contact: action.value.contact
      };
    case 'SET_INFORMATION_CORRECTION_FIELD':
      return { ...state, informationCorrectionField: action.value };
    case 'SET_INFORMATION_CONFIRMED':
      return { ...state, informationConfirmed: action.value };
    case 'SET_CLAIMANT_FIELD':
      return { ...state, claimant: { ...state.claimant, [action.field]: action.value } };
    case 'APPLY_CLAIM_CORRECTION':
      return { ...state, claimant: action.value };
    case 'SET_CLAIM_CORRECTION_FIELD':
      return { ...state, claimCorrectionField: action.value };
    case 'SET_CLAIM_CONFIRMED':
      return { ...state, claimConfirmed: action.value };
    case 'SET_DOCUMENT_DRAFT':
      return { ...state, documentDraft: action.value };
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
    case 'SET_DOCUMENT_STATUS':
      return {
        ...state,
        documents: state.documents.map((document) =>
          document.id === action.documentId
            ? { ...document, status: action.status, validationNote: action.validationNote ?? document.validationNote }
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
    case 'SET_VALIDATION_COMPLETED':
      return { ...state, validationCompleted: action.value };
    case 'SET_ALERTS':
      return { ...state, alerts: action.value };
    case 'IGNORE_ALERT':
      return {
        ...state,
        ignoredAlerts: state.ignoredAlerts.includes(action.alertId) ? state.ignoredAlerts : [...state.ignoredAlerts, action.alertId],
        acceptedAlerts: state.acceptedAlerts.includes(action.alertId) ? state.acceptedAlerts : [...state.acceptedAlerts, action.alertId]
      };
    case 'ACCEPT_ALERT':
      return {
        ...state,
        acceptedAlerts: state.acceptedAlerts.includes(action.alertId) ? state.acceptedAlerts : [...state.acceptedAlerts, action.alertId]
      };
    case 'SET_REVIEW_CONFIRMED':
      return { ...state, reviewConfirmed: action.value };
    case 'SET_FOLIO':
      return { ...state, folio: action.value };
    case 'SET_PROCESSING_HINT':
      return { ...state, processingHint: action.value };
    case 'SET_ACTIVE_DOCUMENT':
      return { ...state, activeDocumentId: action.value };
    case 'SET_DOWNLOADED_FORMATS':
      return { ...state, downloadedFormats: action.value };
    case 'SET_SHOW_RESET_PROMPT':
      return { ...state, showResetPrompt: action.value };
    default:
      return state;
  }
}

export default function ChatbotWorkspace({ onExit }) {
  const [state, dispatch] = useReducer(chatbotReducer, undefined, () => hydratePreset('welcome'));
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const threadRef = useRef(null);
  const uploadTimersRef = useRef({});
  const validationTimersRef = useRef([]);
  const generatedDocumentUrlsRef = useRef([]);
  const messageSeenRef = useRef(0);

  const progressIndex = useMemo(() => getProgressIndex(state.stage), [state.stage]);
  const activeAlerts = useMemo(
    () => state.alerts.filter((alert) => !state.ignoredAlerts.includes(alert.id) && (alert.status ?? 'active') === 'active'),
    [state.alerts, state.ignoredAlerts]
  );
  const summary = useMemo(() => buildSummary(state.documents, activeAlerts), [state.documents, activeAlerts]);
  const validatedDocuments = useMemo(() => getValidatedDocuments(state.documents), [state.documents]);
  const reviewDocuments = useMemo(() => getReviewDocuments(state.documents), [state.documents]);
  const visibleFlowDocuments = useMemo(() => (state.flow ? getChatbotFlowDocuments(state.flow) : []), [state.flow]);
  const claimErrors = useMemo(() => getClaimErrors(state.claimant, state.flow), [state.claimant, state.flow]);
  const contactErrors = useMemo(() => getContactErrors(state.contact), [state.contact]);
  const formDefinition = useMemo(() => getDocumentDefinition(state.documentDraft.documentType), [state.documentDraft.documentType]);
  const currentFormField = useMemo(() => getNextFormField(state.documentDraft), [state.documentDraft]);
  const previousFormField = useMemo(() => getPreviousFormField(state.documentDraft), [state.documentDraft]);
  const canContinueInfo = !contactErrors.mobilePhone && !contactErrors.email && !contactErrors.emailConfirmation && !contactErrors.phoneLandline && !(state.person.relationship === 'Otro' && (!state.person.firstName.trim() || !state.person.paternalLastName.trim() || !state.person.maternalLastName.trim()));
  const canContinueClaim = !claimErrors.sinisterNumber && !claimErrors.attentionPlace && !claimErrors.tramiteType && !claimErrors.observations;
  const isFormActive = state.documentDraft.status !== 'idle' && state.documentDraft.status !== 'confirmed' && state.documentDraft.status !== 'cancelled';

  const stageCopy = getStageCopy(state.stage, state.entryMode, state.flow);
  const isWelcomeEmpty = state.stage === 'welcome' && state.messages.length === 0 && !state.flow;

  useEffect(() => {
    if (!threadRef.current) return;
    threadRef.current.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
  }, [state.messages.length, state.stage]);

  useEffect(() => {
    return () => {
      Object.values(uploadTimersRef.current).forEach((timerId) => clearTimeout(timerId));
      validationTimersRef.current.forEach((timerId) => clearTimeout(timerId));
      generatedDocumentUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      generatedDocumentUrlsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (state.stage !== 'validation-processing' || state.validationPhase === 'results') return undefined;

    validationTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    validationTimersRef.current = [];

    const stageList = ['Leyendo documentos', 'Identificando información', 'Comparando datos', 'Validando documentos', 'Preparando resultados'];
    stageList.forEach((_, index) => {
      const timerId = window.setTimeout(() => {
        dispatch({ type: 'SET_VALIDATION_STAGE_INDEX', value: index });
      }, 300 * index);
      validationTimersRef.current.push(timerId);
    });

    const completeTimer = window.setTimeout(() => {
      const generatedAlerts = buildDynamicAlerts(state.flow, state.documents, state.scenario);
      dispatch({ type: 'SET_ALERTS', value: generatedAlerts });
      dispatch({ type: 'SET_VALIDATION_STAGE_INDEX', value: stageList.length - 1 });
      dispatch({ type: 'SET_VALIDATION_PHASE', value: 'results' });
      dispatch({ type: 'SET_VALIDATION_COMPLETED', value: true });
      dispatch({ type: 'SET_STAGE', value: 'validation-results' });
      dispatch(
        {
          type: 'ADD_MESSAGE',
          message: createAssistantMessage(
            generatedAlerts.length > 0
              ? 'Ya tengo los resultados. Encontré algunas observaciones que puedes revisar desde las tarjetas del panel.'
              : 'Ya terminé la validación. Todos los documentos visibles quedaron listos para continuar.'
          )
        }
      );
      if (generatedAlerts.length === 0) {
        dispatch({ type: 'SET_PROCESSING_HINT', value: 'validación completada' });
      }
    }, 300 * stageList.length + 200);

    validationTimersRef.current.push(completeTimer);

    return () => {
      validationTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    };
  }, [state.stage, state.validationPhase, state.flow, state.documents, state.scenario]);

  useEffect(() => {
    if (state.messages.length === messageSeenRef.current) return;
    messageSeenRef.current = state.messages.length;
    if (threadRef.current) {
      threadRef.current.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [state.messages.length]);

  const resetConversation = (presetId = 'welcome') => {
    validationTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    validationTimersRef.current = [];
    Object.values(uploadTimersRef.current).forEach((timerId) => clearTimeout(timerId));
    uploadTimersRef.current = {};
    generatedDocumentUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    generatedDocumentUrlsRef.current = [];
    dispatch({ type: 'RESET_PRESET', presetId });
  };

  const appendUserAndAssistant = (userText, assistantText) => {
    dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(userText) });
    if (assistantText) dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(assistantText) });
  };

  const updateDocumentDraft = (patch) => {
    dispatch({
      type: 'SET_DOCUMENT_DRAFT',
      value: {
        ...state.documentDraft,
        ...patch
      }
    });
  };

  const resetDocumentDraft = (status = 'idle') => {
    updateDocumentDraft(createInitialDocumentDraft(status));
  };

  const enterFormSelector = () => {
    resetDocumentDraft('choosing_document');
    dispatch({
      type: 'ADD_MESSAGE',
      message: createAssistantMessage('Claro. Puedo ayudarte a completar uno de los formularios necesarios para tu trámite. ¿Cuál deseas preparar?')
    });
    dispatch({ type: 'ADD_MESSAGE', message: createFormSelectorMessage() });
  };

  const getFormFollowUpPrompt = () => {
    if (state.documentDraft.status === 'choosing_document') {
      return 'Claro. ¿Cuál deseas preparar?';
    }

    if (state.documentDraft.status === 'reviewing') {
      return '¿Confirmas que la información es correcta?';
    }

    if (state.documentDraft.status === 'editing' && state.documentDraft.editingFieldId) {
      const editingField = getFormFieldById(state.documentDraft.documentType, state.documentDraft.editingFieldId);
      return editingField ? getFormFieldPrompt(editingField) : '';
    }

    if (state.documentDraft.status === 'editing' && !state.documentDraft.editingFieldId) {
      return '¿Qué dato quieres cambiar?';
    }

    return currentFormField ? getFormFieldPrompt(currentFormField) : '';
  };

  const cancelFormDraft = (userText = null) => {
    if (userText) dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(userText) });
    dispatch({
      type: 'ADD_MESSAGE',
      message: createAssistantMessage('De acuerdo. Cancelé el llenado del formulario. ¿En qué más puedo ayudarte?')
    });
    resetDocumentDraft('cancelled');
  };

  const showFormPartialSnapshot = (introText = 'Esto es lo que llevo hasta ahora:') => {
    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(introText) });
    dispatch({ type: 'ADD_MESSAGE', message: createFormConversationSummaryMessage(state.documentDraft, 'Revisa cómo va el llenado:') });
  };

  const advanceFormToNextField = (nextValues, currentFieldIndex) => {
    const definition = getDocumentDefinition(state.documentDraft.documentType);
    const nextFieldIndex = currentFieldIndex + 1;
    const nextField = definition?.fields[nextFieldIndex] ?? null;

    updateDocumentDraft({
      values: nextValues,
      currentFieldIndex: nextFieldIndex,
      status: nextField ? 'collecting' : 'reviewing',
      editingFieldId: null
    });

    if (nextField) {
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Gracias.') });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(getFormFieldPrompt(nextField)) });
      return;
    }

    dispatch({ type: 'ADD_MESSAGE', message: createFormConversationSummaryMessage({ ...state.documentDraft, values: nextValues, currentFieldIndex: nextFieldIndex, status: 'reviewing', editingFieldId: null }, 'Ya tengo la información necesaria. Revísala antes de continuar:') });
    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('¿Confirmas que la información es correcta?') });
  };

  const enterFormReview = () => {
    const reviewDraft = {
      ...state.documentDraft,
      status: 'reviewing',
      editingFieldId: null
    };
    updateDocumentDraft({
      status: 'reviewing',
      editingFieldId: null
    });
    dispatch({ type: 'ADD_MESSAGE', message: createFormConversationSummaryMessage(reviewDraft, 'Ya tengo la información necesaria. Revísala antes de continuar:') });
    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('¿Confirmas que la información es correcta?') });
  };

  const startFormDocument = (documentType) => {
    const definition = getDocumentDefinition(documentType);
    if (!definition) return;

    const nextDraft = {
      documentType,
      status: 'collecting',
      currentFieldIndex: 0,
      values: {},
      confirmed: false,
      editingFieldId: null
    };

    dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(definition.title) });
    dispatch({
      type: 'ADD_MESSAGE',
      message: createAssistantMessage(`Perfecto. ${definition.intro}`)
    });
    dispatch({ type: 'SET_DOCUMENT_DRAFT', value: nextDraft });
    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(getFormFieldPrompt(definition.fields[0])) });
  };

  const handleFormSelection = (selectionId) => {
    if (selectionId === 'back') {
      cancelFormDraft('Volver');
      return;
    }

    startFormDocument(selectionId);
  };

  const handleFormConfirmation = (confirmationId) => {
    if (confirmationId === 'form-confirm') {
      const definition = getDocumentDefinition(state.documentDraft.documentType);
      if (!definition) return;

      updateDocumentDraft({
        status: 'confirmed',
        confirmed: true,
        editingFieldId: null
      });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Perfecto. La información quedó confirmada.') });

      const snapshotDraft = {
        ...state.documentDraft,
        status: 'confirmed',
        confirmed: true,
        editingFieldId: null
      };
      const generatedMeta = buildGeneratedDocumentMeta(snapshotDraft);
      const generatedDocument = generateMockPdf({
        title: generatedMeta.title,
        fileName: generatedMeta.fileName,
        sections: buildGeneratedDocumentSections(generatedMeta.snapshot)
      });
      generatedDocumentUrlsRef.current.push(generatedDocument.url);
      dispatch({
        type: 'ADD_MESSAGE',
        message: createFormGeneratedDocumentMessage(snapshotDraft, generatedDocument, 'Tu documento mock ya está listo para descargar:')
      });
      return;
    }

    if (confirmationId === 'form-edit') {
      updateDocumentDraft({
        status: 'editing',
        editingFieldId: null
      });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Claro. ¿Qué dato quieres cambiar?') });
      return;
    }

    if (confirmationId === 'form-cancel') {
      cancelFormDraft();
    }
  };

  const handleFormEditingSelection = (fieldId) => {
    const definition = getDocumentDefinition(state.documentDraft.documentType);
    const fieldDefinition = definition?.fields.find((item) => item.id === fieldId) ?? null;
    if (!fieldDefinition) return;

    updateDocumentDraft({
      status: 'editing',
      editingFieldId: fieldId
    });
    dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(getFormFieldLabel(fieldDefinition)) });
    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(getFormFieldPrompt(fieldDefinition)) });
  };

  const handleFormCorrectionValue = (text) => {
    const editingFieldId = state.documentDraft.editingFieldId;
    const fieldDefinition = getFormFieldById(state.documentDraft.documentType, editingFieldId) ?? currentFormField;
    if (!fieldDefinition) return;

    const validation = validateFormField(fieldDefinition, text);
    if (!validation.valid) {
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(validation.error) });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(getFormFieldPrompt(fieldDefinition)) });
      return;
    }

    const nextValues = {
      ...state.documentDraft.values,
      [fieldDefinition.id]: validation.value
    };
    const nextDraft = {
      ...state.documentDraft,
      values: nextValues,
      status: 'reviewing',
      editingFieldId: null,
      currentFieldIndex: getDocumentDefinition(state.documentDraft.documentType)?.fields.length ?? state.documentDraft.currentFieldIndex
    };

    dispatch({ type: 'SET_DOCUMENT_DRAFT', value: nextDraft });
    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(`Listo, ya quedó actualizado ${getFormFieldLabel(fieldDefinition).toLowerCase()}.`) });
    dispatch({ type: 'ADD_MESSAGE', message: createFormConversationSummaryMessage(nextDraft, 'Así quedó la información:') });
    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('¿Confirmas que la información es correcta?') });
  };

  const handleFormCollectingInput = (text) => {
    const currentFieldDefinition = currentFormField;
    if (!currentFieldDefinition) {
      enterFormReview();
      return;
    }

    const normalized = text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[.!?]+$/g, '');

    if (normalized === 'ver lo que llevo') {
      showFormPartialSnapshot('Esto es lo que llevo hasta ahora:');
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(getFormFollowUpPrompt()) });
      return;
    }

    if (normalized === 'cambiar el dato anterior') {
      const previousFieldDefinition = previousFormField;
      if (!previousFieldDefinition || state.documentDraft.currentFieldIndex === 0) {
        dispatch({
          type: 'ADD_MESSAGE',
          message: createAssistantMessage('Aún no hay un dato anterior para cambiar. Continuemos con el primero.')
        });
        dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(getFormFieldPrompt(currentFieldDefinition)) });
        return;
      }

      updateDocumentDraft({
        currentFieldIndex: state.documentDraft.currentFieldIndex - 1,
        status: 'collecting'
      });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(`Claro. Volvemos a ${getFormFieldLabel(previousFieldDefinition).toLowerCase()}.`) });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(getFormFieldPrompt(previousFieldDefinition)) });
      return;
    }

    const validation = validateFormField(currentFieldDefinition, text);
    if (!validation.valid) {
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(validation.error) });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(getFormFieldPrompt(currentFieldDefinition)) });
      return;
    }

    const nextValues = {
      ...state.documentDraft.values,
      [currentFieldDefinition.id]: validation.value
    };
    advanceFormToNextField(nextValues, state.documentDraft.currentFieldIndex);
  };

  const handleFormChoosingInput = (text) => {
    const normalized = text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

    if (normalized.includes('aviso de accidente') || normalized.includes('enfermedad')) {
      startFormDocument('accident_notice');
      return;
    }

    if (normalized.includes('solicitud de reembolso') || normalized.includes('reembolso')) {
      startFormDocument('reimbursement_request');
      return;
    }

    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Elige una de las dos opciones para seguir.') });
    dispatch({ type: 'ADD_MESSAGE', message: createFormSelectorMessage() });
  };

  const handleFormInput = (text) => {
    const normalized = text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[.!?]+$/g, '');

    if (normalized === 'cancelar' || normalized === 'salir' || normalized === 'volver al inicio' || normalized === 'volver') {
      cancelFormDraft();
      return;
    }

    if (normalized === 'ver lo que llevo') {
      showFormPartialSnapshot();
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(getFormFollowUpPrompt()) });
      return;
    }

    if (normalized === 'cambiar el dato anterior') {
      if (state.documentDraft.status === 'collecting' && state.documentDraft.currentFieldIndex > 0) {
        updateDocumentDraft({
          currentFieldIndex: state.documentDraft.currentFieldIndex - 1,
          status: 'collecting'
        });
        dispatch({
          type: 'ADD_MESSAGE',
          message: createAssistantMessage(`Claro. Volvemos a ${getFormFieldLabel(previousFormField).toLowerCase()}.`)
        });
        dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(getFormFieldPrompt(previousFormField)) });
        return;
      }

      updateDocumentDraft({
        status: 'editing',
        editingFieldId: null
      });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Claro. ¿Qué dato quieres cambiar?') });
      return;
    }

    if (normalized === 'no lo se' || normalized === 'no se') {
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Entiendo. Pero sí necesito ese dato para completar el documento.') });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(getFormFollowUpPrompt()) });
      return;
    }

    if (state.documentDraft.status === 'choosing_document') {
      handleFormChoosingInput(text);
      return;
    }

    if (state.documentDraft.status === 'collecting') {
      handleFormCollectingInput(text);
      return;
    }

    if (state.documentDraft.status === 'reviewing') {
      if (normalized === 'si' || normalized === 'si confirmar' || normalized === 'si, confirmar' || normalized === 'sí' || normalized === 'sí confirmar' || normalized === 'sí, confirmar') {
        handleFormConfirmation('form-confirm');
        return;
      }

      if (normalized === 'modificar un dato' || normalized === 'cambiar' || normalized === 'editar') {
        handleFormConfirmation('form-edit');
        return;
      }

      if (normalized === 'cancelar' || normalized === 'salir') {
        handleFormConfirmation('form-cancel');
        return;
      }

      const matchedField = findFormFieldByText(state.documentDraft.documentType, text);
      if (matchedField) {
        handleFormEditingSelection(matchedField.id);
        return;
      }

      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Puedes confirmar, modificar un dato o cancelar.') });
      return;
    }

    if (state.documentDraft.status === 'editing') {
      if (!state.documentDraft.editingFieldId) {
        const matchedField = findFormFieldByText(state.documentDraft.documentType, text);
        if (matchedField) {
          handleFormEditingSelection(matchedField.id);
          return;
        }

        dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('¿Qué dato quieres cambiar?') });
        return;
      }

      handleFormCorrectionValue(text);
      return;
    }
  };

  const enterInformationReview = (introText = 'Ahora revisemos la información que tengo del trámite.') => {
    dispatch({ type: 'SET_INFORMATION_CORRECTION_FIELD', value: null });
    dispatch({ type: 'SET_INFORMATION_CONFIRMED', value: false });
    if (introText) dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(introText) });
    dispatch({ type: 'ADD_MESSAGE', message: createInformationSummaryMessage(state) });
    dispatch({ type: 'SET_STAGE', value: 'information-policy' });
  };

  const enterClaimReview = (introText = 'Ahora revisemos los datos de la reclamación.') => {
    dispatch({ type: 'SET_CLAIM_CONFIRMED', value: false });
    dispatch({ type: 'SET_STAGE', value: 'claim' });
    if (introText) dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(introText) });

    const missingField = getNextRequiredClaimField(state.claimant, state.flow);
    if (missingField) {
      dispatch({ type: 'SET_CLAIM_CORRECTION_FIELD', value: missingField });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(getClaimFieldPrompt(missingField)) });
      return;
    }

    dispatch({ type: 'SET_CLAIM_CORRECTION_FIELD', value: null });
    dispatch({ type: 'ADD_MESSAGE', message: createClaimSummaryMessage(state) });
  };

  const handleInformationInput = (text, appendUserMessage = false) => {
    if (appendUserMessage) dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(text) });

    const parsed = parseInformationInput(text, state.informationCorrectionField);

    if (parsed.intent === 'confirm') {
      if (!canContinueInfo) {
        const firstError = Object.values(contactErrors).find(Boolean);
        dispatch({
          type: 'ADD_MESSAGE',
          message: createAssistantMessage(firstError || 'Todavía falta completar un dato antes de continuar.')
        });
        return;
      }

      dispatch({ type: 'SET_INFORMATION_CONFIRMED', value: true });
      dispatch({ type: 'SET_INFORMATION_CORRECTION_FIELD', value: null });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Perfecto, la información quedó confirmada.') });
      enterClaimReview('Ahora continuemos con los datos de la reclamación. Puedes corregir cualquier dato escribiéndolo aquí mismo.');
      return;
    }

    if (parsed.intent === 'request-value') {
      dispatch({ type: 'SET_INFORMATION_CORRECTION_FIELD', value: parsed.field });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(getInformationFieldPrompt(parsed.field)) });
      return;
    }

    if (parsed.intent === 'ambiguous' || parsed.intent === 'unknown') {
      dispatch({ type: 'SET_INFORMATION_CORRECTION_FIELD', value: null });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Claro, ¿qué dato quieres modificar?') });
      return;
    }

    const validation = validateInformationValue(parsed.field, parsed.value);
    if (!validation.valid) {
      dispatch({ type: 'SET_INFORMATION_CORRECTION_FIELD', value: parsed.field });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(validation.error) });
      return;
    }

    const nextInformation = applyInformationCorrection(
      { policy: state.policy, person: state.person, contact: state.contact },
      parsed.field,
      validation.value
    );

    dispatch({ type: 'APPLY_INFORMATION_CORRECTION', value: nextInformation });
    dispatch({ type: 'SET_INFORMATION_CORRECTION_FIELD', value: null });
    dispatch({
      type: 'ADD_MESSAGE',
      message: createAssistantMessage(`Listo, actualicé ${getInformationFieldLabel(parsed.field)}.`)
    });
    dispatch({
      type: 'ADD_MESSAGE',
      message: createInformationSummaryMessage(nextInformation, 'Gracias. Te muestro cómo quedó:')
    });
  };

  const handleClaimInput = (text, appendUserMessage = false) => {
    if (appendUserMessage) dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(text) });

    const parsed = parseClaimInput(text, state.claimCorrectionField);

    if (parsed.intent === 'confirm') {
      if (!canContinueClaim) {
        const firstError = Object.values(claimErrors).find(Boolean);
        dispatch({
          type: 'ADD_MESSAGE',
          message: createAssistantMessage(firstError || 'Todavía falta completar un dato de la reclamación antes de continuar.')
        });
        return;
      }

      dispatch({ type: 'SET_CLAIM_CONFIRMED', value: true });
      dispatch({ type: 'SET_CLAIM_CORRECTION_FIELD', value: null });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Perfecto, los datos de la reclamación quedaron confirmados.') });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Ya casi terminamos. Revisemos juntos el resumen antes de enviarlo.') });
      dispatch({ type: 'SET_STAGE', value: 'review' });
      return;
    }

    if (parsed.intent === 'request-value') {
      dispatch({ type: 'SET_CLAIM_CORRECTION_FIELD', value: parsed.field });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(getClaimFieldPrompt(parsed.field)) });
      return;
    }

    if (parsed.intent === 'ambiguous' || parsed.intent === 'unknown') {
      dispatch({ type: 'SET_CLAIM_CORRECTION_FIELD', value: null });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Claro, ¿qué dato de la reclamación quieres modificar?') });
      return;
    }

    const validation = validateClaimValue(parsed.field, parsed.value);
    if (!validation.valid) {
      dispatch({ type: 'SET_CLAIM_CORRECTION_FIELD', value: parsed.field });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(validation.error) });
      return;
    }

    const nextClaimant = applyClaimCorrection(state.claimant, parsed.field, validation.value);
    const nextMissingField = getNextRequiredClaimField(nextClaimant, state.flow);
    dispatch({ type: 'APPLY_CLAIM_CORRECTION', value: nextClaimant });
    dispatch({
      type: 'ADD_MESSAGE',
      message: createAssistantMessage(`Listo, actualicé ${getClaimFieldLabel(parsed.field)}.`)
    });

    if (nextMissingField) {
      dispatch({ type: 'SET_CLAIM_CORRECTION_FIELD', value: nextMissingField });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(getClaimFieldPrompt(nextMissingField)) });
      return;
    }

    dispatch({ type: 'SET_CLAIM_CORRECTION_FIELD', value: null });
    dispatch({
      type: 'ADD_MESSAGE',
      message: createClaimSummaryMessage(
        { claimant: nextClaimant, flow: state.flow },
        state.flow === 'cirugia_programada'
          ? 'Gracias. Ya tengo los datos necesarios de la programación. Revisa cómo quedó:'
          : 'Gracias. Te muestro cómo quedó:'
      )
    });
  };

  const handleIntent = (intent) => {
    const item = chatbotQuickActions.find((option) => option.id === intent);
    if (intent === 'complete-form') {
      dispatch({ type: 'ADD_MESSAGE', message: createUserMessage('Completar un formulario') });
      enterFormSelector();
      return;
    }

    if (!item) return;

    dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(item.label) });

    if (intent === 'info') {
      dispatch({ type: 'SET_ENTRY_MODE', value: 'info' });
      dispatch({ type: 'SET_STAGE', value: 'flow-intro' });
      return;
    }

    if (intent === 'start') {
      dispatch({ type: 'SET_ENTRY_MODE', value: 'start' });
      dispatch({ type: 'SET_STAGE', value: 'flow-intro' });
      return;
    }

    if (intent === 'formats') {
      dispatch({ type: 'SET_ENTRY_MODE', value: 'start' });
      dispatch({ type: 'SET_STAGE', value: state.flow ? 'formats' : 'flow-intro' });
      return;
    }

    if (intent === 'status' || intent === 'help') {
      dispatch({ type: 'SET_STAGE', value: 'out-of-scope' });
    }
  };

  const handleFlowSelect = (flow, nextEntryMode = 'start') => {
    const label = flowLabels[flow];
    dispatch({ type: 'SET_FLOW', flow, scenario: 'mixed' });
    dispatch({ type: 'SET_ENTRY_MODE', value: nextEntryMode });
    dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(label) });
    dispatch({ type: 'SET_STAGE', value: 'flow-intro' });
  };

  // The guide is initially rendered as stage content. Persist its wording before
  // changing stages so the user keeps a complete conversational trail.
  const persistFlowGuideTrace = () => {
    const guideCopy = getStageCopy('flow-intro', state.entryMode, state.flow);
    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(guideCopy.title) });
    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(guideCopy.description) });
  };

  const addDocumentsIntroMessage = () => {
    const flowLabel = state.flow ? flowLabels[state.flow] : 'tu trámite';
    dispatch({
      type: 'ADD_MESSAGE',
      message: createAssistantMessage(`Muy bien. Empecemos con los documentos de ${flowLabel}. Te iré pidiendo cada uno paso a paso.`)
    });
  };

  // The mixed scenario starts with example files already available. Record them
  // as user attachments so the conversation keeps the same audit trail as a
  // real upload, without adding the same documents more than once.
  const addPreloadedDocumentTrace = () => {
    if (state.preloadedDocumentTraceAdded) return false;

    const attachedDocuments = state.documents.filter((document) => document.files.length > 0);
    if (attachedDocuments.length === 0) return false;

    dispatch({ type: 'SET_PRELOADED_DOCUMENT_TRACE_ADDED', value: true });
    attachedDocuments.forEach((document) => {
      dispatch({
        type: 'ADD_MESSAGE',
        message: createAttachmentMessage(document.label, document.files)
      });
    });
    dispatch({
      type: 'ADD_MESSAGE',
      message: createAssistantMessage(`Gracias, ya recibí ${attachedDocuments.length} documentos. Ahora los revisaré uno por uno.`)
    });

    return true;
  };

  const handleGuideContinue = (nextStage) => {
    persistFlowGuideTrace();

    if (nextStage === 'documents') {
      dispatch({ type: 'ADD_MESSAGE', message: createUserMessage('Ya tengo los documentos.') });
      if (!addPreloadedDocumentTrace()) addDocumentsIntroMessage();
      dispatch({ type: 'SET_STAGE', value: 'documents' });
      return;
    }

    if (nextStage === 'validation') {
      dispatch({ type: 'SET_STAGE', value: 'validation-processing' });
      return;
    }

    if (nextStage === 'info-only') {
      dispatch({ type: 'ADD_MESSAGE', message: createUserMessage('No, solo necesitaba información.') });
      dispatch({ type: 'SET_STAGE', value: 'welcome' });
      return;
    }

    if (nextStage === 'another-tramite') {
      dispatch({ type: 'ADD_MESSAGE', message: createUserMessage('Consultar otro trámite.') });
      dispatch({ type: 'SET_STAGE', value: 'welcome' });
      return;
    }

    if (nextStage === 'start-now') {
      dispatch({ type: 'ADD_MESSAGE', message: createUserMessage('Sí, iniciar.') });
      if (!addPreloadedDocumentTrace()) addDocumentsIntroMessage();
      dispatch({ type: 'SET_STAGE', value: 'documents' });
    }
  };

  const handleDownload = (document) => {
    dispatch({ type: 'SET_DOWNLOADED_FORMATS', value: [...state.downloadedFormats, document.id] });
    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(`Ya dejé listo el formato de ${document.label}.`) });
  };

  const handleDownloadAll = () => {
    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Listo. Dejé preparados todos los formatos disponibles para este trámite.') });
    if (!addPreloadedDocumentTrace()) addDocumentsIntroMessage();
    dispatch({ type: 'SET_STAGE', value: 'documents' });
  };

  const handleDocumentUpload = (documentId, files) => {
    if (!files.length || !state.flow) return;

    const targetDocument = state.documents.find((document) => document.id === documentId);
    if (!targetDocument) return;

    const fileMetas = files.map((file) => createMockFileMeta(file, 'uploaded'));
    const nextFiles = targetDocument.multiple ? [...targetDocument.files, ...fileMetas] : [fileMetas[0]];

    dispatch({
      type: 'SET_DOCUMENT_FILES',
      documentId,
      files: nextFiles,
      status: 'processing',
      validationNote: 'Procesando documento'
    });

    dispatch({
      type: 'ADD_MESSAGE',
      message: createAttachmentMessage(targetDocument.label, fileMetas)
    });

    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(`Ya recibí ${targetDocument.label}. Lo estoy revisando ahora mismo.`) });

    if (uploadTimersRef.current[documentId]) clearTimeout(uploadTimersRef.current[documentId]);
    uploadTimersRef.current[documentId] = window.setTimeout(() => {
      const validationResult = getDocumentValidationResult(state.flow, documentId, state.scenario);
      dispatch({
        type: 'SET_DOCUMENT_STATUS',
        documentId,
        status: validationResult.status,
        validationNote: validationResult.validationNote
      });
      dispatch({
        type: 'ADD_MESSAGE',
        message: createAssistantMessage(
          validationResult.status === 'validated'
            ? `${targetDocument.label} se ve correcto.`
            : validationResult.status === 'illegible'
              ? `Detecté que ${targetDocument.label} no se lee con claridad. Te mostraré la observación al revisar los resultados.`
              : `Detecté una observación en ${targetDocument.label}. La revisaremos juntos al terminar.`
        )
      });
      delete uploadTimersRef.current[documentId];
    }, 1200);
  };

  const handleRemoveDocumentFile = (documentId, fileId) => {
    dispatch({ type: 'REMOVE_DOCUMENT_FILE', documentId, fileId });
  };

  const handleDocumentContinue = () => {
    const hasFiles = state.documents.some((document) => document.files.length > 0);
    if (!hasFiles) {
      enterInformationReview('Todavía no veo documentos cargados. Podemos revisar la información del trámite y volver a los archivos después.');
      return;
    }

    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Perfecto, voy a validar lo que ya cargaste.') });
    dispatch({ type: 'SET_STAGE', value: 'validation-processing' });
    dispatch({ type: 'SET_VALIDATION_PHASE', value: 'processing' });
    dispatch({ type: 'SET_VALIDATION_STAGE_INDEX', value: 0 });
  };

  const handleReviewEdit = (section) => {
    if (section === 'documents') {
      dispatch({ type: 'SET_STAGE', value: 'documents' });
      return;
    }
    if (section === 'information-policy') {
      enterInformationReview('Claro, revisemos nuevamente la información del trámite.');
      return;
    }
    if (section === 'information-requester') {
      enterInformationReview('Claro, revisemos nuevamente los datos de quien realiza el trámite.');
      return;
    }
    if (section === 'information-contact') {
      enterInformationReview('Claro, revisemos nuevamente tus datos de contacto.');
      return;
    }
    if (section === 'claim') {
      enterClaimReview('Claro, revisemos nuevamente los datos de la reclamación.');
      return;
    }
    if (section === 'validation-results') {
      dispatch({ type: 'SET_STAGE', value: 'validation-results' });
    }
  };

  const handleConfirmSend = () => {
    dispatch({ type: 'SET_STAGE', value: 'submitting' });
    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Estoy preparando el envío de tu trámite. Esto solo toma un momento.') });
    window.setTimeout(() => {
      dispatch({ type: 'SET_STAGE', value: 'success' });
      dispatch({ type: 'SET_REVIEW_CONFIRMED', value: true });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Listo, tu solicitud quedó recibida correctamente.') });
    }, 1200);
  };

  const handleComposerSend = () => {
    const text = String(state.draft ?? '').trim();
    if (!text) return;

    dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(text) });
    dispatch({ type: 'SET_DRAFT', value: '' });

    if (['choosing_document', 'collecting', 'reviewing', 'editing'].includes(state.documentDraft.status)) {
      handleFormInput(text);
      return;
    }

    if (/completar un formulario|completar formulario|llenar un formulario|llenar formulario/i.test(text)) {
      enterFormSelector();
      return;
    }

    if (isInformationStage(state.stage)) {
      handleInformationInput(text);
      return;
    }

    if (state.stage === 'claim') {
      handleClaimInput(text);
      return;
    }

    const normalized = text.toLowerCase();
    if (/reembolso|devoluci[oó]n|factura|gastos/.test(normalized)) {
      dispatch({ type: 'SET_STAGE', value: 'flow-intro' });
      dispatch({ type: 'SET_ENTRY_MODE', value: 'start' });
      dispatch({ type: 'SET_FLOW', flow: 'reembolso', scenario: 'mixed' });
      return;
    }

    if (/cirug|operaci[oó]n|autorizaci[oó]n/.test(normalized)) {
      dispatch({ type: 'SET_STAGE', value: 'flow-intro' });
      dispatch({ type: 'SET_ENTRY_MODE', value: 'start' });
      dispatch({ type: 'SET_FLOW', flow: 'cirugia_programada', scenario: 'mixed' });
      return;
    }

    if (/requisit|document|formato/.test(normalized)) {
      dispatch({ type: 'SET_STAGE', value: 'flow-intro' });
      dispatch({ type: 'SET_ENTRY_MODE', value: 'info' });
      return;
    }

    if (/estatus/.test(normalized)) {
      dispatch({ type: 'SET_STAGE', value: 'out-of-scope' });
      return;
    }

    dispatch({ type: 'SET_STAGE', value: 'flow-intro' });
    dispatch({ type: 'SET_ENTRY_MODE', value: 'info' });
  };

  const handleComposerSuggestion = (item) => {
    if (item.id === 'complete-form') {
      dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(item.label) });
      enterFormSelector();
      return;
    }

    if (item.id === 'form-cancel') {
      dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(item.label) });
      cancelFormDraft();
      return;
    }

    if (item.id === 'form-progress') {
      dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(item.label) });
      showFormPartialSnapshot('Esto es lo que llevo hasta ahora:');
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(getFormFollowUpPrompt()) });
      return;
    }

    if (item.id === 'form-previous') {
      dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(item.label) });
      handleFormInput('Cambiar el dato anterior');
      return;
    }

    if (item.id === 'form-edit') {
      dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(item.label) });
      handleFormConfirmation('form-edit');
      return;
    }

    if (item.id === 'form-confirm') {
      dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(item.label) });
      handleFormConfirmation('form-confirm');
      return;
    }

    const formSelectionById = {
      accident_notice: 'accident_notice',
      reimbursement_request: 'reimbursement_request',
      back: 'back'
    };

    if (formSelectionById[item.id]) {
      if (item.id !== 'back') {
        dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(item.label) });
      }
      handleFormSelection(formSelectionById[item.id]);
      return;
    }

    if (formDefinition && state.documentDraft.status === 'editing' && !state.documentDraft.editingFieldId) {
      const matchedField = getFormFieldById(state.documentDraft.documentType, item.id);
      if (matchedField) {
        handleFormEditingSelection(matchedField.id);
        return;
      }
    }

    if (item.claimField && item.value) {
      handleClaimInput(item.value, true);
      return;
    }

    if (item.id === 'info-confirm') {
      handleInformationInput('Sí, continuar', true);
      return;
    }

    if (item.id === 'claim-confirm') {
      handleClaimInput('Sí, continuar', true);
      return;
    }

    const claimFieldBySuggestion = {
      'claim-change-type': 'type',
      'claim-change-knows': 'knowsSinisterNumber',
      'claim-change-sinister': 'sinisterNumber',
      'claim-change-attention': 'attentionPlace',
      'claim-change-tramite': 'tramiteType',
      'claim-change-observations': 'observations',
      'claim-change-currency': 'currency',
      'claim-change-amount': 'claimedAmount',
      'claim-change-receipts': 'receiptsCount'
    };

    if (claimFieldBySuggestion[item.id]) {
      const field = claimFieldBySuggestion[item.id];
      dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(item.label) });
      dispatch({ type: 'SET_CLAIM_CORRECTION_FIELD', value: field });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(getClaimFieldPrompt(field)) });
      return;
    }

    const informationFieldBySuggestion = {
      'info-change-name': 'fullName',
      'info-change-email': 'email',
      'info-change-phone': 'mobilePhone',
      'info-change-policy': 'policyNumber'
    };

    if (informationFieldBySuggestion[item.id]) {
      const field = informationFieldBySuggestion[item.id];
      dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(item.label) });
      dispatch({ type: 'SET_INFORMATION_CORRECTION_FIELD', value: field });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(getInformationFieldPrompt(field)) });
      return;
    }

    if (item.id === 'reembolso' || item.id === 'cirugia_programada') {
      handleFlowSelect(item.id, 'start');
      return;
    }

    handleIntent(item.id);
  };

  const handleGoHome = () => {
    resetConversation('welcome');
  };

  const handleExitChatbot = () => {
    if (onExit) onExit();
  };

  const renderStageContent = () => {
    if (isWelcomeEmpty) {
      const starterQuickReplies = [
        { id: 'reembolso', label: 'Reembolso' },
        { id: 'cirugia_programada', label: 'Cirugía Programada' }
      ];

      return (
        <section className="flex min-h-[calc(100vh-260px)] flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-[860px] text-center">
            <span className="inline-flex items-center rounded-full border border-[#DDE5EF] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-[#006494] shadow-sm">
              Asistente virtual
            </span>
            <h2 className="mx-auto mt-5 max-w-4xl text-[clamp(2.2rem,3.6vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-[#181C1E]">
              ¿En qué puedo ayudarte hoy?
            </h2>
            <p className="mx-auto mt-4 max-w-[700px] text-[clamp(1rem,1.2vw,1.125rem)] leading-7 text-[#434751]">
              Puedo orientarte sobre Reembolso, Cirugía Programada, documentos y el estado de tu trámite.
            </p>
          </div>

      <div className="mt-8 w-full max-w-[760px]">
            <ChatComposer
              value={state.draft}
              onChange={(value) => dispatch({ type: 'SET_DRAFT', value })}
              onSend={handleComposerSend}
              onAttach={(files) => {
                if (!state.flow) return;
                const targetDocument = state.documents.find((document) => document.status === 'pending') ?? state.documents[0];
                if (targetDocument) handleDocumentUpload(targetDocument.id, files);
              }}
              placeholder="Pregunta a Allianz México"
              suggestions={[
                { id: 'complete-form', label: 'Completar un formulario' },
                ...starterQuickReplies
              ]}
              onSuggestion={handleComposerSuggestion}
              variant="hero"
            />
          </div>
        </section>
      );
    }

    if (state.stage === 'flow-intro') {
      return (
        <section className="space-y-4">
          <FlowGuideCard
            flow={state.flow}
            entryMode={state.entryMode}
            onFlowSelect={(flow) => {
              handleFlowSelect(flow, state.entryMode === 'info' ? 'info' : 'start');
            }}
            onContinue={() => handleGuideContinue(state.entryMode === 'info' ? 'start-now' : 'documents')}
            onInfoOnly={() => handleGuideContinue('info-only')}
            onOtherFlow={() => handleGuideContinue('another-tramite')}
            onFormats={() => {
              persistFlowGuideTrace();
              dispatch({ type: 'SET_STAGE', value: 'formats' });
              dispatch({ type: 'ADD_MESSAGE', message: createUserMessage('Descargar formatos') });
            }}
          />
        </section>
      );
    }

    if (state.stage === 'formats') {
      return (
        <section className="space-y-4">
          <AssistantCue text="Aquí tienes los formatos disponibles. Descarga uno o todos y luego seguimos cuando tú quieras." />
          <FormatLibraryCard
            flow={state.flow}
            onDownload={handleDownload}
            onDownloadAll={handleDownloadAll}
          />
        </section>
      );
    }

    if (state.stage === 'documents') {
      return (
        <section className="space-y-4">
          <div className="rounded-[24px] border border-[#E0E6ED] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#006494]">Documentos</p>
                <h3 className="mt-2 text-[22px] font-semibold leading-7 text-[#181C1E]">
                  {state.flow ? `Vamos con ${flowLabels[state.flow]}` : 'Documentos del trámite'}
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#434751]">
                  {state.flow
                    ? 'Te iré pidiendo cada archivo en un orden sencillo para que no tengas que pensar demasiado.'
                    : 'Selecciona un trámite para mostrar los documentos correspondientes.'}
                </p>
              </div>
              <div className="rounded-full bg-[#EFF6FF] px-4 py-2 text-sm font-semibold text-[#003781]">
                {summary.processed} cargados
              </div>
            </div>

            {state.flow ? (
              <>
                <div className="mt-5 rounded-[22px] border border-[#E0E6ED] bg-[#F7FAFC] p-4">
                  <p className="text-sm font-semibold text-[#181C1E]">Documentos para empezar</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {visibleFlowDocuments.map((document) => (
                      <span
                        key={document.id}
                        className="inline-flex items-center rounded-full border border-[#DDE5EF] bg-white px-3 py-1.5 text-xs font-semibold text-[#434751]"
                      >
                        {document.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-2">
                  {state.documents.map((document) => (
                    <DocumentCard
                      key={document.id}
                      document={document}
                      onFilesSelected={(files) => handleDocumentUpload(document.id, files)}
                      onRemoveFile={(fileId) => handleRemoveDocumentFile(document.id, fileId)}
                      onReplaceFile={(openPicker) => openPicker()}
                      onSelectFiles={(openPicker) => openPicker()}
                      onDropFiles={(files) => handleDocumentUpload(document.id, files)}
                      isHighlighted={state.activeDocumentId === document.id}
                    />
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="focus-ring inline-flex items-center justify-center rounded-full border border-[#DDE5EF] bg-white px-4 py-2.5 text-sm font-semibold text-[#434751] transition hover:bg-[#F7FAFC]"
                    onClick={() => {
                      dispatch({ type: 'ADD_MESSAGE', message: createUserMessage('Continuar sin documentos') });
                      enterInformationReview('De acuerdo. Revisemos la información que tengo del trámite.');
                    }}
                  >
                    Continuar sin documentos
                  </button>
                  <button
                    type="button"
                    className="focus-ring inline-flex items-center justify-center rounded-full bg-[#003781] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002356]"
                    onClick={handleDocumentContinue}
                  >
                    Validar documentos
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-5 rounded-[22px] border border-dashed border-[#DDE5EF] bg-[#F7FAFC] p-5 text-sm leading-6 text-[#434751]">
                Selecciona Reembolso o Cirugía Programada desde el panel inicial o vuelve al inicio de la conversación para comenzar.
              </div>
            )}
          </div>
        </section>
      );
    }

    if (state.stage === 'validation-processing') {
      return (
        <div className="space-y-4">
          <AssistantCue text="Déjame un momento, estoy revisando lo que cargaste." />
          <ValidationProcessingScreen stageIndex={state.validationStageIndex} progress={Math.max(12, (state.validationStageIndex + 1) * 20)} />
        </div>
      );
    }

    if (state.stage === 'validation-results') {
      return (
        <div className="space-y-4">
          <AssistantCue text="Ya terminé la revisión. Te muestro lo más importante para que decidas si quieres corregir algo." />
          <ValidationResultsPanel
            summary={summary}
            correctDocuments={validatedDocuments}
            reviewDocuments={reviewDocuments}
            alerts={activeAlerts}
            onResolveAlert={(alert) => {
              enterInformationReview(`Revisemos el dato relacionado con ${alert.field}. Puedes escribir la corrección en el chat.`);
            }}
            onEditDocument={(document) => {
              dispatch({ type: 'SET_ACTIVE_DOCUMENT', value: document.id });
              dispatch({ type: 'SET_STAGE', value: 'documents' });
            }}
            onIgnoreAlert={(alertId) => dispatch({ type: 'IGNORE_ALERT', alertId })}
          />
          <div className="flex justify-end">
            <button
              type="button"
              className="focus-ring inline-flex items-center justify-center rounded-full bg-[#003781] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002356]"
              onClick={() => enterInformationReview()}
            >
              Continuar
            </button>
          </div>
        </div>
      );
    }

    if (isInformationStage(state.stage)) {
      return null;
    }

    if (state.stage === 'information-policy') {
      return (
        <InfoSectionCard
          title="Datos de la póliza"
          description="Mantén a la vista los datos principales del contrato. Los valores detectados siguen siendo editables."
          icon={<SparkIcon className="h-5 w-5" />}
        >
          <AssistantCue text="Vamos con tus datos de póliza. Si algo no coincide, lo puedes ajustar aquí mismo." />
          <InlineFormGrid columns="lg:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6B7280]">Tipo de producto</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ToggleChoice value="Individual" selected={state.policy.productType === 'Individual'} onSelect={() => dispatch({ type: 'SET_POLICY_FIELD', field: 'productType', value: 'Individual' })} />
                <ToggleChoice value="Colectiva" selected={state.policy.productType === 'Colectiva'} onSelect={() => dispatch({ type: 'SET_POLICY_FIELD', field: 'productType', value: 'Colectiva' })} />
              </div>
            </div>
            <FormField
              label="Número de póliza"
              value={state.policy.policyNumber}
              onChange={(value) => dispatch({ type: 'SET_POLICY_FIELD', field: 'policyNumber', value })}
              autoIdentified={state.policy.identifiedAutomatically}
              helperText="Puedes corregirlo si el sistema detectó un dato distinto."
            />
          </InlineFormGrid>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              className="focus-ring inline-flex items-center justify-center rounded-full bg-[#003781] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002356]"
              onClick={() => {
                dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Ahora necesito saber quién está realizando el trámite.') });
                dispatch({ type: 'SET_STAGE', value: 'information-requester' });
              }}
            >
              Guardar y continuar
            </button>
          </div>
        </InfoSectionCard>
      );
    }

    if (state.stage === 'information-requester') {
      return (
        <InfoSectionCard
          title="Persona solicitante"
          description="Selecciona quién solicita el trámite y reutiliza la información detectada cuando corresponda."
          icon={<SparkIcon className="h-5 w-5" />}
        >
          <AssistantCue text="Ahora necesito saber quién realiza el trámite. Lo hacemos juntos en un momento." />
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#181C1E]">
                ¿La persona que solicita este trámite es el titular o el afectado?
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {['Titular', 'Afectado', 'Otro'].map((option) => (
                  <ToggleChoice
                    key={option}
                    value={option}
                    selected={state.person.relationship === option}
                    onSelect={() => {
                      dispatch({ type: 'SET_PERSON_FIELD', field: 'relationship', value: option });
                      if (option !== 'Otro') dispatch({ type: 'SET_PERSON_FIELD', field: 'parentesco', value: '' });
                    }}
                  />
                ))}
              </div>
            </div>

            <InlineFormGrid columns="lg:grid-cols-3">
              <FormField
                label="Nombre"
                value={state.person.firstName}
                onChange={(value) => dispatch({ type: 'SET_PERSON_FIELD', field: 'firstName', value })}
                autoIdentified={state.person.contactAutoIdentified}
              />
              <FormField
                label="Apellido paterno"
                value={state.person.paternalLastName}
                onChange={(value) => dispatch({ type: 'SET_PERSON_FIELD', field: 'paternalLastName', value })}
                autoIdentified={state.person.contactAutoIdentified}
              />
              <FormField
                label="Apellido materno"
                value={state.person.maternalLastName}
                onChange={(value) => dispatch({ type: 'SET_PERSON_FIELD', field: 'maternalLastName', value })}
                autoIdentified={state.person.contactAutoIdentified}
              />
            </InlineFormGrid>

          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              className="focus-ring inline-flex items-center justify-center rounded-full bg-[#003781] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002356]"
              onClick={() => {
                dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Ahora voy a mostrar los datos de contacto para continuar.') });
                dispatch({ type: 'SET_STAGE', value: 'information-contact' });
              }}
            >
              Guardar y continuar
            </button>
          </div>
        </InfoSectionCard>
      );
    }

    if (state.stage === 'information-contact') {
      return (
        <InfoSectionCard
          title="Datos de contacto"
          description="Completa los medios de contacto para continuar con la preparación del trámite."
          icon={<SparkIcon className="h-5 w-5" />}
        >
          <AssistantCue text="Perfecto. Solo me faltan tus datos de contacto para continuar." />
          <InlineFormGrid columns="lg:grid-cols-2">
            <FormField
              label="Teléfono particular"
              value={state.contact.phoneLandline}
              onChange={(value) => dispatch({ type: 'SET_CONTACT_FIELD', field: 'phoneLandline', value })}
              error={contactErrors.phoneLandline}
              helperText="Opcional si no tienes línea fija."
            />
            <FormField
              label="Teléfono celular"
              value={state.contact.mobilePhone}
              onChange={(value) => dispatch({ type: 'SET_CONTACT_FIELD', field: 'mobilePhone', value })}
              error={contactErrors.mobilePhone}
            />
            <FormField
              label="Correo electrónico"
              value={state.contact.email}
              onChange={(value) => dispatch({ type: 'SET_CONTACT_FIELD', field: 'email', value })}
              error={contactErrors.email}
            />
            <FormField
              label="Confirmación de correo"
              value={state.contact.emailConfirmation}
              onChange={(value) => dispatch({ type: 'SET_CONTACT_FIELD', field: 'emailConfirmation', value })}
              error={contactErrors.emailConfirmation}
            />
          </InlineFormGrid>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className={`focus-ring inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                canContinueInfo ? 'bg-[#003781] text-white hover:bg-[#002356]' : 'cursor-not-allowed bg-[#E9EEF5] text-[#8B94A3]'
              }`}
              disabled={!canContinueInfo}
              onClick={() => {
                enterClaimReview('Ahora continuemos con los datos de la reclamación. Puedes corregir cualquier dato escribiéndolo aquí mismo.');
              }}
            >
              Guardar y continuar
            </button>
          </div>
        </InfoSectionCard>
      );
    }

    if (state.stage === 'claim') {
      return null;
    }

    if (state.stage === 'review') {
      return (
        <div className="space-y-4">
          <AssistantCue text="Ya casi terminamos. Revisemos juntos el resumen antes de enviarlo." />
          <ValidationSummary summary={summary} />
          <ReviewSummaryCard
            flow={state.flow}
            policy={state.policy}
            person={state.person}
            contact={state.contact}
            claimant={state.claimant}
            documents={state.documents}
            alerts={activeAlerts}
            onEditSection={handleReviewEdit}
          />
        </div>
      );
    }

    if (state.stage === 'submitting') {
      return (
        <section className="rounded-[24px] border border-[#E0E6ED] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#003781]" aria-hidden="true">
              <SparkIcon className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#006494]">Envío en progreso</p>
              <h3 className="mt-1 text-[22px] font-semibold leading-7 text-[#181C1E]">Estoy preparando el envío</h3>
              <p className="mt-2 text-sm leading-6 text-[#434751]">En un momento verás la confirmación final.</p>
            </div>
          </div>
        </section>
      );
    }

    if (state.stage === 'success') {
      return <SuccessCard flow={state.flow} folio={state.folio} onNewConversation={() => resetConversation('welcome')} />;
    }

    if (state.stage === 'out-of-scope') {
      return <SupportCard flow={state.flow} onStartNew={() => resetConversation('welcome')} />;
    }

    return <div />;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7FAFC] text-[#181C1E]">
      <ChatSidebar
        collapsed={state.sidebarCollapsed}
        onToggleCollapsed={() => dispatch({ type: 'SET_SIDEBAR_COLLAPSED', value: !state.sidebarCollapsed })}
        activePresetId={state.presetId}
        onNewConversation={() => resetConversation('welcome')}
        onGoHome={() => resetConversation('welcome')}
        onHelp={() => handleIntent('help')}
      />

      <section className="flex min-w-0 flex-1 flex-col bg-[#F7FAFC]">
        <ChatHeader
          onHelp={() => handleIntent('help')}
          onRestart={() => resetConversation('welcome')}
          onExit={() => setShowExitConfirm(true)}
        />

        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
              <div className="mx-auto flex w-full max-w-[980px] flex-col gap-4">
                {state.messages.map((message) =>
                  message.type === 'form-selector' ? (
                    <FormDocumentSelector
                      key={message.id}
                      message={message}
                      onSelect={(option) => handleFormSelection(option.id)}
                    />
                  ) : message.type === 'form-summary' ? (
                    <FormSummaryMessage key={message.id} message={message} />
                  ) : message.type === 'form-generated-document' ? (
                    <FormGeneratedDocumentMessage key={message.id} message={message} />
                  ) : message.type === 'claim-summary' ? (
                    <ClaimSummaryMessage key={message.id} message={message} />
                  ) : message.type === 'information-summary' ? (
                    <InformationSummaryMessage key={message.id} message={message} />
                  ) : message.type === 'document-attachment' ? (
                    <ChatMessage key={message.id} role="user" timeLabel={message.timeLabel}>
                      <div className="min-w-[220px]">
                        <p className="mb-2 text-[13px] font-semibold text-[#1B2C5B]">Documento adjunto</p>
                        <p className="mb-2 text-[12px] text-[#536887]">{message.documentLabel}</p>
                        <div className="space-y-2">
                          {message.files.map((file) => (
                            <div key={file.id} className="flex items-center gap-2 rounded-xl border border-[#D4E0F2] bg-white/70 px-3 py-2">
                              <PaperclipIcon className="h-4 w-4 shrink-0 text-[#003781]" />
                              <div className="min-w-0">
                                <p className="truncate text-[13px] font-semibold text-[#1B2C5B]">{file.name}</p>
                                <p className="text-[11px] text-[#6B7280]">{file.size} · {String(file.type || '').split('/').pop()?.toUpperCase() || 'Archivo'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ChatMessage>
                  ) : (
                    <ChatMessage key={message.id} role={message.role} text={message.text} timeLabel={message.timeLabel} />
                  )
                )}

                {renderStageContent()}

                {state.stage === 'documents' && state.flow ? (
                  <div className="rounded-[24px] border border-[#DDE5EF] bg-white p-4 shadow-sm">
                    <p className="text-sm leading-6 text-[#434751]">
                      Si prefieres, también puedes escribir “lo cargaré después” o “no tengo este documento” y seguiré guiándote.
                    </p>
                  </div>
                ) : null}

                {state.stage === 'review' ? (
                  <div className="rounded-[24px] border border-[#DDE5EF] bg-white p-4 shadow-sm">
                    <p className="text-sm leading-6 text-[#434751]">
                      ¿Confirmas que la información es correcta?
                    </p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <ChoiceButton label="Editar información" tone="light" onClick={() => handleReviewEdit('information-policy')} />
                      <ChoiceButton label="Ajustar documentos" tone="light" onClick={() => handleReviewEdit('documents')} />
                      <ChoiceButton label="Sí, confirmar y enviar" tone="dark" onClick={handleConfirmSend} />
                    </div>
                  </div>
                ) : null}

                {state.stage === 'success' ? (
                  <div className="rounded-[24px] border border-[#DDE5EF] bg-white p-4 shadow-sm">
                    <p className="text-sm leading-6 text-[#434751]">Puedes descargar el resumen o iniciar otra conversación desde los botones del resultado.</p>
                  </div>
                ) : null}
              </div>
            </div>

                {!isWelcomeEmpty ? (
              <ChatComposer
                value={state.draft}
                onChange={(value) => dispatch({ type: 'SET_DRAFT', value })}
                onSend={handleComposerSend}
                onAttach={(files) => {
                  if (isFormActive || !state.flow) return;
                  const targetDocument = state.documents.find((document) => document.status === 'pending') ?? state.documents[0];
                  if (targetDocument) handleDocumentUpload(targetDocument.id, files);
                }}
                placeholder={isFormActive ? 'Responde en el chat' : 'Escribe tu mensaje o selecciona una opción'}
                suggestions={
                  state.documentDraft.status === 'choosing_document'
                    ? formDocumentSelectionOptions
                    : state.documentDraft.status === 'collecting'
                      ? formComposerInterruptions
                      : state.documentDraft.status === 'reviewing'
                        ? formReviewOptions
                        : state.documentDraft.status === 'editing' && !state.documentDraft.editingFieldId
                          ? (formDefinition?.fields ?? []).map((fieldItem) => ({
                              id: fieldItem.id,
                              label: getFormFieldLabel(fieldItem)
                            }))
                          : state.stage === 'claim'
                            ? getClaimQuickReplies(state.flow, state.claimCorrectionField)
                            : isInformationStage(state.stage)
                              ? informationQuickReplies
                              : chatbotQuickActions
                }
                onSuggestion={handleComposerSuggestion}
              />
            ) : null}
          </div>

          {!isWelcomeEmpty ? (
            <ChatContextPanel
              collapsed={state.contextCollapsed}
              onToggleCollapsed={() => dispatch({ type: 'SET_CONTEXT_COLLAPSED', value: !state.contextCollapsed })}
              flow={state.flow}
              stage={state.stage}
              progressIndex={progressIndex}
              documents={state.documents}
              alerts={activeAlerts}
              policy={state.policy}
              person={state.person}
              contact={state.contact}
              claimant={state.claimant}
            />
          ) : null}
        </div>
      </section>

      <ConfirmationModal
        open={showExitConfirm}
        title="¿Quieres salir del chatbot?"
        description="Volverás a la pantalla inicial del portal para elegir otro trámite."
        confirmLabel="Salir"
        cancelLabel="Continuar aquí"
        onConfirm={() => {
          setShowExitConfirm(false);
          handleExitChatbot();
        }}
        onCancel={() => setShowExitConfirm(false)}
      />
    </div>
  );
}
