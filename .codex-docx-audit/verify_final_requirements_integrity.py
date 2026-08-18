import json
import re
from pathlib import Path


ROOT = Path(r"C:\Users\User\Desktop\online-leavesystem")
TEXT_PATH = ROOT / ".codex-docx-audit" / "document.txt"
text = TEXT_PATH.read_text(encoding="utf-8")


def between(start, end):
    start_index = text.index(start)
    end_index = text.index(end, start_index)
    return text[start_index:end_index]


sections = {
    "fr": between("7. Functional Requirements", "8. Business Rules และ Non-Functional Requirements"),
    "br_nfr": between("8. Business Rules และ Non-Functional Requirements", "9. Database Design"),
    "database": between("9. Database Design", "10. API Specification"),
    "api": between("10. API Specification", "11. Validation Logic สำหรับ Dev"),
    "validation": between("11. Validation Logic สำหรับ Dev", "12. หน้าจอที่ต้องพัฒนา"),
    "acceptance": between("15. Acceptance Criteria หลัก", "16. Use Case"),
}


def unique_ids(section, prefix):
    return sorted(set(re.findall(rf"\b{prefix}-(\d{{2}})\b", section)))


expected = {
    "FR": [f"{i:02d}" for i in range(1, 22)],
    "BR": [f"{i:02d}" for i in range(1, 41)],
    "NFR": [f"{i:02d}" for i in range(1, 17)],
    "AC": [f"{i:02d}" for i in range(1, 11)],
}
actual = {
    "FR": unique_ids(sections["fr"], "FR"),
    "BR": unique_ids(sections["br_nfr"], "BR"),
    "NFR": unique_ids(sections["br_nfr"], "NFR"),
    "AC": unique_ids(sections["acceptance"], "AC"),
}

