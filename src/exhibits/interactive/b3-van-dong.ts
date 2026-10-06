import { C, button, text, type Factory } from './base';

export const FORMS = ['Cơ học', 'Vật lý', 'Hóa học', 'Sinh học', 'Xã hội'];

/** Bậc kế tiếp sau khi chạm `i` khi đang chờ bậc `next`: đúng thứ tự thì +1, sai thì về 0. Hàm thuần. */
export const stepPress = (next: number, i: number) => (i === next ? next + 1 : 0);

/** Năm bậc thang vận động: chạm đủ 5 bậc từ thấp (cơ học) lên cao (xã hội). */
const create: Factory = (s) => {
  let next = 0;
  let shake = 0;
  FORMS.forEach((f, i) =>
    s.controls.append(
      button(f, () => {
        const n = stepPress(next, i);
        if (n === 0) {
          shake = 0.4;
          s.sfx('jam', 0.5);
          s.say('Chưa đúng thứ tự — bắt đầu lại từ bậc thấp nhất (cơ học).');
        } else {
          s.sfx('click');
          s.say(n === FORMS.length ? 'Hình thức cao bao hàm hình thức thấp, nhưng không quy về được.' : `${f} ✓ — tiếp theo: ${FORMS[n]}`);
        }
        next = n;
      }, 'btn stage-chip'),
    ),
  );
  s.say('Chạm từ bậc thấp nhất lên cao nhất.');
  return {
    update(dt) {
      shake = Math.max(0, shake - dt);
    },
    draw() {
      const { ctx } = s;
      const ox = 40 + Math.sin(shake * 60) * shake * 10;
      FORMS.forEach((f, i) => {
        const x = ox + i * 74, y = 200 - (i + 1) * 34;
        ctx.fillStyle = i < next ? C.accent : '#3a352c';
        ctx.fillRect(x, y, 74, 200 - y + 10);
        ctx.strokeStyle = C.bg;
        ctx.strokeRect(x, y, 74, 200 - y + 10);
        text(ctx, f, x + 37, y + 16, { size: 12, color: i < next ? C.bg : C.ink });
      });
      text(ctx, 'thấp → cao', 420, 228, { size: 11, color: C.muted, align: 'right' });
    },
    done: () => next === FORMS.length,
  };
};
export default create;
