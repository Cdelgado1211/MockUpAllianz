export const wizardSteps = [
  { id: 'documents', label: 'Documentos', shortLabel: 'Docs' },
  { id: 'validation', label: 'Validación', shortLabel: 'Val' },
  { id: 'information', label: 'Información', shortLabel: 'Info' },
  { id: 'claim', label: 'Reclamación', shortLabel: 'Rec' },
  { id: 'review', label: 'Revisión', shortLabel: 'Rev' }
];

export const tramiteOptions = [
  {
    id: 'reembolso',
    label: 'Reembolso',
    description: 'Solicita el pago de tus facturas médicas y gastos hospitalarios de forma digital.',
    actionLabel: 'Iniciar solicitud',
    badge: '',
    available: true
  },
  {
    id: 'cirugia_programada',
    label: 'Cirugía Programada',
    description: 'Tramita tu carta de autorización para procedimientos quirúrgicos con anticipación.',
    actionLabel: 'Más información',
    badge: 'Próximamente',
    available: false
  },
  {
    id: 'chatbot',
    label: 'Chatbot (Asistencia)',
    description: 'Resuelve tus dudas al instante con nuestro asistente virtual disponible 24/7.',
    actionLabel: 'Hablar ahora',
    badge: 'Próximamente',
    available: false
  },
  {
    id: 'estatus',
    label: 'Consultar estatus',
    description: 'Rastrea el progreso de tus trámites actuales en tiempo real.',
    actionLabel: 'Ver detalles',
    badge: 'Próximamente',
    available: false
  }
];

export const allowedFormats = ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'JPG', 'JPEG', 'PNG', 'ZIP', 'XML'];

export const privacyText = [
  'Allianz México, con domicilio para estos fines en Ciudad de México, tratará tus datos personales para gestionar tu trámite de reembolso y validar la información proporcionada.',
  'La información podrá ser analizada de forma automatizada para apoyar la lectura de documentos, la detección de coincidencias y la preparación de observaciones del trámite.',
  'Tú puedes consultar, rectificar, cancelar u oponerte al tratamiento de tus datos conforme a la normativa aplicable y a los medios indicados por la aseguradora.'
];

export const infoDocuments = [
  'Aviso de Accidente o Enfermedad',
  'Solicitud de Reembolso del Seguro de Gastos Médicos Mayores',
  'Informe Médico de cada médico tratante',
  'Identificación oficial del titular',
  'Interpretación de estudios',
  'Historia clínica',
  'Comprobante de domicilio no mayor a tres meses',
  'Comprobantes de gastos o facturas'
];

export const documentCategories = [
  {
    id: 'aviso',
    label: 'Aviso de Accidente o Enfermedad',
    description: 'Formato base del trámite y primer punto de validación.',
    required: true,
    multiple: false,
    statusLabel: 'Aviso'
  },
  {
    id: 'solicitud',
    label: 'Solicitud de Reembolso',
    description: 'Formato institucional para solicitar la devolución de gastos.',
    required: true,
    multiple: false,
    statusLabel: 'Solicitud'
  },
  {
    id: 'informe',
    label: 'Informe Médico',
    description: 'Documento clínico del médico tratante o tratantes.',
    required: true,
    multiple: true,
    statusLabel: 'Informe'
  },
  {
    id: 'identificacion',
    label: 'Identificación oficial del titular',
    description: 'INE, pasaporte o documento oficial vigente.',
    required: true,
    multiple: false,
    statusLabel: 'Identificación'
  },
  {
    id: 'domicilio',
    label: 'Comprobante de domicilio',
    description: 'Recibo reciente con antigüedad no mayor a tres meses.',
    required: true,
    multiple: false,
    statusLabel: 'Domicilio'
  },
  {
    id: 'gastos',
    label: 'Comprobantes de gastos',
    description: 'Facturas válidas de los gastos médicos.',
    required: true,
    multiple: true,
    statusLabel: 'Gastos'
  },
  {
    id: 'estudios',
    label: 'Interpretación de estudios',
    description: 'Resultados con interpretación o dictamen médico.',
    required: false,
    multiple: true,
    statusLabel: 'Estudios'
  },
  {
    id: 'historia',
    label: 'Historia clínica',
    description: 'Resumen médico relacionado con el evento.',
    required: false,
    multiple: false,
    statusLabel: 'Historia'
  },
  {
    id: 'soporte',
    label: 'Otros documentos de soporte',
    description: 'Cualquier documento adicional útil para el análisis.',
    required: false,
    multiple: true,
    statusLabel: 'Soporte'
  }
];

