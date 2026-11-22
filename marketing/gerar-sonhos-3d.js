/* ============================================================
   BLACK DOS SONHOS — versão 3D · 1920x1080 · 15s · 30fps
   Letras com volume e movimento de câmera em perspectiva.
   Rode com:  node marketing/gerar-sonhos-3d.js
   ============================================================ */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');

/* ===================== EDITE AQUI ===================== */
const TX = { n1:'BLACK', n2:'DOS', n3:'SONHOS',
  f1:'A BLACK NA TECNO CELL', f2:'COMEÇA', f3:'ANTES.',
  pre:'INÍCIO', data:'25.11', dia:'QUARTA-FEIRA',
  cats:'CELULARES E ACESSÓRIOS',
  cta1:'ACOMPANHE AS OFERTAS NO NOSSO', cta2:'INSTAGRAM E WHATSAPP',
  insta:'@tecno_cell17', zap:'(37) 99148-6624',
  /* apague o nome se não tiver o modelo em estoque; fica só o desenho */
  mod1:'XIAOMI', mod2:'iPHONE 18 PRO MAX' };
const ENTRA=[0.00,4.20,8.00,11.60];
const FPS=30, DUR=15, W=1920, H=1080;
/* ====================================================== */

const VM='#F0162B', PR='#0A0C0D';
const CROMO=`linear-gradient(180deg,#FFFFFF 0%,#C9D1D7 16%,#7E888F 36%,#FFFFFF 49%,#5C656B 51%,#9EA7AD 66%,#F4F8FA 86%,#848D93 100%)`;
const RUBI=`linear-gradient(180deg,#FF8A94 0%,#F5283C 28%,#FFFFFF 49%,#B00D1C 51%,#F0162B 72%,#FF7A86 100%)`;
const SAIDA=path.join(__dirname,'saida');
const TMP='/tmp/claude-0/-home-user-crediario/1c85eb7c-7399-5dda-9949-ce2eca2e8105/scratchpad/frames-3d';
const b64=p=>'data:image/png;base64,'+fs.readFileSync(path.join(__dirname,'logo',p)).toString('base64');
const LOGO=b64('tecnocell-completa.png'), MARCA=b64('tecnocell-marca.png');
const grao=s=>"data:image/svg+xml,"+encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'>`+
  `<feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' seed='${s}'/></filter>`+
  `<rect width='220' height='220' filter='url(#n)'/></svg>`);
const GRAOS=[3,11,19,27,35,43,51,59].map(grao);
let sm=9; const rnd=()=>(sm=(sm*1103515245+12345)&0x7fffffff)/0x7fffffff;
const POEIRA=Array.from({length:38},()=>({x:rnd()*100,y:rnd()*100,r:1+rnd()*2.1,
  v:.22+rnd()*.45,f:rnd()*6.283,o:.08+rnd()*.2}));

const html=`<!doctype html><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000}
#p{position:relative;width:${W}px;height:${H}px;overflow:hidden;--u:${W/100}px;color:#fff;
  font-family:"Inter Display","Inter",sans-serif}
.cena{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;
  padding:calc(var(--u)*10) calc(var(--u)*6) calc(var(--u)*5);
  perspective:calc(var(--u)*90);perspective-origin:50% 42%}
.fundoEsc{background:radial-gradient(70% 55% at 24% 6%,rgba(150,170,185,.16),rgba(0,0,0,0) 62%),
  radial-gradient(120% 95% at 50% 16%,#1C2125 0%,${PR} 58%,#000 100%)}
.fundoVm{background:radial-gradient(60% 50% at 24% 10%,rgba(255,255,255,.22),rgba(255,255,255,0) 60%),
  radial-gradient(130% 108% at 50% 14%,#FF2A3C 0%,${VM} 46%,#A80C1C 100%)}
.box{text-align:center;transform-style:preserve-3d;position:relative}
.nw{white-space:nowrap}
.cromo{background:${CROMO};-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 calc(var(--u)*.45) 0 #3A4146) drop-shadow(0 calc(var(--u)*.95) 0 #22282C)
         drop-shadow(0 calc(var(--u)*1.6) calc(var(--u)*1.5) rgba(0,0,0,.85))}
.rubi{background:${RUBI};-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 calc(var(--u)*.45) 0 #7E0A15) drop-shadow(0 calc(var(--u)*.95) 0 #4D0610)
         drop-shadow(0 0 calc(var(--u)*3.2) rgba(240,22,43,.72))}
.branco3d{color:#fff;text-shadow:${Array.from({length:12},(_,i)=>`${i+1}px ${i+1}px 0 #1A1E22`).join(',')},
  0 calc(var(--u)*1.4) calc(var(--u)*1.6) rgba(0,0,0,.8)}
