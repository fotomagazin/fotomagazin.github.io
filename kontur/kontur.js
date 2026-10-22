'use strict';
// Живые демо страницы Контура. Общие помощники ($, $$, reduce, whileVisible, wait) — из ../script.js.

// ---------- сложить / вычесть / пересечь / исключить: результат меняется сам, клик по названию — показать ----------
const boolDemo = $('#boolDemo'), boolBtns = $$('#boolMode span'), BOOL = boolBtns.map(b => b.dataset.m);
let boolAuto = true;
function showBool(i) { BOOL.forEach(m => boolDemo.classList.toggle('m-' + m, m === BOOL[i])); boolBtns.forEach((b, k) => b.classList.toggle('on', k === i)); }
showBool(0);
boolBtns.forEach((b, i) => b.addEventListener('click', () => { boolAuto = false; showBool(i); }));
if (!reduce) whileVisible(boolDemo, async alive => { for (let i = 1; alive() && boolAuto; i++) { await wait(2400); if (alive() && boolAuto) showBool(i % BOOL.length); } });

// ---------- выравнивание: как есть → по левому краю → по центру → поровну ----------
const alDemo = $('#alDemo'), alBtns = $$('#alMode span');
let alAuto = true;
function showAl(i) { for (let k = 0; k < 4; k++) alDemo.classList.toggle('st' + k, k === i); alBtns.forEach((b, k) => b.classList.toggle('on', k === i)); }
showAl(0);
alBtns.forEach((b, i) => b.addEventListener('click', () => { alAuto = false; showAl(i); }));
if (!reduce) whileVisible(alDemo, async alive => { for (let i = 1; alive() && alAuto; i++) { await wait(2200); if (alive() && alAuto) showAl(i % 4); } });

// ---------- скачивание: установщик под систему посетителя ----------
// Mac: процессор узнаём по видеокарте (Chrome называет «Apple M1…» или «Intel…»; Safari всегда говорит «Apple GPU» — тогда Apple,
// а рядом всегда есть ссылка «Mac с Intel»). Телефоны, планшеты, Linux — кнопка ведёт к выбору версии.
const DL = 'https://github.com/fotomagazin/kontur/releases/latest/download/';
const DLS = {
  apple: { f: 'Kontur-mac-apple.dmg', t: 'Скачать для Mac', a: 'Mac — Apple M1–M4' },
  intel: { f: 'Kontur-mac-intel.dmg', t: 'Скачать для Mac с Intel', a: 'Mac с Intel' },
  win: { f: 'Kontur-windows-setup.exe', t: 'Скачать для Windows', a: 'Windows' },
  web: { f: 'kontur.zip', t: 'Скачать браузерную версию', a: 'Браузерная версия' },
};
function macCpu() {
  try { const gl = document.createElement('canvas').getContext('webgl'), ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
    const r = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    if (/Intel|AMD|Radeon|NVIDIA|GeForce/i.test(r) && !/Apple/i.test(r)) return 'intel'; } catch (e) {}
  return 'apple';
}
function visitorOS() {
  const p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '', ua = navigator.userAgent;
  if (/Win/i.test(p) || /Windows NT/.test(ua)) return 'win';
  if ((/Mac/i.test(p) || /Macintosh/.test(ua)) && !(navigator.maxTouchPoints > 1)) return macCpu();   // iPad тоже называет себя «Mac»
  return null;
}
const OS = visitorOS();
$$('[data-dl="main"]').forEach(a => {
  const d = OS && DLS[OS], l = $('.dl-l', a);
  a.href = d ? DL + d.f : '#get';
  if (l) l.textContent = d ? d.t : 'Скачать бесплатно';
});
$$('[data-dl-alt]').forEach(p => {
  const keys = ['apple', 'intel', 'win', 'web'].filter(k => k !== OS);
  p.innerHTML = (OS ? 'Другие варианты: ' : 'Выберите: ') + keys.map(k => `<a href="${DL + DLS[k].f}">${DLS[k].a}</a>`).join(' · ');
});
$$('.plat').forEach(c => c.classList.toggle('on', !!OS && (c.dataset.os === (OS === 'win' ? 'win' : 'mac'))));
if (OS === 'intel') { const m = $('.plat[data-os="mac"] .plat-b');   // на Intel — своя кнопка первой и яркой
  if (m) { m.append(...[...m.children].reverse()); [...m.children].forEach(b => b.classList.toggle('ghost')); } }
