/* Seminar AI Agent — interactions (vanilla JS, no build step, no backend) */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NS = 'http://www.w3.org/2000/svg';

/* ---------- brand bar on every slide ---------- */
const slides = $$('.slide');
slides.forEach((s) => s.insertAdjacentHTML('afterbegin', '<div class="brandbar"><img src="assets/smartosc-logo.png" alt="SmartOSC"><span>AI Agent cho PM · BA · QC · QA</span></div>'));

/* ---------- progress bar + section dots ---------- */
const dots = $('#dots');
slides.forEach((s) => { const a = document.createElement('a'); a.href = '#' + s.id; a.innerHTML = `<span>${s.dataset.title}</span>`; dots.appendChild(a); });
const dotLinks = $$('a', dots);
const onScroll = () => {
  const h = document.documentElement;
  $('#progressBar').style.width = (100 * h.scrollTop) / (h.scrollHeight - h.clientHeight || 1) + '%';
  const mid = h.scrollTop + innerHeight / 2;
  slides.forEach((s, i) => dotLinks[i].classList.toggle('on', mid >= s.offsetTop && mid < s.offsetTop + s.offsetHeight));
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
  pm: { t: 'Project Manager', pains: ['Gom tiến độ từ Jira, email, chat để viết báo cáo tuần', 'Đọc lại cả luồng email dài để trả lời khách cho đúng', 'Ghi MOM, chia action item, nhắc việc từng người'],
    gain: 'Một "đồng nghiệp AI" tự đọc Jira, email, chat của dự án và soạn sẵn báo cáo, MOM, email để bạn chỉ việc review.' },
  ba: { t: 'Business Analyst', pains: ['Viết và sửa BRD qua nhiều vòng comment của khách', 'Tìm lại "khách đã chốt gì" trong email, chat, biên bản', 'Giữ tài liệu, prototype và Jira luôn khớp nhau'],
    gain: 'AI nhớ mọi quyết định đã chốt, tự đối chiếu BRD với email, chat và chỉ ra chỗ còn thiếu hoặc mâu thuẫn.' },
  qc: { t: 'Quality Control', pains: ['Viết hàng trăm test case từ BRD theo đúng template', 'Cập nhật test case mỗi khi BA hay khách đổi yêu cầu', 'Log bug đủ bước, đủ evidence, link đúng ticket'],
    gain: 'Test case được viết từ BRD cùng mọi thay đổi đã chốt, đúng template, và được cập nhật khi yêu cầu đổi.' },
  qa: { t: 'Quality Assurance', pains: ['Kiểm tra dự án có đi đúng quy trình công ty không', 'Tìm evidence sign-off, approval rải rác khắp nơi', 'Tổng hợp số liệu chất lượng cho audit'],
    gain: 'AI rà quy trình, gom evidence và lập checklist audit từ chính dữ liệu thật của dự án.' },
};
const showRole = (k) => {
  const r = ROLES[k];
  $$('#roles button').forEach((b) => b.classList.toggle('on', b.dataset.role === k));
  $('#roleTitle').innerHTML = `Dành cho bạn, <strong>${r.t}</strong>`;
  $('#rolePains').innerHTML = r.pains.map((p, i) => `<li style="animation-delay:${i * 80}ms">${p}</li>`).join('');
  $('#roleGain').textContent = r.gain;
};
$$('#roles button').forEach((b) => { b.addEventListener('click', () => showRole(b.dataset.role)); b.addEventListener('mouseenter', () => showRole(b.dataset.role)); });
showRole('pm');

/* ---------- 2. spirit: flip cards + raise hand (no counter: nothing is synced) ---------- */
(() => {
  const msgs = ['Không có câu hỏi nào là "ngớ ngẩn" cả.', 'Bạn đang làm khác? Kể cho mọi người nghe với.', 'Hỏi càng nhiều, buổi này càng đúng với bạn.', 'Phản biện cũng rất được hoan nghênh.'];
  let n = 0;
  $('#handBtn').addEventListener('click', (e) => { n++; $('#handMsg').textContent = msgs[n % msgs.length]; const b = e.currentTarget; b.classList.remove('wave'); void b.offsetWidth; b.classList.add('wave'); });
  $$('.flip').forEach((f) => f.addEventListener('click', () => f.classList.toggle('done')));
})();

