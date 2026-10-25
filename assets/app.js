/* Seminar AI Agent — interactions (vanilla JS, no build step, no backend) */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NS = 'http://www.w3.org/2000/svg';

/* ---------- brand bar on every slide ---------- */
const slides = $$('.slide');
slides.forEach((s) => s.insertAdjacentHTML('afterbegin', '<div class="brandbar"><img src="assets/smartosc-logo.png" alt="SmartOSC"><span>AI Agent cho PM · BA · QC · QA</span></div>'));

/* ---------- progress bar + section nav (joined vertical bars, short label beside each) ---------- */
const dots = $('#dots');
slides.forEach((s) => { const a = document.createElement('a'); a.href = '#' + s.id; a.innerHTML = `<span>${s.dataset.title}</span><em>${slides.indexOf(s) + 1}</em><i></i>`; dots.appendChild(a); });
const dotLinks = $$('a', dots);
const onScroll = () => {
  const h = document.documentElement;
  $('#progressBar').style.width = (100 * h.scrollTop) / (h.scrollHeight - h.clientHeight || 1) + '%';
  const mid = h.scrollTop + innerHeight / 2;
  const cur = slides.findIndex((s) => mid >= s.offsetTop && mid < s.offsetTop + s.offsetHeight);
  dotLinks.forEach((a, i) => { a.classList.toggle('on', i === cur); a.classList.toggle('past', i < cur); });
};
addEventListener('scroll', onScroll, { passive: true });

/* ---------- 1. hero: network background ---------- */
(() => {
  const c = $('#net'), x = c.getContext('2d'), R = devicePixelRatio;
  let W, H, pts = [], mouse = { x: -999, y: -999 };
  const resize = () => {
    W = c.width = c.offsetWidth * R; H = c.height = c.offsetHeight * R;
    pts = Array.from({ length: Math.round((W * H) / 26000 / R) }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 2 + 1, g: Math.random() < .25 }));
  };
  c.parentElement.addEventListener('mousemove', (e) => { const b = c.getBoundingClientRect(); mouse = { x: (e.clientX - b.left) * R, y: (e.clientY - b.top) * R }; });
  c.parentElement.addEventListener('mouseleave', () => (mouse = { x: -999, y: -999 }));
  const D = 150 * R;
  const tick = () => {
    x.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
      if (Math.hypot(p.x - mouse.x, p.y - mouse.y) < D * 1.4) { p.x += (mouse.x - p.x) * .006; p.y += (mouse.y - p.y) * .006; }
    }
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < D) { x.strokeStyle = `rgba(47,82,160,${(1 - d / D) * .16})`; x.lineWidth = R; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke(); }
    }
    for (const p of pts) { const near = Math.hypot(p.x - mouse.x, p.y - mouse.y) < D; x.fillStyle = p.g || near ? 'rgba(90,181,90,.75)' : 'rgba(109,158,235,.5)'; x.beginPath(); x.arc(p.x, p.y, p.r * R * (near ? 1.6 : 1), 0, 7); x.fill(); }
    requestAnimationFrame(tick);
  };
  addEventListener('resize', resize); resize(); tick();
})();

/* ---------- 1. hero: role picker ---------- */
const ROLES = {
  // 4 most common daily tasks per role, close to a real web-revamp project (UAT, BRD sign-off, test cases, audit)
  pm: { t: 'Project Manager', pains: [['Đọc email, chat mỗi sáng', 'khách hàng, nội bộ, Jira: việc gì mới, ai đang chờ mình'], ['Báo cáo tiến độ', 'daily UAT report, weekly report, MOM sau mỗi buổi họp'], ['Cập nhật kế hoạch', 'timeline, open items tracker, sign-off tài liệu'], ['Điều phối và nhắc việc', 'daily meeting, deadline, rủi ro, trả lời khách']],
    gain: 'Một "đồng nghiệp AI" tự đọc email, chat, Jira của dự án và soạn sẵn report, MOM, email để bạn chỉ việc review.' },
  ba: { t: 'Business Analyst', pains: [['Viết và sửa BRD', 'qua nhiều vòng comment của khách đến khi sign-off'], ['Tìm lại "khách đã chốt gì"', 'trong email, chat, MOM, transcript họp'], ['Làm rõ requirement', 'trả lời câu hỏi của Dev, QC, Designer'], ['Giữ tài liệu khớp nhau', 'BRD, Figma, Jira, test case không lệch nhau']],
    gain: 'AI nhớ mọi quyết định đã chốt, tự đối chiếu BRD với email, chat và chỉ ra chỗ còn thiếu hoặc mâu thuẫn.' },
  qc: { t: 'Quality Control', pains: [['Viết test case', 'từ BRD và Figma, đúng template khách yêu cầu'], ['Cập nhật test case', 'mỗi khi BRD hoặc design thay đổi'], ['Test SIT, log bug', 'đủ bước, đủ evidence, link đúng ticket Jira'], ['Theo dõi UAT', 'import test case lên Jira, triage bug cùng khách']],
    gain: 'Test case được viết từ BRD cùng mọi thay đổi đã chốt, đúng template, và được cập nhật khi yêu cầu đổi.' },
  qa: { t: 'Quality Assurance', pains: [['Rà quy trình dự án', 'có đi đúng quy trình SmartOSC không'], ['Gom evidence', 'sign-off, approval rải rác trong email, Zoho, Drive'], ['Theo dõi NC', 'nhắc dự án đóng non-conformity đúng hạn'], ['Báo cáo chất lượng', 'số liệu cho audit và báo cáo hằng tháng']],
    gain: 'AI rà quy trình, gom evidence và lập checklist audit từ chính dữ liệu thật của dự án.' },
};
const showRole = (k) => {
  const r = ROLES[k];
  $$('#roles button').forEach((b) => b.classList.toggle('on', b.dataset.role === k));
  $('#roleTitle').innerHTML = `Dành cho bạn, <strong>${r.t}</strong>`;
  $('#rolePains').innerHTML = r.pains.map(([h, s], i) => `<li style="animation-delay:${i * 80}ms"><em class="task-no">${i + 1}</em><b>${h}</b><span>${s}</span></li>`).join('');
  $('#roleGain').textContent = r.gain;
};
// hover only highlights (CSS); the content changes on click
$$('#roles button').forEach((b) => b.addEventListener('click', () => showRole(b.dataset.role)));
showRole('pm');

/* ---------- 2. spirit: flip cards + raise hand (no counter: nothing is synced) ---------- */
(() => {
  const msgs = ['Không có câu hỏi nào là "ngớ ngẩn" cả.', 'Bạn đang làm khác? Kể cho mọi người nghe với.', 'Hỏi càng nhiều, buổi này càng đúng với bạn.', 'Phản biện cũng rất được hoan nghênh.'];
  let n = 0;
  $('#handBtn').addEventListener('click', (e) => { n++; $('#handMsg').textContent = msgs[n % msgs.length]; const b = e.currentTarget; b.classList.remove('wave'); void b.offsetWidth; b.classList.add('wave'); });
  $$('.flip').forEach((f) => { f.addEventListener('click', () => f.classList.toggle('done')); f.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f.classList.toggle('done'); } }); });
})();

