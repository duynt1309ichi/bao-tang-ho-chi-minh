import { describe, expect, it } from 'vitest';
import { emptyProgress, mergeQuiz, parseProgress } from './progress';

const content = { exhibitIds: new Set(['a1-dinh-nghia', 'b3-dinh-nghia']), quizTotals: { P01: 4, P05: 4 } };
const valid = { ...emptyProgress(), explored: ['b3-dinh-nghia'] };

describe('parseProgress (FR-19)', () => {
  it('chưa có khóa → người chơi mới', () => {
    expect(parseProgress(null, content)).toEqual({ value: emptyProgress(), status: 'empty' });
  });

  it('JSON hỏng, sai version, sai kiểu → reset', () => {
    for (const raw of ['abc', '{"version":2}', JSON.stringify({ ...valid, explored: 'x' }), JSON.stringify({ ...valid, tutorialSeen: 1 })]) {
      expect(parseProgress(raw, content).status).toBe('reset');
    }
  });

  it('bỏ mã hiện vật lạ và trùng, giữ phần còn lại', () => {
    const raw = JSON.stringify({ ...valid, explored: ['b3-dinh-nghia', 'zz-la', 'b3-dinh-nghia', 'a1-dinh-nghia'] });
    expect(parseProgress(raw, content)).toMatchObject({ status: 'ok', value: { explored: ['b3-dinh-nghia', 'a1-dinh-nghia'] } });
  });

  it('bỏ kết quả phòng lạ hoặc có số câu khác hiện tại', () => {
    const quiz = { P01: { best: 4, total: 4, mastered: true }, P05: { best: 2, total: 3, mastered: false }, P99: { best: 1, total: 1, mastered: true } };
    expect(parseProgress(JSON.stringify({ ...valid, quiz }), content).value.quiz).toEqual({ P01: quiz.P01 });
  });

  it('best > total là sai kiểu → reset', () => {
    const quiz = { P01: { best: 5, total: 4, mastered: true } };
    expect(parseProgress(JSON.stringify({ ...valid, quiz }), content).status).toBe('reset');
  });
});

describe('mergeQuiz (FR-16)', () => {
  it('lượt đầu', () => {
    expect(mergeQuiz(undefined, 4, 4)).toEqual({ best: 4, total: 4, mastered: true });
    expect(mergeQuiz(undefined, 2, 4)).toEqual({ best: 2, total: 4, mastered: false });
  });
  it('đã ★ thì làm lại sai vẫn giữ ★ và lượt tốt nhất', () => {
    expect(mergeQuiz({ best: 4, total: 4, mastered: true }, 2, 4)).toEqual({ best: 4, total: 4, mastered: true });
  });
  it('lượt sau tốt hơn thì cập nhật', () => {
    expect(mergeQuiz({ best: 1, total: 4, mastered: false }, 3, 4)).toEqual({ best: 3, total: 4, mastered: false });
  });
});
