import StandardModal from './StandardModal';

const introPoints = [
  'El tiempo de respuesta es de 5 días hábiles, a partir de la confirmación del número de folio que se recibe por correo siempre y cuando la información enviada este completa.',
  'Los formatos actualizados para el trámite, se encuentran disponibles en nuestra página https://www.allianz.com.mx',
  'Cada trámite se evalúa con base a las Condiciones Generales contratadas en la póliza correspondiente al siniestro.',
  'Para estar en condiciones de valorar los estudios de laboratorio y gabinete, es necesario ingresar receta con la indicación del médico tratante, así como la imagen y resultados de los mismos.',
  'Los comprobantes de gastos deben estar emitidos a favor del titular de la póliza y de ser posible adjuntar el archivo xml.',
  'El pago del trámite, realizado por Allianz México, se emite a favor del titular de la póliza.'
];

const surgeryIntroPoints = [
  'Para tener este beneficio es importante que las programaciones se realicen con proveedores de red de Allianz.',
  'El tiempo de respuesta es de 5 días hábiles a partir de la confirmación del número de folio que se recibe por correo siempre y cuando la información enviada este completa.',
  'Los formatos actualizados para el trámite se encuentran disponibles en nuestra página https://www.allianz.com.mx',
  'Enviar Informé Médico actualizado cada año para cada padecimiento.',
  'Para evaluar la programación de estudios de laboratorio, gabinete y medicamentos es necesario:',
  'Contar con siniestro relacionado al padecimiento, previamente registrado y autorizado por Allianz México.',
  'Que el costo sea mayor a $2,000 MN (dos mil pesos 00/100 MN).',
  'Que se trate de padecimientos crónico-degenerativos.',
  'Para los medicamentos se requiere receta expedida por el médico tratante que incluya:',
  'Nombre, presentación y dosis del medicamento.',
  'Cada cuanto tiempo será aplicado, vía y tiempo del tratamiento.',
  'Sustancia activa, número de piezas.'
];

export default function InfoIntroModal({ open, onContinue, tramiteLabel = 'Reembolso' }) {
  if (!open) return null;

  const isSurgery = tramiteLabel === 'Cirugía Programada';
  const introText = isSurgery
    ? `Estimado Asegurado para los trámites de ${tramiteLabel} es importante considerar lo siguiente:`
    : `Estimado Asegurado para los trámites de ${tramiteLabel} es importante considerar lo siguiente:`;
  const points = isSurgery ? surgeryIntroPoints : introPoints;
  const contactText = isSurgery
    ? 'Para cualquier duda ponemos a su disposición el teléfono de contacto del área de Cirugía Programada: 55 5201 3181'
    : `Para cualquier duda ponemos a su disposición el teléfono de contacto del área de ${tramiteLabel}: 55 5201 3116`;

  return (
    <StandardModal
      open={open}
      title="Trámites @Clientes - Documentos para GMM"
      actionLabel="Siguiente"
      onAction={onContinue}
    >
      <p>{introText}</p>

      <ul className="space-y-1.5 pl-5">
        {points.map((point) => (
          <li key={point} className="list-disc">
            {point}
          </li>
        ))}
      </ul>

      <p>{contactText}</p>
    </StandardModal>
  );
}
