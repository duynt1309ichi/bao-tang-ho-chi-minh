import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseCredits } from './credits';

describe('credits', () => {
  it('đọc bảng, bỏ tiêu đề và dòng kẻ', () => {
    expect(parseCredits('# x\n| A | B | C | D |\n|---|---|---|---|\n| a | b | c | d |\n')).toEqual([{ asset: 'a', author: 'b', source: 'c', license: 'd' }]);
  });

  it('FR-27: mọi dòng trong CREDITS.md đủ tác giả và giấy phép; có đủ asset trong public/assets', () => {
    const list = parseCredits(readFileSync('CREDITS.md', 'utf8'));
    for (const c of list) expect(c.author && c.license && c.source).toBeTruthy();
    for (const name of ['herringbone_parquet', 'marble_01', 'white_plaster_02', 'leafy_grass', 'fabric_pattern_07', 'kloofendal']) {
      expect(list.some((c) => c.source.includes(name))).toBe(true);
    }
  });
});
