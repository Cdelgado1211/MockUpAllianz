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
      'Podrás solicitar la devolución de gastos médicos con documentos institucionales, carga documental y validación automática.',
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
      'Si ya tienes tus formatos, puedes continuar y cargarlos en el mismo chat cuando el asistente te lo indique.',
    contactPhone: '55 5201 3116'
  },
  cirugia_programada: {
    title: 'Cirugía Programada',
    summary:
      'La programación requiere proveedores de red de Allianz, documentos clínicos actualizados y datos de la atención.',
    requirements: [
      'Aviso de Accidente o Enfermedad.',
      'Informe Médico actualizado.',
      'Interpretación de estudios.',
      'Comprobante de domicilio.',
      'Comprobantes de gastos.',
      'Otros documentos de soporte.'
    ],
    recommendation:
      'Si el tipo de trámite es Otros, el asistente te pedirá observaciones antes de continuar.',
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

  return visibleDocuments.map((document) => cloneDoc({ ...document, files: [], status: 'pending', validationNote: 'Pendiente' }));
}

export function buildChatbotAlerts(flow, scenario = 'blank') {
  if (scenario === 'review' && flow === 'reembolso') {
    return demoAlerts.map((alert) => ({ ...alert }));
  }

  if (scenario === 'out') {
    return [];
  }

  if (flow === 'cirugia_programada' && scenario === 'flow') {
    return [
      {
        id: 'surgery-alert-1',
        title: 'Falta capturar el lugar de atención',
        field: 'Lugar de atención',
        sourceDocument: 'Datos de reclamación',
        comparedDocument: 'Flujo de cirugía programada',
        reason: 'Aún no se selecciona la sede o el alcance de la atención.',
        recommendation: 'Selecciona si se trata de Trámite Nacional o Trámite Internacional.',
        severity: 'warning',
        defaultAction: 'Corregir dato',
        status: 'active'
      },
      {
        id: 'surgery-alert-2',
        title: 'El tipo de trámite es obligatorio',
        field: 'Tipo de trámite',
        sourceDocument: 'Datos de reclamación',
        comparedDocument: 'Flujo de cirugía programada',
        reason: 'El sistema necesita saber si se trata de cirugía, medicamentos, estudios u otros.',
        recommendation: 'Selecciona una opción para continuar con la captura.',
        severity: 'warning',
        defaultAction: 'Corregir dato',
        status: 'active'
      }
    ];
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
        ? [
            {
              id: 'assistant-hello',
              role: 'assistant',
              text: 'Hola, soy el asistente de Siniestros GMM de Allianz México. Puedo ayudarte a conocer los requisitos o a iniciar un trámite.'
            }
          ]
        : preset.id === 'reembolso-review'
          ? [
              { id: 'assistant-hello', role: 'assistant', text: 'Hola, soy el asistente de Siniestros GMM de Allianz México.' },
              { id: 'user-reembolso', role: 'user', text: 'Quiero solicitar un reembolso.' },
              {
                id: 'assistant-reembolso',
                role: 'assistant',
                text: 'Perfecto. Ya tengo un caso de demostración para Reembolso con documentos y observaciones simuladas.'
              }
            ]
          : preset.id === 'reembolso-success'
            ? [
                { id: 'assistant-hello', role: 'assistant', text: 'Hola, soy el asistente de Siniestros GMM de Allianz México.' },
                { id: 'user-reembolso', role: 'user', text: 'Quiero solicitar un reembolso.' },
                { id: 'assistant-reembolso', role: 'assistant', text: 'Este caso de demostración ya viene listo para revisión y confirmación.' }
              ]
            : preset.id === 'cirugia-programada'
              ? [
                  { id: 'assistant-hello', role: 'assistant', text: 'Hola, soy el asistente de Siniestros GMM de Allianz México.' },
                  { id: 'user-cirugia', role: 'user', text: 'Necesito una cirugía programada.' },
                  { id: 'assistant-cirugia', role: 'assistant', text: 'Preparé un recorrido de demostración para Cirugía Programada.' }
                ]
              : preset.id === 'solo-informacion'
                ? [
                    { id: 'assistant-hello', role: 'assistant', text: 'Hola, soy el asistente de Siniestros GMM de Allianz México.' },
                    { id: 'user-info', role: 'user', text: 'Solo quiero información.' },
                    { id: 'assistant-info', role: 'assistant', text: 'Te mostraré los requisitos y los formatos disponibles.' }
                  ]
                : [
                    { id: 'assistant-hello', role: 'assistant', text: 'Hola, soy el asistente de Siniestros GMM de Allianz México.' },
                    { id: 'user-external', role: 'user', text: 'Necesito ayuda con una consulta externa.' },
                    { id: 'assistant-external', role: 'assistant', text: 'Esta consulta requiere atención de un especialista.' }
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
