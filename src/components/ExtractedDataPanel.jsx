function FieldGroup({ title, fields, values, onChange }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field} className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">{field}</span>
            <input
              type="text"
              className="focus-ring w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white"
              value={values[field] ?? ''}
              onChange={(event) => onChange(field, event.target.value)}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

export default function ExtractedDataPanel({ data, onFieldChange }) {
  const sections = [
    {
      key: 'aviso',
      title: 'Aviso de Accidente o Enfermedad',
      fields: [
        'Datos del afectado',
        'No. de póliza',
        'Producto',
        'Nombre del contratante',
        'Datos del titular',
        'Motivo de la reclamación',
        'Teléfono celular',
        'Tipo de reclamación'
      ],
      values: data.aviso
    },
    {
      key: 'solicitud',
      title: 'Solicitud de Reembolso',
      fields: [
        'No. de póliza',
        'Nombre o razón social del contratante',
        'Nombre del titular de la póliza',
        'RFC / CURP',
        'E-mail / Teléfono',
        'Tipo de reclamación',
        'No. de siniestro'
      ],
      values: data.solicitud
    },
    {
      key: 'informe',
      title: 'Informe Médico',
      fields: ['Nombre del paciente'],
      values: data.informe
    },
    {
      key: 'reclamacion',
      title: 'Datos de la reclamación',
      fields: ['Moneda de los recibos', 'Número de recibos o facturas', 'Monto total de los recibos o facturas', 'CLABE'],
      values: data.reclamacion
    }
  ];

  return (
    <section className="rounded-[2rem] border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-700">OCR simulado</p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900">Extracción y validación automática</h2>
        </div>
        <p className="text-sm text-slate-500">Los campos son editables y permanecen como strings en todo momento.</p>
      </div>

      <div className="mt-5 grid gap-4">
        {sections.map((section) => (
          <FieldGroup
            key={section.title}
            title={section.title}
            fields={section.fields}
            values={section.values}
            onChange={(field, value) => onFieldChange(section.key, field, value)}
          />
        ))}
      </div>
    </section>
  );
}
