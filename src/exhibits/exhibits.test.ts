import { describe, expect, it } from 'vitest';
import { quiz } from '../content/quiz';
import { shuffleOptions } from '../quiz/session';
import { pickTarget } from './proximity';

describe('pickTarget (BR-S09)', () => {
  // Nhân vật ở gốc, nhìn theo +z (yaw = 0).
  const a = { id: 'a', x: 0, z: 1.5 };

  it('cách 1,5 m, mặt hướng về hiện vật → là mục tiêu; quay lưng → không', () => {
    expect(pickTarget(0, 0, 0, [a])).toBe(a);
    expect(pickTarget(0, 0, Math.PI, [a])).toBeNull();
  });

  it('cách 2,5 m → không', () => {
    expect(pickTarget(0, 0, 0, [{ id: 'far', x: 0, z: 2.5 }])).toBeNull();
  });

  it('lệch quá 60° → không; trong 60° → có', () => {
    expect(pickTarget(0, 0, 0, [{ id: 'side', x: 1.5, z: 0.5 }])).toBeNull(); // ~71°
    expect(pickTarget(0, 0, 0, [{ id: 'ok', x: 1, z: 1.2 }])?.id).toBe('ok'); // ~40°
  });

  it('nhiều cái thỏa → cái gần nhất', () => {
    expect(pickTarget(0, 0, 0, [a, { id: 'near', x: 0.3, z: 0.9 }])?.id).toBe('near');
  });
});

describe('shuffleOptions (FR-16)', () => {
  it('đáp án đúng vẫn trỏ tới đúng phương án sau khi xáo', () => {
    let seed = 7;
    const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (const q of quiz) {
      const s = shuffleOptions(q, rng);
      expect([...s.options].sort()).toEqual([...q.options].sort());
      expect(s.options[s.answer]).toBe(q.options[q.answer]);
    }
  });
});
