(function(){
'use strict';
var KB=window.KB, F=KB.faults, SRC=KB.src;
var CATS={grid:'الشبكة (جهد/تردد/فصل)',insulation:'عزل / تسرب أرضي / تأريض',pvdc:'دخل الألواح (PV/DC)',temp:'حرارة',fan:'مراوح',arc:'قوس كهربي (Arc)',internal:'عطل داخلي (غالبًا للدعم الفني)',comm:'اتصال',battery:'البطارية',load:'الخرج / الحمل الزائد',other:'أخرى'};
var SEV={arc:'h',insulation:'h',pvdc:'m',internal:'m',temp:'m',fan:'m',battery:'m',load:'m',grid:'l',comm:'l',other:'m'};
var SEVL={h:'خطورة عالية',m:'خطورة متوسطة',l:'خطورة منخفضة'};
var SEVT={h:['🔴','أولوية عالية: ممكن يكون فيه خطر كهرباء أو حريق. ما تلمسش الجهاز، وكلّم فني مؤهل.'],m:['🟠','محتاج فني يفحصه. لو العطل متكرر سيب الجهاز مفصول.'],l:['🟢','غالبًا مؤقت أو من الشبكة. راقب الجهاز، ولو استمر كلّم فني.']};
var BRAND_KW={sofarep:['sofar','hyd-ep','hyd 3000-ep','hyd3000-ep','hyd 3-6k','hyd3-6k','hyd 5000-ep','hyd 6000-ep','3-6k-ep'],solaxg2:['solax','x3-pro g2','x3 pro g2','x3-pro','x3 pro','x3pro','tzfault','gridlostfault'],afore:['afore'],steca:['steca','stecagrid'],kaco:['kaco','blueplanet'],refusol:['refusol','refu sol'],solplanet:['solplanet','aiswei'],sunsynk:['sunsynk','sun synk'],invt:['invt','imars','xg100','xg110','xg125'],solark:['sol-ark','solark','sol ark','12k-2p'],fronius:['fronius','symo','primo','eco 25','gen24','tauro'],abb:['abb','fimer','power-one','power one','aurora','uno-dm','uno dm'],must:['must','pv1800','ph1800','pv3500','ph3000'],schneider:['schneider','conext','xantrex'],felicity:['felicity','ivem','ivpm','ivgm'],sungrow:['sungrow','sg2','sg5','sg8','sg10','sg110','sh5','sh10'],huawei:['huawei','sun2000','fusionsolar','fusion solar'],epever:['epever','ipower','ip350','ip500','ip1000','ip1500','ip2000'],studer:['studer','xtender','xth-','xtm-','xts-','rcc-02'],cps:['cps ','chint','sca36','sca50','sca100','sca25'],apsystems:['apsystems','aps ','ds3','ds3-l','ds3-s','ds3d','ecu','ema manager'],epeverup:['epever','upower','up-hi','up hi','up2000','up3000','up5000','hm6021','hm5041','hm8041','hm10021'],enphase:['enphase','iq7','iq 7','iq7+','iq7x','iq7a','envoy','microinverter','micro inverter'],growattsph:['growatt','sph','sph 3000','sph 3600','sph 4000','sph 4600','sph 5000','sph 6000','tl-hu','tl-hub','hub','shinewilan'],growattxh:['growatt','tl-xh','min 2500','min 3000','min 3600','min 4200','min 4600','min 5000','min 6000','xh2'],growattspf:['growatt','spf 3500','spf 5000','spf3500','spf5000','spf 3000','growatt spf'],growatt:['growatt','shinebus','shine','mod ','mic ','min '],axpert:['axpert','voltronic','mppsolar','mpp solar','vm iii','infini'],solax:['solax','x1-hyb','x3-hyb','x1 hybrid','x3 hybrid','x1-boost','x3-pro','x3 pro'],sma:['sma','sunny boy','sunny tripower','sunnyboy','tripower'],goodwe:['goodwe','good we','sems portal','gw4000','gw5000','gw6000','gw8000','gw10k','gw12k','gw15k','gw17k','gw20k'],deye:['deye','sun-12k','sun-10k','sun-8k','sun-6k','sun-5k','sg04lp3'],solis:['solis','ginlong','soliscloud'],kostal:['kostal','piko','plenticore'],hoymiles:['hoymiles','hms-','hmt-'],sofar:['sofar','hyd-es','hyd3000','hyd3600','hyd4000','hyd5000','hyd6000','hyd 5000','hyd 6000'],lux:['luxpower','lux power','luxpowertek','lxp'],foxess:['fox ess','foxess','fox-ess','h1-','ac1-'],solaredge:['solaredge','solar edge','se5000','se7600','se10k','se8k','se6k','se3000','se3500','se4000'],delta:['delta','rpi-m','rpi m','m15a','m20a','m30a','m50a','soliveus'],victron:['victron','multiplus','quattro','ve.bus','vebus','easysolar'],srne:['srne','srne solar','hesp48160','hesp48180','hesp48200','hesp series'],megarevo:['megarevo','mega revo','klna','r12klna','r16klna','p6 series']};
var ARSYN=[
[/جهد.{0,8}الشبك|الشبكه|شبكة|شبكه|grid/i,'grid over under voltage','grid'],
[/عالي|عاليه|عالية|زياد|ارتفاع|أوفر|اوفر|over/i,'over high',''],
[/واطي|واطى|واطية|منخفض|نقص|under|low/i,'under low',''],
[/تردد|هرتز|frequency|hz/i,'frequency','grid'],
[/عزل|تسرب|ارضى|أرضى|ارضي|تأريض|تاريض|جراوند|ground|earth|insulation|leakage/i,'insulation leakage ground earth','insulation'],
[/حرار|سخن|سخون|ساخن|حرارة|حراره|temperature|temp/i,'temperature temp over','temp'],
[/مروح|فان|fan/i,'fan','fan'],
[/بطاري|بطارية|بطاريه|battery/i,'battery','battery'],
[/حمل|زايد|زائد|اوفرلود|أوفرلود|overload/i,'overload load','load'],
[/قوس|شرار|شرارة|arc/i,'arc','arc'],
[/الواح|ألواح|لوح|بانل|panel|pv/i,'pv panel input','pvdc'],
[/اتصال|تواصل|communication|comm/i,'communication comm','comm'],
[/قصير|شورت|short/i,'short circuit','internal'],
[/باص|bus/i,'bus','internal'],
[/انفرتر|إنفرتر|عاكس|inverter/i,'inverter',''],
[/اكواد|كود|code/i,'',''],
[/عطل|اعطال|أعطال|مشكلة|مشكله|error|fault/i,'','']
];
function arDigits(t){return String(t||'').replace(/[\u0660-\u0669]/g,function(d){return String(d.charCodeAt(0)-1632)}).replace(/[\u06F0-\u06F9]/g,function(d){return String(d.charCodeAt(0)-1776)})}
function isAr(t){return /[\u0600-\u06FF]/.test(String(t||''))}
function arScore(q){
  var terms=[],cats={},ok=0;
  ARSYN.forEach(function(m){if(m[0].test(q)){ok++;m[1].split(' ').forEach(function(w){if(w&&terms.indexOf(w)<0)terms.push(w)});if(m[2])cats[m[2]]=1}});
  if(!ok)return [];
  var out=[];
  F.forEach(function(f){
    var nt=' '+norm(f.c+' '+f.n+' '+(CATS[f.k]||''))+' ',sc=0;
    terms.forEach(function(w){if(nt.indexOf(' '+w)>=0)sc+=1.2});
    if(cats[f.k])sc+=1.5;
    if(sc>=2.4)out.push({f:f,sc:sc});
  });
  out.sort(function(a,b){return b.sc-a.sc});
  return out.slice(0,10);
}
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function norm(s){return s.toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim()}
function inRange(code,n){ if(!code) return false; if(code.indexOf(',')>=0) return code.split(',').some(function(c){return inRange(c.trim(),n)}); var p=code.split('-'); if(p.length==2) return n>=+p[0]&&n<=+p[1]; return +code===n; }
function detectBrands(t){var l=' '+t.toLowerCase()+' ',r=[];for(var b in BRAND_KW){if(BRAND_KW[b].some(function(k){return l.indexOf(k)>=0}))r.push(b)}return r}
function diagnose(text,brandSel,codeSel){
  text=arDigits(text||'');codeSel=arDigits(codeSel||'');
  var full=(text||'')+' '+(codeSel||'');
  var brands=brandSel?[brandSel]:detectBrands(full);
  var nums=(full.match(brands.length?/\b\d{2,4}\b/g:/\b\d{3,4}\b/g)||[]).map(Number);
  if(brands.length&&/^\s*\d\s*$/.test(codeSel||''))nums.push(+codeSel);
  if(brands.length&&!nums.length&&!/\d/.test(brandSel?'':'')){var tt=(text||'').trim(),m1=tt.match(/(?:^|\s)(\d)\s*$/);if(m1&&(tt.match(/\d/g)||[]).length===1&&nums.indexOf(+m1[1])<0)nums.push(+m1[1])}
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
  var codeTok=(full.match(/\b[A-Za-z]{0,3}-?\d{2,4}\b/g)||[]).length>0;
  if(!res.length&&!codeTok&&nt.trim().length>6){
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
  if(isAr(text)){arScore(text).forEach(function(x){add(x.f,'مطابقة بالكلمات العربية',x.sc)})}
  res.sort(function(a,b){return b.score-a.score});
  return {res:res.slice(0,8),brands:brands,nums:nums,total:res.length};
}
function fkey(f){return f.b+'|'+f.c+'|'+f.n}
function favs(){try{return JSON.parse(localStorage.getItem('invfav')||'[]')}catch(e){return []}}
var SRC_THIRD={huawei:1,solax:1,sofar:1},SRC_UNCL={deye:1,steca:1,growatt:1};
var SRC_BROKEN={solark:1};
function srcStatus(b){if(SRC_BROKEN[b])return '⚠️ الرابط ده ميت (404 يوم 27/11/2026) حتى في مكتبة مستندات الشركة نفسها. الخطوات من نسخة الدليل القديم ولسه مش متأكد منها';if(SRC_THIRD[b])return '⚠️ نسخة مستضافة عند طرف تالت، والنسخة الرسمية لسه ما اتأكدتش';if(SRC_UNCL[b])return '⚠️ الاستضافة مش واضح إنها موقع الشركة الرئيسي، لسه بتتراجع';return '✔️ الملف على دومين الشركة (ده مش معناه إن الكود اتجرب على جهاز)'}
function whyAr(w){if(!w)return '';if(w.indexOf('code ')===0)return 'الكود '+w.slice(5);if(w==='name match')return 'مطابقة الاسم';return w}
function stepAr(t){if(!t)return '';if(window.STEPAR&&window.STEPAR[t])return window.STEPAR[t];
  var R=window.STEPAR_RULES||[];
  for(var i=0;i<R.length;i++){var m=t.match(R[i][0]);if(m){try{return R[i][1](m)}catch(e){}}}
  return ''}
function card(f,why){
  var s=SRC[f.b],sv=SEV[f.k]||'m',isf=favs().indexOf(fkey(f))>=0;
  var shareTxt=s.name+' - '+(f.c?f.c+' - ':'')+f.n+'\n'+f.s.map(function(x,i){return (i+1)+'. '+x}).join('\n')+'\nالمصدر: '+s.url;
  var anyAr=false;
  var steps=f.s.map(function(x){var ar=stepAr(x);if(ar)anyAr=true;
    return '<li>'+(ar?'<div class="sar">'+esc(ar)+'</div><div class="sen" dir="ltr">'+esc(x)+'</div>':'<div class="sen only" dir="ltr">'+esc(x)+'</div>')+'</li>'}).join('');
  return '<div class="res cat-'+f.k+' sv-'+sv+'"><div class="rtop"><span class="bmark" style="'+bstyle(f.b)+'">'+esc(mono(f.b))+'</span><div class="rt"><h3>'+(f.c?'<span class="code">'+esc(f.c)+'</span> ':'')+esc(f.n)+'</h3><div class="rsub"><b>'+esc(s.name)+'</b> <span class="sevpill sev-'+sv+'">'+SEVT[sv][0]+' '+SEVL[sv]+'</span> <span class="tag">'+esc(CATS[f.k]||CATS.other)+'</span>'+(why?'<span class="tag">'+esc(whyAr(why))+'</span>':'')+'</div></div><button class="fav'+(isf?' on':'')+'" type="button" data-fk="'+esc(fkey(f))+'" aria-label="مفضلة">'+(isf?'★':'☆')+'</button></div>'+
  '<div class="sevnote">'+esc(SEVT[sv][1])+' <small>(تقدير التطبيق، مش من الشركة)</small></div>'+
  '<ol class="steps">'+steps+'</ol>'+
  (anyAr?'<div class="trnote">الترجمة العربية من عندي؛ النص الإنجليزي الأصلي من الدليل تحت كل خطوة.</div>':'')+
  '<div class="cnote">⚠️ الخطوات دي منقولة من دليل الشركة، ولفني مؤهل بس — مش تعليمات تنفّذها بنفسك.</div>'+
  '<div class="cacts"><a class="sharebtn" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(shareTxt)+'">📤 واتساب</a><button class="linkbtn" type="button" data-fk="'+esc(fkey(f))+'">🔖 لينك الكارت</button>'+
  '<details class="more"><summary aria-label="خيارات أكتر">⋯</summary><div class="morebox"><button class="sharebtn2" type="button" data-sh="'+esc(shareTxt)+'">🔗 مشاركة / نسخ</button><button class="cmpbtn" type="button" data-fk="'+esc(fkey(f))+'">⚖️ قارن</button><button class="repbtn" type="button" data-fk="'+esc(fkey(f))+'">📄 تقرير PDF</button><button class="imgbtn" type="button" data-fk="'+esc(fkey(f))+'">🖼️ صورة الكارت</button><button class="printbtn" type="button">🖨️ طباعة</button></div></details></div>'+
  '<details class="csrc"><summary>📄 المصدر والدليل</summary><div class="muted">'+esc(s.doc)+'<br><b class="srcst">'+srcStatus(f.b)+'</b><br><a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.url)+'</a></div></details></div>';
}
function mono(b){var n=(SRC[b].name||b).replace(/[^A-Za-z0-9 ]/g,'').trim().split(/\s+/);return (n[0]||b).slice(0,n.length>1&&n[0].length<3?3:2).toUpperCase()}
function bstyle(b){var h=0;for(var i=0;i<b.length;i++)h=(h*31+b.charCodeAt(i))%360;return 'background:linear-gradient(135deg,hsl('+h+',65%,42%),hsl('+((h+40)%360)+',70%,32%))'}
function suggestHtml(q){
  var tk=norm(q||'').split(' ').filter(function(w){return w.length>2});
  if(!tk.length) return '';
  var sc=[];
  F.forEach(function(f){var t=' '+norm((f.c||'')+' '+f.n+' '+SRC[f.b].name)+' ',n=0;tk.forEach(function(w){if(t.indexOf(w)>=0)n++});if(n)sc.push([n,f])});
  sc.sort(function(a,b){return b[0]-a[0]});
  var top=sc.slice(0,4);
  if(!top.length) return '<div class="muted">جرّب كلمات أبسط من الشاشة، زي "grid" أو "isolation" أو رقم الكود بس.</div>';
  return '<div class="muted" style="margin-top:8px">يمكن تقصد:</div>'+top.map(function(x){var f=x[1],lab=SRC[f.b].name.split(' ')[0]+' '+(f.c?f.c+' · ':'')+f.n;if(lab.length>60)lab=lab.slice(0,58)+'…';return '<button type="button" class="chip sgg" data-q="'+esc(SRC[f.b].name.split(' ')[0]+' '+(f.c||f.n))+'">'+esc(lab)+'</button>'}).join('');
}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.sgg');if(!b)return;var t=$('txt');if(!t)return;t.value=b.getAttribute('data-q');var g=$('go');if(g)g.click()});
function cardImage(f){
  var s=SRC[f.b],W=1080,P=48,c=document.createElement('canvas'),x=c.getContext('2d');
  var lines=[];
  function wrap(t,font,w,col,ind){x.font=font;var words=String(t).split(' '),l='';words.forEach(function(wd){var tt=l?l+' '+wd:wd;if(x.measureText(tt).width>w&&l){lines.push([l,font,col,ind||0]);l=wd}else l=tt});if(l)lines.push([l,font,col,ind||0])}
  wrap((f.c?f.c+'  ':'')+f.n,'bold 38px sans-serif',W-2*P,'#0b3d2e');
  wrap(s.name,'28px sans-serif',W-2*P,'#44564e');
  var sv=SEV[f.k]||'m';wrap('Severity (app estimate, not the manufacturer): '+({h:'high',m:'medium',l:'low'})[sv],'24px sans-serif',W-2*P,'#8a1f14');
  lines.push(['','10px sans-serif','#000',0]);
  f.s.forEach(function(st,i){wrap((i+1)+'. '+st,'28px sans-serif',W-2*P-20,'#17211d',20)});
  lines.push(['','10px sans-serif','#000',0]);
  wrap('Source: '+s.doc,'22px sans-serif',W-2*P,'#44564e');if(SRC_THIRD[f.b])wrap('Note: third-party hosted copy, official version not yet verified.','22px sans-serif',W-2*P,'#8a1f14');
  wrap(s.url,'20px sans-serif',W-2*P,'#0f7a55');
  wrap('For a qualified technician only. Not maintenance instructions.','22px sans-serif',W-2*P,'#8a1f14');
  var H=P*2+lines.reduce(function(a,l){return a+(parseInt(l[1].replace(/\D+/g,' ').trim())||24)*1.35},0)+40;
  c.width=W;c.height=Math.ceil(H);x.fillStyle='#fff';x.fillRect(0,0,W,c.height);x.fillStyle='#0f7a55';x.fillRect(0,0,W,14);
  var y=P+20;lines.forEach(function(l){var sz=parseInt(l[1].replace(/\D+/g,' ').trim())||24;x.font=l[1];x.fillStyle=l[2];x.textBaseline='top';x.fillText(l[0],P+l[3],y);y+=sz*1.35});
  return c;
}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.imgbtn');if(!b)return;var k=b.getAttribute('data-fk'),f=F.filter(function(x){return fkey(x)===k})[0];if(!f)return;
  var c=cardImage(f);c.toBlob(function(bl){if(!bl){toast('معرفتش أعمل الصورة');return}var file=new File([bl],'inverter-fix-'+(f.c||'fault').replace(/[^A-Za-z0-9_-]/g,'')+'.png',{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file]}).catch(function(){})}
    else{var a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download=file.name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1500);toast('الصورة اتحمّلت 🖼️')}},'image/png')});
