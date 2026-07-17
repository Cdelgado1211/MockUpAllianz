import { ChevronRightIcon, CheckIcon, SparkIcon, TimelineIcon } from './Icon';

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

  return (
    <aside
      className={`hidden h-full shrink-0 border-l border-[#DDE5EF] bg-[#F7FAFC]/95 backdrop-blur-sm transition-all duration-300 xl:flex ${
        collapsed ? 'w-[96px]' : 'w-[336px]'
      } flex-col`}
    >
      <div className="border-b border-[#E0E6ED] px-4 py-4">
        <div className={`flex items-center justify-between gap-3 ${collapsed ? 'justify-center' : ''}`}>
          {!collapsed ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#006494]">Panel contextual</p>
              <p className="mt-1 text-sm font-semibold text-[#181C1E]">Estado del trámite</p>
            </div>
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#003781]">
              <TimelineIcon className="h-5 w-5" />
            </div>
          )}

          <button
            type="button"
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#DDE5EF] bg-white text-[#003781] transition hover:bg-[#F4F8FF]"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expandir panel contextual' : 'Contraer panel contextual'}
          >
            <ChevronRightIcon className={`h-4 w-4 transition ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {collapsed ? (
        <div className="flex flex-1 items-center justify-center px-3 py-6 text-center">
          <div>
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#003781]">
              <SparkIcon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-xs font-semibold text-[#434751]">Panel de resumen</p>
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
              <SummaryRow label="Documentos" value={`${documents.filter((doc) => doc.files?.length).length} cargados`} />
              <SummaryRow label="Alertas" value={`${alerts.length} activas`} />
            </div>
          </section>

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
