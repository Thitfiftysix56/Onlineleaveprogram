from pathlib import Path
from zipfile import ZipFile

from lxml import etree

docx = Path(__file__).resolve().parents[1] / "ระบบอนุมัติใบลาออนไลน์ Final Requirement.docx"
with ZipFile(docx) as package:
    root = etree.fromstring(package.read("word/document.xml"))
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    table = root.xpath("//w:tbl", namespaces=ns)[0]
    print(etree.tostring(table.xpath("./w:tblPr", namespaces=ns)[0], encoding="unicode"))
