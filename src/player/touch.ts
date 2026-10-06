const RADIUS = 56; // px — bán kính joystick
const DEAD = 0.12; // tỉ lệ bán kính — vùng chết quanh tâm
const RUN = 0.6; // FR-06: kéo > 60% bán kính thì chạy
const PINCH_PX = 40; // chụm/mở 40 px = một nấc zoom (như một nấc cuộn chuột)
export const TOUCH_LOOK_GAIN = 1.6; // kéo ngón xoay nhanh hơn chuột cùng độ nhạy

/** Vector joystick từ độ lệch (px) so với tâm: hướng đã chuẩn hóa + cờ chạy (FR-06 bước 1). Hàm thuần. */
export function stickVector(dx: number, dy: number, radius = RADIUS) {
  const k = Math.min(1, Math.hypot(dx, dy) / radius);
  if (k < DEAD) return { move: { right: 0, forward: 0 }, run: false, k };
  const len = Math.hypot(dx, dy);
  return { move: { right: dx / len, forward: -dy / len }, run: k > RUN, k };
}

/**
 * Điều khiển cảm ứng (FR-06): ngón đầu ở nửa trái là joystick (đế hiện tại điểm chạm),
 * ngón ở nửa phải kéo để xoay camera, hai ngón ở nửa phải chụm/mở để zoom.
 * Theo dõi từng `pointerId` nên joystick và xoay chạy cùng lúc không cướp nhau (1a).
 */
export class TouchInput {
  move = { right: 0, forward: 0 };
  run = false;
  private look = { dx: 0, dy: 0 };
  private zoom = 0;
  private on = true;
  private stick: { id: number; x: number; y: number } | null = null;
  private fingers = new Map<number, { x: number; y: number }>();
  private pinch = 0;
  readonly base: HTMLElement;
  private knob: HTMLElement;

  constructor(canvas: HTMLCanvasElement, ui: HTMLElement) {
    this.knob = Object.assign(document.createElement('div'), { className: 'stick-knob' });
    this.base = Object.assign(document.createElement('div'), { className: 'stick', hidden: true });
    this.base.append(this.knob);
    ui.append(this.base);

    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' || !this.on) return;
      try {
        canvas.setPointerCapture(e.pointerId); // ngón trượt ra ngoài canvas (lên HUD) vẫn nhận move/up
      } catch {
        /* con trỏ đã nhả */
      }
      if (!this.stick && e.clientX < innerWidth / 2) {
        this.stick = { id: e.pointerId, x: e.clientX, y: e.clientY };
        Object.assign(this.base.style, { left: `${e.clientX}px`, top: `${e.clientY}px` });
        this.base.hidden = false;
        this.setKnob(0, 0);
      } else {
        this.fingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        this.pinch = this.spread();
      }
    });
    canvas.addEventListener('pointermove', (e) => {
      if (this.stick?.id === e.pointerId) {
        const s = stickVector(e.clientX - this.stick.x, e.clientY - this.stick.y);
        this.move = s.move;
        this.run = s.run;
        const len = Math.hypot(e.clientX - this.stick.x, e.clientY - this.stick.y) || 1;
        this.setKnob(((e.clientX - this.stick.x) / len) * s.k * RADIUS, ((e.clientY - this.stick.y) / len) * s.k * RADIUS);
        return;
      }
      const f = this.fingers.get(e.pointerId);
      if (!f) return;
      if (this.fingers.size === 1) {
        this.look.dx += (e.clientX - f.x) * TOUCH_LOOK_GAIN;
        this.look.dy += (e.clientY - f.y) * TOUCH_LOOK_GAIN;
      }
      f.x = e.clientX;
      f.y = e.clientY;
      if (this.fingers.size === 2) {
        const d = this.spread();
        this.zoom -= (d - this.pinch) / PINCH_PX; // mở ngón = lại gần
        this.pinch = d;
      }
    });
    // FR-06 1b: nhấc ngón hoặc touchcancel → joystick về giữa, nhân vật dừng.
    const up = (e: PointerEvent) => {
      if (this.stick?.id === e.pointerId) this.releaseStick();
      this.fingers.delete(e.pointerId);
      this.pinch = this.spread();
    };
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
  }

  private spread() {
    const [a, b] = [...this.fingers.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }

  private setKnob(x: number, y: number) {
    this.knob.style.transform = `translate(${x}px, ${y}px)`;
  }

  private releaseStick() {
    this.stick = null;
    this.move = { right: 0, forward: 0 };
    this.run = false;
    this.base.hidden = true;
  }

  /** Tắt khi mở lớp giao diện: thả joystick, bỏ ngón đang kéo. */
  set enabled(v: boolean) {
    this.on = v;
    if (!v) {
      this.releaseStick();
      this.fingers.clear();
      this.consume();
    }
  }

  consume() {
    const out = { ...this.look, zoom: this.zoom };
    this.look = { dx: 0, dy: 0 };
    this.zoom = 0;
    return out;
  }
}
