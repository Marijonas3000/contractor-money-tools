export type ContractorOverheadEntryMode = 'detailed' | 'total';

export interface ContractorOverheadRecoveryInput {
  annualRevenue?: number | null;
  annualDirectLaborCost?: number | null;
  annualDirectJobCosts?: number | null;
  annualProductiveFieldHours?: number | null;
}

export interface DetailedContractorOverheadInput
  extends ContractorOverheadRecoveryInput {
  overheadEntryMode: 'detailed';
  officeShop: number;
  administrativePayroll: number;
  insuranceBonding: number;
  vehiclesTransportationOverhead: number;
  softwareCommunications: number;
  marketingSales: number;
  professionalCompliance: number;
  equipmentShopOverhead: number;
  otherOverhead: number;
  totalAnnualOverhead?: never;
}

export interface TotalContractorOverheadInput
  extends ContractorOverheadRecoveryInput {
  overheadEntryMode: 'total';
  totalAnnualOverhead: number;
  officeShop?: never;
  administrativePayroll?: never;
  insuranceBonding?: never;
  vehiclesTransportationOverhead?: never;
  softwareCommunications?: never;
  marketingSales?: never;
  professionalCompliance?: never;
  equipmentShopOverhead?: never;
  otherOverhead?: never;
}

export type ContractorOverheadInput =
  | DetailedContractorOverheadInput
  | TotalContractorOverheadInput;

export type ContractorOverheadValidationField =
  | 'overheadEntryMode'
  | 'officeShop'
  | 'administrativePayroll'
  | 'insuranceBonding'
  | 'vehiclesTransportationOverhead'
  | 'softwareCommunications'
  | 'marketingSales'
  | 'professionalCompliance'
  | 'equipmentShopOverhead'
  | 'otherOverhead'
  | 'totalAnnualOverhead'
  | 'annualRevenue'
  | 'annualDirectLaborCost'
  | 'annualDirectJobCosts'
  | 'annualProductiveFieldHours'
  | 'calculation';

export type ContractorOverheadValidationCode =
  | 'not_finite'
  | 'must_be_nonnegative'
  | 'must_be_positive'
  | 'unsupported_entry_mode'
  | 'annual_overhead_nonpositive'
  | 'calculation_overflow';

export interface ContractorOverheadValidationError {
  field: ContractorOverheadValidationField;
  code: ContractorOverheadValidationCode;
  message: string;
}

export interface ContractorOverheadRevenueRecovery {
  annualRevenue: number;
  overheadAsPercentOfRevenue: number;
}

export interface ContractorOverheadDollarRecovery {
  overheadPerDollar: number;
  overheadAsPercentOfBase: number;
}

export interface ContractorOverheadDirectLaborRecovery
  extends ContractorOverheadDollarRecovery {
  annualDirectLaborCost: number;
}

export interface ContractorOverheadDirectCostRecovery
  extends ContractorOverheadDollarRecovery {
  annualDirectJobCosts: number;
}

export interface ContractorOverheadProductiveHourRecovery {
  annualProductiveFieldHours: number;
  overheadPerProductiveFieldHour: number;
}

export interface ContractorOverheadResult {
  overheadEntryMode: ContractorOverheadEntryMode;
  totalAnnualOverhead: number;
  monthlyOverhead: number;
  weeklyOverhead: number;
  revenueRecovery: ContractorOverheadRevenueRecovery | null;
  directLaborRecovery: ContractorOverheadDirectLaborRecovery | null;
  directCostRecovery: ContractorOverheadDirectCostRecovery | null;
  productiveHourRecovery: ContractorOverheadProductiveHourRecovery | null;
}

export type ContractorOverheadCalculation =
  | { success: true; result: ContractorOverheadResult }
  | { success: false; errors: ContractorOverheadValidationError[] };

const MONTHS_PER_YEAR = 12;
const WEEKS_PER_YEAR = 52;
const PERCENTAGE_POINTS_PER_WHOLE = 100;

const detailedFields = [
  'officeShop',
  'administrativePayroll',
  'insuranceBonding',
  'vehiclesTransportationOverhead',
  'softwareCommunications',
  'marketingSales',
  'professionalCompliance',
  'equipmentShopOverhead',
  'otherOverhead',
] as const satisfies readonly (keyof DetailedContractorOverheadInput)[];

const recoveryFields = [
  'annualRevenue',
  'annualDirectLaborCost',
  'annualDirectJobCosts',
  'annualProductiveFieldHours',
] as const satisfies readonly (keyof ContractorOverheadRecoveryInput)[];

function finiteError(
  field: ContractorOverheadValidationField,
): ContractorOverheadValidationError {
  return {
    field,
    code: 'not_finite',
    message: `${field} must be a finite number.`,
  };
}

/**
 * Calculates annual company overhead and optional denominator-based recovery
 * views. Monetary results retain JavaScript number precision and are not
 * rounded for display.
 */
