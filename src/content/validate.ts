import type { Exhibit, Layout, QuizQuestion, Room } from './types';

const ID_RE = /^[a-c]\d{1,2}-[a-z0-9-]+$/;
const KINDS = new Set(['portrait', 'text', 'model', 'interactive']);
export const EXPECTED = { exhibits: 63, interactive: 13 };

/**
 * Luật toàn vẹn dữ liệu FR-26 (trừ phần asset — chưa có asset ngoài). Trả về danh sách lỗi
 * dạng "<mã>: <lý do>", rỗng = đạt. Hàm thuần; chạy trong `npm test` và `npm run build`.
 */
export function validateContent(input: { rooms: Room[]; exhibits: Exhibit[]; quiz: QuizQuestion[]; layout: Layout }): string[] {
  const errors: string[] = [];
  const err = (id: string, msg: string) => errors.push(`${id}: ${msg}`);
  const roomById = new Map(input.rooms.map((r) => [r.id, r]));

  const roomIds = input.rooms.map((r) => r.id).join(',');
  if (roomIds !== 'P01,P02,P03,P04,P05,P06,P07,P08,P09,P10') err('rooms', `phải đúng P01…P10, đang có ${roomIds}`);
  for (const r of input.rooms) {
    if (!r.title.trim() || r.title.length > 80) err(r.id, 'tên phòng phải dài 1–80 ký tự');
    if (r.pages[0] > r.pages[1]) err(r.id, 'trang bắt đầu lớn hơn trang kết thúc');
  }

  const seen = new Set<string>();
  for (const e of input.exhibits) {
    if (seen.has(e.id)) err(e.id, 'trùng mã');
    seen.add(e.id);
    if (!ID_RE.test(e.id)) err(e.id, 'mã không đúng mẫu ^[a-c]\\d{1,2}-[a-z0-9-]+$');
    if (!KINDS.has(e.kind)) err(e.id, `loại lạ "${e.kind}"`);
    if (!e.title?.trim() || e.title.length > 80) err(e.id, 'title phải dài 1–80 ký tự');
    if (!e.body?.trim() || e.body.length > 1500) err(e.id, 'body phải dài 1–1500 ký tự');
    if (e.quote && (!e.quote.text.trim() || e.quote.text.length > 400 || !e.quote.author.trim())) err(e.id, 'quote phải có text ≤ 400 ký tự và author');
    if ((e.kind === 'interactive') !== Boolean(e.interactive)) err(e.id, 'chỉ hiện vật interactive mới (và phải) có interactive.hint');
    if (e.interactive && (!e.interactive.hint.trim() || e.interactive.hint.length > 120)) err(e.id, 'hint phải dài 1–120 ký tự');
    const room = roomById.get(e.room);
    if (!room) err(e.id, `phòng lạ "${e.room}"`);
    if (!e.pages?.length) err(e.id, 'thiếu trang');
    for (const [a, b] of e.pages ?? []) {
      if (a > b) err(e.id, `khoảng trang ${a}–${b} ngược`);
      if (room && (a < room.pages[0] || b > room.pages[1])) err(e.id, `trang ${a}–${b} nằm ngoài ${room.id} (${room.pages[0]}–${room.pages[1]})`);
    }
  }
  if (input.exhibits.length !== EXPECTED.exhibits) err('exhibits', `phải có ${EXPECTED.exhibits} hiện vật, đang có ${input.exhibits.length}`);
  const nInteractive = input.exhibits.filter((e) => e.kind === 'interactive').length;
  if (nInteractive !== EXPECTED.interactive) err('exhibits', `phải có ${EXPECTED.interactive} hiện vật interactive, đang có ${nInteractive}`);

  const exhibitRoom = new Map(input.exhibits.map((e) => [e.id, e.room]));
  const qSeen = new Set<string>();
  for (const q of input.quiz) {
    if (qSeen.has(q.id)) err(q.id, 'trùng mã câu hỏi');
    qSeen.add(q.id);
    if (!q.id.startsWith(`${q.room}-q`)) err(q.id, `mã phải bắt đầu bằng ${q.room}-q`);
    if (!q.prompt.trim() || q.prompt.length > 300) err(q.id, 'prompt phải dài 1–300 ký tự');
    if (q.options.length !== 4 || new Set(q.options).size !== 4) err(q.id, 'phải có đúng 4 phương án khác nhau');
    if (q.options.some((o) => !o.trim() || o.length > 160)) err(q.id, 'mỗi phương án phải dài 1–160 ký tự');
    if (![0, 1, 2, 3].includes(q.answer)) err(q.id, 'answer phải là 0–3');
    if (!q.explanation.trim() || q.explanation.length > 300) err(q.id, `giải thích phải dài 1–300 ký tự (đang ${q.explanation.length})`);
    if (!q.exhibitIds.length) err(q.id, 'exhibitIds rỗng');
    for (const id of q.exhibitIds) if (exhibitRoom.get(id) !== q.room) err(q.id, `hiện vật "${id}" không thuộc ${q.room}`);
  }
  for (const r of input.rooms) {
    const n = input.quiz.filter((q) => q.room === r.id).length;
    if (n < 3 || n > 5) err(r.id, `phải có 3–5 câu trắc nghiệm, đang có ${n}`);
  }

  // Bố cục (LLD 1.3): mỗi hiện vật đúng 1 vị trí, nằm trong phòng của nó; mỗi phòng 1 trạm.
  const placed = input.layout.exhibits.map((p) => p.id);
  for (const e of input.exhibits) {
    const n = placed.filter((id) => id === e.id).length;
    if (n !== 1) err(e.id, `phải có đúng 1 vị trí trong layout.json, đang có ${n}`);
    const p = input.layout.exhibits.find((x) => x.id === e.id);
    const area = input.layout.areas.find((a) => a.id === e.room);
    if (p && area) {
      const [x, z, w, d] = area.rect;
      if (p.pos[0] < x || p.pos[0] > x + w || p.pos[2] < z || p.pos[2] > z + d) err(e.id, `vị trí nằm ngoài ${e.room}`);
    }
  }
  for (const id of placed) if (!seen.has(id)) err(id, 'có trong layout.json nhưng không có trong exhibits');
  for (const r of input.rooms) {
    if (input.layout.quizStations.filter((s) => s.room === r.id).length !== 1) err(r.id, 'phải có đúng 1 trạm trắc nghiệm');
  }
  return errors;
}
