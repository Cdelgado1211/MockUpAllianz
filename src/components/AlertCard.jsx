import { AlertIcon } from './Icon';

const severityStyles = {
  critical: 'border-rose-200 bg-rose-50 text-rose-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-sky-200 bg-sky-50 text-sky-900'
};

export default function AlertCard({ alert, onResolve, onView, onIgnore }) {
  return (
    <article className={`rounded-3xl border p-4 shadow-sm ${severityStyles[alert.severity] ?? severityStyles.warning}`}>
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-current">
          <AlertIcon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-extrabold leading-6">{alert.title}</h4>
            <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em]">
              {alert.severity === 'critical' ? 'Crítica' : 'Advertencia'}
            </span>
          </div>

          <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-700">
            <p>
              <span className="font-bold">Dato con inconveniente:</span> {alert.field}
            </p>
            <p>
              <span className="font-bold">Documento de origen:</span> {alert.sourceDocument}
            </p>
            <p>
              <span className="font-bold">Documento comparado:</span> {alert.comparedDocument}
            </p>
            <p>
              <span className="font-bold">Motivo:</span> {alert.reason}
            </p>
            <p>
              <span className="font-bold">Recomendación:</span> {alert.recommendation}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-800 transition hover:bg-white"
              onClick={onResolve}
            >
              {alert.defaultAction}
            </button>
            <button
              type="button"
              className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-800 transition hover:bg-white"
              onClick={onView}
            >
              Visualizar documento
            </button>
            <button
              type="button"
              className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-800 transition hover:bg-white"
              onClick={onIgnore}
            >
              Ignorar y continuar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
