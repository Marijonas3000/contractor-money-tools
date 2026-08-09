export type ContractorMarkupMode =
  | 'add-markup'
  | 'target-margin'
  | 'check-price';

export interface ContractorMarkupBreakdownCostInput {
  costEntryMode: 'breakdown';
  laborCost: number;
  materialsCost: number;
  subcontractorsCost: number;
  equipmentAndOtherDirectCosts: number;
  allocatedOverhead: number;
  totalJobCost?: never;
}

export interface ContractorMarkupTotalCostInput {
  costEntryMode: 'total';
  totalJobCost: number;
  laborCost?: never;
  materialsCost?: never;
  subcontractorsCost?: never;
  equipmentAndOtherDirectCosts?: never;
  allocatedOverhead?: never;
}

export type ContractorMarkupCostInput =
  | ContractorMarkupBreakdownCostInput
  | ContractorMarkupTotalCostInput;

export type ContractorMarkupInput = ContractorMarkupCostInput &
  (
    | {
        mode: 'add-markup';
        markupPercent: number;
        targetMarginPercent?: never;
        sellingPrice?: never;
      }
    | {
        mode: 'target-margin';
        targetMarginPercent: number;
        markupPercent?: never;
        sellingPrice?: never;
      }
    | {
        mode: 'check-price';
        sellingPrice: number;
        markupPercent?: never;
        targetMarginPercent?: never;
      }
  );

export type ContractorMarkupValidationField =
  | 'mode'
  | 'costEntryMode'
  | 'laborCost'
  | 'materialsCost'
  | 'subcontractorsCost'
  | 'equipmentAndOtherDirectCosts'
  | 'allocatedOverhead'
  | 'totalJobCost'
  | 'enteredJobCost'
  | 'markupPercent'
  | 'targetMarginPercent'
  | 'sellingPrice'
  | 'calculation';

export type ContractorMarkupValidationCode =
  | 'not_finite'
  | 'must_be_nonnegative'
  | 'must_be_positive'
  | 'unsupported_mode'
  | 'unsupported_cost_entry_mode'
  | 'entered_job_cost_nonpositive'
  | 'target_margin_out_of_range'
  | 'calculation_overflow';

export interface ContractorMarkupValidationError {
  field: ContractorMarkupValidationField;
  code: ContractorMarkupValidationCode;
  message: string;
}

export interface ContractorMarkupResult {
  mode: ContractorMarkupMode;
  costEntryMode: ContractorMarkupCostInput['costEntryMode'];
  enteredJobCost: number;
  markupAmount: number;
  markupPercent: number;
  marginPercent: number;
  sellingPrice: number;
  costMultiplier: number;
  isBelowCost: boolean;
}

export type ContractorMarkupCalculation =
  | { success: true; result: ContractorMarkupResult }
  | { success: false; errors: ContractorMarkupValidationError[] };

const PERCENTAGE_POINTS_PER_WHOLE = 100;
const breakdownFields = [
  'laborCost',
  'materialsCost',
  'subcontractorsCost',
  'equipmentAndOtherDirectCosts',
  'allocatedOverhead',
] as const satisfies readonly (keyof ContractorMarkupBreakdownCostInput)[];

function finiteError(
  field: ContractorMarkupValidationField,
): ContractorMarkupValidationError {
  return {
    field,
    code: 'not_finite',
    message: `${field} must be a finite number.`,
  };
}

/**
 * Calculates job selling price, markup, and margin from the active mode.
 *
 * Percentage inputs and outputs use percentage points: `25` means 25%.
 * Results retain JavaScript number precision and are not rounded for display.
 */
