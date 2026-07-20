import ChatMessage from './ChatMessage';

function SummaryRow({ label, value }) {
  return (
    <div className="border-b border-[#E8EDF3] py-2.5 last:border-b-0">
      <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6B7280]">{label}</dt>
      <dd className="mt-1 text-sm font-medium leading-5 text-[#25364D]">{value || 'No capturado'}</dd>
    </div>
  );
}

export default function ClaimSummaryMessage({ message }) {
  const data = message.snapshot;
  const isSurgery = data.flow === 'cirugia_programada';
  const showSinister = data.type === 'Complemento';

  return (
    <ChatMessage role="assistant" text={message.text} timeLabel={message.timeLabel}>
      <dl className="mt-3 min-w-0 sm:min-w-[420px]">
        <SummaryRow label="Tipo de reclamación" value={data.type} />
        {showSinister ? <SummaryRow label="¿Conoces el número de siniestro?" value={data.knowsSinisterNumber} /> : null}
        {showSinister && data.knowsSinisterNumber === 'Sí' ? <SummaryRow label="Número de siniestro" value={data.sinisterNumber} /> : null}
        {isSurgery ? (
          <>
            <SummaryRow label="Lugar de atención" value={data.attentionPlace} />
            <SummaryRow label="Tipo de trámite" value={data.tramiteType} />
            {data.tramiteType === 'Otros' ? <SummaryRow label="Observaciones" value={data.observations} /> : null}
          </>
        ) : (
          <>
            <SummaryRow label="Moneda" value={data.currency} />
            <SummaryRow label="Monto reclamado" value={data.claimedAmount} />
            <SummaryRow label="Cantidad de recibos o facturas" value={data.receiptsCount} />
          </>
        )}
      </dl>
      <p className="mt-3 text-xs leading-5 text-[#6B7280]">Puedes escribir cualquier corrección directamente en el chat.</p>
      <p className="mt-2 text-sm font-semibold leading-5 text-[#25364D]">¿Confirmas que esta información es correcta?</p>
    </ChatMessage>
  );
}
