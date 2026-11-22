/* ============================================================
   TEASER EM VÍDEO — Black Tecno · 25.11
   1920x1080 · 15,000s · 30fps · sem áudio · sem oferta
   Rode com:  node marketing/gerar-teaser-video.js
   ============================================================ */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

/* ===================== EDITE AQUI ===================== */
const TX = {
  selo:  'BLACK TECNO',
  s1a:   'NÃO COMPRE NADA',
  s1b:   'ATÉ QUARTA.',
  s2a:   'AQUI NINGUÉM',
  s2b:   'GANHA DESCONTO.',
  s2c:   'GANHA MAIS.',
  data:  '25.11',
  dia:   'QUARTA-FEIRA',
  segue: 'SEGUE PRA VER A OFERTA',
  insta: '@tecno_cell17',
  zap:   '(37) 99148-6624'
};
/* quando cada cena entra; a varredura dura 0,55s a partir daí */
const ENTRA = [0.00, 4.00, 7.40, 11.00];
const FPS = 30, DUR = 15, W = 1920, H = 1080;
/* ====================================================== */

const VM = '#F0162B', VM_ESC = '#6E0612';
const SAIDA = path.join(__dirname, 'saida');
const TMP = '/tmp/claude-0/-home-user-crediario/1c85eb7c-7399-5dda-9949-ce2eca2e8105/scratchpad/frames-teaser';
const LOGO = 'data:image/png;base64,' +
  fs.readFileSync(path.join(__dirname, 'logo', 'tecnocell-completa.png')).toString('base64');

const ext = (c, n = 11) => Array.from({ length: n }, (_, i) => `${i + 1}px ${i + 1}px 0 ${c}`).join(',');

