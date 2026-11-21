/* ============================================================
   Vídeo 15s do painel (1920x1080) montado com as artes de
   marketing/painel/. Rode gerar-painel.js antes.
   Rode com:  node marketing/gerar-painel-video.js
   ============================================================ */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

/* ===================== EDITE AQUI ===================== */
const LOJA = { fone: "(37) 99148-6624" };
/* arte de cada trecho e quando ela aparece [entra, sai] */
const ROTEIRO = [
  ['contagem-6dias.png',     0.00, 3.60],
  ['oferta-fone-1real.png',  3.60, 7.10],
  ['oferta-troca-usado.png', 7.10, 10.00]
];
const LOGO_EM = 10.00;    /* a partir daqui, a logo expandindo */
const FPS = 30, DUR = 15;
/* ====================================================== */

const AM = '#FFC20E', PR = '#0E1113';
const SAIDA = path.join(__dirname, 'saida');
const TMP = '/tmp/claude-0/-home-user-crediario/1c85eb7c-7399-5dda-9949-ce2eca2e8105/scratchpad/frames-painel';
const b64 = (dir, p) => 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, dir, p)).toString('base64');
const ESCURA = b64('logo', 'tecnocell-escura-solida.png');

const html = `<!doctype html><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:${AM}}
#p{position:relative;width:1920px;height:1080px;overflow:hidden;background:${AM};
   font-family:"Inter Display",sans-serif;--u:19.2px}
.arte{position:absolute;inset:0;opacity:0}
.arte img{width:100%;height:100%;display:block;object-fit:cover}
#fim{position:absolute;inset:0;background:${AM};display:flex;flex-direction:column;
   align-items:center;justify-content:center;padding:calc(var(--u)*4);opacity:0}
#fimBox{display:flex;flex-direction:column;align-items:center}
#fimBox img{width:calc(var(--u)*62);display:block}
#pill{display:flex;align-items:center;gap:calc(var(--u)*1.6);margin-top:calc(var(--u)*3.4);
   background:${PR};color:#fff;border-radius:999px;padding:calc(var(--u)*1.5) calc(var(--u)*3.6);
   font-family:"JetBrains Mono",monospace;font-weight:800;font-size:calc(var(--u)*4.6);opacity:0}
#pill svg{width:calc(var(--u)*4.6);height:calc(var(--u)*4.6);fill:#fff}
#rodape{position:absolute;left:0;right:0;bottom:calc(var(--u)*3);text-align:center;
   font-weight:700;font-size:calc(var(--u)*2.7);letter-spacing:.1em;color:#7A5D05;opacity:0}
</style>
<div id="p">
  ${ROTEIRO.map((r, i) => `<div class="arte" id="a${i}"><img src="${b64('painel', r[0])}"></div>`).join('')}
  <div id="fim">
    <div id="fimBox">
      <img src="${ESCURA}">
      <div id="pill">
        <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        <span>${LOJA.fone}</span>
      </div>
    </div>
    <div id="rodape">CARTÃO · PIX · CREDIÁRIO PRÓPRIO</div>
  </div>
</div>
<script>
var R = ${JSON.stringify(ROTEIRO)}, LOGO_EM = ${LOGO_EM}, FIM = ${DUR};
function cl(x,a,b){ return Math.max(a, Math.min(b, x)); }
function seg(t,a,b){ return cl((t-a)/(b-a), 0, 1); }
function outCubic(p){ return 1 - Math.pow(1-p, 3); }

window.render = function(t){
  /* artes: corte suave de 0,3s e um zoom bem lento, pra não borrar no painel */
  R.forEach(function(r, i){
    var el = document.getElementById('a' + i);
    var o = seg(t, r[1], r[1] + 0.30) * (1 - seg(t, r[2], r[2] + 0.30));
    el.style.opacity = o.toFixed(4);
    el.style.transform = 'scale(' + (1 + 0.025 * seg(t, r[1], r[2])).toFixed(4) + ')';
  });

  /* últimos 5s: a logo expandindo */
  var a = seg(t, LOGO_EM, LOGO_EM + 2.40);
  var b = seg(t, LOGO_EM + 2.40, FIM);
  document.getElementById('fim').style.opacity = seg(t, LOGO_EM, LOGO_EM + 0.35).toFixed(4);
  document.getElementById('fimBox').style.transform =
    'scale(' + (0.36 + outCubic(a) * 0.64 + b * 0.05).toFixed(4) + ')';
  document.getElementById('pill').style.opacity = seg(t, LOGO_EM + 1.5, LOGO_EM + 2.1).toFixed(4);
  document.getElementById('rodape').style.opacity = seg(t, LOGO_EM + 2.2, LOGO_EM + 2.8).toFixed(4);
};
window.render(0);
</script>`;

(async () => {
  fs.mkdirSync(SAIDA, { recursive: true });
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => { throw e; });
  await pg.setContent(html, { waitUntil: 'load' });
  await pg.waitForTimeout(500);
  const total = FPS * DUR;
  for (let i = 0; i < total; i++) {
    await pg.evaluate(t => window.render(t), i / FPS);
    await pg.screenshot({ path: path.join(TMP, `f${String(i).padStart(4, '0')}.png`) });
  }
  await b.close();
  const mp4 = path.join(SAIDA, 'painel-blackfriday-15s.mp4');
  execFileSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', path.join(TMP, 'f%04d.png'),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', mp4], { stdio: 'ignore' });
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('vídeo ->', path.basename(mp4), (fs.statSync(mp4).size / 1048576).toFixed(2) + ' MB');
  console.log('Pronto.');
})().catch(e => { console.error(e); process.exit(1); });
