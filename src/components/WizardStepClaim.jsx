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

export default function WizardStepClaim({
  claimant,
  onClaimantChange,
  onBack,
  onSaveDraft,
  onPrimary,
  primaryDisabled = false,
  claimError = ''
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-[2rem] border border-sky-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-700">Sección 4 · Reclamación</p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Datos de la reclamación</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
          Completa la información principal del reclamo. Los valores precargados pueden editarse.
        </p>
      </div>

      <SmallCard title="Tipo y monto de la reclamación">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Tipo de reclamación</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {['Inicial', 'Complemento'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                    claimant.type === option
                      ? 'border-sky-300 bg-sky-50 text-sky-900'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => onClaimantChange('type', option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {claimant.type === 'Complemento' && (
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">¿Conoces el número de tu siniestro?</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {['Sí', 'No'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                      claimant.knowsSinisterNumber === option
                        ? 'border-sky-300 bg-sky-50 text-sky-900'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                    onClick={() => onClaimantChange('knowsSinisterNumber', option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </SmallCard>

      <SmallCard title="Campos de reclamación">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Número de siniestro"
            value={claimant.sinisterNumber}
            onChange={(value) => onClaimantChange('sinisterNumber', value)}
            placeholder="Opcional si no lo conoces"
            helperText={claimant.type === 'Complemento' && claimant.knowsSinisterNumber === 'Sí' ? undefined : 'Puede permanecer vacío si no se conoce.'}
            error={claimError}
            disabled={claimant.type === 'Complemento' && claimant.knowsSinisterNumber === 'No'}
          />

          <FormField
            label="Moneda"
            value={claimant.currency}
            onChange={(value) => onClaimantChange('currency', value)}
            helperText="Selecciona la moneda de los recibos."
          />

          <FormField
            label="Monto reclamado"
            value={claimant.claimedAmount}
            onChange={(value) => onClaimantChange('claimedAmount', value)}
            helperText="Captura solo números o formato libre para la demostración."
          />

          <FormField
            label="Cantidad de recibos o facturas"
            value={claimant.receiptsCount}
            onChange={(value) => onClaimantChange('receiptsCount', value)}
            helperText="Número total de comprobantes a reembolsar."
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
