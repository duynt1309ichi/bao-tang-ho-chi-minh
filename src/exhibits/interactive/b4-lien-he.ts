import { rng } from '../../world/random';
import { button, C, type Factory } from './base';

const KEYS = [0, 4, 9]; // nút có thể chạm (có nút HTML tương ứng)

/** Màng lưới liên hệ: chạm một nút, sóng rung lan qua cả lưới. */
const create: Factory = (s) => {
  const r = rng(11);
  const nodes = Array.from({ length: 14 }, () => ({ x: 40 + r() * 360, y: 30 + r() * 190, amp: 0 }));
  const edges: [number, number][] = [];
  nodes.forEach((a, i) =>
    nodes.forEach((b, j) => {
      if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 120) edges.push([i, j]);
    }),
  );
  let touched = false, wave = -1, origin = 0, t = 0;
  KEYS.forEach((i, k) =>
    s.controls.append(
      button(`Chạm nút ${k + 1}`, () => {
        touched = true;
        origin = i;
        wave = 0;
        s.sfx('pop');
        s.say('Một nút rung, cả mạng lưới rung theo: mối liên hệ phổ biến.');
      }, 'btn stage-chip'),
    ),
  );
  s.say('Chạm một nút bất kỳ.');
  return {
    update(dt) {
      t += dt;
      if (wave >= 0) wave += dt * 260;
      for (const n of nodes) {
        const d = Math.hypot(n.x - nodes[origin].x, n.y - nodes[origin].y);
        if (wave >= d && wave < d + 30) n.amp = 1;
        n.amp = Math.max(0, n.amp - dt * 1.2);
      }
    },
    draw() {
      const { ctx } = s;
      const pos = (n: (typeof nodes)[number]) => [n.x + Math.sin(t * 30) * n.amp * 4, n.y + Math.cos(t * 27) * n.amp * 4];
      ctx.lineWidth = 1.5;
      for (const [i, j] of edges) {
        const [ax, ay] = pos(nodes[i]), [bx, by] = pos(nodes[j]);
        ctx.strokeStyle = `rgba(217,178,106,${0.25 + Math.max(nodes[i].amp, nodes[j].amp) * 0.6})`;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
      nodes.forEach((n, i) => {
        const [x, y] = pos(n);
        ctx.fillStyle = n.amp > 0.05 ? C.accent : '#6b6255';
        ctx.beginPath();
        ctx.arc(x, y, KEYS.includes(i) ? 9 : 6, 0, Math.PI * 2);
        ctx.fill();
      });
    },
    done: () => touched,
    hold: 2200, // để sóng rung lan hết lưới
  };
};
export default create;
