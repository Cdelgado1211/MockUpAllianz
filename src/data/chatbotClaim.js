const CLAIM_FIELD_LABELS = {
  type: 'el tipo de reclamación',
  knowsSinisterNumber: 'si conoces el número de siniestro',
  sinisterNumber: 'el número de siniestro',
  attentionPlace: 'el lugar de atención',
  tramiteType: 'el tipo de trámite',
  observations: 'las observaciones',
  currency: 'la moneda',
  claimedAmount: 'el monto reclamado',
  receiptsCount: 'la cantidad de recibos o facturas'
};

const CLAIM_FIELD_PROMPTS = {
  type: '¿El tipo de reclamación es Inicial o Complemento?',
  knowsSinisterNumber: '¿Conoces el número de siniestro? Responde Sí o No.',
  sinisterNumber: '¿Cuál es el número de siniestro correcto?',
  attentionPlace: '¿El lugar de atención es Trámite Nacional o Trámite Internacional?',
  tramiteType: '¿Qué tipo de trámite necesitas: Cirugía, Medicamentos, Estudios, Rehabilitación, Enfermería y Home Care u Otros?',
  observations: '¿Qué observaciones deseas agregar?',
  currency: '¿Cuál es la moneda correcta: Pesos, Dolares u Otros?',
  claimedAmount: '¿Cuál es el monto reclamado correcto?',
  receiptsCount: '¿Cuántos recibos o facturas vas a presentar?'
};

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function cleanValue(text) {
  const raw = String(text ?? '').trim().replace(/[.!]+$/, '');
  const explicit = raw.match(/(?:\bes\b|\ba\b|\bpor\b|:)[\s]+(.+)$/i)?.[1]?.trim();
  if (explicit) return explicit;
  if (/^(cambia|cambiar|corrige|corregir|modifica|modificar|quiero)/i.test(raw)) return '';
  return raw;
}

function detectClaimField(text) {
  const normalized = normalizeText(text);

  if (/lugar de atencion|tramite nacional|tramite internacional/.test(normalized)) return 'attentionPlace';
  if (/tipo de tramite/.test(normalized)) return 'tramiteType';
  if (/observacion/.test(normalized)) return 'observations';
  if (/conoces.*siniestro|se el numero|no conozco.*siniestro/.test(normalized)) return 'knowsSinisterNumber';
  if (/numero de siniestro|siniestro/.test(normalized)) return 'sinisterNumber';
  if (/tipo de reclamacion|inicial|complemento/.test(normalized)) return 'type';
  if (/moneda|pesos|dolares|euros/.test(normalized)) return 'currency';
  if (/monto|cantidad reclamada|importe/.test(normalized)) return 'claimedAmount';
  if (/recibos|facturas/.test(normalized)) return 'receiptsCount';
  return null;
}

function extractClaimValue(text, field) {
  const raw = String(text ?? '').trim().replace(/[.!]+$/, '');
  const normalized = normalizeText(raw);

  if (field === 'type') {
    if (normalized.includes('complemento')) return 'Complemento';
    if (normalized.includes('inicial')) return 'Inicial';
  }

  if (field === 'knowsSinisterNumber') {
    if (/^(si|sí)|\bsi conozco\b|\bconozco\b/.test(normalized)) return 'Sí';
    if (/^(no)|\bno conozco\b/.test(normalized)) return 'No';
  }

  if (field === 'attentionPlace') {
    if (normalized.includes('internacional')) return 'Trámite Internacional';
    if (normalized.includes('nacional')) return 'Trámite Nacional';
  }

  if (field === 'tramiteType') {
    const options = [
      ['enfermeria', 'Enfermería y Home Care'],
      ['home care', 'Enfermería y Home Care'],
      ['rehabilitacion', 'Rehabilitación'],
      ['medicamento', 'Medicamentos'],
      ['estudio', 'Estudios'],
      ['cirugia', 'Cirugía'],
      ['otro', 'Otros']
    ];
    const match = options.find(([term]) => normalized.includes(term));
    if (match) return match[1];
  }

  if (field === 'currency') {
    if (normalized.includes('dolar')) return 'Dolares';
    if (normalized.includes('peso')) return 'Pesos';
    if (normalized.includes('otro')) return 'Otros';
  }

  if (field === 'claimedAmount') {
  const amount = raw.match(/[\d][\d,]*(?:\.\d{1,2})?/)?.[0];
    return amount ? amount.replace(/,/g, '') : cleanValue(raw);
  }

  if (field === 'receiptsCount') {
    return raw.match(/\d+/)?.[0] ?? cleanValue(raw);
  }

  return cleanValue(raw);
}

export function buildClaimSnapshot(claimant, flow) {
  return {
    flow,
    type: claimant.type ?? '',
    knowsSinisterNumber: claimant.knowsSinisterNumber ?? '',
    sinisterNumber: claimant.sinisterNumber ?? '',
    attentionPlace: claimant.attentionPlace ?? '',
    tramiteType: claimant.tramiteType ?? '',
    observations: claimant.observations ?? '',
    currency: claimant.currency ?? '',
    claimedAmount: claimant.claimedAmount ?? '',
    receiptsCount: claimant.receiptsCount ?? ''
  };
}

