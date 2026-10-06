import { button, C, text, type Factory } from './base';
import { stepPress } from './b3-van-dong';

// Bốn mốc theo hiện vật c8-tinh-the (giáo trình tr.405–417).
export const MILESTONES = [
  { date: '9/3/1945', what: 'Nhật đảo chính Pháp' },
  { date: '12/3/1945', what: 'Chỉ thị "Nhật – Pháp bắn nhau và hành động của chúng ta"' },
  { date: 'Nạn đói 1945', what: 'Nạn đói làm hơn 2 triệu người chết' },
  { date: '19/8 – 2/9/1945', what: 'Tổng khởi nghĩa, Cách mạng Tháng Tám thành công' },
];

/** Tình thế và thời cơ: mở 4 mốc 1945 theo thứ tự. Chọn sai thứ tự thì làm lại từ đầu. */
const create: Factory = (s) => {
  let next = 0;
  // Nút xếp xáo trộn để người chơi phải nhớ thứ tự.
  for (const i of [2, 0, 3, 1]) {
    s.controls.append(
      button(MILESTONES[i].date, () => {
        const n = stepPress(next, i);
        if (n === 0) {
          s.sfx('jam', 0.5);
          s.say('Chưa đúng thứ tự — bắt đầu lại từ mốc đầu tiên.');
        } else {
          s.sfx('click');
          s.say(`${MILESTONES[i].date}: ${MILESTONES[i].what}.`);
        }
        next = n;
      }, 'btn stage-chip'),
    );
  }
  s.say('Chọn bốn mốc theo đúng thứ tự diễn ra.');
  return {
    update() {},
    draw() {
      const { ctx } = s;
      ctx.strokeStyle = '#4a443a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(30, 120);
      ctx.lineTo(410, 120);
      ctx.stroke();
      MILESTONES.forEach((m, i) => {
        const x = 70 + i * 100, on = i < next;
        ctx.fillStyle = on ? C.a : '#6b6255';
        ctx.beginPath();
        ctx.arc(x, 120, on ? 11 : 8, 0, Math.PI * 2);
        ctx.fill();
        text(ctx, on ? m.date : '?', x, 92, { size: 12, color: on ? C.ink : C.muted });
      });
      // Chỉ ghi chú mốc vừa mở, dưới trục, để chữ không chồng nhau.
      if (next > 0 && next < MILESTONES.length) text(ctx, MILESTONES[next - 1].what, 220, 160, { size: 12, weight: 400, color: C.muted });
      if (next === MILESTONES.length) text(ctx, '“Giờ quyết định cho vận mệnh dân tộc ta đã đến…”', 220, 210, { size: 13, color: C.accent });
    },
    done: () => next === MILESTONES.length,
    hold: 2000,
  };
};
export default create;
