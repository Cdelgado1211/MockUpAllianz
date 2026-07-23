import ChatMessage from './ChatMessage';
import { CheckIcon, DownloadIcon } from './Icon';

function PreviewRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#E8EDF3] py-2.5 last:border-b-0">
      <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6B7280]">{label}</dt>
      <dd className="max-w-[60%] text-right text-sm font-medium leading-5 text-[#25364D]">{value || 'Pendiente'}</dd>
    </div>
  );
}

export default function FormGeneratedDocumentMessage({ message }) {
  const snapshot = message.snapshot ?? { fields: [] };

  return (
    <ChatMessage role="assistant" text={message.text} timeLabel={message.timeLabel}>
      <div className="mt-3 min-w-0 rounded-[22px] border border-[#DDE5EF] bg-white p-4 shadow-sm sm:min-w-[420px]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E6F4EA] text-[#137333]" aria-hidden="true">
            <CheckIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#006494]">Documento generado</p>
            <h4 className="mt-1 text-lg font-semibold leading-6 text-[#181C1E]">{snapshot.title}</h4>
          </div>
        </div>

        <div className="mt-4 rounded-[18px] border border-[#E0E6ED] bg-[#F7FAFC] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Vista previa</p>
          <dl className="mt-2">
            {snapshot.fields.slice(0, 4).map((fieldItem) => (
              <PreviewRow key={fieldItem.id} label={fieldItem.label} value={fieldItem.value} />
            ))}
          </dl>
        </div>

        <div className="mt-4 flex flex-col gap-2 rounded-[18px] border border-dashed border-[#DDE5EF] bg-[#FBFDFF] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#181C1E]">{message.fileName}</p>
            <p className="mt-1 text-xs leading-5 text-[#6B7280]">Mock PDF listo para descargar.</p>
          </div>
          <a
            href={message.downloadUrl}
            download={message.fileName}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-[#003781] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002356]"
          >
            <DownloadIcon className="h-4 w-4" />
            Descargar documento
          </a>
        </div>
      </div>
    </ChatMessage>
  );
}
