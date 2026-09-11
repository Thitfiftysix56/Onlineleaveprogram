from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(r"C:\Users\User\Desktop\online-leavesystem\.codex-docx-audit")
images = sorted(
    (ROOT / "rendered").glob("page-*.png"),
    key=lambda path: int(path.stem.split("-")[-1]),
)
out_dir = ROOT / "contact-sheets"
out_dir.mkdir(exist_ok=True)

columns = 3
rows = 3
thumb_width = 400
label_height = 28
gap = 16
font = ImageFont.load_default(size=18)

for batch_index in range(0, len(images), columns * rows):
    batch = images[batch_index:batch_index + columns * rows]
    prepared = []
    max_height = 0
    for path in batch:
        with Image.open(path) as image:
            ratio = thumb_width / image.width
            thumb = image.resize((thumb_width, round(image.height * ratio)), Image.Resampling.LANCZOS)
            prepared.append((path, thumb.copy()))
            max_height = max(max_height, thumb.height)
    sheet_width = gap + columns * (thumb_width + gap)
    sheet_height = gap + rows * (label_height + max_height + gap)
    sheet = Image.new("RGB", (sheet_width, sheet_height), "#d8dde5")
    draw = ImageDraw.Draw(sheet)
    for index, (path, thumb) in enumerate(prepared):
        row = index // columns
        column = index % columns
        x = gap + column * (thumb_width + gap)
        y = gap + row * (label_height + max_height + gap)
        page = int(path.stem.split("-")[-1])
        draw.text((x, y + 3), f"Page {page}", fill="black", font=font)
        sheet.paste(thumb, (x, y + label_height))
    first_page = int(batch[0].stem.split("-")[-1])
    last_page = int(batch[-1].stem.split("-")[-1])
    sheet.save(out_dir / f"pages-{first_page:02d}-{last_page:02d}.png", quality=95)

print({"pages": len(images), "contact_sheets": len(list(out_dir.glob('*.png')))})
