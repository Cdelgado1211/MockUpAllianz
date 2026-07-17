import WizardFooter from './WizardFooter';

function AutoBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700 ring-1 ring-emerald-200">
      IA EXTRAÍDO
    </span>
  );
}

function SectionCard({ eyebrow, title, description, children }) {
  return (
    <section className="rounded-[20px] border border-[#E0E6ED] bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#006494]">{eyebrow}</p>
      <h3 className="mt-1 text-[20px] font-semibold leading-7 text-[#181C1E]">{title}</h3>
      {description ? <p className="mt-2 max-w-4xl text-sm leading-6 text-[#434751]">{description}</p> : null}
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
  type = 'text',
  disabled = false
}) {
  return (
    <FieldFrame label={label} autoIdentified={autoIdentified} error={error} helperText={helperText}>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        readOnly={readOnly}
        disabled={disabled}
        placeholder={placeholder}
        className={`h-12 w-full rounded-xl border px-4 text-sm font-medium text-[#181C1E] outline-none transition placeholder:text-[#97A1AF] focus:ring-2 focus:ring-[#006494] focus:ring-offset-2 focus:ring-offset-white ${
          error
            ? 'border-[#F3B6AA] bg-[#FFF7F6]'
            : readOnly || disabled
              ? 'border-[#E0E6ED] bg-[#F7FAFC] text-[#4B5563]'
              : 'border-[#E0E6ED] bg-white'
        } ${readOnly || disabled ? 'cursor-not-allowed' : ''}`}
      />
    </FieldFrame>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  error,
  helperText,
  autoIdentified = false
}) {
  return (
    <FieldFrame label={label} autoIdentified={autoIdentified} error={error} helperText={helperText}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-12 w-full rounded-xl border px-4 text-sm font-medium text-[#181C1E] outline-none transition focus:ring-2 focus:ring-[#006494] focus:ring-offset-2 focus:ring-offset-white ${
          error ? 'border-[#F3B6AA] bg-[#FFF7F6]' : 'border-[#E0E6ED] bg-white'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldFrame>
  );
}

function ChoiceGroup({ label, value, options, onChange, helperText, error, selectedTone = 'sky' }) {
  return (
    <div className="block">
      <div className="mb-1.5 flex items-start justify-between gap-3">
        <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#5B6573]">{label}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
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
                    : 'border-[#003781] bg-[#003781] text-white shadow-sm shadow-[#003781]/20'
                  : 'border-[#E0E6ED] bg-white text-[#4B5563] hover:border-[#C9D5E2] hover:bg-[#F7FAFC]'
              }`}
              onClick={() => onChange(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-semibold text-[#D93025]">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs leading-5 text-[#6B7280]">{helperText}</p>
      ) : null}
    </div>
  );
}

export default function WizardStepClaim({
  claimant,
  onClaimantChange,
  onBack,
  onSaveDraft,
  onPrimary,
  primaryDisabled = false,
  claimErrors = {},
  selectedTramite
}) {
  const needsSinister = claimant.type === 'Complemento';
  const isSurgery = selectedTramite === 'cirugia_programada';

  return (
    <section className="space-y-4">
      <section className="rounded-[20px] border border-[#E0E6ED] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#006494]">Sección 4 · Reclamación</p>
        <h2 className="mt-1 text-[30px] font-semibold leading-tight text-[#181C1E] sm:text-[32px]">Revisión de reclamación</h2>
        <p className="mt-3 max-w-4xl text-base leading-7 text-[#434751]">
          Completa la información principal del reclamo. Los valores precargados pueden editarse antes de continuar.
        </p>
      </section>

      <SectionCard
        eyebrow="Tipo de reclamación"
        title="Datos de la reclamación"
        description="Selecciona el tipo de reclamo y, si es complemento o cirugía programada, confirma los datos que correspondan."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ChoiceGroup
            label="Tipo de reclamación"
            value={claimant.type}
            options={['Inicial', 'Complemento']}
            onChange={(value) => onClaimantChange('type', value)}
            selectedTone="dark"
          />

          {needsSinister ? (
            <div className="space-y-4">
              <ChoiceGroup
                label="¿Conoces el número de tu siniestro?"
                value={claimant.knowsSinisterNumber}
                options={['Sí', 'No']}
                onChange={(value) => onClaimantChange('knowsSinisterNumber', value)}
                selectedTone="dark"
              />

              {claimant.knowsSinisterNumber === 'Sí' ? (
                <TextInput
                  label="Número de siniestro"
                  value={claimant.sinisterNumber}
                  onChange={(value) => onClaimantChange('sinisterNumber', value)}
                  autoIdentified={claimant.identifiedAutomatically}
                  placeholder="Captura el número"
                  helperText="Ingresa el número si lo conoces."
                  error={claimErrors.sinisterNumber}
                />
              ) : null}
            </div>
          ) : null}

          {isSurgery ? (
            <div className="lg:col-span-2">
              <ChoiceGroup
                label="Lugar de atención"
                value={claimant.attentionPlace}
                options={['Trámite Nacional', 'Trámite Internacional']}
                onChange={(value) => onClaimantChange('attentionPlace', value)}
                selectedTone="dark"
                error={claimErrors.attentionPlace}
              />
            </div>
          ) : null}

          {isSurgery ? (
            <div className="lg:col-span-2">
              <SelectField
                label="Tipo de trámite"
                value={claimant.tramiteType}
                onChange={(value) => onClaimantChange('tramiteType', value)}
                error={claimErrors.tramiteType}
                helperText="Selecciona el tipo de trámite para continuar."
                options={[
                  { value: '', label: '--Seleccione una opción--' },
                  { value: 'Cirugía', label: 'Cirugía' },
                  { value: 'Medicamentos', label: 'Medicamentos' },
                  { value: 'Estudios', label: 'Estudios' },
                  { value: 'Rehabilitación', label: 'Rehabilitación' },
                  { value: 'Enfermería y Home Care', label: 'Enfermería y Home Care' },
                  { value: 'Otros', label: 'Otros' }
                ]}
              />
            </div>
          ) : null}

          {isSurgery && claimant.tramiteType === 'Otros' ? (
            <div className="lg:col-span-2">
              <TextInput
                label="Observaciones"
                value={claimant.observations || ''}
                onChange={(value) => onClaimantChange('observations', value)}
                helperText="Este campo es obligatorio para continuar con tipo de trámite Otros."
                error={claimErrors.observations}
              />
            </div>
          ) : null}
        </div>
      </SectionCard>

      {!isSurgery ? (
        <SectionCard
          eyebrow="Campos de reclamación"
          title="Información de la reclamación"
          description="Los datos precargados siguen siendo editables y se usan para preparar la siguiente etapa del flujo."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Moneda"
              value={claimant.currency}
              onChange={(value) => onClaimantChange('currency', value)}
              autoIdentified={claimant.identifiedAutomatically}
              helperText="Selecciona la moneda de los recibos."
            />

            <TextInput
              label="Monto reclamado"
              value={claimant.claimedAmount}
              onChange={(value) => onClaimantChange('claimedAmount', value)}
              helperText="Puedes ajustar el monto si el valor detectado no es correcto."
            />

            <TextInput
              label="Cantidad de recibos o facturas"
              value={claimant.receiptsCount}
              onChange={(value) => onClaimantChange('receiptsCount', value)}
              helperText="Número total de comprobantes a reembolsar."
            />
          </div>
        </SectionCard>
      ) : null}

      <section className="rounded-[20px] border border-[#CFE8D5] bg-[#F6FBF7] p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#006494] shadow-sm">
            <span className="text-lg font-bold">?</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#006494]">¿Necesitas ayuda?</p>
            <p className="mt-1 text-sm leading-6 text-[#434751]">
              Revisa el tipo de reclamación y completa el número de siniestro solo si aplica a tu caso.
            </p>
          </div>
        </div>
      </section>

      <WizardFooter
        onBack={onBack}
        onSaveDraft={onSaveDraft}
        onPrimary={onPrimary}
        primaryDisabled={primaryDisabled}
        primaryLabel="Continuar"
      />
    </section>
  );
}