export function calculateContractorOverhead(
  input: ContractorOverheadInput,
): ContractorOverheadCalculation {
  const errors: ContractorOverheadValidationError[] = [];
  const overheadEntryMode = input.overheadEntryMode as string;

  if (overheadEntryMode !== 'detailed' && overheadEntryMode !== 'total') {
    return {
      success: false,
      errors: [
        {
          field: 'overheadEntryMode',
          code: 'unsupported_entry_mode',
          message: 'overheadEntryMode must be detailed or total.',
        },
      ],
    };
  }

  let totalAnnualOverhead = 0;

  if (overheadEntryMode === 'detailed') {
    const detailedInput = input as DetailedContractorOverheadInput;

    for (const field of detailedFields) {
      const value = detailedInput[field];
      if (!Number.isFinite(value)) {
        errors.push(finiteError(field));
      } else if (value < 0) {
        errors.push({
          field,
          code: 'must_be_nonnegative',
          message: `${field} must be zero or greater.`,
        });
      }
    }

    if (errors.length === 0) {
      totalAnnualOverhead = detailedFields.reduce(
        (total, field) => total + detailedInput[field],
        0,
      );
    }
  } else {
    const totalInput = input as TotalContractorOverheadInput;
    if (!Number.isFinite(totalInput.totalAnnualOverhead)) {
      errors.push(finiteError('totalAnnualOverhead'));
    } else if (totalInput.totalAnnualOverhead <= 0) {
      errors.push({
        field: 'totalAnnualOverhead',
        code: 'must_be_positive',
        message: 'totalAnnualOverhead must be greater than zero.',
      });
    } else {
      totalAnnualOverhead = totalInput.totalAnnualOverhead;
    }
  }

  for (const field of recoveryFields) {
    const value = input[field];
    if (value === undefined || value === null) continue;

    if (!Number.isFinite(value)) {
      errors.push(finiteError(field));
    } else if (value <= 0) {
      errors.push({
        field,
        code: 'must_be_positive',
        message: `${field} must be greater than zero when provided.`,
      });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  if (!Number.isFinite(totalAnnualOverhead)) {
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

  if (totalAnnualOverhead <= 0) {
    return {
      success: false,
      errors: [
        {
          field: 'totalAnnualOverhead',
          code: 'annual_overhead_nonpositive',
          message: 'Total annual overhead must be greater than zero.',
        },
      ],
    };
  }

  const monthlyOverhead = totalAnnualOverhead / MONTHS_PER_YEAR;
  const weeklyOverhead = totalAnnualOverhead / WEEKS_PER_YEAR;
  const annualRevenue = input.annualRevenue;
  const annualDirectLaborCost = input.annualDirectLaborCost;
  const annualDirectJobCosts = input.annualDirectJobCosts;
  const annualProductiveFieldHours = input.annualProductiveFieldHours;

  const revenueRecovery =
    annualRevenue === undefined || annualRevenue === null
      ? null
      : {
          annualRevenue,
          overheadAsPercentOfRevenue:
            (totalAnnualOverhead / annualRevenue) *
            PERCENTAGE_POINTS_PER_WHOLE,
        };
  const directLaborRecovery =
    annualDirectLaborCost === undefined || annualDirectLaborCost === null
      ? null
      : {
          annualDirectLaborCost,
          overheadPerDollar: totalAnnualOverhead / annualDirectLaborCost,
          overheadAsPercentOfBase:
            (totalAnnualOverhead / annualDirectLaborCost) *
            PERCENTAGE_POINTS_PER_WHOLE,
        };
  const directCostRecovery =
    annualDirectJobCosts === undefined || annualDirectJobCosts === null
      ? null
      : {
          annualDirectJobCosts,
          overheadPerDollar: totalAnnualOverhead / annualDirectJobCosts,
          overheadAsPercentOfBase:
            (totalAnnualOverhead / annualDirectJobCosts) *
            PERCENTAGE_POINTS_PER_WHOLE,
        };
  const productiveHourRecovery =
    annualProductiveFieldHours === undefined ||
    annualProductiveFieldHours === null
      ? null
      : {
          annualProductiveFieldHours,
          overheadPerProductiveFieldHour:
            totalAnnualOverhead / annualProductiveFieldHours,
        };

  const numericResults = [
    totalAnnualOverhead,
    monthlyOverhead,
    weeklyOverhead,
    ...(revenueRecovery === null
      ? []
      : [
          revenueRecovery.annualRevenue,
          revenueRecovery.overheadAsPercentOfRevenue,
        ]),
    ...(directLaborRecovery === null
      ? []
      : [
          directLaborRecovery.annualDirectLaborCost,
          directLaborRecovery.overheadPerDollar,
          directLaborRecovery.overheadAsPercentOfBase,
        ]),
    ...(directCostRecovery === null
      ? []
      : [
          directCostRecovery.annualDirectJobCosts,
          directCostRecovery.overheadPerDollar,
          directCostRecovery.overheadAsPercentOfBase,
        ]),
    ...(productiveHourRecovery === null
      ? []
      : [
          productiveHourRecovery.annualProductiveFieldHours,
          productiveHourRecovery.overheadPerProductiveFieldHour,
        ]),
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
      overheadEntryMode,
      totalAnnualOverhead,
      monthlyOverhead,
      weeklyOverhead,
      revenueRecovery,
      directLaborRecovery,
      directCostRecovery,
      productiveHourRecovery,
    },
  };
}
