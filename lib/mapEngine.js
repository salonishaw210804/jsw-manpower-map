export function mountMap({d3,topojson,topo,rows,askEnabled}){
const ZONES={
  North:['Jammu and Kashmir','Ladakh','Himachal Pradesh','Punjab','Chandigarh','Haryana','Delhi','Uttarakhand','Uttar Pradesh','Rajasthan'],
  West:['Maharashtra','Gujarat','Goa','Madhya Pradesh','Chhattisgarh','Dadra and Nagar Haveli and Daman and Diu'],
  South:['Andhra Pradesh','Telangana','Karnataka','Tamil Nadu','Kerala','Puducherry','Lakshadweep','Andaman and Nicobar Islands'],
  East:['Bihar','Jharkhand','West Bengal','Odisha','Sikkim','Assam','Arunachal Pradesh','Nagaland','Manipur','Mizoram','Tripura','Meghalaya']
};
const stateZone={};Object.entries(ZONES).forEach(([z,l])=>l.forEach(s=>stateZone[s]=z));
const states=topojson.feature(topo,topo.objects.states).features;
const districts=topojson.feature(topo,topo.objects.districts).features;

function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const METRO=new Set(['Mumbai','Mumbai Suburban','Thane','Pune','Raigad','Palghar','Nagpur','Nashik','Ahmadabad','Ahmedabad','Surat','Vadodara','Rajkot','Bangalore','Bangalore Urban','Bengaluru Urban','Hyderabad','Rangareddy','Ranga Reddy','Medchal Malkajgiri','Chennai','Kancheepuram','Tiruvallur','Kolkata','North 24 Parganas','Howrah','New Delhi','South','West','Gurgaon','Gurugram','Gautam Buddha Nagar','Ghaziabad','Jaipur','Lucknow','Indore','Bhopal','Visakhapatnam','Coimbatore','Ernakulam','Patna','Ludhiana']);
districts.forEach(f=>{
  const p=f.properties;const r=rng(hash(p.st_nm+'|'+p.district));const boost=METRO.has(p.district)?4:1;
  const potential=Math.round((60+r()*900)*boost);const pen=0.02+r()*0.22;
  const gst=Math.round(potential*pen);const pan=Math.round(gst*(0.72+r()*0.15));
  const mt=Math.round(gst*(15+r()*55));const manpower=Math.round(r()*(boost>1?10:4));
  const projects=Math.round(r()*40*boost);const projMt=Math.round(projects*(150+r()*900));
  p.name=p.district;p.zone=stateZone[p.st_nm]||'Other';p.d={potential,gst,pan,mt,manpower,projects,projMt};
});
let mode='sample',filled=0;
if(Array.isArray(rows)&&rows.some(r=>r.filled)){
  mode='excel';const byKey={};
  rows.forEach(r=>{byKey[(r.state+'|'+r.district).toLowerCase()]=r;if(r.zone)stateZone[r.state]=r.zone;});
  districts.forEach(f=>{const p=f.properties;const r=byKey[(p.st_nm+'|'+p.district).toLowerCase()];
    if(r&&r.filled)filled++;
    p.d=r?{...r.d}:{potential:0,gst:0,pan:0,mt:0,manpower:0,projects:0,projMt:0};
    p.zone=stateZone[p.st_nm]||'Other';});
}
const bannerEl=document.getElementById('banner');
if(mode==='excel'){bannerEl.textContent=`Data from area_data.xlsx: ${filled} of ${districts.length} districts filled.`;bannerEl.style.background='var(--surface-information)';bannerEl.style.color='var(--text-action)';}
else bannerEl.textContent='Showing sample data. Fill data/area_data.xlsx and redeploy to see your real numbers.';
function agg(list){const o={potential:0,gst:0,pan:0,mt:0,manpower:0,projects:0,projMt:0};list.forEach(f=>{for(const k in o)o[k]+=f.properties.d[k];});return o;}
states.forEach(f=>{const p=f.properties;p.name=p.st_nm;p.zone=stateZone[p.st_nm]||'Other';p.d=agg(districts.filter(x=>x.properties.st_nm===p.st_nm));});

const S={level:'india',state:null,zone:'All',metric:'potential',lvl:'gst',sel:null};
const nf=new Intl.NumberFormat('en-IN');
const num=v=>nf.format(Math.round(v));
const pct=v=>(Math.round(v*10)/10).toFixed(1)+'%';
const cust=d=>S.lvl==='gst'?d.gst:d.pan;
const lvlName=()=>S.lvl==='gst'?'GST':'PAN';
const oppPer=d=>Math.max(d.potential-cust(d),0)/Math.max(d.manpower,1);
const METRICS={
  potential:{label:'Potential customers',get:d=>d.potential,fmt:num},
  jswCust:{label:'JSW One customers',get:d=>cust(d),fmt:num},
  jswMt:{label:'JSW One volume (MT)',get:d=>d.mt,fmt:num},
  penetration:{label:'Penetration %',get:d=>d.potential?cust(d)/d.potential*100:0,fmt:pct},
  manpower:{label:'Current manpower',get:d=>d.manpower,fmt:num},
  projects:{label:'Upcoming projects',get:d=>d.projects,fmt:num},
  opp:{label:'Open potential per salesperson',get:d=>oppPer(d),fmt:num}
};

const zonesEl=document.getElementById('zones');
['All','North','West','South','East'].forEach(z=>{const b=document.createElement('button');b.className='ds-chip'+(z==='All'?' active':'');b.textContent=z==='All'?'All India':z;b.dataset.z=z;b.onclick=()=>{S.zone=z;S.level='india';S.state=null;S.sel=null;syncChips();render();};zonesEl.appendChild(b);});
const metricEl=document.getElementById('metric');
Object.entries(METRICS).forEach(([k,m])=>{const o=document.createElement('option');o.value=k;o.textContent=m.label;metricEl.appendChild(o);});
metricEl.onchange=()=>{S.metric=metricEl.value;render();};
document.querySelectorAll('#lvl .ds-chip').forEach(b=>b.onclick=()=>{S.lvl=b.dataset.l;document.querySelectorAll('#lvl .ds-chip').forEach(x=>x.classList.toggle('active',x===b));render();});
function syncChips(){zonesEl.querySelectorAll('.ds-chip').forEach(b=>b.classList.toggle('active',b.dataset.z===S.zone));}

const W=800,H=860;
const svg=d3.select('#map').attr('viewBox',`0 0 ${W} ${H}`);
const g=svg.append('g');
const tip=document.getElementById('tip');const card=document.getElementById('mapcard');

function cssVar(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim();}
function visible(){
  if(S.level==='state')return districts.filter(f=>f.properties.st_nm===S.state);
  return states;
}
function inScope(f){return S.level==='state'||S.zone==='All'||f.properties.zone===S.zone;}
function scopeRows(){return visible().filter(inScope);}
function scopeTotal(){return agg(scopeRows());}
function scopeName(){return S.level==='state'?S.state:(S.zone==='All'?'All India':S.zone+' zone');}

function render(){
  const feats=visible();const scoped=feats.filter(inScope);
  const proj=d3.geoMercator().fitExtent([[12,12],[W-12,H-12]],{type:'FeatureCollection',features:scoped});
  const path=d3.geoPath(proj);
  const m=METRICS[S.metric];const vals=scoped.map(f=>m.get(f.properties.d));
  const ramp=d3.quantize(d3.interpolateRgb(cssVar('--ramp-lo'),cssVar('--ramp-hi')),6);
  const scale=d3.scaleQuantile().domain(vals.length?vals:[0,1]).range(ramp);
  g.selectAll('path').data(feats,f=>f.properties.name+'|'+(f.properties.st_nm||'')).join('path')
    .attr('d',path)
    .attr('fill',f=>scale(m.get(f.properties.d)))
    .attr('class',f=>(inScope(f)?'':'dim')+(S.sel&&S.sel===f?' sel':''))
    .on('mousemove',(e,f)=>{if(!inScope(f))return hideTip();showTip(e,f);})
    .on('mouseleave',hideTip)
    .on('click',(e,f)=>{if(!inScope(f))return;onClick(f);});
  g.selectAll('path.sel').raise();
  drawLegend(scale,m);drawCrumbs();drawPanel();
}
function onClick(f){
  if(S.level==='india'){S.level='state';S.state=f.properties.st_nm;S.sel=null;}
  else{S.sel=f;}
  hideTip();render();
}
function showTip(e,f){
  const p=f.properties,d=p.d;const r=card.getBoundingClientRect();
  tip.replaceChildren();
  const h=document.createElement('h4');h.textContent=p.name;tip.appendChild(h);
  const z=document.createElement('div');z.className='tz';z.textContent=(p.district?p.st_nm+' · ':'')+p.zone+' zone';tip.appendChild(z);
  [['Potential customers',num(d.potential)],[`JSW One customers (${lvlName()})`,num(cust(d))],['JSW One volume',num(d.mt)+' MT'],['Penetration',pct(d.potential?cust(d)/d.potential*100:0)],['Current manpower',num(d.manpower)],['Upcoming projects',num(d.projects)],['Project demand (est.)',num(d.projMt)+' MT']].forEach(([k,v])=>{const row=document.createElement('div');row.className='row';const a=document.createElement('span');a.textContent=k;const b=document.createElement('span');b.textContent=v;row.append(a,b);tip.appendChild(row);});
  let x=e.clientX-r.left+14,y=e.clientY-r.top+14;
  const tw=tip.offsetWidth||230,th=tip.offsetHeight||190;
  if(x+tw>r.width-6)x=e.clientX-r.left-tw-14;if(x<6)x=6;
  if(y+th>r.height-6)y=r.height-th-6;if(y<6)y=6;
  tip.style.left=x+'px';tip.style.top=y+'px';tip.style.opacity=1;
}
function hideTip(){tip.style.opacity=0;}
function drawLegend(scale,m){
  const el=document.getElementById('legend');el.replaceChildren();
  const lab=document.createElement('span');lab.textContent=m.label+':';lab.style.fontWeight='700';el.appendChild(lab);
  const q=scale.quantiles();const r=scale.range();
  r.forEach((c,i)=>{const s=document.createElement('span');s.className='sw';const sw=document.createElement('i');sw.style.background=c;const t=document.createElement('span');
    t.textContent=i===0?'< '+m.fmt(q[0]??0):(i===r.length-1?'≥ '+m.fmt(q[i-1]??0):m.fmt(q[i-1])+'–'+m.fmt(q[i]));s.append(sw,t);el.appendChild(s);});
}
function drawCrumbs(){
  const el=document.getElementById('crumbs');el.replaceChildren();
  const add=(txt,fn)=>{if(el.children.length){const s=document.createElement('span');s.className='sep';s.textContent='›';el.appendChild(s);}
    if(fn){const b=document.createElement('button');b.textContent=txt;b.onclick=fn;el.appendChild(b);}else{const s=document.createElement('span');s.className='cur';s.textContent=txt;el.appendChild(s);}};
  const toIndia=()=>{S.level='india';S.state=null;S.sel=null;S.zone='All';syncChips();render();};
  if(S.level==='india'){if(S.zone==='All')add('All India');else{add('All India',toIndia);add(S.zone+' zone');}}
  else{const z=stateZone[S.state];add('All India',toIndia);add(z+' zone',()=>{S.level='india';S.state=null;S.sel=null;S.zone=z;syncChips();render();});
    if(S.sel){add(S.state,()=>{S.sel=null;render();});add(S.sel.properties.name);}else add(S.state);}
  const h=document.createElement('span');h.className='hint';h.textContent=S.level==='india'?'Click a state to see its districts':'Click a district for details';el.appendChild(h);
}
function statusTag(d){
  const t=document.createElement('span');t.className='tag';
  const pen=d.potential?cust(d)/d.potential:0;
  if(d.manpower===0&&d.potential>300){t.classList.add('red');t.textContent='No coverage: hire first';}
  else if(oppPer(d)>600){t.classList.add('amber');t.textContent='Under-staffed for its potential';}
  else if(pen<0.06){t.classList.add('amber');t.textContent='Low penetration';}
  else{t.classList.add('green');t.textContent='Covered';}
  return t;
}
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
function drawPanel(){
  const P=document.getElementById('panel');P.replaceChildren();
  const isSel=!!S.sel;const name=isSel?S.sel.properties.name:scopeName();const d=isSel?S.sel.properties.d:scopeTotal();
  const head=el('div');const h=el('h2',null,name);head.appendChild(h);
  head.appendChild(el('div','sub',isSel?S.sel.properties.st_nm+' · '+S.sel.properties.zone+' zone':(S.level==='state'?stateZone[S.state]+' zone · state total':'Total for current view')));
  const tg=statusTag(d);tg.style.marginTop='6px';head.appendChild(tg);P.appendChild(head);
  const k=el('div','kpis');
  const kp=(lab,val,sub)=>{const b=el('div','kpi');b.append(el('div','k',lab),el('div','v',val));if(sub)b.appendChild(el('div','s',sub));k.appendChild(b);};
  kp('Potential customers',num(d.potential),'From in-person research');
  kp('JSW One customers',num(cust(d)),lvlName()+' level');
  kp('JSW One volume',num(d.mt)+' MT','From Tableau');
  kp('Penetration',pct(d.potential?cust(d)/d.potential*100:0),'Customers ÷ potential');
  kp('Current manpower',num(d.manpower),'From manpower Excel');
  kp('Open potential / person',num(oppPer(d)),'Untapped customers per head');
  kp('Upcoming projects',num(d.projects),'From Projects Today');
  kp('Project demand (est.)',num(d.projMt)+' MT','Assumed steel intensity');
  P.appendChild(k);
  if(!isSel){
    const sec=el('div');sec.appendChild(el('div','sec',S.level==='state'?'Where to add manpower first':'States ranked by open potential per person'));
    const wrap=el('div','tbl-wrap');const t=el('table');const thead=el('thead');const hr=el('tr');
    [['Area',''],['Potential','num'],['JSW cust.','num'],['People','num'],['Open / person','num']].forEach(([x,c])=>hr.appendChild(el('th',c,x)));thead.appendChild(hr);t.appendChild(thead);
    const tb=el('tbody');
    scopeRows().slice().sort((a,b)=>oppPer(b.properties.d)-oppPer(a.properties.d)).slice(0,8).forEach(f=>{const p=f.properties,dd=p.d;const tr=el('tr','click');
      tr.append(el('td',null,p.name),el('td','num',num(dd.potential)),el('td','num',num(cust(dd))),el('td','num',num(dd.manpower)),el('td','num',num(oppPer(dd))));
      tr.onclick=()=>onClick(f);tb.appendChild(tr);});
    t.appendChild(tb);wrap.appendChild(t);sec.appendChild(wrap);P.appendChild(sec);
  }
  P.appendChild(askBox(name));
}
let ctl=null;
function contextText(name){
  const rows=scopeRows().map(f=>{const p=f.properties,d=p.d;return [p.name,p.zone,d.potential,cust(d),d.mt,d.manpower,d.projects,d.projMt].join(',');});
  const sel=S.sel?S.sel.properties:null;
  return `Current view: ${scopeName()}. Customer count level: ${lvlName()}.\n`+(sel?`Selected area: ${sel.name} (${sel.st_nm}). Its data: ${JSON.stringify(sel.d)}\n`:'')+
  `Columns: area,zone,potential_customers,jsw_one_customers,jsw_one_mt,current_manpower,upcoming_projects,project_demand_est_mt\n`+rows.slice(0,120).join('\n');
}
function askBox(name){
  const box=el('div','ask');box.appendChild(el('div','sec','Ask Claude about '+name));
  if(!askEnabled){box.appendChild(el('div','note','Ask Claude will appear here once an Anthropic API key is added in Vercel settings.'));return box;}
  const ta=el('textarea');ta.placeholder='E.g. Where should I add 5 salespeople in this area, and what BE can we promise?';ta.setAttribute('aria-label','Your question for Claude');
  const sug=el('div','suggest');
  ['Where should we add manpower first?','Which areas have high potential but low penetration?','What BE can we promise next quarter?'].forEach(s=>{const b=el('button','ds-chip',s);b.onclick=()=>{ta.value=s;go();};sug.appendChild(b);});
  const row=el('div','ask-row');const ask=el('button','ds-btn ds-btn-primary','Ask Claude');const stop=el('button','ds-btn ds-btn-ghost','Stop');stop.disabled=true;
  const err=el('div','err');const out=el('div','answer');
  row.append(ask,stop);box.append(ta,sug,row,err,out);
  async function go(){
    err.textContent='';const q=ta.value.trim();if(!q){err.textContent='Type a question first';return;}
    ctl?.abort();ctl=new AbortController();ask.disabled=true;stop.disabled=false;out.style.display='block';out.textContent='Thinking…';
    try{
      const r=await fetch('/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,context:contextText(name)}),signal:ctl.signal});
      const j=await r.json().catch(()=>({}));
      if(!r.ok){out.style.display='none';err.textContent=r.status===401?'Please sign in again.':(r.status===429?'Too many questions at once. Try again in a minute.':(j.error||'Claude couldn’t answer right now.'));}
      else out.textContent=j.answer||'No answer received.';
    }catch(e){if(e.name!=='AbortError'){out.style.display='none';err.textContent='Claude couldn’t answer right now. Check that the API is deployed.';}}
    finally{ask.disabled=false;stop.disabled=true;}
  }
  ask.onclick=go;stop.onclick=()=>ctl?.abort();ta.addEventListener('input',()=>err.textContent='');
  return box;
}
const mq=window.matchMedia('(prefers-color-scheme: dark)');mq.addEventListener('change',render);
render();
return ()=>{mq.removeEventListener('change',render);svg.selectAll('*').remove();zonesEl.replaceChildren();metricEl.replaceChildren();ctl?.abort();};
}
