type Child = Node | string | null | undefined | false;

/**
 * Tạo phần tử; chữ luôn đi qua text node (không `innerHTML` — LLD mục 6).
 * `props.class` → className, các khóa khác → thuộc tính.
 */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, string> = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) if (c) node.append(c);
  return node;
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface Overlay {
  root: HTMLElement;
  onEsc: () => void;
  onKey?: (e: KeyboardEvent) => void;
}
const stack: Overlay[] = [];

/**
 * Mở một lớp giao diện (FSD mục 1): nhả pointer lock, focus phần tử đầu (hoặc `focus`),
 * bẫy Tab trong lớp, ESC gọi `onEsc`. Chỉ lớp trên cùng nhận phím. Trả về hàm đóng.
 */
export function openOverlay(ui: HTMLElement, dialog: HTMLElement, opts: { onEsc: () => void; onKey?: (e: KeyboardEvent) => void; scrim?: boolean; focus?: HTMLElement }) {
  document.exitPointerLock?.();
  const root = h('div', { class: opts.scrim === false ? 'overlay' : 'overlay scrim' }, dialog);
  ui.append(root);
  const entry: Overlay = { root, onEsc: opts.onEsc, onKey: opts.onKey };
  stack.push(entry);
  (opts.focus ?? dialog.querySelector<HTMLElement>(FOCUSABLE) ?? dialog).focus();
  return () => {
    root.remove();
    stack.splice(stack.indexOf(entry), 1);
    if (!stack.length) document.querySelector<HTMLElement>('#scene')?.focus();
  };
}

export const overlayOpen = () => stack.length > 0;

document.addEventListener('keydown', (e) => {
  const top = stack.at(-1);
  if (!top) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    top.onEsc();
    return;
  }
  if (e.key === 'Tab') {
    const items = [...top.root.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (!top.root.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
    return;
  }
  top.onKey?.(e);
});

/** Vùng thông báo (FSD SCR-05 element 13): tối đa 2 cái, thông tin 3 s, cảnh báo 5 s. */
export function createToasts(ui: HTMLElement) {
  const box = h('div', { class: 'toasts', role: 'status' });
  ui.append(box);
  return (text: string, kind: 'info' | 'warn' = 'info') => {
    const t = h('div', { class: `toast ${kind}` }, text);
    box.append(t);
    while (box.children.length > 2) box.firstElementChild!.remove();
    setTimeout(() => t.remove(), kind === 'warn' ? 5000 : 3000);
  };
}
