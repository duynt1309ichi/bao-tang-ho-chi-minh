import { button, C, ease, text, type Factory } from './base';

export const LEGS = [
  { name: 'Trực quan sinh động', note: 'Cảm giác, tri giác, biểu tượng' },
  { name: 'Tư duy trừu tượng', note: 'Khái niệm, phán đoán, suy lý' },
  { name: 'Thực tiễn', note: 'Kiểm nghiệm chân lý' },
];

/** Con đường biện chứng của nhận thức: đi qua ba chặng. */
const create: Factory = (s) => {
  let reached = 0, walk = 0;
  const go = button(`Đi tới: ${LEGS[0].name}`, () => {
    if (reached >= LEGS.length) return;
    reached++;
    s.sfx('pop');
    s.say(`${LEGS[reached - 1].name}: ${LEGS[reached - 1].note}.`);
    go.textContent = reached < LEGS.length ? `Đi tới: ${LEGS[reached].name}` : 'Đã qua ba chặng';
    go.disabled = reached >= LEGS.length;
  });
  s.controls.append(go);
  s.say('Bắt đầu hành trình nhận thức.');
  const pts = [[50, 190], [170, 120], [290, 160], [400, 60]] as const;
  return {
    update(dt) {
      walk += (reached - walk) * Math.min(1, dt * 3);
    },
    draw() {
      const { ctx } = s;
      ctx.strokeStyle = '#4a443a';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      // Phần đã đi
      const seg = Math.min(Math.floor(walk), 2), f = ease(walk - seg);
      ctx.strokeStyle = C.accent;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i <= seg; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      const [ax, ay] = pts[seg], [bx, by] = pts[Math.min(seg + 1, 3)];
      const px = ax + (bx - ax) * (walk >= 3 ? 1 : f), py = ay + (by - ay) * (walk >= 3 ? 1 : f);
      ctx.lineTo(px, py);
      ctx.stroke();
      LEGS.forEach((l, i) => {
        const [x, y] = pts[i + 1];
        ctx.fillStyle = i < reached ? C.accent : '#6b6255';
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();
        text(ctx, l.name, x, y + (i === 2 ? 26 : -22), { size: 12, color: i < reached ? C.ink : C.muted });
      });
      ctx.fillStyle = C.ink;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
    },
    done: () => reached >= LEGS.length,
  };
};
export default create;
