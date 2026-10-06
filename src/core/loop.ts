export const STEP = 1 / 60;
const MAX_STEPS = 6;

/**
 * Chia thời gian trôi qua thành các bước mô phỏng bằng nhau, mỗi bước ≤ 1/60 s,
 * tối đa 6 bước; phần dư bỏ đi (khung hình dài, ví dụ tab vừa hiện lại — FR-07 c). Hàm thuần.
 */
export function stepsFor(elapsed: number): number[] {
  if (!(elapsed > 0)) return [];
  const capped = Math.min(elapsed, STEP * MAX_STEPS);
  const n = Math.ceil(capped / STEP - 1e-9);
  return Array(n).fill(capped / n);
}