export function calculateContractorMarkup(
  input: ContractorMarkupInput,
): ContractorMarkupCalculation {
  const errors: ContractorMarkupValidationError[] = [];
  const mode = input.mode as ContractorMarkupMode;
  const costEntryMode = input.costEntryMode as
    | ContractorMarkupCostInput['costEntryMode']
    | string;

  if (
    mode !== 'add-markup' &&
    mode !== 'target-margin' &&
    mode !== 'check-price'
  ) {
    return {
      success: false,
      errors: [
        {
          field: 'mode',
          code: 'unsupported_mode',
          message:
            'Mode must be add-markup, target-margin, or check-price.',
        },
      ],
    };
  }

  if (costEntryMode !== 'breakdown' && costEntryMode !== 'total') {
    return {
      success: false,
      errors: [
        {
          field: 'costEntryMode',
          code: 'unsupported_cost_entry_mode',
          message: 'Cost entry mode must be breakdown or total.',
        },
      ],
    };
  }

  let enteredJobCost = 0;

  if (costEntryMode === 'breakdown') {
    const breakdownInput = input as ContractorMarkupBreakdownCostInput;

    for (const field of breakdownFields) {
      const value = breakdownInput[field];
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
      enteredJobCost = breakdownFields.reduce(
        (total, field) => total + breakdownInput[field],
        0,
      );
    }
  } else {
    const totalJobCost = (input as ContractorMarkupTotalCostInput).totalJobCost;
    if (!Number.isFinite(totalJobCost)) {
      errors.push(finiteError('totalJobCost'));
    } else if (totalJobCost <= 0) {
      errors.push({
        field: 'totalJobCost',
        code: 'must_be_positive',
        message: 'totalJobCost must be greater than zero.',
      });
    } else {
      enteredJobCost = totalJobCost;
    }
  }

  if (mode === 'add-markup') {
    const markupPercent = input.markupPercent;
    if (typeof markupPercent !== 'number' || !Number.isFinite(markupPercent)) {
      errors.push(finiteError('markupPercent'));
    } else if (markupPercent < 0) {
      errors.push({
        field: 'markupPercent',
        code: 'must_be_nonnegative',
        message: 'markupPercent must be zero or greater.',
      });
    }
  } else if (mode === 'target-margin') {
    const targetMarginPercent = input.targetMarginPercent;
    if (
      typeof targetMarginPercent !== 'number' ||
      !Number.isFinite(targetMarginPercent)
    ) {
      errors.push(finiteError('targetMarginPercent'));
    } else if (
      targetMarginPercent < 0 ||
      targetMarginPercent >= PERCENTAGE_POINTS_PER_WHOLE
    ) {
      errors.push({
        field: 'targetMarginPercent',
        code: 'target_margin_out_of_range',
        message: 'targetMarginPercent must be at least 0 and less than 100.',
      });
    }
  } else {
    const sellingPrice = input.sellingPrice;
    if (typeof sellingPrice !== 'number' || !Number.isFinite(sellingPrice)) {
      errors.push(finiteError('sellingPrice'));
    } else if (sellingPrice <= 0) {
      errors.push({
        field: 'sellingPrice',
        code: 'must_be_positive',
        message: 'sellingPrice must be greater than zero.',
      });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  if (enteredJobCost <= 0) {
    return {
      success: false,
      errors: [
        {
          field: 'enteredJobCost',
          code: 'entered_job_cost_nonpositive',
          message: 'Entered job cost must be greater than zero.',
        },
      ],
    };
  }

  let markupAmount: number;
  let markupPercent: number;
  let marginPercent: number;
  let sellingPrice: number;

  if (mode === 'add-markup') {
    markupPercent = input.markupPercent as number;
    markupAmount =
      enteredJobCost * (markupPercent / PERCENTAGE_POINTS_PER_WHOLE);
    sellingPrice = enteredJobCost + markupAmount;
    marginPercent =
      (markupAmount / sellingPrice) * PERCENTAGE_POINTS_PER_WHOLE;
  } else if (mode === 'target-margin') {
    marginPercent = input.targetMarginPercent as number;
    sellingPrice =
      enteredJobCost /
      (1 - marginPercent / PERCENTAGE_POINTS_PER_WHOLE);
    markupAmount = sellingPrice - enteredJobCost;
    markupPercent =
      (markupAmount / enteredJobCost) * PERCENTAGE_POINTS_PER_WHOLE;
  } else {
    sellingPrice = input.sellingPrice as number;
    markupAmount = sellingPrice - enteredJobCost;
    markupPercent =
      (markupAmount / enteredJobCost) * PERCENTAGE_POINTS_PER_WHOLE;
    marginPercent =
      (markupAmount / sellingPrice) * PERCENTAGE_POINTS_PER_WHOLE;
  }

  const costMultiplier = sellingPrice / enteredJobCost;
  const numericResults = [
    enteredJobCost,
    markupAmount,
    markupPercent,
    marginPercent,
    sellingPrice,
    costMultiplier,
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
      mode,
      costEntryMode,
      enteredJobCost,
      markupAmount,
      markupPercent,
      marginPercent,
      sellingPrice,
      costMultiplier,
      isBelowCost: mode === 'check-price' && sellingPrice < enteredJobCost,
    },
  };
}
