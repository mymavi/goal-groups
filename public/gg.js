/* Goal Groups v3: shared board. Real goals live in Cloudflare D1 via /api. Example pins are fictional and marked.
   This device keeps only your edit tokens (for goals you posted) and witness tokens (for check-ins). */
(function(){
const DAY=864e5;
const CATS={all:'All',outdoors:'Outdoors',running:'Running',fitness:'Fitness',build:'Build & ship',habits:'Habits',creative:'Creative',learn:'Learn'};
const MIN_REAL=6; // show example pins until the board has this many real goals
// Example pins: fictional people, first names only. No real hosts or businesses.
const SEED=[
 {id:'maya-winter-runs',kind:'Trying to achieve',title:'Run three mornings a week through winter',cat:'running',by:'Maya',town:'Dolores, CO',starts:'Done by Mar 1, 2027',why:'I keep starting strong in September and vanishing by Thanksgiving. I want spotters who will notice if I go quiet.',cap:1,lockAt:1,joined:1,witnesses:0,daysLeft:112},
 {id:'jordan-run-buddy',kind:'Searching for',title:'Searching for a running buddy in Dolores / Cortez',cat:'running',by:'Jordan',town:'Cortez, CO',starts:'Open \u00b7 hoping by Dec 15',why:'Solo miles get lonely. Looking for someone who wants easy 3-5 mile loops, weekends preferred, no race pressure.',cap:2,lockAt:2,joined:1,witnesses:0,daysLeft:36},
 {id:'sam-sixty-dry',kind:'Trying to achieve',title:'Sixty days without alcohol',cat:'habits',by:'Sam',town:'Montrose, CO',starts:'Done by Jan 8, 2027',why:'Not a forever vow. Just sixty honest days so I can see how I feel. I need people who will ask how it\u2019s going without making it weird.',cap:1,lockAt:1,joined:1,witnesses:1,daysLeft:60},
 {id:'riley-spanish-course',kind:'Trying to achieve',title:'Finish a beginner Spanish course by spring',cat:'learn',by:'Riley',town:'Denver, CO',starts:'Done by Apr 1, 2027',why:'My partner\u2019s family speaks Spanish at holidays and I want to keep up. Duolingo alone hasn\u2019t stuck. Weekly check-ins would help.',cap:1,lockAt:1,joined:1,witnesses:0,daysLeft:143},
 {id:'avery-montrose-ride',kind:'In need of',title:'In need of a ride share to Montrose on Tuesdays',cat:'habits',by:'Avery',town:'Dolores, CO',starts:'Needed through Dec 2026',why:'Physical therapy appointment every Tuesday morning. Happy to chip in for gas. Looking for someone already heading that way.',cap:2,lockAt:2,joined:1,witnesses:0,daysLeft:52},
 {id:'casey-short-stories',kind:'Trying to achieve',title:'Write one short story a month for six months',cat:'creative',by:'Casey',town:'Cortez, CO',starts:'Done by May 9, 2027',why:'I\u2019ve talked about writing for years. I want six finished drafts, even if they\u2019re rough. Spotters who will ask "where\u2019s this month\u2019s?"',cap:1,lockAt:1,joined:1,witnesses:0,daysLeft:181},
 {id:'quinn-sunday-dinners',kind:'Trying to achieve',title:'Family Sunday dinners, no phones, eight weeks straight',cat:'habits',by:'Quinn',town:'Denver, CO',starts:'Done by Jan 4, 2027',why:'Our table has turned into parallel screens. Eight Sundays of actual conversation feels like a real goal, not a vibe.',cap:1,lockAt:1,joined:1,witnesses:1,daysLeft:56},
 {id:'morgan-climb-partner',kind:'Searching for',title:'Searching for a climbing partner at the gym (weekday evenings)',cat:'fitness',by:'Morgan',town:'Montrose, CO',starts:'Open \u00b7 first session by Dec 1',why:'New to indoor climbing. Prefer someone patient at my level. Not looking for a coach, just a regular partner.',cap:2,lockAt:2,joined:1,witnesses:0,daysLeft:22},
 {id:'taylor-food-pantry',kind:'Trying to achieve',title:'Volunteer eight hours a month at the food pantry',cat:'habits',by:'Taylor',town:'Dolores, CO',starts:'Through Mar 2027',why:'I want showing up for neighbors to be a habit, not a once-a-year thing. Monthly hour log, honest if I miss.',cap:1,lockAt:1,joined:1,witnesses:0,daysLeft:142},
 {id:'drew-spanish-partner',kind:'In need of',title:'In need of a Spanish conversation partner (beginner)',cat:'learn',by:'Drew',town:'Denver, CO',starts:'Open',why:'Classes teach vocabulary. I freeze when someone asks me a real question. Looking for 30 minutes a week, coffee or Zoom.',cap:2,lockAt:2,joined:1,witnesses:0,daysLeft:90},
 {id:'dolores-14er',kind:'Trying to achieve',title:'First 14er by July. Need people who\u2019ll train with me',cat:'outdoors',by:'Maren',town:'Dolores, CO',starts:'Starts Mar 1',cap:5,lockAt:4,joined:2,witnesses:3,daysLeft:6,tier:'A-tier \u00b7 4 goals \u00b7 91% show-up rate'},
 {id:'kai-launch',kind:'Looking for spotters',title:'Open my bike repair shop by March 31',cat:'build',by:'Kai',town:'Cortez, CO',starts:'Starts Dec 1',cap:1,lockAt:1,joined:1,witnesses:7,daysLeft:0,tier:'A-tier \u00b7 5 goals \u00b7 89% show-up rate'},
 {id:'c25k-denver',kind:'Looking for',title:'Couch-to-5K crew. Three runs a week, total beginners',cat:'running',by:'Dev',town:'Denver, CO',starts:'Starts Jan 5',cap:8,lockAt:6,joined:5,witnesses:2,daysLeft:3},
 {id:'ship30',kind:'Trying to achieve',title:'Ship a side project in 30 days, demo night at the end',cat:'build',by:'Priya',town:'Remote \u00b7 MT evenings',starts:'Starts Jan 6',cap:8,lockAt:6,joined:3,witnesses:6,daysLeft:9,tier:'S-tier \u00b7 11 goals \u00b7 95% show-up rate'},
 {id:'dryjan-foco',kind:'In need of',title:'A Dry January crew who\u2019ll actually text back',cat:'habits',by:'Luis',town:'Fort Collins, CO',starts:'Jan 1 to 31',cap:6,lockAt:4,joined:6,witnesses:4,daysLeft:0},
 {id:'climb-springs',kind:'Looking for',title:'Learn to climb. Two nights a week, send a V2 by March',cat:'fitness',by:'Sam',town:'Colorado Springs, CO',starts:'Starts Jan 8',cap:6,lockAt:4,joined:1,witnesses:1,daysLeft:12},
 {id:'words500',kind:'Trying to achieve',title:'Write 500 words a day for 30 days',cat:'creative',by:'June',town:'Remote',starts:'Starts Jan 1',cap:10,lockAt:6,joined:7,witnesses:9,daysLeft:0,tier:'B-tier \u00b7 2 goals \u00b7 78% show-up rate'},
 {id:'ski-legs',kind:'Looking for',title:'Ski fitness: six weeks of leg days before a February hut trip',cat:'fitness',by:'Theo',town:'Salida, CO',starts:'Starts Dec 1',cap:6,lockAt:4,joined:3,witnesses:1,daysLeft:4},
 {id:'half-durango',kind:'Trying to achieve',title:'First half marathon in May. Slow and steady',cat:'running',by:'Ana',town:'Durango, CO',starts:'Starts Feb 2',cap:8,lockAt:6,joined:4,witnesses:5,daysLeft:8,tier:'A-tier \u00b7 6 goals \u00b7 88% show-up rate'},
 {id:'lena-books',kind:'Looking for spotters',title:'Read 24 books in 2027, two a month',cat:'creative',by:'Lena',town:'Montrose, CO',starts:'Starts Jan 1',cap:1,lockAt:1,joined:1,witnesses:4,daysLeft:0,tier:'S-tier \u00b7 14 goals \u00b7 93% show-up rate'},
 {id:'cook-gj',kind:'In need of',title:'Accountability to cook dinner at home five nights a week',cat:'habits',by:'Rae',town:'Grand Junction, CO',starts:'Starts Jan 12',cap:6,lockAt:4,joined:2,witnesses:2,daysLeft:10}
];
const LS={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const K_MINE='gg_v3_mine',K_ME='gg_v3_me',K_PROFILE='gg_v3_profile';
const mine=()=>LS.get(K_MINE,{});            // {goalId: editToken}
const meAll=()=>LS.get(K_ME,{});             // {goalId: {witness:{personId,token,verdict}, crew:{personId,token}}}
function setMe(id,role,val){const A=meAll();A[id]=A[id]||{};if(val)A[id][role]=val;else delete A[id][role];LS.set(K_ME,A)}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDay=d=>d?new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:(d.slice(0,4)!==String(new Date().getFullYear())?'numeric':undefined)}):'';

/* ---------- API ---------- */
async function call(method,path,body,headers={}){
 const r=await fetch('/api/'+path,{method,headers:{...(body?{'content-type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined});
 let j={};try{j=await r.json()}catch(e){}
 if(!r.ok)throw new Error(j.error||('Request failed ('+r.status+')'));return j}
const api={
 list:()=>call('GET','goals'),
 get:id=>call('GET','goals/'+encodeURIComponent(id)),
 post:b=>call('POST','goals',b),
 witness:(id,b)=>call('POST','goals/'+encodeURIComponent(id)+'/witness',b),
 checkin:(id,b)=>call('POST','goals/'+encodeURIComponent(id)+'/checkin',b),
 remove:(id,token)=>call('DELETE','goals/'+encodeURIComponent(id),null,{'x-edit-token':token})
};

/* ---------- view models ---------- */
function viewExample(p){const deadline=Date.now()+p.daysLeft*DAY-7*36e5;const locked=p.joined>=p.lockAt;
 return {...p,example:true,locked,need:Math.max(0,p.lockAt-p.joined),deadline,left:p.daysLeft,solo:p.cap<=1,me:{}}}
function viewReal(g){const me=meAll()[g.id]||{};const locked=g.joined>=g.lockAt;const left=Math.max(0,Math.ceil((g.fillDeadline-Date.now())/DAY));
 return {...g,example:false,starts:g.start?'Starts '+fmtDay(g.start):'Start date TBD',locked,need:Math.max(0,g.lockAt-g.joined),deadline:g.fillDeadline,left,solo:g.cap<=1,me,mine:!!mine()[g.id]}}
const examples=()=>SEED.map(viewExample);
const getExample=id=>{const p=SEED.find(x=>x.id===id);return p?viewExample(p):null};
const isExampleId=id=>SEED.some(x=>x.id===id);
async function getPin(id){if(isExampleId(id))return getExample(id);const {goal}=await api.get(id);return viewReal(goal)}
async function loadBoard(){let real=[],err=null;try{real=(await api.list()).goals.map(viewReal)}catch(e){err=e}
 const showEx=real.length<MIN_REAL;return {real,pins:showEx?[...real,...examples()]:real,showEx,err}}

/* ---------- pin ---------- */
function statusLine(v){
 if(!v.example&&v.dueReached){const c=v.checkins||{saw:0,missed:0};const n=c.saw+c.missed;
  return n?`Check-ins: ${c.saw} saw it \u00b7 ${c.missed} didn\u2019t happen`:'Done-by date reached \u00b7 waiting on spotters'}
 if(v.solo)return 'Solo goal \u00b7 spotters welcome';
 if(v.locked)return v.joined>=v.cap?'Crew locked in \u00b7 full':'Crew locked in \u00b7 '+(v.cap-v.joined)+' spot'+(v.cap-v.joined===1?'':'s')+' left';
 return v.need+' more to lock the crew \u00b7 '+v.left+'d left'}
function actionsHTML(v){
 if(v.example)return `<button type="button" class="witness" data-act="example">Spot</button>${v.solo?'':'<button type="button" class="join" data-act="example">Join crew</button>'}`;
 if(v.mine)return `<a class="pa-link" href="goal.html?id=${encodeURIComponent(v.id)}">Your goal \u00b7 manage</a>`;
 const w=v.me.witness;
 if(w&&v.dueReached)return `<button type="button" class="saw${w.verdict==='saw'?' on':''}" data-act="saw">Saw it</button><button type="button" class="missed${w.verdict==='missed'?' on':''}" data-act="missed">Didn\u2019t happen</button>`;
 const wb=w?`<button type="button" class="witness on" data-act="witnessing">Spotting \u2713</button>`:`<button type="button" class="witness" data-act="witness">Spot</button>`;
 const canJoin=!v.solo&&!v.dueReached&&(v.me.crew||v.joined<v.cap);
 const jb=canJoin?`<button type="button" class="join${v.me.crew?' on':''}" data-act="${v.me.crew?'joined':'join'}">${v.me.crew?'In the crew':'Join crew'}</button>`:'';
 return wb+jb}
function pinHTML(v,opts={}){const pct=Math.round(v.joined/v.cap*100),lk=Math.round(v.lockAt/v.cap*100);const W=v.witnesses+' spotter'+(v.witnesses===1?'':'s');
 const crew=v.solo?`<div class="pin-wit"><span class="eyes">${'<i></i>'.repeat(Math.min(5,v.witnesses))}</span><b>${v.witnesses?W:'No spotters yet. Be the first.'}</b></div>`:
  `<div class="bar${v.locked?' locked':''}" role="img" aria-label="${v.joined} of ${v.cap} in the crew, locks at ${v.lockAt}"><span style="width:${pct}%"></span><i style="left:${lk}%"></i></div>
  <div class="pin-count"><span><b>${W}</b></span><span class="muted">crew ${v.joined} of ${v.cap} \u00b7 locks at ${v.lockAt}</span></div>`;
 const title=v.example?esc(v.title):`<a href="goal.html?id=${encodeURIComponent(v.id)}">${esc(v.title)}</a>`;
 const tag=v.example?'<span class="pin-example">Example</span>':(v.mine?'<span class="pin-mine">Your goal</span>':'');
 const due=v.example?'':`<p class="pin-due-date">Done by <b>${esc(fmtDay(v.due))}</b>${v.me.witness&&!v.dueReached?' \u00b7 you check in then':''}</p>`;
 return `<article class="pin${opts.isNew?' is-new':''}${v.example?' is-example':''}" data-cat="${esc(v.cat)}" data-id="${esc(v.id)}">
  <div class="pin-top"><span class="pin-kind">${esc(v.kind)}</span><span class="pin-cat">${tag}${esc(CATS[v.cat]||v.cat)}</span></div>
  <h3>${title}</h3>
  <p class="pin-meta"><b>${esc(v.by)}</b> \u00b7 ${esc(v.town||'Anywhere')} \u00b7 ${esc(v.starts)}</p>
  ${due}
  ${v.tier?`<span class="pin-tier">${esc(v.tier)}</span>`:''}
  <div class="pin-spacer"></div>
  ${crew}
  <div class="pin-due${(v.locked&&!v.solo)||(!v.example&&v.dueReached)?' locked':''}">${statusLine(v)}</div>
  <div class="pin-actions">${actionsHTML(v)}</div>
 </article>`}
function toast(msg){let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';t.setAttribute('role','status');document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),3200)}

/* ---------- witness / join dialog ---------- */
function ask(role,v){return new Promise(resolve=>{
 const prof=LS.get(K_PROFILE,{});let d=document.getElementById('ggDlg');if(d)d.remove();
 d=document.createElement('dialog');d.id='ggDlg';d.className='gg-dlg';
 const isCrew=role==='crew';
 d.innerHTML=`<form method="dialog" class="dlg-form" novalidate>
  <span class="eyebrow">${isCrew?'Join the crew':'Be a spotter'}</span>
  <h3>${isCrew?'Do it with '+esc(v.by)+'.':'Keep '+esc(v.by)+' honest.'}</h3>
  <p class="muted small">${isCrew?'You\u2019ll show on the pin by first name.':'On or after '+esc(fmtDay(v.due))+' you\u2019ll tap <b>Saw it</b> or <b>Didn\u2019t happen</b> from this device. That\u2019s what builds '+esc(v.by)+'\u2019s show-up rate.'}</p>
  <div class="field"><label for="dlgName">Your first name</label><input type="text" id="dlgName" maxlength="20" autocomplete="given-name" value="${esc(prof.name||'')}"></div>
  <div class="field"><label for="dlgEmail">Email <a class="privacy-link" href="privacy.html" target="_blank" rel="noopener">How we use it</a></label><input type="email" id="dlgEmail" maxlength="120" autocomplete="email" value="${esc(prof.email||'')}"><span class="hint">Never shown on the board.</span></div>
  <div class="hp" aria-hidden="true"><label for="dlgWebsite">Website</label><input type="text" id="dlgWebsite" tabindex="-1" autocomplete="off"></div>
  <p class="small dlg-err" role="alert"></p>
  <div class="btn-row"><button type="submit" class="btn" value="ok">${isCrew?'Join crew':'Spot'}</button><button type="button" class="btn ghost dlg-cancel">Cancel</button></div>
 </form>`;
 document.body.appendChild(d);d.showModal?d.showModal():d.setAttribute('open','');
 const f=d.querySelector('form'),err=d.querySelector('.dlg-err'),btn=f.querySelector('button[type=submit]');
 d.querySelector('.dlg-cancel').onclick=()=>{d.close?d.close():d.remove();resolve(null)};
 d.addEventListener('cancel',()=>resolve(null));
 f.addEventListener('submit',async e=>{e.preventDefault();const name=d.querySelector('#dlgName').value.trim(),email=d.querySelector('#dlgEmail').value.trim();
  if(!name){err.textContent='Add your first name.';return}if(!/^\S+@\S+\.\S+$/.test(email)){err.textContent='Add a valid email.';return}
  btn.disabled=true;err.textContent='';
  try{const r=await api.witness(v.id,{role,name,email,website:d.querySelector('#dlgWebsite').value});
   LS.set(K_PROFILE,{name,email});setMe(v.id,role,{personId:r.personId,token:r.token});d.close?d.close():0;d.remove();resolve(r)}
  catch(x){err.textContent=x.message;btn.disabled=false}});
})}

async function act(kind,id,v,redraw){
 if(kind==='example'){toast('This is an example pin. Spot a real goal, or post your own.');return}
 if(kind==='witnessing'){toast(v.dueReached?'Check in below.':'You\u2019re spotting. Check-ins open on '+fmtDay(v.due)+'.');return}
 if(kind==='joined'){toast('You\u2019re in this crew.');return}
 if(kind==='witness'||kind==='join'){const r=await ask(kind==='join'?'crew':'witness',v);if(!r)return;
  toast(kind==='join'?'You joined the crew.':'You\u2019re a spotter. Check in on '+fmtDay(v.due)+'.');redraw(r.goal);return}
 if(kind==='saw'||kind==='missed'){const w=(meAll()[id]||{}).witness;if(!w)return;
  try{const r=await api.checkin(id,{personId:w.personId,token:w.token,verdict:kind});setMe(id,'witness',{...w,verdict:kind});
   toast(kind==='saw'?'Logged: you saw it. Thanks for showing up.':'Logged: didn\u2019t happen. Honest spotters keep this worth something.');redraw(r.goal)}
  catch(x){toast(x.message)}}}

/* ---------- board ---------- */
function mountBoard(el,o={}){let cat=o.cat||'all',state={pins:[],showEx:false,real:[]};
 const draw=()=>{let ps=state.pins;if(cat!=='all')ps=ps.filter(p=>p.cat===cat);
  const rk=p=>(p.example?100:0)+(p.dueReached?0.5:p.solo?1.5:p.locked?9:p.need);
  ps=[...ps].sort((a,b)=>(b.id===o.highlight)-(a.id===o.highlight)||rk(a)-rk(b)||(b.created||0)-(a.created||0));if(o.limit)ps=ps.slice(0,o.limit);
  el.innerHTML=ps.map(v=>pinHTML(v,{isNew:v.id===o.highlight})).join('')||'<p class="muted">Nothing pinned here yet. Be the first.</p>';
  o.onDraw&&o.onDraw(state)};
 if(o.chips){o.chips.innerHTML=Object.entries(CATS).map(([k,l])=>`<button type="button" class="chip${k===cat?' on':''}" data-cat="${k}">${l}</button>`).join('');
  o.chips.addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;cat=b.dataset.cat;o.chips.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===b));draw()})}
 el.addEventListener('click',e=>{const b=e.target.closest('button[data-act]');if(!b)return;const id=b.closest('.pin').dataset.id;const v=state.pins.find(p=>p.id===id);if(!v)return;
  act(b.dataset.act,id,v,g=>{state.pins=state.pins.map(p=>p.id===id?viewReal(g):p);draw()})});
 el.innerHTML='<p class="muted" style="color:#f6ead6">Loading the board\u2026</p>';
 const load=async()=>{state=await loadBoard();if(state.err)toast('Couldn\u2019t reach the board. Showing examples.');draw();return state};
 const ready=load();return {redraw:draw,ready,reload:load}}

function remember(goalId,editToken){const M=mine();M[goalId]=editToken;LS.set(K_MINE,M)}
function forget(goalId){const M=mine();delete M[goalId];LS.set(K_MINE,M)}
function logoSVG(){return `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11" fill="none" stroke="#E8835A" stroke-width="2.4" stroke-dasharray="4.2 3.1" stroke-linecap="round"/><circle cx="16" cy="16" r="4.6" fill="#E8835A"/></svg>`}
function topoSVG(seed=3,rings=14){let out='';for(let r=1;r<=rings;r++){let d='';const R=r*34;for(let a=0;a<=64;a++){const t=a/64*Math.PI*2;const w=1+.10*Math.sin(t*3+seed+r*.35)+.06*Math.sin(t*5-seed*1.7+r*.2);const x=600+Math.cos(t)*R*w*1.25,y=320+Math.sin(t)*R*w*.85;d+=(a?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)}out+=`<path d="${d}Z" fill="none" stroke="currentColor" stroke-width="1.2"/>`}return `<svg viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${out}</svg>`}
function fmtTimer(ms){if(ms<=0)return '00:00:00';const d=Math.floor(ms/DAY),h=Math.floor(ms%DAY/36e5),m=Math.floor(ms%36e5/6e4),s=Math.floor(ms%6e4/1e3);const p=n=>String(n).padStart(2,'0');return (d?d+'d ':'')+p(h)+':'+p(m)+':'+p(s)}
function shareHTML(v,square){const dots=Array.from({length:v.cap},(_,i)=>`<span class="${i<v.joined?'f':''}${i===v.lockAt-1?' lk':''}">${i===0?esc(v.by[0]||''):''}</span>`).join('');
 const eyes=Array.from({length:Math.min(8,Math.max(v.witnesses,3))},(_,i)=>`<span class="${i<v.witnesses?'f':''}">${i<v.witnesses?'\ud83d\udc41':''}</span>`).join('');
 let count;
 if(v.solo)count=`<div class="sc-big">${v.witnesses?`<b>${v.witnesses} spotter${v.witnesses===1?'':'s'}</b> so far`:'Be my <b>first</b> spotter'}</div><div class="sc-timer">Watch me show up. Every check-in counts.</div><div class="sc-dots">${eyes}</div>`;
 else{const wb=v.witnesses?`<b>${v.witnesses} spotter${v.witnesses===1?'':'s'}</b> so far`:'Be my <b>first</b> spotter';
  count=v.locked?`<div class="sc-big">${wb}</div><div class="sc-timer">Crew locked, ${v.joined} of ${v.cap}. Watch us finish.</div><div class="sc-dots">${dots}</div>`
  :`<div class="sc-big">${wb}</div><div class="sc-timer">Crew: ${v.need} more to lock \u00b7 \u23f1 <span class="t">${fmtTimer(v.deadline-Date.now())}</span></div><div class="sc-dots">${dots}</div>`}
 return `<div class="sc${square?' square':''}" data-deadline="${v.deadline}" data-locked="${v.locked?1:0}">
  <div class="topo-bg">${topoSVG(7,12)}</div>
  <div class="sc-head"><span class="logo">${logoSVG()}Goal Groups</span><span>${esc(CATS[v.cat]||'')}</span></div>
  <div class="sc-eyebrow">Be my spotter</div>
  <div class="sc-title">I\u2019m doing<br>this. For real.</div>
  <p class="sc-goal">${esc(v.title)}</p>
  <p class="sc-who">${esc(v.by)} \u00b7 ${esc(v.town||'Anywhere')} \u00b7 ${esc(v.starts)}</p>
  ${v.tier?`<div class="sc-tier">\u25c6 ${esc(v.tier)}</div>`:''}
  <div class="sc-count">${count}</div>
  <div class="sc-foot"><span><b>Spot me</b>link in bio \u00b7 free</span><span class="sc-badge">Tap to spot</span></div>
 </div>`}
function tickTimers(){document.querySelectorAll('.sc[data-deadline]').forEach(c=>{const t=c.querySelector('.t');if(t)t.textContent=fmtTimer(+c.dataset.deadline-Date.now())})}
setInterval(tickTimers,1000);
function decorate(){document.querySelectorAll('[data-logo]').forEach(e=>e.insertAdjacentHTML('afterbegin',logoSVG()));document.querySelectorAll('[data-topo]').forEach((e,i)=>e.innerHTML=topoSVG(+e.dataset.topo||i+2));
 const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.12}):null;
 document.querySelectorAll('.reveal').forEach(e=>io?io.observe(e):e.classList.add('in'));
 if(location.search.includes('static'))document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in'))}
document.addEventListener('DOMContentLoaded',decorate);
window.GG={CATS,SEED,MIN_REAL,api,examples,getExample,isExampleId,getPin,loadBoard,viewReal,pinHTML,mountBoard,shareHTML,toast,esc,fmtDay,topoSVG,logoSVG,LS,mine,meAll,remember,forget,ask,act,statusLine};
})();
