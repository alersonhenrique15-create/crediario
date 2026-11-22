/* ============================================================
   BLACK DOS SONHOS — teaser do painel · 1920x1080 · 15s
   Uma mensagem só: nome, data, Instagram. Sem oferta.
   Rode com:  node marketing/gerar-sonhos.js
   ============================================================ */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

/* ===================== EDITE AQUI ===================== */
const TX = { n1:'BLACK', n2:'DOS', n3:'SONHOS', aguarde:'AGUARDE',
             data:'25.11', dia:'QUARTA-FEIRA', insta:'@tecno_cell17' };
const ENTRA = [0.00, 5.40, 10.30];
const FPS = 30, DUR = 15, W = 1920, H = 1080, BARRA = 132;
/* ====================================================== */

const VM='#F0162B', PR='#0A0C0D';
const CROMO = `linear-gradient(180deg,#FFFFFF 0%,#C9D1D7 16%,#7E888F 36%,#FFFFFF 49%,#5C656B 51%,#9EA7AD 66%,#F4F8FA 86%,#848D93 100%)`;
const RUBI  = `linear-gradient(180deg,#FF8A94 0%,#F5283C 28%,#FFFFFF 49%,#B00D1C 51%,#F0162B 72%,#FF7A86 100%)`;
const SAIDA = path.join(__dirname,'saida');
const TMP='/tmp/claude-0/-home-user-crediario/1c85eb7c-7399-5dda-9949-ce2eca2e8105/scratchpad/frames-sonhos';
const b64 = p => 'data:image/png;base64,'+fs.readFileSync(path.join(__dirname,'logo',p)).toString('base64');
const LOGO=b64('tecnocell-completa.png'), MARCA=b64('tecnocell-marca.png');

const grao = s => "data:image/svg+xml,"+encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'>`+
  `<feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' seed='${s}'/></filter>`+
  `<rect width='220' height='220' filter='url(#n)'/></svg>`);
const GRAOS=[3,11,19,27,35,43,51,59].map(grao);

let sm=5; const rnd=()=>(sm=(sm*1103515245+12345)&0x7fffffff)/0x7fffffff;
const POEIRA=Array.from({length:34},()=>({x:rnd()*100,y:rnd()*100,r:1+rnd()*2,
  v:.22+rnd()*.45,f:rnd()*6.283,o:.08+rnd()*.18}));

