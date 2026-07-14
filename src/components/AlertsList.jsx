import AlertCard from './AlertCard';

export default function AlertsList({ alerts }) {
  return (
    <section className="rounded-[2rem] border border-amber-200 bg-white/90 p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-700">Sistema de alertas</p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900">Alertas detectadas</h2>
        </div>
        <p className="text-sm text-slate-500">Ninguna alerta bloquea el trámite. El usuario puede continuar siempre.</p>
      </div>

      <div className="mt-4 grid gap-3">
        {alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </section>
  );
}
