import StandardModal from './StandardModal';

const introParagraphs = [
  'En Allianz nos preocupamos en ofrecer servicios de calidad a nuestros asegurados y clientes, así como en reforzar la seguridad de la información.',
  'Por lo anterior, a partir del próximo día 15 de enero del 2020, le pedimos que en sus trámites, se incluya además del archivo pdf de los comprobantes de gastos, el archivo xml que le proporciona el prestador de servicio.',
  'Agradecemos de antemano su disponibilidad para que esto se lleve a cabo. Ante cualquier duda, comentario y/o situación, ponemos a su disposición los datos de nuestra área de atención:'
];

const contacts = [
  'Lic. José Julio García Gress',
  'Supervisor Administrativo Reembolso GMM',
  'Tel.: 55-4335-4193',
  'Dr. Oswaldo Solis Nava',
  'Supervisor Médico Reembolso GMM',
  'Tel.: 55-5201-3192',
  'Dra. Claudia Cordero Rodríguez',
  'Gerencia Reembolso GMM',
  'Tel.: 55-5201-3190',
  'Atentamente.',
  'Dra. Zandra N. Balandrán Reyes',
  'Directora de Siniestros'
];

const documents = [
  '1.-Aviso de accidente y/o enfermedad requisitado por completo y firmado.',
  '2.-Informe Médico (Historia clínica completa) requisitados por completo y firmados.',
  '3.-Interpretación de estudios.',
  '4.-Presupuesto de honorarios en caso que el médico no pertenezca a la red de Allianz.',
  '5.-Comprobante de domicilio (con vigencia no mayor a 3 meses). Identificación oficial con firma del cliente y formato de indentificación o solicitud de reembolso requisitado en su totalidad.',
  '6.-Otros Documentos'
];

const notes = [
  'Para trámites es indispensable anexar a lo anterior factura y/o recibos con desglose a nombre del titular de la póliza incluyendo archivo XML de cada uno.',
  'En caso de solicitar transferencia es necesario ingresar el Aviso de Accidente / Enfermedad en original.',
  'Allianz puede solicitar los comprobantes originales si así lo requiere para continuar con su reclamación.'
];

const surgeryDocuments = [
  '1.-Aviso de accidente y/o enfermedad requisitado por completo y firmado.',
  '2.-Informe Médico (Historia clínica completa) requisitados por completo y firmados.',
  '3.-Interpretación de estudios.',
  '4.-Presupuesto de honorarios en caso que el médico no pertenezca a la red de Allianz.',
  '5.-Comprobante de domicilio (con vigencia no mayor a 3 meses). Identificación oficial con firma del cliente y formato de indentificación o solicitud de reembolso requisitado en su totalidad.',
  '6.-Otros Documentos'
];

const surgeryNotes = [
  'Para trámites de Reembolso es indispensable anexar a lo anterior factura y/o recibos con desglose a nombre del titular de la póliza incluyendo archivo XML de cada uno.',
  'En caso de solicitar transferencia es necesario ingresar el Aviso de Accidente / Enfermedad en original.',
  'Allianz puede solicitar los comprobantes originales si así lo requiere para continuar con su reclamación.'
];

export default function InfoModal({ open, onClose, tramiteLabel = 'Reembolso' }) {
  if (!open) return null;

  const isSurgery = tramiteLabel === 'Cirugía Programada';
  const visibleDocuments = isSurgery ? surgeryDocuments : documents;
  const visibleNotes = isSurgery ? surgeryNotes : notes;
  const contactLabel = isSurgery ? 'Cirugía Programada' : tramiteLabel;

  return (
    <StandardModal open={open} title="Trámites @Clientes - Documentos para GMM" actionLabel="Cerrar" onAction={onClose}>
      {isSurgery ? null : <p className="text-right">Ciudad de México a 26 de diciembre de 2019</p>}

      {isSurgery ? null : <p>Estimado Asegurado:</p>}

      {isSurgery ? null : introParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

      {isSurgery ? null : <p className="font-semibold text-slate-900">Teléfono {contactLabel}: 55-5201-3116</p>}

      {isSurgery ? null : contacts.map((line) => <p key={line}>{line}</p>)}

      <p className="gmm-modal-heading">Documentos para GMM</p>
      {visibleDocuments.map((document) => (
        <p key={document}>{document}</p>
      ))}

      <p className="gmm-modal-heading">NOTAS:</p>
      {visibleNotes.map((note) => (
        <p key={note}>{note}</p>
      ))}
    </StandardModal>
  );
}
