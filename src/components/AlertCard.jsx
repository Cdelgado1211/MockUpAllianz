import { useState } from 'react';
import { AlertIcon, ChevronRightIcon, ArrowRightIcon } from './Icon';

const severityStyles = {
  critical: {
    wrapper: 'border-[#F6C4B8] bg-white',
    icon: 'bg-[#FCE8E6] text-[#D93025]',
    badge: 'bg-[#FCE8E6] text-[#D93025]',
    title: 'text-[#9A1C2E]'
  },
  warning: {
    wrapper: 'border-[#F9D7A7] bg-white',
    icon: 'bg-[#FFF4DF] text-[#A15C00]',
    badge: 'bg-[#FFF4DF] text-[#A15C00]',
    title: 'text-[#181C1E]'
  },
  info: {
    wrapper: 'border-[#C7D8F1] bg-white',
    icon: 'bg-[#EFF6FF] text-[#003781]',
    badge: 'bg-[#EFF6FF] text-[#003781]',
    title: 'text-[#003781]'
  }
};

export default function AlertCard({ alert, onResolve, onIgnore }) {
  const [expanded, setExpanded] = useState(false);
  const tone = severityStyles[alert.severity] ?? severityStyles.warning;

  return (
    <article className={`rounded-[16px] border p-4 shadow-sm sm:p-5 ${tone.wrapper}`}>
      <div className="flex min-w-0 gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone.icon}`} aria-hidden="true">
          <AlertIcon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            className="focus-ring flex w-full items-start justify-between gap-3 text-left"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            <div className="flex flex-wrap items-center gap-2">
              <h4 className={`text-sm font-extrabold leading-6 sm:text-[15px] ${tone.title}`}>{alert.title}</h4>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${tone.badge}`}>
                {alert.severity === 'critical' ? 'Crítica' : alert.severity === 'info' ? 'Informativa' : 'Advertencia'}
              </span>
            </div>
            <ChevronRightIcon className={`mt-0.5 h-5 w-5 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''} ${tone.title}`} />
          </button>

          <p className="mt-1 text-sm leading-6 text-[#434751]">{alert.reason}</p>

          {!expanded ? (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="focus-ring inline-flex items-center gap-2 rounded-full border border-[#D9E1EA] bg-white px-3.5 py-2 text-xs font-semibold text-[#003781] transition hover:-translate-y-0.5 hover:shadow-sm"
                onClick={onResolve}
              >
                <ArrowRightIcon className="h-4 w-4" />
                Corregir dato
              </button>
            </div>
          ) : (
            <>
              <div className="mt-3 grid gap-2 text-xs leading-5 text-[#586273]">
                <p>
                  <span className="font-semibold text-[#434751]">Dato con inconveniente:</span> {alert.field}
                </p>
                <p>
                  <span className="font-semibold text-[#434751]">Documento de origen:</span> {alert.sourceDocument}
                </p>
                <p>
                  <span className="font-semibold text-[#434751]">Documento comparado:</span> {alert.comparedDocument}
                </p>
                <p>
                  <span className="font-semibold text-[#434751]">Recomendación:</span> {alert.recommendation}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  className="focus-ring inline-flex items-center gap-2 rounded-full border border-[#D9E1EA] bg-white px-3.5 py-2 text-xs font-semibold text-[#003781] transition hover:-translate-y-0.5 hover:shadow-sm"
                  onClick={onResolve}
                >
                  <ArrowRightIcon className="h-4 w-4" />
                  Corregir dato
                </button>
                <button
                  type="button"
                  className="focus-ring rounded-full border border-[#D9E1EA] bg-white px-3.5 py-2 text-xs font-semibold text-[#434751] transition hover:-translate-y-0.5 hover:shadow-sm"
                  onClick={onIgnore}
                >
                  Ignorar y continuar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
