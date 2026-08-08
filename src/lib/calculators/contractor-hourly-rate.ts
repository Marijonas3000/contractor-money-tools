export interface ContractorHourlyRateInput {
  desiredAnnualOwnerCompensation: number;
  annualBusinessOverhead: number;
  billableHoursPerWeek: number;
  workingWeeksPerYear: number;
  targetProfitMarginPercent: number;
  billableHoursPerDay?: number | null;
}

export type ContractorHourlyRateValidationField =
  | keyof ContractorHourlyRateInput
  | 'annualCosts'
  | 'annualBillableHours'
  | 'calculation';

export type ContractorHourlyRateValidationCode =
  | 'not_finite'
  | 'must_be_nonnegative'
  | 'must_be_positive'
  | 'annual_costs_nonpositive'
  | 'annual_billable_hours_nonpositive'
  | 'target_margin_out_of_range'
  | 'calculation_overflow';

export interface ContractorHourlyRateValidationError {
  field: ContractorHourlyRateValidationField;
  code: ContractorHourlyRateValidationCode;
  message: string;
}

export interface ContractorHourlyRateResult {
  annualBillableHours: number;
  annualCosts: number;
  breakEvenHourlyRate: number;
  requiredAnnualRevenue: number;
  recommendedHourlyBillingRate: number;
  annualTargetProfit: number;
  optionalDayRate: number | null;
}

export type ContractorHourlyRateCalculation =
  | { success: true; result: ContractorHourlyRateResult }
  | { success: false; errors: ContractorHourlyRateValidationError[] };

const PERCENTAGE_POINTS_PER_WHOLE = 100;

const requiredFields = [
  'desiredAnnualOwnerCompensation',
  'annualBusinessOverhead',
  'billableHoursPerWeek',
  'workingWeeksPerYear',
  'targetProfitMarginPercent',
] as const satisfies readonly (keyof ContractorHourlyRateInput)[];

/**
 * Calculates the break-even and target-margin hourly rates for a contractor.
 *
 * The target margin input uses percentage points: `20` means 20%, not `0.2`.
 * Monetary results are returned at full JavaScript number precision and are not
 * rounded for display.
 */
export function calculateContractorHourlyRate(
  input: ContractorHourlyRateInput,
): ContractorHourlyRateCalculation {
  const errors: ContractorHourlyRateValidationError[] = [];

  for (const field of requiredFields) {
    if (!Number.isFinite(input[field])) {
      errors.push({
        field,
        code: 'not_finite',
        message: `${field} must be a finite number.`,
      });
    }
  }

  const billableHoursPerDay = input.billableHoursPerDay;
  if (
    billableHoursPerDay !== undefined &&
    billableHoursPerDay !== null &&
    !Number.isFinite(billableHoursPerDay)
  ) {
    errors.push({
      field: 'billableHoursPerDay',
      code: 'not_finite',
      message: 'billableHoursPerDay must be a finite number when provided.',
    });
  }

  for (const field of [
    'desiredAnnualOwnerCompensation',
    'annualBusinessOverhead',
  ] as const) {
    if (Number.isFinite(input[field]) && input[field] < 0) {
      errors.push({
        field,
        code: 'must_be_nonnegative',
        message: `${field} must be zero or greater.`,
      });
    }
  }

  for (const field of [
    'billableHoursPerWeek',
    'workingWeeksPerYear',
  ] as const) {
    if (Number.isFinite(input[field]) && input[field] <= 0) {
      errors.push({
        field,
        code: 'must_be_positive',
        message: `${field} must be greater than zero.`,
      });
    }
  }

  if (
    Number.isFinite(input.targetProfitMarginPercent) &&
    (input.targetProfitMarginPercent < 0 ||
      input.targetProfitMarginPercent >= PERCENTAGE_POINTS_PER_WHOLE)
  ) {
    errors.push({
      field: 'targetProfitMarginPercent',
      code: 'target_margin_out_of_range',
      message: 'targetProfitMarginPercent must be at least 0 and less than 100.',
    });
  }

  if (
    billableHoursPerDay !== undefined &&
    billableHoursPerDay !== null &&
    Number.isFinite(billableHoursPerDay) &&
    billableHoursPerDay <= 0
  ) {
    errors.push({
      field: 'billableHoursPerDay',
      code: 'must_be_positive',
      message: 'billableHoursPerDay must be greater than zero when provided.',
    });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const annualCosts =
    input.desiredAnnualOwnerCompensation + input.annualBusinessOverhead;

  if (annualCosts <= 0) {
    return {
      success: false,
      errors: [
        {
          field: 'annualCosts',
          code: 'annual_costs_nonpositive',
          message:
            'Desired annual owner compensation and annual business overhead cannot both be zero.',
        },
      ],
    };
  }

  const annualBillableHours =
    input.billableHoursPerWeek * input.workingWeeksPerYear;

  if (annualBillableHours <= 0) {
    return {
      success: false,
      errors: [
        {
          field: 'annualBillableHours',
          code: 'annual_billable_hours_nonpositive',
          message: 'Annual billable hours must be greater than zero.',
        },
      ],
    };
  }

  const targetProfitMargin =
    input.targetProfitMarginPercent / PERCENTAGE_POINTS_PER_WHOLE;
  const breakEvenHourlyRate = annualCosts / annualBillableHours;
  const requiredAnnualRevenue = annualCosts / (1 - targetProfitMargin);
  const recommendedHourlyBillingRate =
    requiredAnnualRevenue / annualBillableHours;
  const annualTargetProfit = requiredAnnualRevenue - annualCosts;
  const optionalDayRate =
    billableHoursPerDay === undefined || billableHoursPerDay === null
      ? null
      : recommendedHourlyBillingRate * billableHoursPerDay;

  const numericResults = [
    annualBillableHours,
    annualCosts,
    breakEvenHourlyRate,
    requiredAnnualRevenue,
    recommendedHourlyBillingRate,
    annualTargetProfit,
    ...(optionalDayRate === null ? [] : [optionalDayRate]),
  ];

  if (!numericResults.every(Number.isFinite)) {
    return {
      success: false,
      errors: [
        {
          field: 'calculation',
          code: 'calculation_overflow',
          message: 'The supplied values are too large to calculate safely.',
        },
      ],
    };
  }

  return {
    success: true,
    result: {
      annualBillableHours,
      annualCosts,
      breakEvenHourlyRate,
      requiredAnnualRevenue,
      recommendedHourlyBillingRate,
      annualTargetProfit,
      optionalDayRate,
    },
  };
}
