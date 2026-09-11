import json
import re
from collections import defaultdict
from difflib import SequenceMatcher
from pathlib import Path


ROOT = Path(r"C:\Users\User\Desktop\online-leavesystem")
RECORDS_PATH = ROOT / ".codex-docx-audit" / "document_records.json"
records = json.loads(RECORDS_PATH.read_text(encoding="utf-8"))


def normalize(value):
    value = value.casefold()
    value = re.sub(r"\s+", " ", value)
    value = re.sub(r"[^\w\sก-๙]", "", value)
    return value.strip()


def heading_key(value):
    value = re.sub(r"^(?:\d+(?:\.\d+)*\.?|FR-\d+|UC-\d+|AC-\d+)\s*", "", value, flags=re.I)
    value = re.sub(r"\bfinal\b", "", value, flags=re.I)
    return normalize(value)


paragraphs = []
headings = []
current_section = "front"
for record_index, record in enumerate(records):
    text = record.get("text", "").strip()
    if record["kind"] != "paragraph" or not text:
        continue
    top = re.match(r"^(1[0-6]|[1-9])\.\s", text)
    if top:
        current_section = top.group(1)
    item = {
        "record_index": record_index,
        "paragraph": record["paragraph"],
        "section": current_section,
        "style": record.get("style", ""),
        "text": text,
        "normalized": normalize(text),
    }
    paragraphs.append(item)
    if re.match(r"^(?:\d+(?:\.\d+)*\.?|FR-\d+|UC-\d+|AC-\d+)\s", text, flags=re.I):
        headings.append({**item, "heading_key": heading_key(text)})

exact_heading_groups = defaultdict(list)
semantic_heading_groups = defaultdict(list)
for heading in headings:
    exact_heading_groups[heading["normalized"]].append(heading)
    semantic_heading_groups[heading["heading_key"]].append(heading)

exact_paragraph_groups = defaultdict(list)
for paragraph in paragraphs:
    if len(paragraph["normalized"]) >= 40:
        exact_paragraph_groups[paragraph["normalized"]].append(paragraph)

table_rows = defaultdict(list)
for record in records:
    if record["kind"] == "table_row":
        table_rows[record["table"]].append(record["text"].strip())
table_signatures = defaultdict(list)
for table, rows in table_rows.items():
    table_signatures["\n".join(normalize(row) for row in rows)].append(table)

block_groups = defaultdict(list)
for index in range(len(paragraphs) - 1):
    first = paragraphs[index]
    second = paragraphs[index + 1]
    if first["record_index"] + 1 != second["record_index"]:
        continue
    if len(first["normalized"]) < 25 or len(second["normalized"]) < 25:
        continue
    block_groups[(first["normalized"], second["normalized"])].append(
        {"paragraph": first["paragraph"], "section": first["section"], "texts": [first["text"], second["text"]]}
    )

long_paragraphs = [p for p in paragraphs if len(p["normalized"]) >= 60]
near_same_section = []
near_cross_section = []
for i, first in enumerate(long_paragraphs):
    for second in long_paragraphs[i + 1:]:
        if abs(len(first["normalized"]) - len(second["normalized"])) > max(len(first["normalized"]), len(second["normalized"])) * 0.25:
            continue
        ratio = SequenceMatcher(None, first["normalized"], second["normalized"]).ratio()
        entry = {
            "ratio": round(ratio, 3),
            "first": {k: first[k] for k in ("paragraph", "section", "text")},
            "second": {k: second[k] for k in ("paragraph", "section", "text")},
        }
        if first["section"] == second["section"] and ratio >= 0.92:
            near_same_section.append(entry)
        elif first["section"] != second["section"] and ratio >= 0.94:
            near_cross_section.append(entry)

result = {
    "summary": {
        "paragraphs": len(paragraphs),
        "headings": len(headings),
        "tables": len(table_rows),
        "exact_duplicate_heading_groups": sum(1 for group in exact_heading_groups.values() if len(group) > 1),
        "semantic_duplicate_heading_groups": sum(1 for key, group in semantic_heading_groups.items() if key and len(group) > 1),
        "exact_duplicate_long_paragraph_groups": sum(1 for group in exact_paragraph_groups.values() if len(group) > 1),
        "exact_duplicate_table_groups": sum(1 for group in table_signatures.values() if len(group) > 1),
        "exact_duplicate_two_paragraph_blocks": sum(1 for group in block_groups.values() if len(group) > 1),
        "near_duplicate_same_section_pairs": len(near_same_section),
        "near_duplicate_cross_section_pairs": len(near_cross_section),
    },
    "exact_duplicate_headings": [group for group in exact_heading_groups.values() if len(group) > 1],
    "semantic_duplicate_headings": [group for key, group in semantic_heading_groups.items() if key and len(group) > 1],
    "exact_duplicate_long_paragraphs": [group for group in exact_paragraph_groups.values() if len(group) > 1],
    "exact_duplicate_tables": [group for group in table_signatures.values() if len(group) > 1],
    "exact_duplicate_two_paragraph_blocks": [group for group in block_groups.values() if len(group) > 1],
    "near_duplicate_same_section": sorted(near_same_section, key=lambda item: item["ratio"], reverse=True),
    "near_duplicate_cross_section": sorted(near_cross_section, key=lambda item: item["ratio"], reverse=True),
}

out = ROOT / ".codex-docx-audit" / "duplication-audit.json"
out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(result["summary"], ensure_ascii=False, indent=2))
