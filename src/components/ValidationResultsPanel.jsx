import AlertCard from './AlertCard';

function SummaryTile({ label, value, tone = 'slate' }) {
  const toneMap = {
    slate: 'bg-slate-50 text-slate-900',
    green: 'bg-emerald-50 text-emerald-900',
    amber: 'bg-amber-50 text-amber-900',
    red: 'bg-rose-50 text-rose-900',
    blue: 'bg-sky-50 text-sky-900'
  };

  return (
    <div className={`rounded-2xl px-4 py-4 ${toneMap[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

export default function ValidationResultsPanel({
  summary,
  correctDocuments,
  reviewDocuments,
  alerts,
  onResolveAlert,
  onEditDocument,
  onViewDocument,
  onIgnoreAlert
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-[2rem] border border-sky-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-700">Resultados de IA</p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Validación inteligente</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Esta es una simulación visual del análisis de documentos, coincidencias cruzadas y alertas detectadas.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Documentos procesados con reglas de negocio simuladas
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <SummaryTile label="Procesados" value={summary.processed} tone="blue" />
          <SummaryTile label="Validados" value={summary.validated} tone="green" />
          <SummaryTile label="Con observaciones" value={summary.review} tone="amber" />
          <SummaryTile label="Ilegibles" value={summary.illegible} tone="red" />
          <SummaryTile label="Alertas" value={summary.alerts} tone="slate" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-emerald-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-lg font-extrabold text-slate-900">A. Documentos correctos</h3>
          <div className="mt-4 space-y-3">
            {correctDocuments.length > 0 ? (
              correctDocuments.map((document) => (
                <div key={document.id} className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-emerald-900">{document.label}</p>
                      <p className="mt-1 text-xs text-emerald-900/70">{document.validationNote}</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                      onClick={() => onViewDocument(document)}
                    >
                      Visualizar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 px-4 py-8 text-sm text-emerald-900/70">
                Aún no hay documentos validados.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-amber-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-lg font-extrabold text-slate-900">B. Documentos que requieren revisión</h3>
          <div className="mt-4 space-y-3">
            {reviewDocuments.length > 0 ? (
              reviewDocuments.map((document) => (
                <div key={document.id} className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-amber-900">{document.label}</p>
                      <p className="mt-1 text-xs text-amber-900/70">{document.validationNote}</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100"
                      onClick={() => onEditDocument(document)}
                    >
                      Corregir dato
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-4 py-8 text-sm text-amber-900/70">
                No hay documentos que requieran revisión.
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] border border-rose-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">C. Diferencias encontradas</h3>
            <p className="mt-1 text-sm text-slate-600">
              Puedes revisar cada alerta, corregir datos o continuar de todas formas.
            </p>
          </div>
          <div className="text-sm font-semibold text-slate-500">
            {alerts.length} alertas activas en esta simulación
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onResolve={() => onResolveAlert(alert)}
              onView={() => onViewDocument({ label: alert.sourceDocument, validationNote: alert.reason, files: [] })}
              onIgnore={() => onIgnoreAlert(alert.id)}
            />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
              No se detectaron diferencias.
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
