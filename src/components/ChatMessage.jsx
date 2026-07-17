import { CheckIcon, SparkIcon } from './Icon';

export default function ChatMessage({ role = 'assistant', text, timeLabel = '', children }) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[min(760px,100%)] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div
          className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            isUser ? 'bg-[#8CA9D8] text-white shadow-sm' : 'bg-[#003781] text-white shadow-sm'
          }`}
          aria-hidden="true"
        >
          {isUser ? <span className="text-[11px] font-bold">AM</span> : <SparkIcon className="h-5 w-5" />}
        </div>

        <div
          className={`rounded-[20px] px-4 py-3 shadow-sm ${
            isUser ? 'border border-[#DCE7F7] bg-[#EAF1FF] text-[#1B2C5B]' : 'border border-[#E0E6ED] bg-white text-[#181C1E]'
          }`}
        >
          {text ? <p className="text-[14px] leading-6">{text}</p> : null}
          {children}
          {timeLabel ? (
            <p className={`mt-2 text-[11px] ${isUser ? 'text-[#6B7280]' : 'text-[#6B7280]'}`}>{timeLabel}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
