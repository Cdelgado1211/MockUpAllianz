import ChatMessage from './ChatMessage';

function SummaryRow({ label, value }) {
  return (
    <div className="border-b border-[#E8EDF3] py-2.5 last:border-b-0">
      <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6B7280]">{label}</dt>
      <dd className="mt-1 text-sm font-medium leading-5 text-[#25364D]">{value || 'Pendiente'}</dd>
    </div>
  );
}

export default function FormSummaryMessage({ message }) {
  const snapshot = message.snapshot ?? { fields: [] };

  return (
    <ChatMessage role="assistant" text={message.text} timeLabel={message.timeLabel}>
      <div className="mt-3 min-w-0 rounded-[18px] border border-[#E0E6ED] bg-[#F7FAFC] px-4 py-3 sm:min-w-[420px]">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#006494]">{snapshot.title}</p>
        <dl className="mt-2">
          {snapshot.fields.map((fieldItem) => (
            <SummaryRow key={fieldItem.id} label={fieldItem.label} value={fieldItem.value} />
          ))}
        </dl>
        <p className="mt-3 text-xs leading-5 text-[#6B7280]">
          {snapshot.completed} de {snapshot.total} datos capturados.
        </p>
      </div>
    </ChatMessage>
  );
}
