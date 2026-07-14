import { DownloadIcon } from './Icon';
import { welcomeDocuments } from '../data/mockReembolso';

export default function WelcomeModal({ open, onContinue }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-soft">
        <div className="bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 px-6 py-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-100/90">
            Portal Público de Siniestros GMM
          </p>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">
            Información importante para tu trámite de Reembolso
          </h1>
        </div>

        <div className="space-y-5 px-6 py-6">
          <p className="text-sm leading-6 text-slate-600 sm:text-[15px]">
            Ten a la mano los documentos que nos ayudarán a acelerar el análisis de tu solicitud.
            Puedes descargar los formatos institucionales desde los enlaces simulados o pedir apoyo al asistente virtual.
          </p>

          <ul className="grid gap-3 sm:grid-cols-2">
            {welcomeDocuments.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                  <DownloadIcon />
                </span>
                <span className="text-sm font-medium text-slate-700">{item}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-4 text-sm text-sky-900">
            <p className="font-semibold">¿Aún no tienes todos los documentos?</p>
            <p className="mt-1 leading-6">
              Puedes descargarlos desde los enlaces disponibles o solicitar apoyo a nuestro asistente virtual para generarlos más rápido.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="focus-ring inline-flex items-center justify-center rounded-full bg-sky-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-800"
              onClick={onContinue}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