/* ---------- 3. demo: writing test cases with a chatbot (next / back, presenter-paced) ---------- */
(() => {
  const body = $('#chatBody'), svg = $('#courierSvg'), links = $('#links'), packets = $('#packets');
  const YOU = { x: 190, y: 154 };
  $$('.src', svg).forEach((g) => {
    const y = +$('rect', g).getAttribute('y') + 20, l = document.createElementNS(NS, 'line');
    Object.entries({ x1: 128, y1: y, x2: YOU.x, y2: YOU.y, class: 'lk', 'data-src': g.dataset.src }).forEach(([k, v]) => l.setAttribute(k, v));
    links.appendChild(l);
  });
  const tag = (ok, t) => `<span class="tag ${ok ? 'ok' : ''}">${t}</span>`;
  const rows = (f) => `<table class="tc"><tr><th>ID</th><th>Tình huống</th><th>Kết quả mong đợi</th><th></th></tr>
    <tr><td>TC-HOM-01</td><td>Hiển thị banner đầu trang</td><td>Banner hiện đủ ảnh, tiêu đề, CTA</td><td>${tag(1, 'OK')}</td></tr>
    <tr class="${f >= 1 ? 'fix' : 'bad'}"><td>TC-HOM-02</td><td>${f >= 1 ? 'Thêm slide thứ 6' : 'Thêm 10 slide'}</td><td>${f >= 1 ? 'Báo lỗi: tối đa 5 slide' : 'Lưu thành công'}</td><td>${f >= 1 ? tag(1, 'Đã sửa') : tag(0, 'Sai: KH chốt tối đa 5')}</td></tr>
    <tr class="${f >= 1 ? 'fix' : 'bad'}"><td>TC-HOM-03</td><td>Tự chuyển slide</td><td>${f >= 1 ? 'Sau 6 giây' : 'Sau 3 giây'}</td><td>${f >= 1 ? tag(1, 'Đã sửa') : tag(0, 'Sai: email chốt 6 giây')}</td></tr>
    <tr class="${f >= 2 ? 'fix' : 'bad'}"><td>TC-HOM-04</td><td>${f >= 2 ? 'Nút "Explore All"' : 'Mở cửa sổ Omnichat'}</td><td>${f >= 2 ? 'Mở trang danh mục' : 'Chat bubble hiện góc phải'}</td><td>${f >= 2 ? tag(1, 'Đã sửa') : tag(0, 'Thừa: BA đã bỏ khỏi Wave 1')}</td></tr></table>`;
  const INTRO = 'AI viết rất nhanh. Nhưng thông tin của dự án lại nằm rải rác ở nhiều nơi mà AI không tự nhìn thấy.';
  const STEPS = [
    { who: 'me', src: ['tpl', 'brd'], paste: 2, min: 5, html: '<span class="att"><i></i>TC_Template.xlsx</span><span class="att doc"><i></i>BRD_Homepage_v1.0.docx</span><br>Viết test case cho tính năng Hero Banner dựa trên BRD và template đính kèm nhé.' },
    { who: 'ai', min: 3, html: 'Đã tạo <b>24 test case</b> theo template. Một vài ví dụ:' + rows(0), insight: 'Nhìn qua thì ổn. Nhưng AI chỉ biết những gì nằm trong BRD.' },
    { who: 'note', html: 'Bạn chợt nhớ: tuần trước <b>khách hàng đã chốt qua email</b> vài điểm khác BRD…' },
    { who: 'me', src: ['mail'], paste: 1, loop: 1, min: 9, html: 'Bổ sung giúp mình, khách đã chốt trong email:<span class="paste">"…banner tối đa 5 slide, tự động chuyển sau 6 giây…" (copy từ Outlook)</span>' },
    { who: 'ai', min: 3, html: 'Đã cập nhật theo email:' + rows(1) },
    { who: 'me', src: ['chat'], paste: 1, loop: 1, min: 9, html: 'À còn nữa, BA vừa nhắn trong group chat:<span class="paste">"Bỏ Omnichat khỏi Wave 1 nha, thêm case nút Explore All" (copy từ Google Chat)</span>' },
    { who: 'ai', src: ['jira'], min: 3, html: 'Đã sửa xong:' + rows(2) + '<br>Bạn có thể gửi thêm <b>quy ước ID trên Jira</b> và các bug cũ liên quan để mình bổ sung case không?', insight: 'Lại thêm một nguồn nữa AI không tự thấy: Jira, Drive, biên bản họp…' },
    { who: 'note', min: 25, final: true, html: '"Thôi, phần còn lại mình <b>sửa tay</b> cho nhanh."' },
  ];
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
      const m = document.createElement('div'); m.className = 'msg ' + st.who; if (!(last && animate)) m.style.animation = 'none'; m.innerHTML = st.html; body.appendChild(m);
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
  render(0, false);
})();

