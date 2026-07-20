import { ChevronRightIcon, CheckIcon, TimelineIcon, AlertIcon } from './Icon';

const stepLabels = ['Documentos', 'Validación', 'Información', 'Reclamación', 'Revisión'];

const stageLabels = {
  welcome: 'Bienvenida',
  'flow-intro': 'Guía inicial',
  formats: 'Formatos',
  documents: 'Documentos',
  'validation-processing': 'Validando',
  'validation-results': 'Resultados',
  'information-policy': 'Información',
  'information-requester': 'Información',
  'information-contact': 'Información',
  claim: 'Reclamación',
  review: 'Revisión',
  submitting: 'Enviando',
  success: 'Confirmación final',
  'out-of-scope': 'Ayuda externa',
  info: 'Información'
};

function StepDot({ status, index }) {
  if (status === 'done') {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E6F4EA] text-[#137333]">
        <CheckIcon className="h-4 w-4" />
      </span>
    );
  }

  if (status === 'active') {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#003781] text-white shadow-sm shadow-[#003781]/15">
        {index + 1}
      </span>
    );
  }

  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#C7CDD6] bg-[#F2F4F7] text-[#434751]">
      {index + 1}
    </span>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#E0E6ED] bg-[#F7FAFC] px-3 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6B7280]">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-[#181C1E]">{value}</p>
    </div>
  );
}