/* ---------- 3. demo: using AI (copilot style) on one task, 3 examples across teams (next / back, presenter-paced) ---------- */
(() => {
  const body = $('#chatBody'), svg = $('#courierSvg'), links = $('#links'), packets = $('#packets');
  const YOU = { x: 190, y: 154 };
  $$('.src', svg).forEach((g) => {
    const y = +$('rect', g).getAttribute('y') + 20, l = document.createElementNS(NS, 'line');
    Object.entries({ x1: 128, y1: y, x2: YOU.x, y2: YOU.y, class: 'lk', 'data-src': g.dataset.src }).forEach(([k, v]) => l.setAttribute(k, v));
    links.appendChild(l);
  });
  const tag = (ok, t) => `<span class="tag ${ok ? 'ok' : ''}">${t}</span>`;
  // rows: { k, ok: [cells] } or { k, bad: [cells], fix: [cells], why, at } (fixed from AI answer number `at`)
  const table = (D, f) => `<table class="tc"><tr>${D.head.map((h) => `<th>${h}</th>`).join('')}<th></th></tr>` + D.rows.map((r) => {
    if (!r.bad) return `<tr><td>${r.k}</td>${r.ok.map((c) => `<td>${c}</td>`).join('')}<td>${tag(1, 'OK')}</td></tr>`;
    const done = f >= r.at;
    return `<tr class="${done ? 'fix' : 'bad'}"><td>${r.k}</td>${(done ? r.fix : r.bad).map((c) => `<td>${c}</td>`).join('')}<td>${done ? tag(1, 'Đã sửa') : tag(0, r.why)}</td></tr>`;
  }).join('') + '</table>';
  const INTRO = 'AI viết rất nhanh. Nhưng thông tin của dự án lại nằm rải rác ở nhiều nơi mà AI không tự nhìn thấy.';
  const SC = [
    { head: ['Mục', 'Nội dung'], rows: [
      { k: 'Tiến độ', ok: ['Đúng kế hoạch, hoàn thành 70%'] },
      { k: 'Lịch UAT', bad: ['Bắt đầu 26/10'], fix: ['Dời sang 02/11'], why: 'Sai: KH đã dời qua email', at: 1 },
      { k: 'Phạm vi', bad: ['12 tính năng trong Drop 1'], fix: ['11 tính năng, Search sang Drop 2'], why: 'Sai: email đã chốt', at: 1 },
      { k: 'Rủi ro', bad: ['Không có rủi ro lớn'], fix: ['Môi trường test lỗi, 2 bug blocker'], why: 'Thiếu: Dev báo trong chat', at: 2 } ],
    steps: [
      { who: 'me', src: ['tpl', 'brd'], paste: 2, min: 5, html: '<span class="att"><i></i>Weekly_Report_Template.pptx</span><span class="att doc"><i></i>Project_Plan_v3.xlsx</span><br>Soạn weekly report tuần này gửi khách, dựa trên template và kế hoạch đính kèm nhé.' },
      { who: 'ai', min: 3, html: 'Đã soạn <b>weekly report</b> theo template. Một vài nội dung:', t: 0, insight: 'Nhìn qua thì ổn. Nhưng AI chỉ biết những gì nằm trong file kế hoạch.' },
      { who: 'note', html: 'Bạn chợt nhớ: thứ Ba <b>khách hàng đã chốt qua email</b> vài thay đổi…' },
      { who: 'me', src: ['mail'], paste: 1, loop: 1, min: 9, html: 'Bổ sung giúp mình, khách đã chốt trong email:<span class="paste">"…UAT dời sang 02/11, tính năng Search chuyển sang Drop 2…" (copy từ Outlook)</span>' },
      { who: 'ai', min: 3, html: 'Đã cập nhật theo email:', t: 1 },
      { who: 'me', src: ['chat'], paste: 1, loop: 1, min: 9, html: 'À còn nữa, Dev vừa báo trong group chat:<span class="paste">"Môi trường test đang lỗi, còn 2 bug blocker chưa fix" (copy từ Google Chat)</span>' },
      { who: 'ai', min: 3, html: 'Đã sửa xong:', t: 2, insight: 'Nội dung đã đúng hơn. Nhưng số liệu và trình bày thì sao?' },
      { who: 'note', src: ['jira'], min: 25, final: true, html: 'Bạn mở file ra và phát hiện: <b>số ticket chưa khớp Jira, slide sai format báo cáo của công ty</b>.<br>"Thôi, phần còn lại mình <b>sửa tay</b> cho nhanh."' },
    ] },
    { head: ['Mục', 'Nội dung'], rows: [
      { k: '1. Mục tiêu', ok: ['Học viên đăng ký khoá học online'] },
      { k: '3.2 Thanh toán', bad: ['Thẻ và ví điện tử'], fix: ['Chỉ thanh toán thẻ ở Drop 1'], why: 'Sai: KH chốt qua email', at: 1 },
      { k: '3.4 Huỷ đăng ký', bad: ['Trước 24 giờ'], fix: ['Trước 72 giờ'], why: 'Sai: email chốt 72 giờ', at: 1 },
      { k: '3.5 Thông báo', bad: ['Gửi SMS xác nhận'], fix: ['Gửi email xác nhận'], why: 'Thừa: team đã bỏ SMS', at: 2 } ],
    steps: [
      { who: 'me', src: ['tpl', 'brd'], paste: 2, min: 5, html: '<span class="att"><i></i>BRD_Template.docx</span><span class="att doc"><i></i>MOM_Kickoff.docx</span><br>Viết BRD cho tính năng Đăng ký khoá học, dựa trên template và MOM buổi kickoff nhé.' },
      { who: 'ai', min: 3, html: 'Đã viết <b>BRD v0.1</b> theo template. Một vài mục:', t: 0, insight: 'Nhìn qua thì ổn. Nhưng AI chỉ biết những gì nằm trong MOM.' },
      { who: 'note', html: 'Bạn chợt nhớ: tuần trước <b>khách hàng đã chốt qua email</b> vài điểm khác MOM…' },
      { who: 'me', src: ['mail'], paste: 1, loop: 1, min: 9, html: 'Bổ sung giúp mình, khách đã chốt trong email:<span class="paste">"…Drop 1 chỉ nhận thanh toán thẻ, cho phép huỷ trước 72 giờ…" (copy từ Outlook)</span>' },
      { who: 'ai', min: 3, html: 'Đã cập nhật theo email:', t: 1 },
      { who: 'me', src: ['chat'], paste: 1, loop: 1, min: 9, html: 'À còn nữa, team vừa nhắn trong group chat:<span class="paste">"Bỏ SMS nha, khách chưa có SMS gateway" (copy từ Google Chat)</span>' },
      { who: 'ai', min: 3, html: 'Đã sửa xong:', t: 2, insight: 'Nội dung đã đúng hơn. Nhưng còn phần trình bày thì sao?' },
      { who: 'note', src: ['jira'], min: 25, final: true, html: 'Bạn mở file ra và phát hiện: <b>BRD chưa link ticket Jira, thiếu bảng lịch sử phiên bản theo mẫu khách hàng</b>.<br>"Thôi, phần còn lại mình <b>sửa tay</b> cho nhanh."' },
    ] },
    { head: ['ID', 'Tình huống', 'Kết quả mong đợi'], rows: [
      { k: 'TC-HOM-01', ok: ['Hiển thị banner đầu trang', 'Banner hiện đủ ảnh, tiêu đề, CTA'] },
      { k: 'TC-HOM-02', bad: ['Thêm 10 slide', 'Lưu thành công'], fix: ['Thêm slide thứ 6', 'Báo lỗi: tối đa 5 slide'], why: 'Sai: KH chốt tối đa 5', at: 1 },
      { k: 'TC-HOM-03', bad: ['Tự chuyển slide', 'Sau 3 giây'], fix: ['Tự chuyển slide', 'Sau 6 giây'], why: 'Sai: email chốt 6 giây', at: 1 },
      { k: 'TC-HOM-04', bad: ['Mở cửa sổ Omnichat', 'Chat bubble hiện góc phải'], fix: ['Nút "Explore All"', 'Mở trang danh mục'], why: 'Thừa: đã bỏ khỏi Wave 1', at: 2 } ],
    steps: [
      { who: 'me', src: ['tpl', 'brd'], paste: 2, min: 5, html: '<span class="att"><i></i>TC_Template.xlsx</span><span class="att doc"><i></i>BRD_Homepage_v1.0.docx</span><br>Viết test case cho tính năng Hero Banner dựa trên BRD và template đính kèm nhé.' },
      { who: 'ai', min: 3, html: 'Đã tạo <b>24 test case</b> theo template. Một vài ví dụ:', t: 0, insight: 'Nhìn qua thì ổn. Nhưng AI chỉ biết những gì nằm trong BRD.' },
      { who: 'note', html: 'Bạn chợt nhớ: tuần trước <b>khách hàng đã chốt qua email</b> vài điểm khác BRD…' },
      { who: 'me', src: ['mail'], paste: 1, loop: 1, min: 9, html: 'Bổ sung giúp mình, khách đã chốt trong email:<span class="paste">"…banner tối đa 5 slide, tự động chuyển sau 6 giây…" (copy từ Outlook)</span>' },
      { who: 'ai', min: 3, html: 'Đã cập nhật theo email:', t: 1 },
      { who: 'me', src: ['chat'], paste: 1, loop: 1, min: 9, html: 'À còn nữa, BA vừa nhắn trong group chat:<span class="paste">"Bỏ Omnichat khỏi Wave 1 nha, thêm case nút Explore All" (copy từ Google Chat)</span>' },
      { who: 'ai', min: 3, html: 'Đã sửa xong:', t: 2, insight: 'Nội dung đã đúng hơn. Nhưng còn phần trình bày thì sao?' },
      { who: 'note', src: ['jira'], min: 25, final: true, html: 'Bạn mở file ra và phát hiện: <b>file chưa trình bày đúng mẫu khách hàng yêu cầu, thiếu phần chữ ký</b>.<br>"Thôi, phần còn lại mình <b>sửa tay</b> cho nhanh."' },
    ] },
  ];
  let sc = 0, STEPS = SC[0].steps;
  const html = (st) => st.html + (st.t != null ? table(SC[sc], st.t) : '');
  let i = 0, busy = false;
  const fly = async (src) => {
    const g = $(`.src[data-src="${src}"]`, svg), y0 = +$('rect', g).getAttribute('y') + 20;
    g.classList.add('lit'); $(`.lk[data-src="${src}"]`, links).classList.add('on');
    const p = document.createElementNS(NS, 'circle'); p.setAttribute('r', 6); p.setAttribute('class', 'pk'); packets.appendChild(p);
    const path = [[128, y0], [YOU.x, YOU.y], [316, 154]];
    for (let s = 0; s < 2; s++) for (let t = 0; t <= 1; t += .05) { p.setAttribute('cx', path[s][0] + (path[s + 1][0] - path[s][0]) * t); p.setAttribute('cy', path[s][1] + (path[s + 1][1] - path[s][1]) * t); await sleep(16); }
    p.remove(); g.classList.remove('lit'); g.classList.add('used');
  };
  // rebuild the state for step n (so "back" works); animate only the newest step when going forward
  const render = async (n, animate) => {
    body.innerHTML = n ? '' : '<div class="chat-empty">Bấm <b>Bước tiếp theo</b> để bắt đầu.</div>';
    $$('.src', svg).forEach((g) => g.classList.remove('lit', 'used')); $$('.lk', links).forEach((l) => l.classList.remove('on'));
    let paste = 0, loop = 0, min = 0, insight = INTRO, warn = false;
    for (let k = 0; k < n; k++) {
      const st = STEPS[k], last = k === n - 1;
      if (last && animate && st.who === 'ai') { const t = document.createElement('div'); t.className = 'msg ai typing'; t.innerHTML = '<span></span><span></span><span></span>'; body.appendChild(t); body.scrollTop = body.scrollHeight; await sleep(800); t.remove(); }
      const m = document.createElement('div'); m.className = 'msg ' + st.who; if (!(last && animate)) m.style.animation = 'none'; m.innerHTML = html(st); body.appendChild(m);
      paste += st.paste || 0; loop += st.loop || 0; min += st.min || 0;
      if (st.insight) insight = st.insight;
      if (st.final) warn = true;
      (st.src || []).forEach((s) => { if (!(last && animate && st.who === 'me')) { $(`.src[data-src="${s}"]`, svg).classList.add(st.who === 'ai' ? 'lit' : 'used'); $(`.lk[data-src="${s}"]`, links).classList.add('on'); } });
    }
    body.scrollTop = body.scrollHeight;
    $('#stPaste').textContent = paste; $('#stLoop').textContent = loop; $('#stMin').textContent = min + "'"; $('#stepLabel').textContent = `Bước ${n} / ${STEPS.length}`;
    const ins = $('#demoInsight'); ins.classList.toggle('warn', warn);
    ins.innerHTML = warn ? '<b>Bạn đang làm "người vận chuyển ngữ cảnh".</b> AI không thiếu thông minh, AI thiếu ngữ cảnh của dự án.' : insight;
    $('#demoPrev').disabled = n === 0; $('#demoNext').disabled = n === STEPS.length;
    const st = STEPS[n - 1];
    if (animate && st && st.who === 'me' && st.src) await Promise.all(st.src.map((s, k) => sleep(k * 250).then(() => fly(s))));
  };
  $('#demoNext').addEventListener('click', async () => { if (busy || i >= STEPS.length) return; busy = true; i++; await render(i, true); busy = false; });
  $('#demoPrev').addEventListener('click', async () => { if (busy || i === 0) return; busy = true; i--; await render(i, false); busy = false; });
  $$('#demoTabs button').forEach((b) => b.addEventListener('click', () => {
    if (busy) return; sc = +b.dataset.s; STEPS = SC[sc].steps; i = 0;
    $$('#demoTabs button').forEach((x) => x.classList.toggle('on', x === b)); render(0, false);
  }));
  render(0, false);
})();

