import { exhibits } from './exhibits';
import { quiz } from './quiz';
import { rooms } from './rooms';
import type { Exhibit, PageRange, QuizQuestion, Room, RoomId } from './types';

export { exhibits, quiz, rooms };

const roomById = new Map(rooms.map((r) => [r.id, r]));
const exhibitById = new Map(exhibits.map((e) => [e.id, e]));

export const room = (id: RoomId): Room => roomById.get(id)!;
export const exhibit = (id: string): Exhibit | undefined => exhibitById.get(id);
export const exhibitsIn = (id: RoomId): Exhibit[] => exhibits.filter((e) => e.room === id);
export const quizFor = (id: RoomId): QuizQuestion[] => quiz.filter((q) => q.room === id);

/** "Phòng 04" */
export const roomNo = (id: RoomId) => `Phòng ${id.slice(1)}`;

/** `[[128,134]]` → "128–134"; `[[17,17],[22,22]]` → "17, 22" (LLD mục 3). Hàm thuần. */
export function formatPages(ranges: PageRange[]): string {
  return ranges.map(([a, b]) => (a === b ? `${a}` : `${a}–${b}`)).join(', ');
}

export interface RoomMarks {
  done: boolean; // ✓ khám phá đủ
  mastered: boolean; // ★ đã nắm vững
  hinted: boolean; // ◎ có hiện vật đang được gợi ý xem lại
}

/** Dấu ✓ ★ ◎ của một phòng (BR-S08, FR-17). Hàm thuần. */
export function roomMarks(room: RoomId, explored: ReadonlySet<string>, mastered: boolean, hints: ReadonlySet<string>): RoomMarks {
  const ids = exhibitsIn(room).map((e) => e.id);
  return { done: ids.every((id) => explored.has(id)), mastered, hinted: ids.some((id) => hints.has(id)) };
}
