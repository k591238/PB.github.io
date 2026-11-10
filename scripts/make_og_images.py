"""產生社群分享預覽圖 og.jpg（1200×630，FB／LINE／Threads／X 通用）。

    python scripts/make_og_images.py          # 只產生還沒有 og.jpg 的作品
    python scripts/make_og_images.py --force  # 全部重新產生
    python scripts/make_og_images.py p4 e3    # 只處理指定作品（會覆蓋）

來源：data/projects.json 每件作品的 ogSource 欄位（可選）→ banner.webp → thumb。
裁切方式：等比縮放填滿後置中裁切。輸出：assets/images/projects/{id}/og.jpg
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
W, H = 1200, 630


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    force = '--force' in sys.argv or bool(args)
    projects = json.loads((ROOT / 'data/projects.json').read_text(encoding='utf-8'))
    for p in projects:
        if args and p['id'] not in args:
            continue
        out = ROOT / f"assets/images/projects/{p['id']}/og.jpg"
        if out.exists() and not force:
            continue
        banner = ROOT / f"assets/images/projects/{p['id']}/banner.webp"
        src = ROOT / (p.get('ogSource') or (banner.relative_to(ROOT) if banner.exists() else p['thumb']))
        im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
        im = ImageOps.fit(im, (W, H), Image.LANCZOS)
        im.save(out, 'JPEG', quality=82, optimize=True, progressive=True)
        print(f"✓ {p['id']}: {src.relative_to(ROOT).as_posix()} → og.jpg（{out.stat().st_size // 1024} KB）")


if __name__ == '__main__':
    main()
