import { ArrowRightIcon, CheckIcon, AlertIcon } from './Icon';

const toneMap = {
  success: {
    wrapper: 'border-[#CFE8D5] bg-white',
    icon: 'bg-[#E6F4EA] text-[#137333]',
    badge: 'bg-[#E6F4EA] text-[#137333]'
  },
  warning: {
    wrapper: 'border-[#F9D7A7] bg-white',
    icon: 'bg-[#FFF4DF] text-[#A15C00]',
    badge: 'bg-[#FFF4DF] text-[#A15C00]'
  },
  danger: {
    wrapper: 'border-[#F6C4B8] bg-white',
    icon: 'bg-[#FCE8E6] text-[#D93025]',
    badge: 'bg-[#FCE8E6] text-[#D93025]'
  }
};

export default function ValidationDocumentCard({
  document,
  variant = 'success',
  actionLabel,
  onAction
}) {
  const tone = toneMap[variant] ?? toneMap.success;
  const firstFile = document.files?.[0];
  const fileCount = document.files?.length ?? 0;

  return (
    <article className={`rounded-[16px] border p-4 shadow-sm sm:p-5 ${tone.wrapper}`}>
      <div className="flex min-w-0 gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone.icon}`}
          aria-hidden="true"
        >
          {variant === 'danger' ? <AlertIcon className="h-5 w-5" /> : <CheckIcon className="h-5 w-5" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-extrabold leading-6 text-[#181C1E] sm:text-[15px]">{document.label}</h4>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${tone.badge}`}>
              {variant === 'success' ? 'Válido' : variant === 'warning' ? 'Requiere revisión' : 'Inválido'}
            </span>
          </div>

          <p className="mt-1 text-sm leading-6 text-[#434751]">{document.validationNote}</p>

          <div className="mt-3 grid gap-1 text-xs leading-5 text-[#586273] sm:grid-cols-2">
            <p>
              <span className="font-semibold text-[#434751]">Archivo:</span>{' '}
              {firstFile ? firstFile.name : 'Sin archivo cargado'}
            </p>
            <p>
              <span className="font-semibold text-[#434751]">Cantidad:</span> {fileCount}
            </p>
            {firstFile ? (
              <>
                <p>
                  <span className="font-semibold text-[#434751]">Tamaño:</span> {firstFile.size}
                </p>
                <p>
                  <span className="font-semibold text-[#434751]">Tipo:</span> {firstFile.type}
                </p>
              </>
            ) : null}
          </div>

          {onAction ? (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="focus-ring inline-flex items-center gap-2 rounded-full border border-[#D9E1EA] bg-white px-3.5 py-2 text-xs font-semibold text-[#003781] transition hover:-translate-y-0.5 hover:shadow-sm"
                onClick={onAction}
              >
                <ArrowRightIcon className="h-4 w-4" />
                {actionLabel}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
