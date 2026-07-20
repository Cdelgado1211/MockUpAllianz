import { createEmptyDocumentState, demoAlerts, demoDocumentState, demoExtraction, documentCategories, allowedFormats } from './mockReembolso';

export const chatbotHistoryItems = [
  {
    id: 'welcome',
    title: 'Nueva conversación',
    description: 'Empieza desde cero con una guía limpia.',
    flow: null,
    scenario: 'welcome'
  },
  {
    id: 'reembolso-review',
    title: 'Reembolso · revisión',
    description: 'Ejemplo con documentos validados y observaciones.',
    flow: 'reembolso',
    scenario: 'review'
  },
  {
    id: 'reembolso-success',
    title: 'Reembolso · exitoso',
    description: 'Caso completo listo para confirmación.',
    flow: 'reembolso',
    scenario: 'success'
  },
  {
    id: 'cirugia-programada',
    title: 'Cirugía programada',
    description: 'Guía conversacional para cirugía programada.',
    flow: 'cirugia_programada',
    scenario: 'flow'
  },
  {
    id: 'solo-informacion',
    title: 'Solo información',
    description: 'Ruta de consulta y descarga de formatos.',
    flow: null,
    scenario: 'info'
  },
  {
    id: 'fuera-de-alcance',
    title: 'Consulta externa',
    description: 'Mensaje orientado a ayuda externa.',
    flow: null,
    scenario: 'out'
  }
];

export const chatbotQuickActions = [
  { id: 'info', label: 'Conocer requisitos' },
  { id: 'start', label: 'Iniciar un trámite' },
  { id: 'formats', label: 'Descargar formatos' },
  { id: 'status', label: 'Consultar estatus' },
  { id: 'help', label: 'Necesito ayuda' }
];

export const chatbotFlowDocuments = {
  reembolso: ['aviso', 'solicitud', 'informe', 'identificacion', 'domicilio', 'gastos', 'estudios', 'historia', 'soporte'],
  cirugia_programada: ['aviso', 'informe', 'domicilio', 'gastos', 'estudios', 'soporte']
};

export const chatbotFormats = allowedFormats;

export const chatbotFlowGuides = {
  reembolso: {
    title: 'Reembolso',
    summary:
      'Te acompaño paso a paso para reunir los documentos, revisar la información y continuar con tu solicitud.',
    requirements: [
      'Aviso de Accidente o Enfermedad.',
      'Solicitud de Reembolso.',
      'Informe Médico.',
      'Identificación oficial del titular.',
      'Interpretación de estudios.',
      'Historia clínica.',
      'Comprobante de domicilio no mayor a 3 meses.',
      'Comprobantes de gastos o facturas.'
    ],
    recommendation:
      'Si ya tienes tus formatos, podemos empezar cuando tú quieras y yo te iré diciendo qué sigue.',
    contactPhone: '55 5201 3116'
  },
  cirugia_programada: {
    title: 'Cirugía Programada',
    summary:
      'Te iré guiando con lo necesario para programar la atención y dejar todo listo sin complicaciones.',
    requirements: [
      'Aviso de Accidente o Enfermedad.',
      'Informe Médico actualizado.',
      'Interpretación de estudios.',
      'Comprobante de domicilio.',
      'Comprobantes de gastos.',
      'Otros documentos de soporte.'
    ],
    recommendation:
      'Si el tipo de trámite es Otros, te pediré una observación breve para poder seguir.',
    contactPhone: '55 5201 3181'
  }
};

const baseValidationCounts = {
  processed: 6,
  validated: 4,
  review: 1,
  pending: 3,
  alerts: 6
};

