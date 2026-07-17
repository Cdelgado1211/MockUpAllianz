import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import ChatComposer from './ChatComposer';
import ChatContextPanel from './ChatContextPanel';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatSidebar from './ChatSidebar';
import ConfirmationModal from './ConfirmationModal';
import DocumentCard from './DocumentCard';
import ValidationProcessingScreen from './ValidationProcessingScreen';
import ValidationResultsPanel from './ValidationResultsPanel';
import ValidationSummary from './ValidationSummary';
import ValidationDocumentCard from './ValidationDocumentCard';
import FormField from './FormField';
import { AlertIcon, ArrowRightIcon, CheckIcon, DownloadIcon, SparkIcon } from './Icon';
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

const flowLabels = {
  reembolso: 'Reembolso',
  cirugia_programada: 'Cirugía Programada'
};

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
    activeDocumentId: null
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
    showResetPrompt: false
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
    return buildChatbotAlerts(flow, scenario).map((alert) => ({ ...alert }));
  }

  if (flow === 'cirugia_programada' && scenario === 'flow') {
    return buildChatbotAlerts(flow, scenario).map((alert) => ({ ...alert }));
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

function getStageCopy(stage, entryMode, flow) {
  const flowLabel = flow ? flowLabels[flow] : 'el trámite';

  if (stage === 'welcome') {
    return {
      title: 'Hola, soy el asistente de Siniestros GMM de Allianz México.',
      description: 'Puedo ayudarte a conocer los requisitos o a iniciar un trámite.'
    };
  }

  if (stage === 'flow-intro') {
    return entryMode === 'info'
      ? {
          title: `Te ayudaré a revisar la información de ${flowLabel}.`,
          description: 'Primero selecciona el trámite que necesitas para mostrarte los requisitos y formatos.'
        }
      : {
          title: `Vamos a iniciar tu trámite de ${flowLabel}.`,
          description: 'Te mostraré los documentos y después iremos capturando la información necesaria.'
        };
  }

  if (stage === 'documents') {
    return {
      title: `Carguemos tus documentos de ${flowLabel}.`,
      description: 'Adjunta los archivos requeridos desde cada tarjeta. Puedes continuar aunque algunos queden pendientes.'
    };
  }

  if (stage === 'validation-processing') {
    return {
      title: 'Estamos validando tus documentos',
      description: 'Revisamos legibilidad, coincidencias y observaciones antes de continuar con tu trámite.'
    };
  }

  if (stage === 'validation-results') {
    return {
      title: 'Revisa los resultados de validación',
      description: 'Los conteos y observaciones se basan en el estado actual de tus documentos.'
    };
  }

  if (stage === 'information-policy' || stage === 'information-requester' || stage === 'information-contact') {
    return {
      title: 'Completemos tus datos de información',
      description: 'Los campos detectados siguen siendo editables para que puedas corregirlos si es necesario.'
    };
  }

  if (stage === 'claim') {
    return {
      title: 'Captura la información de la reclamación',
      description: 'Los datos precargados siguen siendo editables y se usan para preparar la siguiente etapa.'
    };
  }

  if (stage === 'review') {
    return {
      title: 'Revisemos el resumen antes de enviar',
      description: 'Verifica que todo esté correcto y usa los accesos rápidos para corregir lo que necesites.'
    };
  }

  if (stage === 'submitting') {
    return {
      title: 'Enviando trámite',
      description: 'Estamos preparando tu solicitud para continuar con la confirmación final.'
    };
  }

  if (stage === 'success') {
    return {
      title: 'Tu solicitud fue recibida correctamente',
      description: 'Puedes descargar el resumen o iniciar una nueva conversación cuando lo necesites.'
    };
  }

  if (stage === 'out-of-scope') {
    return {
      title: 'Esta consulta requiere atención adicional',
      description: 'Puedo orientarte sobre los canales disponibles o regresar al menú principal.'
    };
  }

  return {
    title: 'Asistente de Siniestros GMM',
    description: 'Selecciona una ruta para comenzar.'
  };
}

function ChoiceButton({ label, onClick, tone = 'blue' }) {
  const styles = {
    blue: 'border-[#C7D8F1] bg-white text-[#003781] hover:bg-[#F4F8FF]',
    dark: 'border-[#003781] bg-[#003781] text-white hover:bg-[#002356]',
    light: 'border-[#DDE5EF] bg-white text-[#434751] hover:bg-[#F7FAFC]'
  };

  return (
    <button
      type="button"
      className={`focus-ring inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 ${styles[tone]}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function FormatLibraryCard({ flow, onDownload, onDownloadAll }) {
  const guide = flow ? chatbotFlowGuides[flow] : null;
  const flowDocs = flow ? getChatbotFlowDocuments(flow) : [];

  return (
    <section className="rounded-[24px] border border-[#E0E6ED] bg-white p-5 shadow-sm sm:p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#006494]">Formatos disponibles</p>
      <h3 className="mt-2 text-[22px] font-semibold leading-7 text-[#181C1E]">Descarga simulada de formatos</h3>
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
  const requirements = guide?.requirements ?? [];
  const titleCopy = getStageCopy('flow-intro', entryMode, flow);

  return (
    <section className="rounded-[24px] border border-[#E0E6ED] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#006494]">Guía inicial</p>
          <h3 className="mt-2 text-[22px] font-semibold leading-7 text-[#181C1E]">{titleCopy.title}</h3>
          <p className="mt-2 text-sm leading-6 text-[#434751]">{titleCopy.description}</p>
        </div>

        <div className="rounded-full bg-[#EFF6FF] px-4 py-2 text-sm font-semibold text-[#003781]">
          {guide?.contactPhone ? `Teléfono de apoyo: ${guide.contactPhone}` : 'Asistente virtual'}
        </div>
      </div>

      {!flow ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="focus-ring rounded-[20px] border border-[#DDE5EF] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:bg-[#F7FAFC]"
            onClick={() => onFlowSelect('reembolso')}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#006494]">Reembolso</p>
            <p className="mt-2 text-sm leading-6 text-[#434751]">Solicita el pago de gastos médicos de forma digital.</p>
          </button>
          <button
            type="button"
            className="focus-ring rounded-[20px] border border-[#DDE5EF] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:bg-[#F7FAFC]"
            onClick={() => onFlowSelect('cirugia_programada')}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#006494]">Cirugía Programada</p>
            <p className="mt-2 text-sm leading-6 text-[#434751]">Programa la autorización de un procedimiento quirúrgico.</p>
          </button>
        </div>
      ) : (
        <>
          <div className="mt-5 rounded-[22px] border border-[#E0E6ED] bg-[#F7FAFC] p-4">
            <p className="text-sm font-semibold text-[#181C1E]">Documentos y recomendaciones</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {requirements.map((item) => (
                <li key={item} className="rounded-2xl border border-[#E0E6ED] bg-white px-3 py-3 text-sm leading-6 text-[#434751]">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
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
          {person.relationship === 'Otro' ? (
            <p className="text-sm leading-6 text-[#434751]">
              <span className="font-semibold text-[#181C1E]">Parentesco:</span> {person.parentesco || 'Pendiente'}
            </p>
          ) : null}
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

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="focus-ring inline-flex items-center justify-center rounded-full border border-[#DDE5EF] bg-white px-5 py-2.5 text-sm font-semibold text-[#434751] transition hover:bg-[#F7FAFC]"
          onClick={() => onEditSection('documents')}
        >
          Ajustar documentos
        </button>
        <button
          type="button"
          className="focus-ring inline-flex items-center justify-center rounded-full bg-[#003781] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002356]"
          onClick={() => onEditSection('confirm')}
        >
          Sí, confirmar y enviar
        </button>
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
        scenario: action.scenario ?? (action.flow === 'cirugia_programada' ? 'flow' : 'blank'),
        documents: action.documents ?? buildChatbotDocuments(action.flow, action.scenario ?? (action.flow === 'cirugia_programada' ? 'flow' : 'blank')),
        alerts: action.alerts ?? [],
        ignoredAlerts: [],
        acceptedAlerts: [],
        validationPhase: 'idle',
        validationStageIndex: 0,
        validationCompleted: false,
        reviewConfirmed: false,
        activeDocumentId: null
      };
    case 'SET_MESSAGES':
      return { ...state, messages: action.value };
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
    case 'SET_CLAIMANT_FIELD':
      return { ...state, claimant: { ...state.claimant, [action.field]: action.value } };
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
  const messageSeenRef = useRef(0);

  const progressIndex = useMemo(() => getProgressIndex(state.stage), [state.stage]);
  const summary = useMemo(() => buildSummary(state.documents, state.alerts.filter((alert) => !state.ignoredAlerts.includes(alert.id) && alert.status === 'active')), [state.documents, state.alerts, state.ignoredAlerts]);
  const activeAlerts = useMemo(() => state.alerts.filter((alert) => !state.ignoredAlerts.includes(alert.id) && alert.status === 'active'), [state.alerts, state.ignoredAlerts]);
  const validatedDocuments = useMemo(() => getValidatedDocuments(state.documents), [state.documents]);
  const reviewDocuments = useMemo(() => getReviewDocuments(state.documents), [state.documents]);
  const visibleFlowDocuments = useMemo(() => (state.flow ? getChatbotFlowDocuments(state.flow) : []), [state.flow]);
  const claimErrors = useMemo(() => getClaimErrors(state.claimant, state.flow), [state.claimant, state.flow]);
  const contactErrors = useMemo(() => getContactErrors(state.contact), [state.contact]);
  const canContinueInfo = !contactErrors.mobilePhone && !contactErrors.email && !contactErrors.emailConfirmation && !contactErrors.phoneLandline && !(state.person.relationship === 'Otro' && (!String(state.person.parentesco ?? '').trim() || !state.person.firstName.trim() || !state.person.paternalLastName.trim() || !state.person.maternalLastName.trim()));
  const canContinueClaim = !claimErrors.sinisterNumber && !claimErrors.attentionPlace && !claimErrors.tramiteType && !claimErrors.observations;

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
    };
  }, []);

  useEffect(() => {
    if (state.stage !== 'validation-processing') return undefined;

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
    dispatch({ type: 'RESET_PRESET', presetId });
  };

  const appendUserAndAssistant = (userText, assistantText) => {
    dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(userText) });
    if (assistantText) dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(assistantText) });
  };

  const handleIntent = (intent) => {
    const item = chatbotQuickActions.find((option) => option.id === intent);
    if (!item) return;

    appendUserAndAssistant(item.label);

    if (intent === 'info') {
      dispatch({ type: 'SET_ENTRY_MODE', value: 'info' });
      dispatch({ type: 'SET_STAGE', value: 'flow-intro' });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Claro. Primero dime si necesitas información de Reembolso o de Cirugía Programada.') });
      return;
    }

    if (intent === 'start') {
      dispatch({ type: 'SET_ENTRY_MODE', value: 'start' });
      dispatch({ type: 'SET_STAGE', value: 'flow-intro' });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Perfecto. Primero selecciona el trámite que deseas realizar.') });
      return;
    }

    if (intent === 'formats') {
      dispatch({ type: 'SET_ENTRY_MODE', value: 'start' });
      dispatch({ type: 'SET_STAGE', value: state.flow ? 'formats' : 'flow-intro' });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Te mostraré los formatos disponibles para el trámite.') });
      return;
    }

    if (intent === 'status' || intent === 'help') {
      dispatch({ type: 'SET_STAGE', value: 'out-of-scope' });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Puedo orientarte sobre los trámites o mostrarte los canales de apoyo disponibles.') });
    }
  };

  const handleFlowSelect = (flow) => {
    const label = flowLabels[flow];
    dispatch({ type: 'SET_FLOW', flow, scenario: flow === 'cirugia_programada' ? 'flow' : 'blank' });
    dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(label) });
    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(`Perfecto. Vamos a revisar los requisitos de ${label}.`) });
    dispatch({ type: 'SET_STAGE', value: 'flow-intro' });
  };

  const handleGuideContinue = (nextStage) => {
    if (nextStage === 'documents') {
      dispatch({ type: 'ADD_MESSAGE', message: createUserMessage('Ya tengo los documentos.') });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Excelente. Ahora puedes cargarlos desde las tarjetas de cada documento.') });
      dispatch({ type: 'SET_STAGE', value: 'documents' });
      return;
    }

    if (nextStage === 'validation') {
      dispatch({ type: 'SET_STAGE', value: 'validation-processing' });
      dispatch({ type: 'ADD_MESSAGE', message: createUserMessage('Continuar sin descargar.') });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Continuamos con la carga y validación de tus documentos.') });
      return;
    }

    if (nextStage === 'info-only') {
      dispatch({ type: 'ADD_MESSAGE', message: createUserMessage('No, solo necesitaba información.') });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Perfecto. Aquí estaré cuando quieras iniciar el trámite o descargar formatos.') });
      dispatch({ type: 'SET_STAGE', value: 'welcome' });
      return;
    }

    if (nextStage === 'another-tramite') {
      dispatch({ type: 'ADD_MESSAGE', message: createUserMessage('Consultar otro trámite.') });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Claro. Selecciona una nueva intención cuando quieras continuar.') });
      dispatch({ type: 'SET_STAGE', value: 'welcome' });
      return;
    }

    if (nextStage === 'start-now') {
      dispatch({ type: 'ADD_MESSAGE', message: createUserMessage('Sí, iniciar.') });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Muy bien, comenzamos con la carga documental.') });
      dispatch({ type: 'SET_STAGE', value: 'documents' });
    }
  };

  const handleDownload = (document) => {
    dispatch({ type: 'SET_DOWNLOADED_FORMATS', value: [...state.downloadedFormats, document.id] });
    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(`Descarga simulada preparada para ${document.label}.`) });
  };

  const handleDownloadAll = () => {
    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Preparé la descarga simulada de todos los formatos disponibles para este trámite.') });
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

    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(`Recibí ${targetDocument.label}. Lo estoy procesando ahora mismo.`) });

    if (uploadTimersRef.current[documentId]) clearTimeout(uploadTimersRef.current[documentId]);
    uploadTimersRef.current[documentId] = window.setTimeout(() => {
      const finalStatus =
        state.scenario === 'review' && state.flow === 'reembolso' && documentId === 'informe'
          ? 'requires_review'
          : 'validated';
      dispatch({
        type: 'SET_DOCUMENT_STATUS',
        documentId,
        status: finalStatus,
        validationNote: finalStatus === 'validated' ? 'Documento validado automáticamente' : 'Nombre con diferencia detectada'
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
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('No hay documentos cargados todavía. Podemos continuar con la información y volver después si lo necesitas.') });
      dispatch({ type: 'SET_STAGE', value: 'information-policy' });
      return;
    }

    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Perfecto. Ahora voy a validar lo que ya cargaste.') });
    dispatch({ type: 'SET_STAGE', value: 'validation-processing' });
    dispatch({ type: 'SET_VALIDATION_PHASE', value: 'processing' });
    dispatch({ type: 'SET_VALIDATION_STAGE_INDEX', value: 0 });
  };

  const handleInfoSave = (nextStage) => {
    dispatch({ type: 'SET_STAGE', value: nextStage });
  };

  const handleClaimContinue = () => {
    if (!canContinueClaim) return;
    dispatch({ type: 'SET_STAGE', value: 'review' });
  };

  const handleReviewEdit = (section) => {
    if (section === 'documents') {
      dispatch({ type: 'SET_STAGE', value: 'documents' });
      return;
    }
    if (section === 'information-policy') {
      dispatch({ type: 'SET_STAGE', value: 'information-policy' });
      return;
    }
    if (section === 'information-requester') {
      dispatch({ type: 'SET_STAGE', value: 'information-requester' });
      return;
    }
    if (section === 'information-contact') {
      dispatch({ type: 'SET_STAGE', value: 'information-contact' });
      return;
    }
    if (section === 'claim') {
      dispatch({ type: 'SET_STAGE', value: 'claim' });
      return;
    }
    if (section === 'validation-results') {
      dispatch({ type: 'SET_STAGE', value: 'validation-results' });
    }
  };

  const handleConfirmSend = () => {
    dispatch({ type: 'SET_STAGE', value: 'submitting' });
    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Estoy enviando tu trámite de forma simulada. Esto solo toma un momento.') });
    window.setTimeout(() => {
      dispatch({ type: 'SET_STAGE', value: 'success' });
      dispatch({ type: 'SET_REVIEW_CONFIRMED', value: true });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Tu solicitud fue recibida correctamente.') });
    }, 1200);
  };

  const handleComposerSend = () => {
    const text = String(state.draft ?? '').trim();
    if (!text) return;

    dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(text) });
    dispatch({ type: 'SET_DRAFT', value: '' });

    const normalized = text.toLowerCase();
    if (/reembolso|devoluci[oó]n|factura|gastos/.test(normalized)) {
      dispatch({ type: 'SET_STAGE', value: 'flow-intro' });
      dispatch({ type: 'SET_ENTRY_MODE', value: 'start' });
      dispatch({ type: 'SET_FLOW', flow: 'reembolso', scenario: 'blank' });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Perfecto, vamos a preparar una solicitud de Reembolso.') });
      return;
    }

    if (/cirug|operaci[oó]n|autorizaci[oó]n/.test(normalized)) {
      dispatch({ type: 'SET_STAGE', value: 'flow-intro' });
      dispatch({ type: 'SET_ENTRY_MODE', value: 'start' });
      dispatch({ type: 'SET_FLOW', flow: 'cirugia_programada', scenario: 'flow' });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Perfecto, te ayudaré con Cirugía Programada.') });
      return;
    }

    if (/requisit|document|formato/.test(normalized)) {
      dispatch({ type: 'SET_STAGE', value: 'flow-intro' });
      dispatch({ type: 'SET_ENTRY_MODE', value: 'info' });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Claro. Indícame si quieres información de Reembolso o Cirugía Programada.') });
      return;
    }

    if (/estatus/.test(normalized)) {
      dispatch({ type: 'SET_STAGE', value: 'out-of-scope' });
      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Todavía no tengo una consulta de estatus funcional en esta versión del chatbot. Puedo orientarte con un trámite o mostrarte ayuda externa.') });
      return;
    }

    dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Puedo ayudarte a iniciar Reembolso, Cirugía Programada o mostrarte requisitos. Selecciona una opción rápida si prefieres.') });
  };

  const handleComposerSuggestion = (item) => {
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
      return (
        <section className="flex min-h-[calc(100vh-260px)] flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-[820px] text-center">
            <h2 className="mx-auto max-w-4xl text-[clamp(2.6rem,4vw,3.9rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-[#181C1E]">
              ¿Cómo puedo ayudarte hoy?
            </h2>
            <p className="mx-auto mt-5 max-w-[680px] text-[clamp(1rem,1.2vw,1.125rem)] leading-7 text-[#434751]">
              Puedo orientarte sobre reembolsos, cirugía programada, documentos y el estatus de tu trámite.
            </p>
          </div>

          <div className="mt-10 w-full">
            <div className="mx-auto w-full max-w-[760px]">
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
                suggestions={chatbotQuickActions}
                onSuggestion={handleComposerSuggestion}
                variant="hero"
              />
            </div>
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
              dispatch({ type: 'ADD_MESSAGE', message: createUserMessage(flowLabels[flow]) });
              dispatch({ type: 'SET_FLOW', flow, scenario: flow === 'cirugia_programada' ? 'flow' : 'blank' });
              dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(`Perfecto. Ya tengo seleccionada la ruta de ${flowLabels[flow]}.`) });
            }}
            onContinue={() => handleGuideContinue(state.entryMode === 'info' ? 'start-now' : 'documents')}
            onInfoOnly={() => handleGuideContinue('info-only')}
            onOtherFlow={() => handleGuideContinue('another-tramite')}
            onFormats={() => {
              dispatch({ type: 'SET_STAGE', value: 'formats' });
              dispatch({ type: 'ADD_MESSAGE', message: createUserMessage('Descargar formatos') });
              dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Te muestro la biblioteca de formatos simulados para este trámite.') });
            }}
          />
        </section>
      );
    }

    if (state.stage === 'formats') {
      return (
        <section className="space-y-4">
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
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#006494]">Carga documental</p>
                <h3 className="mt-2 text-[22px] font-semibold leading-7 text-[#181C1E]">
                  {state.flow ? flowLabels[state.flow] : 'Documentos del trámite'}
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#434751]">
                  {state.flow
                    ? 'Adjunta los documentos que te solicite cada tarjeta. Puedes continuar con la información cuando lo necesites.'
                    : 'Selecciona un trámite para mostrar los documentos correspondientes.'}
                </p>
              </div>
              <div className="rounded-full bg-[#EFF6FF] px-4 py-2 text-sm font-semibold text-[#003781]">
                {summary.processed} documentos cargados
              </div>
            </div>

            {state.flow ? (
              <>
                <div className="mt-5 rounded-[22px] border border-[#E0E6ED] bg-[#F7FAFC] p-4">
                  <p className="text-sm font-semibold text-[#181C1E]">Documentos requeridos</p>
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
                      dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('De acuerdo. Vamos a continuar con la información del trámite.') });
                      dispatch({ type: 'SET_STAGE', value: 'information-policy' });
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
      return <ValidationProcessingScreen stageIndex={state.validationStageIndex} progress={Math.max(12, (state.validationStageIndex + 1) * 20)} />;
    }

    if (state.stage === 'validation-results') {
      return (
        <div className="space-y-4">
          <ValidationSummary summary={summary} />
          <ValidationResultsPanel
            summary={summary}
            correctDocuments={validatedDocuments}
            reviewDocuments={reviewDocuments}
            alerts={activeAlerts}
            onResolveAlert={(alert) => {
              dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage(`Voy a llevarte al punto del flujo relacionado con: ${alert.field}.`) });
              dispatch({ type: 'SET_STAGE', value: 'information-policy' });
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
              onClick={() => dispatch({ type: 'SET_STAGE', value: 'information-policy' })}
            >
              Continuar
            </button>
          </div>
        </div>
      );
    }

    if (state.stage === 'information-policy') {
      return (
        <InfoSectionCard
          title="Datos de la póliza"
          description="Mantén a la vista los datos principales del contrato. Los valores detectados siguen siendo editables."
          icon={<SparkIcon className="h-5 w-5" />}
        >
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

            {state.person.relationship === 'Otro' ? (
              <FormField
                label="Parentesco"
                value={state.person.parentesco}
                onChange={(value) => dispatch({ type: 'SET_PERSON_FIELD', field: 'parentesco', value })}
                helperText="Indica el parentesco de quien realiza el trámite."
              />
            ) : null}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              className="focus-ring inline-flex items-center justify-center rounded-full bg-[#003781] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002356]"
              onClick={() => {
                if (state.person.relationship === 'Otro' && !String(state.person.parentesco ?? '').trim()) return;
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
                dispatch({ type: 'ADD_MESSAGE', message: createAssistantMessage('Perfecto. Ahora podemos pasar a la información de la reclamación.') });
                dispatch({ type: 'SET_STAGE', value: 'claim' });
              }}
            >
              Guardar y continuar
            </button>
          </div>
        </InfoSectionCard>
      );
    }

    if (state.stage === 'claim') {
      return (
        <InfoSectionCard
          title="Información de la reclamación"
          description="Los datos precargados siguen siendo editables y se usan para preparar la siguiente etapa."
          icon={<PaymentsIcon className="h-5 w-5" />}
        >
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#181C1E]">Tipo de reclamación</p>
              <div className="flex flex-wrap gap-2">
                <ToggleChoice
                  value="Inicial"
                  selected={state.claimant.type === 'Inicial'}
                  onSelect={() => {
                    dispatch({ type: 'SET_CLAIMANT_FIELD', field: 'type', value: 'Inicial' });
                    dispatch({ type: 'SET_CLAIMANT_FIELD', field: 'knowsSinisterNumber', value: 'No' });
                    dispatch({ type: 'SET_CLAIMANT_FIELD', field: 'sinisterNumber', value: '' });
                  }}
                />
                <ToggleChoice
                  value="Complemento"
                  selected={state.claimant.type === 'Complemento'}
                  onSelect={() => dispatch({ type: 'SET_CLAIMANT_FIELD', field: 'type', value: 'Complemento' })}
                />
              </div>
            </div>

            {state.claimant.type === 'Complemento' ? (
              <div className="space-y-3 rounded-[22px] border border-[#E0E6ED] bg-[#F7FAFC] p-4">
                <p className="text-sm font-semibold text-[#181C1E]">¿Conoces el número de siniestro?</p>
                <div className="flex flex-wrap gap-2">
                  <ToggleChoice
                    value="Sí"
                    selected={state.claimant.knowsSinisterNumber === 'Sí'}
                    onSelect={() => dispatch({ type: 'SET_CLAIMANT_FIELD', field: 'knowsSinisterNumber', value: 'Sí' })}
                  />
                  <ToggleChoice
                    value="No"
                    selected={state.claimant.knowsSinisterNumber === 'No'}
                    onSelect={() => {
                      dispatch({ type: 'SET_CLAIMANT_FIELD', field: 'knowsSinisterNumber', value: 'No' });
                      dispatch({ type: 'SET_CLAIMANT_FIELD', field: 'sinisterNumber', value: '' });
                    }}
                  />
                </div>
                {state.claimant.knowsSinisterNumber === 'Sí' ? (
                  <FormField
                    label="Número de siniestro"
                    value={state.claimant.sinisterNumber}
                    onChange={(value) => dispatch({ type: 'SET_CLAIMANT_FIELD', field: 'sinisterNumber', value })}
                    error={claimErrors.sinisterNumber}
                  />
                ) : null}
              </div>
            ) : null}

            {state.flow === 'cirugia_programada' ? (
              <>
                <div>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#181C1E]">Lugar de atención</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {['Trámite Nacional', 'Trámite Internacional'].map((option) => (
                      <ToggleChoice
                        key={option}
                        value={option}
                        selected={state.claimant.attentionPlace === option}
                        onSelect={() => dispatch({ type: 'SET_CLAIMANT_FIELD', field: 'attentionPlace', value: option })}
                      />
                    ))}
                  </div>
                  {claimErrors.attentionPlace ? <p className="mt-2 text-xs font-semibold text-[#D93025]">{claimErrors.attentionPlace}</p> : null}
                </div>

                <div>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.12em] text-[#181C1E]">Tipo de trámite</span>
                    <select
                      className="focus-ring w-full rounded-2xl border border-[#DDE5EF] bg-white px-4 py-3 text-sm text-[#181C1E]"
                      value={state.claimant.tramiteType}
                      onChange={(event) => dispatch({ type: 'SET_CLAIMANT_FIELD', field: 'tramiteType', value: event.target.value })}
                    >
                      <option value="">--Seleccione una opción--</option>
                      <option value="Cirugía">Cirugía</option>
                      <option value="Medicamentos">Medicamentos</option>
                      <option value="Estudios">Estudios</option>
                      <option value="Rehabilitación">Rehabilitación</option>
                      <option value="Enfermería y Home Care">Enfermería y Home Care</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </label>
                  {claimErrors.tramiteType ? <p className="mt-2 text-xs font-semibold text-[#D93025]">{claimErrors.tramiteType}</p> : null}
                </div>

                {state.claimant.tramiteType === 'Otros' ? (
                  <FormField
                    label="Observaciones"
                    value={state.claimant.observations}
                    onChange={(value) => dispatch({ type: 'SET_CLAIMANT_FIELD', field: 'observations', value })}
                    error={claimErrors.observations}
                    helperText="Este campo es obligatorio cuando seleccionas Otros."
                  />
                ) : null}
              </>
            ) : (
              <>
                <InlineFormGrid columns="lg:grid-cols-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.12em] text-[#181C1E]">Moneda</span>
                    <select
                      className="focus-ring w-full rounded-2xl border border-[#DDE5EF] bg-white px-4 py-3 text-sm text-[#181C1E]"
                      value={state.claimant.currency}
                      onChange={(event) => dispatch({ type: 'SET_CLAIMANT_FIELD', field: 'currency', value: event.target.value })}
                    >
                      <option value="Pesos">Pesos</option>
                      <option value="Dólares">Dólares</option>
                      <option value="Euros">Euros</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </label>
                  <FormField
                    label="Monto reclamado"
                    value={state.claimant.claimedAmount}
                    onChange={(value) => dispatch({ type: 'SET_CLAIMANT_FIELD', field: 'claimedAmount', value })}
                    helperText="Puedes corregir el monto si el valor detectado no es correcto."
                  />
                  <FormField
                    label="Cantidad de recibos o facturas"
                    value={state.claimant.receiptsCount}
                    onChange={(value) => dispatch({ type: 'SET_CLAIMANT_FIELD', field: 'receiptsCount', value })}
                    helperText="Número total de comprobantes a reembolsar."
                  />
                </InlineFormGrid>
              </>
            )}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              className={`focus-ring inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                canContinueClaim ? 'bg-[#003781] text-white hover:bg-[#002356]' : 'cursor-not-allowed bg-[#E9EEF5] text-[#8B94A3]'
              }`}
              disabled={!canContinueClaim}
              onClick={handleClaimContinue}
            >
              Guardar y continuar
            </button>
          </div>
        </InfoSectionCard>
      );
    }

    if (state.stage === 'review') {
      return (
        <div className="space-y-4">
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
              <h3 className="mt-1 text-[22px] font-semibold leading-7 text-[#181C1E]">Estamos enviando tu trámite</h3>
              <p className="mt-2 text-sm leading-6 text-[#434751]">Procesamos la solicitud de forma simulada antes de mostrar la confirmación final.</p>
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
        onSelectPreset={(presetId) => resetConversation(presetId)}
        onNewConversation={() => resetConversation('welcome')}
        onGoHome={() => resetConversation('welcome')}
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
                {state.messages.map((message) => (
                  <ChatMessage key={message.id} role={message.role} text={message.text} timeLabel={message.timeLabel} />
                ))}

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
                  if (!state.flow) return;
                  const targetDocument = state.documents.find((document) => document.status === 'pending') ?? state.documents[0];
                  if (targetDocument) handleDocumentUpload(targetDocument.id, files);
                }}
                placeholder="Escribe tu mensaje o selecciona una opción"
                suggestions={chatbotQuickActions}
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
