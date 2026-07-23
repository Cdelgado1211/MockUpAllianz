import WizardFooter from './WizardFooter';
import { ClaimInformationSection } from './WizardStepClaim';
import {
  CheckIcon,
  InfoIcon,
  PaymentsIcon,
  SparkIcon
} from './Icon';

function AutoBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700 ring-1 ring-emerald-200">
      IA EXTRAÍDO
    </span>
  );
}

function SectionCard({ icon: Icon, eyebrow, title, description, children, className = '' }) {
  return (
    <section className={`rounded-[20px] border border-[#E0E6ED] bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EDF4FF] text-[#003781]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#006494]">{eyebrow}</p>
          <h3 className="mt-1 text-[20px] font-semibold leading-7 text-[#181C1E]">{title}</h3>
          {description ? <p className="mt-2 max-w-4xl text-sm leading-6 text-[#434751]">{description}</p> : null}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function FieldFrame({ label, autoIdentified, error, helperText, children }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#5B6573]">{label}</span>
        {autoIdentified ? <AutoBadge /> : null}
      </div>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-semibold text-[#D93025]">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs leading-5 text-[#6B7280]">{helperText}</p>
      ) : null}
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
  error,
  helperText,
  autoIdentified = false,
  readOnly = false,
  placeholder,
  type = 'text'
}) {
  return (
    <FieldFrame label={label} autoIdentified={autoIdentified} error={error} helperText={helperText}>
      <input
        type={type}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`h-12 w-full rounded-xl border px-4 text-sm font-medium text-[#181C1E] outline-none transition placeholder:text-[#97A1AF] focus:ring-2 focus:ring-[#006494] focus:ring-offset-2 focus:ring-offset-white ${
          error
            ? 'border-[#F3B6AA] bg-[#FFF7F6]'
            : readOnly
              ? 'border-[#E0E6ED] bg-[#F7FAFC] text-[#4B5563]'
              : 'border-[#E0E6ED] bg-white'
        } ${readOnly ? 'cursor-not-allowed' : ''}`}
      />
    </FieldFrame>
  );
}

function SelectField({ label, value, onChange, options, helperText, autoIdentified = false, error }) {
  return (
    <FieldFrame label={label} autoIdentified={autoIdentified} helperText={helperText}>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={`h-12 w-full rounded-xl border bg-white px-4 text-sm font-medium text-[#181C1E] outline-none transition focus:ring-2 focus:ring-[#006494] focus:ring-offset-2 focus:ring-offset-white ${error ? 'border-[#F3B6AA] bg-[#FFF7F6]' : 'border-[#E0E6ED]'}`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1.5 text-xs font-semibold text-[#D93025]">{error}</p> : null}
    </FieldFrame>
  );
}

function ChoiceGroup({ label, value, options, onChange, helperText, selectedTone = 'sky' }) {
  return (
    <div className="block">
      <div className="mb-1.5 flex items-start justify-between gap-3">
        <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#5B6573]">{label}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              className={`focus-ring inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition ${
                selected
                  ? selectedTone === 'dark'
                    ? 'border-[#003781] bg-[#003781] text-white shadow-sm shadow-[#003781]/20'
                    : selectedTone === 'allianz'
                      ? 'border-[#003781] bg-[#003781] text-white shadow-sm shadow-[#003781]/20'
                      : 'border-[#006494] bg-[#EDF7FF] text-[#003781] shadow-sm'
                  : 'border-[#E0E6ED] bg-white text-[#4B5563] hover:border-[#C9D5E2] hover:bg-[#F7FAFC]'
              }`}
              onClick={() => onChange(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
      {helperText ? <p className="mt-1.5 text-xs leading-5 text-[#6B7280]">{helperText}</p> : null}
    </div>
  );
}

function ManualNameFields({ person, personErrors, onPersonChange }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <TextInput
        label="Nombre"
        value={person.firstName ?? ''}
        onChange={(value) => onPersonChange('firstName', value)}
        error={personErrors.firstName}
        placeholder="Ingresa el nombre"
      />
      <TextInput
        label="Apellido paterno"
        value={person.paternalLastName ?? ''}
        onChange={(value) => onPersonChange('paternalLastName', value)}
        error={personErrors.paternalLastName}
        placeholder="Ingresa el apellido paterno"
      />
      <TextInput
        label="Apellido materno"
        value={person.maternalLastName ?? ''}
        onChange={(value) => onPersonChange('maternalLastName', value)}
        error={personErrors.maternalLastName}
        placeholder="Ingresa el apellido materno"
      />
    </div>
  );
}

function ReadOnlyField({ label, value, autoIdentified = false, helperText = '' }) {
  return (
    <FieldFrame label={label} autoIdentified={autoIdentified} helperText={helperText}>
      <div className="flex h-12 items-center rounded-xl border border-[#E0E6ED] bg-[#F7FAFC] px-4 text-sm font-medium text-[#4B5563]">
        {value || 'No capturado'}
      </div>
    </FieldFrame>
  );
}

function InformationProgress({ fields }) {
  const completed = fields.filter((value) => String(value ?? '').trim()).length;
  const total = fields.length;
  const pending = total - completed;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 100;

  return (
    <section className="rounded-[20px] border border-[#C7D8F1] bg-[#F8FBFF] p-4 shadow-sm sm:p-5" aria-label="Progreso de información">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#006494]">Avance de información</p>
          <p className="mt-1 text-sm font-semibold text-[#181C1E]">{completed} de {total} campos completados</p>
        </div>
        <p className="text-sm font-semibold text-[#586273]">{pending > 0 ? `Te faltan ${pending} datos` : 'Información completa'}</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white" aria-hidden="true">
        <div className="h-full rounded-full bg-[#003781] transition-all" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}

export default function WizardStepInformation({
  policy,
  person,
  contact,
  claimant,
  extracted,
  contactErrors,
  claimErrors = {},
  onPolicyChange,
  onPersonChange,
  onContactChange,
  onClaimantChange,
  selectedTramite,
  onBack,
  onSaveDraft,
  onPrimary,
  primaryDisabled = false
}) {
  const usingAutoData = person.relationship !== 'Otro';
  const personErrors =
    !usingAutoData && person.relationship === 'Otro'
      ? {
          firstName: String(person.firstName ?? '').trim() ? '' : 'Ingresa el nombre.',
          paternalLastName: String(person.paternalLastName ?? '').trim() ? '' : 'Ingresa el apellido paterno.',
          maternalLastName: String(person.maternalLastName ?? '').trim() ? '' : 'Ingresa el apellido materno.'
        }
      : {};
  const informationFields = [
    policy.productType,
    policy.policyNumber,
    person.relationship,
    person.firstName,
    person.paternalLastName,
    person.maternalLastName,
    contact.phoneLandline,
    contact.mobilePhone,
    contact.email,
    contact.emailConfirmation,
    claimant.type
  ];

  if (claimant.type === 'Complemento') {
    informationFields.push(claimant.knowsSinisterNumber);
    if (claimant.knowsSinisterNumber === 'Sí') informationFields.push(claimant.sinisterNumber);
  }

  if (selectedTramite === 'cirugia_programada') {
    informationFields.push(claimant.attentionPlace, claimant.tramiteType);
    if (claimant.tramiteType === 'Otros') informationFields.push(claimant.observations);
  } else {
    informationFields.push(claimant.currency, claimant.claimedAmount, claimant.receiptsCount);
  }

  return (
    <section className="space-y-4">
      <section className="rounded-[20px] border border-[#E0E6ED] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#006494]">Paso 2</p>
        <h2 className="mt-1 text-[30px] font-semibold leading-tight text-[#181C1E] sm:text-[32px]">Información</h2>
        <p className="mt-3 max-w-4xl text-base leading-7 text-[#434751]">
          Completa los datos necesarios para continuar con tu solicitud.
        </p>
      </section>

      <InformationProgress fields={informationFields} />

      <div className="space-y-4">
        <SectionCard
          icon={PaymentsIcon}
          eyebrow="Datos de la póliza"
          title="Información de la póliza"
          description="Mantén a la vista los datos principales del contrato. Los valores detectados automáticamente siguen siendo editables."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <ChoiceGroup
              label="Tipo de producto"
              value={policy.productType}
              options={['Individual', 'Colectiva']}
              onChange={(value) => onPolicyChange('productType', value)}
              selectedTone="allianz"
            />

            <TextInput
              label="Número de póliza"
              value={policy.policyNumber}
              onChange={(value) => onPolicyChange('policyNumber', value)}
              autoIdentified={policy.identifiedAutomatically}
              helperText="Puedes corregirlo si el OCR detectó un dato distinto."
            />
          </div>
        </SectionCard>

        <SectionCard
          icon={SparkIcon}
          eyebrow="Persona solicitante"
          title="Persona que realiza el trámite"
          description="Selecciona quién solicita el trámite y reutiliza la información detectada cuando corresponda."
        >
          <div className="space-y-5">
            <ChoiceGroup
              label="¿La persona que solicita este trámite es el titular o el afectado?"
              value={person.relationship}
              options={['Titular', 'Afectado', 'Otro']}
              onChange={(value) => onPersonChange('relationship', value)}
              selectedTone="dark"
            />

            {usingAutoData ? (
              <div className="rounded-[20px] border border-[#D7E4F2] bg-[#F7FAFC] p-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <TextInput
                    label="Nombre"
                    value={person.firstName}
                    onChange={(value) => onPersonChange('firstName', value)}
                    autoIdentified
                    helperText="El sistema reutiliza el nombre detectado en los documentos, pero puedes corregirlo si es necesario."
                  />
                  <TextInput
                    label="Apellido paterno"
                    value={person.paternalLastName}
                    onChange={(value) => onPersonChange('paternalLastName', value)}
                    autoIdentified
                    helperText="Puedes corregirlo si el OCR detectó un dato distinto."
                  />
                  <TextInput
                    label="Apellido materno"
                    value={person.maternalLastName}
                    onChange={(value) => onPersonChange('maternalLastName', value)}
                    autoIdentified
                    helperText="Puedes corregirlo si el OCR detectó un dato distinto."
                  />
                </div>
              </div>
            ) : (
              <ManualNameFields person={person} personErrors={personErrors} onPersonChange={onPersonChange} />
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        icon={InfoIcon}
        eyebrow="Contacto"
        title="Datos de contacto"
        description="Verifica que los datos de contacto estén vigentes para que el trámite pueda continuar sin fricción."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="Teléfono particular"
            value={contact.phoneLandline}
            onChange={(value) => onContactChange('phoneLandline', value)}
            placeholder="10 dígitos"
            error={contactErrors.phoneLandline}
          />
          <TextInput
            label="Teléfono celular"
            value={contact.mobilePhone}
            onChange={(value) => onContactChange('mobilePhone', value)}
            placeholder="10 dígitos"
            error={contactErrors.mobilePhone}
          />
          <TextInput
            label="Correo electrónico"
            value={contact.email}
            onChange={(value) => onContactChange('email', value)}
            type="email"
            error={contactErrors.email}
          />
          <TextInput
            label="Confirmación de correo"
            value={contact.emailConfirmation}
            onChange={(value) => onContactChange('emailConfirmation', value)}
            type="email"
            error={contactErrors.emailConfirmation}
          />
        </div>
      </SectionCard>

      <ClaimInformationSection
        claimant={claimant}
        onClaimantChange={onClaimantChange}
        claimErrors={claimErrors}
        selectedTramite={selectedTramite}
      />

      <SectionCard
        icon={CheckIcon}
        eyebrow="Datos detectados"
        title="Datos identificados automáticamente"
        description="Estos datos fueron precargados por el sistema y puedes revisarlos antes de avanzar."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <ReadOnlyField label="Relación" value={person.relationship} autoIdentified />
          <ReadOnlyField label="Nombre completo" value={person.fullName} autoIdentified />
          <ReadOnlyField
            label="Contacto detectado"
            value={person.contactAutoIdentified ? 'Sí' : 'No'}
            autoIdentified={person.contactAutoIdentified}
            helperText="El sistema detectó información para reutilizarla en el trámite."
          />
        </div>
      </SectionCard>

      <section className="rounded-[20px] border border-[#CFE8D5] bg-[#F6FBF7] p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#006494] shadow-sm">
            <InfoIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#006494]">¿Necesitas ayuda?</p>
            <p className="mt-1 text-sm leading-6 text-[#434751]">
              Si algún dato no es correcto, puedes editarlo antes de continuar.
            </p>
          </div>
        </div>
      </section>

      <WizardFooter
        onBack={onBack}
        onSaveDraft={onSaveDraft}
        onPrimary={onPrimary}
        primaryDisabled={primaryDisabled}
        primaryLabel="Siguiente"
      />
    </section>
  );
}