function makeFile(name, size, type) {
  return {
    id: `${name}-${size}-${type}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    size,
    type
  };
}

function cloneDoc(document, overrides = {}) {
  return {
    ...document,
    ...overrides,
    files: (overrides.files ?? document.files ?? []).map((file) => ({ ...file }))
  };
}

function getFlowDocList(flow) {
  const ids = chatbotFlowDocuments[flow] ?? [];
  return documentCategories.filter((document) => ids.includes(document.id));
}

// Escenario de demostración equivalente al formulario del portal: el usuario
// llega con algunos documentos ya adjuntos y con resultados mixtos de revisión.
const mixedDocumentFixtures = {
  reembolso: {
    aviso: { name: 'aviso-accidente.pdf', size: '1.2 MB', type: 'PDF', status: 'validated', note: 'Documento validado automáticamente.' },
    solicitud: { name: 'solicitud-reembolso.pdf', size: '842 KB', type: 'PDF', status: 'validated', note: 'Formato validado correctamente.' },
    informe: { name: 'informe-medico.pdf', size: '1.6 MB', type: 'PDF', status: 'requires_review', note: 'El nombre identificado presenta una diferencia frente al Aviso de Accidente.' },
    identificacion: { name: 'identificacion-titular.jpg', size: '513 KB', type: 'JPG', status: 'validated', note: 'Identidad confirmada.' },
    domicilio: { name: 'comprobante-domicilio.pdf', size: '768 KB', type: 'PDF', status: 'illegible', note: 'No fue posible leer con claridad la fecha de emisión del comprobante.' },
    gastos: { name: 'factura-gastos.xml', size: '212 KB', type: 'XML', status: 'validated', note: 'Factura validada correctamente.' }
  },
  cirugia_programada: {
    aviso: { name: 'aviso-accidente.pdf', size: '1.2 MB', type: 'PDF', status: 'validated', note: 'Documento validado automáticamente.' },
    informe: { name: 'informe-medico.pdf', size: '1.4 MB', type: 'PDF', status: 'requires_review', note: 'La firma del médico tratante requiere una revisión adicional.' },
    domicilio: { name: 'comprobante-domicilio.pdf', size: '718 KB', type: 'PDF', status: 'validated', note: 'Documento validado automáticamente.' },
    gastos: { name: 'presupuesto-honorarios.pdf', size: '486 KB', type: 'PDF', status: 'validated', note: 'Documento validado automáticamente.' },
    estudios: { name: 'interpretacion-estudios.pdf', size: '931 KB', type: 'PDF', status: 'illegible', note: 'La interpretación de estudios no se pudo leer con claridad.' },
    soporte: { name: 'documento-soporte.pdf', size: '324 KB', type: 'PDF', status: 'validated', note: 'Documento validado automáticamente.' }
  }
};

export function buildChatbotDocuments(flow, scenario = 'blank') {
  const visibleDocuments = getFlowDocList(flow);

  if (scenario === 'review' && flow === 'reembolso') {
    return demoDocumentState
      .filter((document) => visibleDocuments.some((visible) => visible.id === document.id))
      .map((document) => cloneDoc(document));
  }

  if (scenario === 'success') {
    return visibleDocuments.map((document) =>
      cloneDoc(document, {
        files: [makeFile(`${document.id}-demo.pdf`, '1.1 MB', 'PDF')],
        status: 'validated',
        validationNote: 'Documento validado'
      })
    );
  }

  if (scenario === 'mixed') {
    const fixtures = mixedDocumentFixtures[flow] ?? {};

    return visibleDocuments.map((document) => {
      const fixture = fixtures[document.id];

      if (!fixture) {
        return cloneDoc({ ...document, files: [], status: 'pending', validationNote: 'Pendiente' });
      }

      return cloneDoc(document, {
        files: [makeFile(fixture.name, fixture.size, fixture.type)],
        status: fixture.status,
        validationNote: fixture.note
      });
    });
  }

  return visibleDocuments.map((document) => cloneDoc({ ...document, files: [], status: 'pending', validationNote: 'Pendiente' }));
}

export function buildChatbotAlerts(flow, scenario = 'blank') {
  if (scenario === 'review' && flow === 'reembolso') {
    return demoAlerts.map((alert) => ({ ...alert }));
  }

  if (scenario === 'out') {
    return [];
  }

  return [];
}

export function createChatbotPreset(presetId = 'welcome') {
  const preset = chatbotHistoryItems.find((item) => item.id === presetId) ?? chatbotHistoryItems[0];
  const flow = preset.flow;
  const scenario = preset.scenario;

  return {
    presetId: preset.id,
    flow,
    stage:
      preset.id === 'reembolso-review'
        ? 'results'
        : preset.id === 'reembolso-success'
          ? 'success'
          : preset.id === 'cirugia-programada'
            ? 'flow-intro'
            : preset.id === 'solo-informacion'
              ? 'info'
              : preset.id === 'fuera-de-alcance'
                ? 'out-of-scope'
                : 'welcome',
    scenario,
    messages:
      preset.id === 'welcome'
        ? []
        : preset.id === 'reembolso-review'
          ? [
              { id: 'assistant-hello', role: 'assistant', text: 'Hola, soy tu asistente de Siniestros GMM de Allianz México.' },
              { id: 'user-reembolso', role: 'user', text: 'Quiero solicitar un reembolso.' },
              {
                id: 'assistant-reembolso',
                role: 'assistant',
                text: 'Perfecto, te ayudo con el trámite de Reembolso.'
              }
            ]
          : preset.id === 'reembolso-success'
            ? [
                { id: 'assistant-hello', role: 'assistant', text: 'Hola, soy tu asistente de Siniestros GMM de Allianz México.' },
                { id: 'user-reembolso', role: 'user', text: 'Quiero solicitar un reembolso.' },
                { id: 'assistant-reembolso', role: 'assistant', text: 'Perfecto, ya lo tengo listo para revisarlo contigo.' }
              ]
            : preset.id === 'cirugia-programada'
              ? [
                  { id: 'assistant-hello', role: 'assistant', text: 'Hola, soy tu asistente de Siniestros GMM de Allianz México.' },
                  { id: 'user-cirugia', role: 'user', text: 'Necesito una cirugía programada.' },
                  { id: 'assistant-cirugia', role: 'assistant', text: 'Perfecto, te acompaño con Cirugía Programada.' }
                ]
              : preset.id === 'solo-informacion'
                ? [
                    { id: 'assistant-hello', role: 'assistant', text: 'Hola, soy tu asistente de Siniestros GMM de Allianz México.' },
                    { id: 'user-info', role: 'user', text: 'Solo quiero información.' },
                    { id: 'assistant-info', role: 'assistant', text: 'Perfecto, te comparto solo lo esencial.' }
                  ]
                : [
                    { id: 'assistant-hello', role: 'assistant', text: 'Hola, soy tu asistente de Siniestros GMM de Allianz México.' },
                    { id: 'user-external', role: 'user', text: 'Necesito ayuda con una consulta externa.' },
                    { id: 'assistant-external', role: 'assistant', text: 'Esa consulta requiere apoyo adicional, pero puedo orientarte con los siguientes pasos.' }
                  ],
    policy: {
      ...demoExtraction.policy
    },
    person: {
      ...demoExtraction.person
    },
    contact: {
      phoneLandline: demoExtraction.person.phoneLandline,
      mobilePhone: demoExtraction.person.mobilePhone,
      email: demoExtraction.person.email,
      emailConfirmation: demoExtraction.person.emailConfirmation
    },
    claimant: {
      ...demoExtraction.claimant,
      observations: flow === 'cirugia_programada' ? '' : ''
    },
    documents: flow ? buildChatbotDocuments(flow, scenario) : [],
    alerts: flow ? buildChatbotAlerts(flow, scenario) : [],
    ignoredAlerts: [],
    acceptedAlerts: [],
    validationPhase: scenario === 'review' ? 'results' : 'idle',
    validationStageIndex: scenario === 'review' ? 4 : 0,
    validationCompleted: scenario === 'review',
    preloadedDocumentTraceAdded: false,
    reviewConfirmed: false,
    processingCount: baseValidationCounts.processed,
    validationSummary: baseValidationCounts,
    formats: chatbotFormats
  };
}

export function getChatbotFlowDocuments(flow) {
  return getFlowDocList(flow);
}

export function getChatbotProgressIndex(stage) {
  const map = {
    welcome: -1,
    info: 0,
    'flow-intro': 0,
    policy: 2,
    requester: 2,
    contact: 2,
    claim: 3,
    documents: 3,
    validation: 1,
    results: 1,
    review: 4,
    submitting: 4,
    success: 4,
    'out-of-scope': -1
  };

  return map[stage] ?? -1;
}
