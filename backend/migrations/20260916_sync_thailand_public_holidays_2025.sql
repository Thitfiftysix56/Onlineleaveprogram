-- Organization holiday calendar for 2025 (B.E. 2568).
-- Idempotent so existing HR edits are updated consistently when migrations rerun.

INSERT INTO holidays
  (holiday_date, holiday_name, holiday_type, description, year, is_active)
VALUES
  ('2025-01-01', 'วันขึ้นปีใหม่', 'Public Holiday', NULL, 2025, 1),
  ('2025-02-12', 'วันมาฆบูชา', 'Public Holiday', NULL, 2025, 1),
  ('2025-04-06', 'วันจักรี', 'Public Holiday', NULL, 2025, 1),
  ('2025-04-07', 'วันหยุดชดเชยวันจักรี', 'Public Holiday', NULL, 2025, 1),
  ('2025-04-13', 'วันสงกรานต์', 'Public Holiday', NULL, 2025, 1),
  ('2025-04-14', 'วันสงกรานต์', 'Public Holiday', NULL, 2025, 1),
  ('2025-04-15', 'วันสงกรานต์', 'Public Holiday', NULL, 2025, 1),
  ('2025-04-16', 'วันหยุดชดเชยวันสงกรานต์', 'Public Holiday', NULL, 2025, 1),
  ('2025-05-01', 'วันแรงงานแห่งชาติ', 'Public Holiday', NULL, 2025, 1),
  ('2025-05-04', 'วันฉัตรมงคล', 'Public Holiday', NULL, 2025, 1),
  ('2025-05-05', 'วันหยุดชดเชยวันฉัตรมงคล', 'Public Holiday', NULL, 2025, 1),
  ('2025-05-09', 'วันพืชมงคล', 'Public Holiday', NULL, 2025, 1),
  ('2025-05-11', 'วันวิสาขบูชา', 'Public Holiday', NULL, 2025, 1),
  ('2025-05-12', 'วันหยุดชดเชยวันวิสาขบูชา', 'Public Holiday', NULL, 2025, 1),
  ('2025-06-02', 'วันหยุดราชการเพิ่มเติมเป็นกรณีพิเศษ', 'Public Holiday', NULL, 2025, 1),
  ('2025-06-03', 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าฯ พระบรมราชินี', 'Public Holiday', NULL, 2025, 1),
  ('2025-07-10', 'วันอาสาฬหบูชา', 'Public Holiday', NULL, 2025, 1),
  ('2025-07-11', 'วันเข้าพรรษา', 'Public Holiday', NULL, 2025, 1),
  ('2025-07-28', 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว', 'Public Holiday', NULL, 2025, 1),
  ('2025-08-11', 'วันหยุดราชการเพิ่มเติมเป็นกรณีพิเศษ', 'Public Holiday', NULL, 2025, 1),
  ('2025-08-12', 'วันแม่แห่งชาติ', 'Public Holiday', NULL, 2025, 1),
  ('2025-10-13', 'วันนวมินทรมหาราช', 'Public Holiday', NULL, 2025, 1),
  ('2025-10-23', 'วันปิยมหาราช', 'Public Holiday', NULL, 2025, 1),
  ('2025-12-05', 'วันชาติและวันพ่อแห่งชาติ', 'Public Holiday', NULL, 2025, 1),
  ('2025-12-10', 'วันรัฐธรรมนูญ', 'Public Holiday', NULL, 2025, 1),
  ('2025-12-31', 'วันสิ้นปี', 'Public Holiday', NULL, 2025, 1)
ON DUPLICATE KEY UPDATE
  holiday_name = VALUES(holiday_name),
  holiday_type = VALUES(holiday_type),
  description = VALUES(description),
  year = VALUES(year),
  is_active = 1;
