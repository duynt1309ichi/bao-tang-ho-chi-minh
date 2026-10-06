const FORWARD = ['KeyW', 'ArrowUp'];
const BACK = ['KeyS', 'ArrowDown'];
const LEFT = ['KeyA', 'ArrowLeft'];
const RIGHT = ['KeyD', 'ArrowRight'];
const MOVE_KEYS = new Set([...FORWARD, ...BACK, ...LEFT, ...RIGHT, 'ShiftLeft', 'ShiftRight']);

/** Hướng đi theo khung camera, độ dài ≤ 1; phím ngược nhau triệt tiêu (FR-04 1a, 1b). Hàm thuần. */
export function normalizeMove(keys: ReadonlySet<string>): { right: number; forward: number } {
  const has = (codes: string[]) => codes.some((c) => keys.has(c));
  const right = Number(has(RIGHT)) - Number(has(LEFT));
  const forward = Number(has(FORWARD)) - Number(has(BACK));
  const len = Math.hypot(right, forward);
  return len ? { right: right / len, forward: forward / len } : { right: 0, forward: 0 };
}

/** Bàn phím + chuột (FR-04, FR-05). Gom thao tác giữa hai khung hình. */
export class DesktopInput {
  readonly keys = new Set<string>();
  look = { dx: 0, dy: 0 };
  zoom = 0;
  onToggleView = () => {};
  onInteract = () => {};
  private on = true;

  constructor(private canvas: HTMLCanvasElement) {
    addEventListener('keydown', (e) => {
      if (!this.on) return; // đang mở bảng: để phím mũi tên, Space… cho giao diện
      if (e.code === 'KeyE' && !e.repeat) this.onInteract();
      if (MOVE_KEYS.has(e.code)) {
        this.keys.add(e.code);
        e.preventDefault();
      }
      if (e.code === 'KeyV' && !e.repeat) this.onToggleView();
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    // Mất focus thì coi như thả hết phím (FR-04 1d).
    addEventListener('blur', () => this.keys.clear());
    document.addEventListener('visibilitychange', () => this.keys.clear());

    canvas.addEventListener('click', () => {
      if (document.pointerLockElement !== canvas) canvas.requestPointerLock?.()?.catch?.(() => {});
    });
    // Có pointer lock: di chuột là xoay. Không có (bị từ chối): giữ chuột trái và kéo (FR-05 1b).
    addEventListener('mousemove', (e) => {
      if (this.on && (document.pointerLockElement === canvas || (e.buttons & 1 && e.target === canvas))) {
        this.look.dx += e.movementX;
        this.look.dy += e.movementY;
      }
    });
    canvas.addEventListener('wheel', (e) => {
      this.zoom += Math.sign(e.deltaY);
      e.preventDefault();
    }, { passive: false });
  }

  /** Tắt khi mở lớp giao diện: thả hết phím, bỏ xoay/zoom đang gom. */
  set enabled(v: boolean) {
    this.on = v;
    if (!v) {
      this.keys.clear();
      this.consume();
    }
  }

  get move() {
    return normalizeMove(this.keys);
  }

  get run() {
    return this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
  }

  /** Lấy và xóa lượng xoay/zoom đã gom. */
  consume() {
    const out = { ...this.look, zoom: this.zoom };
    this.look = { dx: 0, dy: 0 };
    this.zoom = 0;
    return out;
  }

  get locked() {
    return document.pointerLockElement === this.canvas;
  }
}
