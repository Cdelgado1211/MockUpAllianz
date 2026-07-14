import { CheckIcon, SparkIcon } from './Icon';
import { tramiteOptions } from '../data/mockReembolso';

function OptionCard({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`focus-ring flex w-full items-start gap-3 rounded-[1.75rem] border p-4 text-left transition sm:p-5 ${
        selected ? 'border-sky-300 bg-sky-50 shadow-sm' : 'border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50'
      }`}
      onClick={onSelect}
    >
      <span
        className={`mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
          selected ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {selected ? <CheckIcon className="h-5 w-5" /> : <SparkIcon className="h-5 w-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-extrabold text-slate-900">{option.label}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-600">{option.description}</span>
      </span>
    </button>
  );
}

export default function TramiteSelectionScreen({ selected, onSelect, onNext, canContinue = false }) {
  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-0 pb-2 pt-4">
      <div className="flex flex-1 flex-col">
        <div className="rounded-[2rem] border border-sky-200 bg-white shadow-sm">
          <div className="rounded-t-[2rem] bg-sky-700 px-5 py-4 text-white sm:px-6">
            <h2 className="text-lg font-extrabold sm:text-xl">Seleccione el trámite a realizar</h2>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid gap-4">
              {tramiteOptions.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  selected={selected === option.id}
                  onSelect={() => onSelect(option.id)}
                />
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                disabled={!selected || !canContinue}
                className={`focus-ring inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold transition ${
                  selected && canContinue
                    ? 'bg-sky-700 text-white hover:bg-sky-800'
                    : 'cursor-not-allowed border border-slate-300 bg-slate-100 text-slate-400'
                }`}
                onClick={onNext}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
