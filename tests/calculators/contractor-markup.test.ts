import { describe, expect, it } from 'vitest';

import {
  calculateContractorMarkup,
  type ContractorMarkupInput,
} from '../../src/lib/calculators/contractor-markup';

const breakdownCost = {
  costEntryMode: 'breakdown',
  laborCost: 4_000,
  materialsCost: 3_000,
  subcontractorsCost: 1_000,
  equipmentAndOtherDirectCosts: 1_000,
  allocatedOverhead: 1_000,
} as const;

const addMarkupBaseline: ContractorMarkupInput = {
  ...breakdownCost,
  mode: 'add-markup',
  markupPercent: 25,
};

function expectSuccess(input: ContractorMarkupInput) {
  const calculation = calculateContractorMarkup(input);
  expect(calculation.success).toBe(true);

  if (!calculation.success) {
    throw new Error('Expected a successful contractor markup calculation.');
  }

  return calculation.result;
}

function expectFieldError(
  input: ContractorMarkupInput,
  field: string,
  code?: string,
) {
  const calculation = calculateContractorMarkup(input);
  expect(calculation.success).toBe(false);

  if (calculation.success) {
    throw new Error('Expected a contractor markup validation error.');
  }

  expect(calculation.errors).toContainEqual(
    expect.objectContaining({ field, ...(code ? { code } : {}) }),
  );
}

