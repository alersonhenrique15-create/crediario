/* ============================================================
   BLACK TECNO — vídeo do painel  ·  1920x1080 · 15s · sem áudio
   Três ganchos + chamada pro Instagram.
   Rode com:  node marketing/gerar-black-tecno.js
   ============================================================ */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

/* ===================== EDITE AQUI ===================== */
const TX = {
  s1a: 'COMPRE SEU CELULAR',
  s1b: 'LEVE UM FONE DE R$ 100',
  s1c: 'POR MAIS R$ 1',
  s2a: 'QUEBROU A TELA DE NOVO?',
  s2b: 'VOCÊ NÃO PAGA',
  s2c: 'a gente troca de graça, em até 3 meses',
  s3a: 'UMA DAS SUAS PARCELAS',
  s3b: 'VIRA PRODUTO',
  s3c: 'no crediário, a partir de 12x',
  s4a: 'VEM DESCOBRIR',
  data: '25.11',
  dia: 'QUARTA-FEIRA',
  insta: '@tecno_cell17',
  zap: '(37) 99148-6624',
  legal: 'Consulte o regulamento completo na loja · Sujeito a análise de crédito · Enquanto durar o estoque'
};
const ENTRA = [0.00, 4.00, 8.00, 11.50];
const FPS = 30, DUR = 15, W = 1920, H = 1080, BARRA = 186;
/* ====================================================== */

const VM = '#F0162B', VM_ESC = '#6E0612', PR = '#0A0C0D';
const SAIDA = path.join(__dirname, 'saida');
const TMP = '/tmp/claude-0/-home-user-crediario/1c85eb7c-7399-5dda-9949-ce2eca2e8105/scratchpad/frames-bt';
const b64 = p => 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'logo', p)).toString('base64');
const LOGO = b64('tecnocell-completa.png'), MARCA = b64('tecnocell-marca.png');
const ext = (c, n = 10) => Array.from({ length: n }, (_, i) => `${i + 1}px ${i + 1}px 0 ${c}`).join(',');

let sem = 23;
const rnd = () => (sem = (sem * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const POEIRA = Array.from({ length: 40 }, () => ({
  x: rnd() * 100, y: rnd() * 100, r: 1 + rnd() * 2.1,
  v: .25 + rnd() * .5, f: rnd() * 6.283, o: .09 + rnd() * .2
}));

const ESTILO = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000}
#p{position:relative;width:${W}px;height:${H}px;background:#000;overflow:hidden;
   font-family:"Inter Display","Inter",sans-serif;--u:${W / 100}px}
.cena{position:absolute;inset:0;padding-bottom:${BARRA}px;display:flex;
      align-items:center;justify-content:center;opacity:0}
