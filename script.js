'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// ---------- ссылки на Telegram: меняются здесь, в одном месте ----------
const TG = {
  channel: 'https://t.me/fotomag_app',   // канал с новостями
  bot: 'https://t.me/fotomagazin_bot',   // бот для отзывов
};
$$('[data-tg]').forEach(a => { a.href = TG[a.dataset.tg]; a.target = '_blank'; a.rel = 'noopener'; });

// ---------- появление блоков при прокрутке ----------
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; e.target.classList.add('in'); io.unobserve(e.target);
  e.target.dispatchEvent(new CustomEvent('reveal'));
}), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
$$('.reveal').forEach(el => io.observe(el));

// ---------- манифест: слова загораются по мере прокрутки ----------
const st = $('#statement');
if (st) st.innerHTML = st.innerHTML.split(/(\s+)/).map(w => /^\s+$/.test(w) ? w : `<span class="w">${w}</span>`).join('');
const words = st ? $$('.w', st) : [];

// ---------- прокрутка: шапка, наклон окна, манифест ----------
const nav = $('#nav'), heroWin = $('#heroWin');
let ticking = false;
function onScroll() {
  nav.classList.toggle('scrolled', scrollY > 8);
  if (!reduce && heroWin) heroWin.style.setProperty('--p', clamp(scrollY / (innerHeight * .55)).toFixed(3));
  if (st) { const r = st.getBoundingClientRect(), t = clamp((innerHeight * .82 - r.top) / (r.height + innerHeight * .3));
    const lit = Math.round(t * words.length);
    words.forEach((w, i) => w.classList.toggle('lit', reduce || i < lit)); }
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener('resize', onScroll); onScroll();

// ---------- счётчики ----------
$$('.stat').forEach(s => s.addEventListener('reveal', () => {
  const b = $('b', s), to = +b.dataset.count, suf = b.dataset.suffix || '', t0 = performance.now(), dur = reduce ? 0 : 1400;
  (function step(t) { const k = dur ? clamp((t - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3);
    b.textContent = Math.round(to * e) + suf; if (k < 1) requestAnimationFrame(step); })(t0);
}));

// ---------- до / после (свет и цвет, восстанавливающая кисть) ----------
$$('.ba').forEach(ba => {
const baRange = $('.ba-range', ba);
let baTouched = false;
const setBA = v => ba.style.setProperty('--x', v + '%');
baRange.addEventListener('input', () => { baTouched = true; setBA(baRange.value); });
ba.addEventListener('reveal', () => {   // при первом показе шторка сама проезжает туда-обратно
  if (reduce) return;
  const keys = [[0, 50], [900, 14], [2000, 86], [2900, 50]], t0 = performance.now() + 500;
  (function step(t) {
    if (baTouched) return; const dt = t - t0;
    if (dt >= 0) { let i = keys.findIndex(k => k[0] > dt); if (i < 0) { setBA(50); baRange.value = 50; return; }
      const [ta, va] = keys[i - 1] || keys[0], [tb, vb] = keys[i], k = clamp((dt - ta) / (tb - ta)), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const v = va + (vb - va) * e; setBA(v); baRange.value = v; }
    requestAnimationFrame(step);
  })(performance.now());
});
});

// ---------- общий помощник: повторять, пока блок на экране ----------
function whileVisible(el, fn) {
  let on = false; new IntersectionObserver(([e]) => { const was = on; on = e.isIntersecting; if (on && !was) fn(() => on); }, { threshold: .25 }).observe(el);
}
const wait = ms => new Promise(r => setTimeout(r, ms));
// живые демо ниже есть только на странице Фотомагазина — на других страницах (Контур) блоки просто пропускаются

// ---------- кадрирование: рамка меняет пропорции и прилипает к краям ----------
const cropDemo = $('#cropDemo');
if (cropDemo) {
const frame = $('#cropFrame'), cropLbl = $('#cropLbl'), ratioChips = $$('#ratioChips span');
const CROPS = [
  { r: 4 / 5, h: .86, cx: .62, cy: .5, lbl: '4 : 5', chip: 0 },
  { r: 1, h: .74, cx: .64, cy: .47, lbl: '1 : 1', chip: 1 },
  { r: 16 / 9, h: 9, cx: .5, cy: .55, lbl: '16 : 9', chip: 2 },   // шире фото — прилипает к левому и правому краю
  { r: 9 / 16, h: 1.2, cx: .64, cy: .5, lbl: '9 : 16', chip: 4 },  // выше фото — прилипает к верху и низу
  { r: 3 / 2, h: 1, cx: .5, cy: .5, lbl: '3 : 2', chip: 3 },
];
function placeCrop(c) {
  const A = 3 / 2;   // пропорция картинки: ширина = 1, высота = 1/A
  let h = c.h / A, w = h * c.r, snapped = false;
  if (w >= 1) { w = 1; h = w / c.r; snapped = true; }
  if (h >= 1 / A) { h = 1 / A; w = h * c.r; snapped = true; }
  const x = clamp(c.cx - w / 2, 0, 1 - w), y = clamp(c.cy * (1 / A) - h / 2, 0, 1 / A - h);
  Object.assign(frame.style, { left: x * 100 + '%', top: y * A * 100 + '%', width: w * 100 + '%', height: h * A * 100 + '%' });
  cropLbl.textContent = c.lbl; ratioChips.forEach((s, i) => s.classList.toggle('on', i === c.chip));
  cropDemo.classList.toggle('snapped', snapped && c.r !== 1.5);
}
placeCrop(CROPS[0]);
if (!reduce) whileVisible(cropDemo, async alive => { for (let i = 1; alive(); i++) { await wait(2300); if (alive()) placeCrop(CROPS[i % CROPS.length]); } });
}

// ---------- выделение: овал вокруг солнца, потом лассо по горе ----------
const selDemo = $('#selDemo');
if (selDemo) {
const lasso = $('.a.lasso', selDemo), modes = $$('#selMode span');
function selState(m) {
  selDemo.classList.remove('m-ell', 'm-lasso'); selDemo.classList.add('m-' + m);
  modes.forEach(s => s.classList.toggle('on', s.dataset.m === m));
  if (m === 'lasso' && !reduce) { lasso.classList.remove('drawing'); void lasso.getBBox(); lasso.classList.add('drawing');
    setTimeout(() => lasso.classList.remove('drawing'), 1400); }
}
selState('ell');
if (!reduce) whileVisible(selDemo, async alive => { for (let i = 1; alive(); i++) { await wait(3000); if (alive()) selState(i % 2 ? 'lasso' : 'ell'); } });
}

// ---------- текст: печатается разными шрифтами ----------
const tx = $('#tx');
if (tx) {
const fontChips = $$('#fontChips span');
const WORDS = [['Алтай', '"Unbounded"', 700, 'normal'], ['Байкал', '"Playfair Display"', 700, 'italic'], ['Карелия', '"Caveat"', 700, 'normal'], ['Камчатка', '"Lobster"', 400, 'normal'], ['Эльбрус', '"Unbounded"', 700, 'normal', true]];
function setFont(i) { const [, f, w, s, fx] = WORDS[i]; Object.assign(tx.style, { fontFamily: f + ', sans-serif', fontWeight: w, fontStyle: s }); tx.classList.toggle('fx', !!fx); fontChips.forEach((c, k) => c.classList.toggle('on', k === i)); }
setFont(0); tx.textContent = WORDS[0][0];
if (!reduce) whileVisible($('#textDemo'), async alive => {
  for (let i = 0; alive(); i = (i + 1) % WORDS.length) {
    const word = WORDS[i][0];
    if (tx.textContent !== word) { setFont(i); for (let k = 1; k <= word.length && alive(); k++) { tx.textContent = word.slice(0, k); await wait(110); } }
    await wait(1700);
    for (let k = word.length - 1; k >= 0 && alive(); k--) { tx.textContent = word.slice(0, k); await wait(45); }
    await wait(250);
  }
});
}

// ---------- стили: фото само переключается между стилями (клик по названию — показать) ----------
if ($('#stDemo')) {
const stImgs = $$('#stDemo > img'), stBtns = $$('#stChips button'), stName = $('#stName');
let stAuto = true;
function showStyle(i) { stImgs.forEach((im, k) => im.classList.toggle('on', k === i)); stBtns.forEach((b, k) => b.classList.toggle('on', k === i)); stName.textContent = stBtns[i].textContent; }
showStyle(0);
stBtns.forEach((b, i) => b.addEventListener('click', () => { stAuto = false; showStyle(i); }));
if (!reduce) whileVisible($('#stDemo'), async alive => { for (let i = 1; alive() && stAuto; i++) { await wait(2200); if (alive() && stAuto) showStyle(i % stImgs.length); } });
}

// ---------- скриншоты во вкладках ----------
if ($('.tab-stage')) {
const tabBtns = $$('#tools .seg button'), tabImgs = $$('.tab-stage img'), tabCap = $('#tabCap');
const CAPS = ['Стиль «Кино» в один клик. Справа — ваше фото в каждом из стилей.',
  'Пропорция 4 : 5, сетка третей и размер будущего кадра — прямо поверх фото.',
  'Наклон −4°: фото поворачивается, а рамка сама обходит пустые углы. Частая сетка помогает поймать горизонт.',
  'Овальное выделение вокруг солнца. Внизу — что можно сделать с выделенным.',
  'Текст редактируется прямо на снимке, а шрифт и размер меняются на лету.'];
let tabAuto = true;
function showTab(i) { tabBtns.forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', k === i); });
  tabImgs.forEach((im, k) => im.classList.toggle('on', k === i)); tabCap.textContent = CAPS[i]; }
tabBtns.forEach((b, i) => b.addEventListener('click', () => { tabAuto = false; showTab(i); }));
if (!reduce) whileVisible($('.tab-stage'), async alive => { let i = 0; while (alive() && tabAuto) { await wait(4200); if (alive() && tabAuto) showTab(i = (i + 1) % tabImgs.length); } });
}

// ---------- карточки: мягкая подсветка под курсором ----------
$$('.b-card').forEach(c => c.addEventListener('pointermove', e => {
  const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px');
}));

// ---------- окно отзыва: текст уходит на сервер бота, а оттуда — автору в Telegram ----------
const FEEDBACK_API = 'https://fotomagazin-bot.fotomagazin.workers.dev/feedback';
const fbModal = $('#fbModal'), fbForm = $('#fbForm'), fbText = $('#fbText'), fbStatus = $('#fbStatus');
const FB_HINT = { idea: 'Чего не хватает? Какой инструмент нужен, что неудобно?', bug: 'Что случилось и что вы делали перед этим? Чем подробнее — тем быстрее исправим.', other: 'Ваше сообщение' };
let fbKind = 'idea';
function setFbKind(k) { fbKind = k; $$('#fbType button').forEach(b => b.classList.toggle('on', b.dataset.t === k)); fbText.placeholder = FB_HINT[k]; }
function openFb(k) { setFbKind(k); fbForm.classList.remove('sent'); fbStatus.textContent = ''; fbStatus.className = ''; fbModal.classList.add('open'); setTimeout(() => fbText.focus(), 50); }
function closeFb() { fbModal.classList.remove('open'); }
$$('[data-form]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); openFb(a.dataset.form); }));
$$('#fbType button').forEach(b => b.addEventListener('click', () => setFbKind(b.dataset.t)));
$('#fbClose').addEventListener('click', closeFb);
fbModal.addEventListener('pointerdown', e => { if (e.target === fbModal) closeFb(); });
addEventListener('keydown', e => { if (e.key === 'Escape') closeFb(); });
fbText.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) fbForm.requestSubmit(); });
fbForm.addEventListener('submit', async e => {
  e.preventDefault(); const text = fbText.value.trim(), send = $('#fbSend');
  if (text.length < 3) { fbStatus.className = 'err'; fbStatus.textContent = 'Напишите хотя бы пару слов'; fbText.focus(); return; }
  send.disabled = true; fbStatus.className = ''; fbStatus.textContent = 'Отправляю…';
  const body = { type: fbKind, text: (document.body.dataset.app ? `[${document.body.dataset.app}] ` : '') + text, contact: $('#fbContact').value.trim(), source: 'site', website: $('#fbHp').value };
  try {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 15000);
    const r = await fetch(FEEDBACK_API, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: JSON.stringify(body), signal: ctl.signal });
    clearTimeout(t); const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.ok) throw Error(d.error === 'rate' ? 'rate' : 'fail');
    fbText.value = ''; fbForm.classList.add('sent'); setTimeout(closeFb, 2200);
  } catch (err) {   // не получилось — текст не теряем и даём запасной путь
    fbStatus.className = 'err';
    fbStatus.innerHTML = err.message === 'rate' ? 'Слишком много сообщений подряд — попробуйте через несколько минут.'
      : `Не получилось отправить. Напишите в <a href="${TG.bot}" target="_blank" rel="noopener">Telegram-бот</a> — текст можно скопировать отсюда.`;
  }
  send.disabled = false;
});

