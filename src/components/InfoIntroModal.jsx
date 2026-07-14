import StandardModal from './StandardModal';

const introPoints = [
  'El tiempo de respuesta es de 5 días hábiles, a partir de la confirmación del número de folio que se recibe por correo siempre y cuando la información enviada este completa.',
  'Los formatos actualizados para el trámite, se encuentran disponibles en nuestra página https://www.allianz.com.mx',
  'Cada trámite se evalúa con base a las Condiciones Generales contratadas en la póliza correspondiente al siniestro.',
  'Para estar en condiciones de valorar los estudios de laboratorio y gabinete, es necesario ingresar receta con la indicación del médico tratante, así como la imagen y resultados de los mismos.',
  'Los comprobantes de gastos deben estar emitidos a favor del titular de la póliza y de ser posible adjuntar el archivo xml.',
  'El pago del trámite, realizado por Allianz México, se emite a favor del titular de la póliza.'
];

export default function InfoIntroModal({ open, onContinue }) {
  if (!open) return null;

  return (
    <StandardModal
      open={open}
      title="Trámites @Clientes - Documentos para GMM"
      actionLabel="Siguiente"
      onAction={onContinue}
    >
      <p>Estimado Asegurado para los trámites de Reembolso es importante considerar lo siguiente:</p>

      <ul className="space-y-1.5 pl-5">
        {introPoints.map((point) => (
          <li key={point} className="list-disc">
            {point}
          </li>
        ))}
      </ul>

      <p>Para cualquier duda ponemos a su disposición el teléfono de contacto del área de Reembolso: 55 5201 3116</p>
    </StandardModal>
  );
}
