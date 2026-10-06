import { describe, expect, it } from 'vitest';
import { exhibitsIn, roomMarks } from './index';

describe('roomMarks (BR-S08, FR-17)', () => {
  const p01 = exhibitsIn('P01').map((e) => e.id);

  it('✓ khi khám phá đủ hiện vật của phòng; ★ theo trắc nghiệm', () => {
    expect(roomMarks('P01', new Set(p01.slice(1)), false, new Set())).toEqual({ done: false, mastered: false, hinted: false });
    expect(roomMarks('P01', new Set(p01), true, new Set())).toEqual({ done: true, mastered: true, hinted: false });
  });

  it('◎ khi có hiện vật của phòng đang được gợi ý xem lại', () => {
    expect(roomMarks('P01', new Set(), false, new Set([p01[0]])).hinted).toBe(true);
    expect(roomMarks('P02', new Set(), false, new Set([p01[0]])).hinted).toBe(false);
  });
});
