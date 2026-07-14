import { wizardSteps } from '../data/mockReembolso';

export default function WizardStepper({ currentStep, onStepClick, completedSteps = [] }) {
  return (
    <nav className="rounded-[2rem] border border-white/70 bg-white/90 p-3 shadow-sm backdrop-blur-sm">
      <div className="hidden gap-2 lg:grid lg:grid-cols-5">
        {wizardSteps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = completedSteps.includes(index);
          const disabled = index > currentStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick(index)}
              disabled={disabled}
              className={`focus-ring flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                isActive
                  ? 'bg-sky-700 text-white shadow-glow'
                  : isCompleted
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-700 ring-1 ring-slate-200'
                }`}
              >
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-extrabold">{step.label}</span>
                <span className={`block text-xs ${isActive ? 'text-sky-100' : 'text-slate-500'}`}>
                  {isActive ? 'Paso actual' : isCompleted ? 'Completado' : 'Pendiente'}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 lg:hidden">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-700">Progreso</p>
          <p className="mt-1 text-sm font-extrabold text-slate-900">
            Paso {currentStep + 1} de {wizardSteps.length}: {wizardSteps[currentStep].label}
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
          {Math.round(((currentStep + 1) / wizardSteps.length) * 100)}%
        </div>
      </div>

      <div className="mt-3 flex gap-2 lg:hidden">
        {wizardSteps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = completedSteps.includes(index);
          const disabled = index > currentStep;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick(index)}
              disabled={disabled}
              className={`h-2.5 flex-1 rounded-full transition ${
                isActive ? 'bg-sky-700' : isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
              aria-label={step.label}
            />
          );
        })}
      </div>
    </nav>
  );
}