const html=`<!doctype html><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000}
#p{position:relative;width:${W}px;height:${H}px;overflow:hidden;--u:${W/100}px;color:#fff;
   font-family:"Inter Display","Inter",sans-serif;
   background:radial-gradient(70% 55% at 24% 6%,rgba(150,170,185,.15),rgba(0,0,0,0) 62%),
              radial-gradient(120% 95% at 50% 16%,#1C2125 0%,${PR} 58%,#000 100%)}
.cena{position:absolute;inset:0;padding-bottom:${BARRA}px;display:flex;align-items:center;
      justify-content:center;opacity:0;
      background:radial-gradient(70% 55% at 24% 6%,rgba(150,170,185,.15),rgba(0,0,0,0) 62%),
                 radial-gradient(120% 95% at 50% 16%,#1C2125 0%,${PR} 58%,#000 100%)}
.cena .box{text-align:center;transform-origin:center;position:relative}
.nw{white-space:nowrap}
.cromo{background:${CROMO};-webkit-background-clip:text;background-clip:text;color:transparent;
   filter:drop-shadow(0 calc(var(--u)*.45) 0 #3A4146) drop-shadow(0 calc(var(--u)*.95) 0 #22282C)
          drop-shadow(0 calc(var(--u)*1.5) calc(var(--u)*1.4) rgba(0,0,0,.8))}
.rubi{background:${RUBI};-webkit-background-clip:text;background-clip:text;color:transparent;
   filter:drop-shadow(0 calc(var(--u)*.45) 0 #7E0A15) drop-shadow(0 calc(var(--u)*.95) 0 #4D0610)
          drop-shadow(0 0 calc(var(--u)*3.2) rgba(240,22,43,.7))}
.big{font-weight:900;font-size:calc(var(--u)*16.5);line-height:.9;letter-spacing:-.03em}
.mid{font-weight:900;font-size:calc(var(--u)*6.6);letter-spacing:.26em;
   display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*2.4);margin:calc(var(--u)*.4) 0}
.mid i{width:calc(var(--u)*8.5);height:calc(var(--u)*.45);background:#8E979D;border-radius:2px;display:block}
#anel{position:absolute;left:50%;top:50%;width:calc(var(--u)*64);height:calc(var(--u)*64);
   margin:calc(var(--u)*-32) 0 0 calc(var(--u)*-32);border-radius:50%;z-index:-1;
   border:calc(var(--u)*.85) solid rgba(240,22,43,.5);
   box-shadow:0 0 calc(var(--u)*7) rgba(240,22,43,.55),inset 0 0 calc(var(--u)*7) rgba(240,22,43,.4)}
.aguarde{display:inline-block;background:${VM};color:#fff;font-weight:900;
   font-size:calc(var(--u)*4.4);letter-spacing:.3em;padding:calc(var(--u)*1) calc(var(--u)*3.6);
   border-radius:calc(var(--u)*1);box-shadow:0 0 calc(var(--u)*5) rgba(240,22,43,.55)}
.dataG{font-weight:900;font-size:calc(var(--u)*25);line-height:.9;letter-spacing:-.05em;margin-top:calc(var(--u)*2.4)}
.diaG{font-weight:900;font-size:calc(var(--u)*7);letter-spacing:.2em;color:#E6EBEE;margin-top:calc(var(--u)*1)}
#logoWrap{position:relative;width:calc(var(--u)*34);margin:0 auto calc(var(--u)*3.2)}
#logoWrap img{width:100%;display:block}
#logoRef{position:absolute;top:100%;left:0;transform:scaleY(-1);opacity:.2;
   -webkit-mask-image:linear-gradient(to top,rgba(0,0,0,.75),rgba(0,0,0,0) 58%);
   mask-image:linear-gradient(to top,rgba(0,0,0,.75),rgba(0,0,0,0) 58%)}
.igG{font-weight:900;font-size:calc(var(--u)*7.4);color:#fff}
#rodape{position:absolute;left:0;right:0;bottom:0;height:${BARRA}px;z-index:55;
   background:linear-gradient(180deg,#14181B,${PR});display:flex;align-items:center;
   justify-content:center;gap:calc(var(--u)*3);opacity:0}
#rodape::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;
   background:linear-gradient(90deg,rgba(240,22,43,0),${VM} 25%,#FF6070 50%,${VM} 75%,rgba(240,22,43,0))}
#rodape img{height:calc(var(--u)*5.6);display:block}
#rodape svg{width:calc(var(--u)*3.8);height:calc(var(--u)*3.8)}
#rodape .ig{font-weight:900;font-size:calc(var(--u)*4.2);color:#fff}
#rodape .div{width:2px;height:calc(var(--u)*4.2);background:rgba(255,255,255,.16)}
#marcaFixa{position:absolute;top:calc(var(--u)*3);left:calc(var(--u)*3.4);z-index:58;
   height:calc(var(--u)*8);opacity:0;filter:drop-shadow(0 calc(var(--u)*.5) calc(var(--u)*1.4) rgba(0,0,0,.6))}
#barra{position:absolute;top:-14%;bottom:-14%;width:calc(var(--u)*1.2);left:0;z-index:60;
  background:linear-gradient(180deg,rgba(240,22,43,0),#FF4253 16%,#FFF 50%,#FF4253 84%,rgba(240,22,43,0));
  box-shadow:0 0 calc(var(--u)*8) calc(var(--u)*2.4) rgba(240,22,43,.9);opacity:0}
.grao{position:absolute;inset:-6%;z-index:72;pointer-events:none;opacity:0;
   background-repeat:repeat;background-size:220px 220px;mix-blend-mode:overlay}
#poeira{position:absolute;inset:0;z-index:70;pointer-events:none}
#poeira i{position:absolute;border-radius:50%;background:#fff;display:block}
#vinheta{position:absolute;inset:0;z-index:71;pointer-events:none;
  background:radial-gradient(120% 94% at 50% 44%,rgba(0,0,0,0) 54%,rgba(0,0,0,.6) 100%)}
</style>
<div id="p">
  <div class="cena" id="s0" style="z-index:10"><div class="box">
    <div id="anel"></div>
    <div class="big cromo nw">${TX.n1}</div>
    <div class="mid cromo nw"><i></i>${TX.n2}<i></i></div>
    <div class="big rubi nw">${TX.n3}</div>
  </div></div>

  <div class="cena" id="s1" style="z-index:20"><div class="box">
    <div class="aguarde nw" id="ag">${TX.aguarde}</div>
    <div class="dataG cromo nw">${TX.data}</div>
    <div class="diaG nw" id="dia">${TX.dia}</div>
  </div></div>

  <div class="cena" id="s2" style="z-index:30"><div class="box">
    <div id="logoWrap"><img src="${LOGO}" alt="Tecno Cell"><img id="logoRef" src="${LOGO}" alt=""></div>
    <div class="igG nw" id="ig">${TX.insta}</div>
  </div></div>

  <div id="rodape">
    <img src="${MARCA}" alt=""><span class="div"></span>
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.6"/>
      <circle cx="17.6" cy="6.4" r="1.25" fill="#fff" stroke="none"/></svg>
    <span class="ig">${TX.insta}</span>
  </div>
  <img id="marcaFixa" src="${MARCA}" alt="">
  ${GRAOS.map((g,i)=>`<div class="grao" id="g${i}" style="background-image:url('${g}')"></div>`).join('')}
  <div id="barra"></div><div id="poeira"></div><div id="vinheta"></div>
</div>
<script>
var ENTRA=${JSON.stringify(ENTRA)}, POEIRA=${JSON.stringify(POEIRA)}, U=${W/100}, VARRE=.6, BARRA=${BARRA};
var $=function(s){return document.querySelector(s);};
function cl(x,a,b){return Math.max(a,Math.min(b,x));}
function seg(t,a,b){return cl((t-a)/(b-a),0,1);}
function outCubic(p){return 1-Math.pow(1-p,3);}
function outQuint(p){return 1-Math.pow(1-p,5);}
function inOut(p){return p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;}
var cx=$('#poeira');
POEIRA.forEach(function(d){var e=document.createElement('i');
  e.style.width=e.style.height=(d.r*U/8)+'px';cx.appendChild(e);d.el=e;});
var FIT=[1,1,1];
function medir(){
  ENTRA.forEach(function(_,i){var c=document.getElementById('s'+i),b=c.querySelector('.box');
    FIT[i]=Math.min(1,(1920-150)/b.offsetWidth,(1080-BARRA-80)/b.offsetHeight);});
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
    var c=document.getElementById('s'+i),b=c.querySelector('.box');
    var w=inOut(seg(t,ini,ini+VARRE));
    c.style.opacity=t>=ini?1:0;
    c.style.clipPath='inset(0 '+((1-w)*100).toFixed(2)+'% 0 0)';
    if(w>0&&w<1)bx=w;
    var dur=(ENTRA[i+1]||15)-ini;
    b.style.transform='scale('+(FIT[i]*(1+0.04*seg(t,ini,ini+dur))).toFixed(4)+')';
  });
  var bb=$('#barra');bb.style.opacity=bx>=0?1:0;if(bx>=0)bb.style.left=(bx*100)+'%';

  var mf=$('#marcaFixa'),m=seg(t,1.0,1.6);
  mf.style.opacity=(m*.9).toFixed(3);
  mf.style.transform='translateY('+((1-outQuint(m))*-2.4*U).toFixed(2)+'px)';
  var r=$('#rodape'),rr=seg(t,1.2,1.8);
  r.style.opacity=rr.toFixed(3);
  r.style.transform='translateY('+((1-outQuint(rr))*BARRA).toFixed(1)+'px)';

  function sobe(el,a,b,dy){var i=seg(t,a,b);
    el.style.opacity=outCubic(i).toFixed(3);
    el.style.transform='translateY('+((1-outQuint(i))*(dy||2.4)*U).toFixed(2)+'px)';}
  sobe($('#ag'),5.80,6.40,2.6);
  sobe($('#dia'),6.90,7.50,2.2);
  sobe($('#ig'),11.40,12.05,2.6);
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
  console.log('ajuste por cena:', await pg.evaluate(()=>document.documentElement.dataset.fit));
  for(let i=0;i<3;i++){
    await pg.evaluate(j=>{window.render([4.2,9.2,14.6][j]);document.getElementById('barra').style.opacity=0;},i);
    await pg.screenshot({path:path.join(SAIDA,`sonhos-tela-${i+1}.png`)});
  }
  console.log('3 imagens -> sonhos-tela-1..3.png');
  const total=FPS*DUR;
  for(let i=0;i<total;i++){
    await pg.evaluate(t=>window.render(t),i/FPS);
    await pg.screenshot({path:path.join(TMP,`f${String(i).padStart(4,'0')}.png`)});
  }
  await b.close();
  const mp4=path.join(SAIDA,'black-dos-sonhos-teaser-15s.mp4');
  execFileSync('ffmpeg',['-y','-framerate',String(FPS),'-i',path.join(TMP,'f%04d.png'),
    '-c:v','libx264','-preset','slow','-crf','15','-pix_fmt','yuv420p','-movflags','+faststart',mp4],{stdio:'ignore'});
  fs.rmSync(TMP,{recursive:true,force:true});
  console.log('vídeo ->',path.basename(mp4),(fs.statSync(mp4).size/1048576).toFixed(2)+' MB');
  console.log('Pronto.');
})().catch(e=>{console.error(e);process.exit(1);});