checks = {
    "fr_01_to_21_complete": actual["FR"] == expected["FR"],
    "br_01_to_40_complete": actual["BR"] == expected["BR"],
    "nfr_01_to_16_complete": actual["NFR"] == expected["NFR"],
    "ac_01_to_10_complete": actual["AC"] == expected["AC"],
    "fr_direct_supervisor_uses_employees_supervisor_id": "Direct Supervisor จาก employees.supervisor_id" in sections["fr"],
    "fr_submit_does_not_write_approver": "ไม่บันทึก approver_employee_id ในขั้นตอน Submit" in sections["fr"],
    "br_submit_does_not_write_approver": "โดยไม่บันทึก approver_employee_id" in sections["br_nfr"],
    "fr_attachment_policy_and_threshold": all(
        value in sections["fr"]
        for value in ("Attachment Policy", "Attachment Threshold", "requires_attachment", "attachment_required_after_days")
    ),
    "br_attachment_policy_not_hard_coded": "โดยไม่ Hard-code ประเภทการลา" in sections["br_nfr"],
    "fr_cancel_has_no_notification": "การ Cancel ไม่สร้าง Notification" in sections["fr"],
    "fr_cancel_not_an_audit_event": "leave_approved\n" in sections["fr"] and "leave_rejected\n" in sections["fr"] and "leave_cancelled" not in sections["fr"],
    "fr_approval_does_not_insert_history": "ไม่ INSERT leave_approval_logs ใน Current Approval Flow" in sections["fr"],
    "database_approver_written_only_on_decision": "บันทึกเมื่อ Approve หรือ Reject; ไม่บันทึกตอน Submit และไม่ใช้ตรวจสิทธิ์" in sections["database"],
    "database_current_controller_does_not_insert_history": "Current Approval Controller ไม่ INSERT ข้อมูลลงตารางนี้" in sections["database"],
    "database_attachment_table_name_current": "9.11 ตาราง leave_request_attachments" in sections["database"],
    "api_sections_present": all(f"10.{i} " in sections["api"] for i in range(1, 15)),
    "api_hr_management_allows_hr_admin": all(
        value in sections["api"]
        for value in (
            "/api/hr/employees | HR / Admin",
            "/api/hr/departments | HR / Admin",
            "/api/hr/positions | HR / Admin",
            "/api/hr/leave-types | HR / Admin",
            "/api/hr/leave-entitlements | HR / Admin",
            "/api/hr/holidays | HR / Admin",
            "/api/reports/leave-requests | HR / Admin",
        )
    ),
    "api_approval_is_direct_supervisor": "/decision | Direct Supervisor" in sections["api"],
    "api_attachment_scope_is_current": "Owner / Direct Supervisor / HR / Admin" in sections["api"],
    "api_audit_log_is_read_only": "ไม่มี API สำหรับแก้ไขหรือลบ Audit Log" in sections["api"],
    "validation_sections_present": all(f"11.{i} " in sections["validation"] for i in range(1, 10)),
    "validation_submit_no_approver": "ไม่บันทึกใน leave_requests" in sections["validation"] and "direct_supervisor = employee.supervisor_id" in sections["validation"],
    "validation_approval_no_history_insert": sections["validation"].count("ไม่ INSERT leave_approval_logs") >= 2,
    "validation_cancel_no_notification": "ไม่สร้าง Notification สำหรับการ Cancel" in sections["validation"],
    "validation_cancel_no_audit": "ไม่บันทึก Audit Log สำหรับ Cancel" in sections["validation"],
    "ac_submit_no_approver": "โดยไม่บันทึก approver_employee_id ตอน Submit" in sections["acceptance"],
    "ac_decisions_no_history_insert": sections["acceptance"].count("โดยไม่ INSERT leave_approval_logs") >= 2,
    "ac_cancel_no_notification": "ไม่สร้าง Notification เพิ่มสำหรับการ Cancel" in sections["acceptance"],
    "ac_cancel_no_audit": "ไม่บันทึก Audit Log สำหรับการ Cancel" in sections["acceptance"],
    "legacy_sick_leave_three_day_rule_absent": "ลาป่วยเกิน 3 วัน" not in text,
    "legacy_attachment_table_absent": re.search(r"(?<!request_)\bleave_attachments\b", text) is None,
}

submit_approver_lines = [
    line for line in text.splitlines()
    if "Submit" in line and "บันทึก approver_employee_id" in line
]
checks["all_submit_approver_mentions_are_negated"] = bool(submit_approver_lines) and all(
    "ไม่บันทึก approver_employee_id" in line or "โดยไม่บันทึก approver_employee_id" in line
    for line in submit_approver_lines
)

approval_log_insert_lines = [line for line in text.splitlines() if "INSERT leave_approval_logs" in line]
checks["all_approval_log_insert_mentions_are_negated"] = bool(approval_log_insert_lines) and all(
    "ไม่ INSERT leave_approval_logs" in line or "โดยไม่ INSERT leave_approval_logs" in line
    for line in approval_log_insert_lines
)

result = {
    "status": "PASS" if all(checks.values()) else "FAIL",
    "counts": {
        "FR": len(actual["FR"]),
        "BR": len(actual["BR"]),
        "NFR": len(actual["NFR"]),
        "AC": len(actual["AC"]),
        "database_subsections": len(set(re.findall(r"\b9\.(\d{1,2})\b", sections["database"]))),
        "api_subsections": len(set(re.findall(r"\b10\.(\d{1,2})\b", sections["api"]))),
        "validation_subsections": len(set(re.findall(r"\b11\.(\d{1,2})\b", sections["validation"]))),
    },
    "ids": actual,
    "checks": checks,
    "submit_approver_lines": submit_approver_lines,
    "approval_log_insert_lines": approval_log_insert_lines,
    "failed_checks": [name for name, passed in checks.items() if not passed],
}

out = ROOT / ".codex-docx-audit" / "final-requirements-integrity.json"
out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(result, ensure_ascii=False, indent=2))
