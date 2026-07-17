export default function ChatHeader({ onHelp, onRestart, onExit, title = 'Asistente de Siniestros GMM', subtitle = 'Asistente virtual' }) {
  return (
    <header className="border-b border-[#DDE5EF] bg-white/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h1 className="font-display text-[26px] font-semibold tracking-tight text-[#003781] sm:text-[30px]">
            {title}
          </h1>
          <p className="mt-1 text-sm leading-5 text-[#6B7280]">{subtitle} · Allianz México</p>
        </div>
      </div>
    </header>
  );
}
