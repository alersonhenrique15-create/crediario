/* ============================================================
   Gerador de artes e vídeos da Tecno Cell
   Rode com:  node marketing/gerar.js
   Saída:     marketing/saida/
   ============================================================ */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

/* ===================== EDITE AQUI ===================== */

const LOJA = {
  fone:   "(37) 99148-6624",
  cidade: "LUZ · MG",
  cta:    "LINK NA BIO"        // ou "CHAMA NO WHATS"
};

/* Preço do aparelho em destaque. TROQUE pelo seu preço real antes de postar. */
const OFERTA = {
  modelo:   "iPhone 17",
  claim:    "O MELHOR PREÇO DO BRASIL",   // troque p/ "O MELHOR PREÇO DA REGIÃO" se preferir
  parcelas: 12,
  valor:    699.90                         // valor de CADA parcela
};

const FPS = 30;
const DUR = 10;      // segundos (máximo 10, como pedido)

/* ===================== FIM DA EDIÇÃO ===================== */

const SAIDA = path.join(__dirname, 'saida');
const TMP = process.env.TMPDIR_FRAMES || '/tmp/claude-0/-home-user-crediario/1c85eb7c-7399-5dda-9949-ce2eca2e8105/scratchpad/frames';

/* logos oficiais da loja, em marketing/logo/ */
function pegarLogo(arquivo) {
  const f = path.join(__dirname, 'logo', arquivo);
  if (!fs.existsSync(f)) throw new Error('Logo não encontrada: ' + f);
  return 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
}
const LOGO_COMPLETA = pegarLogo('tecnocell-completa.png');  /* marca + TECNO CELL + Celulares */
const LOGO_MARCA    = pegarLogo('tecnocell-marca.png');     /* só o monograma TC */

const brl = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ---------- variantes ---------- */
const VARIANTES = {
  iphone: {
    nome: 'iphone17',
    eyebrow: 'CHEGOU NA TECNO CELL',
    titulo: OFERTA.modelo,
    claim: OFERTA.claim,
    precoTopo: `${OFERTA.parcelas}x de`,
    precoBig: `<span class="cifra">R$</span>${brl(OFERTA.valor)}`,
    precoSub: 'no boleto, sem cartão',
    selos: ['SEM CARTÃO', 'SEM BANCO', 'NO BOLETO'],
    fecho: 'CREDIÁRIO PRÓPRIO DA LOJA',
    fecho2: 'Resposta no mesmo dia'
  },
  crediario: {
    nome: 'crediario',
    eyebrow: 'BLACK FRIDAY TECNO CELL',
    titulo: 'CELULAR NOVO',
    claim: 'SAINDO NO BOLETO',
    precoTopo: 'até',
    precoBig: '24x',
    precoSub: 'sem cartão de crédito',
    selos: ['SEM CARTÃO', 'SEM BANCO', 'ANÁLISE NA LOJA'],
    fecho: 'QUEM APROVA É A LOJA',
    fecho2: 'Resposta no mesmo dia'
  }
};

const FORMATOS = {
  story: { w: 1080, h: 1920 },
  feed:  { w: 1080, h: 1350 }
};

/* ============================================================
   HTML da cena animada
   ============================================================ */
