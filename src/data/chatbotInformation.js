const FIELD_LABELS = {
  productType: 'tipo de producto',
  policyNumber: 'número de póliza',
  relationship: 'persona que realiza el trámite',
  fullName: 'nombre completo',
  firstName: 'nombre',
  paternalLastName: 'apellido paterno',
  maternalLastName: 'apellido materno',
  phoneLandline: 'teléfono particular',
  mobilePhone: 'teléfono celular',
  email: 'correo electrónico'
};

const FIELD_PROMPTS = {
  productType: '¿El tipo de producto correcto es Individual o Colectiva?',
  policyNumber: '¿Cuál es el número de póliza correcto?',
  relationship: '¿Quién realiza el trámite: Titular, Afectado u Otra persona?',
  fullName: '¿Cuál es el nombre completo correcto?',
  firstName: '¿Cuál es el nombre correcto?',
  paternalLastName: '¿Cuál es el apellido paterno correcto?',
  maternalLastName: '¿Cuál es el apellido materno correcto?',
  phoneLandline: '¿Cuál es el teléfono particular correcto?',
  mobilePhone: '¿Cuál es el teléfono celular correcto?',
  email: '¿Cuál es el correo electrónico correcto?'
};

export const informationQuickReplies = [
  { id: 'info-confirm', label: 'Sí, continuar' },
  { id: 'info-change-name', label: 'Cambiar nombre' },
  { id: 'info-change-email', label: 'Cambiar correo' },
  { id: 'info-change-phone', label: 'Cambiar teléfono' },
  { id: 'info-change-policy', label: 'Cambiar póliza' }
];

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function splitFullName(value) {
  const parts = String(value ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length < 3) {
    return { firstName: parts[0] ?? '', paternalLastName: parts[1] ?? '', maternalLastName: '' };
  }

  return {
    firstName: parts.slice(0, -2).join(' '),
    paternalLastName: parts.at(-2),
    maternalLastName: parts.at(-1)
  };
}

function extractPlainTextValue(text) {
  const raw = String(text ?? '').trim().replace(/[.!]+$/, '');
  const explicitValue = raw.match(/(?:\bes\b|\ba\b|\bpor\b|:)[\s]+(.+)$/i)?.[1]?.trim();

  if (explicitValue) return explicitValue.replace(/,\s*no\s+.+$/i, '').trim();
  if (/^(cambia|cambiar|corrige|corregir|modifica|modificar|quiero)/i.test(raw)) return '';
  return raw;
}

function extractValue(text, field) {
  const raw = String(text ?? '').trim().replace(/[.!]+$/, '');

  if (field === 'email') {
    return raw.match(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/)?.[0] ?? extractPlainTextValue(raw);
  }

  if (field === 'mobilePhone' || field === 'phoneLandline') {
    const digits = raw.replace(/\D/g, '');
    return digits.length ? digits.slice(-10) : extractPlainTextValue(raw);
  }

  if (field === 'productType') {
    const normalized = normalizeText(raw);
    if (normalized.includes('colectiva')) return 'Colectiva';
    if (normalized.includes('individual')) return 'Individual';
    return extractPlainTextValue(raw);
  }

  if (field === 'relationship') {
    const normalized = normalizeText(raw);
    if (normalized.includes('titular')) return 'Titular';
    if (normalized.includes('afectad')) return 'Afectado';
    if (normalized.includes('otr')) return 'Otro';
    return extractPlainTextValue(raw);
  }

  return extractPlainTextValue(raw);
}

function detectField(text) {
  const normalized = normalizeText(text);

  if (/apellido materno/.test(normalized)) return 'maternalLastName';
  if (/apellido paterno/.test(normalized)) return 'paternalLastName';
  if (/correo|email|e-mail/.test(normalized)) return 'email';
  if (/celular|movil/.test(normalized)) return 'mobilePhone';
  if (/telefono particular|telefono fijo|linea fija/.test(normalized)) return 'phoneLandline';
  if (/telefono/.test(normalized)) return 'mobilePhone';
  if (/poliza/.test(normalized)) return 'policyNumber';
  if (/tipo de producto|producto/.test(normalized)) return 'productType';
  if (/relacion|quien realiza|solicitante/.test(normalized)) return 'relationship';
  if (/nombre completo/.test(normalized)) return 'fullName';
  if (/apellido/.test(normalized)) return 'paternalLastName';
  if (/nombre/.test(normalized)) return 'fullName';
  return null;
}

