import WizardFooter from './WizardFooter';
import FormField from './FormField';

function SmallCard({ title, children }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
      <div className="mt-4">{children}</div>
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
  onPolicyChange,
  onPersonChange,
  onContactChange,
  onClaimantChange,
  onBack,
  onSaveDraft,
  onPrimary,
  primaryDisabled = false
}) {
  const usingAutoData = person.relationship !== 'Otro';
  const personErrors =
    !usingAutoData && person.relationship === 'Otro'
      ? {
          firstName: person.firstName.trim() ? '' : 'Ingresa el nombre.',
          paternalLastName: person.paternalLastName.trim() ? '' : 'Ingresa el apellido paterno.',
          maternalLastName: person.maternalLastName.trim() ? '' : 'Ingresa el apellido materno.'
        }
      : {};

  return (
    <section className="space-y-4">
      <div className="rounded-[2rem] border border-sky-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-700">Sección 3 · Información</p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Captura y edición de datos identificados</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
          Los datos extraídos por OCR aparecen precargados y se pueden corregir manualmente cuando sea necesario.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SmallCard title="Información de la póliza">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Tipo de producto</span>
              <select
                value={policy.productType}
                onChange={(event) => onPolicyChange('productType', event.target.value)}
                className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900"
              >
                <option value="Individual">Individual</option>
                <option value="Colectiva">Colectiva</option>
              </select>
            </label>
            <FormField
              label="Número de póliza"
              value={policy.policyNumber}
              onChange={(value) => onPolicyChange('policyNumber', value)}
              autoIdentified={policy.identifiedAutomatically}
              helperText="Puedes corregirlo si el OCR detectó un dato distinto."
            />
          </div>
        </SmallCard>

        <SmallCard title="Persona que realiza el trámite">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                ¿La persona que solicita este trámite es el titular o el afectado?
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {['Titular', 'Afectado', 'Otro'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                      person.relationship === option
                        ? 'border-sky-300 bg-sky-50 text-sky-900'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                    onClick={() => onPersonChange('relationship', option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {usingAutoData ? (
              <div className="space-y-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-4">
                <FormField
                  label="Nombre completo"
                  value={extracted.person.fullName}
                  onChange={() => {}}
                  readOnly
                  autoIdentified
                />
                <p className="text-sm leading-6 text-slate-600">
                  El sistema reutiliza el nombre identificado en los documentos y solo te pide validar los contactos faltantes.
                </p>
                <button
                  type="button"
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-sky-800 transition hover:bg-sky-100"
                  onClick={() => onPersonChange('relationship', 'Otro')}
                >
                  Editar manualmente
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  label="Nombre"
                  value={person.firstName}
                  onChange={(value) => onPersonChange('firstName', value)}
                  error={personErrors.firstName}
                />
                <FormField
                  label="Apellido paterno"
                  value={person.paternalLastName}
                  onChange={(value) => onPersonChange('paternalLastName', value)}
                  error={personErrors.paternalLastName}
                />
                <FormField
                  label="Apellido materno"
                  value={person.maternalLastName}
                  onChange={(value) => onPersonChange('maternalLastName', value)}
                  error={personErrors.maternalLastName}
                />
              </div>
            )}
          </div>
        </SmallCard>
      </div>

      <SmallCard title="Datos de contacto">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Teléfono particular"
            value={contact.phoneLandline}
            onChange={(value) => onContactChange('phoneLandline', value)}
            placeholder="10 dígitos"
            error={contactErrors.phoneLandline}
          />
          <FormField
            label="Teléfono celular"
            value={contact.mobilePhone}
            onChange={(value) => onContactChange('mobilePhone', value)}
            placeholder="10 dígitos"
            error={contactErrors.mobilePhone}
          />
          <FormField
            label="Correo electrónico"
            value={contact.email}
            onChange={(value) => onContactChange('email', value)}
            type="email"
            error={contactErrors.email}
          />
          <FormField
            label="Confirmación de correo"
            value={contact.emailConfirmation}
            onChange={(value) => onContactChange('emailConfirmation', value)}
            type="email"
            error={contactErrors.emailConfirmation}
          />
        </div>
      </SmallCard>

      <SmallCard title="Datos identificados automáticamente">
        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Relación" value={person.relationship} onChange={(value) => onPersonChange('relationship', value)} readOnly />
          <FormField label="Nombre completo" value={person.fullName} onChange={() => {}} readOnly autoIdentified />
          <FormField
            label="Contacto detectado"
            value={person.contactAutoIdentified ? 'Sí' : 'No'}
            onChange={() => {}}
            readOnly
            autoIdentified
          />
        </div>
      </SmallCard>

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