function cenaHTML(v, W, H) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000}
#stage{
  position:relative;width:${W}px;height:${H}px;background:
    radial-gradient(130% 85% at 50% 8%, rgba(120,132,140,.20), rgba(0,0,0,0) 62%),
    repeating-linear-gradient(101deg, rgba(255,255,255,.020) 0 2px, rgba(255,255,255,0) 2px 7px),
    #000;
  font-family:"Inter Display","Inter",sans-serif;color:#fff;overflow:hidden;
  --u:${W / 100}px;
}
.layer{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:0 calc(var(--u)*9);text-align:center;will-change:transform,opacity}
.metal{
  background:linear-gradient(101deg,#5E666B 0%,#FFFFFF 38%,#F2F6F8 50%,#8B9398 68%,#4C5458 100%);
  background-size:280% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;
}
.eyebrow{font-size:calc(var(--u)*3.0);font-weight:700;letter-spacing:.34em;color:#9AA2A8;text-transform:uppercase}
.bf1,.bf2{font-weight:900;line-height:.86;letter-spacing:-.035em;font-size:calc(var(--u)*22)}
.gold{color:#F2C14E}
.titulo{font-weight:900;font-size:calc(var(--u)*15);line-height:.92;letter-spacing:-.04em}
.claim{font-weight:800;font-size:calc(var(--u)*5.0);letter-spacing:.04em;text-transform:uppercase;line-height:1.15}
.precoTopo{font-weight:700;font-size:calc(var(--u)*4.6);color:#AEB5BA;letter-spacing:.02em}
.precoBig{font-family:"JetBrains Mono",monospace;font-weight:800;font-size:calc(var(--u)*14);letter-spacing:-.05em;line-height:1;white-space:nowrap}
.cifra{font-size:.5em;margin-right:.14em;vertical-align:.14em;letter-spacing:0}
.precoSub{font-weight:600;font-size:calc(var(--u)*4.0);color:#AEB5BA;margin-top:calc(var(--u)*1.4)}
.selos{display:flex;gap:calc(var(--u)*1.6);flex-wrap:wrap;justify-content:center;margin-top:calc(var(--u)*4.5)}
.selo{font-size:calc(var(--u)*2.6);font-weight:800;letter-spacing:.11em;padding:calc(var(--u)*1.4) calc(var(--u)*2.2);
  border:calc(var(--u)*.22) solid rgba(255,255,255,.26);border-radius:999px;color:#E7ECEF;background:rgba(255,255,255,.05)}
.fecho{font-weight:900;font-size:calc(var(--u)*7.4);letter-spacing:-.02em;line-height:1.05}
.fecho2{font-weight:600;font-size:calc(var(--u)*4.2);color:#A9B0B5;margin-top:calc(var(--u)*2.2)}
#glow{position:absolute;left:50%;top:50%;width:calc(var(--u)*120);height:calc(var(--u)*120);transform:translate(-50%,-50%) scale(0);
  background:radial-gradient(circle,rgba(190,205,215,.30) 0%,rgba(190,205,215,.09) 32%,rgba(0,0,0,0) 62%);border-radius:50%}
#logoFinal{width:calc(var(--u)*66);height:auto;display:block}
.contato{font-family:"JetBrains Mono",monospace;font-weight:600;font-size:calc(var(--u)*4.0);color:#C2C9CE;margin-top:calc(var(--u)*4.5);letter-spacing:.02em}
.cta{font-weight:800;font-size:calc(var(--u)*3.2);letter-spacing:.2em;color:#0A0C0D;background:#25D366;
  padding:calc(var(--u)*1.7) calc(var(--u)*3.4);border-radius:999px;margin-top:calc(var(--u)*3.4)}
#legal{position:absolute;left:0;right:0;bottom:calc(var(--u)*4);font-family:"Inter",sans-serif;
  font-size:calc(var(--u)*2.1);color:#6E767C;letter-spacing:.04em;text-align:center}
#sweep{position:absolute;top:0;bottom:0;width:calc(var(--u)*55);
  background:linear-gradient(100deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.09) 45%,rgba(255,255,255,0) 100%);
  transform:translateX(-120%)}
</style></head><body>
<div id="stage">
  <div id="sweep"></div>

  <div class="layer" id="L1">
    <div class="bf1 metal" id="bf1">BLACK</div>
    <div class="bf2 metal" id="bf2">FRIDAY</div>
    <div class="eyebrow" id="bf3" style="margin-top:calc(var(--u)*4.5)">TECNO CELL · ${LOJA.cidade}</div>
  </div>

  <div class="layer" id="L2">
    <div class="eyebrow" id="l2a">${v.eyebrow}</div>
    <div class="titulo metal" id="l2b" style="margin-top:calc(var(--u)*3.0)">${v.titulo}</div>
    <div id="l2r" style="height:calc(var(--u)*.8);width:0;border-radius:999px;background:linear-gradient(90deg,rgba(242,193,78,0),#FFD36E 35%,#F2C14E 65%,rgba(242,193,78,0));box-shadow:0 0 calc(var(--u)*2.5) rgba(242,193,78,.5);margin:calc(var(--u)*3.6) 0"></div>
    <div class="claim gold" id="l2c">${v.claim}</div>
  </div>

  <div class="layer" id="L3">
    <div class="precoTopo" id="l3a">${v.precoTopo}</div>
    <div class="precoBig metal" id="l3b">${v.precoBig}</div>
    <div class="precoSub" id="l3c">${v.precoSub}</div>
    <div class="selos" id="l3d">${v.selos.map(s => `<span class="selo">${s}</span>`).join('')}</div>
  </div>

  <div class="layer" id="L4">
    <div class="fecho metal" id="l4a">${v.fecho}</div>
    <div class="fecho2" id="l4b">${v.fecho2}</div>
  </div>

  <div class="layer" id="L5">
    <div id="glow"></div>
    <img id="logoFinal" src="${LOGO_COMPLETA}" alt="Tecno Cell">
    <div class="contato" id="l5b">${LOJA.fone}</div>
    <div class="cta" id="l5c">${LOJA.cta}</div>
  </div>

  <div id="legal">Sujeito a análise de crédito</div>
</div>

<script>
const $ = s => document.querySelector(s);
const cl = (x,a,b) => Math.max(a, Math.min(b, x));
/* mapeia o tempo global pra 0..1 dentro de um trecho */
const seg = (t,a,b) => cl((t-a)/(b-a), 0, 1);
const outCubic = p => 1 - Math.pow(1-p, 3);
const outBack  = p => { const c=1.70158+1; return 1 + (c+1)*Math.pow(p-1,3) + c*Math.pow(p-1,2); };
const inCubic  = p => p*p*p;
const U = parseFloat(getComputedStyle($('#stage')).getPropertyValue('--u'));

/* entra (snap) e sai (sobe e some) */
function bloco(el, t, tIn, tOut, opt){
  opt = opt || {};
  const i = seg(t, tIn, tIn + (opt.dIn || .42));
  const o = seg(t, tOut, tOut + (opt.dOut || .30));
  const ei = outBack(i);
  const vis = i > 0 && o < 1;
  el.style.opacity = vis ? (i * (1-o)).toFixed(4) : 0;
  const sc = (0.80 + 0.20*ei) * (1 - 0.10*o);
  const dy = (1-ei) * (opt.up || 26) * U - o * 24 * U;
  el.style.transform = 'translateY(' + dy.toFixed(2) + 'px) scale(' + sc.toFixed(4) + ')';
  el.style.filter = i < 1 ? 'blur(' + ((1-i)*14).toFixed(2) + 'px)' : 'none';
  return vis;
}

window.render = function(t){
  /* fundo: sheen atravessando de tempos em tempos */
  const sw = ((t * 0.42) % 1);
  $('#sweep').style.transform = 'translateX(' + (-120 + sw * 340) + '%)';

  /* ---- 1. BLACK FRIDAY (0 -> 2.5) ---- */
  const L1 = $('#L1');
  const vis1 = bloco(L1, t, 0.00, 2.15, { dIn:.50, up:18 });
  if (vis1) {
    /* brilho metálico varrendo as letras */
    const p = seg(t, .25, 2.0);
    const bp = (190 - p * 165) + '%';
    $('#bf1').style.backgroundPositionX = bp;
    $('#bf2').style.backgroundPositionX = (parseFloat(bp) + 14) + '%';
    /* FRIDAY entra logo depois de BLACK */
    const d = seg(t, .16, .62);
    $('#bf2').style.transform = 'translateY(' + ((1-outBack(d)) * 9 * U).toFixed(2) + 'px)';
    $('#bf2').style.opacity = d.toFixed(3);
    const e = seg(t, .70, 1.15);
    $('#bf3').style.opacity = (e * (1 - seg(t,2.0,2.3))).toFixed(3);
    $('#bf3').style.letterSpacing = (0.52 - 0.18*outCubic(e)) + 'em';
  }

  /* ---- 2. modelo + claim (2.35 -> 4.75) ---- */
  const L2 = $('#L2');
  const vis2 = bloco(L2, t, 2.35, 4.50, { dIn:.46, up:22 });
  if (vis2) {
    $('#l2a').style.opacity = seg(t, 2.40, 2.75).toFixed(3);
    const g = outCubic(seg(t, 2.60, 3.30));
    $('#l2b').style.backgroundPositionX = (200 - g * 170) + '%';
    $('#l2r').style.width = (outCubic(seg(t, 2.95, 3.55)) * 46 * U).toFixed(1) + 'px';
    const c = seg(t, 3.15, 3.60);
    $('#l2c').style.opacity = c.toFixed(3);
    $('#l2c').style.transform = 'translateY(' + ((1-outCubic(c)) * 5 * U).toFixed(2) + 'px)';
  }

  /* ---- 3. preço (4.70 -> 7.25) ---- */
  const L3 = $('#L3');
  const vis3 = bloco(L3, t, 4.70, 7.00, { dIn:.44, up:22 });
  if (vis3) {
    $('#l3a').style.opacity = seg(t, 4.75, 5.05).toFixed(3);
    const g = outCubic(seg(t, 4.95, 5.75));
    $('#l3b').style.backgroundPositionX = (200 - g * 170) + '%';
    $('#l3c').style.opacity = seg(t, 5.45, 5.80).toFixed(3);
    /* selos entram em sequência */
    const selos = $('#l3d').children;
    for (let k = 0; k < selos.length; k++) {
      const s = seg(t, 5.70 + k * 0.13, 6.05 + k * 0.13);
      selos[k].style.opacity = s.toFixed(3);
      selos[k].style.transform = 'scale(' + (0.76 + 0.24 * outBack(s)).toFixed(3) + ')';
    }
  }

  /* ---- 4. fecho (7.20 -> 8.45) ---- */
  const L4 = $('#L4');
  const vis4 = bloco(L4, t, 7.20, 8.20, { dIn:.40, up:18, dOut:.26 });
  if (vis4) {
    const g = outCubic(seg(t, 7.35, 8.05));
    $('#l4a').style.backgroundPositionX = (200 - g * 170) + '%';
    $('#l4b').style.opacity = seg(t, 7.60, 7.95).toFixed(3);
  }

  /* ---- 5. LOGO CRESCENDO até o fim (8.40 -> 10) ---- */
  const L5 = $('#L5');
  const a = seg(t, 8.40, 9.45);        /* crescimento principal */
  const b = seg(t, 9.45, 10.0);        /* continua crescendo devagar */
  L5.style.opacity = cl(seg(t, 8.40, 8.72), 0, 1).toFixed(3);
  const escala = 0.28 + outCubic(a) * 0.80 + b * 0.10;   /* 0.28 -> 1.08 -> 1.18 */
  L5.style.transform = 'scale(' + escala.toFixed(4) + ')';
  L5.style.filter = a < 1 ? 'blur(' + ((1-a) * 10).toFixed(2) + 'px)' : 'none';
  $('#glow').style.transform = 'translate(-50%,-50%) scale(' + (outCubic(a) * 1.25 + b * 0.35).toFixed(3) + ')';
  $('#glow').style.opacity = (0.35 + 0.65 * outCubic(a)).toFixed(3);
  $('#l5b').style.opacity = seg(t, 8.95, 9.35).toFixed(3);
  $('#l5c').style.opacity = seg(t, 9.20, 9.60).toFixed(3);

  /* o aviso legal some durante o logo */
  $('#legal').style.opacity = (1 - seg(t, 8.40, 8.80)).toFixed(3);
};
window.render(0);
</script></body></html>`;
}

/* ============================================================
   HTML do post estático
   ============================================================ */
function posterHTML(v, W, H) {
  const alto = H / W > 1.5;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden}
#p{position:relative;width:${W}px;height:${H}px;--u:${W / 100}px;
  font-family:"Inter Display","Inter",sans-serif;color:#fff;
  background:
    radial-gradient(120% 70% at 50% 4%, rgba(125,138,146,.22), rgba(0,0,0,0) 60%),
    repeating-linear-gradient(101deg, rgba(255,255,255,.020) 0 2px, rgba(255,255,255,0) 2px 7px),
    #000;
  display:flex;align-items:center;justify-content:center;padding:calc(var(--u)*6) calc(var(--u)*7)}
#inner{display:flex;flex-direction:column;align-items:center;text-align:center;width:100%}
.metal{background:linear-gradient(101deg,#5E666B 0%,#FFFFFF 36%,#F2F6F8 48%,#8B9398 66%,#4C5458 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.topo{display:flex;align-items:center;gap:calc(var(--u)*2.4);margin-bottom:calc(var(--u)*${alto ? 9 : 6})}
.topo .lg{width:calc(var(--u)*11);height:calc(var(--u)*11);border-radius:calc(var(--u)*3);flex:0 0 auto;
  background:radial-gradient(125% 145% at 20% -12%,rgba(255,255,255,.22),rgba(255,255,255,0) 58%),linear-gradient(168deg,#242B2F,#0A0D0F);
  border:calc(var(--u)*.2) solid rgba(255,255,255,.18);display:grid;place-items:center;padding:calc(var(--u)*1.5)}
.topo .lg img{width:100%;display:block}
.topo b{font-size:calc(var(--u)*3.4);font-weight:900;letter-spacing:.16em;display:block;line-height:1.1;text-align:left}
.topo small{font-size:calc(var(--u)*2.3);font-weight:700;letter-spacing:.2em;color:#8C9499;display:block;text-align:left}
.bf{font-weight:900;font-size:calc(var(--u)*16);line-height:.84;letter-spacing:-.04em}
.linha{height:calc(var(--u)*.7);width:calc(var(--u)*34);border-radius:999px;margin:calc(var(--u)*4) 0;
  box-shadow:0 0 calc(var(--u)*2.5) rgba(242,193,78,.5);
  background:linear-gradient(90deg,rgba(242,193,78,0),#FFD36E 35%,#F2C14E 65%,rgba(242,193,78,0))}
.modelo{font-weight:900;font-size:calc(var(--u)*12);letter-spacing:-.04em;line-height:.95}
.claim{font-weight:800;font-size:calc(var(--u)*4.3);letter-spacing:.05em;color:#F2C14E;
  text-transform:uppercase;margin-top:calc(var(--u)*2.4);line-height:1.2}
.caixa{margin-top:calc(var(--u)*5);padding:calc(var(--u)*4.4) calc(var(--u)*6);
  border:calc(var(--u)*.22) solid rgba(255,255,255,.17);border-radius:calc(var(--u)*4.5);
  background:linear-gradient(168deg,rgba(255,255,255,.07),rgba(255,255,255,.02));width:100%}
.caixa .t{font-size:calc(var(--u)*3.6);font-weight:700;color:#AEB5BA;letter-spacing:.02em}
.caixa .v{font-family:"JetBrains Mono",monospace;font-weight:800;white-space:nowrap;
  font-size:calc(var(--u)*11.5);letter-spacing:-.05em;line-height:1.02;margin-top:calc(var(--u)*.8)}
.caixa .v .cifra{font-size:.5em;margin-right:.14em;vertical-align:.14em;letter-spacing:0}
.caixa .s{font-size:calc(var(--u)*3.4);font-weight:600;color:#AEB5BA;margin-top:calc(var(--u)*1.4)}
.selos{display:flex;gap:calc(var(--u)*1.5);justify-content:center;flex-wrap:wrap;margin-top:calc(var(--u)*4)}
.selo{font-size:calc(var(--u)*2.6);font-weight:800;letter-spacing:.11em;padding:calc(var(--u)*1.3) calc(var(--u)*2.2);
  border:calc(var(--u)*.2) solid rgba(255,255,255,.24);border-radius:999px;color:#E7ECEF;background:rgba(255,255,255,.05)}
.pe{margin-top:calc(var(--u)*${alto ? 9 : 6})}
.cta{display:inline-block;font-weight:800;font-size:calc(var(--u)*3.0);letter-spacing:.18em;color:#0A0C0D;
  background:#25D366;padding:calc(var(--u)*1.8) calc(var(--u)*4);border-radius:999px}
.fone{font-family:"JetBrains Mono",monospace;font-weight:600;font-size:calc(var(--u)*3.8);
  color:#D3D9DD;margin-top:calc(var(--u)*2.2);letter-spacing:.02em}
.legal{font-family:"Inter",sans-serif;font-size:calc(var(--u)*2.0);color:#6E767C;margin-top:calc(var(--u)*2.0);letter-spacing:.03em}
</style></head><body>
<div id="p">
 <div id="inner">
  <div class="topo">
    <div class="lg"><img src="${LOGO_MARCA}" alt=""></div>
    <div><b>TECNO CELL</b><small>${LOJA.cidade}</small></div>
  </div>

  <div class="bf metal">BLACK<br>FRIDAY</div>
  <div class="linha"></div>
  <div class="modelo metal">${v.titulo}</div>
  <div class="claim">${v.claim}</div>

  <div class="caixa">
    <div class="t">${v.precoTopo}</div>
    <div class="v metal">${v.precoBig}</div>
    <div class="s">${v.precoSub}</div>
  </div>

  <div class="selos">${v.selos.map(s => `<span class="selo">${s}</span>`).join('')}</div>

  <div class="pe">
    <div class="cta">${LOJA.cta}</div>
    <div class="fone">${LOJA.fone}</div>
    <div class="legal">Crediário próprio · sujeito a análise de crédito</div>
  </div>
 </div>
</div>
<script>
/* auto-ajuste: encolhe a unidade base até o conteúdo caber na arte */
(function(){
  var p = document.getElementById('p'), inner = document.getElementById('inner');
  var base = ${W / 100}, k = 1;
  function disponivel(){
    var cs = getComputedStyle(p);
    return p.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  }
  while (inner.offsetHeight > disponivel() && k > 0.55) {
    k -= 0.015;
    p.style.setProperty('--u', (base * k) + 'px');
  }
  document.documentElement.dataset.fit = k.toFixed(3);
})();
</script>
</body></html>`;
}

/* ============================================================ */
async function main() {
  fs.mkdirSync(SAIDA, { recursive: true });
  const browser = await chromium.launch();
  const total = FPS * DUR;

  for (const chave of Object.keys(VARIANTES)) {
    const v = VARIANTES[chave];

    for (const fk of Object.keys(FORMATOS)) {
      const { w, h } = FORMATOS[fk];

      /* ---------- post estático ---------- */
      const ctxP = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
      const pgP = await ctxP.newPage();
      await pgP.setContent(posterHTML(v, w, h), { waitUntil: 'load' });
      await pgP.waitForTimeout(250);
      const png = path.join(SAIDA, `bf-${v.nome}-${fk}.png`);
      await pgP.screenshot({ path: png });
      await ctxP.close();
      console.log('imagem  ->', path.basename(png));

      /* ---------- vídeo ---------- */
      const dir = path.join(TMP, `${v.nome}-${fk}`);
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });

      const ctxV = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
      const pgV = await ctxV.newPage();
      pgV.on('pageerror', e => { throw e; });
      await pgV.setContent(cenaHTML(v, w, h), { waitUntil: 'load' });
      await pgV.waitForTimeout(300);

      for (let i = 0; i < total; i++) {
        await pgV.evaluate(t => window.render(t), i / FPS);
        await pgV.screenshot({ path: path.join(dir, `f${String(i).padStart(4, '0')}.png`) });
      }
      await ctxV.close();

      const mp4 = path.join(SAIDA, `bf-${v.nome}-${fk}.mp4`);
      execFileSync('ffmpeg', [
        '-y', '-framerate', String(FPS), '-i', path.join(dir, 'f%04d.png'),
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
        '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4
      ], { stdio: 'ignore' });
      fs.rmSync(dir, { recursive: true, force: true });
      console.log('vídeo   ->', path.basename(mp4), (fs.statSync(mp4).size / 1048576).toFixed(2) + ' MB');
    }
  }

  await browser.close();
  console.log('\nPronto. Arquivos em marketing/saida/');
}
main().catch(e => { console.error(e); process.exit(1); });