describe('calculateContractorMarkup', () => {
  describe('add-markup mode', () => {
    it('calculates the baseline scenario', () => {
      const result = expectSuccess(addMarkupBaseline);

      expect(result).toEqual({
        mode: 'add-markup',
        costEntryMode: 'breakdown',
        enteredJobCost: 10_000,
        markupAmount: 2_500,
        markupPercent: 25,
        marginPercent: 20,
        sellingPrice: 12_500,
        costMultiplier: 1.25,
        isBelowCost: false,
      });
    });

    it('allows zero percent markup', () => {
      const result = expectSuccess({
        ...addMarkupBaseline,
        markupPercent: 0,
      });

      expect(result.markupAmount).toBe(0);
      expect(result.sellingPrice).toBe(10_000);
      expect(result.marginPercent).toBe(0);
      expect(result.costMultiplier).toBe(1);
    });

    it('converts 25 percent markup to 20 percent margin', () => {
      const result = expectSuccess(addMarkupBaseline);

      expect(result.markupPercent).toBe(25);
      expect(result.marginPercent).toBe(20);
    });

    it('preserves precision for decimal values', () => {
      const input: ContractorMarkupInput = {
        costEntryMode: 'total',
        totalJobCost: 1_234.56,
        mode: 'add-markup',
        markupPercent: 17.25,
      };
      const result = expectSuccess(input);
      const expectedAmount = 1_234.56 * (17.25 / 100);

      expect(result.markupAmount).toBe(expectedAmount);
      expect(result.sellingPrice).toBe(1_234.56 + expectedAmount);
      expect(result.marginPercent).toBe(
        (expectedAmount / result.sellingPrice) * 100,
      );
    });

    it('calculates large finite values', () => {
      const result = expectSuccess({
        costEntryMode: 'total',
        totalJobCost: 1e200,
        mode: 'add-markup',
        markupPercent: 50,
      });

      expect(result.markupAmount).toBe(5e199);
      expect(result.sellingPrice).toBe(1.5e200);
      expect(result.costMultiplier).toBe(1.5);
    });

    it('returns a structured error when calculated values overflow', () => {
      expectFieldError(
        {
          costEntryMode: 'total',
          totalJobCost: Number.MAX_VALUE,
          mode: 'add-markup',
          markupPercent: 100,
        },
        'calculation',
        'calculation_overflow',
      );
    });

    it('rejects negative markup', () => {
      expectFieldError(
        { ...addMarkupBaseline, markupPercent: -1 },
        'markupPercent',
        'must_be_nonnegative',
      );
    });

    it('rejects non-finite markup', () => {
      expectFieldError(
        { ...addMarkupBaseline, markupPercent: Number.NaN },
        'markupPercent',
        'not_finite',
      );
    });
  });

  describe('target-margin mode', () => {
    const targetMarginBaseline: ContractorMarkupInput = {
      ...breakdownCost,
      mode: 'target-margin',
      targetMarginPercent: 25,
    };

    it('calculates the baseline target-margin scenario', () => {
      const result = expectSuccess(targetMarginBaseline);

      expect(result.enteredJobCost).toBe(10_000);
      expect(result.sellingPrice).toBe(10_000 / 0.75);
      expect(result.markupAmount).toBe(result.sellingPrice - 10_000);
      expect(result.marginPercent).toBe(25);
      expect(result.isBelowCost).toBe(false);
    });

    it('allows zero percent target margin', () => {
      const result = expectSuccess({
        ...targetMarginBaseline,
        targetMarginPercent: 0,
      });

      expect(result.sellingPrice).toBe(10_000);
      expect(result.markupAmount).toBe(0);
      expect(result.markupPercent).toBe(0);
      expect(result.costMultiplier).toBe(1);
    });

    it('uses correct 20 percent target-margin math', () => {
      const result = expectSuccess({
        ...targetMarginBaseline,
        targetMarginPercent: 20,
      });

      expect(result.sellingPrice).toBe(12_500);
      expect(result.markupAmount).toBe(2_500);
      expect(result.markupPercent).toBe(25);
      expect(result.marginPercent).toBe(20);
    });

    it('converts 25 percent margin to repeating markup precision', () => {
      const result = expectSuccess(targetMarginBaseline);

      expect(result.markupPercent).toBeCloseTo(33.33333333333333, 12);
      expect(result.costMultiplier).toBeCloseTo(1.3333333333333333, 12);
    });

    it('rejects target margin equal to 100 percent', () => {
      expectFieldError(
        { ...targetMarginBaseline, targetMarginPercent: 100 },
        'targetMarginPercent',
        'target_margin_out_of_range',
      );
    });

    it('rejects target margin greater than 100 percent', () => {
      expectFieldError(
        { ...targetMarginBaseline, targetMarginPercent: 125 },
        'targetMarginPercent',
        'target_margin_out_of_range',
      );
    });

    it('rejects negative target margin', () => {
      expectFieldError(
        { ...targetMarginBaseline, targetMarginPercent: -0.01 },
        'targetMarginPercent',
        'target_margin_out_of_range',
      );
    });

    it('rejects non-finite target margin', () => {
      expectFieldError(
        {
          ...targetMarginBaseline,
          targetMarginPercent: Number.POSITIVE_INFINITY,
        },
        'targetMarginPercent',
        'not_finite',
      );
    });
  });

  describe('check-price mode', () => {
    const checkPriceBaseline: ContractorMarkupInput = {
      ...breakdownCost,
      mode: 'check-price',
      sellingPrice: 12_500,
    };

    it('calculates a profitable checked price', () => {
      const result = expectSuccess(checkPriceBaseline);

      expect(result.markupAmount).toBe(2_500);
      expect(result.markupPercent).toBe(25);
      expect(result.marginPercent).toBe(20);
      expect(result.costMultiplier).toBe(1.25);
      expect(result.isBelowCost).toBe(false);
    });

    it('allows selling price equal to cost', () => {
      const result = expectSuccess({
        ...checkPriceBaseline,
        sellingPrice: 10_000,
      });

      expect(result.markupAmount).toBe(0);
      expect(result.markupPercent).toBe(0);
      expect(result.marginPercent).toBe(0);
      expect(result.costMultiplier).toBe(1);
      expect(result.isBelowCost).toBe(false);
    });

    it('allows a price below cost and returns negative values', () => {
      const result = expectSuccess({
        ...checkPriceBaseline,
        sellingPrice: 8_000,
      });

      expect(result.markupAmount).toBe(-2_000);
      expect(result.markupPercent).toBe(-20);
      expect(result.marginPercent).toBe(-25);
      expect(result.costMultiplier).toBe(0.8);
      expect(result.isBelowCost).toBe(true);
    });

    it('rejects zero selling price', () => {
      expectFieldError(
        { ...checkPriceBaseline, sellingPrice: 0 },
        'sellingPrice',
        'must_be_positive',
      );
    });

    it('rejects negative selling price', () => {
      expectFieldError(
        { ...checkPriceBaseline, sellingPrice: -1 },
        'sellingPrice',
        'must_be_positive',
      );
    });

    it('preserves precision for decimal values', () => {
      const result = expectSuccess({
        costEntryMode: 'total',
        totalJobCost: 987.65,
        mode: 'check-price',
        sellingPrice: 1_234.56,
      });
      const expectedAmount = 1_234.56 - 987.65;

      expect(result.markupAmount).toBe(expectedAmount);
      expect(result.markupPercent).toBe((expectedAmount / 987.65) * 100);
      expect(result.marginPercent).toBe((expectedAmount / 1_234.56) * 100);
    });
  });

  describe('cost breakdown', () => {
    it('includes every cost category in entered job cost', () => {
      const result = expectSuccess(addMarkupBaseline);

      expect(result.enteredJobCost).toBe(
        breakdownCost.laborCost +
          breakdownCost.materialsCost +
          breakdownCost.subcontractorsCost +
          breakdownCost.equipmentAndOtherDirectCosts +
          breakdownCost.allocatedOverhead,
      );
    });

    it('includes allocated overhead exactly once', () => {
      const result = expectSuccess({
        costEntryMode: 'breakdown',
        laborCost: 1_000,
        materialsCost: 0,
        subcontractorsCost: 0,
        equipmentAndOtherDirectCosts: 0,
        allocatedOverhead: 250,
        mode: 'add-markup',
        markupPercent: 10,
      });

      expect(result.enteredJobCost).toBe(1_250);
      expect(result.markupAmount).toBe(125);
    });

    it('allows zero-valued individual categories', () => {
      const result = expectSuccess({
        costEntryMode: 'breakdown',
        laborCost: 0,
        materialsCost: 500,
        subcontractorsCost: 0,
        equipmentAndOtherDirectCosts: 0,
        allocatedOverhead: 0,
        mode: 'add-markup',
        markupPercent: 0,
      });

      expect(result.enteredJobCost).toBe(500);
    });

    it('rejects all-zero cost categories', () => {
      expectFieldError(
        {
          costEntryMode: 'breakdown',
          laborCost: 0,
          materialsCost: 0,
          subcontractorsCost: 0,
          equipmentAndOtherDirectCosts: 0,
          allocatedOverhead: 0,
          mode: 'add-markup',
          markupPercent: 25,
        },
        'enteredJobCost',
        'entered_job_cost_nonpositive',
      );
    });

    it('rejects negative active cost categories', () => {
      expectFieldError(
        { ...addMarkupBaseline, materialsCost: -1 },
        'materialsCost',
        'must_be_nonnegative',
      );
    });

    it('rejects non-finite active cost categories', () => {
      expectFieldError(
        { ...addMarkupBaseline, laborCost: Number.NaN },
        'laborCost',
        'not_finite',
      );
    });
  });

  describe('total cost mode and inactive representations', () => {
    const totalCostBaseline: ContractorMarkupInput = {
      costEntryMode: 'total',
      totalJobCost: 10_000,
      mode: 'add-markup',
      markupPercent: 25,
    };

    it('calculates a normal total-cost baseline', () => {
      const result = expectSuccess(totalCostBaseline);

      expect(result.enteredJobCost).toBe(10_000);
      expect(result.sellingPrice).toBe(12_500);
    });

    it('rejects zero total job cost', () => {
      expectFieldError(
        { ...totalCostBaseline, totalJobCost: 0 },
        'totalJobCost',
        'must_be_positive',
      );
    });

    it('rejects negative total job cost', () => {
      expectFieldError(
        { ...totalCostBaseline, totalJobCost: -1 },
        'totalJobCost',
        'must_be_positive',
      );
    });

    it('ignores inactive breakdown values in total mode', () => {
      const input = {
        ...totalCostBaseline,
        laborCost: Number.NaN,
        materialsCost: -5_000,
        allocatedOverhead: Number.POSITIVE_INFINITY,
      } as unknown as ContractorMarkupInput;
      const result = expectSuccess(input);

      expect(result.enteredJobCost).toBe(10_000);
    });

    it('ignores inactive total-cost value in breakdown mode', () => {
      const input = {
        ...addMarkupBaseline,
        totalJobCost: Number.NaN,
      } as unknown as ContractorMarkupInput;
      const result = expectSuccess(input);

      expect(result.enteredJobCost).toBe(10_000);
    });

    it('does not double-count total and breakdown representations', () => {
      const input = {
        ...totalCostBaseline,
        laborCost: 100_000,
        materialsCost: 100_000,
        subcontractorsCost: 100_000,
        equipmentAndOtherDirectCosts: 100_000,
        allocatedOverhead: 100_000,
      } as unknown as ContractorMarkupInput;
      const result = expectSuccess(input);

      expect(result.enteredJobCost).toBe(10_000);
      expect(result.sellingPrice).toBe(12_500);
    });
  });

  describe('cross-mode consistency', () => {
    it('matches add-markup results when the selling price is checked', () => {
      const added = expectSuccess(addMarkupBaseline);
      const checked = expectSuccess({
        ...breakdownCost,
        mode: 'check-price',
        sellingPrice: added.sellingPrice,
      });

      expect(checked.markupAmount).toBe(added.markupAmount);
      expect(checked.markupPercent).toBe(added.markupPercent);
      expect(checked.marginPercent).toBe(added.marginPercent);
      expect(checked.costMultiplier).toBe(added.costMultiplier);
    });

    it('matches target-margin results when the selling price is checked', () => {
      const targeted = expectSuccess({
        ...breakdownCost,
        mode: 'target-margin',
        targetMarginPercent: 25,
      });
      const checked = expectSuccess({
        ...breakdownCost,
        mode: 'check-price',
        sellingPrice: targeted.sellingPrice,
      });

      expect(checked.markupAmount).toBe(targeted.markupAmount);
      expect(checked.markupPercent).toBe(targeted.markupPercent);
      expect(checked.marginPercent).toBeCloseTo(targeted.marginPercent, 12);
      expect(checked.costMultiplier).toBe(targeted.costMultiplier);
    });
  });
});
