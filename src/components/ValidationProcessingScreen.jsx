import { validationStages } from '../data/mockReembolso';
import { CheckIcon, SparkIcon } from './Icon';

export default function ValidationProcessingScreen({ stageIndex, progress }) {
  return (
    <section className="mx-auto w-full max-w-[980px] rounded-[20px] border border-[#E0E6ED] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#006494]">Documentos y validación</p>
          <h2 className="mt-1 text-[22px] font-semibold leading-7 text-[#181C1E] sm:text-[28px]">
            Estamos revisando tus documentos
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#434751]">
            Estamos revisando los archivos. Esto puede tomar unos momentos.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-[#EFF6FF] px-4 py-2 text-sm font-semibold text-[#003781]">
          <SparkIcon className="h-4 w-4 animate-pulse" />
          Revisando ahora
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#006494] via-[#003781] to-[#002356] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {validationStages.map((stage, index) => {
            const isActive = stageIndex === index;
            const isDone = stageIndex > index;
            return (
              <div
                key={stage}
                className={`rounded-[14px] border px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'border-[#C7D8F1] bg-[#EFF6FF] text-[#003781] shadow-sm'
                    : isDone
                      ? 'border-[#CFE8D5] bg-[#E6F4EA] text-[#137333]'
                      : 'border-[#E0E6ED] bg-[#F7FAFC] text-[#434751]'
                }`}
              >
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] opacity-70">
                  {isDone ? <CheckIcon className="h-3.5 w-3.5" /> : <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-current text-[9px] font-bold">{index + 1}</span>}
                  <span>Paso {index + 1}</span>
                </div>
                <div className="mt-1 text-[13px] font-semibold leading-5">{stage}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
