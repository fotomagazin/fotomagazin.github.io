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
