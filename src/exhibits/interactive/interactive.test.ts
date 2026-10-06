import { describe, expect, it } from 'vitest';
import { exhibits } from '../../content/exhibits';
import { stepPress } from './b3-van-dong';
import { runningMeans } from './b4-tat-nhien';
import { transition } from './base';
import { seenBoth } from './c6-banh-rang';
import { INTERACTIVES } from './index';

describe('hiện vật 🎛', () => {
  it('đủ 13 hiện vật, khớp mã trong exhibits.ts', () => {
    const ids = exhibits.filter((e) => e.kind === 'interactive').map((e) => e.id).sort();
    expect(Object.keys(INTERACTIVES).sort()).toEqual(ids);
    expect(ids).toHaveLength(13);
  });

  it('bảng trạng thái FR-14', () => {
    expect(transition('ready', 'start')).toBe('doing');
    expect(transition('doing', 'complete')).toBe('done');
    expect(transition('ready', 'skip')).toBe('done');
    expect(transition('doing', 'skip')).toBe('done');
    expect(transition('done', 'redo')).toBe('ready');
    expect(transition('ready', 'complete')).toBe('ready'); // chưa bắt đầu thì không thể hoàn thành
    expect(transition('done', 'start')).toBe('done');
  });

  it('chạm theo thứ tự: đúng thì tiến, sai thì về đầu', () => {
    let n = 0;
    for (const i of [0, 1, 2]) n = stepPress(n, i);
    expect(n).toBe(3);
    expect(stepPress(3, 1)).toBe(0);
    expect([0, 1, 2, 3, 4].reduce(stepPress, 0)).toBe(5);
  });

  it('trung bình cộng dồn của xúc xắc', () => {
    expect(runningMeans([6, 2, 1, 3])).toEqual([6, 4, 3, 3]);
  });

  it('bánh răng: cần thấy cả máy chạy và máy kẹt', () => {
    expect(seenBoth({ run: true, jam: false })).toBe(false);
    expect(seenBoth({ run: true, jam: true })).toBe(true);
  });
});