export const validationStages = [
  'Leyendo documentos',
  'Identificando información',
  'Comparando datos',
  'Validando documentos',
  'Preparando resultados'
];

export const demoExtraction = {
  policy: {
    productType: 'Colectiva',
    policyNumber: 'GMM-20458019',
    identifiedAutomatically: true
  },
  person: {
    relationship: 'Titular',
    parentesco: '',
    fullName: 'María Fernanda López García',
    firstName: 'María Fernanda',
    paternalLastName: 'López',
    maternalLastName: 'García',
    phoneLandline: '',
    mobilePhone: '5587221144',
    email: 'maria.lopez@mail.com',
    emailConfirmation: 'maria.lopez@mail.com',
    contactAutoIdentified: true
  },
  claimant: {
    type: 'Complemento',
    knowsSinisterNumber: 'No',
    sinisterNumber: '',
    currency: 'Pesos',
    claimedAmount: '38420.00',
    receiptsCount: '4',
    identifiedAutomatically: true
  }
};

export const demoAlerts = [
  {
    id: 'alert-1',
    title: 'El nombre del paciente no coincide entre el Informe Médico y el Aviso de Accidente',
    field: 'Nombre del paciente',
    sourceDocument: 'Informe Médico',
    comparedDocument: 'Aviso de Accidente',
    reason: 'La IA detectó una variación ortográfica en el nombre del paciente.',
    recommendation: 'Corrige el dato o reemplaza el documento para alinear los nombres.',
    severity: 'critical',
    defaultAction: 'Corregir dato',
    status: 'active'
  },
  {
    id: 'alert-2',
    title: 'No se encontró el número de póliza',
    field: 'No. de póliza',
    sourceDocument: 'Solicitud de Reembolso',
    comparedDocument: 'Aviso de Accidente',
    reason: 'El número de póliza no fue localizado en una de las fuentes analizadas.',
    recommendation: 'Verifica el documento o captura el dato manualmente.',
    severity: 'warning',
    defaultAction: 'Corregir dato',
    status: 'active'
  },
  {
    id: 'alert-3',
    title: 'Falta una firma en la Solicitud de Reembolso',
    field: 'Firma',
    sourceDocument: 'Solicitud de Reembolso',
    comparedDocument: 'Validación documental',
    reason: 'La firma requerida no es visible en la versión procesada.',
    recommendation: 'Reemplaza el documento con una versión firmada.',
    severity: 'warning',
    defaultAction: 'Reemplazar documento',
    status: 'active'
  },
  {
    id: 'alert-4',
    title: 'El comprobante de domicilio tiene más de tres meses',
    field: 'Comprobante de domicilio',
    sourceDocument: 'Comprobante de domicilio',
    comparedDocument: 'Regla documental',
    reason: 'La fecha de emisión supera el rango aceptado por la validación.',
    recommendation: 'Carga un comprobante más reciente.',
    severity: 'warning',
    defaultAction: 'Reemplazar documento',
    status: 'active'
  },
  {
    id: 'alert-5',
    title: 'No fue posible leer una factura',
    field: 'Factura',
    sourceDocument: 'Comprobantes de gastos',
    comparedDocument: 'OCR documental',
    reason: 'El documento presenta baja legibilidad en el área de captura.',
    recommendation: 'Visualiza y reemplaza el archivo si lo consideras necesario.',
    severity: 'critical',
    defaultAction: 'Visualizar documento',
    status: 'active'
  },
  {
    id: 'alert-6',
    title: 'La CLABE no contiene 18 dígitos',
    field: 'CLABE',
    sourceDocument: 'Datos de reclamación',
    comparedDocument: 'Regla bancaria',
    reason: 'El sistema encontró una longitud inválida para la cuenta interbancaria.',
    recommendation: 'Corrige la CLABE antes de confirmar el trámite.',
    severity: 'warning',
    defaultAction: 'Corregir dato',
    status: 'active'
  }
];

