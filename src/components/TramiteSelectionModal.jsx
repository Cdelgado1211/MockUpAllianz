import ModalShell from './ModalShell';
import { tramiteOptions } from '../data/mockReembolso';
import { CheckIcon, SparkIcon } from './Icon';

function OptionCard({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`focus-ring flex w-full items-start gap-3 rounded-3xl border p-4 text-left transition ${
        selected ? 'border-sky-300 bg-sky-50 shadow-sm' : 'border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50'
      }`}
      onClick={onSelect}
    >
      <span
        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
          selected ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {selected ? <CheckIcon className="h-5 w-5" /> : <SparkIcon className="h-5 w-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-extrabold text-slate-900">{option.label}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-600">{option.description}</span>
      </span>
    </button>
  );
}

export default function TramiteSelectionModal({ open, selected, onSelect, onCancel, onContinue }) {
  if (!open) return null;

  const selectedOption = tramiteOptions.find((option) => option.id === selected) ?? tramiteOptions[0];

  return (
    <ModalShell
      title="Seleccione el trámite a realizar"
      subtitle="Elige qué quieres hacer dentro del portal. Por ahora, la experiencia completa está disponible para Reembolso."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="focus-ring inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="focus-ring inline-flex items-center justify-center rounded-full bg-sky-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-sky-800"
            onClick={onContinue}
          >
            Siguiente
          </button>
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          {tramiteOptions.map((option) => (
            <OptionCard
              key={option.id}
              option={option}
              selected={selected === option.id}
              onSelect={() => onSelect(option.id)}
            />
          ))}
        </div>

        <aside className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Vista previa</p>
          <h3 className="mt-2 text-xl font-extrabold text-slate-900">{selectedOption.label}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{selectedOption.description}</p>

          {selectedOption.id === 'reembolso' ? (
            <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm leading-6 text-sky-950">
              Esta es la ruta activa de la demostración. Continuarás con el flujo documental, validación y revisión.
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm leading-6 text-slate-500">
              Espacio reservado. Esta ruta se habilitará más adelante.
            </div>
          )}
        </aside>
      </div>
    </ModalShell>
  );
}
