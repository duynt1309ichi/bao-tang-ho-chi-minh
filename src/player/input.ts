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

  constructor(private canvas: HTMLCanvasElement) {
    addEventListener('keydown', (e) => {
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
      if (document.pointerLockElement === canvas || (e.buttons & 1 && e.target === canvas)) {
        this.look.dx += e.movementX;
        this.look.dy += e.movementY;
      }
    });
    canvas.addEventListener('wheel', (e) => {
      this.zoom += Math.sign(e.deltaY);
      e.preventDefault();
    }, { passive: false });
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
