import { button, C, text, type Factory } from './base';

/** Trung bình cộng các lần thả (cái tất nhiên lộ ra qua nhiều cái ngẫu nhiên). Hàm thuần. */
export const runningMeans = (rolls: number[]) => rolls.map((_, i) => rolls.slice(0, i + 1).reduce((a, b) => a + b, 0) / (i + 1));

/** Tất nhiên – Ngẫu nhiên: thả xúc xắc ≥ 5 lần; điểm trung bình dần tiến về 3,5. */
const create: Factory = (s) => {
  const rolls: number[] = [];
  let spin = 0;
  const roll = (n: number) => {
    for (let k = 0; k < n; k++) rolls.push(1 + Math.floor(Math.random() * 6));
    spin = 0.5;
    s.sfx('dice');
    const mean = runningMeans(rolls).at(-1)!;
    s.say(`Lần ${rolls.length}: ra ${rolls.at(-1)} — trung bình ${mean.toFixed(2).replace('.', ',')}${rolls.length >= 5 ? ' · càng nhiều lần càng gần 3,5' : ''}`);
  };
  s.controls.append(button('Thả xúc xắc', () => roll(1)), button('Thả 20 lần', () => roll(20), 'btn'));
  s.say('Mỗi lần thả là ngẫu nhiên…');
  return {
    update(dt) {
      spin = Math.max(0, spin - dt);
    },
    draw() {
      const { ctx, w } = s;
      // Xúc xắc
      const v = spin > 0 ? 1 + Math.floor(Math.random() * 6) : rolls.at(-1) ?? 1;
      ctx.save();
      ctx.translate(60, 70);
      ctx.rotate(spin * 6);
      ctx.fillStyle = '#f3eee4';
      ctx.fillRect(-28, -28, 56, 56);
      ctx.fillStyle = C.bg;
      const dots: Record<number, [number, number][]> = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
      for (const [dx, dy] of dots[v]) {
        ctx.beginPath();
        ctx.arc(dx * 14, dy * 14, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      // Đồ thị: chấm = từng lần (ngẫu nhiên), đường = trung bình (tất nhiên)
      const x0 = 120, x1 = w - 20, y = (val: number) => 210 - (val - 1) * 34;
      ctx.strokeStyle = 'rgba(243,238,228,.15)';
      ctx.beginPath();
      ctx.moveTo(x0, y(3.5));
      ctx.lineTo(x1, y(3.5));
      ctx.stroke();
      text(ctx, '3,5', x0 - 14, y(3.5), { size: 11, color: C.muted });
      const n = Math.max(rolls.length, 10), step = (x1 - x0) / (n - 1 || 1);
      rolls.forEach((r, i) => {
        ctx.fillStyle = 'rgba(243,238,228,.45)';
        ctx.fillRect(x0 + i * step - 2, y(r) - 2, 4, 4);
      });
      const means = runningMeans(rolls);
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      means.forEach((m, i) => (i ? ctx.lineTo(x0 + i * step, y(m)) : ctx.moveTo(x0, y(m))));
      ctx.stroke();
    },
    done: () => rolls.length >= 5,
  };
};
export default create;
