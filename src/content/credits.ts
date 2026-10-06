import md from '../../CREDITS.md?raw';

export interface Credit {
  asset: string;
  author: string;
  source: string;
  license: string;
}

/** Đọc bảng trong CREDITS.md (nguồn duy nhất, SRS FR-27): bỏ dòng tiêu đề và dòng `|---|`. Hàm thuần. */
export function parseCredits(text: string): Credit[] {
  return text
    .split('\n')
    .filter((l) => l.startsWith('|') && !/^\|\s*-/.test(l))
    .slice(1)
    .map((l) => {
      const [asset, author, source, license] = l.split('|').slice(1, -1).map((c) => c.trim());
      return { asset, author, source, license };
    });
}

export const credits = parseCredits(md);