const CLAIM_FIELD_OPTIONS = {
  type: ['Inicial', 'Complemento'],
  knowsSinisterNumber: ['Sí', 'No'],
  attentionPlace: ['Trámite Nacional', 'Trámite Internacional'],
  tramiteType: ['Cirugía', 'Medicamentos', 'Estudios', 'Rehabilitación', 'Enfermería y Home Care', 'Otros']
};

export function getNextRequiredClaimField(claimant, flow) {
  if (flow !== 'cirugia_programada') return null;

  if (!String(claimant.type ?? '').trim()) return 'type';
  if (claimant.type === 'Complemento' && !String(claimant.knowsSinisterNumber ?? '').trim()) return 'knowsSinisterNumber';
  if (
    claimant.type === 'Complemento' &&
    claimant.knowsSinisterNumber === 'Sí' &&
    !String(claimant.sinisterNumber ?? '').trim()
  ) {
    return 'sinisterNumber';
  }
  if (!String(claimant.attentionPlace ?? '').trim()) return 'attentionPlace';
  if (!String(claimant.tramiteType ?? '').trim()) return 'tramiteType';
  if (claimant.tramiteType === 'Otros' && !String(claimant.observations ?? '').trim()) return 'observations';

  return null;
}

export function getClaimQuickReplies(flow, pendingField = null) {
  const pendingOptions = CLAIM_FIELD_OPTIONS[pendingField];
  if (pendingOptions) {
    return pendingOptions.map((value) => ({
      id: `claim-answer-${pendingField}-${normalizeText(value).replace(/\s+/g, '-')}`,
      label: value,
      claimField: pendingField,
      value
    }));
  }
  if (pendingField) return [];

  const base = [
    { id: 'claim-confirm', label: 'Sí, continuar' },
    { id: 'claim-change-type', label: 'Cambiar tipo de reclamación' },
    { id: 'claim-change-knows', label: 'Cambiar respuesta sobre el siniestro' },
    { id: 'claim-change-sinister', label: 'Cambiar número de siniestro' }
  ];

  if (flow === 'cirugia_programada') {
    return [
      ...base,
      { id: 'claim-change-attention', label: 'Cambiar lugar de atención' },
      { id: 'claim-change-tramite', label: 'Cambiar tipo de trámite' },
      { id: 'claim-change-observations', label: 'Cambiar observaciones' }
    ];
  }

  return [
    ...base,
    { id: 'claim-change-currency', label: 'Cambiar moneda' },
    { id: 'claim-change-amount', label: 'Cambiar monto' },
    { id: 'claim-change-receipts', label: 'Cambiar recibos' }
  ];
}

export function parseClaimInput(text, pendingField = null) {
  const normalized = normalizeText(text).replace(/[.!?]+$/g, '').trim();
  const confirmations = /^(si(?:,?\s+(?:continuar|confirmo))?|correcto|esta bien|confirmo|confirmar|continuar|todo esta (?:bien|correcto))$/;

  if (!pendingField && confirmations.test(normalized)) return { intent: 'confirm' };

  const field = pendingField || detectClaimField(text);
  if (!field) return { intent: /mal|incorrect/.test(normalized) ? 'ambiguous' : 'unknown' };

  const value = extractClaimValue(text, field);
  return value ? { intent: 'correction', field, value } : { intent: 'request-value', field };
}

export function validateClaimValue(field, value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return { valid: false, error: `Necesito que escribas ${CLAIM_FIELD_LABELS[field]} para actualizarlo.` };

  const allowedValues = {
    type: ['Inicial', 'Complemento'],
    knowsSinisterNumber: ['Sí', 'No'],
    attentionPlace: ['Trámite Nacional', 'Trámite Internacional'],
    tramiteType: ['Cirugía', 'Medicamentos', 'Estudios', 'Rehabilitación', 'Enfermería y Home Care', 'Otros'],
    currency: ['Pesos', 'Dolares', 'Otros']
  };

  if (allowedValues[field] && !allowedValues[field].includes(trimmed)) {
    return { valid: false, error: CLAIM_FIELD_PROMPTS[field] };
  }

  if (field === 'claimedAmount' && (!/^\d+(?:\.\d{1,2})?$/.test(trimmed) || Number(trimmed) <= 0)) {
    return { valid: false, error: 'El monto debe ser un número mayor a cero. Puedes escribirlo, por ejemplo, como 38420.00.' };
  }

  if (field === 'receiptsCount' && (!/^\d+$/.test(trimmed) || Number(trimmed) < 1)) {
    return { valid: false, error: 'La cantidad de recibos debe ser un número entero mayor a cero.' };
  }

  return { valid: true, value: trimmed };
}

export function applyClaimCorrection(current, field, value) {
  const next = { ...current, [field]: value };

  if (field === 'type' && value !== 'Complemento') {
    next.knowsSinisterNumber = 'No';
    next.sinisterNumber = '';
  }
  if (field === 'knowsSinisterNumber' && value === 'No') next.sinisterNumber = '';
  if (field === 'tramiteType' && value !== 'Otros') next.observations = '';

  return next;
}

export function getClaimFieldLabel(field) {
  return CLAIM_FIELD_LABELS[field] ?? 'el dato';
}

export function getClaimFieldPrompt(field) {
  return CLAIM_FIELD_PROMPTS[field] ?? '¿Cuál es el valor correcto?';
}
