import { describe, expect, it } from 'vitest';
import { atlasRect, wrapText } from './signs';

const measure = (s: string) => s.length; // 1 ký tự = 1 đơn vị

describe('wrapText', () => {
  it('ngắt theo từ, không vượt chiều rộng', () => {
    expect(wrapText(measure, 'Vật chất và ý thức', 10)).toEqual(['Vật chất', 'và ý thức']);
  });

  it('quá số dòng thì cắt và thêm …', () => {
    const lines = wrapText(measure, 'một hai ba bốn năm sáu bảy tám', 8, 2);
    expect(lines).toHaveLength(2);
    expect(lines[1].endsWith('…')).toBe(true);
    expect(lines.every((l) => l.length <= 8)).toBe(true);
  });

  it('từ dài hơn dòng vẫn giữ nguyên một dòng', () => {
    expect(wrapText(measure, 'Weltanschauung', 5)).toEqual(['Weltanschauung']);
  });
});

describe('atlasRect', () => {
  it('ô 0 ở góc trên trái, ô 9 ở hàng 2 cột 2', () => {
    expect(atlasRect(0)).toEqual([0, 7 / 8, 1 / 8, 1]);
    expect(atlasRect(9)).toEqual([1 / 8, 6 / 8, 2 / 8, 7 / 8]);
  });
});
