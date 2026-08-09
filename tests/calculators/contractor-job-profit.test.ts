import { describe, expect, it } from 'vitest';
import {
  calculateContractorJobProfit,
  type ContractorJobProfitInput,
  type JobEconomicsInput,
} from '../../src/lib/calculators/contractor-job-profit';

const estimated: JobEconomicsInput = {
  revenue: 20_000,
  laborCost: 5_000,
  materialsCost: 4_000,
  subcontractorsCost: 2_000,
  equipmentCost: 500,
  otherDirectCosts: 500,
  allocatedOverhead: 2_000,
};

const actual: JobEconomicsInput = {
  revenue: 21_000,
  laborCost: 6_000,
  materialsCost: 4_500,
  subcontractorsCost: 2_000,
  equipmentCost: 700,
  otherDirectCosts: 500,
  allocatedOverhead: 2_200,
};

function result(input: ContractorJobProfitInput) {
  const calculation = calculateContractorJobProfit(input);
  expect(calculation.success).toBe(true);
  if (!calculation.success) throw new Error('Expected a successful calculation');
  return calculation.result;
}

function errors(input: ContractorJobProfitInput) {
  const calculation = calculateContractorJobProfit(input);
  expect(calculation.success).toBe(false);
  if (calculation.success) throw new Error('Expected validation errors');
  return calculation.errors;
}

describe('calculateContractorJobProfit core calculations', () => {
  it('calculates the estimated baseline', () => {
    const side = result({ estimated }).estimated;
    expect(side).toMatchObject({
      directJobCosts: 12_000,
      contributionAfterDirectCosts: 8_000,
      totalJobCost: 14_000,
      jobProfit: 6_000,
      jobMarginPercent: 30,
    });
  });

  it('sums every estimated direct cost category', () => {
    expect(result({ estimated }).estimated?.directJobCosts).toBe(12_000);
  });

  it('calculates estimated contribution', () => {
    expect(result({ estimated }).estimated?.contributionAfterDirectCosts).toBe(8_000);
  });

  it('calculates estimated total job cost', () => {
    expect(result({ estimated }).estimated?.totalJobCost).toBe(14_000);
  });

  it('calculates estimated job profit', () => {
    expect(result({ estimated }).estimated?.jobProfit).toBe(6_000);
  });

  it('calculates estimated job margin', () => {
    expect(result({ estimated }).estimated?.jobMarginPercent).toBe(30);
  });

  it('calculates markup on entered job cost', () => {
    expect(result({ estimated }).estimated?.markupOnEnteredJobCostPercent).toBeCloseTo(42.857142857142854);
  });

  it('calculates the actual baseline with identical methodology', () => {
    const side = result({ actual }).actual;
    expect(side).toMatchObject({
      directJobCosts: 13_700,
      contributionAfterDirectCosts: 7_300,
      totalJobCost: 15_900,
      jobProfit: 5_100,
    });
    expect(side?.jobMarginPercent).toBeCloseTo(24.285714285714285);
  });

  it('keeps direct job costs separate from allocated overhead', () => {
    const side = result({ estimated }).estimated;
    expect(side?.directJobCosts).toBe(12_000);
    expect(side?.totalJobCost).toBe(14_000);
  });

  it('includes allocated overhead exactly once', () => {
    const side = result({ estimated }).estimated;
    expect(side?.totalJobCost).toBe((side?.directJobCosts ?? 0) + 2_000);
  });

  it('makes contribution less overhead equal job profit', () => {
    const side = result({ estimated }).estimated;
    expect((side?.contributionAfterDirectCosts ?? 0) - (side?.allocatedOverhead ?? 0)).toBe(side?.jobProfit);
  });

  it('makes revenue less total cost equal job profit', () => {
    const side = result({ actual }).actual;
    expect((side?.revenue ?? 0) - (side?.totalJobCost ?? 0)).toBe(side?.jobProfit);
  });
});