.cena .box{text-align:center;transform-origin:center}
.escura{background:radial-gradient(120% 92% at 50% 10%,#191C1F 0%,${PR} 58%,#000 100%)}
.vermelha{background:radial-gradient(130% 108% at 50% 14%,#FF2A3C 0%,${VM} 46%,#B50D1E 100%)}
.nw{white-space:nowrap}
.sup{font-weight:900;font-size:calc(var(--u)*6.4);line-height:1.08;letter-spacing:-.03em;color:#fff;
     text-shadow:${ext('#15181B', 8)}}
.sup.sobreVm{text-shadow:${ext('#8A0A17', 8)}}
.chamada{display:inline-block;margin-top:calc(var(--u)*2);border-radius:calc(var(--u)*2);
     padding:calc(var(--u)*1.2) calc(var(--u)*3.4);font-weight:900;
     font-size:calc(var(--u)*10.2);letter-spacing:-.04em;line-height:1.08}
.chamada.vm{background:${VM};color:${PR};box-shadow:0 0 calc(var(--u)*6) rgba(240,22,43,.5)}
.chamada.pr{background:${PR};color:#fff}
.nota{font-weight:700;font-size:calc(var(--u)*3.2);letter-spacing:.06em;margin-top:calc(var(--u)*2);color:#9AA2A8}
.nota.clara{color:rgba(255,255,255,.9)}
#logoF{width:calc(var(--u)*22);display:block;margin:0 auto}
.descobrir{font-weight:900;font-size:calc(var(--u)*11);letter-spacing:-.03em;color:#fff;
     margin-top:calc(var(--u)*2.4);text-shadow:${ext('#15181B', 8)}}
.linhaData{display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*2);margin-top:calc(var(--u)*2.4)}
.linhaData .chip{background:${VM};color:#fff;border-radius:999px;font-weight:900;
     font-size:calc(var(--u)*5.6);padding:calc(var(--u)*.9) calc(var(--u)*2.6)}
.linhaData .d{font-weight:900;font-size:calc(var(--u)*4);letter-spacing:.14em;color:#fff}
#igGrande{font-weight:900;font-size:calc(var(--u)*6.2);color:${VM};margin-top:calc(var(--u)*1.8);
     text-shadow:0 0 calc(var(--u)*3.4) rgba(240,22,43,.45)}

#rodape{position:absolute;left:0;right:0;bottom:0;height:${BARRA}px;z-index:55;background:${PR};
   border-top:3px solid ${VM};display:flex;flex-direction:column;align-items:center;
   justify-content:center;gap:calc(var(--u)*1);opacity:0}
#rodape .l1{display:flex;align-items:center;gap:calc(var(--u)*3)}
#rodape img{height:calc(var(--u)*4.4);display:block}
#rodape .ig{font-weight:900;font-size:calc(var(--u)*4);color:#fff}
#rodape .tel{font-family:"JetBrains Mono",monospace;font-weight:700;font-size:calc(var(--u)*2.9);color:#9AA2A8}
#rodape .pip{width:calc(var(--u)*.9);height:calc(var(--u)*.9);border-radius:50%;background:${VM}}
#rodape .l2{font-size:calc(var(--u)*1.75);color:#6E767C;letter-spacing:.04em;font-weight:600}

#barra{position:absolute;top:-14%;bottom:-14%;width:calc(var(--u)*1.2);left:0;z-index:60;
  background:linear-gradient(180deg,rgba(240,22,43,0),#FF4253 16%,#FFFFFF 50%,#FF4253 84%,rgba(240,22,43,0));
  box-shadow:0 0 calc(var(--u)*8) calc(var(--u)*2.4) rgba(240,22,43,.9);opacity:0}
#poeira{position:absolute;inset:0;z-index:70;pointer-events:none}
#poeira i{position:absolute;border-radius:50%;background:#fff;display:block}
#vinheta{position:absolute;inset:0;z-index:71;pointer-events:none;
  background:radial-gradient(120% 94% at 50% 44%,rgba(0,0,0,0) 54%,rgba(0,0,0,.6) 100%)}
`;

const CORPO = `
  <div class="cena escura" id="s0" style="z-index:10"><div class="box">
    <div class="sup nw">${TX.s1a}</div>
    <div class="sup nw">${TX.s1b}</div>
    <div class="chamada vm nw" id="e1">${TX.s1c}</div>
  </div></div>

  <div class="cena vermelha" id="s1" style="z-index:20"><div class="box">
    <div class="sup sobreVm nw">${TX.s2a}</div>
    <div class="chamada pr nw" id="e2">${TX.s2b}</div>
    <div class="nota clara nw" id="n2">${TX.s2c}</div>
  </div></div>

  <div class="cena escura" id="s2" style="z-index:30"><div class="box">
    <div class="sup nw">${TX.s3a}</div>
    <div class="chamada vm nw" id="e3">${TX.s3b}</div>
    <div class="nota nw" id="n3">${TX.s3c}</div>
  </div></div>

  <div class="cena escura" id="s3" style="z-index:40"><div class="box">
    <img id="logoF" src="${LOGO}" alt="Tecno Cell">
    <div class="descobrir nw" id="e4">${TX.s4a}</div>
    <div class="nw" id="igGrande">${TX.insta}</div>
    <div class="linhaData nw" id="e5">
      <span class="chip">${TX.data}</span><span class="d">${TX.dia}</span>
    </div>
  </div></div>

  <div id="rodape">
    <div class="l1"><img src="${MARCA}" alt=""><span class="pip"></span>
      <span class="ig">${TX.insta}</span><span class="pip"></span>
      <span class="tel">${TX.zap}</span></div>
    <div class="l2">${TX.legal}</div>
  </div>`;

const html = `<!doctype html><meta charset="utf-8"><style>${ESTILO}</style>
<div id="p">${CORPO}<div id="barra"></div><div id="poeira"></div><div id="vinheta"></div></div>
<script>
var ENTRA=${JSON.stringify(ENTRA)}, POEIRA=${JSON.stringify(POEIRA)}, U=${W/100}, VARRE=.55, BARRA=${BARRA};
var $=function(s){return document.querySelector(s);};
function cl(x,a,b){return Math.max(a,Math.min(b,x));}
function seg(t,a,b){return cl((t-a)/(b-a),0,1);}
function outCubic(p){return 1-Math.pow(1-p,3);}
function outQuint(p){return 1-Math.pow(1-p,5);}
function inOut(p){return p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;}

var cx=$('#poeira');
POEIRA.forEach(function(d){var e=document.createElement('i');
  e.style.width=e.style.height=(d.r*U/8)+'px'; cx.appendChild(e); d.el=e;});

var FIT=[1,1,1,1];
function medir(){
  ENTRA.forEach(function(_,i){
    var c=document.getElementById('s'+i), b=c.querySelector('.box');
    FIT[i]=Math.min(1,(1920-150)/b.offsetWidth,(1080-BARRA-80)/b.offsetHeight);
  });
  document.documentElement.dataset.fit=FIT.map(function(v){return v.toFixed(3);}).join(',');
  document.documentElement.dataset.pronto='1';
}
Promise.all([document.fonts.ready,Promise.all(Array.from(document.images).map(function(i){
  return i.complete?Promise.resolve():new Promise(function(r){i.onload=i.onerror=r;});}))]).then(medir);

window.render=function(t){
  POEIRA.forEach(function(d){var y=(d.y-t*d.v*2)%100; if(y<0)y+=100;
    d.el.style.left=d.x+'%'; d.el.style.top=y+'%';
    d.el.style.opacity=(d.o*(.55+.45*Math.sin(t*1.4+d.f))).toFixed(3);});

  var bx=-1;
  ENTRA.forEach(function(ini,i){
    var c=document.getElementById('s'+i), b=c.querySelector('.box');
    var w=inOut(seg(t,ini,ini+VARRE));
    c.style.opacity=t>=ini?1:0;
    c.style.clipPath='inset(0 '+((1-w)*100).toFixed(2)+'% 0 0)';
    if(w>0&&w<1)bx=w;
    var dur=(ENTRA[i+1]||15)-ini;
    b.style.transform='scale('+(FIT[i]*(1+0.04*seg(t,ini,ini+dur))).toFixed(4)+')';
  });
  var bb=$('#barra'); bb.style.opacity=bx>=0?1:0; if(bx>=0)bb.style.left=(bx*100)+'%';

  var r=$('#rodape'), rr=seg(t,1.0,1.5);
  r.style.opacity=rr.toFixed(3);
  r.style.transform='translateY('+((1-outQuint(rr))*BARRA).toFixed(1)+'px)';

  function sobe(el,a,b,dy){var i=seg(t,a,b);
    el.style.opacity=outCubic(i).toFixed(3);
    el.style.transform='translateY('+((1-outQuint(i))*(dy||2.6)*U).toFixed(2)+'px)';}
  sobe($('#e1'),1.30,2.00,3.0);
  sobe($('#e2'),5.30,6.00,3.0);
  sobe($('#n2'),5.85,6.45,2.0);
  sobe($('#e3'),9.20,9.85,3.0);
  sobe($('#n3'),9.75,10.30,2.0);
  sobe($('#e4'),12.15,12.70,2.6);
  sobe($('#igGrande'),12.50,13.05,2.2);
  sobe($('#e5'),12.85,13.40,2.0);
};
window.render(0);
</script>`;

(async () => {
  fs.mkdirSync(SAIDA, { recursive: true });
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => { throw e; });
  await pg.setContent(html, { waitUntil: 'load' });
  await pg.waitForFunction(() => document.documentElement.dataset.pronto === '1', null, { timeout: 15000 });
  console.log('ajuste por cena:', await pg.evaluate(() => document.documentElement.dataset.fit));

  /* uma imagem fixa de cada gancho, pro Instagram e pra vitrine */
  for (let i = 0; i < 4; i++) {
    await pg.evaluate(j => {
      window.render([2.9, 6.9, 10.6, 14.6][j]);
      document.getElementById('barra').style.opacity = 0;
    }, i);
    await pg.screenshot({ path: path.join(SAIDA, `bt-gancho-${i + 1}.png`) });
  }
  console.log('4 imagens -> bt-gancho-1..4.png');

  const total = FPS * DUR;
  for (let i = 0; i < total; i++) {
    await pg.evaluate(t => window.render(t), i / FPS);
    await pg.screenshot({ path: path.join(TMP, `f${String(i).padStart(4, '0')}.png`) });
  }
  await b.close();

  const mp4 = path.join(SAIDA, 'black-tecno-ofertas-15s.mp4');
  execFileSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', path.join(TMP, 'f%04d.png'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', mp4], { stdio: 'ignore' });
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('vídeo ->', path.basename(mp4), (fs.statSync(mp4).size / 1048576).toFixed(2) + ' MB');
  console.log('Pronto.');
})().catch(e => { console.error(e); process.exit(1); });
