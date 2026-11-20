/* ============================================================
   Vídeo de Black Friday para o PAINEL DE LED da loja
   Rode com:  node marketing/gerar-led.js
   Saída:     marketing/saida/led-blackfriday-16x9.mp4

   15 segundos: 10s de mensagem + 5s de logo com o WhatsApp.

   Desenhado para LED, que é diferente de celular:
   - fundo preto puro (no LED, preto = pixel apagado)
   - letra gigante e pesada, nada fino
   - pouca palavra por tela
   - sem degradê sutil no fundo (vira mancha no painel)
   - sem animação rápida (painel borra movimento)
   ============================================================ */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

/* ===================== EDITE AQUI ===================== */

const TEXTO = {
  linha1:  "CELULAR NOVO",           /* tela 2 */
  linha2:  "SEM CARTÃO",
  prazoAntes:  "ATÉ",                /* tela 3 */
  prazo:       "24X",                /*   o número gigante */
  prazoDepois: "NO BOLETO",
  chamada:     "QUEM APROVA É A LOJA",
  fone:        "(37) 99148-6624"     /* tela 4, no botão verde */
};

/* Tempos de cada tela, em segundos: [entra, sai] */
const TEMPOS = {
  L1: [0.00, 3.05],   /* BLACK FRIDAY            */
  L2: [3.40, 6.35],   /* celular novo sem cartão */
  L3: [6.70, 9.60],   /* até 24x no boleto       */
  L4: 10.00           /* logo + zap, até o fim   */
};

const FPS = 30;
const DUR = 15;

/* Renderizo grande e o player do painel reduz pra resolução real dele.
   Pra outra proporção (faixa 4:1, por exemplo), acrescente aqui. */
const FORMATOS = {
  '16x9': { w: 1920, h: 1080 }
};

/* ===================== FIM DA EDIÇÃO ===================== */

const SAIDA = path.join(__dirname, 'saida');
const TMP = '/tmp/claude-0/-home-user-crediario/1c85eb7c-7399-5dda-9949-ce2eca2e8105/scratchpad/frames-led';

function pegarLogo(arq) {
  const f = path.join(__dirname, 'logo', arq);
  if (!fs.existsSync(f)) throw new Error('Logo não encontrada: ' + f);
  return 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
}
const LOGO = pegarLogo('tecnocell-completa.png');

/* telefone clássico: entende-se de longe e não depende de fonte de emoji */
const ICONE_FONE = 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 '
  + '1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5'
  + 'c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z';

function cenaHTML(W, H) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000}
#stage{position:relative;width:${W}px;height:${H}px;background:#000;overflow:hidden;
  font-family:"Inter Display","Inter",sans-serif;color:#fff;--u:${W / 100}px}
.layer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  padding:calc(var(--u)*4);opacity:0}
.box{width:max-content;text-align:center}
.box > *{white-space:nowrap}

/* metal claro: no LED o cinza escuro apaga, então o degradê
   nunca desce abaixo de ~70% de brilho */