describe('zero revenue and profit states', () => {
  it('handles zero revenue with zero costs', () => {
    const side = result({ actual: { revenue: 0 } }).actual;
    expect(side).toMatchObject({ totalJobCost: 0, jobProfit: 0 });
    expect(side?.jobMarginPercent).toBeNull();
    expect(side?.markupOnEnteredJobCostPercent).toBeNull();
  });

  it('handles zero revenue with positive costs', () => {
    const side = result({ actual: { revenue: 0, laborCost: 500 } }).actual;
    expect(side?.jobProfit).toBe(-500);
    expect(side?.jobMarginPercent).toBeNull();
  });

  it('returns only finite numeric values for zero revenue', () => {
    const side = result({ actual: { revenue: 0, materialsCost: 250 } }).actual;
    expect(Object.values(side ?? {}).filter((value) => value !== null).every(Number.isFinite)).toBe(true);
  });

  it('returns positive signed job profit', () => {
    expect(result({ actual: { revenue: 100, laborCost: 40 } }).actual?.jobProfit).toBe(60);
  });

  it('returns negative signed job profit', () => {
    expect(result({ actual: { revenue: 100, laborCost: 140 } }).actual?.jobProfit).toBe(-40);
  });

  it('returns zero signed job profit at break-even', () => {
    expect(result({ actual: { revenue: 100, laborCost: 100 } }).actual?.jobProfit).toBe(0);
  });

  it('calculates a negative margin when positive revenue is below cost', () => {
    expect(result({ actual: { revenue: 100, laborCost: 125 } }).actual?.jobMarginPercent).toBe(-25);
  });

  it('calculates 100 percent margin with positive revenue and zero cost', () => {
    const side = result({ actual: { revenue: 100, laborCost: 0 } }).actual;
    expect(side?.jobMarginPercent).toBe(100);
    expect(side?.markupOnEnteredJobCostPercent).toBeNull();
  });
});

describe('validation', () => {
  it.each([
    ['estimated.revenue', { estimated: { revenue: -1 } }],
    ['actual.revenue', { actual: { revenue: -1 } }],
    ['estimated.laborCost', { estimated: { laborCost: -1 } }],
    ['estimated.materialsCost', { estimated: { materialsCost: -1 } }],
    ['estimated.subcontractorsCost', { estimated: { subcontractorsCost: -1 } }],
    ['estimated.equipmentCost', { estimated: { equipmentCost: -1 } }],
    ['estimated.otherDirectCosts', { estimated: { otherDirectCosts: -1 } }],
    ['estimated.allocatedOverhead', { estimated: { allocatedOverhead: -1 } }],
  ] as const)('rejects negative %s', (field, input) => {
    expect(errors(input)[0]).toMatchObject({ field, code: 'must_be_nonnegative' });
  });

  it('rejects a non-finite supplied input', () => {
    expect(errors({ actual: { revenue: Number.NaN } })[0]).toMatchObject({
      field: 'actual.revenue',
      code: 'not_finite',
    });
  });

  it('collects multiple field-specific errors', () => {
    expect(errors({ actual: { laborCost: -1, materialsCost: Infinity } })).toHaveLength(2);
  });
});

describe('blank, zero, and partial sides', () => {
  it('returns no meaningful results for entirely blank input', () => {
    expect(result({})).toEqual({ estimated: null, actual: null, variances: null });
  });

  it('treats empty side objects as blank', () => {
    expect(result({ estimated: {}, actual: {} })).toEqual({ estimated: null, actual: null, variances: null });
  });

  it('treats null and undefined fields as blank', () => {
    expect(result({ estimated: { revenue: null }, actual: { laborCost: undefined } })).toEqual({
      estimated: null,
      actual: null,
      variances: null,
    });
  });

  it('supports estimated-only input', () => {
    const output = result({ estimated });
    expect(output.estimated).not.toBeNull();
    expect(output.actual).toBeNull();
    expect(output.variances).toBeNull();
  });

  it('supports actual-only input', () => {
    const output = result({ actual });
    expect(output.estimated).toBeNull();
    expect(output.actual).not.toBeNull();
    expect(output.variances).toBeNull();
  });

  it('normalizes blank costs to zero on a meaningful side', () => {
    expect(result({ estimated: { revenue: 50 } }).estimated).toMatchObject({
      laborCost: 0,
      materialsCost: 0,
      directJobCosts: 0,
      totalJobCost: 0,
    });
  });

  it('recognizes an explicitly supplied zero as meaningful', () => {
    const side = result({ actual: { laborCost: 0 } }).actual;
    expect(side).not.toBeNull();
    expect(side?.laborCost).toBe(0);
  });

  it('calculates cost totals but no performance fields without revenue', () => {
    const side = result({ actual: { laborCost: 100, allocatedOverhead: 25 } }).actual;
    expect(side).toMatchObject({ directJobCosts: 100, totalJobCost: 125 });
    expect(side?.contributionAfterDirectCosts).toBeNull();
    expect(side?.jobProfit).toBeNull();
    expect(side?.jobMarginPercent).toBeNull();
    expect(side?.markupOnEnteredJobCostPercent).toBeNull();
  });
});

