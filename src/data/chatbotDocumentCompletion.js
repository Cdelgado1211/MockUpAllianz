const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const formatPhone = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  if (digits.length !== 10) return digits;
  return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
};

const field = (config) => ({
  required: true,
  type: 'text',
  shortLabel: config.label,
  ...config
});

export const documentDefinitions = {
  accident_notice: {
    id: 'accident_notice',
    title: 'Aviso de Accidente o Enfermedad',
    intro: 'Te haré algunas preguntas y, al final, podrás revisar toda la información antes de generar el documento.',
    fields: [
      field({
        id: 'insuredName',
        label: 'Nombre del asegurado',
        shortLabel: 'Nombre',
        prompt: '¿Cuál es el nombre completo del asegurado?',
        aliases: ['nombre', 'asegurado']
      }),
      field({
        id: 'policyNumber',
        label: 'Número de póliza',
        shortLabel: 'Número de póliza',
        prompt: '¿Cuál es el número de póliza?',
        aliases: ['poliza', 'póliza']
      }),
      field({
        id: 'email',
        label: 'Correo electrónico',
        shortLabel: 'Correo',
        prompt: '¿Cuál es el correo electrónico de contacto?',
        type: 'email',
        aliases: ['correo', 'email']
      }),
      field({
        id: 'phone',
        label: 'Teléfono',
        shortLabel: 'Teléfono',
        prompt: '¿Cuál es el teléfono de contacto?',
        type: 'tel',
        aliases: ['telefono', 'celular']
      })
    ]
  },
  reimbursement_request: {
    id: 'reimbursement_request',
    title: 'Solicitud de Reembolso',
    intro: 'Te haré algunas preguntas y, al final, podrás revisar toda la información antes de generar el documento.',
    fields: [
      field({
        id: 'insuredName',
        label: 'Nombre del asegurado',
        shortLabel: 'Nombre',
        prompt: '¿Cuál es el nombre completo del asegurado?',
        aliases: ['nombre', 'asegurado']
      }),
      field({
        id: 'policyNumber',
        label: 'Número de póliza',
        shortLabel: 'Número de póliza',
        prompt: '¿Cuál es el número de póliza?',
        aliases: ['poliza', 'póliza']
      }),
      field({
        id: 'email',
        label: 'Correo electrónico',
        shortLabel: 'Correo',
        prompt: '¿Cuál es el correo electrónico de contacto?',
        type: 'email',
        aliases: ['correo', 'email']
      }),
      field({
        id: 'claimAmount',
        label: 'Monto reclamado',
        shortLabel: 'Monto',
        prompt: '¿Cuál es el monto aproximado que deseas reclamar?',
        type: 'currency',
        aliases: ['monto', 'reclamo']
      })
    ]
  }
};

export const formDocumentSelectionOptions = [
  { id: 'accident_notice', label: 'Aviso de Accidente o Enfermedad' },
  { id: 'reimbursement_request', label: 'Solicitud de Reembolso' },
  { id: 'back', label: 'Volver' }
];

export const formComposerInterruptions = [
  { id: 'form-progress', label: 'Ver lo que llevo' },
  { id: 'form-previous', label: 'Cambiar el dato anterior' },
  { id: 'form-cancel', label: 'Cancelar' }
];

export const formReviewOptions = [
  { id: 'form-confirm', label: 'Sí, confirmar' },
  { id: 'form-edit', label: 'Modificar un dato' },
  { id: 'form-cancel', label: 'Cancelar' }
];

export function createFormDraft(status = 'idle') {
  return {
    documentType: null,
    status,
    currentFieldIndex: 0,
    values: {},
    confirmed: false,
    editingFieldId: null
  };
}

export function getDocumentDefinition(documentType) {
  return documentDefinitions[documentType] ?? null;
}

export function getNextFormField(documentDraft) {
  const definition = getDocumentDefinition(documentDraft?.documentType);
  if (!definition) return null;
  return definition.fields[documentDraft.currentFieldIndex] ?? null;
}

export function getFormFieldById(documentType, fieldId) {
  const definition = getDocumentDefinition(documentType);
  return definition?.fields.find((fieldDefinition) => fieldDefinition.id === fieldId) ?? null;
}

