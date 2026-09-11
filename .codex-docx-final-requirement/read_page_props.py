from pathlib import Path
from zipfile import ZipFile
from lxml import etree

for name in ["ระบบอนุมัติใบลาออนไลน์ Final Requirement.docx"]:
    path = Path(__file__).resolve().parents[1] / "Final Requirement Output" / name
    with ZipFile(path) as package:
        app = etree.fromstring(package.read("docProps/app.xml"))
        ns = {"e": "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"}
        print({key: (app.find(f"e:{key}", ns).text if app.find(f"e:{key}", ns) is not None else None) for key in ["Pages", "Words", "Characters", "Paragraphs", "Lines"]})
