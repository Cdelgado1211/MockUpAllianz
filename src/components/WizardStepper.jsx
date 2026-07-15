import { CheckIcon } from './Icon';
import { wizardSteps } from '../data/mockReembolso';

function StepCircle({ index, active, completed }) {
  if (completed) {
    return (
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full border-2 text-[#1D6B35] shadow-[0_2px_8px_rgba(29,107,53,0.12)]"
        style={{ borderColor: '#CFE8D5', backgroundColor: '#E6F4EA' }}
      >
        <CheckIcon className="h-5 w-5" />
      </span>
    );
  }

  if (active) {
    return (
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full border-2 text-[15px] font-bold text-white shadow-[0_4px_14px_rgba(0,55,129,0.20)]"
        style={{ borderColor: '#003781', backgroundColor: '#003781', color: '#FFFFFF' }}
      >
        <span className="translate-y-px">{index}</span>
      </span>
    );
  }

  return (
    <span
      className="flex h-12 w-12 items-center justify-center rounded-full border-2 text-[15px] font-bold text-[#434751]"
      style={{ borderColor: '#C7CDD6', backgroundColor: '#F2F4F7' }}
    >
      <span className="translate-y-px">{index}</span>
    </span>
  );
}

export default function WizardStepper({ steps = wizardSteps, currentStep = 0, onStepClick = () => {}, completedSteps = [] }) {
  return (
    <nav
      aria-label="Progreso del trámite"
      className="w-full overflow-x-auto rounded-[18px] border border-[#E0E6ED] bg-white px-6 py-5 shadow-sm sm:px-8"
      style={{ minHeight: 'auto' }}
    >
      <ol
        className="relative min-w-[760px]"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          alignItems: 'start',
          gap: 0
        }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-0 h-[2px] bg-[#C7CDD6]"
          style={{ left: '8%', right: '8%', top: '23px' }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep || completedSteps.includes(index);

          return (
            <li key={step.id} className="relative z-10 min-w-0 px-2 text-center">
              <button
                type="button"
                onClick={() => onStepClick(index)}
                disabled={index > currentStep}
                aria-current={isActive ? 'step' : undefined}
                className={`focus-ring flex flex-col items-center justify-start ${index > currentStep ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                style={{ width: '100%' }}
              >
                <StepCircle index={stepNumber} active={isActive} completed={isCompleted} />

                <span
                  className={`mt-2.5 block max-w-[150px] text-[14px] leading-5 ${
                    isActive ? 'font-semibold text-[#003781]' : isCompleted ? 'font-medium text-[#475467]' : 'font-medium text-[#434751]'
                  }`}
                  style={isActive ? { color: '#003781' } : undefined}
                >
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
