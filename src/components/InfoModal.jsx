import StandardModal from './StandardModal';

export default function InfoModal({ open, onClose, tramiteLabel = 'Reembolso' }) {
  if (!open) return null;

  const isReembolso = tramiteLabel === 'Reembolso';
  const isSurgery = tramiteLabel === 'Cirugía Programada';
  const title = isReembolso
    ? 'Información importante para tu trámite de Reembolso'
    : 'Información importante para tu trámite de Cirugía Programada';
  const introText = isReembolso
    ? 'Estimado Asegurado para los trámites de Reembolso es importante considerar lo siguiente:'
    : 'Estimado Asegurado, para realizar el trámite de Cirugía Programada, es importante que consideres lo siguiente:';
  const leadText = isReembolso
    ? 'Los formatos actualizados para el trámite que debes de tener listos y llenados en su totalidad para completar tu trámite (incluidos, pero no excluidos a):'
    : 'Para completar tu trámite, deberás contar con los formatos actualizados y correctamente llenados. Puedes consultarlos y descargarlos aquí:';
  const visibleItems = isReembolso
    ? [
        'Aviso Accidente o Enfermedad',
        'Solicitud de Reembolso del Seguro de Gastos Médicos Mayores',
        'Informe Médico de cada médico tratante',
        'Una identificación oficial del titular',
        'Interpretación de estudios',
        'Historia clínica',
        'Comprobante de domicilio no mayor a 3 meses del titular',
        'Comprobantes de gastos (Facturas con validez fiscal en formato pdf o xml)'
      ]
    : isSurgery
      ? [
          'Aviso de Accidente o Enfermedad',
          'Informe Médico de cada médico tratante',
          'Identificación oficial',
          'Interpretación de estudios de cada médico tratante',
          'Historia clínica',
          'Presupuesto de honorarios si el médico no pertenece a la red de Allianz.',
          'Comprobante de domicilio no mayor a 3 meses del titular',
          'Comprobante de domicilio'
        ]
      : [];

  return (
    <StandardModal open={open} title={title} actionLabel="Continuar" onAction={onClose}>
      <p className="font-semibold text-slate-900">{introText}</p>
      <p className="mt-3 text-slate-700">{leadText}</p>

      <ul className="mt-4 space-y-2 pl-5 text-slate-700">
        {visibleItems.map((item) => (
          <li key={item} className="list-disc">
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-4 text-sky-900">
        <p className="font-semibold">¿Aún no tienes todos los documentos?</p>
        <p className="mt-1 leading-6">
          Puedes descargarlos desde los enlaces disponibles o solicitar apoyo a nuestro asistente virtual para generarlos más rápido.
        </p>
      </div>
    </StandardModal>
  );
}
