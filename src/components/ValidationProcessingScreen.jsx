import { validationStages } from '../data/mockReembolso';
import { SparkIcon } from './Icon';

export default function ValidationProcessingScreen({ stageIndex, progress }) {
  return (
    <section className="rounded-[2rem] border border-sky-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-700">Sección 2 · Validación</p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Procesando tus documentos</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Estamos simulando la lectura con IA para identificar información, comparar datos y preparar resultados.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-bold text-sky-800">
          <SparkIcon className="h-4 w-4 animate-pulse" />
          Análisis automático activo
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {validationStages.map((stage, index) => {
            const isActive = stageIndex === index;
            const isDone = stageIndex > index;
            return (
              <div
                key={stage}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'border-sky-300 bg-sky-50 text-sky-900 shadow-sm'
                    : isDone
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
              >
                <div className="text-xs uppercase tracking-[0.2em] opacity-70">Paso {index + 1}</div>
                <div className="mt-1">{stage}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
