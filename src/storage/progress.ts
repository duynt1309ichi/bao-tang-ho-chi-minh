import type { RoomId } from '../content/types';
import { kv } from './kv';

export const PROGRESS_KEY = 'bttr.progress.v1';

export interface QuizResult {
  best: number;
  total: number;
  mastered: boolean;
}

/** LLD mục 1.4 */
export interface Progress {
  version: 1;
  explored: string[];
  quiz: Partial<Record<RoomId, QuizResult>>;
  character?: 'nam' | 'nu';
  tutorialSeen: boolean;
  completedShown: boolean;
}

export const emptyProgress = (): Progress => ({ version: 1, explored: [], quiz: {}, tutorialSeen: false, completedShown: false });

/** Dữ liệu hiện hành để lọc mã lạ: tập mã hiện vật và số câu của từng phòng. */
export interface ContentIndex {
  exhibitIds: ReadonlySet<string>;
  quizTotals: Partial<Record<RoomId, number>>;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isCount = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0;

/**
 * Đọc và validate tiến độ theo FR-19. Hàm thuần.
 * - `empty`: chưa có khóa (người chơi mới).
 * - `reset`: JSON hỏng / sai kiểu / sai version → dùng mặc định, nơi gọi hiện MSG-10.
 * - `ok`: hợp lệ; mã hiện vật, phòng lạ và kết quả phòng có `total` lệch bị bỏ (1c).
 */
export function parseProgress(raw: string | null, content: ContentIndex): { value: Progress; status: 'ok' | 'empty' | 'reset' } {
  if (raw === null) return { value: emptyProgress(), status: 'empty' };
  const reset = { value: emptyProgress(), status: 'reset' as const };
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return reset;
  }
  if (!isObj(data) || data.version !== 1) return reset;
  const { explored, quiz, tutorialSeen, completedShown, character } = data;
  if (!Array.isArray(explored) || !explored.every((x) => typeof x === 'string')) return reset;
  if (!isObj(quiz) || typeof tutorialSeen !== 'boolean' || typeof completedShown !== 'boolean') return reset;

  const cleanQuiz: Progress['quiz'] = {};
  for (const [room, r] of Object.entries(quiz)) {
    if (!isObj(r) || !isCount(r.best) || !isCount(r.total) || typeof r.mastered !== 'boolean' || r.best > r.total) return reset;
    const total = content.quizTotals[room as RoomId];
    if (total !== undefined && r.total === total) cleanQuiz[room as RoomId] = { best: r.best, total: r.total, mastered: r.mastered };
  }

  return {
    status: 'ok',
    value: {
      version: 1,
      explored: [...new Set(explored)].filter((id) => content.exhibitIds.has(id)),
      quiz: cleanQuiz,
      ...(character === 'nam' || character === 'nu' ? { character } : {}),
      tutorialSeen,
      completedShown,
    },
  };
}

/** Lưu lượt mới: giữ lượt tốt nhất, đã ★ thì giữ ★ (FR-16 5a). Hàm thuần. */
export function mergeQuiz(prev: QuizResult | undefined, correct: number, total: number): QuizResult {
  return {
    best: Math.max(prev?.total === total ? prev.best : 0, correct),
    total,
    mastered: Boolean(prev?.mastered) || correct === total,
  };
}

/** Tiến độ trong bộ nhớ, ghi ngay vào `localStorage` mỗi lần đổi (FR-15, FR-19). */
export class ProgressStore {
  onChange = () => {};

  constructor(
    public value: Progress,
    private content: ContentIndex,
  ) {}

  static load(content: ContentIndex) {
    const { value, status } = parseProgress(kv.get(PROGRESS_KEY), content);
    return { store: new ProgressStore(value, content), status };
  }

  get exploredCount() {
    return this.value.explored.length;
  }

  isExplored(id: string) {
    return this.value.explored.includes(id);
  }

  /** Trả về true nếu là lần khám phá đầu (BR-S01). Gọi lặp không đổi kết quả. */
  markExplored(id: string): boolean {
    if (!this.content.exhibitIds.has(id) || this.isExplored(id)) return false;
    this.value.explored.push(id);
    this.save();
    return true;
  }

  saveQuiz(room: RoomId, correct: number, total: number) {
    this.value.quiz[room] = mergeQuiz(this.value.quiz[room], correct, total);
    this.save();
  }

  setCompletedShown() {
    this.value.completedShown = true;
    this.save();
  }

  private save() {
    kv.set(PROGRESS_KEY, JSON.stringify(this.value));
    this.onChange();
  }
}