.big{font-weight:900;font-size:calc(var(--u)*14.5);line-height:.9;letter-spacing:-.03em}
.mid{font-weight:900;font-size:calc(var(--u)*5.8);letter-spacing:.26em;display:flex;
  align-items:center;justify-content:center;gap:calc(var(--u)*2.2);margin:calc(var(--u)*.3) 0}
.mid i{width:calc(var(--u)*7.6);height:calc(var(--u)*.42);background:#8E979D;border-radius:2px;display:block}
.ass{font-weight:800;font-size:calc(var(--u)*3.8);letter-spacing:.26em;color:#C3CBD1;margin-top:calc(var(--u)*1.8)}
.olho{font-weight:900;font-size:calc(var(--u)*4.6);letter-spacing:.2em;color:#C3CBD1;margin-bottom:calc(var(--u)*2)}
.l2{font-weight:900;font-size:calc(var(--u)*13);line-height:1.0;letter-spacing:-.03em}
.pre{font-weight:900;font-size:calc(var(--u)*3.6);letter-spacing:.24em;color:#fff;opacity:.92}
.diaP{font-weight:900;font-size:calc(var(--u)*3.4);letter-spacing:.2em;margin-top:calc(var(--u)*.4)}
.dataG{font-weight:900;font-size:calc(var(--u)*18);line-height:.88;letter-spacing:-.055em;margin-top:calc(var(--u)*1.2)}
.cats{font-weight:800;font-size:calc(var(--u)*3);letter-spacing:.18em;margin-top:calc(var(--u)*2);
  padding-top:calc(var(--u)*1.8);border-top:2px solid rgba(255,255,255,.4)}
#logoWrap{position:relative;width:calc(var(--u)*32);margin:0 auto calc(var(--u)*3)}
#logoWrap img{width:100%;display:block}
#logoRef{position:absolute;top:100%;left:0;transform:scaleY(-1);opacity:.11;
  -webkit-mask-image:linear-gradient(to top,rgba(0,0,0,.75),rgba(0,0,0,0) 58%);
  mask-image:linear-gradient(to top,rgba(0,0,0,.75),rgba(0,0,0,0) 58%)}
.ctaF{font-weight:900;font-size:calc(var(--u)*3.4);letter-spacing:.2em;color:${VM};
  margin-bottom:calc(var(--u)*2.2);line-height:1.4}
.contF{display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*2.6);
  font-weight:900;font-size:calc(var(--u)*4);color:#fff}
.contF .div{width:2px;height:calc(var(--u)*4);background:rgba(255,255,255,.2)}
.contF .tel{font-family:"JetBrains Mono",monospace;font-weight:700;font-size:calc(var(--u)*3.4);color:#D6DCE0}
.contF svg{width:calc(var(--u)*3.6);height:calc(var(--u)*3.6)}
/* dois aparelhos de silhueta diferente, sem marca nenhuma estampada */
.apar{position:relative;flex:0 0 auto;transform-style:preserve-3d;
  display:flex;flex-direction:column;align-items:center}
.apar .corpo{width:calc(var(--u)*19);height:calc(var(--u)*40);border-radius:calc(var(--u)*2.8);
  background:linear-gradient(145deg,#39424A 0%,#171D22 42%,#090C0F 100%);
  border:calc(var(--u)*.3) solid rgba(255,255,255,.26);position:relative;
  box-shadow:0 calc(var(--u)*2) calc(var(--u)*5) rgba(0,0,0,.75),
             inset 0 calc(var(--u)*.2) 0 rgba(255,255,255,.3),
             0 0 calc(var(--u)*4) rgba(255,255,255,.14)}
.apar .tela{position:absolute;inset:calc(var(--u)*.75);border-radius:calc(var(--u)*2.3);
  background:linear-gradient(158deg,#8FA3B4 0%,#44515C 22%,#1B2026 52%,#0B0E11 100%);
  box-shadow:inset 0 0 calc(var(--u)*3) rgba(255,255,255,.22)}
.apar .cam{position:absolute;border-radius:calc(var(--u)*1.6);background:#0A0D10;
  border:calc(var(--u)*.22) solid rgba(255,255,255,.2)}
.apar .lente{position:absolute;border-radius:50%;background:radial-gradient(circle at 34% 30%,#5A6672,#0B0F13 70%);
  border:calc(var(--u)*.16) solid rgba(255,255,255,.22)}
/* iPhone: ilha no topo, módulo quadrado com três lentes */
.apar.ip .ilha{position:absolute;top:calc(var(--u)*1.5);left:50%;transform:translateX(-50%);
  width:calc(var(--u)*5.6);height:calc(var(--u)*1.5);border-radius:999px;background:#05070A;z-index:2}
.apar.ip .cam{top:calc(var(--u)*2);left:calc(var(--u)*2);width:calc(var(--u)*8.4);height:calc(var(--u)*8.4)}
.apar.ip .l1{top:calc(var(--u)*3.3);left:calc(var(--u)*3.3);width:calc(var(--u)*2.9);height:calc(var(--u)*2.9)}
.apar.ip .l2{top:calc(var(--u)*3.3);left:calc(var(--u)*6.6);width:calc(var(--u)*2.9);height:calc(var(--u)*2.9)}
.apar.ip .l3{top:calc(var(--u)*6.6);left:calc(var(--u)*3.3);width:calc(var(--u)*2.9);height:calc(var(--u)*2.9)}
/* Xiaomi: furo central e módulo redondo grande */
.apar.xi .furo{position:absolute;top:calc(var(--u)*1.6);left:50%;transform:translateX(-50%);
  width:calc(var(--u)*1.5);height:calc(var(--u)*1.5);border-radius:50%;background:#05070A;z-index:2}
.apar.xi .cam{top:calc(var(--u)*2);left:50%;transform:translateX(-50%);
  width:calc(var(--u)*10);height:calc(var(--u)*10);border-radius:50%}
.apar.xi .l1{top:calc(var(--u)*3.6);left:50%;margin-left:calc(var(--u)*-3.4);
  width:calc(var(--u)*3.2);height:calc(var(--u)*3.2)}
.apar.xi .l2{top:calc(var(--u)*3.6);left:50%;margin-left:calc(var(--u)*.2);
  width:calc(var(--u)*3.2);height:calc(var(--u)*3.2)}
.apar.xi .l3{top:calc(var(--u)*7);left:50%;margin-left:calc(var(--u)*-1.6);
  width:calc(var(--u)*3.2);height:calc(var(--u)*3.2)}
.apar .nome{margin-top:calc(var(--u)*1.8);white-space:nowrap;font-weight:900;
  font-size:calc(var(--u)*2.5);letter-spacing:.14em;color:#fff;opacity:.95}
.apar .corpo{flex:0 0 auto}
#trio{display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*4.5)}
#meio{text-align:center}
#anel{position:absolute;left:50%;top:50%;width:calc(var(--u)*70);height:calc(var(--u)*70);
  margin:calc(var(--u)*-35) 0 0 calc(var(--u)*-35);border-radius:50%;z-index:-1;
  border:calc(var(--u)*.8) solid rgba(240,22,43,.42);
  box-shadow:0 0 calc(var(--u)*8) rgba(240,22,43,.5),inset 0 0 calc(var(--u)*8) rgba(240,22,43,.32)}
#marcaFixa{position:absolute;top:calc(var(--u)*3);left:calc(var(--u)*3.4);z-index:58;
  height:calc(var(--u)*8.6);opacity:0;filter:drop-shadow(0 calc(var(--u)*.5) calc(var(--u)*1.4) rgba(0,0,0,.65))}
#barra{position:absolute;top:-14%;bottom:-14%;width:calc(var(--u)*1.2);left:0;z-index:60;
  background:linear-gradient(180deg,rgba(240,22,43,0),#FF4253 16%,#FFF 50%,#FF4253 84%,rgba(240,22,43,0));
  box-shadow:0 0 calc(var(--u)*8) calc(var(--u)*2.4) rgba(240,22,43,.9);opacity:0}
.grao{position:absolute;inset:-6%;z-index:72;pointer-events:none;opacity:0;
  background-repeat:repeat;background-size:220px 220px;mix-blend-mode:overlay}
#poeira{position:absolute;inset:0;z-index:70;pointer-events:none}
#poeira i{position:absolute;border-radius:50%;background:#fff;display:block}
#vinheta{position:absolute;inset:0;z-index:71;pointer-events:none;
  background:radial-gradient(120% 94% at 50% 46%,rgba(0,0,0,0) 54%,rgba(0,0,0,.62) 100%)}
</style>
<div id="p">
  <div class="cena fundoEsc" id="s0" style="z-index:10"><div class="box">
    <div id="anel"></div>
    <div class="big cromo nw">${TX.n1}</div>
    <div class="mid cromo nw"><i></i>${TX.n2}<i></i></div>
    <div class="big rubi nw">${TX.n3}</div>
  </div></div>

  <div class="cena fundoEsc" id="s1" style="z-index:20"><div class="box">
    <div class="olho nw">${TX.f1}</div>
    <div class="l2 branco3d nw">${TX.f2}</div>
    <div class="l2 rubi nw" id="antes">${TX.f3}</div>
  </div></div>

  <div class="cena fundoVm" id="s2" style="z-index:30"><div class="box">
    <div id="trio">
      <div class="apar xi" id="aparE"><div class="corpo"><div class="tela"></div>
        <div class="furo"></div><div class="cam"></div>
        <div class="lente l1"></div><div class="lente l2"></div><div class="lente l3"></div></div>
        <div class="nome">${TX.mod1}</div></div>
      <div id="meio">
        <div class="pre nw">${TX.pre}</div>
        <div class="dataG cromo nw">${TX.data}</div>
        <div class="diaP nw">${TX.dia}</div>
        <div class="cats nw" id="cats">${TX.cats}</div>
      </div>
      <div class="apar ip" id="aparD"><div class="corpo"><div class="tela"></div>
        <div class="ilha"></div><div class="cam"></div>
        <div class="lente l1"></div><div class="lente l2"></div><div class="lente l3"></div></div>
        <div class="nome">${TX.mod2}</div></div>
    </div>
  </div></div>

  <div class="cena fundoEsc" id="s3" style="z-index:40"><div class="box">
    <div id="logoWrap"><img src="${LOGO}" alt="Tecno Cell"><img id="logoRef" src="${LOGO}" alt=""></div>
    <div class="ctaF" id="ctaF">${TX.cta1}<br>${TX.cta2}</div>
    <div class="contF nw" id="contF">
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.6"/>
        <circle cx="17.6" cy="6.4" r="1.25" fill="#fff" stroke="none"/></svg>
      <span>${TX.insta}</span><span class="div"></span><span class="tel">${TX.zap}</span></div>
  </div></div>

  <img id="marcaFixa" src="${MARCA}" alt="">
  ${GRAOS.map((g,i)=>`<div class="grao" id="g${i}" style="background-image:url('${g}')"></div>`).join('')}
  <div id="barra"></div><div id="poeira"></div><div id="vinheta"></div>
</div>
<script>
var ENTRA=${JSON.stringify(ENTRA)}, POEIRA=${JSON.stringify(POEIRA)}, U=${W/100}, VARRE=.6;
var $=function(s){return document.querySelector(s);};
function cl(x,a,b){return Math.max(a,Math.min(b,x));}
function seg(t,a,b){return cl((t-a)/(b-a),0,1);}
function outCubic(p){return 1-Math.pow(1-p,3);}
function outQuint(p){return 1-Math.pow(1-p,5);}
function inOut(p){return p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;}
var cx=$('#poeira');
POEIRA.forEach(function(d){var e=document.createElement('i');
  e.style.width=e.style.height=(d.r*U/8)+'px';cx.appendChild(e);d.el=e;});
var FIT=[1,1,1,1];
function medir(){
  ENTRA.forEach(function(_,i){var c=document.getElementById('s'+i),b=c.querySelector('.box');
    var cs=getComputedStyle(c);
    var aw=c.clientWidth -parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
    var ah=c.clientHeight-parseFloat(cs.paddingTop) -parseFloat(cs.paddingBottom);
    FIT[i]=Math.min(aw*0.94/b.offsetWidth, ah*0.92/b.offsetHeight);});
  document.documentElement.dataset.fit=FIT.map(function(v){return v.toFixed(3);}).join(',');
  document.documentElement.dataset.pronto='1';
}
Promise.all([document.fonts.ready,Promise.all(Array.from(document.images).map(function(i){
  return i.complete?Promise.resolve():new Promise(function(r){i.onload=i.onerror=r;});}))]).then(medir);

window.render=function(t){
  POEIRA.forEach(function(d){var y=(d.y-t*d.v*2)%100;if(y<0)y+=100;
    d.el.style.left=d.x+'%';d.el.style.top=y+'%';
    d.el.style.opacity=(d.o*(.55+.45*Math.sin(t*1.3+d.f))).toFixed(3);});
  var q=Math.round(t*30)%8;
  for(var i=0;i<8;i++) document.getElementById('g'+i).style.opacity=(i===q?0.05:0);

  var bx=-1;
  ENTRA.forEach(function(ini,i){
    var c=document.getElementById('s'+i), b=c.querySelector('.box');
    var w=inOut(seg(t,ini,ini+VARRE));
    c.style.opacity=t>=ini?1:0;
    c.style.clipPath='inset(0 '+((1-w)*100).toFixed(2)+'% 0 0)';
    if(w>0&&w<1)bx=w;
    /* entrada em perspectiva: o bloco vem de trás e se endireita */
    var dur=(ENTRA[i+1]||15)-ini;
    var e=outQuint(seg(t,ini,ini+1.05));
    var p=seg(t,ini,ini+dur);
    var rx=(1-e)*-16, ry=(1-e)*10, tz=(1-e)*-46*U;
    /* e segue com uma deriva lenta, que é o que segura o olho */
    var deriva=Math.sin(p*Math.PI)*2.2;
    b.style.transform='translateZ('+tz.toFixed(1)+'px) rotateX('+(rx+deriva*.35).toFixed(2)+
      'deg) rotateY('+(ry-deriva).toFixed(2)+'deg) scale('+(FIT[i]*(1+.05*p)).toFixed(4)+')';
  });
  var bb=$('#barra');bb.style.opacity=bx>=0?1:0;if(bx>=0)bb.style.left=(bx*100)+'%';

  /* os dois aparelhos giram em sentidos opostos, bem devagar */
  var gE=Math.sin(t*0.4)*13+16, gD=Math.sin(t*0.4+1.1)*13-16;
  var aE=$('#aparE'), aD=$('#aparD');
  if(aE) aE.style.transform='rotateY('+gE.toFixed(2)+'deg) rotateZ(-6deg) translateZ('+(-6*U).toFixed(1)+'px)';
  if(aD) aD.style.transform='rotateY('+gD.toFixed(2)+'deg) rotateZ(6deg) translateZ('+(-6*U).toFixed(1)+'px)';

  var mf=$('#marcaFixa'),m=seg(t,.9,1.5);
  mf.style.opacity=(m*.92).toFixed(3);
  mf.style.transform='translateY('+((1-outQuint(m))*-2.4*U).toFixed(2)+'px)';

  function sobe(el,a,b,dy){var i=seg(t,a,b);
    el.style.opacity=outCubic(i).toFixed(3);
    el.style.transform='translateY('+((1-outQuint(i))*(dy||2.4)*U).toFixed(2)+'px)';}
  sobe($('#antes'),5.35,6.00,3.0);
  sobe($('#cats'),9.20,9.80,2.2);
  sobe($('#ctaF'),12.45,13.00,2.2);
  sobe($('#contF'),12.75,13.35,2.0);
};
window.render(0);
</script>`;

(async()=>{
  fs.mkdirSync(SAIDA,{recursive:true});
  fs.rmSync(TMP,{recursive:true,force:true}); fs.mkdirSync(TMP,{recursive:true});
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
  const pg=await ctx.newPage(); pg.on('pageerror',e=>{throw e;});
  await pg.setContent(html,{waitUntil:'load'});
  await pg.waitForFunction(()=>document.documentElement.dataset.pronto==='1',null,{timeout:15000});
  console.log('ajuste por cena:',await pg.evaluate(()=>document.documentElement.dataset.fit));
  for(let i=0;i<4;i++){
    await pg.evaluate(j=>{window.render([3.2,7.2,10.8,14.6][j]);
      document.getElementById('barra').style.opacity=0;},i);
    await pg.screenshot({path:path.join(SAIDA,`sonhos3d-${i+1}.png`)});
  }
  console.log('4 imagens -> sonhos3d-1..4.png');
  const total=FPS*DUR;
  for(let i=0;i<total;i++){
    await pg.evaluate(t=>window.render(t),i/FPS);
    await pg.screenshot({path:path.join(TMP,`f${String(i).padStart(4,'0')}.png`)});
  }
  await b.close();
  const mp4=path.join(SAIDA,'black-dos-sonhos-3d-15s.mp4');
  execFileSync('ffmpeg',['-y','-framerate',String(FPS),'-i',path.join(TMP,'f%04d.png'),
    '-c:v','libx264','-preset','slow','-crf','15','-pix_fmt','yuv420p','-movflags','+faststart',mp4],{stdio:'ignore'});
  fs.rmSync(TMP,{recursive:true,force:true});
  console.log('vídeo ->',path.basename(mp4),(fs.statSync(mp4).size/1048576).toFixed(2)+' MB');
  console.log('Pronto.');
})().catch(e=>{console.error(e);process.exit(1);});
