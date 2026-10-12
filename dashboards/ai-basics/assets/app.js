'use strict';
const $ = (id) => document.getElementById(id);
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize = (s) => s.toLocaleLowerCase('ru').replaceAll('ё','е');
function sourceLinks(ids) {return [...new Set(ids)].map(id => {const [title,url]=SOURCES[id];return `<a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHTML(title)} ↗</a>`;}).join('');}
const termById = Object.fromEntries(TERMS.map(t=>[t.id,t]));
let selectedGroup = 'all';
$('dictionary-grid').innerHTML = TERMS.map((t,i)=>`<article class="term" id="term-${t.id}" data-group="${t.group}">
  <div class="term-top"><span class="eyebrow">${GROUPS[t.group]}</span><span class="term-number">${String(i+1).padStart(2,'0')}</span></div>
  <h3>${escapeHTML(t.title)}</h3><p class="term-en">${escapeHTML(t.en)}</p>
  <p class="term-definition">${escapeHTML(t.definition)}</p><div class="example"><strong>ПРИМЕР</strong>${escapeHTML(t.example)}</div>
  <div class="difference"><strong>С чем не путать</strong>${escapeHTML(t.difference)}</div>
  <div class="related">${t.related.map(id=>`<a href="#term-${id}">${escapeHTML(termById[id].title)} →</a>`).join('')}</div>
  <div class="sources" aria-label="Официальные источники">${sourceLinks(t.sources)}</div></article>`).join('');
