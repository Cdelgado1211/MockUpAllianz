import {
  ChevronRightIcon,
  HomeIcon,
  MedicalServicesIcon,
  PaymentsIcon,
  QuestionIcon,
  SidebarToggleIcon,
  SmartToyIcon,
  SparkIcon,
  TimelineIcon
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

function RailAction({ icon: Icon, label, active = false, collapsed = false, onClick }) {
  return (
    <button
      type="button"
      className={`group relative flex items-center gap-3 rounded-2xl border transition focus-ring ${
        collapsed ? 'h-12 w-12 justify-center px-0' : 'h-12 w-full justify-start px-3'
      } ${
        active
          ? 'border-[#003781] bg-[#003781] text-white shadow-[0_10px_18px_rgba(0,55,129,0.16)]'
          : 'border-[#DDE5EF] bg-white text-[#003781] hover:-translate-y-0.5 hover:border-[#C7D8F1] hover:bg-[#F4F8FF]'
      }`}
      onClick={onClick}
      title={label}
      aria-pressed={active}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed ? <span className="text-sm font-semibold leading-5">{label}</span> : null}
      {active && !collapsed ? <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#003781]" aria-hidden="true" /> : null}
    </button>
  );
}

function ConversationItem({ item, active, collapsed, onClick }) {
  const Icon = iconMap[item.id] ?? SmartToyIcon;

  return (
    <RailAction
      icon={Icon}
      label={item.title}
      active={active}
      collapsed={collapsed}
      onClick={onClick}
    />
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
      className={`hidden h-full shrink-0 border-r border-[#DDE5EF] bg-[#F8FAFD] lg:flex ${
        collapsed ? 'w-[64px]' : 'w-[292px]'
      } flex-col transition-all duration-300`}
    >
      {!collapsed ? (
        <div className="flex items-center justify-between gap-3 border-b border-[#E0E6ED] px-4 py-4">
          <div className="min-w-0">
            <p className="font-display text-[17px] font-semibold leading-tight text-[#003781]">Allianz México</p>
            <p className="text-xs leading-5 text-[#6B7280]">Asistente de Siniestros GMM</p>
          </div>

          <button
            type="button"
            className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E0E6ED] bg-white text-[#003781] shadow-sm transition hover:bg-[#F4F8FF]"
            onClick={onToggleCollapsed}
            aria-label="Cerrar barra lateral"
            title="Cerrar barra lateral"
          >
            <SidebarToggleIcon className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className={`flex-1 overflow-y-auto py-4 ${collapsed ? 'px-2' : 'px-3'}`}>
        <div className="space-y-2">
          {collapsed ? (
            <RailAction
              icon={SidebarToggleIcon}
              label="Abrir barra lateral"
              active={false}
              collapsed={true}
              onClick={onToggleCollapsed}
            />
          ) : null}
          <RailAction
            icon={SparkIcon}
            label="Nueva conversación"
            active={activePresetId === 'welcome'}
            collapsed={collapsed}
            onClick={onNewConversation}
          />
          {!collapsed ? (
            <div className="pt-3">
              <p className="px-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#006494]">Conversaciones</p>
              <div className="mt-3 space-y-2">
                {chatbotHistoryItems.map((item) => (
                  <ConversationItem
                    key={item.id}
                    item={item}
                    active={activePresetId === item.id}
                    collapsed={collapsed}
                    onClick={() => onSelectPreset(item.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="pt-3">
              <div className="space-y-2">
                {chatbotHistoryItems.map((item) => (
                  <ConversationItem
                    key={item.id}
                    item={item}
                    active={activePresetId === item.id}
                    collapsed={collapsed}
                    onClick={() => onSelectPreset(item.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="my-4 border-t border-[#E0E6ED]" />

        <div className="space-y-2">
          <RailAction icon={HomeIcon} label="Inicio" active={false} collapsed={collapsed} onClick={onGoHome} />
          <RailAction icon={QuestionIcon} label="Ayuda" active={false} collapsed={collapsed} onClick={onGoHome} />
        </div>
      </div>
    </aside>
  );
}
