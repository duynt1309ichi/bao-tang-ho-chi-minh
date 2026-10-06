# Ảnh chân dung (Wikimedia Commons, phạm vi công cộng — xem CREDITS.md) → WebP 3:4 trong public/assets/img/.
# Chạy: python tools/convert_portraits.py   (cần Pillow)
import os
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SRC = os.path.join(ROOT, 'assets-src', 'portraits')
OUT = os.path.join(ROOT, 'public', 'assets', 'img')
W, H = 480, 640

# tên: (tâm khung theo tỉ lệ ảnh x, y; bề rộng khung / bề rộng ảnh)
CROP = {
    'mac': (0.52, 0.27, 0.62),  # ảnh gốc là toàn thân ngồi: lấy nửa người trên
    'angghen': (0.5, 0.5, 1.0),
    'lenin': (0.5, 0.4, 1.0),
    'ho-chi-minh': (0.5, 0.45, 1.0),
}

os.makedirs(OUT, exist_ok=True)
for name, (cx, cy, k) in CROP.items():
    im = Image.open(os.path.join(SRC, f'{name}.jpg')).convert('RGB')
    w = im.width * k
    h = min(w * H / W, im.height)
    w = h * W / H
    x = min(max(cx * im.width - w / 2, 0), im.width - w)
    y = min(max(cy * im.height - h / 2, 0), im.height - h)
    out = im.crop((round(x), round(y), round(x + w), round(y + h))).resize((W, H), Image.LANCZOS)
    path = os.path.join(OUT, f'{name}.webp')
    out.save(path, 'WEBP', quality=80, method=6)
    print(path, os.path.getsize(path))
