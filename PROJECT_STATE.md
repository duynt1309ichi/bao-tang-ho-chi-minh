# PROJECT_STATE — Bảo tàng Triết học

> File điều phối trung tâm. PO và mọi role cập nhật file này. Không xoá lịch sử; chỉ thêm/đổi trạng thái.
> Quy trình: `AI-Skill/training-skill-software/software-development-skills/WORKFLOW.md`.

- **Dự án:** Bảo tàng Triết học (repo `bao-tang-ho-chi-minh`)
- **Ngày khởi tạo:** 2026-10-06
- **Loại dự án:** Mới (Track A)
- **Kiểu bố trí tài liệu:** A — monolith, tài liệu đi chung repo code (`docs/{ba,sa,design,qa,security}`)
- **Giai đoạn hiện tại:** B4 — Kiểm thử (vòng 2 sạch lỗi trên nhánh `fix/qa-round1`; còn 9 TC chờ máy thật)
- **Cổng đang chờ:** GATE-4 (nghiệm thu bản sau sửa lỗi; M1–M5 đã nghiệm thu chức năng từng mốc)
- **GATE-3 (đóng băng thiết kế):** BẬT
- **GATE-4 (nghiệm thu chức năng):** BẬT

## Trạng thái artifact
Trạng thái: `NOT_STARTED` → `IN_PROGRESS` → `DONE` → `APPROVED` (hoặc `NEEDS_REVISION`)

