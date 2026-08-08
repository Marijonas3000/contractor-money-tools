export interface LaborBurdenInput {
  hourlyWage: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  payrollTaxRatePercent: number;
  workersCompRatePercent: number;
  ptoDays: number;
  paidHolidays: number;
  healthInsurance: number;
  retirementContribution: number;
  trainingDays: number;
  otherBenefits: number;
  toolsUniforms: number;
  otherAnnualCosts: number;
  hoursPerWorkday: number;
}

export type LaborBurdenValidationField =
  | keyof LaborBurdenInput
  | 'annualBaseWage'
  | 'productiveHours'
  | 'calculation';

export type LaborBurdenValidationCode =
  | 'not_finite'
  | 'must_be_nonnegative'
  | 'must_be_positive'
  | 'annual_base_wage_nonpositive'
  | 'productive_hours_nonpositive'
  | 'calculation_overflow';

export interface LaborBurdenValidationError {
  field: LaborBurdenValidationField;
  code: LaborBurdenValidationCode;
  message: string;
}

export interface LaborBurdenSensitivityScenario {
  currentProductiveUtilizationPercent: number;
  hypotheticalProductiveUtilizationPercent: number;
  hypotheticalProductiveHours: number;
  hypotheticalTrueProductiveHourCost: number;
  costPerHourDifference: number;
}

export interface LaborBurdenResult {
  baseHourlyWage: number;
  annualPaidHours: number;
  annualBaseWage: number;
  payrollTaxes: number;
  workersComp: number;
  fixedAnnualEmploymentCosts: number;
  totalAnnualEmploymentCost: number;
  nonproductivePaidHours: number;
  productiveHours: number;
  laborBurdenAmount: number;
  laborBurdenPercent: number;
  paidHourCost: number;
  trueProductiveHourCost: number;
  sensitivityScenario: LaborBurdenSensitivityScenario;
}

export type LaborBurdenCalculation =
  | { success: true; result: LaborBurdenResult }
  | { success: false; errors: LaborBurdenValidationError[] };

const PERCENTAGE_POINTS_PER_WHOLE = 100;
const SENSITIVITY_INCREASE_PERCENTAGE_POINTS = 5;

const nonnegativeFields = [
  'hourlyWage',
  'payrollTaxRatePercent',
  'workersCompRatePercent',
  'ptoDays',
  'paidHolidays',
  'healthInsurance',
  'retirementContribution',
  'trainingDays',
  'otherBenefits',
  'toolsUniforms',
  'otherAnnualCosts',
] as const satisfies readonly (keyof LaborBurdenInput)[];

const positiveFields = [
  'hoursPerWeek',
  'weeksPerYear',
  'hoursPerWorkday',
] as const satisfies readonly (keyof LaborBurdenInput)[];

/**
 * Calculates annual labor burden and productive-hour cost.
 *
 * Percentage inputs and percentage outputs use percentage points: `7.5` means
 * 7.5%, not the decimal ratio `0.075`. Monetary results are not rounded.
 */
