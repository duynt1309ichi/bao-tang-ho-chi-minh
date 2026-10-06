/**
 * Bọc `localStorage`; bị chặn hoặc ghi lỗi thì vẫn giữ giá trị trong bộ nhớ (FR-19 3a, 3b).
 * `failed` bật khi có ít nhất một lần đọc/ghi lỗi (tiến độ hoặc cài đặt); lần đầu bật thì gọi `onFail` —
 * nơi gọi hiện MSG-11, nên MSG-11 chỉ hiện một lần mỗi phiên.
 */
class KV {
  private memory = new Map<string, string>();
  failed = false;
  onFail = () => {};

  private fail() {
    if (this.failed) return;
    this.failed = true;
    this.onFail();
  }

  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      this.fail();
      return this.memory.get(key) ?? null;
    }
  }

  set(key: string, value: string): boolean {
    this.memory.set(key, value);
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      this.fail();
      return false;
    }
  }

  remove(key: string) {
    this.memory.delete(key);
    try {
      localStorage.removeItem(key);
    } catch {
      this.fail();
    }
  }
}

export const kv = new KV();
