import ChatMessage from './ChatMessage';

function SummaryRow({ label, value, identified = false }) {
  return (
    <div className="border-b border-[#E8EDF3] py-2.5 last:border-b-0">
      <dt className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6B7280]">
        {label}
        {identified ? (
          <span className="rounded-full bg-[#E6F4EA] px-2 py-0.5 text-[9px] font-bold tracking-normal text-[#137333]">
            Identificado automáticamente
          </span>
        ) : null}
      </dt>
      <dd className="mt-1 text-sm font-medium leading-5 text-[#25364D]">{value || 'No capturado'}</dd>
    </div>
  );
}

export default function InformationSummaryMessage({ message }) {
  const data = message.snapshot;

  return (
    <ChatMessage role="assistant" text={message.text} timeLabel={message.timeLabel}>
      <dl className="mt-3 min-w-0 sm:min-w-[420px]">
        <SummaryRow label="Tipo de producto" value={data.productType} identified={data.policyAutoIdentified} />
        <SummaryRow label="Número de póliza" value={data.policyNumber} identified={data.policyAutoIdentified} />
        <SummaryRow label="Persona que realiza el trámite" value={data.relationship} identified={data.personAutoIdentified} />
        <SummaryRow label="Nombre" value={data.fullName} identified={data.personAutoIdentified} />
        {data.phoneLandline ? <SummaryRow label="Teléfono particular" value={data.phoneLandline} /> : null}
        <SummaryRow label="Teléfono celular" value={data.mobilePhone} identified={data.contactAutoIdentified} />
        <SummaryRow label="Correo electrónico" value={data.email} identified={data.contactAutoIdentified} />
      </dl>
      <p className="mt-3 text-xs leading-5 text-[#6B7280]">Puedes escribir cualquier corrección directamente en el chat.</p>
      <p className="mt-2 text-sm font-semibold leading-5 text-[#25364D]">¿Confirmas que esta información es correcta?</p>
    </ChatMessage>
  );
}
