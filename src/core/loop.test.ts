import { describe, expect, it } from 'vitest';
import { STEP, stepsFor } from './loop';

describe('stepsFor', () => {
  it('chia khung hình thành các bước ≤ 1/60 s', () => {
    const steps = stepsFor(0.05);
    expect(steps).toHaveLength(3);
    expect(steps.every((s) => s <= STEP + 1e-12)).toBe(true);
    expect(steps.reduce((a, b) => a + b)).toBeCloseTo(0.05);
  });

  it('khung hình dài bị cắt ở 6 bước (FR-07 c)', () => {
    const steps = stepsFor(3);
    expect(steps).toHaveLength(6);
    expect(steps.reduce((a, b) => a + b)).toBeCloseTo(6 * STEP);
  });

  it('không có bước khi thời gian ≤ 0 hoặc NaN', () => {
    expect(stepsFor(0)).toEqual([]);
    expect(stepsFor(-1)).toEqual([]);
    expect(stepsFor(NaN)).toEqual([]);
  });
});