export function buildInformationSnapshot(policy, person, contact) {
  const fullName = [person.firstName, person.paternalLastName, person.maternalLastName]
    .map((part) => String(part ?? '').trim())
    .filter(Boolean)
    .join(' ');

  return {
    productType: policy.productType ?? '',
    policyNumber: policy.policyNumber ?? '',
    policyAutoIdentified: Boolean(policy.identifiedAutomatically),
    relationship: person.relationship ?? '',
    fullName: fullName || person.fullName || '',
    firstName: person.firstName ?? '',
    paternalLastName: person.paternalLastName ?? '',
    maternalLastName: person.maternalLastName ?? '',
    personAutoIdentified: Boolean(person.contactAutoIdentified),
    phoneLandline: contact.phoneLandline ?? '',
    mobilePhone: contact.mobilePhone ?? '',
    email: contact.email ?? '',
    contactAutoIdentified: Boolean(person.contactAutoIdentified)
  };
}

export function parseInformationInput(text, pendingField = null) {
  const normalized = normalizeText(text);
  const normalizedConfirmation = normalized.replace(/[.!?]+$/g, '').trim();
  const confirmationPatterns = /^(si(?:,?\s+(?:continuar|confirmo))?|correcto|esta bien|confirmo|confirmar|continuar|todo esta (?:bien|correcto))$/;

  if (!pendingField && confirmationPatterns.test(normalizedConfirmation)) {
    return { intent: 'confirm' };
  }

  const field = pendingField || detectField(text);
  if (!field) {
    return { intent: /mal|incorrect/.test(normalized) ? 'ambiguous' : 'unknown' };
  }

  const value = extractValue(text, field);
  return value ? { intent: 'correction', field, value } : { intent: 'request-value', field };
}

export function validateInformationValue(field, value) {
  const trimmed = String(value ?? '').trim();
  const label = FIELD_LABELS[field] ?? 'dato';

  if (!trimmed) {
    return { valid: false, error: `Necesito que escribas el ${label} para poder actualizarlo.` };
  }

  if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { valid: false, error: 'Ese correo no parece tener un formato válido. Escríbelo nuevamente, por ejemplo nombre@dominio.com.' };
  }

  if ((field === 'mobilePhone' || field === 'phoneLandline') && trimmed.replace(/\D/g, '').length !== 10) {
    return { valid: false, error: 'Ese teléfono parece incompleto. ¿Puedes escribir los 10 dígitos?' };
  }

  if (field === 'productType' && !['Individual', 'Colectiva'].includes(trimmed)) {
    return { valid: false, error: 'El tipo de producto debe ser Individual o Colectiva.' };
  }

  if (field === 'relationship' && !['Titular', 'Afectado', 'Otro'].includes(trimmed)) {
    return { valid: false, error: 'Indica si quien realiza el trámite es Titular, Afectado u Otra persona.' };
  }

  return {
    valid: true,
    value: field === 'email' ? trimmed.toLowerCase() : field === 'policyNumber' ? trimmed.toUpperCase() : trimmed
  };
}

export function applyInformationCorrection(current, field, value) {
  const next = {
    policy: { ...current.policy },
    person: { ...current.person },
    contact: { ...current.contact }
  };

  if (field === 'productType' || field === 'policyNumber') {
    next.policy[field] = value;
  } else if (field === 'email') {
    next.contact.email = value;
    next.contact.emailConfirmation = value;
  } else if (field === 'mobilePhone' || field === 'phoneLandline') {
    next.contact[field] = String(value).replace(/\D/g, '');
  } else if (field === 'fullName') {
    const name = splitFullName(value);
    next.person = { ...next.person, ...name, fullName: value };
  } else if (field === 'firstName' || field === 'paternalLastName' || field === 'maternalLastName') {
    next.person[field] = value;
    next.person.fullName = [next.person.firstName, next.person.paternalLastName, next.person.maternalLastName].filter(Boolean).join(' ');
  } else if (field === 'relationship') {
    next.person.relationship = value;
    if (value !== 'Otro') next.person.parentesco = '';
  }

  return next;
}

export function getInformationFieldLabel(field) {
  return FIELD_LABELS[field] ?? 'dato';
}

export function getInformationFieldPrompt(field) {
  return FIELD_PROMPTS[field] ?? '¿Cuál es el valor correcto?';
}
