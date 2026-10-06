import { C, button, text, type Factory } from './base';

// Tóm tắt một dòng — theo nội dung hiện vật a2-ke-sach (exhibits.ts, giáo trình tr.66–74).
export const BOOKS: [string, string][] = [
  ['Bản thảo kinh tế – triết học 1844', 'Bàn về lao động bị tha hóa dưới chủ nghĩa tư bản.'],
  ['Gia đình thần thánh (1845)', 'Tác phẩm đầu tiên C. Mác và Ph. Ăngghen viết chung.'],
  ['Luận cương về Phoiơbắc (1845)', 'Đề cao vai trò của thực tiễn trong nhận thức.'],
  ['Hệ tư tưởng Đức (1845 – 1846)', 'Lần đầu trình bày quan niệm duy vật về lịch sử.'],
  ['Sự khốn cùng của triết học (1847)', 'Phê phán Pruđông, đặt nền cho kinh tế chính trị học.'],
  ['Tuyên ngôn của Đảng Cộng sản (1848)', 'Cương lĩnh đầu tiên của phong trào cộng sản.'],
  ['Tư bản, tập I (1867)', 'Vận dụng phép biện chứng duy vật vào kinh tế học.'],
  ['Chống Đuyrinh', 'Trình bày có hệ thống ba bộ phận của chủ nghĩa Mác.'],
  ['Nguồn gốc của gia đình… (1884)', 'Lý giải nguồn gốc của chế độ tư hữu và nhà nước.'],
  ['Lútvích Phoiơbắc… (1886)', 'Tổng kết quan hệ với triết học cổ điển Đức.'],
];

/** Kệ sách kinh điển: mở ít nhất 3 cuốn. */
const create: Factory = (s) => {
  const opened = new Set<number>();
  const colors = [C.a, C.b, C.c, '#4a6b52', '#6b4a6b', '#7a5a2b', '#2b5a7a', '#5a2b2b', '#2b4a3a', '#4a4a6b'];
  let lift = BOOKS.map(() => 0);
  BOOKS.forEach(([title, line], i) => {
    s.controls.append(
      button(String(i + 1), () => {
        opened.add(i);
        lift = lift.map((v, k) => (k === i ? 1 : v));
        s.sfx('click');
        s.say(`${title}: ${line} (${opened.size}/3)`);
      }, 'btn stage-chip'),
    );
  });
  s.say(`Chọn một cuốn sách (nút 1–${BOOKS.length}).`);
  let anim = BOOKS.map(() => 0);
  return {
    update(dt) {
      anim = anim.map((v, k) => v + (lift[k] - v) * Math.min(1, dt * 8));
    },
    draw() {
      const { ctx, w } = s;
      ctx.fillStyle = '#4a3423';
      ctx.fillRect(20, 200, w - 40, 12);
      const bw = (w - 60) / BOOKS.length;
      BOOKS.forEach(([title], i) => {
        const x = 30 + i * bw, hgt = 120 + (i % 3) * 14, y = 200 - hgt - anim[i] * 18;
        ctx.fillStyle = colors[i];
        ctx.fillRect(x, y, bw - 8, hgt);
        ctx.strokeStyle = opened.has(i) ? C.accent : 'rgba(0,0,0,.4)';
        ctx.lineWidth = opened.has(i) ? 3 : 1;
        ctx.strokeRect(x, y, bw - 8, hgt);
        ctx.save();
        ctx.translate(x + (bw - 8) / 2, y + hgt / 2);
        ctx.rotate(-Math.PI / 2);
        text(ctx, title.length > 20 ? `${title.slice(0, 19)}…` : title, 0, 0, { size: 9, weight: 600 });
        ctx.restore();
        text(ctx, String(i + 1), x + (bw - 8) / 2, 228, { size: 12, color: C.muted });
      });
    },
    done: () => opened.size >= 3,
  };
};
export default create;
