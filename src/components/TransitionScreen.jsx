import { CheckIcon } from './Icon';

export default function TransitionScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.20),transparent_35%),linear-gradient(180deg,#eff6ff_0%,#f8fbff_100%)]" />
      <div className="absolute left-8 top-10 h-32 w-32 rounded-full bg-sky-300/30 blur-3xl animate-floaty" />
      <div className="absolute bottom-12 right-10 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl animate-floaty" />

      <div className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-white/70 bg-white/85 p-6 text-center shadow-soft backdrop-blur-md sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckIcon className="h-9 w-9" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-sky-700">Sección 4.5</p>
        <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">Tu información fue registrada</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
          Continuando con la confirmación de tu trámite...
        </p>
        <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-sky-500" />
          Transición simulada hacia Confirmación
        </div>
      </div>
    </div>
  );
}