function createFile(name, size, type, status = 'validated') {
  return {
    id: `${name}-${size}-${type}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    size,
    type,
    status
  };
}

export const demoDocumentState = [
  {
    ...documentCategories[0],
    tooltip:
      'Aviso de Accidente o Enfermedad. Incluye el formato institucional y la evidencia inicial del trámite.',
    files: [createFile('aviso-accidente.pdf', '1.2 MB', 'PDF')],
    status: 'validated',
    validationNote: 'Dato identificado automáticamente'
  },
  {
    ...documentCategories[1],
    tooltip:
      'Solicitud de Reembolso. Sube el formato institucional para iniciar el análisis del caso.',
    files: [createFile('solicitud-reembolso.pdf', '842 KB', 'PDF')],
    status: 'validated',
    validationNote: 'Formato validado'
  },
  {
    ...documentCategories[2],
    tooltip: 'Informe Médico. Puedes adjuntar varios archivos si intervienen varios médicos tratantes.',
    files: [createFile('informe-medico-1.pdf', '1.6 MB', 'PDF')],
    status: 'requires_review',
    validationNote: 'Nombre con diferencia detectada'
  },
  {
    ...documentCategories[3],
    tooltip: 'INE, pasaporte o documento oficial vigente del titular de la póliza.',
    files: [createFile('identificacion-titular.jpg', '513 KB', 'JPG')],
    status: 'validated',
    validationNote: 'Identidad confirmada'
  },
  {
    ...documentCategories[4],
    tooltip: 'Recibo de servicios o estado de cuenta reciente (máx. 3 meses).',
    files: [createFile('comprobante-domicilio.pdf', '768 KB', 'PDF')],
    status: 'illegible',
    validationNote: 'Documento ilegible'
  },
  {
    ...documentCategories[5],
    tooltip: 'Facturas electrónicas válidas (PDF o XML) de los gastos médicos.',
    files: [createFile('factura-gastos.xml', '212 KB', 'XML')],
    status: 'validated',
    validationNote: 'Factura validada'
  },
  {
    ...documentCategories[6],
    tooltip: 'Resultados médicos con interpretación (laboratorio, imagenología, etc.).',
    files: [],
    status: 'pending',
    validationNote: 'Pendiente'
  },
  {
    ...documentCategories[7],
    tooltip: 'Resumen del historial médico relacionado con el evento.',
    files: [],
    status: 'pending',
    validationNote: 'Pendiente'
  },
  {
    ...documentCategories[8],
    tooltip: 'Cualquier otro documento que ayude a validar tu caso.',
    files: [],
    status: 'pending',
    validationNote: 'Pendiente'
  }
];

export const initialWizardState = {
  phase: 'entry',
  currentStep: 0,
  showNoDocsModal: false,
  showAlertContinueModal: false,
  showFilePreview: null,
  showProcessingTimer: false,
  validationPhase: 'idle',
  validationStageIndex: 0,
  validationCompleted: false,
  saveToast: '',
  finalConfirmed: false,
  documents: demoDocumentState,
  observations: 'Se agregan observaciones para complementar el caso.',
  extracted: demoExtraction,
  alerts: demoAlerts,
  ignoredAlerts: [],
  acceptedAlerts: [],
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
    ...demoExtraction.claimant
  }
};

export function createInitialWizardState() {
  return {
    ...initialWizardState,
    documents: cloneInitialDocuments(),
    alerts: demoAlerts.map((alert) => ({ ...alert })),
    extracted: {
      policy: { ...demoExtraction.policy },
      person: { ...demoExtraction.person },
      claimant: { ...demoExtraction.claimant }
    },
    policy: { ...demoExtraction.policy },
    person: { ...demoExtraction.person },
    contact: { ...initialWizardState.contact },
    claimant: { ...demoExtraction.claimant }
  };
}

export function cloneInitialDocuments() {
  return demoDocumentState.map((document) => ({
    ...document,
    files: document.files.map((file) => ({ ...file }))
  }));
}

export function createEmptyDocumentState() {
  return documentCategories.map((document) => ({
    ...document,
    files: [],
    status: 'pending',
    validationNote: 'Pendiente'
  }));
}

export function countDocumentsByStatus(documents, status) {
  return documents.filter((document) => document.status === status).length;
}

export function getLoadedDocuments(documents) {
  return documents.filter((document) => document.files.length > 0);
}

export function getVisibleAlertCounts(alerts, ignoredAlerts) {
  const activeAlerts = alerts.filter((alert) => alert.status === 'active' && !ignoredAlerts.includes(alert.id));
  return {
    activeCount: activeAlerts.length,
    ignoredCount: ignoredAlerts.length
  };
}

export function fileAcceptString() {
  return '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.xml';
}

export function formatBytes(bytes) {
  if (typeof bytes === 'string') return bytes;
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function createMockFileMeta(file, overrideStatus = 'uploaded') {
  return {
    id: `${file.name}-${file.size}-${file.type}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: file.name,
    size: formatBytes(file.size),
    type: file.type || 'application/octet-stream',
    status: overrideStatus
  };
}