| Artifact          | Role        | Trạng thái   | Cập nhật (yyyy-mm-dd) |
|-------------------|-------------|--------------|------------------------|
| audit-report.md   | BA + SA     | —            | không áp dụng (dự án mới) |
| BRD.md            | BA          | APPROVED     | 2026-10-06             |
| SRS.md            | BA          | APPROVED     | 2026-10-06             |
| function-map.html | BA          | APPROVED     | 2026-10-06             |
| techstack.md      | SA          | APPROVED     | 2026-10-06             |
| HLD.md            | SA          | APPROVED     | 2026-10-06             |
| architecture.html | SA          | APPROVED     | 2026-10-06             |
| FSD.md            | BA          | APPROVED     | 2026-10-06             |
| LLD.md            | SA          | APPROVED     | 2026-10-06             |
| api-spec.md       | SA          | —            | không áp dụng — không có backend (anh Duy chọn quy trình rút gọn 2026-10-06) |
| design.md         | Designer    | APPROVED     | 2026-10-06             |
| scaffold-backend  | Backend     | —            | không áp dụng (quy trình rút gọn) |
| scaffold-frontend | Frontend    | APPROVED     | 2026-10-06             |
| scaffold-mobile   | Mobile      | —            | không áp dụng — web responsive thay app native |
| src (code)        | Frontend    | IN_PROGRESS  | 2026-10-06             |
| test-plan.md      | Tester      | DONE         | 2026-10-06             |
| test-cases.md     | Tester      | DONE         | 2026-10-06             |
| test-report.md    | Tester      | DONE         | 2026-10-06 — vòng 2: 115 Pass, 0 Fail, 9 Blocked (máy thật) |
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
| GATE-2 | Duyệt    | anh Duy     | 2026-10-06 | SRS v0.1, techstack, HLD, architecture, function-map |
| GATE-3 | Duyệt    | anh Duy     | 2026-10-06 | FSD, LLD, design, scaffold |
| GATE-4 | Duyệt (phạm vi M1–M2) | anh Duy | 2026-10-06 | Nghiệm thu chức năng M1–M2, gồm 38 câu trắc nghiệm. M3–M5 nghiệm thu tiếp ở GATE-4 sau |
| GATE-4 | Duyệt (phạm vi M3–M4) | anh Duy | 2026-10-06 | Nghiệm thu M3–M4 (gồm nội dung rà ở M4). M5 nghiệm thu sau |
| GATE-4 | Duyệt (phạm vi M5) | anh Duy | 2026-10-06 | Nghiệm thu M5. Chuyển sang kiểm thử |
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
- 2026-10-06 — BA viết `docs/ba/SRS.md` v0.1 (27 FR, 14 NFR, 4 điểm chờ xác nhận ở mục 8) + `docs/ba/function-map.html` → DONE. SA bắt đầu brainstorm kiến trúc.
- 2026-10-06 — anh Duy xác nhận 4 điểm SRS mục 8, chọn phương án kiến trúc A (Three.js thuần) và toàn bộ bảng version. SA viết `docs/sa/techstack.md`, `HLD.md`, `architecture.html` → DONE. PO trình GATE-2.
- 2026-10-06 — anh Duy duyệt GATE-2. Sang B3: FSD, LLD, design, scaffold-frontend.
- 2026-10-06 — B3: designer viết `docs/design/design.md`; BA viết `docs/ba/FSD.md` (15 màn SCR, 19 thông báo MSG, ma trận 27/27 FR); SA viết `docs/sa/LLD.md`; frontend dựng khung Vite 8.3 + TS 6.0 + three 0.186 + Vitest 5 + `vercel.json` (CSP) — build OK, chạy dev OK. Chưa deploy Vercel (chốt cách kết nối ở B6 theo HLD). PO trình GATE-3.
- 2026-10-06 — anh Duy duyệt GATE-3. Sang B4, mốc M1 trên nhánh `feature/m1-blockout`. Kết nối Vercel giữ ở B6 (anh chưa yêu cầu làm sớm).
- 2026-10-06 — M1 (nhánh `feature/m1-blockout`): `layout.json` (63 vị trí hiện vật, 10 trạm), bảo tàng khối hộp sinh từ layout, nhân vật tạm, camera thứ 3/thứ nhất chống xuyên tường + không xuống dưới sàn, va chạm three-mesh-bvh, nhãn khu vực. 18 unit test xanh; thử trên trình duyệt: đi 5 s = 10,01 m, chạy hết trục bảo tàng không kẹt, không xuyên tường, camera không xuyên tường ở 30 lần thử. Còn lại của M1: điều khiển cảm ứng dời sang M5 theo lộ trình.
- 2026-10-06 — M2 (nhánh `feature/m2-exhibits`, cắt từ M1): `content/exhibits.ts` (63 hiện vật, 13 🎛, tóm tắt + trích dẫn + trang), `content/quiz.ts` (38 câu, 3–5 câu/phòng — **chờ anh Duy rà trước GATE-4**), `content/validate.ts` (luật FR-26, chạy trong `npm run build`), `storage/` (Progress `bttr.progress.v1`, validate FR-19, `mergeQuiz`), `exhibits/proximity` (BR-S09), bảng hiện vật SCR-07 (camera bay tới viewpoint), trắc nghiệm SCR-10 (xáo phương án, gợi ý xem lại, hỏi trước khi thoát), màn hoàn thành SCR-11, HUD N/63, toast MSG-06/10/11. 35 unit test xanh; thử trên trình duyệt: mở/đóng hiện vật → 1/63 + toast, tải lại giữ tiến độ, P05 4/4 → ★ rồi làm lại 2/4 vẫn ★, thoát giữa bài không lưu, hiện vật thứ 63 → màn hoàn thành đúng 1 lần, tiến độ `abc` → 0/63 + MSG-10, bố cục điện thoại 375 px. Chưa làm trong M2 (theo lộ trình): thao tác 🎛 (M4), xoay mô hình 🧊 (M3/M4), ảnh chân dung + credits (M5), ◎ gợi ý trên bản đồ (M4 cùng minimap).
- 2026-10-06 — anh Duy giao Claude tự quyết 3 điểm sau M2: (1) Claude tự rà 38 câu trắc nghiệm theo nội dung hiện vật + NOI_DUNG.md (đáp án, phương án nhiễu, giải thích) — không thấy sai; sửa thân hiện vật `a1-dinh-nghia` để không lặp nguyên văn định nghĩa đã có ở phần trích dẫn. Việc anh Duy rà nội dung vẫn giữ trong DoD GATE-4 (SRS FR-16). (2) Giữ cấu hình `dev-5174` trong `.claude/launch.json` cho phiên song song. (3) Commit và đẩy nhánh `feature/m2-exhibits`.
- 2026-10-06 — anh Duy nghiệm thu GATE-4 phạm vi M1–M2 (gồm rà 38 câu trắc nghiệm). Merge `feature/m2-exhibits` (chứa M1) vào `main` (fast-forward), đẩy lên origin. Sang M3 trên nhánh `feature/m3-graphics`.
- 2026-10-06 — M3 (nhánh `feature/m3-graphics`): thêm `postprocessing` 6.39, `n8ao` 2.0 (đã có trong techstack) và `@fontsource/be-vietnam-pro` (cách tự host font đã chốt). `world/textures` (texture thủ tục: vữa, gỗ sồi, đá, cỏ, thảm — UV theo mét), `world/signs` (Canvas 2D theo ADR-06: atlas pano 63 hiện vật, biển 10 phòng + phòng ôn tập + cổng, pano chào ở sảnh tr.438), `world/environment` (IBL RoomEnvironment, trời gradient, đèn bóng đổ đi theo người chơi), blockout có trần + đèn trần, ốp/phào chân tường, khung cửa màu khu, hình khối riêng cho 4 loại hiện vật, đèn rọi 3200 K giả bằng vệt sáng. `core/quality` + `core/graphics` (HLD 7.3: Thấp vẽ thẳng; TB bloom + SMAA + bóng 1024; Cao thêm N8AO + vignette + bóng 2048), `storage/settings` (`bttr.settings.v1`), SCR-12 rút gọn (Tiếp tục, Cài đặt, Về sảnh) + SCR-13 chỉ có chất lượng, tự hạ một bậc khi FPS < 25 trong 5 s (MSG-09). 48 unit test xanh; thử trên trình duyệt: ảnh khuôn viên, sảnh, hành lang, P01, P03, phòng ôn tập; chọn Cao lưu qua tải lại; ESC mở/đóng menu; giả lập 18 FPS → TB xuống Thấp, không hạ thêm; bảng hiện vật vẫn mở đúng viewpoint; bố cục 375 px. GPU máy dev (RTX 3060 Laptop): ~0,4 / 0,8 / 1,1 ms mỗi khung ở Thấp / TB / Cao (1024×768) — NFR-01 trên Iris Xe phải đo trên máy thật ở test-report.
- 2026-10-06 — **Điểm lệch so với HLD 7.3 / BRD, cần anh Duy quyết ở GATE-4 phạm vi M3:** (1) chưa bake lightmap bằng Blender — dùng blockout có vật liệu theo ADR-04; (2) không tải HDRI/texture CC0 (tải file ngoài cần anh Duy đồng ý) — thay bằng RoomEnvironment + trời gradient + texture thủ tục, không phải ghi credits; (3) texture 512 / 1024 / 1024 px (Thấp / TB / Cao) thay vì 1K / 1K / 2K — texture thủ tục vẽ lúc tải, 2K tốn ~4 s mà không rõ nét hơn; (4) mức Cao 1 đèn bóng đổ map 2048 thay vì 2 đèn; (5) SCR-12/13 mới có phần phục vụ M3, sơ đồ bảo tàng + bảng "Về giáo trình" ở sảnh (FR-27) để M4/M5.
- 2026-10-06 — anh Duy cho phép làm đủ 5 điểm lệch M3 (kể cả tải asset ngoài). Đã làm: (1) **lightmap bake Blender** — hình học sinh từ code (`world/geometry.ts`) + UV lightmap xếp kệ (`world/lightmap.ts`, 17,2 texel/m, bỏ mặt bị che), `scripts/export-bake.mjs` → OBJ, `tools/blender/bake_lightmap.py` bake Cycles OptiX 256 mẫu + khử nhiễu OIDN (~2 phút), đèn: dải đèn trần (công suất theo m² sàn), 63 đèn rọi 3200 K, HDRI; ghi lại thành ADR-08 trong HLD; (2) **asset CC0 Poly Haven** (parquet, marble, plaster, grass, fabric normal, HDRI kloofendal) → WebP qua `tools/blender/convert_assets.py`, `CREDITS.md` + `content/credits.ts`; (3) texture **1K / 1K / 2K** đúng HLD 7.3 (2K tải khi chọn Cao, có thông báo); (4) mức Cao **2 đèn bóng đổ** (nắng + đèn rọi ở chóa gần nhất, map 2048); (5) sảnh có **sơ đồ bảo tàng + bảng "Về giáo trình"**, menu đủ: Hướng dẫn (SCR-04, tự mở lần đầu), Nguồn & giấy phép (SCR-14), Xem màn hoàn thành, Xóa tiến độ (MSG-18), cài đặt thêm độ nhạy + đảo trục. Tải ban đầu ~3,3 MB. 51 unit test xanh; thử trên trình duyệt: các khu, mức Cao (2K + đèn rọi), menu, xóa tiến độ giữ cài đặt, hướng dẫn lần đầu. Còn để M4: âm lượng, nhân vật, ngày/đêm, minimap; M5: màn tải/mở đầu (SCR-01/02), cảm ứng.
- 2026-10-06 — M3 đã commit + đẩy (`feature/m3-graphics`, `2bd0f9e`); chưa merge `main` — chờ anh Duy nghiệm thu GATE-4 phạm vi M3. M4 cắt nhánh `feature/m4-interactive` từ M3.
- 2026-10-06 — M4: (1) **13 hiện vật 🎛** (`src/exhibits/interactive/<id>.ts`, khung `base.ts`: máy trạng thái FR-14 Sẵn sàng → Đang thao tác → Hoàn thành, sân khấu canvas trong bảng SCR-08, điều khiển bằng nút/thanh trượt HTML dùng được bằng bàn phím, "Xem giải thích luôn", "Làm lại"); kịch bản kiểm thử trên trình duyệt: cả 13 đạt điều kiện hoàn thành đúng bảng FR-14. (2) **Ngày/đêm** (N / nút ☀☾, 1,5 s, lưu `settings.night`): lightmap đêm bake riêng (chỉ đèn + trăng) trộn trong shader; trời, IBL, sương đổi theo; nắng yếu khi ở trong nhà. **Pháo hoa** `Points` trên khuôn viên, mật độ 25 / 60 / 100 % theo mức, không chớp toàn màn (NFR-08). (3) **Âm thanh** tổng hợp Web Audio (nhạc nền pad Am–F–C–G + nốt ngũ cung, bước chân theo mặt sàn, hiệu ứng hiện vật: sôi, bánh răng, domino, xúc xắc, chuông hoàn thành, pháo hoa); mở khóa sau thao tác đầu, dừng khi ẩn tab; nút 🔊/🔇 lưu `muted`; cài đặt âm lượng nhạc/hiệu ứng (bước 5). (4) **Bản đồ nhỏ** 160 px (112 px điện thoại) theo người chơi + **bản đồ phóng to** SCR-09 (M / bấm bản đồ): ✓ ★ ◎, mũi tên hướng; ◎ lấy từ gợi ý sai trắc nghiệm trong phiên, mất khi mở lại hiện vật (FR-17). (5) HUD đủ hàng nút FR-11 (🔊 ☀ ? ⛶ ☰), toàn màn hình FR-25. 59 unit test xanh.
- 2026-10-06 — **Cần anh Duy rà nội dung (M4):** một dòng tóm tắt cho 10 cuốn trong `a2-ke-sach` (NOI_DUNG.md chỉ có tên sách) và các câu ngắn hiện trong lúc thao tác 13 hiện vật 🎛 (`src/exhibits/interactive/*.ts`) — viết theo phần thân hiện vật, không thêm kiến thức ngoài giáo trình.
- 2026-10-06 — anh Duy nghiệm thu GATE-4 phạm vi M3–M4. Merge `feature/m4-interactive` (chứa M3) vào `main` (fast-forward `ae8b2af`), đẩy lên origin. Sang M5 trên nhánh `feature/m5-mobile`.
- 2026-10-06 — anh Duy đồng ý tải asset ngoài cho M5: 4 ảnh chân dung phạm vi công cộng (Wikimedia Commons: Mác — Mayall 1875, Ăngghen — W. Hall 1877, Lênin — P. Zhukov 1920, Hồ Chí Minh — 1946) và 2 nhân vật CC0 Quaternius (Poly Pizza: "Casual Character" nam, "Animated Woman" nữ, cùng bộ xương). File gốc ở `assets-src/` (không đẩy git); `tools/convert_portraits.py` → WebP 480 × 640 (32–74 KB); `tools/blender/prepare_characters.py` → GLB giữ idle/walk/run (~780 KB mỗi nhân vật). Đã ghi `CREDITS.md`.
- 2026-10-06 — M5 (nhánh `feature/m5-mobile`): (1) **SCR-01** màn tải theo % byte gói ban đầu (`core/loader.ts`, kích thước file đọc từ đĩa qua plugin `virtual:asset-sizes` trong `vite.config.ts` — thay `manifest.json`), mỗi file thử 3 lần cách 2 s, lỗi → MSG-02 + "Thử lại" chỉ tải file còn thiếu, MSG-03 sau 30 s; host trả HTML cho file thiếu cũng tính là lỗi; MSG-04 khi mất ngữ cảnh WebGL, quá 5 s có "Tải lại trang". (2) **SCR-02** màn mở đầu trên cảnh khuôn viên, camera bay chậm; "Bắt đầu" / "Tiếp tục tham quan →" + "Đã khám phá N/63"; người chơi cũ vào ở sảnh. (3) **FR-02 / SCR-03** chọn Nam/Nữ, đổi thẻ là đổi mô hình ngay; đổi lại trong Cài đặt; hoạt ảnh idle/walk/run cross-fade 0,2 s. (4) **FR-06** cảm ứng: joystick nửa trái (> 60% bán kính = chạy), kéo nửa phải xoay camera, chụm 2 ngón zoom, theo từng ngón nên đi + xoay cùng lúc; nút "Xem" 64 px; **SCR-15** gợi ý xoay ngang. (5) **FR-13 2c** ảnh chân dung + dòng nguồn ảnh trong bảng hiện vật và trên pano 3D; điện thoại: bảng 60% dưới có tay kéo mở toàn màn; HUD thu gọn khi cầm ngang. (6) FR-26 thêm phần asset: ảnh hiện vật phải tồn tại, mọi file trong `img/`, `characters/` phải có trong `CREDITS.md`. CSP thêm `connect-src blob:`. 69 unit test xanh; build OK. Gói tải ban đầu ~3,8 MB asset + ~0,4 MB JS nén (NFR-03 ≤ 15 MB). Thử trên trình duyệt: luồng mới (mở đầu → chọn Nữ → hướng dẫn → chơi, tải lại vẫn Nữ và "Tiếp tục"), lỗi tải (giấu `sky.webp` → MSG-02 sau ~5 s → trả file, "Thử lại" chỉ tải lại đúng file đó), mất/khôi phục ngữ cảnh, 375 × 812 (gợi ý xoay, bảng 60% + mở rộng), 812 × 375 (joystick + xoay đồng thời, nhấc ngón là dừng, nút Xem mở chân dung), đổi nhân vật trong Cài đặt.
- 2026-10-06 — **Còn lại sau M5 / cần làm trên máy thật:** đo FPS NFR-01 (Iris Xe) và NFR-02 (Android tầm trung), thử Safari iOS (NFR-05) — đưa vào test-report; tốc độ hoạt ảnh bước chân (`TIME_SCALE` trong `player/character.ts`) mới chỉnh ước lượng, cần xem bằng mắt khi chơi thật.
- 2026-10-06 — anh Duy nghiệm thu GATE-4 phạm vi M5. Merge `feature/m5-mobile` vào `main` (fast-forward `9f0b780`). Chuyển sang kiểm thử (tester, B4).
- 2026-10-06 — Tester viết `docs/qa/test-plan.md`, `docs/qa/test-cases.md` (124 TC, 27/27 FR) và chạy vòng 1 trên Chrome (khung Browser) + build: 107 Pass, 7 Fail, 10 Blocked; 69 unit test xanh, `npm audit --omit=dev` 0 lỗ hổng, gói tải ban đầu 4,6 MB. `docs/qa/test-report.md` ghi 5 lỗi: **BUG-01 Major** chưa có popup vào phòng (FR-09/SCR-06), **BUG-02 Major** chưa có khung xoay mô hình 🧊 (FR-13 2a, 23 hiện vật), BUG-03 Minor phím M không thu nhỏ bản đồ, BUG-04 Minor ẩn tab không mở menu khi chưa khóa con trỏ (FR-21 b), BUG-05 Minor ghi cài đặt lỗi không báo MSG-11. Blocked chủ yếu do cần máy thật (NFR-01/02/04/05) — checklist ở test-plan mục 4.
- 2026-10-06 — anh Duy cho sửa 5 lỗi. Nhánh `fix/qa-round1` (cắt từ `main`): BUG-01 `ui/roomPopup.ts` (SCR-06 + phòng ôn tập, MSG-05 khi vào lại, "Quay lại" lùi 1 m); BUG-02 mô hình 🧊 thành mesh riêng (`world/geometry.ts` `ModelPart`, `world/blockout.ts` `models`) + `exhibits/viewer.ts` (kéo trên khung 3D để xoay, dọc ±30°, "Đặt lại góc", đóng bảng thì trả góc cũ; `scripts/bake-scene.ts` vẫn xuất mô hình làm vật đổ bóng); BUG-03 phím M đóng bản đồ không bị mở lại (`preventDefault` + kiểm `defaultPrevented`); BUG-04 `visibilitychange` mở menu tạm dừng; BUG-05 `kv.onFail` báo MSG-11 cho mọi lỗi đọc/ghi. LLD cập nhật dòng `exhibits/viewer.ts`. 72 unit test xanh, build OK. Tester chạy vòng 2: 115 Pass, 0 Fail, 9 Blocked (máy thật, toàn màn hình, ảnh lỗi) → test-report DONE. Mô hình 🧊 vẫn là khối đa diện tượng trưng theo màu khu (chưa có mô hình riêng từng hiện vật).