// ---------- счётчик скачиваний и номер версии ----------
// GitHub сам считает, сколько раз скачали файл из релизов, и знает последнюю версию. Спрашиваем его напрямую,
// а если не ответил (лимит запросов, сеть) — у нашего сервера, который помнит последний ответ (он знает только Фотомагазин).
// Другая программа (страница Контура) называет свой репозиторий и ключ кэша в <body data-repo="…" data-cache="…">.
const REPO = document.body.dataset.repo || 'fotomagazin/fotomagazin', REL_KEY = document.body.dataset.cache || 'fm-rel', SHOW_FROM = 1;   // SHOW_FROM — с какого числа показывать счётчик
const plural = (n, f) => f[n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
async function releaseInfo() {
  try { const c = JSON.parse(localStorage[REL_KEY] || 'null'); if (c && Date.now() - c.t < 10 * 60 * 1000) return c; } catch (e) {}
  let n = null, tag = null;
  try { const r = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100`);
    if (r.ok) { const rels = await r.json(); n = rels.reduce((s, rel) => s + rel.assets.reduce((a, x) => a + x.download_count, 0), 0);
      const L = rels.find(x => !x.draft && !x.prerelease); tag = L && L.tag_name; } } catch (e) {}
  if (n === null && REPO === 'fotomagazin/fotomagazin') try { const d = await (await fetch(FEEDBACK_API.replace('/feedback', '/downloads'))).json(); n = d.count; tag = d.latest && d.latest.tag; } catch (e) {}
  const info = { n, tag, t: Date.now() };
  if (n !== null) try { localStorage[REL_KEY] = JSON.stringify(info); } catch (e) {}
  return info;
}
releaseInfo().then(({ n, tag }) => {
  // номер версии на сайте — всегда как у последнего релиза («v0.2.0» → «0.2»)
  if (tag) $$('[data-ver]').forEach(el => el.textContent = tag.replace(/^v/, '').replace(/\.0$/, ''));
  if (n === null || n < SHOW_FROM) return;   // нет данных или пока мало — счётчик просто не показываем
  $$('.dl-count').forEach(el => {
    el.hidden = false; $('span', el).textContent = plural(n, ['скачивание', 'скачивания', 'скачиваний']);
    const b = $('b', el), t0 = performance.now(), dur = reduce || document.hidden ? 0 : 1600;   // в фоновой вкладке — сразу итог
    b.textContent = n.toLocaleString('ru-RU'); requestAnimationFrame(() => el.classList.add('show'));
    (function step(t) { const k = dur ? clamp((t - t0) / dur) : 1; b.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))).toLocaleString('ru-RU');
      if (k < 1) requestAnimationFrame(step); })(t0);
  });
});

$('#year').textContent = new Date().getFullYear();
