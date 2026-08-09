export type CalculatorId =
  | 'labor_burden'
  | 'true_employee_cost'
  | 'contractor_hourly_rate'
  | 'contractor_markup'
  | 'contractor_overhead'
  | 'job_profit';

type CalculatorAnalyticsEvent =
  | { name: 'calculator_start'; params: { calculator_id: CalculatorId } }
  | { name: 'calculator_complete'; params: { calculator_id: CalculatorId } }
  | {
      name: 'calculator_navigation';
      params: { source_calculator: CalculatorId; destination_calculator: CalculatorId };
    };

const calculatorPaths: Record<string, CalculatorId> = {
  '/calculators/labor-burden': 'labor_burden',
  '/calculators/true-employee-cost': 'true_employee_cost',
  '/calculators/contractor-hourly-rate': 'contractor_hourly_rate',
  '/calculators/contractor-markup': 'contractor_markup',
  '/calculators/contractor-overhead': 'contractor_overhead',
  '/calculators/job-profit': 'job_profit',
};

function normalizePathname(pathname: string) {
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function emitAnalyticsEvent(event: CalculatorAnalyticsEvent) {
  window.dispatchEvent(new CustomEvent('cmt:analytics', { detail: event }));
}

interface CalculatorTrackingOptions {
  form: HTMLFormElement | null;
  calculatorId: CalculatorId;
  hasValidResult: () => boolean;
}

export function initializeCalculatorTracking({
  form,
  calculatorId,
  hasValidResult,
}: CalculatorTrackingOptions) {
  if (!form) return;

  let hasStarted = false;
  let hasCompleted = false;

  form.addEventListener('input', () => {
    if (!hasStarted) {
      hasStarted = true;
      emitAnalyticsEvent({ name: 'calculator_start', params: { calculator_id: calculatorId } });
    }

    if (!hasCompleted && hasValidResult()) {
      hasCompleted = true;
      emitAnalyticsEvent({ name: 'calculator_complete', params: { calculator_id: calculatorId } });
    }
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const link = target.closest<HTMLAnchorElement>('a[href]');
    if (!link) return;

    const destinationPath = normalizePathname(new URL(link.href, window.location.href).pathname);
    const destination = calculatorPaths[destinationPath];
    if (!destination || destination === calculatorId) return;

    emitAnalyticsEvent({
      name: 'calculator_navigation',
      params: { source_calculator: calculatorId, destination_calculator: destination },
    });
  });
}
