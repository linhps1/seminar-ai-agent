# Seminar: AI Agent cho PM · BA · QC · QA

Trang trình bày tĩnh (HTML + CSS + JS thuần, không build, không backend). Mỗi section = 1 màn hình (100vh), presenter cuộn từ trên xuống.

- Chạy local: mở `index.html` bằng Chrome. Font: Be Vietnam Pro (Google Fonts, cần mạng; hiển thị chuẩn tiếng Việt có dấu).
- Host GitHub Pages: đẩy thư mục này lên repo (branch `main`, root), bật Pages; `CNAME` = `seminar-ai-agent.linhps.dev`
  → DNS: `CNAME seminar-ai-agent -> <username>.github.io`.
- File: `index.html` (nội dung 16 màn), `assets/style.css` (theme SmartOSC + màn 1–5), `assets/sections.css` (màn 6–13), `assets/sections2.css` (kiến trúc, ví dụ, demo, cloud), `assets/sections3.css` (chỉnh theo feedback),
  `assets/app.js` (tương tác), `assets/smartosc-logo.png`.
- Mở thẳng 1 màn: `index.html?go=s-demo` (cuộn tới) hoặc `?only=s-demo` (chỉ hiện 1 màn, dùng để kiểm tra bố cục).
  Id: s-hero, s-spirit, s-demo, s-memory, s-foryou, s-history, s-mindset, s-context, s-arch, s-n8n, s-tree, s-prompt, s-new, s-live, s-cloud, s-end.
- Đã kiểm tra bố cục ở 1903×905 (Full HD, Chrome không F11, trừ taskbar/thanh địa chỉ/bookmark/thanh cuộn).
- Điều khiển khi present: **↓ / PageDown** sang đúng mép trên màn kế tiếp, **↑ / PageUp** về màn trước (đang ở giữa một màn
  thì ↑ về mép trên chính màn đó). Sau khi kéo thanh giờ ở màn cloud, phím mũi tên tự trả lại cho điều hướng.

## Publish (đã setup 16/10/2026)
- Repo public: https://github.com/linhps1/seminar-ai-agent · GitHub Pages: branch `main`, root, custom domain
  `seminar-ai-agent.linhps.dev` (DNS ở Cloudflare: CNAME `seminar-ai-agent` -> `linhps1.github.io`, DNS only).
- Bản gốc chỉnh sửa ở `temp/seminar-ai-agent` (repo pm-ai). Publish: copy sang repo riêng `C:/Personal Files/seminar-ai-agent`
  (remote `git@github.com-linhps1-ai-pm:linhps1/seminar-ai-agent.git`, SSH key tài khoản linhps1) → commit → push; Pages tự build.
- GitHub CLI cài ở `C:/Program Files/GitHub CLI/gh.exe`, đã `gh auth login` bằng tài khoản linhps1 (máy linhps-desktop).