export function getPreviousFormField(documentDraft) {
  const definition = getDocumentDefinition(documentDraft?.documentType);
  if (!definition) return null;
  const previousIndex = Math.max(0, (documentDraft?.currentFieldIndex ?? 0) - 1);
  return definition.fields[previousIndex] ?? null;
}

export function findFormFieldByText(documentType, text) {
  const definition = getDocumentDefinition(documentType);
  if (!definition) return null;

  const normalized = normalizeText(text);
  return definition.fields.find((fieldDefinition) =>
    [fieldDefinition.label, fieldDefinition.shortLabel, fieldDefinition.id, ...(fieldDefinition.aliases ?? [])]
      .filter(Boolean)
      .some((alias) => normalized.includes(normalizeText(alias)))
  ) ?? null;
}

export function getFormFieldLabel(fieldDefinition) {
  return fieldDefinition?.shortLabel || fieldDefinition?.label || '';
}

export function getFormFieldPrompt(fieldDefinition) {
  return fieldDefinition?.prompt || '';
}

export function validateFormField(fieldDefinition, rawValue) {
  const value = String(rawValue ?? '').trim();
  const trimmedLower = value.toLowerCase();

  if (!fieldDefinition) {
    return { valid: false, error: 'No pude identificar el dato que quieres capturar.' };
  }

  if (!value) {
    return { valid: false, error: `Necesito ${fieldDefinition.label.toLowerCase()} para continuar.` };
  }

  if (trimmedLower === 'no lo se' || trimmedLower === 'no sé') {
    return { valid: false, error: 'Entiendo. Pero sí necesito ese dato para completar el documento.' };
  }

  if (fieldDefinition.type === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return { valid: false, error: 'Ese correo no parece tener un formato válido. Escríbelo nuevamente, por ejemplo nombre@dominio.com.' };
    }

    return { valid: true, value: value.toLowerCase() };
  }

  if (fieldDefinition.type === 'tel') {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 10 && !(digits.length === 11 && digits.startsWith('0'))) {
      return { valid: false, error: 'Ese teléfono parece incompleto. Por favor, escribe el número completo.' };
    }

    return { valid: true, value: formatPhone(digits) };
  }

  if (fieldDefinition.type === 'currency') {
    const normalizedCurrency = value.replace(/[^0-9.,]/g, '').replace(/,/g, '');
    const numericValue = Number(normalizedCurrency);
    if (!normalizedCurrency || Number.isNaN(numericValue) || numericValue <= 0) {
      return { valid: false, error: 'Necesito un monto numérico. Por ejemplo: 15,000.' };
    }

    return {
      valid: true,
      value: new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(numericValue)
    };
  }

  return { valid: true, value };
}

export function createFormSnapshot(documentDraft) {
  const definition = getDocumentDefinition(documentDraft?.documentType);
  if (!definition) {
    return {
      documentType: null,
      title: '',
      status: documentDraft?.status ?? 'idle',
      confirmed: Boolean(documentDraft?.confirmed),
      currentFieldIndex: documentDraft?.currentFieldIndex ?? 0,
      completed: 0,
      total: 0,
      fields: []
    };
  }

  const fields = definition.fields.map((fieldDefinition) => ({
    id: fieldDefinition.id,
    label: fieldDefinition.label,
    value: String(documentDraft?.values?.[fieldDefinition.id] ?? '').trim() || 'Pendiente'
  }));

  return {
    documentType: definition.id,
    title: definition.title,
    status: documentDraft?.status ?? 'idle',
    confirmed: Boolean(documentDraft?.confirmed),
    currentFieldIndex: documentDraft?.currentFieldIndex ?? 0,
    completed: fields.filter((fieldItem) => fieldItem.value !== 'Pendiente').length,
    total: fields.length,
    fields
  };
}

export function buildGeneratedDocumentMeta(documentDraft) {
  const snapshot = createFormSnapshot(documentDraft);
  const fileNameBase = snapshot.title
    ? snapshot.title
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/gi, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase()
    : 'documento';

  return {
    title: snapshot.title,
    fileName: `${fileNameBase || 'documento'}_mock.pdf`,
    snapshot
  };
}