function buildReport(list){
  var d=new Date(),ds=d.toLocaleString('en-GB'),p2=function(n){return (n<10?'0':'')+n},ref='IF-'+d.getFullYear()+p2(d.getMonth()+1)+p2(d.getDate())+'-'+p2(d.getHours())+p2(d.getMinutes())+p2(d.getSeconds()),pv=$('prev');
  var h='<div class="rbrand">Inverter Fix · مشخّص أعطال الإنفرتر</div><h1>Inverter fault report / تقرير عطل إنفرتر</h1><p class="rmeta">Reference: '+ref+' · Generated: '+esc(ds)+' · Faults: '+list.length+'</p>';
  if(pv&&!pv.hidden&&pv.src)h+='<p><b>Uploaded image:</b><br><img class="rimg" src="'+esc(pv.src)+'" alt=""></p>';
  h+='<p><b>Assessment:</b> matched in the app\'s fault database built from manufacturer documents. No AI model was used for this report. Confidence is not scored; verify against the manual.</p>';
  list.forEach(function(f,i){var s=SRC[f.b];
    h+='<section class="rsec"><h2>'+(i+1)+'. '+esc((f.c?f.c+' - ':'')+f.n)+'</h2><p><b>Brand / model:</b> '+esc(s.name)+'</p><ol>'+f.s.map(function(t){return '<li>'+esc(t)+'</li>'}).join('')+'</ol><p><b>Source:</b> '+esc(s.doc)+(SRC_THIRD[f.b]?' (third-party hosted copy, official version not yet verified)':'')+'<br>'+esc(s.url)+'</p><p><b>Verification:</b> text taken from the manufacturer document above. Not tested on a physical inverter. Page number not recorded.</p></section>'});
  h+='<p class="rwarn">For a qualified technician only. This report does not replace the manufacturer manual. Do not open or repair the inverter yourself; DC voltage stays present while the sun shines.</p>';
  var el=document.getElementById('rep');if(!el){el=document.createElement('div');el.id='rep';document.body.appendChild(el)}el.innerHTML=h;
  document.body.classList.add('printrep');
  var done=function(){document.body.classList.remove('printrep');window.removeEventListener('afterprint',done)};
  window.addEventListener('afterprint',done);setTimeout(function(){window.print()},80);
}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.repbtn');if(!b)return;var k=b.getAttribute('data-fk'),f=F.filter(function(x){return fkey(x)===k})[0];if(f)buildReport([f])});
var lastText='';
function show(d,ocrText){
  var o=$('out'),h='';
  if(ocrText!==undefined) h+='<div class="card"><b>النص اللي اتقرا:</b><div class="muted" dir="ltr" style="text-align:left">'+esc(ocrText.trim()||'(فاضي)')+'</div></div>';
  if(!d.res.length){
    h+='<div class="none">مفيش تطابق في القاعدة'+(d.nums.length?' للأرقام '+d.nums.join('، '):'')+'. اختار الشركة واكتب الكود يدويًا، أو دوّر في القائمة تحت. لو الكود مش موجود، ارجع لدليل موديلك.</div>'+suggestHtml($('txt').value||lastText);
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
function saveHist(b,c,t){if(!(c||t))return;try{try{var lg=JSON.parse(localStorage.getItem('invlog')||'[]');lg.push({b:b||'',c:c||'',t:t?1:0,ts:Date.now()});localStorage.setItem('invlog',JSON.stringify(lg.slice(-500)))}catch(e){}var h=hist().filter(function(x){return !(x.b===b&&x.c===c&&x.t===t)});h.unshift({b:b,c:c,t:t});localStorage.setItem('invhist',JSON.stringify(h.slice(0,6)));renderHist()}catch(e){}}
function renderHist(){var h=hist(),e=$('hist');if(!h.length){e.innerHTML='';return}e.innerHTML='<div class="muted">آخر بحث (على جهازك بس):</div>'+h.map(function(x,i){return '<button class="chip" data-i="'+i+'" type="button">'+esc((x.b&&SRC[x.b]?SRC[x.b].name+' ':'')+(x.c||x.t).slice(0,24))+'</button>'}).join('')+'<button class="chip" id="clrh" type="button">مسح ✖</button>';
  Array.prototype.forEach.call(e.querySelectorAll('[data-i]'),function(b){b.onclick=function(){var x=h[+b.getAttribute('data-i')];bs.value=x.b||'';$('code').value=x.c||'';$('txt').value=x.t||'';$('go').click()}});
  $('clrh').onclick=function(){localStorage.removeItem('invhist');renderHist()}}
$('go').onclick=function(){saveHist(bs.value,$('code').value.trim(),$('txt').value.trim());show(diagnose($('txt').value,bs.value,$('code').value),undefined)};
renderHist();
$('code').addEventListener('keydown',function(e){if(e.key==='Enter')$('go').click()});
function renderList(q){
  var raw=q||'',arList=isAr(raw)?arScore(raw).map(function(x){return x.f}):null;
  q=norm(raw);var fb=$('fbrand').value,fk=$('fcat').value;
  var items=F.filter(function(f){return (!fb||f.b===fb)&&(!fk||f.k===fk)&&(arList?(arList.indexOf(f)>=0):(!q||norm(f.c+' '+f.n+' '+SRC[f.b].name).indexOf(q)>=0))});
  if(arList)items=arList.filter(function(f){return (!fb||f.b===fb)&&(!fk||f.k===fk)}); if($('fsort')&&$('fsort').value==='sev'){var o={h:0,m:1,l:2};items=items.map(function(f,i){return [f,i]}).sort(function(a,b){return (o[SEV[a[0].k]||'m']-o[SEV[b[0].k]||'m'])||(a[1]-b[1])}).map(function(x){return x[0]})} items=items.slice(0,400);
  $('lcount').textContent=items.length+' نتيجة'+(items.length>=400?' (أول 400)':'');
  $('list').innerHTML=items.map(function(f){return '<details class="sv-'+(SEV[f.k]||'m')+'"><summary><span class="svdot">'+SEVT[SEV[f.k]||'m'][0]+'</span> <b>'+esc(SRC[f.b].name)+'</b> '+(f.c?esc(f.c)+' · ':'')+esc(f.n)+'</summary><div class="qtag">الخطوات دي منقولة من دليل الشركة وموجّهة لفني مؤهل فقط — مش تعليمات تنفّذها بنفسك.</div><ol>'+f.s.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ol></details>'}).join('')||'<div class="muted">مفيش نتائج</div>';
}
var fbs=$('fbrand'),fcs=$('fcat');Object.keys(SRC).forEach(function(k){var op=document.createElement('option');op.value=k;op.textContent=SRC[k].name;fbs.appendChild(op)});Object.keys(CATS).forEach(function(k){var op=document.createElement('option');op.value=k;op.textContent=CATS[k];fcs.appendChild(op)});
$('filter').oninput=function(){renderList(this.value)};fbs.onchange=fcs.onchange=($('fsort')||{}).onchange=function(){renderList($('filter').value)};renderList('');
(function(){var f=$('foot'),n=Object.keys(SRC).map(function(k){return SRC[k].name});f.textContent='';var p=document.createElement('p');p.textContent='القاعدة: '+F.length+' عطل من '+n.length+' شركات. البحث بالكود بيشتغل من غير إنترنت بعد أول فتح. قراءة الصورة (OCR) بتحتاج إنترنت.';var d=document.createElement('details');d.className='brl';var sm=document.createElement('summary');sm.textContent='📋 الشركات والمصادر الرسمية ('+n.length+')';d.appendChild(sm);var q=document.createElement('div');q.className='srclist';Object.keys(SRC).forEach(function(k){var r=document.createElement('div');r.className='srow';var b=document.createElement('b');b.textContent=SRC[k].name+' ('+F.filter(function(x){return x.b===k}).length+')';var m=document.createElement('div');m.className='muted';m.textContent=SRC[k].doc;var a=document.createElement('a');a.href=SRC[k].url;a.target='_blank';a.rel='noopener';a.textContent='فتح الدليل الرسمي';r.appendChild(b);r.appendChild(m);r.appendChild(a);q.appendChild(r)});d.appendChild(q);f.appendChild(p);f.appendChild(d)})();

function ocrAmb(t){var out=[];(t.match(/[A-Za-z0-9]{2,}/g)||[]).forEach(function(w){if(/[0-9]/.test(w)&&/[A-Za-z]/.test(w)||/^[0-9OIlSBZ]{2,}$/.test(w)&&/[OIlSBZ]/.test(w)){var m=w.match(/[OoIlSsBZz01258]/g);if(m)out.push(w)}});return out.filter(function(v,i,a){return a.indexOf(v)===i}).slice(0,8)}
function ocrConfirm(txt,bs,src,meta){
  var o=$('out'),amb=ocrAmb(txt),h='<div class="card"><b>راجع النص قبل التشخيص'+(src==='ai'?' (قراءة الذكاء الاصطناعي)':'')+'</b>';
  if(src==='ai'){
    var cf=meta&&meta.conf||'medium',cfT=cf==='high'?'عالية':(cf==='low'?'منخفضة':'متوسطة');
    h+='<div class="'+(cf==='high'?'okline':'warn')+'">ثقة القراءة: '+cfT+(cf==='high'?'':' — مش متأكد، راجع النص على الشاشة قبل التشخيص')+(meta&&meta.model?' · الموديل: '+esc(String(meta.model).replace('google/','')):'')+'</div>';
    var mc=codeMatch(meta&&meta.code);
    if(meta&&meta.code){
      if(mc){if(bs&&bs.value&&mc.b===bs.value)h+='<div class="okline">الكود <span dir="ltr">'+esc(meta.code)+'</span> موجود في قاعدة الأدلة للماركة اللي اخترتها ('+esc(SRC[mc.b].name)+'). الموديل لسه محتاج تأكيد.</div>';else h+='<div class="warn">الكود <span dir="ltr">'+esc(meta.code)+'</span> موجود بالرقم في قاعدة ماركة '+esc(SRC[mc.b].name)+'، لكن الماركة والموديل على الشاشة مش متأكد منهم: تطابق بالرقم بس (NEEDS_VERIFICATION). اختار الماركة الصح قبل التشخيص.</div>'}
      else{
        var nr=codeNear(meta.code);
        if(nr.length)h+='<div class="warn">الكود <span dir="ltr">'+esc(meta.code)+'</span> مش موجود بالحرف في القاعدة. فيه كود برقم قريب في ماركات تانية (مش بالضرورة نفس عطل ماركتك، ما تعتمدش عليه كتشخيص): <span dir="ltr">'+nr.map(function(x){return esc(x.c)}).join(' ، ')+'</span> ('+nr.map(function(x){return esc(SRC[x.b].name)}).join(' ، ')+'). راجع الشاشة وعدّل النص.</div>';
        else h+='<div class="warn">الكود <span dir="ltr">'+esc(meta.code)+'</span> مش موجود في قاعدة الأدلة ('+F.length+' عطل). لو الشاشة بتقول كده فعلًا، التطبيق مش هيلاقي تشخيص — صحّح الرقم أو اكتب الكود يدويًا.</div>';
      }
    }
  }
  if(src==='ai'&&meta&&meta.others&&meta.others.length){meta.others.forEach(function(x){var m2=codeMatch(x.code);h+='<div class="'+(m2?'okline':'warn')+'">كود تاني على الشاشة: <span dir="ltr">'+esc(x.code)+'</span> '+(m2?'موجود بالرقم في قاعدة '+esc(SRC[m2.b].name)+' (NEEDS_VERIFICATION لحد ما تتأكد من الماركة)':'مش موجود في القاعدة')+'.</div>'})}
  h+='<div class="muted">'+(src==='ai'?'الذكاء الاصطناعي بيقرا الكود من الصورة وممكن يغلط. النص اللي تحت هو اللي هيتم التشخيص عليه — صحّحه لو مش مطابق للشاشة، ولو الكود مش موجود في القاعدة اكتبه يدويًا.':'القراءة الآلية ممكن تغلط. صحّح النص لو فيه غلط، وبعدين اضغط تأكيد. مفيش حرف بيتغيّر تلقائيًا.')+'</div>';
  if(amb.length)h+='<div class="warn">حروف/أرقام ممكن تتلخبط (O/0، I/1، S/5، B/8، Z/2) في: <span dir="ltr">'+amb.map(esc).join(' ، ')+'</span>. اتأكد منها على الشاشة.</div>';
  h+='<textarea id="ocrfix" dir="ltr" rows="4" style="width:100%;text-align:left">'+esc(txt.trim())+'</textarea><button id="ocrok" class="btn" type="button">✅ النص صح، شخّص</button></div>';
  o.innerHTML=h;
  $('ocrok').onclick=function(){var t=$('ocrfix').value;saveHist(bs.value,'',t.replace(/\s+/g,' ').trim().slice(0,60));show(diagnose(t,bs.value,''),t)};
  try{o.scrollIntoView({behavior:'smooth'})}catch(e){}
}
// OCR
var worker=null;
function getWorker(){
  if(worker) return worker;
  var L=window.LITE,o={workerPath:'./worker.min.js',corePath:L?'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.0/':'./',langPath:L?'https://tessdata.projectnaptha.com/4.0.0_fast':'./',gzip:true,workerBlobURL:L?true:false,
    logger:function(m){if(m.status&&!aiWanted)$('ocrstat').textContent='OCR: '+m.status+(m.progress?' '+Math.round(m.progress*100)+'%':'')}};
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
var lastImg=null,aivBusy=false,aiWanted=false,ocrSeq=0;
function shrinkForAI(f,enh){
  return new Promise(function(res){
    try{
      var img=new Image(),u=URL.createObjectURL(f);
      img.onload=function(){
        try{
          var max=enh?1600:1280,sc=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
          var c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*sc);c.height=Math.round(img.naturalHeight*sc);
          var x=c.getContext('2d');if(enh&&'filter' in x)x.filter='grayscale(1) contrast(1.5) brightness(1.1)';x.drawImage(img,0,0,c.width,c.height);
          c.toBlob(function(b){try{URL.revokeObjectURL(u)}catch(e){};if(!b){res(f);return}res(new File([b],'shot.jpg',{type:'image/jpeg'}))},'image/jpeg',0.88);
        }catch(e){res(f)}
      };
      img.onerror=function(){try{URL.revokeObjectURL(u)}catch(e){};res(f)};
      img.src=u;
    }catch(e){res(f)}
  });
}
function aiParse(raw){
  if(!raw)return null;
  var t=String(raw).replace(/```[a-z]*\s*/gi,'').trim();
  var i=t.indexOf('{'),k=t.lastIndexOf('}');
  if(i<0||k<=i)return null;
  var o=null;
  try{o=JSON.parse(t.slice(i,k+1))}catch(e){
    try{o=JSON.parse(t.slice(i,k+1).replace(/,\s*([}\]])/g,'$1').replace(/'/g,'"'))}catch(e2){return null}
  }
  if(!o||typeof o!=='object')return null;
  var c=String(o.code==null?'':o.code).replace(/["'`]/g,'').replace(/\s+/g,' ').trim();
  var m=String(o.message==null?'':o.message).replace(/["'`]/g,'').replace(/\s+/g,' ').trim();
  var cf=String(o.confidence==null?'':o.confidence).toLowerCase();
  var conf=cf.indexOf('high')>=0||cf.indexOf('عالي')>=0?'high':(cf.indexOf('low')>=0||cf.indexOf('منخفض')>=0?'low':'medium');
  if(c.length>40)c=c.slice(0,40);
  if(m.length>200)m=m.slice(0,200);
  var oth=[];if(Array.isArray(o.others))o.others.slice(0,5).forEach(function(x){if(x&&x.code){oth.push({code:String(x.code).replace(/["'`]/g,'').trim().slice(0,40),message:String(x.message||'').replace(/["'`]/g,'').trim().slice(0,200)})}});
  var pn=null;if(o.panel&&Array.isArray(o.panel.fields)&&o.panel.fields.length){pn={lit:String(o.panel.fault_lit||'unclear'),fields:o.panel.fields.slice(0,6).map(function(x){return {pos:String(x.pos||'').slice(0,20),value:String(x.value||'').replace(/[<>"'`]/g,'').slice(0,20)}}).filter(function(x){return x.value})}}
  return {readable:o.readable!==false,code:c,message:m,conf:conf,others:oth,panel:pn};
}
function normCode(x){return String(x||'').toUpperCase().replace(/[^A-Z0-9]/g,'')}
function codeMatch(code){
  var n=normCode(code);if(!n)return null;
  for(var i=0;i<F.length;i++){if(F[i].c&&normCode(F[i].c)===n)return F[i]}
  return null;
}
function codeNear(code){
  var n=normCode(code).replace(/^[A-Z]+/,'');if(n.length<2)return [];
  var out=[];
  for(var i=0;i<F.length&&out.length<2;i++){if(F[i].c&&normCode(F[i].c).replace(/^[A-Z]+/,'')===n)out.push(F[i])}
  return out;
}
function aiConsent(){return Promise.resolve(true)}
var AIW_URL='https://inverter-vision.amr-abdelhamid-engineer.workers.dev/read';
function blobToB64(b){return new Promise(function(ok,no){var r=new FileReader();r.onload=function(){ok(String(r.result).split(',')[1]||'')};r.onerror=function(){no(new Error('read_failed'))};r.readAsDataURL(b)})}
var PPOS={top_left:'أعلى يسار',top_center:'أعلى وسط',top_right:'أعلى يمين',bottom_left:'أسفل يسار',bottom_center:'أسفل وسط',bottom_right:'أسفل يمين'};
function aiPanelChooser(p,bs){
  var lit=p.lit==='yes'?'مؤشر FAULT شكله منوّر':(p.lit==='no'?'مؤشر FAULT شكله مش منوّر':'مش متأكد لو مؤشر FAULT منوّر');
  var h='<div class="card"><b>قريت الأرقام دي من الشاشة (الذكاء الاصطناعي)</b><div class="warn">'+lit+'. مش متأكد أنهي رقم هو كود العطل ومش هخمّن. على لوحات Axpert-style كود العطل غالبًا بيظهر أسفل اليمين لما FAULT منوّر. اختار الرقم اللي إنت شايفه كود عطل، أو تجاهل لو دي قياسات.</div><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">';
  p.fields.forEach(function(x,i){h+='<button type="button" class="btn alt" data-pv="'+i+'"><span dir="ltr">'+esc(x.value)+'</span> <small>('+esc(PPOS[x.pos]||x.pos)+')</small></button>'});
  h+='</div></div>';
  var o=$('out');o.innerHTML=h;$('ocrstat').textContent='';
  Array.prototype.forEach.call(o.querySelectorAll('[data-pv]'),function(b){b.onclick=function(){var v=p.fields[+b.getAttribute('data-pv')].value;$('code').value=v;$('txt').value='';$('go').click()}});
  try{o.scrollIntoView({behavior:'smooth'})}catch(e){}
}
function aiVisionRead(f,enh,retried){
  if(aivBusy||!f)return;
  aivBusy=true;aiWanted=true;$('ocrstat').textContent='🤖 بجهّز الصورة وببعتها لـGemini...';
  var used='';
  shrinkForAI(f,enh).then(function(small){
    return blobToB64(small).then(function(b64){
      var ac=(typeof AbortController!=='undefined')?new AbortController():null;
      var tm=setTimeout(function(){if(ac)ac.abort()},45000);
      return fetch(AIW_URL,{method:'POST',headers:{'Content-Type':'application/json'},signal:ac?ac.signal:undefined,
        body:JSON.stringify({image:b64,mime:small.type||'image/jpeg'})}).then(function(r){clearTimeout(tm);return r},function(e){clearTimeout(tm);var x=new Error((e&&e.name==='AbortError')?'TIMEOUT':'NETFAIL');x.detail=String(e&&e.message||e);throw x});
    }).then(function(res){
      return res.json().catch(function(){return {error:'bad_reply'}}).then(function(j){
        if(!res.ok||j.error){
          var e=new Error(j.error||('HTTP '+res.status));e.detail=j.message||'';throw e;
        }
        used=j.model||'gemini';
        return {message:{content:JSON.stringify({readable:j.readable,code:j.code,message:j.message,confidence:j.confidence,others:j.others,panel:j.panel&&j.panel.fields&&{fault_lit:j.panel.fault_lit,fields:j.panel.fields}})}};
      });
    });
  }).then(function(r){
    var raw=String(r&&r.message&&r.message.content||'').trim();
    aivBusy=false;$('ocrstat').textContent='';
    var j=aiParse(raw);
    if(!j||j.readable===false||(!j.code&&!j.message)){
      if(j&&j.panel&&j.panel.fields.length&&!j.code){aivBusy=false;aiPanelChooser(j.panel,bs);return}
      if(!retried){aivBusy=false;$('ocrstat').textContent='🔁 مش واضحة، بحاول تاني بتحسين التباين...';setTimeout(function(){aiVisionRead(f,true,true)},7000);return}
      $('ocrstat').innerHTML='<b>'+esc(j&&j.readable===false?('ما لقيتش كود عطل واضح على الشاشة (ممكن مفيش عطل ظاهر، أو الرقم مش واضح، أو دي مش شاشة إنفرتر). لو شايف كود اكتبه يدويًا في خانة الكود.'):'مقدرتش أقرا كود واضح في الصورة. جرّب صورة أوضح، أو اكتب الكود يدويًا.')+'</b>';
      return;
    }
    var txt=((j.code||'')+' '+(j.message||'')).replace(/\s+/g,' ').trim();
    (j.others||[]).forEach(function(x){txt+='\n'+(x.code+' '+(x.message||'')).trim()});
    ocrConfirm(txt,bs,'ai',{conf:j.conf,code:j.code,model:used,others:j.others||[]});
  }).catch(function(e){
    aivBusy=false;
    var m=(e&&(e.message||(e.error&&e.error.message)))||'';
    if(m==='rate_limited'||m==='daily_limit'){$('ocrstat').textContent='عدد مرات قراءة الصور وصل الحد المسموح مؤقتًا. استخدم الـOCR العادي أو اكتب الكود يدويًا، وجرّب تاني بعد شوية.';return}
    if(m==='too_large'||m==='bad_image'||m==='bad_type'){$('ocrstat').textContent='الصورة كبيرة أو نوعها مش مدعوم للقراءة بالـAI. جرّب صورة أصغر أو استخدم الـOCR العادي.';return}
    if(m==='not_configured'){$('ocrstat').textContent='خدمة قراءة الصور لسه مش متظبطة على السيرفر. استخدم الـOCR العادي أو اكتب الكود يدويًا.';return}
    if(m==='NETFAIL'){$('ocrstat').textContent='مش قادر أوصل لسيرفر قراءة الصور (الشبكة ممكن تكون بتحجبه أو النت ضعيف). جرّب واي فاي أو داتا تانية، أو استخدم الـOCR العادي أو اكتب الكود يدويًا. (تفصيل: '+((e&&e.detail)||'')+')';return}
    if(m==='bad_reply'||/^HTTP /.test(m)||/^upstream_/.test(m)||m==='unparsable_reply'||m==='empty_reply'){$('ocrstat').textContent='خدمة Gemini ردّت برد مش مفهوم أو مشغولة ('+m+'). جرّب تاني بعد شوية، أو استخدم الـOCR العادي أو اكتب الكود يدويًا.';return}
    if(m==='TIMEOUT'){$('ocrstat').textContent='القراءة بالـAI خدت وقت طويل (أكتر من 30 ثانية) ووقفت. جرّب تاني، أو استخدم الـOCR العادي، أو اكتب الكود يدويًا.';return}
    $('ocrstat').textContent='القراءة بالـAI مش متاحة دلوقتي ('+(m||'خطأ في الاتصال')+'). جرّب الـOCR العادي أو اكتب الكود يدويًا.';
  });
}
async function handleFile(f){
  if(!f)return;
  var ok=/^image\/(jpeg|png|webp|gif|bmp)$/.test(f.type||'');
  if(!ok){$('ocrstat').textContent='نوع الملف مش مدعوم. اختار صورة JPG أو PNG أو WebP.';return}
  if(f.size>15*1024*1024){$('ocrstat').textContent='الصورة كبيرة قوي (أكتر من 15 ميجا). صغّرها أو صوّر تاني.';return}
  window.__busy=true;
  var url=URL.createObjectURL(f),img=$('prev');img.src=url;img.hidden=false;
  lastImg=f;aiWanted=false;aivBusy=false;var myTok=++ocrSeq;var ab=$('aiv');if(ab)ab.hidden=false;
  if(aiAuto){aiAuto=false;aiWanted=true;aiConsent().then(function(ok){if(ok)aiVisionRead(f);else{aiWanted=false;$('ocrstat').textContent='اتلغت قراءة الـAI. استخدم الـOCR العادي أو اكتب الكود يدويًا.'}})}
  var loaded=await new Promise(function(r){img.onload=function(){r(true)};img.onerror=function(){r(false)}});
  if(!loaded){window.__busy=false;img.hidden=true;try{URL.revokeObjectURL(url)}catch(e){}$('ocrstat').textContent='الصورة دي تالفة أو مش بتتفتح. جرّب صورة تانية.';return}
  $('ocrstat').textContent='بقرا الصورة... (أول مرة بتاخد ثواني)';
  try{
    var w=await getWorker(),txt='',best=null;
    for(var k=0;k<2;k++){
      var r=await w.recognize(prep(img,k==1));txt=r.data.text;
      var d=diagnose(txt,bs.value,'');
      if(!best||d.res.length>best.d.res.length) best={d:d,t:txt};
      if(d.res.length) break;
    }
    if(aiWanted||myTok!==ocrSeq)return;
    if(!best||!String(best.t||'').trim()){$('ocrstat').textContent='مقدرتش أقرا أي نص في الصورة. صوّر الشاشة أوضح (قريبة، بدون انعكاس)، أو اكتب الكود يدويًا.';return}
    $('ocrstat').textContent='خلص.';
    ocrConfirm(best.t,bs);
  }catch(e){if(!aiWanted&&myTok===ocrSeq)$('ocrstat').textContent='فشل الـ OCR: '+(e&&e.message||e)+'\nاكتب الكود يدويًا.'}
}
var aiAuto=false;
var aivb=$('aiv');if(aivb)aivb.onclick=function(){if(!lastImg){aiAuto=true;$('ocrstat').textContent='اختار أو صوّر الصورة، وهقراها بالذكاء الاصطناعي على طول...';$('shot').click();return}aiConsent().then(function(ok){if(ok)aiVisionRead(lastImg)})};
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

try{(function(){var z=$('fsz');if(z){var fs=0;try{fs=+localStorage.getItem('invfs')||0}catch(e){}function afs(){document.body.className=document.body.className.replace(/\bfs[12]\b/g,'').trim();if(fs)document.body.classList.add('fs'+fs);z.setAttribute('data-s',fs);z.setAttribute('aria-label','حجم الخط: '+['عادي','كبير','كبير جدًا'][fs])}afs();z.onclick=function(){fs=(fs+1)%3;try{localStorage.setItem('invfs',fs)}catch(e){}afs();toast(['الخط عادي','الخط كبير','الخط كبير جدًا'][fs])}}})()}catch(e){}
try{(function(){var t=$('theme');function ap(){var d=document.documentElement.getAttribute('data-theme')==='dark';t.textContent=d?'☀️':'🌙'}ap();t.onclick=function(){var d=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',d);try{localStorage.setItem('invtheme',d)}catch(e){}ap()};$('sn1').textContent=F.length;$('sn2').textContent=Object.keys(SRC).length})()}catch(e){}

function toast(t){var e=$('toast');if(!e){e=document.createElement('div');e.id='toast';document.body.appendChild(e)}e.textContent=t;e.className='show';clearTimeout(toast._t);toast._t=setTimeout(function(){e.className=''},1800)}
var CMP=[];
function showCmp(){var old=document.getElementById('cmpov');if(old)old.remove();var fs=CMP.map(function(k){return F.filter(function(f){return fkey(f)===k})[0]}).filter(Boolean);if(fs.length<2)return;var o=document.createElement('div');o.id='cmpov';o.className='cmpov';var h='<div class="cmpbar"><b>⚖️ مقارنة عطلين</b><button type="button" class="cmpx">✕ إغلاق</button></div><div class="cmpcols">';fs.forEach(function(f){h+='<div class="cmpcol">'+card(f).replace(/<button class="cmpbtn"[^>]*>[^<]*<\/button>/,'')+'</div>'});o.innerHTML=h+'</div>';document.body.appendChild(o);bindCards(o);o.querySelector('.cmpx').onclick=function(){o.remove();CMP=[];refreshCmp()}}
function refreshCmp(){Array.prototype.forEach.call(document.querySelectorAll('.cmpbtn'),function(x){var on=CMP.indexOf(x.getAttribute('data-fk'))>=0;x.className='cmpbtn'+(on?' on':'');x.textContent=on?'✓ مختار للمقارنة':'⚖️ قارن'})}
function bindCards(root){
  Array.prototype.forEach.call(root.querySelectorAll('.cmpbtn'),function(b){b.onclick=function(){var k=b.getAttribute('data-fk'),i=CMP.indexOf(k);if(i>=0)CMP.splice(i,1);else{CMP.push(k);if(CMP.length>2)CMP.shift()}refreshCmp();if(CMP.length===2)showCmp();else toast(i>=0?'اتشال من المقارنة':'اختار عطل تاني للمقارنة')}});
  Array.prototype.forEach.call(root.querySelectorAll('.linkbtn'),function(b){b.onclick=function(){var u=location.href.split('#')[0]+'#f='+encodeURIComponent(b.getAttribute('data-fk'));if(navigator.clipboard){navigator.clipboard.writeText(u).then(function(){toast('اتنسخ لينك الكارت ✅')},function(){toast(u)})}else toast(u)}});
  Array.prototype.forEach.call(root.querySelectorAll('.printbtn'),function(b){b.onclick=function(){var c=b.closest('.res');document.body.classList.add('printone');Array.prototype.forEach.call(document.querySelectorAll('.res.pr'),function(x){x.classList.remove('pr')});c.classList.add('pr');setTimeout(function(){window.print()},50)}});
  Array.prototype.forEach.call(root.querySelectorAll('.fav'),function(b){b.onclick=function(){var k=b.getAttribute('data-fk'),a=favs(),i=a.indexOf(k);if(i>=0)a.splice(i,1);else a.unshift(k);try{localStorage.setItem('invfav',JSON.stringify(a.slice(0,30)))}catch(e){}renderFavs();Array.prototype.forEach.call(document.querySelectorAll('.fav'),function(x){if(x.getAttribute('data-fk')===k){var on=a.indexOf(k)>=0;x.className='fav'+(on?' on':'');x.textContent=on?'★':'☆'}});toast(i>=0?'اتشالت من المفضلة':'اتحفظت في المفضلة ⭐')}});
  Array.prototype.forEach.call(root.querySelectorAll('.sharebtn2'),function(b){b.onclick=function(){var t=b.getAttribute('data-sh');if(navigator.share){navigator.share({text:t}).catch(function(){})}else if(navigator.clipboard){navigator.clipboard.writeText(t).then(function(){toast('اتنسخ ✅')},function(){toast('النسخ مش متاح')})}else toast('المشاركة مش متاحة في المتصفح ده')}});
}
function renderFavs(){var a=favs(),sec=$('favsec'),box=$('favs');var items=a.map(function(k){return F.filter(function(f){return fkey(f)===k})[0]}).filter(Boolean);sec.hidden=false;var h2=sec.querySelector('h2');if(h2)h2.textContent='⭐ المفضلة'+(items.length?' ('+items.length+')':'');box.innerHTML=items.length?items.map(function(f){return card(f,'')}).join('')+'<button type="button" class="btn alt" id="favclr">🗑️ مسح كل المفضلة</button>':'<div class="none">لسه مفيش حاجة في المفضلة.<br>دوس على ☆ في أي كارت عشان تحفظه هنا وتفتحه بعدين من غير إنترنت.</div>';bindCards(box)}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#favclr');if(!b)return;if(!b.getAttribute('data-c')){b.setAttribute('data-c','1');b.textContent='متأكد؟ دوس تاني للمسح';setTimeout(function(){b.removeAttribute('data-c');b.textContent='🗑️ مسح كل المفضلة'},3000);return}try{localStorage.setItem('invfav','[]')}catch(x){}renderFavs();toast('اتمسحت المفضلة')});
renderFavs();
// chips
(function(){var nav=$('chips');if(!nav)return;var h='<button type="button" class="chipb on" data-b="">كل الشركات</button>';Object.keys(SRC).forEach(function(k){h+='<button type="button" class="chipb" data-b="'+k+'"><span class="bmark sm" style="'+bstyle(k)+'">'+esc(mono(k))+'</span>'+esc(SRC[k].name.split(' (')[0])+'</button>'});nav.innerHTML=h;
 nav.onclick=function(e){var b=e.target.closest('.chipb');if(!b)return;var v=b.getAttribute('data-b');bs.value=v;$('fbrand').value=v;renderList($('filter').value);Array.prototype.forEach.call(nav.children,function(x){x.className='chipb'+(x===b?' on':'')});b.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'});if($('hq').value.trim())$('hform').requestSubmit?$('hform').requestSubmit():$('go').click()}})();
$('hform').onsubmit=function(e){e.preventDefault();var q=$('hq').value.trim();if(!q)return;if(/^[A-Za-z0-9\-\.\/]{1,14}$/.test(q)){$('code').value=q;$('txt').value=''}else{$('txt').value=q;$('code').value=''}$('go').click()};
$('qcam').onclick=function(){$('live').click();$('live').scrollIntoView({behavior:'smooth',block:'center'})};
$('qupl').onclick=function(){$('cam').click()};

// ===== chat (database only) + optional AI explain =====
var ARM=ARSYN;
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
  var allowed=ar2en(('' +' '+hits.map(function(f){return [SRC[f.b].name,f.c,f.n,f.s.join(' ')].join(' ')}).join(' ')+' '+hits.map(function(f){return SRC[f.b].url}).join(' ')).toLowerCase());
  var bad=[];
  (ar2en(reply).match(ALLOWNUM)||[]).forEach(function(t){t=t.toLowerCase().replace(/^[\-\.\/_]+|[\-\.\/_]+$/g,'');if(t&&allowed.indexOf(t)<0&&bad.indexOf(t)<0)bad.push(t)});
  var urls=(reply.match(/https?:\/\/\S+|www\.\S+/gi)||[]).filter(function(u){return allowed.indexOf(u.toLowerCase().replace(/[).,،]+$/,''))<0});
  urls.forEach(function(u){bad.push(u)});
  if(/افتح\s*(ال)?(جهاز|انفرتر|إنفرتر|الغطاء)|فك\s|افصل\s*(ال)?(كابل|كابلات|سلك|اسلاك|أسلاك)|(لا)?مس\s*(ال)?(كابل|سلك|اسلاك|أسلاك)|open the (inverter|cover)|unplug|disconnect the/i.test(reply))bad.push('تعليمات غير آمنة');
  if(reply.length>1500)bad.push('رد طويل');
  return {ok:!bad.length,bad:bad};
}
var AIC_URL=AIW_URL.replace(/\/read$/,'/chat');
function aiChatCall(system,messages){
  var ac=(typeof AbortController!=='undefined')?new AbortController():null;
  var tm=setTimeout(function(){if(ac)ac.abort()},45000);
  return fetch(AIC_URL,{method:'POST',headers:{'Content-Type':'application/json'},signal:ac?ac.signal:undefined,body:JSON.stringify({system:system,messages:messages})})
  .then(function(r){clearTimeout(tm);return r.json().catch(function(){return {error:'bad_reply'}}).then(function(j){if(!r.ok||j.error){var e=new Error(j.error||('HTTP '+r.status));throw e}return j.text||''})},
  function(e){clearTimeout(tm);throw new Error((e&&e.name==='AbortError')?'TIMEOUT':'NETFAIL')});
}
function aiErrText(e){var m=(e&&e.message)||'';
  if(m==='NETFAIL')return 'مش قادر أوصل لسيرفر الذكاء الاصطناعي (النت ضعيف أو الشبكة بتحجبه).';
  if(m==='TIMEOUT')return 'الرد اتأخر أكتر من 45 ثانية ووقف.';
  if(m==='daily_limit'||m==='rate_limited')return 'وصلت للحد المسموح مؤقتًا. جرّب بعد شوية.';
  return 'خدمة Gemini مشغولة أو ردّت برد مش مفهوم ('+(m||'خطأ')+').'}
async function aiExplain(box,q,hits){
  var out=box.querySelector('.aiout'),btn=box.querySelector('.aibtn');
  if(!out.dataset.agreed){var okc=await aiConsent();if(!okc)return}
  out.dataset.agreed='1';btn.disabled=true;out.className='aiout wait';out.textContent='بجهّز الشرح...';
  var data=hits.map(function(f){return {brand:SRC[f.b].name,code:f.c,name:f.n,steps_from_official_manual:f.s,source:SRC[f.b].doc}});
  var prompt='You explain inverter faults to a non-expert in simple Egyptian Arabic, in at most 120 words.\nRules: use ONLY the DATA below. Never add any fault code, number, setting, step, brand or link that is not in DATA. If DATA does not answer the question, say so. Never tell the user to open the inverter or touch wiring or DC cables; repairs are for a qualified technician. Do not give a diagnosis beyond DATA.\nDATA: '+JSON.stringify(data)+'\nUSER QUESTION: '+q;
  try{
    var t=(await aiChatCall('',[{role:'user',content:prompt}])).trim(),chk=aiCheck(t,hits,q);
    if(!t){throw new Error('empty')}
    if(!chk.ok){out.className='aiout bad';out.textContent='الرد اتلغى لأنه فيه أرقام أو أكواد مش موجودة في الكروت الرسمية ('+chk.bad.slice(0,4).join('، ')+'). الكروت الرسمية اللي فوق هي المرجع.';}
    else{out.className='aiout ok';out.innerHTML='<div class="aitag">شرح بالذكاء الاصطناعي (مش من دليل الشركة) راجع الكروت اللي فوق</div><div class="aitxt"></div>';out.querySelector('.aitxt').textContent=t}
  }catch(e){
    out.className='aiout bad';
    out.textContent='الشرح بالذكاء الاصطناعي مش متاح دلوقتي. '+aiErrText(e)+' الكروت الرسمية اللي فوق هي المرجع.';
  }
  btn.disabled=false;
}
$('cform').onsubmit=function(e){e.preventDefault();var v=$('cq').value;$('cq').value='';chatAsk(v)};
Array.prototype.forEach.call(document.querySelectorAll('#sugg .chip'),function(b){b.onclick=function(){chatAsk(b.getAttribute('data-q'))}});

// ===== conversational AI assistant (Gemini via Worker) =====
var aiHist=[];var aiLastHits=[];var aiBusy=false;
var SAFE_BAD=/افتح\s*(ال)?(جهاز|انفرتر|إنفرتر|الغطاء)|فك\s|افصل\s*(ال)?(كابل|كابلات|سلك|اسلاك|أسلاك)|(لا)?مس\s*(ال)?(كابل|سلك|اسلاك|أسلاك)|تخطى|تجاوز\s*(ال)?(حماية|فيوز)|شغل\s*(ال)?(جهاز)?\s*بدون|open the (inverter|cover|case)|unplug|disconnect the|bypass|jumper|short[- ]?circuit the/i;
function aiSplit(t){
  var o='',u='',cur=null;
  t.split('\n').forEach(function(line){
    var m=line.match(/^\s*[\*#\-\s]*(الرسمي|رسمي|غير رسمي|غير الرسمي|OFFICIAL|UNOFFICIAL)\s*[:：]\s*(.*)$/i);
    if(m){cur=/^(غير|UNOFF)/i.test(m[1])?'u':'o';if(cur==='u')u+=m[2]+'\n';else o+=m[2]+'\n'}
    else if(cur==='o')o+=line+'\n';else if(cur==='u')u+=line+'\n';else u+=line+'\n';
  });
  return {o:o.trim(),u:u.trim()};
}
function aiAllowed(hits,extra){return ar2en((extra+' '+hits.map(function(f){return [SRC[f.b].name,f.c,f.n,f.s.join(' ')].join(' ')}).join(' ')+' '+hits.map(function(f){return SRC[f.b].url}).join(' ')).toLowerCase())}
function aiCheck2(reply,hits,q,hist){
  var sp=aiSplit(reply),bad=[];
  var allowedO=aiAllowed(hits,'');
  var allowedAll=aiAllowed(hits,q+' '+(hist||[]).filter(function(m){return m.role==='user'}).map(function(m){return m.content}).join(' '));
  var norm_o=ar2en(sp.o);
  (norm_o.match(ALLOWNUM)||[]).forEach(function(t){t=t.toLowerCase().replace(/^[\-\.\/_]+|[\-\.\/_]+$/g,'');if(t&&allowedO.indexOf(t)<0&&bad.indexOf(t)<0)bad.push(t)});
  var un=ar2en(sp.u);
  // unofficial: no fault-code-like tokens, no specific values with units, unless present in cards/question
  (un.match(/\b[A-Za-z]{1,3}[\-_ ]?\d{1,4}[A-Za-z]?\b|\b\d{3,}\b|\b\d+(?:\.\d+)?\s?(?:(?:v|vdc|vac|a|ma|w|kw|hz|ohm|k ohm|°c|c|%)(?![A-Za-z])|فولت|أمبير|امبير|واط|هرتز|درجة|اوم|أوم)/gi)||[]).forEach(function(t){var k=t.toLowerCase().trim();if(allowedAll.indexOf(k)<0&&bad.indexOf(k)<0)bad.push(k)});
  (reply.match(/https?:\/\/\S+|www\.\S+/gi)||[]).forEach(function(u){if(allowedAll.indexOf(u.toLowerCase().replace(/[).,،]+$/,''))<0)bad.push(u)});
  if(SAFE_BAD.test(reply))bad.push('تعليمات غير آمنة');
  if(reply.length>2500)bad.push('رد طويل');
  return {ok:!bad.length,bad:bad,parts:sp};
}
function aiAdd(cls,html){var c=$('aichat'),e=document.createElement('div');e.className='cmsg '+cls;e.innerHTML=html;c.appendChild(e);e.scrollIntoView({block:'nearest',behavior:'smooth'});return e}
async function aiAsk(q){
  q=q.trim();if(!q||aiBusy)return;
  if(!(await aiConsent()))return;
  aiBusy=true;$('asend').disabled=true;
  aiAdd('me','<div class="bub"></div>').firstChild.textContent=q;
  var hits=chatSearch(q);var carry=false;if(!hits.length&&aiLastHits.length){hits=aiLastHits;carry=true}else if(hits.length)aiLastHits=hits;
  var wait=aiAdd('bot','<div class="bub aiwait">بفكّر...</div>');
  var data=hits.map(function(f){return {brand:SRC[f.b].name,code:f.c,name:f.n,steps_from_official_manual:f.s,source:SRC[f.b].doc}});
  var sys='You are an inverter and solar-system assistant answering in simple Egyptian Arabic (Latin letters allowed for technical terms). Answer any question about inverters, solar systems and batteries.\nOUTPUT FORMAT (strict): write one or two sections, each starting a new line with its label.\n"الرسمي:" = facts taken ONLY from the OFFICIAL DATA below (fault code, name, manual steps). Omit this section if DATA is empty or irrelevant.\n"غير رسمي:" = general knowledge from outside the DATA. Keep it general. Always end it with: تأكد من دليل المصنّع.\nHARD RULES: Never invent or guess a fault code, error number, parameter, setting value, voltage, current or threshold that is not in DATA. If you do not know, say you do not know and tell the user to check the manufacturer manual or call a qualified technician. Never recommend opening the inverter, touching or disconnecting DC/AC cables, bypassing protections or changing grid settings: say that only a qualified technician may do it. Keep it under 150 words.\nOFFICIAL DATA (may be empty): '+JSON.stringify(data);
  var msgs=[{role:'system',content:sys}].concat(aiHist.slice(-6)).concat([{role:'user',content:q}]);
  try{
    var t=(await aiChatCall(msgs[0].content,msgs.slice(1))).trim();if(!t)throw new Error('empty');
    var chk=aiCheck2(t,hits,q,aiHist);
    var cardsHtml=hits.length?'<details class="aicards"><summary>الكروت الرسمية المرجعية ('+hits.length+')'+(carry?' (من السؤال اللي قبله)':'')+'</summary>'+hits.map(function(f){return card(f,'')}).join('')+'</details>':'<div class="muted">مفيش كروت رسمية مطابقة للسؤال ده، فالرد كله غير رسمي.</div>';
    var h2='';
    if(!chk.ok){h2='<div class="bub aibad">الرد اتلغى عشان فيه حاجة مش مضمونة ('+esc(chk.bad.slice(0,4).join('، '))+'). مش هعرضه عشان ماتعتمدش على معلومة ممكن تكون مألّفة. الكروت الرسمية تحت هي المرجع، أو اسأل بصيغة تانية.</div>'}
    else{var p=chk.parts;h2='<div class="bub aiok">'+(p.o?'<div class="aio"><div class="aitag g">✅ من الكروت الرسمية</div><div class="aitxt" data-t="o"></div></div>':'')+(p.u?'<div class="aiu"><div class="aitag a">⚠️ غير رسمي، تأكد من دليل المصنّع</div><div class="aitxt" data-t="u"></div></div>':'')+'</div>';aiHist.push({role:'user',content:q},{role:'assistant',content:t});if(aiHist.length>12)aiHist=aiHist.slice(-12)}
    wait.innerHTML=h2+cardsHtml;
    if(chk.ok){var p2=chk.parts;var eo=wait.querySelector('[data-t=o]'),eu=wait.querySelector('[data-t=u]');if(eo)eo.textContent=p2.o;if(eu)eu.textContent=p2.u}
    bindCards(wait);
  }catch(e){
    wait.innerHTML='<div class="bub aibad">المساعد الذكي مش متاح دلوقتي. '+esc(aiErrText(e))+' استخدم الشات الرسمي اللي فوق.</div>';
  }
  aiBusy=false;$('asend').disabled=false;
}
$('aform').onsubmit=function(e){e.preventDefault();var v=$('aq').value;$('aq').value='';aiAsk(v)};
Array.prototype.forEach.call(document.querySelectorAll('#asugg .chip'),function(b){b.onclick=function(){aiAsk(b.getAttribute('data-q'))}});
window.__aiCheck2=aiCheck2;window.__aiAsk=aiAsk;
window.__aiCheck=aiCheck;window.__chatSearch=chatSearch;
window.__diagnose=diagnose;

try{(function(){
var w=document.querySelector('.warn');
if(w&&!w.querySelector('.wtxt')){var t=document.createElement('div');t.className='wtxt';t.innerHTML=w.innerHTML;w.innerHTML='';w.appendChild(t);var b=document.createElement('button');b.type='button';b.className='wtog';b.textContent='اقرأ باقي التحذير ▾';w.appendChild(b);w.classList.add('wc');b.onclick=function(){var c=w.classList.toggle('wc');b.textContent=c?'اقرأ باقي التحذير ▾':'إخفاء ▴'}}
var cs=$('cats'),seen=false;try{seen=localStorage.getItem('onb2')}catch(e){}
if(cs&&!seen){var o=document.createElement('section');o.id='onb';o.className='onb';o.setAttribute('data-tab','home');o.innerHTML='<button type="button" class="ox" aria-label="إغلاق">✕</button><b>ابدأ في 3 خطوات 👋</b><div class="osteps"><div><i>1</i><span>اكتب الكود أو نص العطل فوق</span></div><div><i>2</i><span>أو صوّر شاشة الإنفرتر من تاب "صوّر"</span></div><div><i>3</i><span>اقرأ الكارت: الخطورة + الخطوات من دليل الشركة</span></div></div>';cs.parentNode.insertBefore(o,cs);o.querySelector('.ox').onclick=function(){o.remove();try{localStorage.setItem('onb2','1')}catch(e){}}}
})()}catch(e){}

try{(function(){
var dp=null,bi=$('qinst'),st=window.matchMedia&&matchMedia('(display-mode: standalone)').matches||navigator.standalone;
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();dp=e;if(bi&&!st)bi.hidden=false});
if(bi)bi.onclick=function(){if(!dp)return;dp.prompt();dp.userChoice.then(function(){dp=null;bi.hidden=true}).catch(function(){})};
window.addEventListener('appinstalled',function(){if(bi)bi.hidden=true;toast('اتثبّت ✅')});
var ios=/iphone|ipad|ipod/i.test(navigator.userAgent)&&!st;if(ios&&$('iosHint'))$('iosHint').hidden=false;
function off(){var b=$('offbar');if(b)b.hidden=navigator.onLine!==false}
window.addEventListener('online',off);window.addEventListener('offline',off);off();
function ost(){var f=document.querySelector('footer');if(!f)return;var e=$('offst');if(!e){e=document.createElement('p');e.id='offst';e.className='offst';f.insertBefore(e,f.firstChild)}
 var on=navigator.onLine!==false,txt;
 if(!('serviceWorker' in navigator)||!window.caches){e.textContent='⚪ الشغل بدون نت مش مدعوم في المتصفح ده';return}
 caches.keys().then(function(ks){var k=ks.filter(function(x){return x.indexOf('inv-')===0})[0];if(!k){e.textContent=(on?'🟡 متصل — ':'🔴 بدون نت — ')+'التخزين للأوفلاين لسه ماجهزش، افتح التطبيق مرة تانية وانت متصل';return}
  caches.open(k).then(function(c){return c.keys()}).then(function(r){e.textContent=(on?'🟢 متصل — ':'🟠 بدون نت — ')+'الأوفلاين جاهز: '+r.length+' ملف متخزّن ('+k+')'})}).catch(function(){})}
window.addEventListener('online',ost);window.addEventListener('offline',ost);setTimeout(ost,2500);
})()}catch(e){}

try{(function(){
function renderDash(){
  var box=$('dash');if(!box)return;
  var cnt={};F.forEach(function(f){cnt[f.b]=(cnt[f.b]||0)+1});
  var arr=Object.keys(cnt).map(function(k){return [k,cnt[k]]}).sort(function(a,b){return b[1]-a[1]}).slice(0,6);
  var mx=arr.length?arr[0][1]:1;
  var cats={};F.forEach(function(f){cats[f.k]=(cats[f.k]||0)+1});
  var nc=Object.keys(cats).length;
  var h='<h2>📊 لوحة القاعدة</h2><div class="sub">أرقام حقيقية من القاعدة المحمّلة على جهازك: '+F.length+' عطل، '+Object.keys(SRC).length+' شركة، '+nc+' نوع عطل.</div><div class="sub">أكتر 6 شركات من حيث عدد الكروت (دوس للتصفح):</div>';
  h+=arr.map(function(x){return '<button type="button" class="bar" data-b="'+esc(x[0])+'"><span class="n">'+esc(SRC[x[0]].name.split(' ')[0])+'</span><i style="width:'+Math.max(4,Math.round(x[1]/mx*100))+'%"></i><b>'+x[1]+'</b></button>'}).join('');
  var hist=[];try{hist=JSON.parse(localStorage.getItem('invhist')||'[]')}catch(e){}
  if(hist.length)h+='<div class="sub" style="margin-top:8px">آخر بحث عندك: '+esc(String(hist[0]&&(hist[0].c||hist[0].t)||'').slice(0,40))+' (المحفوظ في سجل البحث: '+hist.length+')</div>';
  h+='<button type="button" class="q" id="anbtn" style="margin-top:8px">📈 تحليلات بحثك</button><div id="anbox" hidden></div>';
  box.innerHTML=h;
}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#dash .bar');if(!b)return;var fb=$('fbrand');if(!fb)return;fb.value=b.getAttribute('data-b');$('fcat').value='';$('filter').value='';renderList('');setTab('browse')});
function top(o,n){return Object.keys(o).map(function(k){return [k,o[k]]}).sort(function(a,b){return b[1]-a[1]}).slice(0,n)}
function barsH(a,lab){var mx=a.length?a[0][1]:1;return a.map(function(x){return '<div class="bar"><span class="n">'+esc(lab?lab(x[0]):x[0])+'</span><i style="width:'+Math.max(4,Math.round(x[1]/mx*100))+'%"></i><b>'+x[1]+'</b></div>'}).join('')}
function renderAn(){var bx=$('anbox');if(!bx)return;var lg=[];try{lg=JSON.parse(localStorage.getItem('invlog')||'[]')}catch(e){}
  var h='<div class="sub">كل الأرقام دي من بحثك على جهازك بس (بتتخزّن محليًا، ومبتتبعتش لأي مكان). آخر '+lg.length+' بحث متسجّل (الحد 500).</div>';
  if(!lg.length){bx.innerHTML=h+'<div class="sub">لسه مفيش بحث متسجّل. ابحث عن كود وارجع هنا.</div>';return}
  var codes={},br={},days={},dn=[];lg.forEach(function(x){if(x.c)codes[x.c.toUpperCase()]=(codes[x.c.toUpperCase()]||0)+1;if(x.b)br[x.b]=(br[x.b]||0)+1;var d=new Date(x.ts).toISOString().slice(0,10);days[d]=(days[d]||0)+1});
  for(var i=6;i>=0;i--){var dd=new Date(Date.now()-i*864e5).toISOString().slice(0,10);dn.push([dd.slice(5),days[dd]||0])}
  var mxd=Math.max.apply(null,dn.map(function(x){return x[1]}))||1;
  h+='<h3>أكتر أكواد بحثت عنها</h3>'+(Object.keys(codes).length?barsH(top(codes,5)):'<div class="sub">مفيش أكواد، بحثك كان بنص.</div>');
  h+='<h3>أكتر شركات</h3>'+(Object.keys(br).length?barsH(top(br,5),function(k){return SRC[k]?SRC[k].name.split(' ')[0]:k}):'<div class="sub">مفيش شركة محدّدة في بحثك.</div>');
  h+='<h3>النشاط آخر 7 أيام (UTC)</h3>'+dn.map(function(x){return '<div class="bar"><span class="n">'+x[0]+'</span><i style="width:'+Math.max(x[1]?4:0,Math.round(x[1]/mxd*100))+'%"></i><b>'+x[1]+'</b></div>'}).join('');
  var cats={};F.forEach(function(f){cats[f.k]=(cats[f.k]||0)+1});
  h+='<h3>توزيع أنواع الأعطال في القاعدة ('+F.length+')</h3>'+barsH(top(cats,12),function(k){return CATS[k]||CATS.other});
  h+='<button type="button" class="q" id="anclr">🗑️ امسح سجل التحليلات</button>';
  bx.innerHTML=h}
document.addEventListener('click',function(e){var t=e.target;if(!t.closest)return;if(t.closest('#anbtn')){var bx=$('anbox');bx.hidden=!bx.hidden;if(!bx.hidden)renderAn()}else if(t.closest('#anclr')){try{localStorage.removeItem('invlog')}catch(x){}renderAn()}});
try{renderDash()}catch(e){}

(function(){
var D={"مشخّص أعطال الإنفرتر": "Inverter Fault Finder", "من أدلة الشركات الرسمية، بدون تخمين": "From official manufacturer manuals, no guessing", "إنفرترك وقف؟": "Inverter stopped?", "اكتب الكود أو صوّر الشاشة": "Type the code or photograph the screen", "📷 صوّر الشاشة": "📷 Photograph screen", "🖼️ صورة من الجهاز": "🖼️ Photo from device", "📲 ثبّت التطبيق على موبايلك": "📲 Install the app on your phone", "عطل": "faults", "شركة": "brands", "رسمي": "official", "من أدلة الشركات": "from manufacturer manuals", "للاسترشاد فقط — مش تعليمات صيانة.": "For guidance only, not maintenance instructions.", "📷 صوّر شاشة الإنفرتر": "📷 Photograph the inverter screen", "💡 إزاي تصوّر صح": "💡 How to photograph correctly", "قرّب من الشاشة لحد ما الكود يملى الصورة.": "Move close until the code fills the photo.", "اثبت إيدك ثانيتين، وابعد عن انعكاس الإضاءة.": "Hold still for two seconds and avoid light reflections.", "صوّر الكود والرسالة مع بعض لو ظاهرين.": "Capture the code and the message together if both show.", "القراءة بتحتاج إنترنت. لو فشلت اكتب الكود يدويًا في تاب \"اسأل\".": "Reading needs internet. If it fails, type the code in the Ask tab.", "صوّر من بعيد آمن — ماتفتحش الإنفرتر ولا تقرّب من أي موصلات.": "Photograph from a safe distance. Never open the inverter or go near any connectors.", "📷 افتح الكاميرا وصوّر": "📷 Open camera and shoot", "📱 صوّر بكاميرا الموبايل": "📱 Use phone camera", "🖼️ اختار صورة من الجهاز": "🖼️ Choose a photo", "📸 التقط": "📸 Capture", "إلغاء": "Cancel", "🔎 بحث متقدم": "🔎 Advanced search", "الشركة (اختياري)": "Brand (optional)", "🔍 شخّص": "🔍 Diagnose", "⭐ المفضلة": "⭐ Favourites", "💬 رسمي": "💬 Official", "🤖 ذكاء اصطناعي": "🤖 AI", "💬 اسأل التطبيق": "💬 Ask the app", "بيجاوب من قاعدة أدلة الشركات بس. مفيش كود بيتألّف.": "Answers only from the manufacturer manual database. No invented codes.", "عزل وتسرب أرضي": "Insulation / earth leakage", "جهد الشبكة عالي": "High grid voltage", "حرارة عالية": "High temperature", "البطارية": "Battery", "إرسال": "Send", "🤖 مساعد ذكي (تجريبي)": "🤖 AI assistant (experimental)", "📚 تصفح كل الأعطال": "📚 Browse all faults", "كل الشركات": "All brands", "كل الأنواع": "All types", "الترتيب: زي القاعدة": "Order: database order", "الترتيب: الأخطر أولاً (تقدير تقريبي)": "Order: most severe first (approximate)", "الرئيسية": "Home", "صوّر": "Scan", "اسأل": "Ask", "تصفح": "Browse", "مفضلة": "Saved", "📊 لوحة القاعدة": "📊 Database dashboard", "اختار نوع العطل": "Pick the fault type", "🗑️ مسح كل المفضلة": "🗑️ Clear all favourites"},A={"حجم الخط": "Font size", "الوضع الليلي": "Night mode", "مثلاً: 039 أو E36 أو Grid Overvoltage": "e.g. 039 or E36 or Grid Overvoltage", "ابحث عن عطل": "Search a fault", "ابحث": "Search", "الشركات": "Brands", "أنواع الأعطال": "Fault types", "لوحة الإحصائيات": "Statistics dashboard", "الكود مثلاً 039 أو 2062": "Code, e.g. 039 or 2062", "أو الصق/اكتب نص الخطأ زي: Grid Overvoltage، PV Isolation Low": "Or paste/type the error text, e.g. Grid Overvoltage, PV Isolation Low", "اكتب سؤالك أو الكود، مثلاً: E36 كاكو": "Type your question or code, e.g. E36 Kaco", "سؤالك": "Your question", "اسأل أي سؤال عن الإنفرتر...": "Ask anything about inverters...", "سؤالك للمساعد الذكي": "Your question for the AI assistant", "ترتيب": "Sort", "ابحث في القاعدة (كود أو اسم)": "Search the database (code or name)", "التنقل": "Navigation"},P={"الإنفرتر فيه جهد عالي": "The inverter carries deadly high voltage. Never open the inverter, and never disconnect connectors or cables or work on live electrical equipment. A DC arc forms under load. Only photograph the display from outside, and only if that is safe. Confirm your exact model before relying on any result. Any fault must be handled by a qualified technician only. See the SMA manual:", "بيرد على أي سؤال": "Answers any inverter question with AI (Gemini). The official part comes from the cards only, and any general information is labelled \"unofficial\". Questions are sent to Google Gemini through a relay server.", "دوس على ☆ في أي كارت": "Tap ☆ on any fault card to save it here on your device.", "لسه مفيش مفضلة": "No favourites yet", "📴 أنت أوفلاين": "📴 You are offline. The app is running from the saved copy.", "📲 على الآيفون": "📲 On iPhone: tap Share in Safari, then \"Add to Home Screen\"."},ORG=new WeakMap(),AORG=new WeakMap(),on=false;
function tr(n){var raw=n.nodeValue,t=raw.trim();if(!t||!/[\u0600-\u06FF]/.test(t))return;var e=D[t];if(!e)for(var k in P){if(t.indexOf(k)===0){e=P[k];break}}if(e){if(!ORG.has(n))ORG.set(n,raw);n.nodeValue=e}}
function walk(root){var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n,L=[];while(n=w.nextNode()){if(n.parentNode&&/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName))continue;L.push(n)}L.forEach(function(x){if(on)tr(x);else if(ORG.has(x)){x.nodeValue=ORG.get(x);ORG.delete(x)}});
 Array.prototype.forEach.call(root.querySelectorAll('[placeholder],[aria-label]'),function(el){['placeholder','aria-label'].forEach(function(a){var v=el.getAttribute(a);if(!v)return;var m=AORG.get(el)||{};if(on&&A[v]){m[a]=v;AORG.set(el,m);el.setAttribute(a,A[v])}else if(!on&&m[a]!==undefined){el.setAttribute(a,m[a]);delete m[a]}})})}
function set(v){on=v;var r=document.documentElement;r.setAttribute('lang',v?'en':'ar');r.setAttribute('dir',v?'ltr':'rtl');walk(document.body);var b=document.getElementById('lng');if(b){b.textContent=v?'ع':'EN';b.setAttribute('aria-label',v?'العربية':'English')}try{localStorage.setItem('invlang',v?'en':'ar')}catch(e){}}
var b=document.getElementById('lng');if(b)b.onclick=function(){set(!on)};
window.__i18n=function(){if(on)walk(document.body)};
try{if(localStorage.getItem('invlang')==='en')set(true)}catch(e){}
})();
var TABS=['home','cam','ask','browse','fav'];
function setTab(t,noscroll){if(TABS.indexOf(t)<0)t='home';document.body.setAttribute('data-tab',t);Array.prototype.forEach.call(document.querySelectorAll('#tabbar button'),function(b){b.classList.toggle('on',b.getAttribute('data-go')===t)});try{sessionStorage.setItem('tab',t)}catch(e){}if(!noscroll)window.scrollTo({top:0,behavior:'smooth'})}
window.__setTab=setTab;
var tb=$('tabbar');if(tb)tb.onclick=function(e){var b=e.target.closest('button');if(b)setTab(b.getAttribute('data-go'))};
function seg(v){document.body.setAttribute('data-seg',v);$('segoff').classList.toggle('on',v==='off');$('segai').classList.toggle('on',v==='ai')}
if($('segoff')){$('segoff').onclick=function(){seg('off')};$('segai').onclick=function(){seg('ai')}}
var ca=$('cats');if(ca){var ic={grid:'🔌',insulation:'⚡',pvdc:'☀️',temp:'🌡️',fan:'🌀',arc:'🔥',internal:'🧩',comm:'📡',battery:'🔋',load:'📈',other:'❔'};ca.innerHTML='<div class="ct">اختار نوع العطل</div><div class="cgrid">'+Object.keys(CATS).map(function(k){return '<button type="button" class="ctile" data-k="'+k+'"><i>'+(ic[k]||'•')+'</i><span>'+esc(CATS[k].split(' (')[0].split(' /')[0])+'</span></button>'}).join('')+'</div>';ca.onclick=function(e){var b=e.target.closest('.ctile');if(!b)return;$('fcat').value=b.getAttribute('data-k');$('fbrand').value='';$('filter').value='';renderList('');setTab('browse')}}
var nv=$('chips');if(nv)nv.addEventListener('click',function(e){if(e.target.closest('.chipb')&&document.body.getAttribute('data-tab')==='home')setTab('browse')});
var q1=$('qcam'),q2=$('qupl');if(q1)q1.addEventListener('click',function(){setTab('cam',true)});if(q2)q2.addEventListener('click',function(){setTab('cam',true)});
var hf=$('hform');if(hf)hf.addEventListener('submit',function(){setTab('home',true)});
var g=$('go');if(g)g.addEventListener('click',function(){setTab('home',true)});
var m=/[#&]t=([a-z]+)/.exec(location.hash);if(m)setTab(m[1],true);
var mb=/[#&]b=([^&]+)/.exec(location.hash);if(mb){var bk=decodeURIComponent(mb[1]);if(SRC[bk]){var fb3=$('fbrand');if(fb3){fb3.value=bk;$('fcat').value='';$('filter').value='';renderList('');setTab('browse',true)}}}
})()}catch(e){}
if(window.addEventListener)window.addEventListener('afterprint',function(){document.body.classList.remove('printone')});
try{(function(){var m=/[#&]f=([^&]+)/.exec(location.hash);if(!m)return;var k=decodeURIComponent(m[1]),f=F.filter(function(x){return fkey(x)===k})[0],o=$('out');if(!f||!o){if(o)o.innerHTML='<div class="none">اللينك ده مش لاقي الكارت المطلوب في القاعدة.</div>';return}o.innerHTML='<div class="muted">كارت مفتوح من لينك مشاركة:</div>'+card(f,'');bindCards(o);setTimeout(function(){try{o.scrollIntoView()}catch(e){}},100)})()}catch(e){}
try{(function(){
var bc=$('bcopy');if(bc)bc.onclick=function(){var b=$('fbrand').value;if(!b){toast('اختار شركة الأول');return}var u=location.href.split('#')[0]+'#b='+encodeURIComponent(b);if(navigator.clipboard){navigator.clipboard.writeText(u).then(function(){toast('اتنسخ لينك الشركة ✅')},function(){toast(u)})}else toast(u)};
Array.prototype.forEach.call(document.querySelectorAll('#symp [data-s]'),function(b){b.onclick=function(){var t=$('txt');if(!t)return;t.value=b.getAttribute('data-s');var g2=$('go');if(g2)g2.click()}});
})()}catch(e){}
if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(function(r){document.addEventListener('visibilitychange',function(){if(!document.hidden)r.update().catch(function(){})})}).catch(function(){});var rl=false;navigator.serviceWorker.addEventListener('controllerchange',function(){if(rl)return;rl=true;if(!window.__busy)location.reload()})}
})();

try{(function(){var b=document.createElement('button');b.type='button';b.id='totop';b.setAttribute('aria-label','لأعلى');b.textContent='↑';document.body.appendChild(b);var on=false;window.addEventListener('scroll',function(){var s=window.scrollY>600;if(s!==on){on=s;b.className=s?'show':''}},{passive:true});b.onclick=function(){window.scrollTo({top:0,behavior:'smooth'})}})()}catch(e){}
