/**
 * Bọc `localStorage`; bị chặn hoặc ghi lỗi thì vẫn giữ giá trị trong bộ nhớ (FR-19 3a, 3b).
 * `failed` bật khi có ít nhất một lần đọc/ghi lỗi — nơi gọi hiện MSG-11 một lần mỗi phiên.
 */
class KV {
  private memory = new Map<string, string>();
  failed = false;

  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      this.failed = true;
      return this.memory.get(key) ?? null;
    }
  }

  set(key: string, value: string): boolean {
    this.memory.set(key, value);
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      this.failed = true;
      return false;
    }
  }

  remove(key: string) {
    this.memory.delete(key);
    try {
      localStorage.removeItem(key);
    } catch {
      this.failed = true;
    }
  }
}

export const kv = new KV();
