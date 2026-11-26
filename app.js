(function(){
'use strict';
var KB=window.KB, F=KB.faults, SRC=KB.src;
var CATS={grid:'الشبكة (جهد/تردد/فصل)',insulation:'عزل / تسرب أرضي / تأريض',pvdc:'دخل الألواح (PV/DC)',temp:'حرارة',fan:'مراوح',arc:'قوس كهربي (Arc)',internal:'عطل داخلي (غالبًا للدعم الفني)',comm:'اتصال',battery:'البطارية',load:'الخرج / الحمل الزائد',other:'أخرى'};
var SEV={arc:'h',insulation:'h',pvdc:'m',internal:'m',temp:'m',fan:'m',battery:'m',load:'m',grid:'l',comm:'l',other:'m'};
var SEVL={h:'خطورة عالية',m:'خطورة متوسطة',l:'خطورة منخفضة'};
var SEVT={h:['🔴','أولوية عالية: ممكن يكون فيه خطر كهرباء أو حريق. ما تلمسش الجهاز، وكلّم فني مؤهل.'],m:['🟠','محتاج فني يفحصه. لو العطل متكرر سيب الجهاز مفصول.'],l:['🟢','غالبًا مؤقت أو من الشبكة. راقب الجهاز، ولو استمر كلّم فني.']};
var BRAND_KW={afore:['afore'],steca:['steca','stecagrid'],kaco:['kaco','blueplanet'],refusol:['refusol','refu sol'],solplanet:['solplanet','aiswei'],sunsynk:['sunsynk','sun synk'],invt:['invt','imars','xg100','xg110','xg125'],solark:['sol-ark','solark','sol ark','12k-2p'],fronius:['fronius','symo','primo','eco 25','gen24','tauro'],abb:['abb','fimer','power-one','power one','aurora','uno-dm','uno dm'],must:['must','pv1800','ph1800','pv3500','ph3000'],schneider:['schneider','conext','xantrex'],felicity:['felicity','ivem','ivpm','ivgm'],sungrow:['sungrow','sg2','sg5','sg8','sg10','sg110','sh5','sh10'],huawei:['huawei','sun2000','fusionsolar','fusion solar'],growatt:['growatt','shinebus','shine','mod ','mic ','min '],axpert:['axpert','voltronic','mppsolar','mpp solar','vm iii','infini'],solax:['solax','x1-hyb','x3-hyb','x1 hybrid','x3 hybrid','x1-boost','x3-pro','x3 pro'],sma:['sma','sunny boy','sunny tripower','sunnyboy','tripower'],goodwe:['goodwe','good we','sems portal','gw4000','gw5000','gw6000','gw8000','gw10k','gw12k','gw15k','gw17k','gw20k'],deye:['deye','sun-12k','sun-10k','sun-8k','sun-6k','sun-5k','sg04lp3'],solis:['solis','ginlong','soliscloud'],kostal:['kostal','piko','plenticore'],hoymiles:['hoymiles','hms-','hmt-'],sofar:['sofar','hyd-es','hyd3000','hyd3600','hyd4000','hyd5000','hyd6000','hyd 5000','hyd 6000'],lux:['luxpower','lux power','luxpowertek','lxp'],foxess:['fox ess','foxess','fox-ess','h1-','ac1-'],solaredge:['solaredge','solar edge','se5000','se7600','se10k','se8k','se6k','se3000','se3500','se4000'],delta:['delta','rpi-m','rpi m','m15a','m20a','m30a','m50a','soliveus'],victron:['victron','multiplus','quattro','ve.bus','vebus','easysolar']};
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function norm(s){return s.toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim()}
function inRange(code,n){ if(!code) return false; if(code.indexOf(',')>=0) return code.split(',').some(function(c){return inRange(c.trim(),n)}); var p=code.split('-'); if(p.length==2) return n>=+p[0]&&n<=+p[1]; return +code===n; }
function detectBrands(t){var l=' '+t.toLowerCase()+' ',r=[];for(var b in BRAND_KW){if(BRAND_KW[b].some(function(k){return l.indexOf(k)>=0}))r.push(b)}return r}
function diagnose(text,brandSel,codeSel){
  var full=(text||'')+' '+(codeSel||'');
  var brands=brandSel?[brandSel]:detectBrands(full);
  var nums=(full.match(brands.length?/\b\d{2,4}\b/g:/\b\d{3,4}\b/g)||[]).map(Number);
  if(brands.length&&/^\s*\d\s*$/.test(codeSel||''))nums.push(+codeSel);
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
      if(new RegExp('(^|[^A-Z0-9])'+A+'($|[^0-9])').test(UP)) add(f,'code '+al,String(f.c).toUpperCase()===al.toUpperCase()?4.5:4);
    });
  });
  var nt=' '+norm(full)+' ';
  F.forEach(function(f){
    if(brands.length&&brands.indexOf(f.b)<0) return;
    var nn=norm(f.n.replace(/\(.*?\)/g,''));
    var main=nn.split(' > ')[0];
    var pre=norm(f.n.split(':')[0].replace(/\(.*?\)/g,''));
    if(nn.length>5&&nt.indexOf(' '+nn+' ')>=0) add(f,'name match',3);
    else if(pre.length>5&&pre!==nn&&nt.indexOf(' '+pre+' ')>=0) add(f,'name match',2.8);
    else if(main.length>6&&nt.indexOf(' '+main+' ')>=0) add(f,'name match',2.5);
  });
  if(!res.length&&nt.trim().length>6){
    var tk=nt.trim().split(' ').filter(function(w){return w.length>3});
    if(tk.length>=2){F.forEach(function(f){
      if(brands.length&&brands.indexOf(f.b)<0) return;
      var ft=norm(f.n.replace(/\(.*?\)/g,'')).split(' ').filter(function(w){return w.length>3});
      if(ft.length<2) return;
      var hit=ft.filter(function(w){return nt.indexOf(w)>=0}).length;
      if(hit>=2&&hit/ft.length>=0.6) add(f,'قريب من النص',1+hit/ft.length);
    });}
  }
  if(!res.length&&!diagnose._r){
    var fx=full.replace(/\b([A-Za-z]{1,3})([0-9OoIl@|]{1,4})\b/g,function(m,a,b){if(!/[0-9@]/.test(b))return m;return a+b.replace(/[Oo@]/g,'0').replace(/[Il|]/g,'1')});
    if(fx!==full){diagnose._r=1;try{var rr=diagnose(fx,brandSel,'');if(rr.res.length){rr.res.forEach(function(x){x.why='قراءة مصحّحة'});return rr}}finally{diagnose._r=0}}
  }
  res.sort(function(a,b){return b.score-a.score});
  return {res:res.slice(0,8),brands:brands,nums:nums,total:res.length};
}
function fkey(f){return f.b+'|'+f.c+'|'+f.n}
function favs(){try{return JSON.parse(localStorage.getItem('invfav')||'[]')}catch(e){return []}}
function card(f,why){
  var s=SRC[f.b],sv=SEV[f.k]||'m',isf=favs().indexOf(fkey(f))>=0;
  var shareTxt=s.name+' - '+(f.c?f.c+' - ':'')+f.n+'\n'+f.s.map(function(x,i){return (i+1)+'. '+x}).join('\n')+'\nالمصدر: '+s.url;
  return '<div class="res cat-'+f.k+' sv-'+sv+'"><div class="rtop"><span class="bmark" style="'+bstyle(f.b)+'">'+esc(mono(f.b))+'</span><div class="rt"><h3>'+(f.c?'<span class="code">'+esc(f.c)+'</span> ':'')+esc(f.n)+'</h3><div class="rsub">'+esc(s.name)+'</div></div><button class="fav'+(isf?' on':'')+'" type="button" data-fk="'+esc(fkey(f))+'" aria-label="مفضلة">'+(isf?'★':'☆')+'</button></div>'+
  '<div class="sevbar sev-'+sv+'"><b>'+SEVT[sv][0]+' '+SEVL[sv]+'</b> '+SEVT[sv][1]+' <small>(تقييم تقريبي من التطبيق مش من الشركة)</small></div>'+
  '<span class="tag">'+esc(CATS[f.k]||CATS.other)+'</span>'+(why?'<span class="tag">'+esc(why)+'</span>':'')+
  '<div class="qtag">الخطوات دي منقولة من دليل الشركة وموجّهة لفني مؤهل فقط — مش تعليمات تنفّذها بنفسك.</div><ol>'+f.s.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ol>'+
  '<div class="acts"><a class="sharebtn" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(shareTxt)+'">📤 واتساب</a><button class="sharebtn2" type="button" data-sh="'+esc(shareTxt)+'">🔗 مشاركة / نسخ</button></div>'+
  '<div class="muted">المصدر: '+esc(s.doc)+'<br><a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.url)+'</a></div></div>';
}
function mono(b){var n=(SRC[b].name||b).replace(/[^A-Za-z0-9 ]/g,'').trim().split(/\s+/);return (n[0]||b).slice(0,n.length>1&&n[0].length<3?3:2).toUpperCase()}
function bstyle(b){var h=0;for(var i=0;i<b.length;i++)h=(h*31+b.charCodeAt(i))%360;return 'background:linear-gradient(135deg,hsl('+h+',65%,42%),hsl('+((h+40)%360)+',70%,32%))'}
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
  bindCards(o);
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

