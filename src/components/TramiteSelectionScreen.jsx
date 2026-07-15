import { ArrowRightIcon, ChevronRightIcon, MedicalServicesIcon, PaymentsIcon, SmartToyIcon, TimelineIcon } from './Icon';
import { tramiteOptions } from '../data/mockReembolso';

const iconMap = {
  reembolso: PaymentsIcon,
  cirugia_programada: MedicalServicesIcon,
  chatbot: SmartToyIcon,
  estatus: TimelineIcon
};

function TramiteCard({ option, selected, onSelect }) {
  const Icon = iconMap[option.id] ?? PaymentsIcon;
  const isComingSoon = Boolean(option.badge);
  const isActive = selected;

  return (
    <button
      type="button"
      aria-label={`${option.label}${isComingSoon ? ', próximo disponible' : ''}`}
      aria-pressed={selected}
      className={`group flex h-full min-h-[372px] w-full max-w-[320px] flex-col justify-between rounded-[12px] border bg-white p-6 text-left shadow-[0_1px_2px_rgba(24,28,30,0.05)] transition duration-300 ease-out focus-ring hover:-translate-y-1 hover:border-[#005A9C]/55 hover:shadow-[0_12px_30px_rgba(0,35,86,0.12)] ${
        isActive ? 'border-[#D8DEE7] bg-[#F8FBFF] ring-1 ring-[#005A9C]/10 shadow-[0_10px_24px_rgba(0,35,86,0.10)]' : 'border-[#E0E6ED]'
      }`}
      onClick={onSelect}
    >
      <div className="flex flex-1 flex-col justify-between gap-6">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition duration-300 ${
                isActive ? 'bg-[#EAF2FF] text-[#003781]' : 'bg-[#F3F7FB] text-[#005A9C] group-hover:scale-[1.03]'
              }`}
            >
              <Icon className="h-8 w-8" />
            </span>

            <ChevronRightIcon
              className={`mt-1 h-5 w-5 shrink-0 transition duration-300 ${
                isActive ? 'text-[#005A9C]' : 'text-[#9AA3B2] group-hover:translate-x-0.5 group-hover:text-[#005A9C]'
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[19px] font-semibold leading-tight text-[#002356]">{option.label}</h3>
              {isComingSoon && (
                <span className="inline-flex items-center rounded-full border border-[#E0E6ED] bg-[#F7FAFC] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#434751]">
                  {option.badge}
                </span>
              )}
            </div>
            <p className="mt-3 max-w-[250px] text-[13px] leading-6 text-[#434751]">{option.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <span className={`text-[14px] font-semibold transition ${isActive ? 'text-[#005A9C]' : 'text-[#003781]'}`}>
            {option.actionLabel}
          </span>
          <ArrowRightIcon
            className={`h-4 w-4 transition duration-300 ${
              isActive ? 'text-[#005A9C] group-hover:translate-x-1' : 'text-[#005A9C] group-hover:translate-x-1'
            }`}
          />
        </div>
      </div>
    </button>
  );
}

export default function TramiteSelectionScreen({ selected, onSelect, onNext, nextDisabled = true, nextButtonRef }) {
  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#181C1E]">
      <header className="border-b border-[#E0E6ED] bg-white">
        <div className="mx-auto flex w-full max-w-[1100px] items-center justify-center px-6 py-6 sm:py-8">
          <p className="font-display text-[26px] font-semibold tracking-tight text-[#003781] sm:text-[30px]">Allianz México</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1100px] px-6 py-10 sm:py-14">
        <section className="text-center">
          <h1 className="font-display text-[24px] font-semibold tracking-tight text-[#003781] sm:text-[28px]">
            Selecciona el trámite a realizar
          </h1>
          <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-[#005A9C]" />
        </section>

        <section className="mt-10">
          <div className="grid justify-items-center gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {tramiteOptions.map((option) => (
              <TramiteCard
                key={option.id}
                option={option}
                selected={selected === option.id}
                onSelect={() => onSelect(option.id)}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              ref={nextButtonRef}
              type="button"
              disabled={nextDisabled}
              className={`focus-ring inline-flex h-11 items-center justify-center rounded-full px-7 text-[14px] font-semibold transition sm:h-12 sm:px-8 ${
                nextDisabled
                  ? 'cursor-not-allowed border border-[#D8DEE7] bg-[#E9EEF5] text-[#8B94A3]'
                  : 'bg-[#005A9C] text-white hover:bg-[#003781]'
              }`}
              onClick={onNext}
            >
              <span>Siguiente</span>
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
