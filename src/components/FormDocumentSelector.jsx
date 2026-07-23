import ChatMessage from './ChatMessage';
import QuickReplyGroup from './QuickReplyGroup';

export default function FormDocumentSelector({ message, onSelect = () => {} }) {
  return (
    <ChatMessage role="assistant" text={message.text} timeLabel={message.timeLabel}>
      {message.supportText ? <p className="mt-3 text-sm leading-6 text-[#434751]">{message.supportText}</p> : null}
      <QuickReplyGroup className="mt-4" options={message.options ?? []} onSelect={onSelect} />
    </ChatMessage>
  );
}