describe('variances', () => {
  it('calculates the approved worked example exactly', () => {
    const output = result({ estimated, actual });
    expect(output.estimated).toMatchObject({
      directJobCosts: 12_000,
      contributionAfterDirectCosts: 8_000,
      totalJobCost: 14_000,
      jobProfit: 6_000,
      jobMarginPercent: 30,
    });
    expect(output.actual).toMatchObject({
      directJobCosts: 13_700,
      contributionAfterDirectCosts: 7_300,
      totalJobCost: 15_900,
      jobProfit: 5_100,
    });
    expect(output.actual?.jobMarginPercent).toBeCloseTo(24.285714285714285);
    expect(output.variances).toEqual({
      revenueVariance: 1_000,
      laborVariance: 1_000,
      materialsVariance: 500,
      subcontractorsVariance: 0,
      equipmentVariance: 200,
      otherDirectCostsVariance: 0,
      allocatedOverheadVariance: 200,
      directJobCostVariance: 1_700,
      contributionChange: -700,
      totalJobCostVariance: 1_900,
      jobProfitVariance: -900,
      marginChangePercentagePoints: expect.closeTo(-5.714285714285715),
    });
  });

  it('calculates cost variances when both sides are meaningful without revenue', () => {
    const variances = result({
      estimated: { laborCost: 10 },
      actual: { laborCost: 15 },
    }).variances;
    expect(variances).toMatchObject({ laborVariance: 5, directJobCostVariance: 5 });
    expect(variances?.revenueVariance).toBeNull();
    expect(variances?.contributionChange).toBeNull();
    expect(variances?.jobProfitVariance).toBeNull();
  });

  it('keeps positive and negative variance directions as actual minus estimated', () => {
    const variances = result({
      estimated: { revenue: 100, laborCost: 60, materialsCost: 20 },
      actual: { revenue: 90, laborCost: 70, materialsCost: 10 },
    }).variances;
    expect(variances).toMatchObject({ revenueVariance: -10, laborVariance: 10, materialsVariance: -10 });
  });

  it('returns null margin change if either revenue is zero', () => {
    expect(result({ estimated: { revenue: 0 }, actual: { revenue: 10 } }).variances?.marginChangePercentagePoints).toBeNull();
  });

  it('returns null performance variances if either revenue is omitted', () => {
    const variances = result({ estimated: { laborCost: 5 }, actual: { revenue: 10 } }).variances;
    expect(variances?.revenueVariance).toBeNull();
    expect(variances?.contributionChange).toBeNull();
    expect(variances?.jobProfitVariance).toBeNull();
  });
});

describe('precision and numeric safety', () => {
  it('preserves decimal input precision', () => {
    const side = result({
      actual: { revenue: 123.45, laborCost: 12.34, materialsCost: 5.67, allocatedOverhead: 1.23 },
    }).actual;
    expect(side?.directJobCosts).toBeCloseTo(18.01, 12);
    expect(side?.totalJobCost).toBeCloseTo(19.24, 12);
    expect(side?.jobProfit).toBeCloseTo(104.21, 12);
  });

  it('handles large finite values when outputs remain finite', () => {
    const side = result({ actual: { revenue: 1e200, laborCost: 2e199 } }).actual;
    expect((side?.jobProfit ?? 0) / 1e200).toBeCloseTo(0.8, 12);
  });

  it('returns calculation_overflow when a direct-cost sum overflows', () => {
    const calculationErrors = errors({
      actual: {
        revenue: Number.MAX_VALUE,
        laborCost: Number.MAX_VALUE,
        materialsCost: Number.MAX_VALUE,
      },
    });
    expect(calculationErrors).toEqual([
      expect.objectContaining({ field: 'calculation', code: 'calculation_overflow' }),
    ]);
  });

  it('returns calculation_overflow when a variance overflows', () => {
    const calculationErrors = errors({
      estimated: { revenue: Number.MAX_VALUE, laborCost: 0 },
      actual: { revenue: 0, laborCost: Number.MAX_VALUE },
    });
    expect(calculationErrors[0]).toMatchObject({ field: 'calculation', code: 'calculation_overflow' });
  });
});
