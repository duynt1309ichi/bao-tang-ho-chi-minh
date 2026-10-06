import { button, C, text, type Factory } from './base';

const N = 12;

/** Nguyên nhân – Kết quả: đẩy quân domino đầu, chuỗi đổ tới quân cuối. */
const create: Factory = (s) => {
  const angle = Array<number>(N).fill(0); // 0 đứng → 1 đổ hẳn
  let pushed = false;
  const push = button('Đẩy quân đầu tiên', () => {
    pushed = true;
    push.disabled = true;
    s.say('Kết quả của bước này là nguyên nhân của bước sau…');
  });
  s.controls.append(push);
  s.say('Đẩy quân domino đầu tiên.');
  return {
    update(dt) {
      if (!pushed) return;
      for (let i = 0; i < N; i++) {
        const ready = i === 0 || angle[i - 1] > 0.55;
        if (!ready || angle[i] >= 1) continue;
        if (angle[i] === 0) s.sfx('domino', 0.6);
        angle[i] = Math.min(1, angle[i] + dt * 4);
        if (i === N - 1 && angle[i] >= 1) s.say('Quân cuối đã đổ.');
      }
    },
    draw() {
      const { ctx } = s;
      ctx.fillStyle = '#3a352c';
      ctx.fillRect(20, 196, 400, 6);
      for (let i = 0; i < N; i++) {
        ctx.save();
        ctx.translate(50 + i * 31, 196);
        ctx.rotate(angle[i] * 1.2);
        ctx.fillStyle = i === 0 ? C.a : i === N - 1 ? C.b : '#e9e3d6';
        ctx.fillRect(-10, -60, 10, 60);
        ctx.restore();
      }
      text(ctx, 'Nguyên nhân', 60, 226, { size: 12, color: C.muted });
      text(ctx, 'Kết quả', 390, 226, { size: 12, color: C.muted });
    },
    done: () => angle[N - 1] >= 1,
    hold: 1200,
  };
};
export default create;