function toast(t){var e=$('toast');if(!e){e=document.createElement('div');e.id='toast';document.body.appendChild(e)}e.textContent=t;e.className='show';clearTimeout(toast._t);toast._t=setTimeout(function(){e.className=''},1800)}
function bindCards(root){
  Array.prototype.forEach.call(root.querySelectorAll('.fav'),function(b){b.onclick=function(){var k=b.getAttribute('data-fk'),a=favs(),i=a.indexOf(k);if(i>=0)a.splice(i,1);else a.unshift(k);try{localStorage.setItem('invfav',JSON.stringify(a.slice(0,30)))}catch(e){}renderFavs();Array.prototype.forEach.call(document.querySelectorAll('.fav'),function(x){if(x.getAttribute('data-fk')===k){var on=a.indexOf(k)>=0;x.className='fav'+(on?' on':'');x.textContent=on?'★':'☆'}});toast(i>=0?'اتشالت من المفضلة':'اتحفظت في المفضلة ⭐')}});
  Array.prototype.forEach.call(root.querySelectorAll('.sharebtn2'),function(b){b.onclick=function(){var t=b.getAttribute('data-sh');if(navigator.share){navigator.share({text:t}).catch(function(){})}else if(navigator.clipboard){navigator.clipboard.writeText(t).then(function(){toast('اتنسخ ✅')},function(){toast('النسخ مش متاح')})}else toast('المشاركة مش متاحة في المتصفح ده')}});
}
function renderFavs(){var a=favs(),sec=$('favsec'),box=$('favs');var items=a.map(function(k){return F.filter(function(f){return fkey(f)===k})[0]}).filter(Boolean);sec.hidden=!items.length;box.innerHTML=items.map(function(f){return card(f,'')}).join('');bindCards(box)}
renderFavs();
// chips
(function(){var nav=$('chips');if(!nav)return;var h='<button type="button" class="chipb on" data-b="">كل الشركات</button>';Object.keys(SRC).forEach(function(k){h+='<button type="button" class="chipb" data-b="'+k+'"><span class="bmark sm" style="'+bstyle(k)+'">'+esc(mono(k))+'</span>'+esc(SRC[k].name.split(' (')[0])+'</button>'});nav.innerHTML=h;
 nav.onclick=function(e){var b=e.target.closest('.chipb');if(!b)return;var v=b.getAttribute('data-b');bs.value=v;$('fbrand').value=v;renderList($('filter').value);Array.prototype.forEach.call(nav.children,function(x){x.className='chipb'+(x===b?' on':'')});b.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'});if($('hq').value.trim())$('hform').requestSubmit?$('hform').requestSubmit():$('go').click()}})();
$('hform').onsubmit=function(e){e.preventDefault();var q=$('hq').value.trim();if(!q)return;if(/^[A-Za-z0-9\-\.\/]{1,14}$/.test(q)){$('code').value=q;$('txt').value=''}else{$('txt').value=q;$('code').value=''}$('go').click()};
$('qcam').onclick=function(){$('live').click();$('live').scrollIntoView({behavior:'smooth',block:'center'})};
$('qupl').onclick=function(){$('cam').click()};

// ===== chat (database only) + optional AI explain =====
var ARM=[[/جهد.{0,6}الشبك|الشبكه|شبكة/,'grid','grid'],[/عالي|عاليه|زياد|ارتفاع|اوفر|over/i,'over high',''],[/واطي|واطى|منخفض|نقص|under|low/i,'under low',''],[/تردد/,'frequency','grid'],[/عزل|تسرب|ارضي|أرضي|تأريض|ارضى|جراوند|ground/i,'insulation isolation leakage ground earth','insulation'],[/حرار|سخن|سخونه|ساخن|temperature/i,'temperature over temp','temp'],[/مروح|فان/,'fan','fan'],[/بطاري|بطاريه|battery/i,'battery','battery'],[/حمل زائد|حمل زايد|اوفر لود|overload/i,'overload','load'],[/قوس|شرار|arc/i,'arc','arc'],[/الواح|ألواح|بانل|panel|pv/i,'pv input','pvdc'],[/اتصال|communication/i,'communication','comm']];
function chatSearch(q){
  var kset={},extra='';ARM.forEach(function(m){if(m[0].test(q)){extra+=' '+m[1];if(m[2])kset[m[2]]=1}});
  var full=q+' '+extra,brands=detectBrands(full);
  var d=diagnose(q,'','');var out=[],seen={};
  function put(f,sc){var k=fkey(f);if(seen[k]){if(sc>seen[k].sc)seen[k].sc=sc;return}seen[k]={f:f,sc:sc};out.push(seen[k])}
  d.res.forEach(function(r){put(r.f,100+r.score)});
  var tk=norm(full).split(' ').filter(function(w){return w.length>2&&!/^(the|and|for|with|what|error|fault|code|inverter)$/.test(w)});
  if(tk.length){F.forEach(function(f){
    if(brands.length&&brands.indexOf(f.b)<0)return;
    var nt=norm(f.n+' '+(CATS[f.k]||'')).split(' '),sc=0;
    tk.forEach(function(w){if(nt.indexOf(w)>=0)sc+=2;else if(w.length>4&&nt.some(function(x){return x.indexOf(w)===0}))sc+=1});
    if(Object.keys(kset).length&&kset[f.k])sc+=2;
    if(sc>=3||(sc>=2&&tk.length<=2))put(f,sc)})}
  out.sort(function(a,b){return b.sc-a.sc});
  return out.slice(0,3).map(function(x){return x.f});
}
function cadd(cls,html){var c=$('chat'),e=document.createElement('div');e.className='cmsg '+cls;e.innerHTML=html;c.appendChild(e);e.scrollIntoView({block:'nearest',behavior:'smooth'});return e}
var lastQ='',lastHits=[],hist2=[];
function chatAsk(q){
  q=q.trim();if(!q)return;lastQ=q;
  cadd('me','<div class="bub"></div>').firstChild.textContent=q;
  var hits=chatSearch(q);lastHits=hits;
  if(!hits.length){cadd('bot','<div class="bub">مالقيتش في القاعدة الرسمية حاجة مطابقة لسؤالك. اكتب الكود أو نص الخطأ زي ما بيظهر على الشاشة، أو اختار الشركة من الشريط اللي فوق.</div>');return}
  var e=cadd('bot','<div class="bub">لقيت '+hits.length+' نتيجة من القاعدة الرسمية (الكروت دي هي المرجع):</div><div class="cards">'+hits.map(function(f){return card(f,'')}).join('')+'</div><button type="button" class="aibtn">✨ اشرح بالذكاء الاصطناعي</button><div class="aiout"></div>');
  bindCards(e);
  e.querySelector('.aibtn').onclick=function(){aiExplain(e,q,hits)};
}
var ALLOWNUM=/[A-Za-z0-9\u0660-\u0669\-\.\/_]*[0-9\u0660-\u0669][A-Za-z0-9\u0660-\u0669\-\.\/_]*/g;
function ar2en(t){return t.replace(/[\u0660-\u0669]/g,function(d){return String(d.charCodeAt(0)-1632)})}
function aiCheck(reply,hits,q){
  var allowed=ar2en((q+' '+hits.map(function(f){return [SRC[f.b].name,f.c,f.n,f.s.join(' ')].join(' ')}).join(' ')+' '+hits.map(function(f){return SRC[f.b].url}).join(' ')).toLowerCase());
  var bad=[];
  (ar2en(reply).match(ALLOWNUM)||[]).forEach(function(t){t=t.toLowerCase().replace(/^[\-\.\/_]+|[\-\.\/_]+$/g,'');if(t&&allowed.indexOf(t)<0&&bad.indexOf(t)<0)bad.push(t)});
  var urls=(reply.match(/https?:\/\/\S+|www\.\S+/gi)||[]).filter(function(u){return allowed.indexOf(u.toLowerCase().replace(/[).,،]+$/,''))<0});
  urls.forEach(function(u){bad.push(u)});
  if(/افتح\s*(ال)?(جهاز|انفرتر|إنفرتر|الغطاء)|فك\s|افصل\s*(ال)?(كابل|كابلات|سلك|اسلاك|أسلاك)|(لا)?مس\s*(ال)?(كابل|سلك|اسلاك|أسلاك)|open the (inverter|cover)|unplug|disconnect the/i.test(reply))bad.push('تعليمات غير آمنة');
  if(reply.length>1500)bad.push('رد طويل');
  return {ok:!bad.length,bad:bad};
}
function puterText(r){if(!r)return'';if(typeof r==='string')return r;var m=r.message||r;var c=m.content!==undefined?m.content:m;if(typeof c==='string')return c;if(Array.isArray(c))return c.map(function(x){return typeof x==='string'?x:(x&&x.text)||''}).join('');return String(c||'')}
var puterP=null;
function loadPuter(){if(window.puter)return Promise.resolve();if(puterP)return puterP;puterP=new Promise(function(ok,no){var s=document.createElement('script');s.src='https://js.puter.com/v2/';s.onload=ok;s.onerror=function(){puterP=null;no(new Error('load'))};document.head.appendChild(s)});return puterP}
async function aiExplain(box,q,hits){
  var out=box.querySelector('.aiout'),btn=box.querySelector('.aibtn');
  if(!out.dataset.agreed&&!confirm('الزرار ده بيبعت سؤالك ونص الكروت الظاهرة لخدمة Puter (طرف تالت) عشان تشرحهم، وممكن يطلب منك تسجيل دخول بحساب Puter مجاني. الشرح مش من دليل الشركة. تكمّل؟'))return;
  out.dataset.agreed='1';btn.disabled=true;out.className='aiout wait';out.textContent='بجهّز الشرح...';
  var data=hits.map(function(f){return {brand:SRC[f.b].name,code:f.c,name:f.n,steps_from_official_manual:f.s,source:SRC[f.b].doc}});
  var prompt='You explain inverter faults to a non-expert in simple Egyptian Arabic, in at most 120 words.\nRules: use ONLY the DATA below. Never add any fault code, number, setting, step, brand or link that is not in DATA. If DATA does not answer the question, say so. Never tell the user to open the inverter or touch wiring or DC cables; repairs are for a qualified technician. Do not give a diagnosis beyond DATA.\nDATA: '+JSON.stringify(data)+'\nUSER QUESTION: '+q;
  try{
    await loadPuter();
    var r=await puter.ai.chat(prompt,{normalize:true});
    var t=puterText(r).trim(),chk=aiCheck(t,hits,q);
    if(!t){throw new Error('empty')}
    if(!chk.ok){out.className='aiout bad';out.textContent='الرد اتلغى لأنه فيه أرقام أو أكواد مش موجودة في الكروت الرسمية ('+chk.bad.slice(0,4).join('، ')+'). الكروت الرسمية اللي فوق هي المرجع.';}
    else{out.className='aiout ok';out.innerHTML='<div class="aitag">شرح بالذكاء الاصطناعي (مش من دليل الشركة) راجع الكروت اللي فوق</div><div class="aitxt"></div>';out.querySelector('.aitxt').textContent=t}
  }catch(e){
    out.className='aiout bad';
    out.textContent=(e&&e.message==='load')?'مقدرتش أحمّل خدمة Puter (محتاج إنترنت). الكروت الرسمية اللي فوق كافية.':'الشرح بالذكاء الاصطناعي مش متاح دلوقتي (ممكن تكون محتاج تسجّل دخول في Puter بحساب مجاني، أو الحد اليومي خلص). الكروت الرسمية اللي فوق هي المرجع.';
  }
  btn.disabled=false;
}
$('cform').onsubmit=function(e){e.preventDefault();var v=$('cq').value;$('cq').value='';chatAsk(v)};
Array.prototype.forEach.call(document.querySelectorAll('#sugg .chip'),function(b){b.onclick=function(){chatAsk(b.getAttribute('data-q'))}});
window.__aiCheck=aiCheck;window.__chatSearch=chatSearch;
window.__diagnose=diagnose;
if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(function(r){document.addEventListener('visibilitychange',function(){if(!document.hidden)r.update().catch(function(){})})}).catch(function(){});var rl=false;navigator.serviceWorker.addEventListener('controllerchange',function(){if(rl)return;rl=true;if(!window.__busy)location.reload()})}
})();