/* ---------- 4. memory: switching Claude account vs. opening another chat in the same account ---------- */
(() => {
  const items = $$('#memList li'), brain = $('.brain');
  // items: 0 yesterday's chat (context window), 1 chat history, 2 Project, 3 Memory, 4 settings, 5 connectors
  const LOST_AI = 'Xin chào! Mình là Claude. Bạn có thể cho mình biết <b>bộ test case Homepage</b> là gì, template ra sao, và hôm qua đã làm tới đâu không?';
  const ACC = 'Tài khoản này <b>không thấy gì</b> của tài khoản cũ: lịch sử chat, Project, Memory, cài đặt, connectors đều ở lại bên kia.<br>Bạn lại bắt đầu dán template, BRD, email, chat… từ đầu.';
  const CTX = [
    { keep: [0, 1, 2, 3, 4, 5], pct: 100, ai: 'Ok, tiếp tục nhé. Mình nhớ là còn <b>3 case negative cho banner</b> chưa viết, theo đúng template và quy ước ID của dự án.' },
    { keep: [], pct: 0, ai: LOST_AI, why: ACC, redo: 'đổi sang tài khoản của dự án' },
    { keep: [], pct: 0, ai: LOST_AI, why: ACC, redo: 'đổi sang tài khoản cá nhân' },
    { keep: [3, 4, 5], pct: 10, ai: 'Mình nhớ bạn là QC, đang làm dự án ABC. Nhưng mình <b>không có template, BRD, hay những gì hôm qua đã làm</b>. Bạn gửi lại giúp mình nhé?',
      why: 'Cùng tài khoản nhưng chat mới là <b>một context window mới</b>: chỉ còn vài dòng Memory (bạn là ai, làm dự án nào, thích trình bày ra sao) và cài đặt.<br>File, template, BRD, những gì đã chốt và đã làm ở chat cũ đều không tự sang.', redo: 'mở chat mới' },
  ];
  let timer;
  const set = (ctx) => {
    const C = CTX[ctx];
    $$('#memTabs button').forEach((b) => b.classList.toggle('on', +b.dataset.ctx === ctx));
    brain.classList.toggle('lost', C.pct === 0); brain.classList.toggle('part', C.pct > 0 && C.pct < 100);
    items.forEach((li, k) => setTimeout(() => li.classList.toggle('gone', !C.keep.includes(k)), C.keep.includes(k) ? 0 : k * 120));
    $('#memBar').style.width = Math.max(C.pct, 3) + '%';
    clearInterval(timer);
    const pctEl = $('#memPct'); let v = parseInt(pctEl.textContent, 10); const to = C.pct;
    timer = setInterval(() => { v += v < to ? 5 : -5; if (Math.abs(v - to) < 5) { v = to; clearInterval(timer); } pctEl.textContent = v + '%'; }, 30);
    $('#aiGreet').innerHTML = C.ai;
    $('#stranger').classList.toggle('show', C.pct < 100);
    if (C.why) { $('#strangerText').innerHTML = C.why; $('#redoWhy').textContent = C.redo; }
      };
  $$('#memTabs button').forEach((b) => b.addEventListener('click', () => set(+b.dataset.ctx)));
  set(0);
})();

/* ---------- 4b. forget: a long session fills the context window, auto-compact drops the file details (next / back) ---------- */
(() => {
  // segments of the context window: key, label, size (%), style
  const SEG = [['brd', 'BRD_v1.2.pdf · 80 trang', 34, 'file'], ['tpl', 'Template + hướng dẫn', 9, 'file'], ['talk', '5 giờ hỏi đáp, sửa đi sửa lại', 27, 'talk'],
    ['paste', 'Email, chat, log dán thêm', 18, 'paste'], ['more', 'Thêm vài câu hỏi nữa', 9, 'talk'], ['sum', 'Bản tóm tắt cuộc trò chuyện', 14, 'sum'], ['ask', 'Câu hỏi mới', 3, 'talk']];
  const STEPS = [
    { seg: ['brd', 'tpl'], why: [0, 3], msgs: [['me', '<span class="att doc"><i></i>BRD_v1.2.pdf · 80 trang</span><span class="att"><i></i>Template.docx</span><br>Đọc kỹ BRD này nhé, lát mình hỏi chi tiết.'], ['ai', 'Đã đọc BRD và template. Bạn cần gì nào?']] },
    { seg: ['talk'], why: [0], msgs: [['note', '09:00 → 14:00 · hàng chục lượt hỏi đáp, sửa đi sửa lại']] },
    { seg: ['paste'], why: [0], msgs: [['me', 'Mình dán thêm luồng email khách và log chat để bạn đối chiếu nhé.<span class="paste">(3 luồng email · 120 tin nhắn chat · log lỗi)</span>']] },
    { seg: ['more'], why: [0], warn: true, msgs: [['note', 'Bộ nhớ ngắn hạn <b>gần đầy</b>']] },
    { compact: true, why: [1], msgs: [['note', 'Claude <b>tự động nén</b> cuộc trò chuyện (auto-compact) để có chỗ làm tiếp']] },
    { seg: ['ask'], why: [1, 2], final: true, msgs: [['me', 'Theo BRD mục 4.3, banner được tối đa mấy slide nhỉ?'], ['ai', 'Mình chỉ còn <b>bản tóm tắt</b> của BRD, không còn nội dung chi tiết mục 4.3. Bạn <b>gửi lại file</b> và nhắc lại giúp mình bối cảnh nhé?']] },
  ];
  const jar = $('#fgJar'), body = $('#fgBody'), cards = $$('#fgWhy > div');
  jar.innerHTML = SEG.map(([k, l, , c]) => `<div class="seg ${c}" data-k="${k}"><span>${l}</span></div>`).join('');
  let i = 0;
  const render = (n, animate) => {
    const on = new Set(); let compact = false;
    for (let k = 0; k < n; k++) { (STEPS[k].seg || []).forEach((s) => on.add(s)); if (STEPS[k].compact) compact = true; }
    if (compact) { ['brd', 'tpl', 'talk', 'paste', 'more'].forEach((s) => on.delete(s)); on.add('sum'); }
    let pct = 0;
    SEG.forEach(([k, , size]) => { const el = $(`.seg[data-k="${k}"]`, jar), show = on.has(k); el.style.height = show ? size + '%' : '0'; el.classList.toggle('on', show); if (show) pct += size; });
    jar.classList.toggle('full', pct >= 95);
    $('#fgPct').textContent = pct + '%';
    body.innerHTML = n ? '' : '<div class="chat-empty">Bấm <b>Tiếp tục</b> để bắt đầu một ngày làm việc dài.</div>';
    STEPS.slice(0, n).forEach((st, k) => st.msgs.forEach(([who, h]) => { const m = document.createElement('div'); m.className = 'msg ' + who; if (!(animate && k === n - 1)) m.style.animation = 'none'; m.innerHTML = h; body.appendChild(m); }));
    body.scrollTop = body.scrollHeight;
    const st = STEPS[n - 1], why = st ? st.why : [];
    cards.forEach((c, k) => c.classList.toggle('on', why.includes(k)));
    const fix = $('#fgFix'), done = st && st.final;
    fix.classList.toggle('warn', !done);
    fix.innerHTML = done ? '<b>Cách chữa:</b> đừng để kiến thức chỉ nằm trong cuộc trò chuyện. Lưu file, quyết định, quy ước vào <b>Folder AI</b>: AI tự đọc lại bất cứ lúc nào, ở phiên nào, máy nào.'
      : 'AI không "lười" hay "đãng trí". Nó chỉ có một bộ nhớ ngắn hạn <b>có giới hạn</b>, và bạn đang lấp đầy nó.';
    $('#fgLabel').textContent = `Bước ${n} / ${STEPS.length}`;
    $('#fgPrev').disabled = n === 0; $('#fgNext').disabled = n === STEPS.length;
  };
  $('#fgNext').addEventListener('click', () => { if (i < STEPS.length) render(++i, true); });
  $('#fgPrev').addEventListener('click', () => { if (i > 0) render(--i, false); });
  render(0, false);
})();

/* ---------- 5. for you: self check + shift ---------- */
(() => {
  const boxes = $$('#checks input'), fg = $('#gFg'), L = 252;
  const upd = () => {
    const n = boxes.filter((b) => b.checked).length;
    $('#vNum').textContent = n; fg.style.strokeDashoffset = L - (L * n) / boxes.length;
    fg.style.stroke = n >= 3 ? '#5AB55A' : n ? '#D6811F' : '#5AB55A';
    const t = $('#vText'); t.classList.toggle('yes', n > 0);
    t.textContent = n === 0 ? 'Tích thử những câu đúng với bạn.' : n < 3 ? 'Nếu bạn đang dùng AI như vậy, thì buổi seminar này là dành cho bạn.' : 'Vậy thì buổi seminar này được thiết kế dành riêng cho bạn.';
  };
  boxes.forEach((b) => b.addEventListener('change', upd)); upd();
  $('#shiftBtn').addEventListener('click', () => $('#shift').classList.toggle('on'));
})();

