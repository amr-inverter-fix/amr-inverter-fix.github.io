(function(){
'use strict';
var KB=window.KB, F=KB.faults, SRC=KB.src;
var CATS={grid:'الشبكة (جهد/تردد/فصل)',insulation:'عزل / تسرب أرضي / تأريض',pvdc:'دخل الألواح (PV/DC)',temp:'حرارة',fan:'مراوح',arc:'قوس كهربي (Arc)',internal:'عطل داخلي (غالبًا للدعم الفني)',comm:'اتصال',battery:'البطارية',load:'الخرج / الحمل الزائد',other:'أخرى'};
var SEV={arc:'h',insulation:'h',pvdc:'m',internal:'m',temp:'m',fan:'m',battery:'m',load:'m',grid:'l',comm:'l',other:'m'};
var SEVT={h:['🔴','أولوية عالية: ممكن يكون فيه خطر كهرباء أو حريق. ما تلمسش الجهاز، وكلّم فني مؤهل.'],m:['🟠','محتاج فني يفحصه. لو العطل متكرر سيب الجهاز مفصول.'],l:['🟢','غالبًا مؤقت أو من الشبكة. راقب الجهاز، ولو استمر كلّم فني.']};
var BRAND_KW={afore:['afore'],kaco:['kaco','blueplanet'],refusol:['refusol','refu sol'],solplanet:['solplanet','aiswei'],sunsynk:['sunsynk','sun synk'],invt:['invt','imars','xg100','xg110','xg125'],solark:['sol-ark','solark','sol ark','12k-2p'],fronius:['fronius','symo','primo','eco 25','gen24','tauro'],abb:['abb','fimer','power-one','power one','aurora','uno-dm','uno dm'],must:['must','pv1800','ph1800','pv3500','ph3000'],schneider:['schneider','conext','xantrex'],felicity:['felicity','ivem','ivpm','ivgm'],sungrow:['sungrow','sg2','sg5','sg8','sg10','sg110','sh5','sh10'],huawei:['huawei','sun2000','fusionsolar','fusion solar'],growatt:['growatt','shinebus','shine','mod ','mic ','min '],axpert:['axpert','voltronic','mppsolar','mpp solar','vm iii','infini'],solax:['solax','x1-hyb','x3-hyb','x1 hybrid','x3 hybrid','x1-boost','x3-pro','x3 pro'],sma:['sma','sunny boy','sunny tripower','sunnyboy','tripower'],goodwe:['goodwe','good we','sems portal','gw4000','gw5000','gw6000','gw8000','gw10k','gw12k','gw15k','gw17k','gw20k'],deye:['deye','sun-12k','sun-10k','sun-8k','sun-6k','sun-5k','sg04lp3'],solis:['solis','ginlong','soliscloud'],kostal:['kostal','piko','plenticore'],hoymiles:['hoymiles','hms-','hmt-'],sofar:['sofar','hyd-es','hyd3000','hyd3600','hyd4000','hyd5000','hyd6000','hyd 5000','hyd 6000'],lux:['luxpower','lux power','luxpowertek','lxp'],foxess:['fox ess','foxess','fox-ess','h1-','ac1-'],solaredge:['solaredge','solar edge','se5000','se7600','se10k','se8k','se6k','se3000','se3500','se4000'],delta:['delta','rpi-m','rpi m','m15a','m20a','m30a','m50a','soliveus'],victron:['victron','multiplus','quattro','ve.bus','vebus','easysolar']};
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function norm(s){return s.toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim()}
function inRange(code,n){ if(!code) return false; if(code.indexOf(',')>=0) return code.split(',').some(function(c){return inRange(c.trim(),n)}); var p=code.split('-'); if(p.length==2) return n>=+p[0]&&n<=+p[1]; return +code===n; }
function detectBrands(t){var l=' '+t.toLowerCase()+' ',r=[];for(var b in BRAND_KW){if(BRAND_KW[b].some(function(k){return l.indexOf(k)>=0}))r.push(b)}return r}
function diagnose(text,brandSel,codeSel){
  var full=(text||'')+' '+(codeSel||'');
  var brands=brandSel?[brandSel]:detectBrands(full);
  var nums=(full.match(brands.length?/\b\d{2,4}\b/g:/\b\d{3,4}\b/g)||[]).map(Number);
  var seen={},res=[];
  function add(f,why,score){var k=f.b+'|'+f.c+'|'+f.n;if(seen[k]){if(score>seen[k].score)seen[k].score=score;return}seen[k]={f:f,why:why,score:score};res.push(seen[k])}
  F.forEach(function(f){
    if(brands.length&&brands.indexOf(f.b)<0) return;
    nums.forEach(function(n){ if(inRange(f.c,n)) add(f,'code '+n,brands.length?3:2) });
  });
  var UP=full.toUpperCase().replace(/[_\s]+/g,' ');
  F.forEach(function(f){
    if(!f.a||(brands.length&&brands.indexOf(f.b)<0)) return;
    f.a.forEach(function(al){
      var A=al.toUpperCase().replace(/[_\s]+/g,' ').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      if(new RegExp('(^|[^A-Z0-9])'+A+'($|[^0-9])').test(UP)) add(f,'code '+al,4);
    });
  });
  var nt=' '+norm(full)+' ';
  F.forEach(function(f){
    if(brands.length&&brands.indexOf(f.b)<0) return;
    var nn=norm(f.n.replace(/\(.*?\)/g,''));
    var main=nn.split(' > ')[0];
    if(nn.length>5&&nt.indexOf(' '+nn+' ')>=0) add(f,'name match',3);
    else if(main.length>6&&nt.indexOf(' '+main+' ')>=0) add(f,'name match',2.5);
  });
  res.sort(function(a,b){return b.score-a.score});
  return {res:res.slice(0,8),brands:brands,nums:nums,total:res.length};
}
function card(f,why){
  var s=SRC[f.b];
  return '<div class="res cat-'+f.k+'"><h3>'+(f.c?esc(f.c)+' · ':'')+esc(f.n)+'</h3>'+
  '<span class="tag b">'+esc(s.name)+'</span><span class="tag">'+esc(CATS[f.k]||CATS.other)+'</span>'+'<div class="sev sev-'+(SEV[f.k]||'m')+'">'+SEVT[SEV[f.k]||'m'][0]+' '+SEVT[SEV[f.k]||'m'][1]+' <small>(تقييم تقريبي من التطبيق مش من الشركة)</small></div>'+
  (why?'<span class="tag">'+esc(why)+'</span>':'')+
  '<div class="qtag">الخطوات دي منقولة من دليل الشركة وموجّهة لفني مؤهل فقط — مش تعليمات تنفّذها بنفسك.</div><ol>'+f.s.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ol>'+
  '<a class="sharebtn" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(s.name+' - '+(f.c?f.c+' - ':'')+f.n+'\n'+f.s.map(function(x,i){return (i+1)+'. '+x}).join('\n')+'\nالمصدر: '+s.url)+'">📤 ابعت على واتساب</a>'+
  '<div class="muted">المصدر: '+esc(s.doc)+'<br><a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.url)+'</a></div></div>';
}
var lastText='';
function show(d,ocrText){
  var o=$('out'),h='';
  if(ocrText!==undefined) h+='<div class="card"><b>النص اللي اتقرا:</b><div class="muted" dir="ltr" style="text-align:left">'+esc(ocrText.trim()||'(فاضي)')+'</div></div>';
  if(!d.res.length){
    h+='<div class="none">مفيش تطابق في القاعدة'+(d.nums.length?' للأرقام '+d.nums.join('، '):'')+'. اختار الشركة واكتب الكود يدويًا، أو دوّر في القائمة تحت. لو الكود مش موجود، ارجع لدليل موديلك.</div>';
  } else {
    var multi=!d.brands.length;
    if(multi) h+='<div class="warn">الشركة مش معروفة، فالنتائج من أكتر من شركة. اختار الشركة من القائمة لتضييق النتيجة.</div>';
    h+=d.res.map(function(r){return card(r.f,r.why)}).join('');
  }
  lastText=d.res.slice(0,3).map(function(r){return SRC[r.f.b].name+' '+(r.f.c?r.f.c+' ':'')+'- '+r.f.n+'\n'+r.f.s.join('\n')+'\nالمصدر: '+SRC[r.f.b].doc}).join('\n\n')+'\n\nللاسترشاد فقط. أي صيانة لازم يعملها فني مؤهل.';
  if(d.res.length) h+='<div class="card"><button id="wa" class="btn alt" type="button">📤 ابعت النتيجة واتساب</button><button id="cp" class="btn alt" type="button">📋 انسخ النتيجة</button></div>';
  o.innerHTML=h;
  if($('wa')){$('wa').onclick=function(){window.open('https://wa.me/?text='+encodeURIComponent(lastText),'_blank')};$('cp').onclick=function(){var b=this;(navigator.clipboard?navigator.clipboard.writeText(lastText):Promise.reject()).then(function(){b.textContent='✅ اتنسخ'},function(){b.textContent='النسخ مش متاح في المتصفح ده'})}}
  o.scrollIntoView({behavior:'smooth'});
}
// UI
var bs=$('brand');Object.keys(SRC).forEach(function(k){var op=document.createElement('option');op.value=k;op.textContent=SRC[k].name;bs.appendChild(op)});
function hist(){try{return JSON.parse(localStorage.getItem('invhist')||'[]')}catch(e){return []}}
function saveHist(b,c,t){if(!(c||t))return;try{var h=hist().filter(function(x){return !(x.b===b&&x.c===c&&x.t===t)});h.unshift({b:b,c:c,t:t});localStorage.setItem('invhist',JSON.stringify(h.slice(0,6)));renderHist()}catch(e){}}
function renderHist(){var h=hist(),e=$('hist');if(!h.length){e.innerHTML='';return}e.innerHTML='<div class="muted">آخر بحث (على جهازك بس):</div>'+h.map(function(x,i){return '<button class="chip" data-i="'+i+'" type="button">'+esc((x.b&&SRC[x.b]?SRC[x.b].name+' ':'')+(x.c||x.t).slice(0,24))+'</button>'}).join('')+'<button class="chip" id="clrh" type="button">مسح ✖</button>';
  Array.prototype.forEach.call(e.querySelectorAll('[data-i]'),function(b){b.onclick=function(){var x=h[+b.getAttribute('data-i')];bs.value=x.b||'';$('code').value=x.c||'';$('txt').value=x.t||'';$('go').click()}});
  $('clrh').onclick=function(){localStorage.removeItem('invhist');renderHist()}}
$('go').onclick=function(){saveHist(bs.value,$('code').value.trim(),$('txt').value.trim());show(diagnose($('txt').value,bs.value,$('code').value),undefined)};
renderHist();
$('code').addEventListener('keydown',function(e){if(e.key==='Enter')$('go').click()});
function renderList(q){
  q=norm(q||'');var fb=$('fbrand').value,fk=$('fcat').value;
  var items=F.filter(function(f){return (!fb||f.b===fb)&&(!fk||f.k===fk)&&(!q||norm(f.c+' '+f.n+' '+SRC[f.b].name).indexOf(q)>=0)}).slice(0,400);
  $('lcount').textContent=items.length+' نتيجة'+(items.length>=400?' (أول 400)':'');
  $('list').innerHTML=items.map(function(f){return '<details><summary><b>'+esc(SRC[f.b].name)+'</b> '+(f.c?esc(f.c)+' · ':'')+esc(f.n)+'</summary><div class="qtag">الخطوات دي منقولة من دليل الشركة وموجّهة لفني مؤهل فقط — مش تعليمات تنفّذها بنفسك.</div><ol>'+f.s.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ol></details>'}).join('')||'<div class="muted">مفيش نتائج</div>';
}
var fbs=$('fbrand'),fcs=$('fcat');Object.keys(SRC).forEach(function(k){var op=document.createElement('option');op.value=k;op.textContent=SRC[k].name;fbs.appendChild(op)});Object.keys(CATS).forEach(function(k){var op=document.createElement('option');op.value=k;op.textContent=CATS[k];fcs.appendChild(op)});
$('filter').oninput=function(){renderList(this.value)};fbs.onchange=fcs.onchange=function(){renderList($('filter').value)};renderList('');
$('foot').textContent='القاعدة: '+F.length+' عطل من '+Object.keys(SRC).length+' شركات ('+Object.keys(SRC).map(function(k){return SRC[k].name}).join(', ')+'). البحث بالكود بيشتغل من غير إنترنت بعد أول فتح. قراءة الصورة (OCR) بتحتاج إنترنت.';
// OCR
var worker=null;
function getWorker(){
  if(worker) return worker;
  var L=window.LITE,o={workerPath:'./worker.min.js',corePath:L?'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.0/':'./',langPath:L?'https://tessdata.projectnaptha.com/4.0.0_fast':'./',gzip:true,workerBlobURL:L?true:false,
    logger:function(m){if(m.status)$('ocrstat').textContent='OCR: '+m.status+(m.progress?' '+Math.round(m.progress*100)+'%':'')}};
  worker=Tesseract.createWorker('eng',1,o);
  return worker;
}
function prep(img,invert){
  var max=1800,sc=Math.min(2,max/Math.max(img.naturalWidth,img.naturalHeight));
  if(img.naturalWidth*sc<1000) sc=Math.min(3,1000/img.naturalWidth);
  var c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*sc);c.height=Math.round(img.naturalHeight*sc);
  var x=c.getContext('2d');x.drawImage(img,0,0,c.width,c.height);
  var d=x.getImageData(0,0,c.width,c.height),p=d.data,lo=255,hi=0,i,g;
  for(i=0;i<p.length;i+=4){g=.299*p[i]+.587*p[i+1]+.114*p[i+2];p[i]=g;if(g<lo)lo=g;if(g>hi)hi=g}
  var r=Math.max(1,hi-lo);
  for(i=0;i<p.length;i+=4){g=(p[i]-lo)*255/r;if(invert)g=255-g;p[i]=p[i+1]=p[i+2]=g}
  x.putImageData(d,0,0);return c;
}
async function handleFile(f){
  if(!f)return;window.__busy=true;
  var url=URL.createObjectURL(f),img=$('prev');img.src=url;img.hidden=false;
  await new Promise(function(r){img.onload=r});
  $('ocrstat').textContent='بقرا الصورة... (أول مرة بتاخد ثواني)';
  try{
    var w=await getWorker(),txt='',best=null;
    for(var k=0;k<2;k++){
      var r=await w.recognize(prep(img,k==1));txt=r.data.text;
      var d=diagnose(txt,bs.value,'');
      if(!best||d.res.length>best.d.res.length) best={d:d,t:txt};
      if(d.res.length) break;
    }
    $('ocrstat').textContent='خلص.';
    saveHist(bs.value,'',best.t.replace(/\s+/g,' ').trim().slice(0,60));show(best.d,best.t);
  }catch(e){$('ocrstat').textContent='فشل الـ OCR: '+(e&&e.message||e)+'\nاكتب الكود يدويًا.'}
}
$('cam').onchange=function(){var f=this.files[0];this.value='';handleFile(f)};
$('shot').onchange=function(){var f=this.files[0];this.value='';handleFile(f)};
var stream=null;
function stopCam(){if(stream){stream.getTracks().forEach(function(t){t.stop()});stream=null}$('vid').srcObject=null;$('camwrap').hidden=true}
$('live').onclick=async function(){
  $('camerr').textContent='';
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){$('camerr').textContent='المتصفح مش بيدعم الكاميرا المباشرة. استخدم زرار "صوّر بكاميرا الموبايل".';return}
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},audio:false});
    $('vid').srcObject=stream;$('camwrap').hidden=false;
    try{await $('vid').play()}catch(_){}
  }catch(e){
    var n=e&&e.name;
    $('camerr').textContent=(n==='NotAllowedError'?'الكاميرا اترفضت. اسمح بالكاميرا للموقع من إعدادات المتصفح.':n==='NotFoundError'?'مفيش كاميرا لقيتها.':'الكاميرا مفتحتش: '+(e&&e.message||e))+' جرّب زرار "صوّر بكاميرا الموبايل".';
  }
};
$('stopcam').onclick=stopCam;
$('snap').onclick=function(){
  var v=$('vid');if(!v.videoWidth){$('camerr').textContent='الكاميرا لسه بتجهز، استنى ثانية.';return}
  var c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);
  c.toBlob(function(b){stopCam();if(b)handleFile(new File([b],'capture.jpg',{type:'image/jpeg'}))},'image/jpeg',0.92);
};

try{(function(){var t=$('theme');function ap(){var d=document.documentElement.getAttribute('data-theme')==='dark';t.textContent=d?'☀️':'🌙'}ap();t.onclick=function(){var d=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',d);try{localStorage.setItem('invtheme',d)}catch(e){}ap()};$('sn1').textContent=F.length;$('sn2').textContent=Object.keys(SRC).length})()}catch(e){}
window.__diagnose=diagnose;
if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(function(r){document.addEventListener('visibilitychange',function(){if(!document.hidden)r.update().catch(function(){})})}).catch(function(){});var rl=false;navigator.serviceWorker.addEventListener('controllerchange',function(){if(rl)return;rl=true;if(!window.__busy)location.reload()})}
})();
