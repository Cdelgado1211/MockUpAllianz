import { ArrowRightIcon, InfoIcon, SparkIcon } from './Icon';

export default function ChatHeader({ onHelp, onRestart, onExit, title = 'Asistente de Siniestros GMM', subtitle = 'Asistente virtual' }) {
  return (
    <header className="border-b border-[#DDE5EF] bg-white/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#EFF6FF] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#003781]">
              <SparkIcon className="h-3.5 w-3.5" />
              {subtitle}
            </span>
          </div>
          <h1 className="mt-2 font-display text-[24px] font-semibold tracking-tight text-[#003781] sm:text-[28px]">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="focus-ring inline-flex h-11 items-center gap-2 rounded-full border border-[#DDE5EF] bg-white px-4 text-sm font-semibold text-[#003781] transition hover:bg-[#F4F8FF]"
            onClick={onHelp}
          >
            <InfoIcon className="h-4 w-4" />
            Ayuda
          </button>

          <button
            type="button"
            className="focus-ring hidden h-11 items-center gap-2 rounded-full border border-[#DDE5EF] bg-white px-4 text-sm font-semibold text-[#434751] transition hover:bg-[#F7FAFC] sm:inline-flex"
            onClick={onRestart}
          >
            <SparkIcon className="h-4 w-4" />
            Reiniciar conversación
          </button>

          <button
            type="button"
            className="focus-ring inline-flex h-11 items-center gap-2 rounded-full bg-[#003781] px-4 text-sm font-semibold text-white transition hover:bg-[#002356]"
            onClick={onExit}
          >
            Salir
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
