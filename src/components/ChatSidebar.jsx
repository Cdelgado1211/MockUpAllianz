import {
  ArrowRightIcon,
  ChevronRightIcon,
  MedicalServicesIcon,
  PaymentsIcon,
  SmartToyIcon,
  TimelineIcon,
  SparkIcon
} from './Icon';
import { chatbotHistoryItems } from '../data/mockChatbot';

const iconMap = {
  welcome: SparkIcon,
  'reembolso-review': PaymentsIcon,
  'reembolso-success': PaymentsIcon,
  'cirugia-programada': MedicalServicesIcon,
  'solo-informacion': SparkIcon,
  'fuera-de-alcance': TimelineIcon
};

function HistoryItem({ item, selected, onClick }) {
  const Icon = iconMap[item.id] ?? SmartToyIcon;

  return (
    <button
      type="button"
      className={`group w-full rounded-[18px] border px-4 py-3 text-left transition focus-ring ${
        selected
          ? 'border-[#003781] bg-[#F4F8FF] shadow-sm'
          : 'border-[#E0E6ED] bg-white hover:-translate-y-0.5 hover:border-[#C7D8F1] hover:shadow-sm'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
            selected ? 'bg-[#003781] text-white' : 'bg-[#F3F7FB] text-[#003781]'
          }`}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-sm font-semibold leading-5 ${selected ? 'text-[#002356]' : 'text-[#181C1E]'}`}>
                {item.title}
              </p>
              <p className="mt-0.5 text-xs leading-5 text-[#6B7280]">{item.description}</p>
            </div>
            <ChevronRightIcon className={`mt-0.5 h-4 w-4 shrink-0 ${selected ? 'text-[#003781]' : 'text-[#A5ACB9]'}`} />
          </div>
        </div>
      </div>
    </button>
  );
}

export default function ChatSidebar({
  collapsed = false,
  onToggleCollapsed,
  activePresetId = 'welcome',
  onSelectPreset,
  onNewConversation,
  onGoHome
}) {
  return (
    <aside
      className={`hidden h-full shrink-0 border-r border-[#DDE5EF] bg-[#F7FAFC]/95 backdrop-blur-sm lg:flex ${
        collapsed ? 'w-[88px]' : 'w-[320px]'
      } flex-col transition-all duration-300`}
    >
      <div className="border-b border-[#E0E6ED] px-4 py-4">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#003781] text-white shadow-sm">
            <SmartToyIcon className="h-5 w-5" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="font-display text-[18px] font-semibold leading-tight text-[#003781]">Allianz México</p>
              <p className="text-xs leading-5 text-[#6B7280]">Asistente de Siniestros GMM</p>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className={`focus-ring inline-flex h-10 flex-1 items-center justify-center rounded-full bg-[#003781] px-3 text-xs font-semibold text-white transition hover:bg-[#002356] ${
              collapsed ? 'px-0' : ''
            }`}
            onClick={onNewConversation}
          >
            {collapsed ? <SparkIcon className="h-4 w-4" /> : 'Nueva conversación'}
          </button>
          <button
            type="button"
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#DCE3EC] bg-white text-[#003781] transition hover:bg-[#F4F8FF]"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
          >
            <ArrowRightIcon className={`h-4 w-4 transition ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-[0.22em] text-[#006494] ${collapsed ? 'text-center' : ''}`}>
            Historial
          </p>
          <div className="mt-3 space-y-2">
            {chatbotHistoryItems.map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                selected={activePresetId === item.id}
                onClick={() => onSelectPreset(item.id)}
              />
            ))}
          </div>
        </div>

        {!collapsed ? (
          <div className="rounded-[20px] border border-[#DDE5EF] bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#006494]">Accesos rápidos</p>
            <div className="mt-3 space-y-2">
              {[
                { label: 'Inicio', action: onGoHome },
                { label: 'Mis trámites', action: onGoHome },
                { label: 'Consultar estatus', action: onGoHome },
                { label: 'Ayuda', action: onGoHome }
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="focus-ring flex w-full items-center justify-between rounded-2xl border border-[#E0E6ED] bg-[#F7FAFC] px-3 py-3 text-sm font-semibold text-[#003781] transition hover:border-[#C7D8F1] hover:bg-white"
                  onClick={item.action}
                >
                  <span>{item.label}</span>
                  <ChevronRightIcon className="h-4 w-4 text-[#A5ACB9]" />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