export function calculateLaborBurden(
  input: LaborBurdenInput,
): LaborBurdenCalculation {
  const errors: LaborBurdenValidationError[] = [];

  for (const field of Object.keys(input) as (keyof LaborBurdenInput)[]) {
    if (!Number.isFinite(input[field])) {
      errors.push({
        field,
        code: 'not_finite',
        message: `${field} must be a finite number.`,
      });
    }
  }

  for (const field of nonnegativeFields) {
    if (Number.isFinite(input[field]) && input[field] < 0) {
      errors.push({
        field,
        code: 'must_be_nonnegative',
        message: `${field} must be zero or greater.`,
      });
    }
  }

  for (const field of positiveFields) {
    if (Number.isFinite(input[field]) && input[field] <= 0) {
      errors.push({
        field,
        code: 'must_be_positive',
        message: `${field} must be greater than zero.`,
      });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const annualPaidHours = input.hoursPerWeek * input.weeksPerYear;
  const annualBaseWage = input.hourlyWage * annualPaidHours;

  if (annualBaseWage <= 0) {
    return {
      success: false,
      errors: [
        {
          field: 'annualBaseWage',
          code: 'annual_base_wage_nonpositive',
          message:
            'Annual base wage must be greater than zero to calculate labor burden percent.',
        },
      ],
    };
  }

  const payrollTaxRate =
    input.payrollTaxRatePercent / PERCENTAGE_POINTS_PER_WHOLE;
  const workersCompRate =
    input.workersCompRatePercent / PERCENTAGE_POINTS_PER_WHOLE;
  const payrollTaxes = annualBaseWage * payrollTaxRate;
  const workersComp = annualBaseWage * workersCompRate;
  const fixedAnnualEmploymentCosts =
    input.healthInsurance +
    input.retirementContribution +
    input.otherBenefits +
    input.toolsUniforms +
    input.otherAnnualCosts;
  const totalAnnualEmploymentCost =
    annualBaseWage +
    payrollTaxes +
    workersComp +
    fixedAnnualEmploymentCosts;
  const nonproductivePaidHours =
    (input.ptoDays + input.paidHolidays + input.trainingDays) *
    input.hoursPerWorkday;
  const productiveHours = annualPaidHours - nonproductivePaidHours;

  if (productiveHours <= 0) {
    return {
      success: false,
      errors: [
        {
          field: 'productiveHours',
          code: 'productive_hours_nonpositive',
          message:
            'Productive hours must be greater than zero after subtracting paid nonproductive time.',
        },
      ],
    };
  }

  const laborBurdenAmount = totalAnnualEmploymentCost - annualBaseWage;
  const laborBurdenPercent =
    (laborBurdenAmount / annualBaseWage) * PERCENTAGE_POINTS_PER_WHOLE;
  const paidHourCost = totalAnnualEmploymentCost / annualPaidHours;
  const trueProductiveHourCost =
    totalAnnualEmploymentCost / productiveHours;
  const currentProductiveUtilization = productiveHours / annualPaidHours;
  const hypotheticalProductiveUtilization = Math.min(
    currentProductiveUtilization +
      SENSITIVITY_INCREASE_PERCENTAGE_POINTS /
        PERCENTAGE_POINTS_PER_WHOLE,
    1,
  );
  const hypotheticalProductiveHours =
    annualPaidHours * hypotheticalProductiveUtilization;
  const hypotheticalTrueProductiveHourCost =
    totalAnnualEmploymentCost / hypotheticalProductiveHours;
  const costPerHourDifference =
    trueProductiveHourCost - hypotheticalTrueProductiveHourCost;

  const numericResults = [
    annualPaidHours,
    annualBaseWage,
    payrollTaxes,
    workersComp,
    fixedAnnualEmploymentCosts,
    totalAnnualEmploymentCost,
    nonproductivePaidHours,
    productiveHours,
    laborBurdenAmount,
    laborBurdenPercent,
    paidHourCost,
    trueProductiveHourCost,
    hypotheticalProductiveHours,
    hypotheticalTrueProductiveHourCost,
    costPerHourDifference,
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
      baseHourlyWage: input.hourlyWage,
      annualPaidHours,
      annualBaseWage,
      payrollTaxes,
      workersComp,
      fixedAnnualEmploymentCosts,
      totalAnnualEmploymentCost,
      nonproductivePaidHours,
      productiveHours,
      laborBurdenAmount,
      laborBurdenPercent,
      paidHourCost,
      trueProductiveHourCost,
      sensitivityScenario: {
        currentProductiveUtilizationPercent:
          currentProductiveUtilization * PERCENTAGE_POINTS_PER_WHOLE,
        hypotheticalProductiveUtilizationPercent:
          hypotheticalProductiveUtilization *
          PERCENTAGE_POINTS_PER_WHOLE,
        hypotheticalProductiveHours,
        hypotheticalTrueProductiveHourCost,
        costPerHourDifference,
      },
    },
  };
}
