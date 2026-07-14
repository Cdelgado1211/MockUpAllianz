import WizardFooter from './WizardFooter';

function ReviewCard({ title, children, onEdit, editLabel = 'Editar' }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
        <button
          type="button"
          className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-800 transition hover:bg-sky-100"
          onClick={onEdit}
        >
          {editLabel}
        </button>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function WizardStepReview({
  policy,
  person,
  contact,
  claimant,
  documents,
  alerts,
  reviewConfirmed,
  onReviewConfirmedChange,
  recaptchaVisual,
  onBack,
  onSaveDraft,
  onPrimary,
  onEditStep,
  onConfirmAndSendDisabled,
  acceptedAlerts = []
}) {
  const loadedDocuments = documents.filter((document) => document.files.length > 0);
  const pendingAlerts = alerts.filter((alert) => alert.status === 'active' && !acceptedAlerts.includes(alert.id));

  return (
    <section className="space-y-4">
      <div className="rounded-[2rem] border border-sky-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-700">Sección 5 · Revisión</p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Resumen final antes de enviar</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
          Revisa la información capturada, confirma que es correcta y continúa al siguiente proceso.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReviewCard title="Información de la póliza" onEdit={() => onEditStep(2)}>
          <p className="text-sm leading-6 text-slate-700">
            <span className="font-bold">Tipo de producto:</span> {policy.productType}
            <br />
            <span className="font-bold">Número de póliza:</span> {policy.policyNumber}
          </p>
        </ReviewCard>

        <ReviewCard title="Persona que realiza el trámite" onEdit={() => onEditStep(2)}>
          <p className="text-sm leading-6 text-slate-700">
            <span className="font-bold">Relación:</span> {person.relationship}
            <br />
            <span className="font-bold">Nombre:</span> {person.relationship === 'Otro' ? `${person.firstName} ${person.paternalLastName} ${person.maternalLastName}` : person.fullName}
          </p>
        </ReviewCard>

        <ReviewCard title="Datos de contacto" onEdit={() => onEditStep(2)}>
          <p className="text-sm leading-6 text-slate-700">
            <span className="font-bold">Teléfono fijo:</span> {contact.phoneLandline || 'Sin capturar'}
            <br />
            <span className="font-bold">Celular:</span> {contact.mobilePhone || 'Sin capturar'}
            <br />
            <span className="font-bold">Correo:</span> {contact.email || 'Sin capturar'}
          </p>
        </ReviewCard>

        <ReviewCard title="Información de la reclamación" onEdit={() => onEditStep(3)}>
          <p className="text-sm leading-6 text-slate-700">
            <span className="font-bold">Tipo:</span> {claimant.type}
            <br />
            <span className="font-bold">Siniestro:</span> {claimant.sinisterNumber || 'No capturado'}
            <br />
            <span className="font-bold">Moneda:</span> {claimant.currency}
            <br />
            <span className="font-bold">Monto:</span> {claimant.claimedAmount}
            <br />
            <span className="font-bold">Recibos:</span> {claimant.receiptsCount}
          </p>
        </ReviewCard>
      </div>

      <ReviewCard title="Documentos cargados" onEdit={() => onEditStep(0)}>
        <div className="grid gap-3 md:grid-cols-2">
          {loadedDocuments.map((document) => (
            <div key={document.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <p className="font-bold text-slate-900">{document.label}</p>
              <p className="mt-1 text-xs text-slate-500">
                {document.files.length} archivo(s) · {document.validationNote}
              </p>
            </div>
          ))}
        </div>
      </ReviewCard>

      <ReviewCard title="Alertas pendientes" onEdit={() => onEditStep(1)}>
        <div className="space-y-3">
          {pendingAlerts.length > 0 ? (
            pendingAlerts.map((alert) => (
              <div key={alert.id} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
                <p className="font-bold text-amber-900">{alert.title}</p>
                <p className="mt-1 text-xs text-amber-900/80">
                  {alert.sourceDocument} vs. {alert.comparedDocument}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              No hay alertas pendientes.
            </div>
          )}
        </div>
      </ReviewCard>

      <ReviewCard title="Alertas aceptadas por el usuario" onEdit={() => onEditStep(1)}>
        {acceptedAlerts.length > 0 ? (
          <div className="grid gap-3">
            {acceptedAlerts.map((alertId) => {
              const alert = alerts.find((item) => item.id === alertId);
              if (!alert) return null;
              return (
                <div key={alert.id} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  <p className="font-bold">{alert.title}</p>
                  <p className="mt-1 text-xs text-emerald-900/80">Marcada como aceptada por el usuario.</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Aún no se han aceptado alertas.
          </div>
        )}
      </ReviewCard>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-500"
            checked={reviewConfirmed}
            onChange={(event) => onReviewConfirmedChange(event.target.checked)}
          />
          <span className="text-sm leading-6 text-slate-700">
            Confirmo que la información proporcionada es correcta.
          </span>
        </label>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Google reCAPTCHA v3</p>
          <p className="mt-1 text-sm text-slate-700">Protección automática simulada para evitar envíos no deseados.</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
            Verificado en esta demostración
          </div>
        </div>
      </section>

      <WizardFooter
        onBack={onBack}
        onSaveDraft={onSaveDraft}
        onPrimary={onPrimary}
        backLabel="Regresar"
        saveLabel="Guardar y continuar después"
        primaryLabel="Confirmar y enviar"
        primaryDisabled={onConfirmAndSendDisabled}
        primaryTone="green"
      />
    </section>
  );
}
