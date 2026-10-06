import { audio, type LoopName, type Sfx } from '../../audio';

// Khuôn chung hiện vật 🎛 (SRS FR-14, FSD SCR-08, LLD `exhibits/interactive/base.ts`).
// Mỗi hiện vật một file: vẽ lên "sân khấu" canvas trong bảng, điều khiển bằng nút/thanh trượt HTML
// (dùng được bằng bàn phím), báo `done()` khi đạt điều kiện hoàn thành.

export type State = 'ready' | 'doing' | 'done';
export type Event = 'start' | 'complete' | 'skip' | 'redo';

/** Bảng trạng thái FR-14. Sự kiện không hợp lệ giữ nguyên trạng thái. Hàm thuần. */
export function transition(s: State, e: Event): State {
  if (e === 'start' && s === 'ready') return 'doing';
  if (e === 'complete' && s === 'doing') return 'done';
  if (e === 'skip' && s !== 'done') return 'done';
  if (e === 'redo' && s === 'done') return 'ready';
  return s;
}

export interface Stage {
  ctx: CanvasRenderingContext2D;
  /** Kích thước vẽ (đơn vị CSS px; canvas đã nhân devicePixelRatio). */
  w: number;
  h: number;
  /** Nơi đặt nút / thanh trượt của hiện vật. */
  controls: HTMLElement;
  /** Dòng trạng thái ngắn dưới sân khấu (aria-live). */
  say(text: string): void;
  sfx(name: Sfx, volume?: number): void;
  loop(name: LoopName): () => void;
}

export interface Interactive {
  update(dt: number): void;
  draw(): void;
  /** Đã đạt điều kiện hoàn thành (FR-14). */
  done(): boolean;
  /** Giữ cảnh cuối bao lâu (ms) trước khi sang Hoàn thành — đủ để thấy hiệu ứng. Mặc định 900. */
  hold?: number;
  dispose?(): void;
}

export type Factory = (stage: Stage) => Interactive;

/** Gắn sân khấu canvas + vòng lặp vẽ; gọi `onComplete` một lần khi hiện vật báo xong. Trả về hàm hủy. */
export function mount(host: HTMLElement, factory: Factory, onComplete: () => void) {
  const W = 440, H = 248;
  const canvas = document.createElement('canvas');
  canvas.className = 'stage';
  canvas.setAttribute('aria-hidden', 'true');
  const dpr = Math.min(devicePixelRatio, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  const controls = document.createElement('div');
  controls.className = 'stage-controls';
  const status = document.createElement('p');
  status.className = 'stage-status';
  status.setAttribute('aria-live', 'polite');
  host.append(canvas, controls, status);

  const loops: (() => void)[] = [];
  const stage: Stage = {
    ctx, w: W, h: H, controls,
    say: (t) => {
      if (status.textContent !== t) status.textContent = t; // tránh đọc lặp với aria-live
    },
    sfx: (n, v) => audio.play(n, v),
    loop: (n) => {
      const stop = audio.loop(n);
      loops.push(stop);
      return stop;
    },
  };
  const it = factory(stage);
  let raf = 0, last = performance.now(), fired = false;
  const frame = (now: number) => {
    it.update(Math.min((now - last) / 1000, 0.1));
    last = now;
    ctx.clearRect(0, 0, W, H);
    it.draw();
    if (!fired && it.done()) {
      fired = true;
      setTimeout(onComplete, it.hold ?? 900); // để kịp thấy hiệu ứng cuối
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    loops.forEach((s) => s());
    it.dispose?.();
    host.replaceChildren();
  };
}

// ── Tiện ích vẽ dùng chung (màu theo design.md mục 2)
export const C = { bg: '#1c1a16', ink: '#f3eee4', muted: '#b9b2a6', accent: '#d9b26a', success: '#5bbf86', danger: '#e5736b', hint: '#f0a04b', a: '#7a1f2b', b: '#1f3a6b', c: '#a87a2a' };
export const FONT = '"Be Vietnam Pro", system-ui, sans-serif';

export function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, o: { size?: number; weight?: number; color?: string; align?: CanvasTextAlign } = {}) {
  ctx.font = `${o.weight ?? 600} ${o.size ?? 14}px ${FONT}`;
  ctx.fillStyle = o.color ?? C.ink;
  ctx.textAlign = o.align ?? 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

export function button(label: string, onClick: () => void, cls = 'btn') {
  const b = document.createElement('button');
  b.className = cls;
  b.textContent = label;
  b.addEventListener('click', onClick);
  return b;
}

export function slider(label: string, min: number, max: number, value: number, onInput: (v: number) => void, step = 1) {
  const wrap = document.createElement('label');
  wrap.className = 'stage-slider';
  const span = document.createElement('span');
  span.textContent = label;
  const input = Object.assign(document.createElement('input'), { type: 'range', min: String(min), max: String(max), step: String(step), value: String(value) });
  input.addEventListener('input', () => onInput(Number(input.value)));
  wrap.append(span, input);
  return { wrap, input };
}

export const ease = (t: number) => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;
