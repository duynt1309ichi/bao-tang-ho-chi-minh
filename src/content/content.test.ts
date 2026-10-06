import { describe, expect, it } from 'vitest';
import { layout } from '../world/layout';
import { exhibits, formatPages, quiz, rooms } from './index';
import { validateContent } from './validate';

// FR-26: `npm run build` chạy bộ test này, nên dữ liệu sai thì build dừng và in lỗi.
describe('validateContent (FR-26)', () => {
  it('dữ liệu hiện hành hợp lệ', () => {
    expect(validateContent({ rooms, exhibits, quiz, layout })).toEqual([]);
  });

  it('xóa trang của một hiện vật thì báo đúng mã đó', () => {
    const broken = exhibits.map((e) => (e.id === 'b3-dinh-nghia' ? { ...e, pages: [] } : e));
    const errors = validateContent({ rooms, exhibits: broken, quiz, layout });
    expect(errors).toEqual(['b3-dinh-nghia: thiếu trang']);
  });

  it('câu hỏi gắn hiện vật phòng khác thì báo lỗi', () => {
    const broken = quiz.map((q) => (q.id === 'P04-q2' ? { ...q, exhibitIds: ['a1-dinh-nghia'] } : q));
    expect(validateContent({ rooms, exhibits, quiz: broken, layout })).toEqual(['P04-q2: hiện vật "a1-dinh-nghia" không thuộc P04']);
  });
});

describe('formatPages', () => {
  it('khoảng dùng gạch ngang dài, nhiều khoảng nối bằng dấu phẩy', () => {
    expect(formatPages([[128, 134]])).toBe('128–134');
    expect(formatPages([[17, 17], [22, 22]])).toBe('17, 22');
    expect(formatPages([[59, 59], [64, 66]])).toBe('59, 64–66');
  });
});
