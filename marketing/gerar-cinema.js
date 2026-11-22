/* ============================================================
   BLACK FRIDAY TECNO CELL 2026 — painel de LED
   1920x1080 · 15,000s · 30fps · sem áudio
   Rode com:  node marketing/gerar-cinema.js
   ============================================================ */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

/* ===================== EDITE AQUI ===================== */
const T = {
  cena2:    'A BLACK COMEÇA',
  cena2_hl: 'ANTES.',
  dia:      '25.11',
  diaSemana:'QUARTA-FEIRA',
  linha:    'CELULARES · TROCAS · ACESSÓRIOS',
  selo:     'BLACK FRIDAY ANTECIPADA',
  dataFim:  '25.11 · QUARTA-FEIRA',
  insta:    '@tecno_cell17',
  zap:      '(37) 99148-6624'
};
const FPS = 30, DUR = 15, W = 1920, H = 1080;
/* ====================================================== */

const VM = '#F0162B';       /* vermelho que não estoura no LED */
const VM_ESC = '#6E0612';   /* extrusão do vermelho */
const SAIDA = path.join(__dirname, 'saida');
const TMP = '/tmp/claude-0/-home-user-crediario/1c85eb7c-7399-5dda-9949-ce2eca2e8105/scratchpad/frames-cinema';
const LOGO = 'data:image/png;base64,' +
  fs.readFileSync(path.join(__dirname, 'logo', 'tecnocell-completa.png')).toString('base64');

/* extrusão 3D em camadas */
const extrude = (cor, n = 14) =>
  Array.from({ length: n }, (_, i) => `${i + 1}px ${i + 1}px 0 ${cor}`).join(',');

