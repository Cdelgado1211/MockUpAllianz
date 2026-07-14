import { useMemo } from 'react';
import DropzoneCard from './DropzoneCard';
import { formatOptions } from '../data/mockReembolso';
import Badge from './Badge';

export default function DocumentUploadSection({ documents, onSimulateUpload, observations, onObservationsChange }) {
  const processedCount = useMemo(() => documents.filter((doc) => doc.status === 'processed').length, [documents]);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4">
        <div className="rounded-3xl bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 px-5 py-5 text-white shadow-glow">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-100/90">Sección 1 · Documentación del trámite</p>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">
                Para agilizar tu registro, por favor sube tus formatos institucionales y la documentación complementaria.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-sky-50/90 sm:text-[15px]">
                Nuestro sistema leerá la información automáticamente. Formatos aceptados: {formatOptions.join(', ')}.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Badge tone="blue">{processedCount} procesados</Badge>
              <Badge tone="slate">Mock sin backend</Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {documents.map((doc) => (
            <DropzoneCard
              key={doc.id}
              doc={doc}
              status={doc.status}
              onSimulateUpload={() => onSimulateUpload(doc.id)}
            />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <label className="block rounded-[2rem] border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <span className="mb-2 block text-sm font-extrabold text-slate-900">Observaciones opcionales</span>
            <textarea
              rows="5"
              className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400"
              placeholder="Escribe aquí cualquier aclaración adicional para el trámite..."
              value={observations}
              onChange={(event) => onObservationsChange(event.target.value)}
            />
          </label>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900">Estado del análisis</h3>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <p>• Carga simulada por clic, sin archivo real.</p>
              <p>• Análisis IA breve con temporizador local.</p>
              <p>• Los documentos institucionales disparan el panel de OCR simulado al completar Aviso, Solicitud e Informe.</p>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
              Consejo de demo: puedes abrir cada tarjeta para ver el estado <span className="font-semibold text-slate-700">Analizando documento con IA...</span> y luego <span className="font-semibold text-slate-700">Documento procesado</span>.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