let sem = 11;
const rnd = () => (sem = (sem * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const POEIRA = Array.from({ length: 44 }, () => ({
  x: rnd() * 100, y: rnd() * 100, r: 1 + rnd() * 2.2,
  v: .25 + rnd() * .5, f: rnd() * 6.283, o: .10 + rnd() * .24
}));

const html = `<!doctype html><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000}
#p{position:relative;width:${W}px;height:${H}px;background:#000;overflow:hidden;
   font-family:"Inter Display","Inter",sans-serif;--u:${W / 100}px}

.cena{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0}
.cena .box{text-align:center;transform-origin:center}
.escura{background:radial-gradient(120% 92% at 50% 12%,#191C1F 0%,#0A0C0D 58%,#000 100%)}
.vermelha{background:radial-gradient(130% 108% at 50% 16%,#FF2A3C 0%,${VM} 46%,#B50D1E 100%)}
.nw{white-space:nowrap}

.selo{font-weight:900;font-size:calc(var(--u)*3.2);letter-spacing:.32em;color:${VM};
      margin-bottom:calc(var(--u)*2)}
.g{font-weight:900;font-size:calc(var(--u)*10);line-height:1.02;letter-spacing:-.04em;color:#fff;
   text-shadow:${ext('#15181B')}}
.g.vm{color:${VM};text-shadow:${ext(VM_ESC)}}
.m{font-weight:900;font-size:calc(var(--u)*8.4);line-height:1.05;letter-spacing:-.035em;color:#fff;
   text-shadow:${ext('#15181B', 9)}}
#s2c{display:inline-block;margin-top:calc(var(--u)*2.2);background:${VM};color:#0A0C0D;
   border-radius:calc(var(--u)*2);padding:calc(var(--u)*1.1) calc(var(--u)*3.2);
   font-weight:900;font-size:calc(var(--u)*9.4);letter-spacing:-.035em;
   box-shadow:0 0 calc(var(--u)*6) rgba(240,22,43,.5)}

.data{font-weight:900;font-size:calc(var(--u)*30);line-height:.86;letter-spacing:-.06em;color:#fff;
   text-shadow:${ext('#8A0A17', 11)}}
.dia{font-weight:900;font-size:calc(var(--u)*7);letter-spacing:.17em;color:#fff;margin-top:calc(var(--u)*1.6)}

#logoT{width:calc(var(--u)*30);display:block;margin:0 auto}
#segue{font-weight:800;font-size:calc(var(--u)*2.8);letter-spacing:.24em;color:#9AA2A8;margin-top:calc(var(--u)*2.6)}
#insta{font-weight:900;font-size:calc(var(--u)*7.2);letter-spacing:.01em;color:#fff;margin-top:calc(var(--u)*.8)}
#dataFim{font-weight:900;font-size:calc(var(--u)*4);letter-spacing:.06em;color:${VM};
   margin-top:calc(var(--u)*1.6);text-shadow:0 0 calc(var(--u)*3.4) rgba(240,22,43,.5)}
#zapFim{font-family:"JetBrains Mono",monospace;font-weight:700;font-size:calc(var(--u)*3);
   color:#C2C9CE;margin-top:calc(var(--u)*1.4)}

#barra{position:absolute;top:-14%;bottom:-14%;width:calc(var(--u)*1.2);left:0;z-index:60;
  background:linear-gradient(180deg,rgba(240,22,43,0),#FF4253 16%,#FFFFFF 50%,#FF4253 84%,rgba(240,22,43,0));
  box-shadow:0 0 calc(var(--u)*8) calc(var(--u)*2.4) rgba(240,22,43,.9);opacity:0}
#poeira{position:absolute;inset:0;z-index:70;pointer-events:none}
#poeira i{position:absolute;border-radius:50%;background:#fff;display:block}
#vinheta{position:absolute;inset:0;z-index:71;pointer-events:none;
  background:radial-gradient(120% 94% at 50% 47%,rgba(0,0,0,0) 54%,rgba(0,0,0,.62) 100%)}
</style>
<div id="p">

  <div class="cena escura" id="s0" style="z-index:10"><div class="box">
    <div class="selo nw">${TX.selo}</div>
    <div class="g nw" id="s1a">${TX.s1a}</div>
    <div class="g vm nw" id="s1b">${TX.s1b}</div>
  </div></div>

  <div class="cena escura" id="s1" style="z-index:20"><div class="box">
    <div class="m nw">${TX.s2a}</div>
    <div class="m nw">${TX.s2b}</div>
    <div class="nw" id="s2c">${TX.s2c}</div>
  </div></div>

  <div class="cena vermelha" id="s2" style="z-index:30"><div class="box">
    <div class="data nw" id="s3a">${TX.data}</div>
    <div class="dia nw" id="s3b">${TX.dia}</div>
  </div></div>

  <div class="cena escura" id="s3" style="z-index:40"><div class="box">
    <img id="logoT" src="${LOGO}" alt="Tecno Cell">
    <div class="nw" id="segue">${TX.segue}</div>
    <div class="nw" id="insta">${TX.insta}</div>
    <div class="nw" id="dataFim">${TX.data} · ${TX.dia}</div>
    <div class="nw" id="zapFim">${TX.zap}</div>
  </div></div>

  <div id="barra"></div>
  <div id="poeira"></div>
  <div id="vinheta"></div>
</div>
<script>
var ENTRA = ${JSON.stringify(ENTRA)}, POEIRA = ${JSON.stringify(POEIRA)}, U = ${W / 100}, VARRE = 0.55;
var $ = function(s){ return document.querySelector(s); };
function cl(x,a,b){ return Math.max(a, Math.min(b, x)); }
function seg(t,a,b){ return cl((t-a)/(b-a), 0, 1); }
function outCubic(p){ return 1 - Math.pow(1-p,3); }
function outQuint(p){ return 1 - Math.pow(1-p,5); }
function inOut(p){ return p<.5 ? 4*p*p*p : 1-Math.pow(-2*p+2,3)/2; }

var cx = document.getElementById('poeira');
POEIRA.forEach(function(d){
  var e = document.createElement('i');
  e.style.width = e.style.height = (d.r*U/8) + 'px';
  cx.appendChild(e); d.el = e;
});

/* cada cena encolhe sozinha se não couber — só depois de fontes e imagens prontas */
var FIT = [1,1,1,1];
function medir(){
  ENTRA.forEach(function(_, i){
    var c = document.getElementById('s'+i), bx = c.querySelector('.box');
    var k = Math.min(1, (1920 - 150) / bx.offsetWidth, (1080 - 110) / bx.offsetHeight);
    FIT[i] = k;
  });
  document.documentElement.dataset.fit = FIT.map(function(v){ return v.toFixed(3); }).join(',');
  document.documentElement.dataset.pronto = '1';
}
Promise.all([
  document.fonts.ready,
  Promise.all(Array.from(document.images).map(function(i){
    return i.complete ? Promise.resolve() : new Promise(function(r){ i.onload = i.onerror = r; });
  }))
]).then(medir);

window.render = function(t){
  POEIRA.forEach(function(d){
    var y = (d.y - t*d.v*2) % 100; if (y < 0) y += 100;
    d.el.style.left = d.x + '%'; d.el.style.top = y + '%';
    d.el.style.opacity = (d.o * (.55 + .45*Math.sin(t*1.4 + d.f))).toFixed(3);
  });

  /* ---- a varredura vermelha revela cada cena, e serve de transição ---- */
  var barraX = -1;
  ENTRA.forEach(function(ini, i){
    var c = document.getElementById('s'+i), bx = c.querySelector('.box');
    var w = inOut(seg(t, ini, ini + VARRE));
    c.style.opacity = t >= ini ? 1 : 0;
    c.style.clipPath = 'inset(0 ' + ((1-w)*100).toFixed(2) + '% 0 0)';
    if (w > 0 && w < 1) barraX = w;
    /* aproximação lenta dentro de cada cena */
    var dur = (ENTRA[i+1] || 15) - ini;
    bx.style.transform = 'scale(' + (FIT[i] * (1 + 0.045 * seg(t, ini, ini + dur))).toFixed(4) + ')';
  });
  var b = $('#barra');
  b.style.opacity = barraX >= 0 ? 1 : 0;
  if (barraX >= 0) b.style.left = (barraX * 100) + '%';

  /* ---- entradas dentro das cenas ---- */
  function sobe(el, a, b, dy){
    var i = seg(t, a, b);
    el.style.opacity = outCubic(i).toFixed(3);
    el.style.transform = 'translateY(' + ((1-outQuint(i)) * (dy||3) * U).toFixed(2) + 'px)';
  }
  sobe($('#s1b'), 1.45, 2.15, 3.4);
  sobe($('#s2c'), 5.55, 6.25, 3.0);
  sobe($('#s3b'), 8.35, 8.95, 2.4);
  sobe($('#segue'),  11.75, 12.25, 2.0);
  sobe($('#insta'),  11.95, 12.55, 2.6);
  sobe($('#dataFim'),12.45, 13.00, 2.0);
  sobe($('#zapFim'), 12.80, 13.30, 1.8);
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

  const total = FPS * DUR;
  for (let i = 0; i < total; i++) {
    await pg.evaluate(t => window.render(t), i / FPS);
    await pg.screenshot({ path: path.join(TMP, `f${String(i).padStart(4, '0')}.png`) });
  }
  await b.close();

  const mp4 = path.join(SAIDA, 'teaser-black-tecno-15s.mp4');
  execFileSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', path.join(TMP, 'f%04d.png'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', mp4], { stdio: 'ignore' });
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('vídeo ->', path.basename(mp4), (fs.statSync(mp4).size / 1048576).toFixed(2) + ' MB');
  console.log('Pronto.');
})().catch(e => { console.error(e); process.exit(1); });
