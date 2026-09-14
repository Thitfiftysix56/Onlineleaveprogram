-- Thailand public holidays for 2026 (B.E. 2569).
-- HR can still add organization-specific holidays from the holiday management page.

INSERT INTO holidays
  (holiday_date, holiday_name, holiday_type, description, year, is_active)
VALUES
  ('2026-01-01', 'วันขึ้นปีใหม่', 'Public Holiday', NULL, 2026, 1),
  ('2026-01-02', 'วันหยุดราชการเพิ่มเติมเป็นกรณีพิเศษ', 'Public Holiday', NULL, 2026, 1),
  ('2026-03-03', 'วันมาฆบูชา', 'Public Holiday', NULL, 2026, 1),
  ('2026-04-06', 'วันจักรี', 'Public Holiday', NULL, 2026, 1),
  ('2026-04-13', 'วันสงกรานต์', 'Public Holiday', NULL, 2026, 1),
  ('2026-04-14', 'วันสงกรานต์', 'Public Holiday', NULL, 2026, 1),
  ('2026-04-15', 'วันสงกรานต์', 'Public Holiday', NULL, 2026, 1),
  ('2026-05-01', 'วันแรงงานแห่งชาติ', 'Public Holiday', NULL, 2026, 1),
  ('2026-05-04', 'วันฉัตรมงคล', 'Public Holiday', NULL, 2026, 1),
  ('2026-05-11', 'วันพืชมงคล', 'Public Holiday', NULL, 2026, 1),
  ('2026-05-31', 'วันวิสาขบูชา', 'Public Holiday', NULL, 2026, 1),
  ('2026-06-01', 'วันหยุดชดเชยวันวิสาขบูชา', 'Public Holiday', NULL, 2026, 1),
  ('2026-06-03', 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าฯ พระบรมราชินี', 'Public Holiday', NULL, 2026, 1),
  ('2026-07-28', 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว', 'Public Holiday', NULL, 2026, 1),
  ('2026-07-29', 'วันอาสาฬหบูชา', 'Public Holiday', NULL, 2026, 1),
  ('2026-07-30', 'วันเข้าพรรษา', 'Public Holiday', NULL, 2026, 1),
  ('2026-08-12', 'วันแม่แห่งชาติ', 'Public Holiday', 'วันคล้ายวันพระราชสมภพสมเด็จพระบรมราชชนนีพันปีหลวง และวันแม่แห่งชาติ', 2026, 1),
  ('2026-10-13', 'วันนวมินทรมหาราช', 'Public Holiday', NULL, 2026, 1),
  ('2026-10-23', 'วันปิยมหาราช', 'Public Holiday', NULL, 2026, 1),
  ('2026-12-05', 'วันชาติและวันพ่อแห่งชาติ', 'Public Holiday', NULL, 2026, 1),
  ('2026-12-07', 'วันหยุดชดเชยวันชาติและวันพ่อแห่งชาติ', 'Public Holiday', NULL, 2026, 1),
  ('2026-12-10', 'วันรัฐธรรมนูญ', 'Public Holiday', NULL, 2026, 1),
  ('2026-12-31', 'วันสิ้นปี', 'Public Holiday', NULL, 2026, 1)
ON DUPLICATE KEY UPDATE
  holiday_name = VALUES(holiday_name),
  holiday_type = VALUES(holiday_type),
  description = VALUES(description),
  year = VALUES(year),
  is_active = 1;