export default function ChatContextPanel({
  collapsed,
  onToggleCollapsed,
  flow,
  stage,
  progressIndex = -1,
  documents = [],
  alerts = [],
  policy = null,
  person = null,
  contact = null,
  claimant = null
}) {
  const completedSteps = progressIndex < 0 ? -1 : progressIndex - 1;
  const currentStep = progressIndex < 0 ? 0 : Math.min(progressIndex + 1, stepLabels.length);
  const loadedDocuments = documents.filter((document) => document.files?.length).length;

  return (
    <aside
      className={`hidden h-full shrink-0 border-l border-[#DDE5EF] bg-[#F7FAFC]/95 backdrop-blur-sm transition-all duration-300 xl:flex ${
        collapsed ? 'w-[96px]' : 'w-[336px]'
      } flex-col`}
    >
      {collapsed ? (
        <div className="border-b border-[#E0E6ED] px-2 py-3">
          <button
            type="button"
            className="focus-ring group relative mx-auto flex w-[72px] flex-col items-center rounded-2xl border border-[#DDE5EF] bg-white px-2 py-3 text-[#003781] shadow-sm transition hover:border-[#9BB9DF] hover:bg-[#F4F8FF]"
            onClick={onToggleCollapsed}
            aria-label="Abrir avance y resumen del trámite"
            aria-expanded="false"
            title="Ver avance y resumen del trámite"
          >
            <TimelineIcon className="h-5 w-5" />
            <span className="mt-1.5 text-[11px] font-bold">Avance</span>
            <span className="mt-0.5 text-[10px] font-semibold text-[#6B7280]">
              {currentStep > 0 ? `${currentStep} de ${stepLabels.length}` : 'Sin iniciar'}
            </span>
            <span className="absolute right-1.5 top-1.5 text-[#6B7280] transition group-hover:-translate-x-0.5 group-hover:text-[#003781]" aria-hidden="true">
              <ChevronRightIcon className="h-3.5 w-3.5 rotate-180" />
            </span>
          </button>
        </div>
      ) : (
        <div className="border-b border-[#E0E6ED] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#003781]">
                <TimelineIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#006494]">Avance del trámite</p>
                <p className="mt-0.5 truncate text-sm font-semibold text-[#181C1E]">Progreso y resumen</p>
              </div>
            </div>
            <button
              type="button"
              className="focus-ring inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DDE5EF] bg-white text-[#003781] transition hover:bg-[#F4F8FF]"
              onClick={onToggleCollapsed}
              aria-label="Contraer avance y resumen del trámite"
              aria-expanded="true"
              title="Contraer panel"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {collapsed ? (
        <div className="flex flex-1 flex-col items-center gap-3 px-2 py-4" aria-label="Resumen compacto del trámite">
          <div className="w-[72px] rounded-2xl border border-[#E0E6ED] bg-white px-2 py-3 text-center">
            <p className="text-lg font-bold leading-none text-[#003781]">{loadedDocuments}</p>
            <p className="mt-1 text-[10px] font-semibold leading-4 text-[#6B7280]">Documentos</p>
          </div>
          <div className="w-[72px] rounded-2xl border border-[#E0E6ED] bg-white px-2 py-3 text-center">
            <p className={`text-lg font-bold leading-none ${alerts.length > 0 ? 'text-[#B45309]' : 'text-[#137333]'}`}>{alerts.length}</p>
            <p className="mt-1 text-[10px] font-semibold leading-4 text-[#6B7280]">Alertas</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <section className="rounded-[20px] border border-[#E0E6ED] bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#006494]">Progreso</p>
            <div className="mt-3 space-y-2">
              {stepLabels.map((label, index) => {
                const status = index < progressIndex ? 'done' : index === progressIndex ? 'active' : 'pending';
                return (
                  <div
                    key={label}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${
                      status === 'active' ? 'bg-[#F4F8FF]' : 'bg-transparent'
                    }`}
                  >
                    <StepDot status={status} index={index} />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${status === 'active' ? 'text-[#003781]' : 'text-[#434751]'}`}>
                        {label}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {status === 'done' ? 'Completado' : status === 'active' ? 'En curso' : 'Pendiente'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[20px] border border-[#E0E6ED] bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#006494]">Resumen</p>
            <div className="mt-3 space-y-3">
              <SummaryRow label="Trámite" value={flow === 'cirugia_programada' ? 'Cirugía Programada' : flow === 'reembolso' ? 'Reembolso' : 'Sin definir'} />
              <SummaryRow label="Etapa" value={stageLabels[stage] ?? 'Sin definir'} />
              <SummaryRow label="Documentos" value={`${loadedDocuments} cargados`} />
              <SummaryRow label="Alertas" value={`${alerts.length} activas`} />
            </div>
          </section>

          {alerts.length > 0 ? (
            <section className="rounded-[20px] border border-[#F4D58A] bg-white p-4 shadow-sm" aria-live="polite">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#006494]">Alertas detectadas</p>
                <span className="rounded-full bg-[#FFF4D6] px-2 py-1 text-[11px] font-bold text-[#8A4B08]">{alerts.length}</span>
              </div>
              <div className="mt-3 space-y-2">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-2 rounded-xl border border-[#E0E6ED] bg-[#F7FAFC] px-3 py-2">
                    <AlertIcon className={`mt-0.5 h-4 w-4 shrink-0 ${alert.severity === 'critical' ? 'text-[#D93025]' : 'text-[#A15C00]'}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-4 text-[#181C1E]">{alert.title}</p>
                      {alert.reason ? <p className="mt-1 text-[11px] leading-4 text-[#6B7280]">{alert.reason}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-[20px] border border-[#E0E6ED] bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#006494]">Datos capturados</p>
            <div className="mt-3 space-y-3 text-sm leading-6 text-[#434751]">
              <p>
                <span className="font-semibold text-[#181C1E]">Póliza:</span>{' '}
                {policy?.policyNumber || 'Pendiente'}
              </p>
              <p>
                <span className="font-semibold text-[#181C1E]">Solicitante:</span>{' '}
                {person?.fullName || 'Pendiente'}
              </p>
              <p>
                <span className="font-semibold text-[#181C1E]">Contacto:</span>{' '}
                {contact?.email || contact?.mobilePhone || 'Pendiente'}
              </p>
              <p>
                <span className="font-semibold text-[#181C1E]">Reclamación:</span>{' '}
                {claimant?.type || 'Pendiente'}
              </p>
            </div>
          </section>

          <section className="rounded-[20px] border border-[#E0E6ED] bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#006494]">Siguiente paso</p>
            <p className="mt-2 text-sm leading-6 text-[#434751]">
              {progressIndex === -1
                ? 'Selecciona una ruta para comenzar.'
                : progressIndex === 0
                  ? 'Adjunta los documentos necesarios.'
                  : progressIndex === 1
                    ? 'Revisa los resultados de validación.'
                    : progressIndex === 2
                      ? 'Completa tus datos de información.'
                      : progressIndex === 3
                        ? 'Captura la información de la reclamación.'
                        : 'Revisa y confirma el envío.'}
            </p>
          </section>
        </div>
      )}
    </aside>
  );
}
