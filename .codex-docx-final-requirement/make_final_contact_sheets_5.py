from pathlib import Path
from PIL import Image, ImageDraw

source = Path(r"C:\Users\User\Desktop\online-leavesystem\.codex-docx-final-requirement\final-render-5")
target = source / "contact-sheets"
target.mkdir(exist_ok=True)
pages = sorted(source.glob("page-*.png"), key=lambda p: int(p.stem.split("-")[-1]))
for start in range(0, len(pages), 4):
    batch = pages[start:start + 4]
    opened = [Image.open(path).convert("RGB") for path in batch]
    width = max(i.width for i in opened)
    height = max(i.height for i in opened)
    canvas = Image.new("RGB", (width * 2 + 36, height * 2 + 60), "#d9d9d9")
    draw = ImageDraw.Draw(canvas)
    for offset, (path, img) in enumerate(zip(batch, opened)):
        x = (offset % 2) * (width + 24)
        y = (offset // 2) * (height + 30)
        canvas.paste(img, (x, y + 24))
        draw.text((x + 4, y + 4), f"Page {int(path.stem.split('-')[-1])}", fill="black")
    canvas.save(target / f"pages-{start+1:02d}-{start+len(batch):02d}.jpg", quality=90)