/* ---------- 6. history: Assistant -> Copilot -> Agent (click an era) + METR task-length benchmark ---------- */
(() => {
  const ERAS = [
    { t: 'AI Assistant', sub: 'Trợ lý giọng nói', prod: [['Siri', '10/2011'], ['Google Now · "OK Google"', '2012 – 2013'], ['Alexa', '11/2014']],
      cap: ['Nghe lệnh bằng giọng nói', 'Làm tác vụ cài sẵn: báo thức, gọi điện, thời tiết, bật nhạc', 'Không hiểu ngữ cảnh, không làm được việc văn phòng'],
      bm: 'Chưa đo được: chỉ chạy các lệnh đã lập trình sẵn, vài giây là xong.', hot: [] },
    { t: 'AI Copilot', sub: 'Trợ lý trò chuyện: bạn hỏi, AI đáp', prod: [['GitHub Copilot', '06/2021'], ['ChatGPT', '11/2022'], ['Claude', '03/2023'], ['Microsoft 365 Copilot', '11/2023']],
      cap: ['Hiểu ngôn ngữ tự nhiên, trả lời gần như mọi câu hỏi', 'Viết, tóm tắt, dịch, gợi ý code, soạn tài liệu', 'Nhưng chỉ biết những gì bạn dán vào; bạn tự làm phần còn lại'],
      bm: 'Từ vài giây (2019) lên <b>khoảng 40 phút</b> (cuối 2024) công việc của một chuyên gia.', hot: [0, 1, 2, 3, 4, 5] },
    { t: 'AI Agent', sub: 'Nhân viên AI tự làm việc', prod: [['Claude Code', '02/2025'], ['OpenAI Codex', '05/2025'], ['ChatGPT Agent', '07/2025'], ['Claude Cowork', '01/2026']],
      cap: ['Tự điều khiển máy tính của bạn', 'Tự kết nối hệ thống thứ ba', 'Chạy 24/7, không cần nhắc', 'Tự lập kế hoạch, thực thi, kiểm tra'],
      bm: 'Từ khoảng 1 giờ (đầu 2025) lên <b>gần 5 giờ</b> (cuối 2025): cả một buổi làm việc của chuyên gia, và vẫn tăng gấp đôi khoảng mỗi 7 tháng.', hot: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
  ];
  // METR 50%-time-horizon, rounded (seconds of expert human time)
  const PTS = [['GPT-2 · 2019', 2, '~2 giây'], ['GPT-3 · 2020', 9, '~9 giây'], ['GPT-3.5 · 2022', 36, '~36 giây'], ['GPT-4 · 2023', 300, '~5 phút'],
    ['Claude 3.5 Sonnet · 2024', 1700, '~28 phút'], ['o1 · cuối 2024', 2300, '~39 phút'], ['Claude 3.7 Sonnet · 02/2025', 3500, '~1 giờ'], ['GPT-5 · 08/2025', 8200, '~2 giờ 15'], ['Claude Opus 4.5 · 11/2025', 17300, '~4 giờ 50']];
  const box = $('#growthBars'), max = Math.log10(20000);
  box.innerHTML = PTS.map(([l, s, v]) => `<div class="bar-row"><span class="bl">${l}</span><span class="bt"><i data-w="${(100 * Math.log10(s + 1)) / max}"></i></span><span class="bv">${v}</span></div>`).join('');
  const rowsEl = $$('.bar-row', box);
  const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const set = (e) => {
    const E = ERAS[e];
    $$('#eras .era').forEach((b) => b.classList.toggle('on', +b.dataset.era === e));
    $('#eraFill').style.width = ['8%', '50%', '100%'][e];
    $('#eraDetail').innerHTML = `<div class="ed-head"><b>${E.t}</b><span>${E.sub}</span></div>
      <p class="ed-k">Sản phẩm tiêu biểu</p><div class="ed-prod">${E.prod.map(([n, d]) => `<span><b>${n}</b><i>${d}</i></span>`).join('')}</div>
      <p class="ed-k">Năng lực nổi bật</p><ul class="ed-cap">${E.cap.map((c) => `<li>${CHECK}${c}</li>`).join('')}</ul>
      <p class="ed-bm"><span>Benchmark</span>${E.bm}</p>`;
    rowsEl.forEach((r, k) => { const on = E.hot.includes(k), bar = $('i', r); bar.style.width = on ? bar.dataset.w + '%' : '0'; r.classList.toggle('hot', e === 2 && k >= 6); r.style.opacity = on ? 1 : .35; });
  };
  // click only (hover just highlights the card via CSS)
  $$('#eras .era').forEach((b) => b.addEventListener('click', () => set(+b.dataset.era)));
  set(0);
})();

/* ---------- 7. mindset: one tool vs. a project member; right side = where your time goes (before / with AI Agent) ---------- */
(() => {
  // one common "tools" icon for the single-tool view
  const M = {
    tool: { h: 'AI là một công cụ đơn lẻ: búa, cuốc, xẻng, kìm…', svg: '<svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
      li: ['Mỗi công cụ làm một việc; bạn cầm từng cái, bạn làm', 'Mỗi lần dùng là bắt đầu lại từ đầu', 'Không biết gì về dự án, con người, quy trình', 'Bạn tự gom mọi thông tin rồi đưa vào', 'Kết quả "gần đúng", bạn sửa tay phần còn lại'] },
    member: { h: 'AI là một thành viên dự án', svg: '<svg viewBox="0 0 24 24"><circle cx="11" cy="7.5" r="3.5"/><path d="M4 20c1-4 3.8-6 7-6s6 2 7 6"/><path d="M16.5 10.5l1.8 1.8 3.4-3.6"/></svg>',
      li: ['Được onboard: biết người, biết việc, biết quy trình', 'Nhận việc bằng một câu, tự đi tìm thông tin cần thiết', 'Nhớ những gì đã làm, đã chốt, đã được góp ý', 'Làm việc trên máy tính và hệ thống như một nhân viên', 'Bạn giao việc, review, và chịu trách nhiệm cuối cùng'] },
  };
  const ROWS = [
    { k: 'Tổng hợp context', s: 'gom thông tin, chỉ đúng nguồn', c: 'h', v: [20, 40] },
    { k: 'Suy nghĩ giải pháp', s: 'hướng tiếp cận, hướng xử lý', c: 'h', v: [20, 40] },
    { k: 'Thực thi', s: 'viết, soạn, nhập liệu, copy · paste', c: 'w', v: [50, 0], cAfter: 'a', sAfter: 'AI làm toàn bộ, như nhân viên cấp dưới' },
    { k: 'Review và gửi đi', s: 'kiểm tra, quyết định, chịu trách nhiệm', c: 'h', v: [10, 20] },
  ];
  const CAP = ['Một nửa thời gian đi vào tự tay làm: viết, soạn, nhập liệu, copy · paste. (Tỉ lệ minh hoạ.)', 'Toàn bộ thời gian dành cho tổng hợp context, suy nghĩ và quyết định; phần thực thi do AI làm. (Tỉ lệ minh hoạ.)'];
  const box = $('#alloc');
  box.innerHTML = ROWS.map((r) => `<div class="al-row ${r.c}"><span>${r.k}<small>${r.s}</small></span><span class="bt"><i></i></span><b></b></div>`).join('');
  const prodRows = $$('#prod .prod-row');
  const set = (k) => {
    const v = k === 'member' ? 1 : 0;
    $$('#msToggle button').forEach((b) => b.classList.toggle('on', b.dataset.m === k));
    const c = $('#msCard'), d = M[k]; c.className = 'ms-card ' + k;
    c.innerHTML = `<div class="ms-svg">${d.svg}</div><h3>${d.h}</h3><ul>${d.li.map((t, i) => `<li style="animation-delay:${i * 60}ms">${t}</li>`).join('')}</ul>`;
    $('#msRightTitle').innerHTML = v ? '<b>Với AI Agent:</b> thời gian của bạn được dùng vào đâu?' : '<b>Trước đây:</b> thời gian của bạn được dùng vào đâu?';
    $$('.al-row', box).forEach((row, i) => {
      const r = ROWS[i]; row.className = 'al-row ' + (v && r.cAfter ? r.cAfter : r.c);
      $('small', row).textContent = v && r.sAfter ? r.sAfter : r.s;
      $('i', row).style.width = r.v[v] * 2 + '%'; $('b', row).textContent = r.v[v] + '%';
    });
    $('#allocCap').textContent = CAP[v];
    // productivity: x1 before, real multipliers (BA x3, Dev x5, QC x2) with AI Agent
    prodRows.forEach((r, j) => setTimeout(() => { const x = v ? +r.dataset.x : 1; $('i', r).style.width = (100 * x) / 5 + '%'; $('b', r).textContent = '×' + x; r.classList.toggle('up', !!v); }, v ? j * 160 : 0));
  };
  $$('#msToggle button').forEach((b) => b.addEventListener('click', () => set(b.dataset.m)));
  set('tool');
})();

/* ---------- 8. context: handover checklist + any machine via Git ---------- */
(() => {
  const btns = $$('#hoList button');
  const upd = () => { const p = Math.round((100 * btns.filter((b) => b.classList.contains('on')).length) / btns.length); $('#hoBar').style.width = p + '%'; $('#hoPct').textContent = p + '%'; };
  btns.forEach((b) => { b.setAttribute('role', 'checkbox'); b.setAttribute('aria-checked', 'false'); b.addEventListener('click', () => { b.setAttribute('aria-checked', b.classList.toggle('on')); upd(); }); });
  upd();
  const svg = $('#setupSvg');
  $$('.mac', svg).forEach((m) => { m.addEventListener('mouseenter', () => svg.classList.add('hot')); m.addEventListener('mouseleave', () => svg.classList.remove('hot')); });
})();

/* ---------- 9. architecture: static diagram, hover only highlights a block (CSS) ---------- */

/* ---------- 10. real examples: one sentence -> AI fetches everything (3 scenarios, next / back) ---------- */
(() => {
  const L = (tag, txt) => `<div class="line"><i>${tag}</i> ${txt}</div>`;
  const UAT_MAIL = '<div class="mail full"><div><span>To</span>Anna, Ben, Chris… (9 người phía khách)</div><div><span>CC</span>nhóm dự án ABC</div><div><span>Tiêu đề</span><b>UAT Update #8: Day 5 (Thu, 15 Oct)</b></div>'
    + '<p>Hi all, below is today\'s UAT progress.</p>'
    + '<table><tr><th>Executed</th><th>Passed</th><th>Failed</th><th>Blocked</th></tr><tr><td>46</td><td class="g">31</td><td class="r">9</td><td class="a">6</td></tr></table>'
    + '<p><b>Risks:</b> production data due Tue 20 Oct · 2 testers on leave next week</p>'
    + '<p><b>Need your support:</b> Okta test accounts for 6 blocked cases</p>'
    + '<p><b>Tomorrow:</b> UAT Round 2, 2 – 6 PM · retest 4 fixed bugs</p></div>';
  const QC_RESULT = '<div class="mail full"><div><span>File</span><b>TC_LocateUs_v0.1.xlsx</b> · 42 test case</div>'
    + '<table class="tcx"><tr><th>ID</th><th>Tình huống</th><th>Kết quả mong đợi</th><th>Loại</th></tr>'
    + '<tr><td>TC-LOC-01</td><td>Mở trang Locate Us</td><td>Bản đồ + danh sách trung tâm theo khu vực</td><td>Positive</td></tr>'
    + '<tr><td>TC-LOC-07</td><td>Lọc theo khu vực "East"</td><td>Chỉ hiện trung tâm thuộc East</td><td>Positive</td></tr>'
    + '<tr><td>TC-LOC-18</td><td>Trung tâm thiếu toạ độ</td><td>Ẩn trên bản đồ, vẫn có trong danh sách</td><td>Edge</td></tr>'
    + '<tr><td>TC-LOC-25</td><td>Editor nhập link OneMap sai</td><td>Báo lỗi, không cho lưu</td><td>Negative</td></tr></table>'
    + '<p>Kèm: 3 test account (Editor, Publisher, Viewer) · bộ test data · đối chiếu nguồn từng case</p></div>';
  const BA_RESULT = '<div class="mail full"><div><span>To</span>Anna, Ben (phía khách)</div><div><span>Tiêu đề</span><b>Submission for review: BRD v0.2</b></div>'
    + '<p>Dear Anna, Ben, please find BRD v0.2 attached. Summary of changes:</p>'
    + '<table class="tcx"><tr><th>Comment</th><th>Hướng xử lý</th><th>Trạng thái</th></tr>'
    + '<tr><td>#3 Lọc nâng cao</td><td>Dời sang Drop 2 (theo email KH 08/10)</td><td class="g">Đã cập nhật</td></tr>'
    + '<tr><td>#11 Giờ mở cửa</td><td>Thêm trường giờ mở cửa cho từng trung tâm</td><td class="g">Đã cập nhật</td></tr>'
    + '<tr><td>#19 Bản đồ ngoài SG</td><td>Cần KH xác nhận phạm vi</td><td class="a">Chờ KH</td></tr></table>'
    + '<p>21 / 27 comment đã xử lý · 6 điểm đã gửi email làm rõ trước đó</p></div>';
  const SC = [
    { title: '"Soạn email <strong>report UAT</strong> cuối ngày"', actor: 'PM', man: '~60 phút', ai: '~5 phút review', aiW: '8%', steps: [
      { n: ['pm'], t: 'PM giao việc bằng một câu', p: 'Không đính kèm file, không copy gì cả.', out: L('PM:', 'Soạn email report UAT hôm nay gửi khách, theo mẫu report hằng ngày.') },
      { n: ['repo'], t: 'Đọc context có sẵn trong Folder AI', p: 'Ai nhận, ai CC, mẫu report, cách viết email cho khách, timeline và scope: có sẵn trong Folder AI, chưa cần gọi hệ thống nào.', out: L('Folder AI', 'danh sách stakeholder: ai nhận email report, ai được CC') + L('Folder AI', 'template report UAT hằng ngày') + L('Folder AI', 'quy tắc viết email cho khách hàng của dự án') + L('Folder AI', 'timeline và scope: dự án đang ở giai đoạn nào') },
      { n: ['jira'], t: 'Tự đọc Jira', p: 'Toàn bộ ticket UAT trong ngày.', out: L('Jira', '46 ticket hôm nay: 31 pass · 9 fail · 6 blocked') },
      { n: ['chat'], t: 'Tự đọc Google Chat giữa Dev và QC', p: 'Tổng hợp rủi ro, vấn đề, tiến độ thật.', out: L('Chat', '38 tin nhắn Dev ↔ QC: 2 rủi ro, 1 blocker môi trường') },
      { n: ['cal'], t: 'Đối chiếu lịch', p: 'Lịch UAT ngày mai và các buổi họp liên quan.', out: L('Calendar', 'ngày mai: UAT Round 2, 2 – 6 PM') },
      { n: ['gmail'], t: 'Soạn sẵn draft trên Gmail', p: 'Đúng To / CC, có bảng số liệu, rủi ro và việc cần khách hỗ trợ.', out: L('Gmail', 'đã tạo draft "UAT Update #8: Day 5"') },
      { n: ['pm'], done: true, t: 'PM review 5 phút rồi bấm Send', p: 'Đây là email AI đã soạn sẵn. Không phải nhờ AI sửa đi sửa lại.', out: UAT_MAIL },
    ] },
    { title: 'QC: "Viết <strong>test case</strong> cho tính năng Locate Us"', actor: 'QC', man: '~1 ngày', ai: '~1 giờ review', aiW: '13%', steps: [
      { n: ['pm'], t: 'QC giao việc bằng một câu', p: 'Chỉ nói tên tính năng cần viết test case.', out: L('QC:', 'Viết test case cho tính năng Locate Us.') },
      { n: ['repo'], t: 'Đọc rule, template, quyết định trong Folder AI', p: 'Template, quy tắc viết test case của khách, thông tin tính năng, người duyệt: có sẵn trong Folder AI.', out: L('Folder AI', 'template test case của dự án') + L('Folder AI', 'quy tắc viết test case mà khách hàng yêu cầu') + L('Folder AI', 'scope tính năng Locate Us, các vai trò người dùng') + L('Folder AI', 'danh sách stakeholder: ai duyệt test case, gửi cho ai') },
      { n: ['drive', 'tr'], t: 'Lấy BRD mới nhất và transcript họp', p: 'Tự tìm bản BRD mới nhất trong Drive, đọc transcript buổi họp với khách.', out: L('Drive', 'BRD Locate Us v1.0 (bản mới nhất)') + L('Transcript', 'họp với khách 12/10: chốt hiển thị giờ mở cửa') },
      { n: ['chat', 'gmail'], t: 'Đọc chat BA · QC · Dev và email liên quan', p: 'Những điều chỉnh chưa kịp cập nhật vào BRD.', out: L('Chat', 'BA: bản đồ chỉ hiển thị trung tâm tại Singapore') + L('Email', 'KH chốt: danh sách trung tâm sắp theo khu vực') },
      { n: ['cc'], t: 'Tự viết, tự review, tự tìm edge case', p: 'Viết test case theo đúng template, rồi tự soát lại và bổ sung các case biên.', out: L('viết', '42 test case · 9 negative · 6 edge case') + L('soát', 'đối chiếu lại BRD, chat, email: 0 mâu thuẫn') },
      { n: ['db'], t: 'Chuẩn bị test account và test data', p: 'Kết nối database, môi trường test để tạo tài khoản, dữ liệu và quyền truy cập cho từng test case.', out: L('Test account', '3 tài khoản theo vai trò: Editor, Publisher, Viewer') + L('Test data', 'bộ dữ liệu trung tâm đào tạo cho các case hiển thị, lọc, bản đồ') },
      { n: ['pm'], done: true, t: 'QC review và gửi đi', p: 'Đây là bộ test case AI đã viết sẵn. QC tập trung đánh giá độ phủ rồi gửi đi.', out: QC_RESULT },
    ] },
    { title: 'BA: "Review <strong>feedback của khách</strong> trên BRD v0.1"', actor: 'BA', man: '~1 ngày', ai: '~1 giờ review', aiW: '13%', steps: [
      { n: ['pm'], t: 'BA giao việc bằng một câu', p: 'Sau khi gửi khách tài liệu BRD v0.1.', out: L('BA:', 'Review comment feedback của khách trên BRD v0.1.') },
      { n: ['drive'], t: 'Đọc toàn bộ comment mới nhất', p: 'Tự đọc mọi comment của khách ngay trong file BRD v0.1.', out: L('Drive', '27 comment mới trên BRD v0.1 · 6 cần làm rõ') },
      { n: ['chat', 'gmail'], t: 'Đọc chat nội bộ và email liên quan', p: 'Những gì team đã thảo luận, khách đã nói qua email.', out: L('Chat', 'Dev: tính năng lọc nâng cao vượt scope Drop 1') + L('Email', 'KH từng đồng ý dời tính năng lọc sang Drop 2') },
      { n: ['repo'], t: 'Đọc rule viết BRD và lịch sử quyết định trong Folder AI', p: 'Template BRD, quy tắc viết BRD của khách, ai comment, ai duyệt: có sẵn trong Folder AI.', out: L('Folder AI', 'template BRD của dự án') + L('Folder AI', 'quy tắc viết BRD và trả lời comment của khách hàng') + L('Folder AI', 'danh sách stakeholder: ai comment, ai duyệt nội dung, gửi phản hồi cho ai') },
      { n: ['gmail'], t: 'Đề xuất email làm rõ và hướng sửa BRD', p: 'Draft email để align với khách, cùng danh sách hướng điều chỉnh từng comment.', out: '<div class="mail"><div><span>Draft</span>Clarification on BRD v0.1 feedback</div><p>6 điểm cần khách xác nhận · đề xuất hướng sửa cho 21 comment còn lại</p></div>' },
      { n: ['pm'], t: 'BA review và phê duyệt hướng sửa', p: 'Người quyết định vẫn là BA.', out: L('BA:', 'đồng ý 19 hướng sửa, đổi 2 hướng.') },
      { n: ['cc', 'gmail'], done: true, t: 'Ra BRD v0.2 và draft email gửi khách', p: 'Đây là email AI đã soạn sẵn kèm BRD v0.2. BA chỉ review rồi bấm Send.', out: BA_RESULT },
    ] },
  ];
  const svg = $('#flowSvg'), SYS = ['jira', 'chat', 'drive', 'tr', 'gmail', 'cal', 'db'];
  let s = 0, i = 0;
  let want;
  const add = (sel, cls) => { const el = $(sel, svg); if (el) want.set(el, cls); };
  const render = () => {
    const S = SC[s].steps; want = new Map();
    for (let k = 0; k <= i; k++) {
      const st = S[k], cls = k === i && !st.done ? 'on' : 'done';
      if (k >= 1) { add('.nd[data-n="cc"]', 'done'); add('.fl[data-f="pm"]', 'done'); }
      st.n.forEach((n) => {
        add(`.nd[data-n="${n}"]`, cls);
        if (n === 'repo') add('.fl[data-f="repo"]', cls);
        if (SYS.includes(n)) { add('.nd[data-n="n8n"]', cls); add('.fl[data-f="n8n"]', cls); add(`.fl[data-f="${n}"]`, cls); }
      });
    }
    // apply only the differences so finished nodes do not flicker
    $$('.nd, .fl', svg).forEach((el) => { const w = want.get(el) || ''; ['on', 'done'].forEach((x) => el.classList.toggle(x, x === w)); });
    $('#actorTxt').textContent = SC[s].actor;
    $('#scTitle').innerHTML = SC[s].title;
    $('#flowStep').innerHTML = `<small>Bước ${i + 1} / ${S.length}</small><b>${S[i].t}</b><p>${S[i].p}</p>`;
    $('#flowOut').innerHTML = S.slice(0, i + 1).map((x, k) => `<div class="${k < i ? 'old' : ''}">${x.out}</div>`).join('');
    $('#flowOut').scrollTop = 9999;
    // where the context came from: lines read from the Git repo vs. external systems reached through n8n / MCP
    const seen = S.slice(0, i + 1);
    $('#cntRepo').textContent = seen.filter((x) => x.n.includes('repo')).reduce((a, x) => a + (x.out.match(/class="line"/g) || []).length, 0);
    $('#cntExt').textContent = new Set(seen.flatMap((x) => x.n.filter((n) => SYS.includes(n)))).size;
    $('#tmMan').textContent = SC[s].man; $('#tmAi').textContent = SC[s].ai; $('#tbAi').style.width = SC[s].aiW;
    $('#flowPrev').disabled = i === 0; $('#flowNext').disabled = i === S.length - 1;
  };
  $('#flowNext').addEventListener('click', () => { if (i < SC[s].steps.length - 1) { i++; render(); } });
  $('#flowPrev').addEventListener('click', () => { if (i > 0) { i--; render(); } });
  $$('#scTabs button').forEach((b) => b.addEventListener('click', () => { s = +b.dataset.s; i = 0; $$('#scTabs button').forEach((x) => x.classList.toggle('on', x === b)); render(); }));
  render();
})();

/* ---------- 11. repo tree: general at the top, details further down ---------- */
(() => {
  const F = (n, title, desc, ex = '', tag = '') => ({ n, title, desc, ex, tag });
  const D = (n, title, desc, kids, open = false) => ({ n, title, desc, kids, open });
  const TREE = D('pm-ai/', 'Bộ não của nhân viên AI', 'Một Folder AI duy nhất (Git repo), mở bằng VS Code. Sắp xếp từ chung nhất ở trên đến chi tiết nhất ở dưới.', [
    F('CLAUDE.md', 'Bộ quy tắc gốc', 'File AI đọc đầu tiên mỗi phiên: phải đọc gì trước, dùng ngôn ngữ gì, quy ước đặt tên, những việc bắt buộc làm.', '- Giao tiếp tiếng Việt; code, tên file tiếng Anh\n- Trước khi làm dự án nào: đọc overview, stakeholders, notes\n- Phát hiện việc cần làm: tự thêm vào todo', 'Như cuốn sổ tay nhân viên'),
    D('infra/', 'Infrastructure: hạ tầng kết nối', 'Mô tả AI kết nối Gmail, Calendar, Chat, Drive, Jira, Confluence qua n8n và MCP. Không lưu mật khẩu ở đây.', [
      F('integrations/', 'Các kết nối', 'n8n cho Gmail, Drive, Chat, Calendar; MCP cho Jira, Confluence: dùng để làm gì, gọi thế nào, lỗi hay gặp.', 'gmail: tạo draft, đọc thread\njira: đọc ticket, đọc comment'),
      F('machines/', 'Cấu hình riêng từng máy', 'Máy công ty, laptop ở nhà: mỗi máy cài đặt một chút khác nhau.'),
    ]),
    D('.claude/', 'Skills và trí nhớ của AI', 'Thư mục riêng của Claude Code: skills (cách làm từng loại việc) và memory (những gì AI tự học), đồng bộ qua Git sang mọi máy.', [
      D('skills/', 'Skills của AI', 'Mỗi skill là một thư mục có file SKILL.md: hướng dẫn cách làm một loại việc, kèm template, script. Claude Code tự chọn đúng skill khi gặp việc phù hợp, không cần bạn dặn lại.', [
        F('write-test-case/SKILL.md', 'Skill viết test case', 'Cách viết test case theo template của khách: đặt ID, mỗi bước một hành động, đối chiếu BRD, tự soát edge case.', '1. Đọc BRD + Figma mới nhất\n2. Viết theo template, ID TC-<MODULE>-xx\n3. Tự soát: positive, negative, edge case', 'Viết một lần, ai trong team cũng dùng được'),
        F('uat-daily-report/SKILL.md', 'Skill report UAT hằng ngày', 'Đọc Jira, chat Dev ↔ QC, soạn email report đúng mẫu, đúng người nhận.'),
        F('draw-timeline/SKILL.md', 'Skill vẽ timeline', 'Dựng Gantt / timeline PDF theo quy ước màu, ngày nghỉ, nguồn lực.'),
      ], true),
      F('memory/', 'Trí nhớ dài hạn', 'Những điều AI học được khi làm việc với bạn (góp ý, sở thích, quy tắc), đồng bộ qua Git sang mọi máy.', '- Không dùng emoji trong email\n- Bảng trong Gmail: tô màu nền trên từng ô', 'Nhớ cả những lần bạn góp ý'),
    ], true),
    D('company/', 'Shared knowledge: SmartOSC', 'Những gì mọi dự án đều cần: công ty là ai, ai làm gì, quy trình chuẩn.', [
      F('org-chart.md', 'Sơ đồ tổ chức', 'Các khối, phòng ban, ai báo cáo cho ai, ai duyệt việc gì.', 'BOD → Delivery → Division → các dự án\nQA, Finance, HR, IT: đầu mối từng việc'),
      F('colleagues.md', 'Đồng nghiệp: email, vai trò, kỹ năng', 'Để AI biết hỏi ai, CC ai, giao việc cho ai.', 'An · Tech Lead · an@smartosc.com · Java, cloud\nBình · QC Lead · binh@smartosc.com · test strategy'),
      F('smartosc-process/', 'Quy trình SmartOSC', 'Lifecycle dự án, báo cáo, UAT, release, Jira workflow, bảo mật dữ liệu, tài chính dự án.', 'Report tuần: thứ Sáu trước 17:00\nUAT sign-off: cần evidence đủ chữ ký'),
    ]),
    D('division/', 'Shared knowledge: Division', 'Thành viên trong division, mối quan hệ, ai đang ở dự án nào, ai hỗ trợ được việc gì.', [
      F('members.md', 'Thành viên Division', 'Danh sách, vai trò, dự án hiện tại, thế mạnh.', 'Chi · BA · dự án ABC · BRD, prototype'),
      F('relationships.md', 'Mối quan hệ, cách phối hợp', 'Ai thường làm cùng ai, ai là backup của ai, ai duyệt ngân sách.', 'Backup PM dự án ABC: Dũng'),
    ]),
    D('knowledge/', 'Template, thuật ngữ dùng chung', 'Chữ ký email, mẫu báo cáo, thuật ngữ: dùng cho mọi dự án.', [
      F('templates/', 'Mẫu dùng chung', 'Chữ ký email, mẫu report tuần, mẫu MOM.'),
      F('glossary.md', 'Thuật ngữ', 'Các từ viết tắt của công ty và từng dự án.'),
    ]),
    D('projects/', 'Project knowledge: từng dự án', 'Mỗi dự án một thư mục. Bàn giao một lần, AI nhớ mãi.', [
      F('_template/', 'Mẫu cho dự án mới', 'Bắt đầu dự án mới: copy thư mục này rồi điền thông tin.', 'overview.md · stakeholders.md · notes/'),
      D('du-an-abc/', 'Dự án ABC', 'Mọi thứ một thành viên mới cần biết về dự án ABC.', [
        F('overview.md', 'Tổng quan dự án', 'Scope, phase, timeline, milestone, tiến độ hiện tại, rủi ro lớn.', 'Go-live Drop 1: 12/11\nUAT Wave 2: 26/10 – 06/11\nRủi ro: dữ liệu production chưa đủ'),
        F('stakeholders.md', 'Ai là ai phía khách hàng', 'Email, vai trò, quyền quyết định và phong cách làm việc của từng người.', 'Anna · Director · thích ngắn gọn, số liệu rõ\nBen · Product Owner · quyết định scope'),
        F('notes/', 'Ghi chú, quyết định, MOM', 'Các quyết định đã chốt và vì sao, biên bản họp, lịch sử làm việc, convention của dự án.', '14/10: KH chốt banner tối đa 5 slide\n15/10: bỏ Omnichat khỏi Wave 1'),
      ], true),
    ], true),
    D('prompt/', 'Prompt giao việc', 'Mỗi loại việc lặp lại là một file prompt, dùng lại được nhiều lần.', [
      F('draft-email.md', 'Soạn email', 'Soạn draft trên Gmail đúng người nhận, đúng giọng văn, có chữ ký chuẩn.', 'Luồng: trả lời message mới nhất\nTo / CC: lấy từ stakeholders.md'),
      F('build-master-plan.md', 'Xây master plan, timeline', 'Dựng timeline từ scope, nguồn lực, ngày nghỉ, thời gian review của khách.'),
      F('write-mom.md', 'Viết MOM', 'Từ transcript buổi họp: tóm tắt, quyết định, action item có người phụ trách và hạn.'),
      F('track-payment.md', 'Theo dõi payment milestone', 'Đối chiếu milestone hợp đồng với tiến độ thật và evidence sign-off.'),
      F('create-slides.md', 'Làm slide present', 'Dựng slide đúng branding SmartOSC từ nội dung thô.'),
    ]),
    D('tasks/', 'Automation chạy định kỳ', 'Những việc AI tự làm theo lịch: report hằng ngày, tổng hợp email và chat, nhắc deadline.', [
      F('report-uat-daily/', 'Report UAT cuối ngày', 'Đọc Jira, đọc chat, soạn draft email report, đợi PM review.'),
      F('read-and-sum/', 'Tổng hợp email và chat', 'Mỗi sáng: tóm tắt những gì mới, việc nào cần PM xử lý.'),
    ]),
    F('todo/todo.md', 'Việc cần làm', 'AI tự thêm việc cho bạn khi phát hiện action item trong email, chat, biên bản họp.', '[ ] Gửi Zoho sign-off 2 tài liệu\n[ ] Nhắc khách phản hồi timeline trước 22/10'),
  ], true);
  const ICON = { dir: '<svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>', file: '<svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></svg>' };
  const show = (node, path, el) => {
    $$('#tree .sel').forEach((x) => x.classList.remove('sel')); el.classList.add('sel');
    $('#tvPath').textContent = path; $('#tvTitle').textContent = node.title; $('#tvDesc').textContent = node.desc;
    const ex = $('#tvEx'); ex.textContent = node.ex || (node.kids ? node.kids.map((k) => k.n).join('\n') : ''); ex.style.display = ex.textContent ? '' : 'none';
    $('#tvTag').textContent = node.tag || (node.kids ? 'Bấm vào thư mục để mở / đóng' : 'Viết một lần, AI dùng mãi');
  };
  const build = (node, path) => {
    const li = document.createElement('li'), isDir = !!node.kids; li.className = isDir ? 'dir' + (node.open ? '' : ' closed') : 'file';
    const row = document.createElement('div');
    row.innerHTML = `${isDir ? ICON.dir : ICON.file}<span class="nm">${node.n}</span>${isDir ? `<span class="hint">${node.kids.length}</span>` : ''}`;
    row.addEventListener('click', () => { if (isDir && path !== 'pm-ai/') li.classList.toggle('closed'); show(node, path, row); });
    li.appendChild(row);
    if (isDir) { const ul = document.createElement('ul'); node.kids.forEach((k) => ul.appendChild(build(k, path + k.n))); li.appendChild(ul); }
    return li;
  };
  const ul = document.createElement('ul'), root = build(TREE, 'pm-ai/'); ul.appendChild(root); $('#tree').appendChild(ul);
  show(TREE, 'pm-ai/', $('div', root));
})();

/* ---------- 12. prompt builder: 5 essential parts ---------- */
(() => {
  const B = [
    { k: 'Mục tiêu', s: 'Goal', w: 26, on: true, t: '# Mục tiêu\nSoạn draft email gửi khách hàng xin xác nhận timeline Drop 1. Tôi tự review và tự gửi.', why: 'Một mục tiêu rõ ràng, có kết quả cụ thể. Không có mục tiêu thì mọi phần khác đều vô nghĩa.' },
    { k: 'Định dạng đầu ra', s: 'Output format', w: 16, t: '# Đầu ra\nDraft trong Gmail, luồng mới. To: toàn bộ DT phía khách; CC: team SmartOSC.\nCó bảng tóm tắt các mốc chính, chữ ký chuẩn của tôi.', why: 'Nhận về đúng thứ dùng được ngay: đúng nơi, đúng người nhận, đúng hình thức.' },
    { k: 'Dữ liệu đầu vào', s: 'Input', w: 22, t: '# Dựa vào\n- File timeline Drop 1 mới nhất\n- Luồng email "Timeline review" và chat nhóm dự án hôm nay', why: 'Chỉ đúng nơi có thông tin. AI Agent tự đi lấy, không phải đoán, và bạn không phải copy.' },
    { k: 'Yêu cầu', s: 'Requirements', w: 18, t: '# Yêu cầu\n- Tiếng Anh, lịch sự, sẵn sàng gửi khách\n- Không cam kết ngày mới khi chưa có xác nhận nội bộ\n- Highlight thông tin quan trọng bằng màu, không dùng emoji', why: 'Giọng văn, những điều được làm và "không được làm": thường là phần quyết định chất lượng.' },
    { k: 'Feedback', s: 'FEEDBACK 1, 2…', w: 14, t: '# FEEDBACK 1\n- Bỏ đề xuất pre-run; sửa cả trong email và file PDF', why: 'Góp ý nối tiếp ngay trong cùng file: giữ lịch sử, không phải bắt đầu lại, AI hiểu bạn đã sửa gì và vì sao.' },
  ];
  let last = 0;
  const box = $('#prBlocks');
  box.innerHTML = B.map((b, i) => `<button class="pr-b${b.on ? ' on' : ''}" data-i="${i}"><i>${String(i + 1).padStart(2, '0')}</i><span><b>${b.k}</b><small>${b.s}</small></span><span class="sw"></span></button>`).join('');
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const upd = () => {
    const on = $$('.pr-b', box).map((b) => b.classList.contains('on'));
    $('#prText').innerHTML = B.map((b, i) => (on[i] ? `<span class="${i === last ? 'new' : ''}">${esc(b.t).replace(/^(# .*)$/gm, '<span class="h">$1</span>')}</span>` : '')).filter(Boolean).join('\n\n') || '(trống)';
    const score = Math.min(100, 4 + B.reduce((s, b, i) => s + (on[i] ? b.w : 0), 0));
    $('#prBar').style.width = score + '%'; $('#prPct').textContent = score + '%';
    $('#prWhy').innerHTML = `<b>${B[last].k}:</b> ${B[last].why}`;
  };
  $$('.pr-b', box).forEach((b) => { b.addEventListener('click', () => { b.classList.toggle('on'); last = +b.dataset.i; upd(); }); b.addEventListener('mouseenter', () => { last = +b.dataset.i; upd(); }); });
  upd();
})();


/* ---------- 14. live demo: preview of the command, then switch to the real machine ---------- */
(() => {
  const LINES = [
    ['cmd', 'Thực thi prompt/report-daily-progress.md'],
    ['dim', 'Đọc prompt: tổng hợp email, chat, Jira hôm nay → email báo cáo tiến độ + to-do'],
    ['dim', 'Đọc context dự án: stakeholders, mẫu báo cáo, quy tắc highlight…'],
    ['dim', 'Gmail: 14 email mới hôm nay (5 từ khách hàng)…'],
    ['dim', 'Google Chat: 63 tin nhắn trong nhóm dự án và chat với khách…'],
    ['dim', 'Jira: 27 ticket cập nhật, 3 bug mới, 11 comment…'],
    ['dim', 'Tổng hợp: tiến độ từng hạng mục, 3 rủi ro, 2 việc cần khách quyết định'],
    ['dim', 'Gmail: tạo draft "Project Update: 16 Oct", đúng To / CC'],
    ['dim', 'todo.md: thêm 5 việc mới, đánh dấu 2 việc đã xong'],
    ['ok', 'Xong. Draft email và to-do list đang chờ bạn review.'],
  ];
  const body = $('#termBody'); let running = false;
  $('#liveBtn').addEventListener('click', async () => {
    if (running) return; running = true; body.innerHTML = '';
    for (const [c, t] of LINES) {
      const d = document.createElement('div'); d.className = c; body.appendChild(d);
      if (c === 'cmd') { for (const ch of t) { d.textContent += ch; await sleep(22); } await sleep(400); } else { d.textContent = t; await sleep(650); }
      body.scrollTop = body.scrollHeight;
    }
    body.insertAdjacentHTML('beforeend', '<span class="cur"></span>'); running = false;
  });
  $$('#watchList button').forEach((b) => { b.setAttribute('role', 'checkbox'); b.setAttribute('aria-checked', 'false'); b.addEventListener('click', () => b.setAttribute('aria-checked', b.classList.toggle('on'))); });
})();

/* ---------- 15. cloud 24/7: 24h clock + 3 separate examples (morning brief / new bug / weekly report) ---------- */
(() => {
  // hour -> [kind, text, tab]; tab links the clock to one of the 3 example tabs
  const EV = { 7: ['ev', 'Tóm tắt buổi sáng: đọc chat nội bộ, chat khách hàng, file UAT feedback, Jira, email; gửi bạn bản tóm tắt và to-do trong ngày.', 0],
    10: ['bug', 'Có bug mới trên Jira: tự phân tích, dự báo root cause, báo Dev và QC liên quan trên Google Chat.', 1],
    14: ['ev', 'Có dòng UAT feedback mới: phân loại, gắn đúng tính năng, nhắc BA nếu cần làm rõ.'],
    17: ['week', 'Thứ Sáu 17:00: soạn weekly report cho toàn team, Head of Division và khách hàng, mỗi bên một phiên bản.', 2],
    22: ['ev', 'Cập nhật to-do, nhắc deadline ngày mai, đồng bộ dữ liệu.'] };
  const ticks = $('#clockTicks'), evs = $('#clockEvents'), C = 160, R = 130;
  const pt = (h, r) => { const a = (h / 24) * 2 * Math.PI - Math.PI / 2; return [C + r * Math.cos(a), C + r * Math.sin(a)]; };
  for (let h = 0; h < 24; h++) {
    const [x1, y1] = pt(h, R - (h % 6 ? 6 : 12)), [x2, y2] = pt(h, R);
    ticks.insertAdjacentHTML('beforeend', `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="tick ${h % 6 ? '' : 'major'}"/>`);
    if (h % 6 === 0) { const [tx, ty] = pt(h, R - 34); ticks.insertAdjacentHTML('beforeend', `<text x="${tx}" y="${ty + 4}" class="hl">${String(h).padStart(2, '0')}:00</text>`); }
  }
  Object.entries(EV).forEach(([h, [k]]) => { const [x, y] = pt(+h, R); evs.insertAdjacentHTML('beforeend', `<circle cx="${x}" cy="${y}" r="7" class="ev ${k}" data-h="${h}"/>`); });

  const tab = (t) => {
    $$('#clTabs button').forEach((b) => b.classList.toggle('on', +b.dataset.t === t));
    $$('.cl-panel').forEach((p) => p.classList.toggle('on', +p.dataset.t === t));
  };
  const range = $('#hourRange');
  const set = (h, fromTab) => {
    $('#clockHand').style.transform = `rotate(${(h / 24) * 360}deg)`;
    $$('.ev', evs).forEach((c) => c.classList.toggle('on', +c.dataset.h === h));
    const e = EV[h];
    if (!fromTab && e && e[2] !== undefined) tab(e[2]);
    $('#hourInfo').innerHTML = `<b>${h === 17 ? 'Thứ Sáu ' : ''}${String(h).padStart(2, '0')}:00</b><span>${e ? e[1] : 'Theo dõi các hệ thống, sẵn sàng phản ứng khi có sự kiện mới. Không cần ai ra lệnh.'}</span>`;
  };
  range.addEventListener('input', () => set(+range.value));
  range.addEventListener('change', () => range.blur()); // keep arrow keys for slide navigation
  $$('.ev', evs).forEach((c) => c.addEventListener('click', () => { range.value = c.dataset.h; set(+c.dataset.h); }));
  $$('#clTabs button').forEach((b) => b.addEventListener('click', () => { const t = +b.dataset.t; tab(t); const h = [7, 10, 17][t]; range.value = h; set(h, true); }));

  // example 2: new bug
  let busy = false;
  $('#bugBtn').addEventListener('click', async () => {
    if (busy) return; busy = true;
    const steps = $$('#bugFlow .bf'); steps.forEach((s) => s.classList.remove('on')); $('#gchat').innerHTML = '';
    for (const s of steps) { s.classList.add('on'); await sleep(650); }
    $('#gchat').innerHTML = `<div class="msg-card"><div class="av">AI</div><div><div class="who"><b>Claude</b> · Google Chat · nhóm Dev QC dự án ABC</div>
      Bug mới <b>ABC-482</b> (High): số điện thoại sai định dạng vẫn lưu được.<br>
      <span class="rc">Root cause dự đoán:</span> validation E.164 mới có ở frontend, API lưu dữ liệu chưa kiểm tra.<br>
      <span class="tagp">@An (Dev)</span> xem giúp phần API · <span class="tagp">@Bình (QC)</span> retest sau khi fix.</div></div>`;
    busy = false;
  });

  // example 3: weekly report, one version per audience
  const WK = [
    { to: 'Toàn team dự án (Dev, BA, QC, Designer)', sub: 'Weekly Update · Tuần 42', focus: 'Chi tiết công việc, ai làm gì tuần sau',
      rows: [['Đã xong', '18 task · 2 BRD sign-off · 4 bug đã fix'], ['Đang làm', 'UAT Round 2 · cut-over plan V1'], ['Tuần sau', 'An: fix 3 bug High · Chi: BRD v0.2 · Bình: retest 12 case'], ['Nhắc nhở', 'log work trước 17:00 thứ Sáu · evidence cho mọi test case']] },
    { to: 'Head of Division', sub: 'Weekly Report: Dự án ABC · Tuần 42', focus: 'Sức khoẻ dự án, nguồn lực, rủi ro cần hỗ trợ',
      rows: [['Tình trạng', 'Tiến độ: đúng kế hoạch · Ngân sách: trong giới hạn · Chất lượng: 0 bug P0/P1'], ['Nguồn lực', '1 QC cần thêm 2 tuần cho UAT Wave 2'], ['Rủi ro', 'Dữ liệu production của KH có thể trễ 3 ngày'], ['Cần hỗ trợ', 'Phê duyệt bổ sung nguồn lực QC']] },
    { to: 'Khách hàng (Anna, Ben, …)', sub: 'Weekly Project Update · Week 42', focus: 'Tiến độ theo milestone, việc cần khách hàng làm',
      rows: [['Progress', 'UAT Wave 1: 96% executed · Drop 1 go-live on track (12 Nov)'], ['Completed', '2 BRDs signed off · 4 bugs fixed and retested'], ['Next week', 'UAT Round 2 · cut-over dry-run 1 (29 Oct)'], ['Need from you', 'Production data by Tue 20 Oct · 2 Okta test accounts']] },
  ];
  const wk = (a) => {
    $$('#audTabs button').forEach((b) => b.classList.toggle('on', +b.dataset.a === a));
    const d = WK[a];
    $('#wkMail').innerHTML = `<div class="wk-meta"><div><span>To</span>${d.to}</div><div><span>Tiêu đề</span><b>${d.sub}</b></div><div><span>Trọng tâm</span>${d.focus}</div></div>
      <table>${d.rows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</table>`;
  };
  $$('#audTabs button').forEach((b) => b.addEventListener('click', () => wk(+b.dataset.a)));
  wk(0);
  set(7);
})();


/* ---------- 16. path: 8 steps from no AI / copilot to AI Agent (hover a step, or walk the whole path) ---------- */
(() => {
  const I = {
    git: '<path d="M6 3v12"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
    plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
    hub: '<circle cx="12" cy="12" r="3"/><circle cx="4" cy="5" r="2"/><circle cx="20" cy="5" r="2"/><circle cx="12" cy="21" r="2"/><path d="M6 6.5l4 3.5M18 6.5l-4 3.5M12 15v4"/>',
    link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    tree: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    load: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v3h16v-3"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8"/>',
  };
  // group, icon, title, short line, time, who, description, example
  const P = [
    ['Công cụ', 'code', 'Cài VS Code', 'miễn phí, nhẹ', '5 phút', 'Tự cài, miễn phí', 'Tải Visual Studio Code (miễn phí, công ty không chặn), tạo và mở Folder AI. Mọi file AI tạo ra, bạn đều nhìn thấy và sửa được.', 'code.visualstudio.com → Download\nTạo thư mục pm-ai\nFile → Open Folder → pm-ai'],
    ['Công cụ', 'plug', 'Kết nối Claude', 'extension Claude Code', '5 phút', 'Tự cài, tài khoản công ty', 'Cài extension Claude Code trong VS Code, đăng nhập tài khoản Claude Code Team công ty đã cấp cho team dự án. Nhân viên AI đã "ngồi" vào bàn làm việc.', 'Extensions → tìm "Claude Code" → Install\nĐăng nhập → mở khung chat'],
    ['Kết nối', 'hub', 'Cài n8n', 'chạy local, miễn phí', '15 phút', 'Nhờ Claude làm giúp, bạn cấp quyền', 'Cài n8n (miễn phí, công ty không chặn) ngay trên máy làm "cổng kết nối". Mẹo: từ bước này, hãy nhờ chính Claude Code làm giúp.', '"Cài n8n chạy local trên máy mình,\ntự khởi động khi bật máy."'],
    ['Kết nối', 'link', 'Nối hệ thống', 'Gmail · Chat · Drive · Jira', '30 phút', 'Nhờ Claude làm giúp, bạn cấp quyền', 'Đăng nhập Google một lần cho Gmail, Chat, Drive, Calendar; thêm MCP cho Jira, Confluence.', '"Tạo workflow n8n đọc Gmail và Google Chat,\ncó token bảo vệ, ghi hướng dẫn vào infra/."'],
    ['Bộ não', 'tree', 'Sắp xếp Folder AI', 'CLAUDE.md · projects/ · prompt/', '20 phút', 'Nhờ Claude làm giúp, bạn cấp quyền', 'Dựng khung thư mục: quy tắc gốc, context công ty, từng dự án, prompt, task tự động.', 'CLAUDE.md\ncompany/   projects/   prompt/\ntasks/     knowledge/  .claude/memory/'],
    ['Bộ não', 'load', 'Nạp context lần đầu', 'email · chat · Drive · file', '1 giờ', 'Claude đọc, bạn duyệt', 'Cho AI đọc email, chat, Drive và tài liệu dự án, tự viết overview, stakeholders, notes. Bạn đọc lại, sửa chỗ chưa đúng.', '"Đọc email, chat, Drive của dự án ABC 3 tháng qua,\nviết overview.md, stakeholders.md và notes/."'],
    ['Bộ não', 'git', 'Xin Git repo', 'private, của SmartOSC', '10 phút', 'Request HoD + IT', 'Request HoD duyệt, IT setup Git repo private của SmartOSC, rồi đưa Folder AI lên đó: đồng bộ mọi máy, lưu lịch sử. Chưa có cũng chưa sao, làm sau cũng được.', 'Request: Git repo private cho dự án ABC\nHoD duyệt → IT tạo repo, cấp quyền\ngit push Folder AI lên repo'],
    ['Bắt đầu', 'chat', 'Prompt đầu tiên', 'một việc bạn làm hằng ngày', '5 phút', 'Bạn giao việc', 'Chọn một việc lặp lại bạn ngại nhất, giao bằng một câu. Từ đây, mỗi góp ý của bạn làm AI giỏi hơn.', '"Soạn email báo cáo tiến độ hôm nay gửi khách,\ntheo mẫu report hằng ngày."'],
  ];
  const ol = $('#pathSteps'), det = $('#pathDetail');
  ol.innerHTML = '<span class="path-line"><i id="pathFill"></i></span>' + P.map(([g, ic, t, s, tm], k) => `<li data-k="${k}" data-g="${g}">${k === 0 || P[k - 1][0] !== g ? `<em>${g}</em>` : '<em></em>'}<span class="pn">${k + 1}</span><svg viewBox="0 0 24 24">${I[ic]}</svg><b>${t}</b><small>${s}</small><span class="tm">${tm}</span></li>`).join('');
  const lis = $$('li', ol);
  const show = (k) => {
    const [g, , t, , tm, who, d, ex] = P[k];
    lis.forEach((li, j) => { li.classList.toggle('on', j === k); li.classList.toggle('done', j < k); });
    $('#pathFill').style.width = (100 * k) / (P.length - 1) + '%';
    det.innerHTML = `<div class="pd-l"><small>Bước ${k + 1} / ${P.length} · ${g}</small><h3>${t}</h3><p>${d}</p><div class="pd-tags"><span>${tm}</span><span class="who">${who}</span></div></div><pre class="pd-ex">${ex}</pre>`;
  };
  // presenter-driven only: click a step or use the buttons (no hover, no autoplay); one step past the last lights the goal
  let cur = 0;
  const go = (k) => {
    cur = Math.max(0, Math.min(P.length, k)); const end = cur === P.length;
    show(Math.min(cur, P.length - 1)); $('.path-end.goal').classList.toggle('lit', end);
    $('#pathPrev').disabled = cur === 0; $('#pathNext').disabled = end;
  };
  lis.forEach((li) => li.addEventListener('click', () => go(+li.dataset.k)));
  $('#pathNext').addEventListener('click', () => go(cur + 1));
  $('#pathPrev').addEventListener('click', () => go(cur - 1));
  go(0);
})();

/* ---------- keyboard: Arrow / Page Down -> next slide top, Arrow / Page Up -> previous slide top ---------- */
(() => {
  const visible = () => slides.filter((s) => s.offsetParent !== null);
  addEventListener('keydown', (e) => {
    const down = ['ArrowDown', 'PageDown'].includes(e.key), up = ['ArrowUp', 'PageUp'].includes(e.key);
    if (!down && !up) return;
    const t = e.target; if (t && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && t.type !== 'checkbox'))) return;
    e.preventDefault();
    const vs = visible(), y = scrollY;
    let i = 0; vs.forEach((s, k) => { if (s.offsetTop <= y + 4) i = k; });
    const target = down ? vs[Math.min(i + 1, vs.length - 1)] : (y > vs[i].offsetTop + 4 ? vs[i] : vs[Math.max(i - 1, 0)]);
    scrollTo({ top: target.offsetTop, behavior: 'smooth' });
  });
})();

/* ---------- deep links: ?go=<id> scrolls to a section, ?only=<id> shows one section (layout check) ---------- */
(() => {
  const q = new URLSearchParams(location.search), only = q.get('only'), go = q.get('go');
  if (only) slides.forEach((s) => { if (s.id !== only) s.style.display = 'none'; });
  if (go && document.getElementById(go)) { document.documentElement.style.scrollBehavior = 'auto'; document.getElementById(go).scrollIntoView(); }
  onScroll();
})();