.metal{background:linear-gradient(100deg,#AEB6BC 0%,#FFFFFF 34%,#FFFFFF 52%,#C3CACF 76%,#9FA7AD 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent}

.bf{font-weight:900;font-size:calc(var(--u)*19);line-height:.88;letter-spacing:-.035em}
.sub{font-weight:800;font-size:calc(var(--u)*4.2);letter-spacing:.3em;color:#FFC43D;margin-top:calc(var(--u)*3)}

.g1{font-weight:900;font-size:calc(var(--u)*12);line-height:1.0;letter-spacing:-.03em}
.g2{font-weight:900;font-size:calc(var(--u)*12);line-height:1.0;letter-spacing:-.03em;color:#FFC43D}

.pAntes{font-weight:800;font-size:calc(var(--u)*5);letter-spacing:.24em;color:#D7DDE1}
.pNum{font-weight:900;font-size:calc(var(--u)*23);line-height:.9;letter-spacing:-.05em;color:#FFC43D}
.pDepois{font-weight:900;font-size:calc(var(--u)*8);letter-spacing:-.02em;margin-top:calc(var(--u)*.5)}
.pChamada{font-weight:800;font-size:calc(var(--u)*4.4);letter-spacing:.12em;color:#D7DDE1;margin-top:calc(var(--u)*3.2)}

#logoFinal{height:calc(var(--u)*28);width:auto;display:block;margin:0 auto;
  filter:brightness(1.18) contrast(1.06)}
#zap{display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*2);
  margin-top:calc(var(--u)*4.5);background:#25D366;color:#06250F;
  padding:calc(var(--u)*1.7) calc(var(--u)*4.5);border-radius:999px;
  font-family:"JetBrains Mono",monospace;font-weight:800;
  font-size:calc(var(--u)*7);letter-spacing:-.01em;line-height:1.1}
#zapIc{width:calc(var(--u)*7);height:calc(var(--u)*7);fill:#06250F;flex:0 0 auto;display:block}
</style></head><body>
<div id="stage">

  <div class="layer" id="L1"><div class="box">
    <div class="bf metal">BLACK</div>
    <div class="bf metal">FRIDAY</div>
    <div class="sub">TECNO CELL</div>
  </div></div>

  <div class="layer" id="L2"><div class="box">
    <div class="g1 metal">${TEXTO.linha1}</div>
    <div class="g2">${TEXTO.linha2}</div>
  </div></div>

  <div class="layer" id="L3"><div class="box">
    <div class="pAntes">${TEXTO.prazoAntes}</div>
    <div class="pNum">${TEXTO.prazo}</div>
    <div class="pDepois metal">${TEXTO.prazoDepois}</div>
    <div class="pChamada">${TEXTO.chamada}</div>
  </div></div>

  <div class="layer" id="L4"><div class="box">
    <img id="logoFinal" src="${LOGO}" alt="Tecno Cell">
    <div id="zap">
      <svg id="zapIc" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONE_FONE}"/></svg>
      <span>${TEXTO.fone}</span>
    </div>
  </div></div>

</div>
<script>
var T = ${JSON.stringify(TEMPOS)};
var $ = function(s){ return document.querySelector(s); };
function cl(x,a,b){ return Math.max(a, Math.min(b, x)); }
function seg(t,a,b){ return cl((t-a)/(b-a), 0, 1); }
function outCubic(p){ return 1 - Math.pow(1-p, 3); }

/* cada tela encolhe sozinha se não couber no formato do painel */
var FIT = {};
Array.prototype.forEach.call(document.querySelectorAll('.layer'), function(L){
  var box = L.querySelector('.box'), cs = getComputedStyle(L);
  var aW = L.clientWidth  - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  var aH = L.clientHeight - parseFloat(cs.paddingTop)  - parseFloat(cs.paddingBottom);
  FIT[L.id] = Math.min(1, aW / box.offsetWidth, aH / box.offsetHeight);
});

/* entra e sai só com fade + leve escala: painel de LED borra movimento rápido */
function tela(id, t){
  var L = $('#' + id), box = L.querySelector('.box');
  var i = seg(t, T[id][0], T[id][0] + 0.45), o = seg(t, T[id][1], T[id][1] + 0.35);
  L.style.opacity = (i * (1 - o)).toFixed(4);
  var s = FIT[id] * (0.92 + 0.08 * outCubic(i)) * (1 - 0.05 * o);
  box.style.transform = 'scale(' + s.toFixed(4) + ')';
}

window.render = function(t){
  tela('L1', t);
  tela('L2', t);
  tela('L3', t);

  /* ---- últimos 5s: a logo expandindo + o zap ---- */
  var ini = T.L4, fim = ${DUR};
  var L4 = $('#L4'), box = L4.querySelector('.box');
  var a = seg(t, ini, ini + 2.40);          /* expansão principal */
  var b = seg(t, ini + 2.40, fim);          /* segue crescendo devagar até o fim */
  L4.style.opacity = seg(t, ini, ini + 0.40).toFixed(4);
  var s = FIT.L4 * (0.32 + outCubic(a) * 0.68 + b * 0.04);
  box.style.transform = 'scale(' + s.toFixed(4) + ')';
  $('#zap').style.opacity = seg(t, ini + 1.60, ini + 2.20).toFixed(4);
};
window.render(0);
</script></body></html>`;
}

async function main() {
  fs.mkdirSync(SAIDA, { recursive: true });
  const browser = await chromium.launch();
  const total = FPS * DUR;

  for (const fk of Object.keys(FORMATOS)) {
    const { w, h } = FORMATOS[fk];
    const dir = path.join(TMP, fk);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });

    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const pg = await ctx.newPage();
    pg.on('pageerror', e => { throw e; });
    await pg.setContent(cenaHTML(w, h), { waitUntil: 'load' });
    await pg.waitForTimeout(350);

    const fit = await pg.evaluate(() => {
      const o = {};
      document.querySelectorAll('.layer').forEach(L => {
        const box = L.querySelector('.box'), cs = getComputedStyle(L);
        o[L.id] = +(Math.min(1,
          (L.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) / box.offsetWidth,
          (L.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / box.offsetHeight
        )).toFixed(3);
      });
      return o;
    });
    console.log(`${fk} (${w}x${h}) ${DUR}s — ajuste por tela:`, fit);

    for (let i = 0; i < total; i++) {
      await pg.evaluate(t => window.render(t), i / FPS);
      await pg.screenshot({ path: path.join(dir, `f${String(i).padStart(4, '0')}.png`) });
    }
    await ctx.close();

    const mp4 = path.join(SAIDA, `led-blackfriday-${fk}.mp4`);
    execFileSync('ffmpeg', ['-y', '-framerate', String(FPS), '-i', path.join(dir, 'f%04d.png'),
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '16',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], { stdio: 'ignore' });
    fs.rmSync(dir, { recursive: true, force: true });
    console.log('vídeo ->', path.basename(mp4), (fs.statSync(mp4).size / 1048576).toFixed(2) + ' MB');
  }

  await browser.close();
  console.log('\nPronto. Arquivos em marketing/saida/');
}
main().catch(e => { console.error(e); process.exit(1); });