/* poeira: posições fixas, pra todo render sair igual */
let semente = 7;
const rnd = () => (semente = (semente * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const POEIRA = Array.from({ length: 46 }, () => ({
  x: rnd() * 100, y: rnd() * 100, r: 1 + rnd() * 2.4,
  v: .25 + rnd() * .55, f: rnd() * 6.283, o: .10 + rnd() * .26
}));

const html = `<!doctype html><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000}
#p{position:relative;width:${W}px;height:${H}px;background:#000;overflow:hidden;
   font-family:"Inter Display","Inter",sans-serif;--u:${W / 100}px}

.cena{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
      justify-content:center;opacity:0;will-change:transform,opacity}
.nw{white-space:nowrap}

/* ---------- cena 1 ---------- */
#c1 .wrap{position:relative;text-align:center}
.bf{font-weight:900;font-size:calc(var(--u)*17);line-height:.92;letter-spacing:-.045em}
#bfBlack{color:#fff;text-shadow:${extrude('#1C2024')}}
#bfFriday{color:${VM};text-shadow:${extrude(VM_ESC)}}
#brilho{position:absolute;inset:-12% -6%;pointer-events:none;
  background:linear-gradient(104deg,rgba(255,255,255,0) 42%,rgba(255,255,255,.30) 50%,rgba(255,255,255,0) 58%);
  mix-blend-mode:overlay;opacity:0}
#barra{position:absolute;top:-16%;bottom:-16%;width:calc(var(--u)*1.1);left:0;
  background:linear-gradient(180deg,rgba(240,22,43,0),#FF3A4C 18%,#FFFFFF 50%,#FF3A4C 82%,rgba(240,22,43,0));
  box-shadow:0 0 calc(var(--u)*7) calc(var(--u)*2.2) rgba(240,22,43,.85);opacity:0}

/* ---------- cena 2 ---------- */
.c2l{font-weight:900;font-size:calc(var(--u)*9.8);line-height:1.02;letter-spacing:-.035em;color:#fff;
     text-shadow:${extrude('#15181B', 9)}}
#c2b{color:${VM};text-shadow:${extrude(VM_ESC, 9)}}
#c2rule{height:calc(var(--u)*.75);width:0;background:${VM};border-radius:999px;
  box-shadow:0 0 calc(var(--u)*3.4) rgba(240,22,43,.9);margin-top:calc(var(--u)*2.4)}

/* ---------- cena 3 — vermelho cheio, a tela mais acesa ---------- */
#c3{background:radial-gradient(130% 110% at 50% 18%,#FF2A3C 0%,${VM} 46%,#B50D1E 100%)}
#c3mask{position:absolute;inset:0;background:#000;transform-origin:center}
.dia{font-weight:900;font-size:calc(var(--u)*29);line-height:.86;letter-spacing:-.06em;color:#fff;
     text-shadow:${extrude('#8A0A17', 11)}}
.semana{font-weight:900;font-size:calc(var(--u)*7.2);letter-spacing:.16em;color:#fff;margin-top:calc(var(--u)*1.4)}
.linha3{font-weight:800;font-size:calc(var(--u)*3.3);letter-spacing:.17em;color:rgba(255,255,255,.9);
     margin-top:calc(var(--u)*3.2);padding-top:calc(var(--u)*2.2);border-top:2px solid rgba(255,255,255,.4)}

/* ---------- cena 4 ---------- */
#logoBox{position:relative;width:calc(var(--u)*38);flex:0 0 auto}
#logoBox img{width:100%;display:block}
#logoLuz{position:absolute;inset:-10% -14%;pointer-events:none;
  background:linear-gradient(104deg,rgba(255,255,255,0) 40%,rgba(255,255,255,.55) 50%,rgba(255,255,255,0) 60%);
  mix-blend-mode:overlay;opacity:0}
.selo{font-weight:900;font-size:calc(var(--u)*4.2);letter-spacing:.19em;color:#fff;margin-top:calc(var(--u)*2.8)}
.dataFim{font-weight:900;font-size:calc(var(--u)*5.8);letter-spacing:.04em;color:${VM};
  margin-top:calc(var(--u)*1.2);text-shadow:0 0 calc(var(--u)*4) rgba(240,22,43,.55)}
.contatos{display:flex;gap:calc(var(--u)*4);margin-top:calc(var(--u)*2.8);
  font-weight:700;font-size:calc(var(--u)*2.9);letter-spacing:.06em;color:#C9D0D5}
.contatos b{color:#fff;font-weight:800}
#linhaVm{height:calc(var(--u)*.5);width:calc(var(--u)*26);background:${VM};border-radius:999px;
  margin-top:calc(var(--u)*2.4);box-shadow:0 0 calc(var(--u)*3) rgba(240,22,43,.8);opacity:0}

/* ---------- atmosfera ---------- */
#poeira{position:absolute;inset:0;pointer-events:none}
#poeira i{position:absolute;border-radius:50%;background:#fff;display:block}
#vinheta{position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(118% 92% at 50% 48%,rgba(0,0,0,0) 52%,rgba(0,0,0,.72) 100%)}
#flash{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none}
</style>
<div id="p">

  <div class="cena" id="c1"><div class="wrap">
    <div class="bf nw" id="bfBlack">BLACK</div>
    <div class="bf nw" id="bfFriday">FRIDAY</div>
    <div id="brilho"></div>
  </div><div id="barra"></div></div>

  <div class="cena" id="c2">
    <div class="c2l nw" id="c2a">${T.cena2}</div>
    <div class="c2l nw" id="c2b">${T.cena2_hl}</div>
    <div id="c2rule"></div>
  </div>

  <div class="cena" id="c3">
    <div class="dia nw" id="c3dia">${T.dia}</div>
    <div class="semana nw" id="c3sem">${T.diaSemana}</div>
    <div class="linha3 nw" id="c3lin">${T.linha}</div>
  </div>

  <div class="cena" id="c4">
    <div id="logoBox"><img src="${LOGO}" alt="Tecno Cell"><div id="logoLuz"></div></div>
    <div id="linhaVm"></div>
    <div class="selo nw" id="c4selo">${T.selo}</div>
    <div class="dataFim nw" id="c4data">${T.dataFim}</div>
    <div class="contatos nw" id="c4cont"><span>Instagram <b>${T.insta}</b></span><span>WhatsApp <b>${T.zap}</b></span></div>
  </div>

  <div id="poeira"></div>
  <div id="vinheta"></div>
  <div id="flash"></div>
</div>
<script>
var U = ${W / 100}, POEIRA = ${JSON.stringify(POEIRA)};
var $ = function(s){ return document.querySelector(s); };
function cl(x,a,b){ return Math.max(a, Math.min(b, x)); }
function seg(t,a,b){ return cl((t-a)/(b-a), 0, 1); }
function outCubic(p){ return 1 - Math.pow(1-p,3); }
function outQuint(p){ return 1 - Math.pow(1-p,5); }
function inOut(p){ return p<.5 ? 4*p*p*p : 1-Math.pow(-2*p+2,3)/2; }

/* poeira */
var box = $('#poeira');
POEIRA.forEach(function(d){
  var e = document.createElement('i');
  e.style.width = e.style.height = d.r*U/8 + 'px';
  box.appendChild(e); d.el = e;
});

/* entra subindo, sai subindo — sem quique */
function bloco(el, t, tIn, tOut, dy){
  var i = seg(t, tIn, tIn+0.55), o = seg(t, tOut, tOut+0.32);
  el.style.opacity = (outCubic(i) * (1-o)).toFixed(4);
  var y = (1-outQuint(i)) * (dy||3.2) * U - o * 2.2 * U;
  el.style.transform = 'translateY(' + y.toFixed(2) + 'px)';
  return i > 0 && o < 1;
}

window.render = function(t){
  /* ---------- poeira, sempre ---------- */
  POEIRA.forEach(function(d){
    var y = (d.y - t*d.v*2.1) % 100; if (y < 0) y += 100;
    d.el.style.left = d.x + '%';
    d.el.style.top  = y + '%';
    d.el.style.opacity = (d.o * (0.55 + 0.45*Math.sin(t*1.5 + d.f))).toFixed(3);
  });

  /* ---------- CENA 1 · 0,00 – 3,25 ---------- */
  var c1 = $('#c1'), v1 = t < 3.45;
  c1.style.opacity = (seg(t,0.10,0.30) * (1 - seg(t,3.00,3.30))).toFixed(4);
  c1.style.transform = 'scale(' + (1 + 0.055*seg(t,0.10,3.30) + 0.03*seg(t,3.00,3.30)).toFixed(4) + ')';
  if (v1) {
    /* a luz vermelha atravessa e revela o texto atrás dela */
    var s = seg(t, 0.18, 1.15), sp = inOut(s);
    $('#barra').style.opacity = (seg(t,0.18,0.26) * (1 - seg(t,1.00,1.20))).toFixed(3);
    $('#barra').style.left = (sp*100) + '%';
    var corte = 'inset(0 ' + ((1-sp)*100).toFixed(2) + '% 0 0)';
    $('#bfBlack').style.clipPath = corte;
    $('#bfFriday').style.clipPath = 'inset(0 ' + ((1-cl((sp-0.06)/0.94,0,1))*100).toFixed(2) + '% 0 0)';
    /* brilho metálico passando depois */
    var g = seg(t, 1.25, 2.45);
    $('#brilho').style.opacity = (g>0 && g<1 ? 1 : 0);
    $('#brilho').style.transform = 'translateX(' + (-60 + g*120) + '%)';
  }

  /* ---------- CENA 2 · 3,30 – 6,35 ---------- */
  var c2 = $('#c2');
  c2.style.opacity = (seg(t,3.30,3.60) * (1 - seg(t,6.05,6.35))).toFixed(4);
  c2.style.transform = 'scale(' + (1 + 0.04*seg(t,3.30,6.35)).toFixed(4) + ')';
  bloco($('#c2a'), t, 3.32, 6.05, 3.0);
  bloco($('#c2b'), t, 3.58, 6.05, 3.4);
  $('#c2rule').style.width = (outQuint(seg(t,4.00,4.70)) * 34 * U).toFixed(1) + 'px';

  /* ---------- CENA 3 · 6,45 – 10,25 · vermelho cheio ---------- */
  var c3 = $('#c3');
  c3.style.opacity = (seg(t,6.52,6.72) * (1 - seg(t,9.98,10.25))).toFixed(4);
  c3.style.transform = 'scale(' + (1 + 0.035*seg(t,6.52,10.25)).toFixed(4) + ')';
  bloco($('#c3dia'), t, 6.62, 9.95, 3.6);
  bloco($('#c3sem'), t, 7.05, 9.95, 2.4);
  bloco($('#c3lin'), t, 7.55, 9.95, 2.0);

  /* ---------- CENA 4 · 10,30 – 15,00 ---------- */
  var c4 = $('#c4');
  c4.style.opacity = seg(t,10.32,10.70).toFixed(4);
  c4.style.transform = 'scale(' + (0.955 + 0.045*outQuint(seg(t,10.32,11.60)) + 0.016*seg(t,11.60,15.0)).toFixed(4) + ')';
  var lz = seg(t, 10.80, 12.10);
  $('#logoLuz').style.opacity = (lz>0 && lz<1 ? 1 : 0);
  $('#logoLuz').style.transform = 'translateX(' + (-62 + lz*124) + '%)';
  $('#linhaVm').style.opacity = seg(t,11.10,11.45).toFixed(3);
  bloco($('#c4selo'), t, 11.30, 99, 2.2);
  bloco($('#c4data'), t, 11.70, 99, 2.4);
  bloco($('#c4cont'), t, 12.25, 99, 1.8);

  /* escurecida curta entre a cena 2 e a 3, como pede o roteiro */
  $('#flash').style.opacity = (seg(t,6.33,6.42) * (1 - seg(t,6.46,6.58))).toFixed(3);
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
  await pg.waitForTimeout(500);

  const check = await pg.evaluate(() => {
    const larg = [], alt = [];
    document.querySelectorAll('.cena').forEach(c => {
      c.querySelectorAll('.nw').forEach(el => {
        if (el.scrollWidth > 1920 - 120) larg.push(c.id + '/' + el.id + ' ' + el.scrollWidth + 'px');
      });
      let h = 0;
      Array.from(c.children).forEach(el => {
        const cs = getComputedStyle(el);
        h += el.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
      });
      alt.push(c.id + ' ' + Math.round(h) + 'px');
    });
    return { larg, alt };
  });
  console.log('altura do conteudo por cena (limite 1080):', check.alt.join(' · '));
  if (check.larg.length) console.log('⚠ texto perto da borda:', check.larg.join(', '));
  else console.log('larguras ok, todas com folga');

  const total = FPS * DUR;
  for (let i = 0; i < total; i++) {
    await pg.evaluate(t => window.render(t), i / FPS);
    await pg.screenshot({ path: path.join(TMP, `f${String(i).padStart(4, '0')}.png`) });
  }
  await b.close();

  const mp4 = path.join(SAIDA, 'painel-blackfriday-cinema-15s.mp4');
  execFileSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', path.join(TMP, 'f%04d.png'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', mp4], { stdio: 'ignore' });
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('vídeo ->', path.basename(mp4), (fs.statSync(mp4).size / 1048576).toFixed(2) + ' MB');
  console.log('Pronto.');
})().catch(e => { console.error(e); process.exit(1); });