const searchText = TERMS.map(t=>normalize([t.title,t.en,t.definition,t.example,t.difference,GROUPS[t.group]].join(' ')));
$('filters').innerHTML = Object.entries({all:'Все понятия',...GROUPS}).map(([id,name])=>`<button class="btn ${id==='all'?'btn-primary':'btn-outline'}" data-filter="${id}" aria-pressed="${id==='all'}">${name}</button>`).join('');
function filterTerms() {
  const query = normalize($('search').value.trim()); let visible=0;
  TERMS.forEach((t,i)=>{const show=(selectedGroup==='all'||t.group===selectedGroup)&&searchText[i].includes(query);$(`term-${t.id}`).hidden=!show;if(show)visible++;});
  $('count').textContent=`Показано: ${visible} из ${TERMS.length}`;
  $('empty').hidden=visible>0;
  document.querySelectorAll('[data-filter]').forEach(b=>{const active=b.dataset.filter===selectedGroup;b.setAttribute('aria-pressed',String(active));b.classList.toggle('btn-primary',active);b.classList.toggle('btn-outline',!active);});
}
function resetFilter() {selectedGroup='all';$('search').value='';filterTerms();}
$('search').addEventListener('input',filterTerms);
$('filters').addEventListener('click',e=>{const button=e.target.closest('[data-filter]');if(button){selectedGroup=button.dataset.filter;filterTerms();}});
$('clear-search').addEventListener('click',resetFilter);
filterTerms();
$('route-links').innerHTML=['chatgpt','model','codex','agent','project','cwd','terminal','context','skill','mcp'].map(id=>`<a href="#term-${id}">${escapeHTML(termById[id].title)}</a>`).join('');
function revealHash() {
  const hash=location.hash.slice(1);
  if(hash.startsWith('term-')&&$(hash)) {resetFilter();requestAnimationFrame(()=>$(hash).scrollIntoView({block:'start'}));}
}
window.addEventListener('hashchange',revealHash);
document.addEventListener('click',e=>{const link=e.target.closest('a[href^="#term-"]');if(link){resetFilter();if(location.hash===link.getAttribute('href'))requestAnimationFrame(()=>$(location.hash.slice(1)).scrollIntoView({block:'start'}));}});
revealHash();
let currentComparison='product';
$('comparison-picker').innerHTML=COMPARISONS.map(c=>`<button class="btn btn-outline" data-compare="${c.id}" aria-pressed="false">${escapeHTML(c.title)}</button>`).join('');
function showComparison(id) {
  const c=COMPARISONS.find(c=>c.id===id);currentComparison=id;
  $('comparison').innerHTML=`<div class="comparison-cards">${c.items.map(([title,definition,example,termid])=>`<article class="comparison-card panel"><h3>${escapeHTML(title)}</h3><p>${escapeHTML(definition)}</p><div class="example"><strong>ПРИМЕР</strong>${escapeHTML(example)}</div><div class="sources">${sourceLinks(termById[termid].sources)}</div><div class="related"><a href="#term-${termid}">Подробнее в словаре →</a></div></article>`).join('')}</div><div class="comparison-key"><strong>Главное различие</strong>${escapeHTML(c.key)}</div>`;
  document.querySelectorAll('[data-compare]').forEach(b=>{const active=b.dataset.compare===id;b.classList.toggle('btn-primary',active);b.classList.toggle('btn-outline',!active);b.setAttribute('aria-pressed',String(active));});
}
$('comparison-picker').addEventListener('click',e=>{const b=e.target.closest('[data-compare]');if(b)showComparison(b.dataset.compare);});
showComparison(currentComparison);
$('theme').addEventListener('click',()=>{const light=document.documentElement.dataset.theme!=='silk';document.documentElement.dataset.theme=light?'silk':'luxury';$('theme').textContent=light?'Тёмная тема':'Светлая тема';});
// Учебная консоль: только заранее заданные строки, без доступа к файловой системе.
let directoryLevel=0;
const SHELLS={bash:{name:'Bash',where:'pwd',list:'ls',down:'cd materials',up:'cd ..',path:['/course','/course/materials']},powershell:{name:'PowerShell',where:'Get-Location',list:'Get-ChildItem',down:'Set-Location materials',up:'Set-Location ..',path:['C:\\course','C:\\course\\materials']},cmd:{name:'cmd',where:'cd',list:'dir',down:'cd materials',up:'cd ..',path:['C:\\course','C:\\course\\materials']}};
function updateTerminal(){const config=SHELLS[$('shell-select').value];$('shell-name').textContent=config.name;$('current-dir').textContent=config.path[directoryLevel];document.querySelector('[data-command="down"]').disabled=directoryLevel===1;document.querySelector('[data-command="up"]').disabled=directoryLevel===0;}
function resetTerminal(){directoryLevel=0;$('console-output').innerHTML='<div class="quiet">Выберите действие слева. Здесь показан учебный вывод, а не результат выполнения на вашем компьютере.</div>';updateTerminal();}
$('shell-select').addEventListener('change',resetTerminal);
document.querySelectorAll('[data-command]').forEach(b=>b.addEventListener('click',()=>{
  const action=b.dataset.command,config=SHELLS[$('shell-select').value];let response='';
  if(action==='where')response=config.path[directoryLevel];
  if(action==='list')response=directoryLevel===0?'materials/\nREADME.md':'lesson.html\nnotes.md';
  if(action==='down'){directoryLevel=1;response='Теперь текущая папка: '+config.path[1];}
  if(action==='up'){directoryLevel=0;response='Теперь текущая папка: '+config.path[0];}
  if(!$('console-output').querySelector('.console-entry'))$('console-output').innerHTML='';
  const entry=document.createElement('div');entry.className='console-entry';entry.innerHTML=`<div class="console-command">&gt; <code>${escapeHTML(config[action])}</code></div><div class="console-response">${escapeHTML(response)}</div>`;$('console-output').append(entry);updateTerminal();$('console-output').scrollTop=$('console-output').scrollHeight;
}));
$('console-reset').addEventListener('click',resetTerminal);resetTerminal();
$('console-sources').innerHTML=sourceLinks(['linux','cmd','powershell']);
function updateContext(){const history=Number($('history').value),files=Number($('files').value),total=100+history+files+200;
  $('history-value').textContent=history;$('files-value').textContent=files;$('legend-history').textContent=history;$('legend-files').textContent=files;
  let offset=0;[['instructions',100],['history',history],['files',files],['reserve',200]].forEach(([name,size])=>{const bar=$('bar-'+name);bar.setAttribute('x',offset*.6);bar.setAttribute('width',size*.6);offset+=size;});
  $('context-status').textContent=total<=1000?`Помещается: ${total} из 1 000. Свободно ещё ${1000-total} условных токенов.`:`Не помещается: нужно ${total} из 1 000. Превышение — ${total-1000} условных токенов.`;
  $('context-status').style.color=total>1000?'var(--color-error)':'var(--color-base-content)';
  $('context-svg-title').textContent=`Условное окно 1 000 токенов: инструкции 100, история ${history}, данные ${files}, резерв 200; всего ${total}.`;
  $('compact').disabled=history===100;
}
['history','files'].forEach(id=>$(id).addEventListener('input',updateContext));
$('compact').addEventListener('click',()=>{$('history').value=Math.max(100,Math.round(Number($('history').value)*.4/50)*50);updateContext();});
$('context-reset').addEventListener('click',()=>{$('history').value=300;$('files').value=200;updateContext();});
$('context-sources').innerHTML=sourceLinks(['context','compaction']);updateContext();
const answers = new Map();
function renderQuiz(){
  $('quiz').innerHTML=QUIZ.map((q,i)=>`<div class="quiz-item" id="quiz-${i}"><p class="quiz-question" id="quiz-label-${i}"><span class="number">${String(i+1).padStart(2,'0')}</span>${escapeHTML(q.q)}</p><div class="quiz-choices" role="group" aria-labelledby="quiz-label-${i}">${q.options.map((o,j)=>`<button class="quiz-option" data-question="${i}" data-answer="${j}" aria-pressed="false"><span aria-hidden="true">${String.fromCharCode(65+j)}.</span>${escapeHTML(o)}</button>`).join('')}</div><p id="quiz-feedback-${i}" class="quiz-feedback" role="status" aria-live="polite"></p></div>`).join('');
  $('quiz-score').textContent='Отвечено: 0 из 6';
}
$('quiz').addEventListener('click',e=>{const b=e.target.closest('[data-question]');if(!b)return;const i=Number(b.dataset.question),chosen=Number(b.dataset.answer),q=QUIZ[i];answers.set(i,chosen);document.querySelectorAll(`[data-question="${i}"]`).forEach(o=>o.setAttribute('aria-pressed',String(Number(o.dataset.answer)===chosen)));$('quiz-feedback-'+i).innerHTML=`<strong>${chosen===q.answer?'✓ Верно.':'Попробуйте ещё раз.'}</strong> ${escapeHTML(q.why)}`;const correct=[...answers].filter(([i,j])=>QUIZ[i].answer===j).length;$('quiz-score').textContent=`Отвечено: ${answers.size} из 6 · Верно: ${correct} из 6`;});
$('quiz-reset').addEventListener('click',()=>{answers.clear();renderQuiz();});renderQuiz();
const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){document.querySelectorAll('.nav-link').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}}},{rootMargin:'-10% 0px -70% 0px',threshold:0});
document.querySelectorAll('main>section').forEach(section=>observer.observe(section));
