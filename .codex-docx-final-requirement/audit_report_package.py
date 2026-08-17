from pathlib import Path
from zipfile import ZipFile

from lxml import etree


docx = Path(__file__).resolve().parents[1] / "ระบบอนุมัติใบลาออนไลน์ Final Requirement สำหรับรายงาน.docx"

with ZipFile(docx) as package:
    app = etree.fromstring(package.read("docProps/app.xml"))
    ep = {"ep": "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"}
    for key in ("Pages", "Words", "Characters", "Paragraphs", "Lines"):
        value = app.find(f"ep:{key}", ep)
        print(f"{key}={value.text if value is not None else 'N/A'}")

    document = etree.fromstring(package.read("word/document.xml"))
    w = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    print(f"paragraphs={len(document.xpath('//w:p', namespaces=w))}")
    print(f"tables={len(document.xpath('//w:tbl', namespaces=w))}")
    print(f"manual_page_breaks={len(document.xpath('//w:br[@w:type=\"page\"]', namespaces=w))}")
    print(f"sections={len(document.xpath('//w:sectPr', namespaces=w))}")
    print(f"drawings={len(document.xpath('//w:drawing', namespaces=w))}")
