# PROJECT_STATE — Bảo tàng Triết học

> File điều phối trung tâm. PO và mọi role cập nhật file này. Không xoá lịch sử; chỉ thêm/đổi trạng thái.
> Quy trình: `AI-Skill/training-skill-software/software-development-skills/WORKFLOW.md`.

- **Dự án:** Bảo tàng Triết học (repo `bao-tang-ho-chi-minh`)
- **Ngày khởi tạo:** 2026-10-06
- **Loại dự án:** Mới (Track A)
- **Kiểu bố trí tài liệu:** A — monolith, tài liệu đi chung repo code (`docs/{ba,sa,design,qa,security}`)
- **Giai đoạn hiện tại:** B2 — SRS + Techstack + HLD
- **Cổng đang chờ:** GATE-2
- **GATE-3 (đóng băng thiết kế):** BẬT
- **GATE-4 (nghiệm thu chức năng):** BẬT

## Trạng thái artifact
Trạng thái: `NOT_STARTED` → `IN_PROGRESS` → `DONE` → `APPROVED` (hoặc `NEEDS_REVISION`)

| Artifact          | Role        | Trạng thái   | Cập nhật (yyyy-mm-dd) |
|-------------------|-------------|--------------|------------------------|
| audit-report.md   | BA + SA     | —            | không áp dụng (dự án mới) |
| BRD.md            | BA          | APPROVED     | 2026-10-06             |
| SRS.md            | BA          | NOT_STARTED  |                        |
| function-map.html | BA          | NOT_STARTED  |                        |
| techstack.md      | SA          | NOT_STARTED  |                        |
| HLD.md            | SA          | NOT_STARTED  |                        |
| architecture.html | SA          | NOT_STARTED  |                        |
| FSD.md            | BA          | NOT_STARTED  |                        |
| LLD.md            | SA          | NOT_STARTED  |                        |
| api-spec.md       | SA          | —            | không áp dụng — không có backend (anh Duy chọn quy trình rút gọn 2026-10-06) |
| design.md         | Designer    | NOT_STARTED  |                        |
| scaffold-backend  | Backend     | —            | không áp dụng (quy trình rút gọn) |
| scaffold-frontend | Frontend    | NOT_STARTED  |                        |
| scaffold-mobile   | Mobile      | —            | không áp dụng — web responsive thay app native |
| src (code)        | Frontend    | NOT_STARTED  |                        |
| test-plan.md      | Tester      | NOT_STARTED  |                        |
| test-cases.md     | Tester      | NOT_STARTED  |                        |
| test-report.md    | Tester      | NOT_STARTED  |                        |
| pentest-report.md | Security    | NOT_STARTED  |                        |
| user-guide.md     | BA          | NOT_STARTED  |                        |
| docker-compose.yml| DevOps      | —            | thay bằng Vercel Preview (quy trình rút gọn); deploy-notes.md vẫn làm |

**Tài liệu nháp đầu vào** (viết trước khi áp quy trình — dùng làm nguyên liệu cho BRD/SRS/HLD, sẽ thay thế dần):
- `docs/THIET_KE.md` — ý tưởng gameplay, đồ họa, kỹ thuật, lộ trình.
- `docs/NOI_DUNG.md` — 10 phòng / 63 hiện vật trích từ Giáo trình Triết học Mác – Lênin (2021), có số trang.

## Log phê duyệt (chỉ con người)
| Cổng   | Kết quả  | Người duyệt | Ngày | Ghi chú |
|--------|----------|-------------|------|---------|
| GATE-1 | Duyệt    | anh Duy     | 2026-10-06 | BRD v1.0 |
| GATE-2 | —        |             |      |         |
| GATE-3 | —        |             |      |         |
| GATE-4 | —        |             |      |         |
| GATE-5 | —        |             |      |         |
| GATE-6 | —        |             |      |         |

## Thông số môi trường
- **Dải port UAT (anh Duy cấp):** <chưa có — hỏi trước khi deploy>
- **Blender:** 4.5.14 LTS tại `D:\blender\blender.exe` — đã thử chạy headless + glTF exporter OK (2026-10-06).

## Nhật ký (append-only)
- 2026-10-06 — Tạo repo, commit đầu `08338b8` (README).
- 2026-10-06 — Phân tích bản tham khảo https://hcm-58us.vercel.app (Three.js, góc nhìn thứ 1, 6 phòng).
- 2026-10-06 — Anh Duy đổi nội dung sang Giáo trình Triết học Mác – Lênin (2021); đã đọc đủ 495 trang, viết nháp `docs/NOI_DUNG.md`.
- 2026-10-06 — Anh Duy chọn phương án đồ họa: Claude điều khiển Blender bằng script (`bpy`) để dựng/bake tòa nhà. Đã cài Blender.
- 2026-10-06 — PO phân loại: Dự án mới (Track A). Bắt đầu B1 — BA brainstorm.
- 2026-10-06 — BA brainstorm, anh Duy chốt: đồ án môn học; UAT ~1 tháng (2026-11-06); quy trình rút gọn (giữ 6 cổng, bỏ backend/mobile/api-spec, UAT = Vercel Preview); AI-Skill/ không đẩy git (.gitignore).
- 2026-10-06 — BA viết `docs/ba/BRD.md` v0.1 → DONE. PO trình GATE-1.
- 2026-10-06 — anh Duy trả lời câu hỏi mở: nộp đồ án bằng link web host (Vercel) cho giảng viên xem; tên sản phẩm "Bảo tàng Triết học". BRD → v0.2. PO trình lại GATE-1.
- 2026-10-06 — anh Duy duyệt GATE-1 (BRD v1.0). Sang B2: BA viết SRS + function-map; SA brainstorm kiến trúc.
