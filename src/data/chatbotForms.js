const normalize = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const required = (value, label) =>
  String(value ?? '').trim() ? { valid: true, value: String(value).trim() } : { valid: false, error: `Necesito ${label.toLowerCase()} para continuar.` };

const email = (value) => {
  const cleanValue = String(value ?? '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanValue)
    ? { valid: true, value: cleanValue }
    : { valid: false, error: 'Ese correo no parece tener un formato válido. Escríbelo como nombre@dominio.com.' };
};

const phone = (value) => {
  const cleanValue = String(value ?? '').replace(/\D/g, '');
  return cleanValue.length === 10
    ? { valid: true, value: cleanValue }
    : { valid: false, error: 'El teléfono debe contener 10 dígitos. Inténtalo nuevamente.' };
};

const field = (config) => ({ required: true, type: 'text', section: 'Información general', ...config });

export const chatbotDocumentDefinitions = {
  accident_notice: {
    id: 'accident_notice',
    documentId: 'aviso',
    title: 'Aviso de Accidente o Enfermedad',
    fileName: 'Aviso_Accidente_Enfermedad.pdf',
    description: 'Este formato reúne los datos del asegurado y la información principal del evento.',
    fields: [
      field({ id: 'affectedName', label: 'Nombre del afectado', prompt: '¿Cuál es el nombre completo de la persona afectada?', section: 'Datos del asegurado', aliases: ['nombre', 'afectado', 'paciente'] }),
      field({ id: 'policyNumber', label: 'Número de póliza', prompt: '¿Cuál es el número de póliza?', section: 'Datos del asegurado', aliases: ['poliza', 'numero de poliza'] }),
      field({ id: 'productType', label: 'Tipo de producto', prompt: '¿El producto es Individual o Colectiva?', type: 'choice', options: ['Individual', 'Colectiva'], section: 'Datos del asegurado', aliases: ['producto', 'tipo de producto'] }),
      field({ id: 'holderName', label: 'Nombre del titular', prompt: '¿Cuál es el nombre completo del titular de la póliza?', section: 'Datos del asegurado', aliases: ['titular', 'nombre del titular'] }),
      field({ id: 'claimReason', label: 'Motivo de la reclamación', prompt: 'Cuéntame brevemente el motivo de la reclamación.', type: 'textarea', section: 'Información del evento', aliases: ['motivo', 'reclamacion', 'descripcion'] }),
      field({ id: 'claimType', label: 'Tipo de reclamación', prompt: '¿La reclamación es Inicial o Complemento?', type: 'choice', options: ['Inicial', 'Complemento'], section: 'Información del evento', aliases: ['tipo de reclamacion', 'inicial', 'complemento'] }),
      field({ id: 'mobilePhone', label: 'Teléfono celular', prompt: '¿Cuál es el teléfono celular de contacto? Escríbelo a 10 dígitos.', section: 'Datos de contacto', aliases: ['telefono', 'celular'], validate: phone })
    ]
  },
  reimbursement_request: {
    id: 'reimbursement_request',
    documentId: 'solicitud',
    title: 'Solicitud de Reembolso',
    fileName: 'Solicitud_Reembolso.pdf',
    description: 'Este formato concentra los datos del titular y la solicitud de pago del reembolso.',
    fields: [
      field({ id: 'policyNumber', label: 'Número de póliza', prompt: '¿Cuál es el número de póliza?', section: 'Datos de la póliza', aliases: ['poliza', 'numero de poliza'] }),
      field({ id: 'contractorName', label: 'Nombre o razón social del contratante', prompt: '¿Cuál es el nombre o razón social del contratante?', section: 'Datos de la póliza', aliases: ['contratante', 'razon social'] }),
      field({ id: 'holderName', label: 'Nombre del titular', prompt: '¿Cuál es el nombre completo del titular de la póliza?', section: 'Datos del titular', aliases: ['titular', 'nombre del titular'] }),
      field({ id: 'rfcCurp', label: 'RFC o CURP', prompt: '¿Cuál es el RFC o CURP del titular?', section: 'Datos del titular', aliases: ['rfc', 'curp'] }),
      field({ id: 'email', label: 'Correo electrónico', prompt: '¿Cuál es el correo electrónico de contacto?', section: 'Datos de contacto', aliases: ['correo', 'email'], validate: email }),
      field({ id: 'phone', label: 'Teléfono', prompt: '¿Cuál es el teléfono de contacto? Escríbelo a 10 dígitos.', section: 'Datos de contacto', aliases: ['telefono', 'celular'], validate: phone }),
      field({ id: 'claimType', label: 'Tipo de reclamación', prompt: '¿La reclamación es Inicial o Complemento?', type: 'choice', options: ['Inicial', 'Complemento'], section: 'Datos de la reclamación', aliases: ['tipo de reclamacion', 'inicial', 'complemento'] }),
      field({
        id: 'knowsSinisterNumber',
        label: '¿Conoces el número de siniestro?',
        prompt: '¿Conoces el número de siniestro?',
        type: 'choice',
        options: ['Sí', 'No'],
        section: 'Datos de la reclamación',
        aliases: ['conoces el numero', 'numero de siniestro'],
        visibleWhen: (values) => values.claimType === 'Complemento'
      }),
      field({
        id: 'sinisterNumber',
        label: 'Número de siniestro',
        prompt: 'Escribe el número de siniestro.',
        section: 'Datos de la reclamación',
        aliases: ['siniestro', 'numero de siniestro'],
        visibleWhen: (values) => values.claimType === 'Complemento' && values.knowsSinisterNumber === 'Sí'
      })
    ]
  }
};

export function getChatbotDocumentDefinition(documentType) {
  return chatbotDocumentDefinitions[documentType] ?? null;
}

export function getVisibleDocumentFields(definition, values) {
  return definition.fields.filter((item) => !item.visibleWhen || item.visibleWhen(values));
}

export function getNextDocumentField(draft) {
  const definition = getChatbotDocumentDefinition(draft.documentType);
  if (!definition) return null;
  return getVisibleDocumentFields(definition, draft.values).find((item) => item.required && !String(draft.values[item.id] ?? '').trim()) ?? null;
}

export function createDocumentDraft(documentType, source = {}) {
  const definition = getChatbotDocumentDefinition(documentType);
  const fullName = source.person?.fullName || [source.person?.firstName, source.person?.paternalLastName, source.person?.maternalLastName].filter(Boolean).join(' ');
  const commonValues = {
    affectedName: fullName,
    holderName: fullName,
    contractorName: fullName,
    policyNumber: source.policy?.policyNumber,
    productType: source.policy?.productType,
    email: source.contact?.email,
    phone: source.contact?.mobilePhone,
    mobilePhone: source.contact?.mobilePhone,
    claimType: source.claimant?.type,
    knowsSinisterNumber: source.claimant?.knowsSinisterNumber,
    sinisterNumber: source.claimant?.sinisterNumber
  };
  const values = Object.fromEntries(definition.fields.map((item) => [item.id, String(commonValues[item.id] ?? '').trim()]));
  const prefilledFields = definition.fields.filter((item) => values[item.id]).map((item) => item.id);
  const draft = {
    documentType,
    status: 'collecting',
    currentFieldId: null,
    pendingCorrectionFieldId: null,
    values,
    prefilledFields,
    generatedPdf: null,
    attached: false
  };
  draft.currentFieldId = getNextDocumentField(draft)?.id ?? null;
  return draft;
}

export function validateDocumentField(fieldDefinition, rawValue) {
  let value = String(rawValue ?? '').trim();
  if (fieldDefinition.type === 'choice') {
    const match = fieldDefinition.options.find((option) => normalize(option) === normalize(value));
    if (!match) return { valid: false, error: `Elige una opción válida: ${fieldDefinition.options.join(' o ')}.` };
    value = match;
  }
  if (fieldDefinition.validate) return fieldDefinition.validate(value);
  return fieldDefinition.required ? required(value, fieldDefinition.label) : { valid: true, value };
}

export function buildDocumentFormSnapshot(draft) {
  const definition = getChatbotDocumentDefinition(draft.documentType);
  const sections = [];
  getVisibleDocumentFields(definition, draft.values).forEach((item) => {
    let section = sections.find((entry) => entry.title === item.section);
    if (!section) {
      section = { title: item.section, fields: [] };
      sections.push(section);
    }
    section.fields.push({ id: item.id, label: item.label, value: draft.values[item.id] || 'Pendiente' });
  });
  return { documentType: draft.documentType, title: definition.title, sections };
}

export function getDocumentFormProgress(draft) {
  if (!draft) return { completed: 0, total: 0 };
  const definition = getChatbotDocumentDefinition(draft.documentType);
  const fields = getVisibleDocumentFields(definition, draft.values);
  return { completed: fields.filter((item) => String(draft.values[item.id] ?? '').trim()).length, total: fields.length };
}

export function findDocumentField(documentType, text) {
  const definition = getChatbotDocumentDefinition(documentType);
  const normalizedText = normalize(text);
  return definition.fields.find((item) => [item.label, item.id, ...(item.aliases ?? [])].some((alias) => normalizedText.includes(normalize(alias)))) ?? null;
}

export function extractDocumentCorrectionValue(text, fieldDefinition) {
  const cleanText = String(text ?? '').trim();
  const separators = [/\s+(?:es|a|por)\s+/i, /:\s*/];
  for (const separator of separators) {
    const parts = cleanText.split(separator);
    if (parts.length > 1) return parts.slice(1).join(' ').replace(/[.]+$/, '').trim();
  }
  if (fieldDefinition?.type === 'choice') {
    return fieldDefinition.options.find((option) => normalize(cleanText).includes(normalize(option))) ?? cleanText;
  }
  return cleanText;
}
