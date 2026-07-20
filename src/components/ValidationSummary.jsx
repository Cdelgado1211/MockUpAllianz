function SummaryTile({ label, value, tone = 'slate', hint }) {
  const toneMap = {
    slate: 'border-[#E0E6ED] bg-white text-[#181C1E]',
    green: 'border-[#CFE8D5] bg-white text-[#137333]',
    amber: 'border-[#F9D7A7] bg-white text-[#A15C00]',
    red: 'border-[#F6C4B8] bg-white text-[#D93025]',
    blue: 'border-[#C7D8F1] bg-white text-[#003781]'
  };

  return (
    <div className={`rounded-[14px] border px-4 py-4 shadow-sm ${toneMap[tone]}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-70">{label}</p>
      <p className="mt-1 text-[26px] font-extrabold leading-none">{value}</p>
      {hint ? <p className="mt-2 text-xs font-medium opacity-80">{hint}</p> : null}
    </div>
  );
}

export default function ValidationSummary({ summary }) {
  return (
    <section className="mx-auto w-full max-w-[980px] rounded-[20px] border border-[#E0E6ED] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#006494]">Resumen</p>
          <h2 className="mt-1 text-[22px] font-semibold leading-7 text-[#181C1E] sm:text-[26px]">Ya revisé tus documentos</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#434751]">
            Aquí tienes lo más importante para decidir si continúas o corriges algo.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full bg-[#EFF6FF] px-4 py-2 text-sm font-semibold text-[#003781]">
          {summary.processing > 0 ? 'Proceso en análisis' : 'Proceso completado'}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryTile label="Cargados" value={summary.processed} tone="blue" hint="Con archivo adjunto" />
        <SummaryTile label="Validados" value={summary.validated} tone="green" hint="Coincidieron con las reglas" />
        <SummaryTile label="Revisión" value={summary.review} tone="amber" hint="Requieren atención" />
        <SummaryTile label="Pendientes" value={summary.pending} tone="slate" hint="Sin archivo todavía" />
        <SummaryTile label="Alertas" value={summary.alerts} tone="red" hint="Diferencias activas" />
      </div>
    </section>
  );
}