/* ---------- 4. memory: switching machine / account / session ---------- */
(() => {
  const items = $$('#memList li'), brain = $('.brain');
  let timer, redoT;
  const set = (ctx) => {
    $$('#memTabs button').forEach((b) => b.classList.toggle('on', +b.dataset.ctx === ctx));
    const lost = ctx !== 0;
    brain.classList.toggle('lost', lost);
    items.forEach((li, k) => setTimeout(() => li.classList.toggle('gone', lost), lost ? k * 140 : 0));
    $('#memBar').style.width = lost ? '3%' : '100%';
    clearInterval(timer);
    const pctEl = $('#memPct'); let v = parseInt(pctEl.textContent, 10); const to = lost ? 0 : 100;
    timer = setInterval(() => { v += v < to ? 5 : -5; if ((v - to) * (to ? 1 : -1) >= 0) { v = to; clearInterval(timer); } pctEl.textContent = v + '%'; }, 30);
    $('#aiGreet').innerHTML = lost
      ? 'Xin chào! Mình là Claude. Bạn có thể cho mình biết <b>bộ test case Homepage</b> là gì, template ra sao, và hôm qua đã làm tới đâu không?'
      : 'Ok, tiếp tục nhé. Mình nhớ là còn <b>3 case negative cho banner</b> chưa viết, theo đúng template và quy ước ID của dự án.';
    $('#stranger').classList.toggle('show', lost);
    clearInterval(redoT); const redo = $('#redoMin'); let r = 0; redo.textContent = 0;
    if (lost) redoT = setInterval(() => { r++; redo.textContent = r; if (r >= 15) clearInterval(redoT); }, 60);
  };
  $$('#memTabs button').forEach((b) => b.addEventListener('click', () => set(+b.dataset.ctx)));
  set(0);
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

/* ---------- 6. history: Assistant -> Copilot -> Agent + task-length growth (METR 2025) ---------- */
(() => {
  const ERAS = [
    { who: 'Siri', ask: 'Hey Siri, đặt báo thức 6 giờ sáng mai.', do: 'Đã đặt báo thức lúc 6:00.', yes: ['Một câu lệnh ngắn', 'Một tác vụ có sẵn'], no: ['Hiểu ngữ cảnh', 'Làm việc văn phòng', 'Tự tìm thông tin'],
      note: 'Chỉ thực hiện những tác vụ cực kỳ đơn giản, đã được lập trình sẵn.', hot: [] },
    { who: 'Copilot', ask: 'Viết test case cho BRD này giúp mình (đính kèm file).', do: 'Đây là 24 test case dựa trên BRD bạn gửi…', yes: ['Viết, tóm tắt, dịch', 'Gợi ý ý tưởng', 'Hỗ trợ việc văn phòng'], no: ['Tự tìm thông tin', 'Tự thao tác hệ thống', 'Nhớ dự án'],
      note: 'Ví dụ "viết test case" lúc nãy chính là cách dùng AI Copilot: giỏi viết, nhưng chỉ biết những gì bạn dán vào.', hot: [0, 1, 2, 3, 4, 5] },
    { who: 'AI Agent', ask: 'Soạn email report UAT hôm nay gửi khách.', do: 'Đã đọc 46 ticket Jira, 38 tin nhắn Dev ↔ QC, soạn draft Gmail đúng To / CC. Mời bạn review.', yes: ['Tự lập kế hoạch', 'Tự dùng máy tính và công cụ', 'Kết nối hệ thống', 'Nhớ dự án', 'Chạy 24/7'], no: [],
      note: 'Làm việc như một nhân viên văn phòng thực thụ. Đây là cách dùng cơ bản nhất mà tôi muốn giới thiệu hôm nay.', hot: [0, 1, 2, 3, 4, 5, 6, 7] },
  ];
  // approx. 50%-success task length from METR (03/2025), rounded; last row = trend projection
  const PTS = [['GPT-2 · 2019', 2, '~2 giây'], ['GPT-3 · 2020', 9, '~9 giây'], ['GPT-3.5 · 2022', 36, '~36 giây'], ['GPT-4 · 2023', 300, '~5 phút'],
    ['Claude 3.5 Sonnet · 2024', 1700, '~28 phút'], ['o1 · cuối 2024', 2300, '~39 phút'], ['Claude 3.7 Sonnet · 2025', 3500, '~1 giờ'], ['Xu hướng · đầu 2026', 12000, '~3 giờ (dự phóng)']];
  const box = $('#growthBars'), max = Math.log10(14000);
  box.innerHTML = PTS.map(([l, s, v]) => `<div class="bar-row"><span class="bl">${l}</span><span class="bt"><i data-w="${(100 * Math.log10(s + 1)) / max}"></i></span><span class="bv">${v}</span></div>`).join('');
  const rowsEl = $$('.bar-row', box);
  const set = (e) => {
    const E = ERAS[e];
    $$('#eras .era').forEach((b) => b.classList.toggle('on', +b.dataset.era === e));
    $('#eraFill').style.width = ['8%', '50%', '100%'][e];
    $('#edAsk').textContent = E.ask; $('#edWho').textContent = E.who; $('#edDo').textContent = E.do;
    $('#edTags').innerHTML = E.yes.map((t) => `<span class="yes">✓ ${t}</span>`).join('') + E.no.map((t) => `<span>✗ ${t}</span>`).join('');
    $('#edNote').textContent = E.note;
    rowsEl.forEach((r, k) => { const on = E.hot.includes(k), bar = $('i', r); bar.style.width = on ? bar.dataset.w + '%' : '0'; r.classList.toggle('hot', e === 2 && k >= 6); r.style.opacity = on ? 1 : .35; });
  };
  $$('#eras .era').forEach((b) => { b.addEventListener('click', () => set(+b.dataset.era)); b.addEventListener('mouseenter', () => set(+b.dataset.era)); });
  set(0);
})();

/* ---------- 7. mindset: tool vs member ---------- */
(() => {
  const M = {
    tool: { h: 'AI là một công cụ, như cái cuốc', svg: '<svg viewBox="0 0 60 60"><path d="M12 48L40 20"/><path d="M34 14c6-4 12-2 14 0-2 2-4 8 0 14-6-1-10-4-14-14z"/></svg>',
      li: ['Bạn cầm, bạn làm; công cụ chỉ giúp nhanh hơn một chút', 'Mỗi lần dùng là bắt đầu lại từ đầu', 'Không biết gì về dự án, con người, quy trình', 'Bạn tự gom mọi thông tin rồi đưa vào', 'Kết quả "gần đúng", bạn sửa tay phần còn lại'] },
    member: { h: 'AI là một thành viên dự án', svg: '<svg viewBox="0 0 60 60"><circle cx="30" cy="18" r="9"/><path d="M12 52c2-11 9-17 18-17s16 6 18 17"/><path d="M40 30l4 4 8-8"/></svg>',
      li: ['Được onboard: biết người, biết việc, biết quy trình', 'Nhận việc bằng một câu, tự đi tìm thông tin cần thiết', 'Nhớ những gì đã làm, đã chốt, đã được góp ý', 'Làm việc trên máy tính và hệ thống như một nhân viên', 'Bạn giao việc, review, và chịu trách nhiệm cuối cùng'] },
  };
  const set = (k) => {
    $$('#msToggle button').forEach((b) => b.classList.toggle('on', b.dataset.m === k));
    const c = $('#msCard'), d = M[k]; c.className = 'ms-card ' + k;
    c.innerHTML = `<div class="ms-svg">${d.svg}</div><h3>${d.h}</h3><ul>${d.li.map((t, i) => `<li style="animation-delay:${i * 60}ms">${t}</li>`).join('')}</ul>`;
  };
  $$('#msToggle button').forEach((b) => b.addEventListener('click', () => set(b.dataset.m)));
  set('tool');
})();

/* ---------- 8. context: handover checklist + any machine via Git ---------- */
(() => {
  const btns = $$('#hoList button');
  const upd = () => { const p = Math.round((100 * btns.filter((b) => b.classList.contains('on')).length) / btns.length); $('#hoBar').style.width = p + '%'; $('#hoPct').textContent = p + '%'; };
  btns.forEach((b) => b.addEventListener('click', () => { b.classList.toggle('on'); upd(); }));
  upd();
  const svg = $('#setupSvg');
  $$('.mac', svg).forEach((m) => { m.addEventListener('mouseenter', () => svg.classList.add('hot')); m.addEventListener('mouseleave', () => svg.classList.remove('hot')); });
})();

/* ---------- 9. architecture: hover a component to see what it does ---------- */
(() => {
  const INFO = {
    w1: ['Nơi làm việc', 'Máy công ty', 'Cài VS Code (miễn phí) và Claude Code. Mở thư mục repo là bắt đầu làm việc.', ['Không cần server riêng', 'Mọi thao tác diễn ra ngay trên máy bạn']],
    w2: ['Nơi làm việc', 'Laptop ở nhà (WFH)', 'Cùng một repo, cùng một "bộ não". Chỉ cần git pull là AI có lại toàn bộ ký ức.', ['Không phải giải thích lại dự án', 'Không phụ thuộc tài khoản hay session']],
    w3: ['Nơi làm việc', 'Máy mới bất kỳ', 'git clone repo, cài n8n theo hướng dẫn trong infra/, là làm việc được ngay.', ['Hướng dẫn cài đặt nằm sẵn trong repo', 'Mỗi máy có file cấu hình riêng']],
    vsc: ['Nơi làm việc', 'Visual Studio Code', 'Trình soạn thảo miễn phí của Microsoft. Mở thư mục repo là thấy toàn bộ "bộ não" của AI, và Claude Code chạy ngay bên trong.', ['Miễn phí, nhẹ, dễ dùng', 'Nhìn thấy, sửa được mọi file AI tạo ra', 'Rất nhiều extension để mở rộng']],
    cc: ['AI Agent', 'Claude Code', 'Nhân viên AI làm việc ngay trong thư mục dự án: đọc, viết, chạy, kiểm tra.', ['Đọc và sửa file, tạo tài liệu, bảng tính', 'Chạy script để gọi hệ thống bên ngoài', 'Tự lập kế hoạch nhiều bước, tự soát kết quả', 'Luôn hỏi lại trước những việc khó đảo ngược']],
    repo: ['Bộ não', 'Git repo', 'Mọi thứ AI cần biết, viết bằng file văn bản đơn giản (Markdown).', ['CLAUDE.md: quy tắc AI đọc đầu tiên mỗi phiên', 'Context công ty, division, từng dự án', 'Prompt, task tự động, template dùng chung', 'Trí nhớ dài hạn: góp ý, sở thích của bạn']],
    gh: ['Bộ não', 'GitHub (private)', 'Nơi đồng bộ repo giữa các máy, kèm toàn bộ lịch sử thay đổi.', ['Repo private, chỉ bạn truy cập', 'Xem lại được ai sửa gì, khi nào', 'Không bao giờ chứa mật khẩu, token']],
    n8n: ['Cổng kết nối', 'n8n (self-hosted)', 'Công cụ automation miễn phí, chạy ngay trên máy bạn, làm "cổng" để Claude Code gọi Gmail, Drive, Chat, Calendar.', ['Mỗi kết nối là một webhook riêng, có token bảo vệ', 'Đăng nhập Google một lần bằng OAuth', 'Chạy ẩn, tự khởi động khi bật máy', 'Thêm hệ thống mới chỉ cần thêm một workflow']],
    mcp: ['Cổng kết nối', 'MCP', 'MCP là chuẩn kết nối giúp AI dùng trực tiếp công cụ của hệ thống khác, cài một lần là dùng.', ['Atlassian: đọc ticket, comment trên Jira, tài liệu trên Confluence', 'Figma: đọc thiết kế, đối chiếu UI với BRD']],
    sec: ['Bảo mật', 'Secret chỉ ở máy local', 'Mật khẩu, token nằm trong file riêng trên từng máy, đã được loại khỏi Git.', ['Repo chỉ ghi "lấy key ở đâu", không ghi key', 'Script đồng bộ tự chặn file có dấu hiệu secret']],
    gmail: ['Hệ thống', 'Gmail', 'Đọc luồng email, soạn draft đúng người nhận, đúng chữ ký. Bạn tự review và bấm gửi.', ['Trả lời đúng message mới nhất của luồng', 'Không tự gửi khi bạn chưa duyệt']],
    cal: ['Hệ thống', 'Google Calendar', 'Đọc lịch họp, lịch UAT, ngày nghỉ để lên kế hoạch và nhắc việc.', []],
    chat: ['Hệ thống', 'Google Chat', 'Đọc tin nhắn nhóm dự án, nhóm Dev và QC để tổng hợp tiến độ, rủi ro.', []],
    drive: ['Hệ thống', 'Drive · Docs · Sheets', 'Đọc BRD, transcript họp, file feedback; tạo và cập nhật Docs, Sheets, PDF.', []],
    jira: ['Hệ thống', 'Jira', 'Đọc ticket, bug, comment để làm báo cáo, phân tích bug, theo dõi tiến độ.', []],
    conf: ['Hệ thống', 'Confluence', 'Đọc tài liệu dự án, quy trình, biên bản trên Confluence.', []],
    hf: ['Dịch vụ ngoài', 'HuggingFace', 'Kho model AI mở: sinh ảnh minh hoạ cho slide, chuyển giọng nói thành chữ, dịch thuật…', ['Gọi qua n8n bằng API key', 'Key lưu riêng trên máy, không lên Git']],
    figma: ['Dịch vụ ngoài', 'Figma', 'Đọc design để đối chiếu với BRD, test case, viết hướng dẫn UAT có hình minh hoạ.', ['Kết nối qua MCP']],
    diag: ['Dịch vụ ngoài', 'Công cụ vẽ diagram', 'Mermaid, draw.io: AI tự vẽ sơ đồ quy trình, kiến trúc, timeline dưới dạng code, xuất ra ảnh hoặc PDF.', ['Claude Code tự chạy, không cần cổng kết nối', 'Sửa sơ đồ bằng một câu lệnh']],
    more: ['Hệ thống', 'Và nhiều hệ thống khác', 'Server, database, Zoho, công cụ nội bộ… bất cứ hệ thống nào có API đều có thể kết nối thêm.', []],
  };
  const svg = $('#archSvg'), info = $('#archInfo'), links = $$('#archLinks path');
  const show = (k) => {
    const [cat, t, d, li] = INFO[k];
    info.innerHTML = `<small>${cat}</small><h3>${t}</h3><p>${d}</p>${li.length ? `<ul>${li.map((x) => `<li>${x}</li>`).join('')}</ul>` : ''}<p class="hint">Di chuột vào từng khối trong sơ đồ.</p>`;
    $$('.ab', svg).forEach((g) => { g.classList.toggle('on', g.dataset.k === k); });
    const on = links.filter((p) => p.dataset.l.split(' ').includes(k));
    const near = new Set([k, ...on.flatMap((p) => p.dataset.l.split(' '))]);
    links.forEach((p) => p.classList.toggle('on', on.includes(p)));
    $$('.ab', svg).forEach((g) => g.classList.toggle('dim', !near.has(g.dataset.k)));
  };
  $$('.ab', svg).forEach((g) => g.addEventListener('mouseenter', () => show(g.dataset.k)));
  svg.addEventListener('mouseleave', () => { $$('.ab', svg).forEach((g) => g.classList.remove('dim')); });
  show('cc'); $$('.ab', svg).forEach((g) => g.classList.remove('dim')); links.forEach((p) => p.classList.remove('on'));
})();

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
      { n: ['cc'], t: 'Claude Code đọc context dự án trong Git', p: 'Người nhận, mẫu report, quy ước đã thống nhất từ trước.', out: L('đọc', 'stakeholders.md → To: 9 người phía khách · CC: nhóm dự án') + L('đọc', 'mẫu report hằng ngày và quy tắc highlight') },
      { n: ['jira'], t: 'Tự đọc Jira', p: 'Toàn bộ ticket UAT trong ngày.', out: L('Jira', '46 ticket hôm nay: 31 pass · 9 fail · 6 blocked') },
      { n: ['chat'], t: 'Tự đọc Google Chat giữa Dev và QC', p: 'Tổng hợp rủi ro, vấn đề, tiến độ thật.', out: L('Chat', '38 tin nhắn Dev ↔ QC: 2 rủi ro, 1 blocker môi trường') },
      { n: ['cal'], t: 'Đối chiếu lịch', p: 'Lịch UAT ngày mai và các buổi họp liên quan.', out: L('Calendar', 'ngày mai: UAT Round 2, 2 – 6 PM') },
      { n: ['gmail'], t: 'Soạn sẵn draft trên Gmail', p: 'Đúng To / CC, có bảng số liệu, rủi ro và việc cần khách hỗ trợ.', out: L('Gmail', 'đã tạo draft "UAT Update #8: Day 5"') },
      { n: ['pm'], done: true, t: 'PM review 5 phút rồi bấm Send', p: 'Đây là email AI đã soạn sẵn. Không phải nhờ AI sửa đi sửa lại.', out: UAT_MAIL },
    ] },
    { title: 'QC: "Viết <strong>test case</strong> cho tính năng Locate Us"', actor: 'QC', man: '~1 ngày', ai: '~1 giờ review', aiW: '13%', steps: [
      { n: ['pm'], t: 'QC giao việc bằng một câu', p: 'Chỉ nói tên tính năng cần viết test case.', out: L('QC:', 'Viết test case cho tính năng Locate Us.') },
      { n: ['cc'], t: 'Đọc rule và template trong Git', p: 'Rule viết test case cho khách hàng khó tính, template chuẩn SmartOSC, đã align với rule của khách.', out: L('đọc', 'rule viết TC của khách: mỗi bước một hành động, có evidence') + L('đọc', 'template TC SmartOSC, cách đặt ID TC-LOC-xx') },
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
      { n: ['cc'], t: 'Đọc rule viết BRD với khách kỹ tính', p: 'Văn phong, mức chi tiết, cách trả lời comment đã thống nhất.', out: L('đọc', 'rule: trả lời comment trung lập, dẫn nguồn quyết định') },
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
  const TREE = D('pm-ai/', 'Bộ não của nhân viên AI', 'Một Git repo duy nhất, mở bằng VS Code. Sắp xếp từ chung nhất ở trên đến chi tiết nhất ở dưới.', [
    F('CLAUDE.md', 'Bộ quy tắc gốc', 'File AI đọc đầu tiên mỗi phiên: phải đọc gì trước, dùng ngôn ngữ gì, quy ước đặt tên, những việc bắt buộc làm.', '- Giao tiếp tiếng Việt; code, tên file tiếng Anh\n- Trước khi làm dự án nào: đọc overview, stakeholders, notes\n- Phát hiện việc cần làm: tự thêm vào todo', 'Như cuốn sổ tay nhân viên'),
    D('infra/', 'Hạ tầng kết nối hệ thống ngoài', 'Mô tả AI kết nối Gmail, Calendar, Chat, Drive, Jira, Confluence qua n8n và MCP. Không lưu mật khẩu ở đây.', [
      F('integrations/', 'Các kết nối', 'n8n cho Gmail, Drive, Chat, Calendar; MCP cho Jira, Confluence: dùng để làm gì, gọi thế nào, lỗi hay gặp.', 'gmail: tạo draft, đọc thread\njira: đọc ticket, đọc comment'),
      F('machines/', 'Cấu hình riêng từng máy', 'Máy công ty, laptop ở nhà: mỗi máy cài đặt một chút khác nhau.'),
    ]),
    F('.claude/memory/', 'Trí nhớ dài hạn', 'Những điều AI học được khi làm việc với bạn (góp ý, sở thích, quy tắc), đồng bộ qua Git sang mọi máy.', '- Không dùng emoji trong email\n- Bảng trong Gmail: tô màu nền trên từng ô', 'Nhớ cả những lần bạn góp ý'),
    D('company/', 'Knowledge chung của SmartOSC', 'Những gì mọi dự án đều cần: công ty là ai, ai làm gì, quy trình chuẩn.', [
      F('org-chart.md', 'Sơ đồ tổ chức', 'Các khối, phòng ban, ai báo cáo cho ai, ai duyệt việc gì.', 'BOD → Delivery → Division → các dự án\nQA, Finance, HR, IT: đầu mối từng việc'),
      F('colleagues.md', 'Đồng nghiệp: email, vai trò, kỹ năng', 'Để AI biết hỏi ai, CC ai, giao việc cho ai.', 'An · Tech Lead · an@smartosc.com · Java, cloud\nBình · QC Lead · binh@smartosc.com · test strategy'),
      F('smartosc-process/', 'Quy trình SmartOSC', 'Lifecycle dự án, báo cáo, UAT, release, Jira workflow, bảo mật dữ liệu, tài chính dự án.', 'Report tuần: thứ Sáu trước 17:00\nUAT sign-off: cần evidence đủ chữ ký'),
    ]),
    D('division/', 'Knowledge chung của Division', 'Thành viên trong division, mối quan hệ, ai đang ở dự án nào, ai hỗ trợ được việc gì.', [
      F('members.md', 'Thành viên Division', 'Danh sách, vai trò, dự án hiện tại, thế mạnh.', 'Chi · BA · dự án ABC · BRD, prototype'),
      F('relationships.md', 'Mối quan hệ, cách phối hợp', 'Ai thường làm cùng ai, ai là backup của ai, ai duyệt ngân sách.', 'Backup PM dự án ABC: Dũng'),
    ]),
    D('knowledge/', 'Template, thuật ngữ dùng chung', 'Chữ ký email, mẫu báo cáo, thuật ngữ: dùng cho mọi dự án.', [
      F('templates/', 'Mẫu dùng chung', 'Chữ ký email, mẫu report tuần, mẫu MOM.'),
      F('glossary.md', 'Thuật ngữ', 'Các từ viết tắt của công ty và từng dự án.'),
    ]),
    D('projects/', 'Knowledge riêng từng dự án', 'Mỗi dự án một thư mục. Bàn giao một lần, AI nhớ mãi.', [
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


/* ---------- 13. new way of working ---------- */
(() => {
  const ROWS = [
    { k: 'Tổng hợp context', s: 'gom thông tin, chỉ đúng nguồn', c: 'h', v: [20, 40] },
    { k: 'Suy nghĩ giải pháp', s: 'hướng tiếp cận, hướng xử lý', c: 'h', v: [20, 40] },
    { k: 'Thực thi', s: 'viết, soạn, nhập liệu, copy · paste', c: 'w', v: [50, 0], cAfter: 'a', sAfter: 'AI làm toàn bộ, như nhân viên cấp dưới' },
    { k: 'Review và gửi đi', s: 'kiểm tra, quyết định, chịu trách nhiệm', c: 'h', v: [10, 20] },
  ];
  const CAP = ['Một nửa thời gian đi vào tự tay làm: viết, soạn, nhập liệu, copy · paste. (Tỉ lệ minh hoạ.)', 'Toàn bộ thời gian dành cho tổng hợp context, suy nghĩ và quyết định; phần thực thi do AI làm. (Tỉ lệ minh hoạ.)'];
  const box = $('#alloc');
  box.innerHTML = ROWS.map((r) => `<div class="al-row ${r.c}"><span>${r.k}<small>${r.s}</small></span><span class="bt"><i></i></span><b></b></div>`).join('');
  const set = (v) => {
    $$('#newToggle button').forEach((b) => b.classList.toggle('on', +b.dataset.v === v));
    $$('.al-row', box).forEach((row, i) => {
      const r = ROWS[i]; row.className = 'al-row ' + (v && r.cAfter ? r.cAfter : r.c);
      $('small', row).textContent = v && r.sAfter ? r.sAfter : r.s;
      $('i', row).style.width = r.v[v] * 2 + '%'; $('b', row).textContent = r.v[v] + '%';
    });
    $('#allocCap').textContent = CAP[v];
  };
  $$('#newToggle button').forEach((b) => b.addEventListener('click', () => set(+b.dataset.v)));
  set(0);
  const LOOP = ['Bạn chỉ cho AI đúng nguồn: dự án nào, tài liệu nào, luồng email nào, ai là người đọc.', 'Đây là giá trị thật của bạn: hiểu vấn đề, chọn hướng đi, cân nhắc rủi ro.', 'AI thực thi hoàn toàn: đọc, viết, soạn, tổng hợp, tự kiểm tra, như một nhân viên cấp dưới.', 'Bạn review kết quả, chỉnh nếu cần, rồi gửi đi. Trách nhiệm cuối cùng vẫn là của bạn.'];
  // productivity follows the toggle: x1 before, real multipliers (BA x3, Dev x5, QC x2) with AI Agent
  const prodRows = $$('#prod .prod-row');
  const fill = (v) => prodRows.forEach((r, k) => setTimeout(() => { const x = v ? +r.dataset.x : 1; $('i', r).style.width = (100 * x) / 5 + '%'; $('b', r).textContent = '×' + x; r.classList.toggle('up', !!v); }, v ? k * 160 : 0));
  $$('#newToggle button').forEach((b) => b.addEventListener('click', () => fill(+b.dataset.v)));
  fill(0);
  $$('#loopSvg .lp').forEach((g) => g.addEventListener('mouseenter', () => { $$('#loopSvg .lp').forEach((x) => x.classList.toggle('on', x === g)); $('#loopCap').textContent = LOOP[+g.dataset.l]; }));
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
  $$('#watchList button').forEach((b) => b.addEventListener('click', () => b.classList.toggle('on')));
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
