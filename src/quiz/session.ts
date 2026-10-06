import type { QuizQuestion } from '../content/types';

export interface ShuffledQuestion {
  question: QuizQuestion;
  options: string[];
  /** Chỉ số đáp án đúng trong `options` đã xáo. */
  answer: number;
}

/** Xáo 4 phương án (Fisher–Yates) và dời chỉ số đáp án theo (FR-16 bước 2). Hàm thuần. */
export function shuffleOptions(question: QuizQuestion, rng: () => number): ShuffledQuestion {
  const order = [0, 1, 2, 3];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { question, options: order.map((i) => question.options[i]), answer: order.indexOf(question.answer) };
}

/** Một lượt: câu theo thứ tự cố định, phương án xáo mỗi lượt. */
export const startSession = (questions: QuizQuestion[], rng: () => number) => questions.map((q) => shuffleOptions(q, rng));
